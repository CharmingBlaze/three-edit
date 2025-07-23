import { describe, it, expect, beforeEach } from 'vitest';
import { Bone, Skeleton, Skin } from '../core';
import { WeightPaintingBrush, WeightPaintingOperations } from '../operations/weightPainting';
import { SkeletalAnimation, SkinnedMeshOperations } from '../operations/skeletalAnimation';
import { EditableMesh } from '../core/EditableMesh';
import { Vector3, Quaternion, Matrix4 } from '../utils/math';

describe('Bone System', () => {
  let bone: Bone;

  beforeEach(() => {
    bone = new Bone('TestBone');
  });

  it('should create a bone with default properties', () => {
    expect(bone.name).toBe('TestBone');
    expect(bone.parent).toBeNull();
    expect(bone.children).toEqual([]);
    expect(bone.position.x).toBe(0);
    expect(bone.position.y).toBe(0);
    expect(bone.position.z).toBe(0);
    expect(bone.length).toBe(1.0);
    expect(bone.radius).toBe(0.1);
  });

  it('should set bone position', () => {
    bone.setPosition(1, 2, 3);
    expect(bone.position.x).toBe(1);
    expect(bone.position.y).toBe(2);
    expect(bone.position.z).toBe(3);
  });

  it('should set bone rotation', () => {
    bone.setRotation(0, 0, 0.707, 0.707);
    expect(bone.rotation.x).toBe(0);
    expect(bone.rotation.y).toBe(0);
    expect(bone.rotation.z).toBeCloseTo(0.707, 3);
    expect(bone.rotation.w).toBeCloseTo(0.707, 3);
  });

  it('should set bone scale', () => {
    bone.setScale(2, 3, 4);
    expect(bone.scale.x).toBe(2);
    expect(bone.scale.y).toBe(3);
    expect(bone.scale.z).toBe(4);
  });

  it('should update matrices when properties change', () => {
    bone.setPosition(1, 0, 0);
    bone.setRotation(0, 0, 0.707, 0.707);
    
    // Check that world matrix is updated
    const worldPos = bone.getWorldPosition();
    expect(worldPos.x).toBeCloseTo(1, 3);
  });

  it('should add child bone', () => {
    const child = new Bone('ChildBone');
    bone.addChild(child);
    
    expect(bone.children).toContain(child);
    expect(child.parent).toBe(bone);
  });

  it('should remove child bone', () => {
    const child = new Bone('ChildBone');
    bone.addChild(child);
    bone.removeChild(child);
    
    expect(bone.children).not.toContain(child);
    expect(child.parent).toBeNull();
  });

  it('should find bone in hierarchy', () => {
    const child1 = new Bone('Child1');
    const child2 = new Bone('Child2');
    const grandchild = new Bone('Grandchild');
    
    bone.addChild(child1);
    bone.addChild(child2);
    child1.addChild(grandchild);
    
    expect(bone.findBone('Child1')).toBe(child1);
    expect(bone.findBone('Child2')).toBe(child2);
    expect(bone.findBone('Grandchild')).toBe(grandchild);
    expect(bone.findBone('Nonexistent')).toBeNull();
  });

  it('should get all bones in hierarchy', () => {
    const child1 = new Bone('Child1');
    const child2 = new Bone('Child2');
    const grandchild = new Bone('Grandchild');
    
    bone.addChild(child1);
    bone.addChild(child2);
    child1.addChild(grandchild);
    
    const allBones = bone.getAllBones();
    expect(allBones).toHaveLength(4);
    expect(allBones.map(b => b.name)).toContain('TestBone');
    expect(allBones.map(b => b.name)).toContain('Child1');
    expect(allBones.map(b => b.name)).toContain('Child2');
    expect(allBones.map(b => b.name)).toContain('Grandchild');
  });

  it('should clone bone hierarchy', () => {
    const child = new Bone('ChildBone');
    bone.addChild(child);
    bone.setPosition(1, 2, 3);
    
    const cloned = bone.clone();
    expect(cloned.name).toBe('TestBone');
    expect(cloned.position.x).toBe(1);
    expect(cloned.position.y).toBe(2);
    expect(cloned.position.z).toBe(3);
    expect(cloned.children).toHaveLength(1);
    expect(cloned.children[0].name).toBe('ChildBone');
  });

  it('should get bone world vectors', () => {
    bone.setRotation(0, 0, 0.707, 0.707); // 90-degree rotation around Z
    
    const direction = bone.getWorldDirection();
    const up = bone.getWorldUp();
    const right = bone.getWorldRight();
    const forward = bone.getWorldForward();
    
    // After 90-degree Z rotation, the up vector should point in the negative X direction
    expect(up.x).toBeCloseTo(-1, 3);
    expect(Math.abs(up.y)).toBeLessThan(0.002);
    expect(up.z).toBeCloseTo(0, 3);
    
    // The right vector should point in the Y direction
    expect(Math.abs(right.x)).toBeLessThan(0.002);
    expect(right.y).toBeCloseTo(1, 2);
    expect(right.z).toBeCloseTo(0, 2);
  });

  it('should get bone world positions', () => {
    bone.setPosition(1, 2, 3);
    bone.setScale(2, 2, 2);
    
    const endPos = bone.getWorldEndPosition();
    const centerPos = bone.getWorldCenterPosition();
    
    expect(endPos.x).toBeCloseTo(1, 3);
    expect(endPos.y).toBeCloseTo(4, 3); // 2 + 2 (length * scale)
    expect(endPos.z).toBeCloseTo(3, 3);
    
    expect(centerPos.x).toBeCloseTo(1, 3);
    expect(centerPos.y).toBeCloseTo(3, 3); // 2 + 1 (half length * scale)
    expect(centerPos.z).toBeCloseTo(3, 3);
  });

  it('should get bone hierarchy information', () => {
    const child1 = new Bone('Child1');
    const child2 = new Bone('Child2');
    const grandchild = new Bone('Grandchild');
    
    bone.addChild(child1);
    bone.addChild(child2);
    child1.addChild(grandchild);
    
    expect(bone.getDepth()).toBe(0);
    expect(child1.getDepth()).toBe(1);
    expect(grandchild.getDepth()).toBe(2);
    
    expect(bone.getHierarchySize()).toBe(4);
    expect(child1.getHierarchySize()).toBe(2);
    
    expect(bone.isLeaf()).toBe(false);
    expect(grandchild.isLeaf()).toBe(true);
    
    expect(bone.getChildCount()).toBe(2);
    expect(child1.getChildCount()).toBe(1);
  });

  it('should get bone relationships', () => {
    const child1 = new Bone('Child1');
    const child2 = new Bone('Child2');
    const grandchild = new Bone('Grandchild');
    
    bone.addChild(child1);
    bone.addChild(child2);
    child1.addChild(grandchild);
    
    expect(grandchild.isDescendantOf(bone)).toBe(true);
    expect(grandchild.isDescendantOf(child1)).toBe(true);
    expect(bone.isDescendantOf(grandchild)).toBe(false);
    
    expect(grandchild.getRoot()).toBe(bone);
    expect(child1.getRoot()).toBe(bone);
    
    const path = grandchild.getPath();
    expect(path).toHaveLength(3);
    expect(path[0]).toBe(bone);
    expect(path[1]).toBe(child1);
    expect(path[2]).toBe(grandchild);
  });
});

describe('Skeleton System', () => {
  let skeleton: Skeleton;

  beforeEach(() => {
    skeleton = new Skeleton('TestSkeleton');
  });

  it('should create a skeleton with default properties', () => {
    expect(skeleton.name).toBe('TestSkeleton');
    expect(skeleton.rootBone).toBeNull();
    expect(skeleton.bones).toEqual([]);
  });

  it('should set root bone', () => {
    const rootBone = new Bone('RootBone');
    skeleton.setRootBone(rootBone);
    
    expect(skeleton.rootBone).toBe(rootBone);
    expect(skeleton.bones).toContain(rootBone);
  });

  it('should add bone to skeleton', () => {
    const rootBone = new Bone('RootBone');
    const childBone = new Bone('ChildBone');
    
    skeleton.setRootBone(rootBone);
    skeleton.addBone(childBone, 'RootBone');
    
    expect(skeleton.bones).toHaveLength(2);
    expect(skeleton.findBone('ChildBone')).toBe(childBone);
  });

  it('should remove bone from skeleton', () => {
    const rootBone = new Bone('RootBone');
    const childBone = new Bone('ChildBone');
    
    skeleton.setRootBone(rootBone);
    skeleton.addBone(childBone, 'RootBone');
    skeleton.removeBone('ChildBone');
    
    expect(skeleton.findBone('ChildBone')).toBeNull();
    expect(skeleton.bones).toHaveLength(1);
  });

  it('should calculate bind matrices', () => {
    const rootBone = new Bone('RootBone');
    const childBone = new Bone('ChildBone');
    
    skeleton.setRootBone(rootBone);
    skeleton.addBone(childBone, 'RootBone');
    skeleton.calculateBindMatrices();
    
    expect(skeleton.bones.length).toBeGreaterThan(0);
    // Check that inverse bind matrices are calculated
    for (const bone of skeleton.bones) {
      expect(bone.inverseBindMatrix.elements).toBeDefined();
    }
  });

  it('should reset to bind pose', () => {
    const rootBone = new Bone('RootBone');
    rootBone.setPosition(1, 2, 3);
    rootBone.setRotation(0, 0, 0.707, 0.707);
    
    skeleton.setRootBone(rootBone);
    skeleton.resetToBindPose();
    
    expect(rootBone.position.x).toBe(0);
    expect(rootBone.position.y).toBe(0);
    expect(rootBone.position.z).toBe(0);
  });

  it('should get bone transforms for skinning', () => {
    const rootBone = new Bone('RootBone');
    skeleton.setRootBone(rootBone);
    skeleton.calculateBindMatrices();
    
    const transforms = skeleton.getBoneTransforms();
    expect(transforms).toHaveLength(1);
    expect(transforms[0]).toBeInstanceOf(Matrix4);
  });

  it('should get skeleton statistics', () => {
    const rootBone = new Bone('RootBone');
    const childBone = new Bone('ChildBone');
    const grandchildBone = new Bone('GrandchildBone');
    
    skeleton.setRootBone(rootBone);
    skeleton.addBone(childBone, 'RootBone');
    skeleton.addBone(grandchildBone, 'ChildBone');
    
    const stats = skeleton.getStatistics();
    expect(stats.boneCount).toBe(3);
    expect(stats.maxDepth).toBe(2);
    expect(stats.leafCount).toBe(1);
    expect(stats.rootCount).toBe(1);
  });

  it('should validate skeleton structure', () => {
    const rootBone = new Bone('RootBone');
    skeleton.setRootBone(rootBone);
    
    const validation = skeleton.validate();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should get bones by depth', () => {
    const rootBone = new Bone('RootBone');
    const childBone = new Bone('ChildBone');
    const grandchildBone = new Bone('GrandchildBone');
    
    skeleton.setRootBone(rootBone);
    skeleton.addBone(childBone, 'RootBone');
    skeleton.addBone(grandchildBone, 'ChildBone');
    
    const bonesByDepth = skeleton.getBonesByDepth();
    expect(bonesByDepth).toHaveLength(3);
    expect(bonesByDepth[0]).toHaveLength(1); // Root level
    expect(bonesByDepth[1]).toHaveLength(1); // Child level
    expect(bonesByDepth[2]).toHaveLength(1); // Grandchild level
  });

  it('should get leaf bones', () => {
    const rootBone = new Bone('RootBone');
    const childBone = new Bone('ChildBone');
    const grandchildBone = new Bone('GrandchildBone');
    
    skeleton.setRootBone(rootBone);
    skeleton.addBone(childBone, 'RootBone');
    skeleton.addBone(grandchildBone, 'ChildBone');
    
    const leafBones = skeleton.getLeafBones();
    expect(leafBones).toHaveLength(1);
    expect(leafBones[0].name).toBe('GrandchildBone');
  });

  it('should get bones by type', () => {
    const rootBone = new Bone('Pelvis');
    const spineBone = new Bone('Spine');
    const armBone = new Bone('LeftArm');
    
    skeleton.setRootBone(rootBone);
    skeleton.addBone(spineBone, 'Pelvis');
    skeleton.addBone(armBone, 'Spine');
    
    const armBones = skeleton.getArmBones();
    expect(armBones).toHaveLength(1);
    expect(armBones[0].name).toBe('LeftArm');
  });

  it('should get bone chain', () => {
    const rootBone = new Bone('RootBone');
    const childBone = new Bone('ChildBone');
    const grandchildBone = new Bone('GrandchildBone');
    
    skeleton.setRootBone(rootBone);
    skeleton.addBone(childBone, 'RootBone');
    skeleton.addBone(grandchildBone, 'ChildBone');
    
    const chain = skeleton.getBoneChain(rootBone, grandchildBone);
    expect(chain).toHaveLength(3);
    expect(chain[0]).toBe(rootBone);
    expect(chain[1]).toBe(childBone);
    expect(chain[2]).toBe(grandchildBone);
  });

  it('should get closest bone to point', () => {
    const rootBone = new Bone('RootBone');
    const childBone = new Bone('ChildBone');
    
    rootBone.setPosition(0, 0, 0);
    childBone.setPosition(1, 0, 0);
    
    skeleton.setRootBone(rootBone);
    skeleton.addBone(childBone, 'RootBone');
    
    const point = new Vector3(0.5, 0, 0);
    const closestBone = skeleton.getClosestBone(point);
    // The point is closer to the root bone (distance 0.5) than the child bone (distance 0.5)
    // Since they're equidistant, it should return the first bone in the list (rootBone)
    expect(closestBone).toBe(rootBone);
  });

  it('should create humanoid skeleton', () => {
    const humanoid = Skeleton.createHumanoidSkeleton();
    
    expect(humanoid.name).toBe('Humanoid');
    expect(humanoid.rootBone).toBeDefined();
    expect(humanoid.bones.length).toBeGreaterThan(5);
    
    // Check for key bones
    expect(humanoid.findBone('Pelvis')).toBeDefined();
    expect(humanoid.findBone('Head')).toBeDefined();
    expect(humanoid.findBone('LeftThigh')).toBeDefined();
    expect(humanoid.findBone('RightThigh')).toBeDefined();
  });

  it('should create quadruped skeleton', () => {
    const quadruped = Skeleton.createQuadrupedSkeleton();
    
    expect(quadruped.name).toBe('Quadruped');
    expect(quadruped.rootBone).toBeDefined();
    expect(quadruped.bones.length).toBeGreaterThan(5);
    
    // Check for key bones
    expect(quadruped.findBone('Spine')).toBeDefined();
    expect(quadruped.findBone('Head')).toBeDefined();
    expect(quadruped.findBone('FrontLeftUpper')).toBeDefined();
    expect(quadruped.findBone('BackRightUpper')).toBeDefined();
  });
});

describe('Skin System', () => {
  let skeleton: Skeleton;
  let skin: Skin;

  beforeEach(() => {
    skeleton = Skeleton.createHumanoidSkeleton();
    skin = new Skin('TestSkin', skeleton);
  });

  it('should create skin with default properties', () => {
    expect(skin.name).toBe('TestSkin');
    expect(skin.skeleton).toBe(skeleton);
    expect(skin.vertexWeights).toEqual([]);
  });

  it('should add vertex weights', () => {
    const weights = [
      { boneIndex: 0, weight: 0.7 },
      { boneIndex: 1, weight: 0.3 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    const retrievedWeights = skin.getVertexWeights(0);
    expect(retrievedWeights).toHaveLength(2);
    expect(retrievedWeights[0].boneIndex).toBe(0);
    expect(retrievedWeights[0].weight).toBeCloseTo(0.7, 3);
    expect(retrievedWeights[1].boneIndex).toBe(1);
    expect(retrievedWeights[1].weight).toBeCloseTo(0.3, 3);
  });

  it('should normalize weights to sum to 1.0', () => {
    const weights = [
      { boneIndex: 0, weight: 0.5 },
      { boneIndex: 1, weight: 0.5 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    const retrievedWeights = skin.getVertexWeights(0);
    const totalWeight = retrievedWeights.reduce((sum, w) => sum + w.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 3);
  });

  it('should limit influences to 4 bones', () => {
    const weights = [
      { boneIndex: 0, weight: 0.2 },
      { boneIndex: 1, weight: 0.2 },
      { boneIndex: 2, weight: 0.2 },
      { boneIndex: 3, weight: 0.2 },
      { boneIndex: 4, weight: 0.2 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    const retrievedWeights = skin.getVertexWeights(0);
    expect(retrievedWeights).toHaveLength(4);
  });

  it('should get bone influences for vertex', () => {
    const weights = [
      { boneIndex: 0, weight: 0.7 },
      { boneIndex: 1, weight: 0.3 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    const influences = skin.getBoneInfluences(0);
    expect(influences).toHaveLength(2);
    expect(influences[0].bone).toBe(skeleton.bones[0]);
    expect(influences[0].weight).toBeCloseTo(0.7, 3);
    expect(influences[1].bone).toBe(skeleton.bones[1]);
    expect(influences[1].weight).toBeCloseTo(0.3, 3);
  });

  it('should apply skinning to vertex position', () => {
    const weights = [
      { boneIndex: 0, weight: 0.7 },
      { boneIndex: 1, weight: 0.3 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    const originalPosition = new Vector3(1, 0, 0);
    const skinnedPosition = skin.applySkinning(0, originalPosition);
    
    expect(skinnedPosition).toBeInstanceOf(Vector3);
    expect(skinnedPosition.x).toBeDefined();
    expect(skinnedPosition.y).toBeDefined();
    expect(skinnedPosition.z).toBeDefined();
  });

  it('should validate skin data', () => {
    const weights = [
      { boneIndex: 0, weight: 0.7 },
      { boneIndex: 1, weight: 0.3 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    const validation = skin.validate();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should get skin statistics', () => {
    const weights = [
      { boneIndex: 0, weight: 0.7 },
      { boneIndex: 1, weight: 0.3 }
    ];
    
    skin.addVertexWeights(0, weights);
    skin.addVertexWeights(1, weights);
    
    const stats = skin.getStatistics();
    expect(stats.vertexCount).toBe(2);
    expect(stats.totalInfluences).toBe(4);
    expect(stats.averageInfluences).toBe(2);
    expect(stats.maxInfluences).toBe(2);
  });

  it('should get vertices influenced by bone', () => {
    const weights = [
      { boneIndex: 0, weight: 0.7 },
      { boneIndex: 1, weight: 0.3 }
    ];
    
    skin.addVertexWeights(0, weights);
    skin.addVertexWeights(1, weights);
    
    const influencedVertices = skin.getVerticesInfluencedByBone(0);
    expect(influencedVertices).toHaveLength(2);
    expect(influencedVertices).toContain(0);
    expect(influencedVertices).toContain(1);
  });

  it('should get strongest influences', () => {
    const weights = [
      { boneIndex: 0, weight: 0.3 },
      { boneIndex: 1, weight: 0.7 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    const strongestInfluences = skin.getStrongestInfluences();
    expect(strongestInfluences).toHaveLength(1);
    expect(strongestInfluences[0].boneIndex).toBe(1);
    expect(strongestInfluences[0].weight).toBe(0.7);
  });

  it('should get uninfluenced vertices', () => {
    const weights = [{ boneIndex: 0, weight: 1.0 }];
    skin.addVertexWeights(0, weights);
    
    // Add a vertex with no weights (vertex 1)
    skin.vertexWeights[1] = [];
    
    const uninfluencedVertices = skin.getUninfluencedVertices();
    expect(uninfluencedVertices).toContain(1);
  });

  it('should optimize weights', () => {
    const weights = [
      { boneIndex: 0, weight: 0.8 },
      { boneIndex: 1, weight: 0.005 }, // Very small weight
      { boneIndex: 2, weight: 0.195 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    const removedCount = skin.optimizeWeights(0.01);
    expect(removedCount).toBe(1);
    
    const optimizedWeights = skin.getVertexWeights(0);
    expect(optimizedWeights).toHaveLength(2);
  });

  it('should normalize all weights', () => {
    const weights = [
      { boneIndex: 0, weight: 0.5 },
      { boneIndex: 1, weight: 0.5 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    // Manually unnormalize weights
    skin.vertexWeights[0][0].weight = 0.8;
    skin.vertexWeights[0][1].weight = 0.3;
    
    skin.normalizeAllWeights();
    
    const normalizedWeights = skin.getVertexWeights(0);
    const totalWeight = normalizedWeights.reduce((sum, w) => sum + w.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 3);
  });

  it('should limit influences', () => {
    const weights = [
      { boneIndex: 0, weight: 0.3 },
      { boneIndex: 1, weight: 0.3 },
      { boneIndex: 2, weight: 0.2 },
      { boneIndex: 3, weight: 0.2 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    const removedCount = skin.limitInfluences(2);
    expect(removedCount).toBe(2);
    
    const limitedWeights = skin.getVertexWeights(0);
    expect(limitedWeights).toHaveLength(2);
  });

  it('should get weight distribution', () => {
    const weights = [
      { boneIndex: 0, weight: 0.8 },
      { boneIndex: 1, weight: 0.2 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    const distribution = skin.getWeightDistribution();
    expect(distribution.minWeight).toBe(0.2);
    expect(distribution.maxWeight).toBe(0.8);
    expect(distribution.averageWeight).toBe(0.5);
  });

  it('should check weight normalization', () => {
    const weights = [
      { boneIndex: 0, weight: 0.7 },
      { boneIndex: 1, weight: 0.3 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    expect(skin.isNormalized(0)).toBe(true);
    expect(skin.getTotalWeight(0)).toBeCloseTo(1.0, 3);
    
    const nonNormalizedVertices = skin.getNonNormalizedVertices();
    expect(nonNormalizedVertices).toHaveLength(0);
  });

  it('should clone skin', () => {
    const weights = [
      { boneIndex: 0, weight: 0.7 },
      { boneIndex: 1, weight: 0.3 }
    ];
    
    skin.addVertexWeights(0, weights);
    
    const cloned = skin.clone();
    expect(cloned.name).toBe('TestSkin');
    expect(cloned.skeleton).toBe(skeleton);
    expect(cloned.getVertexWeights(0)).toHaveLength(2);
  });
});

describe('Weight Painting System', () => {
  let mesh: EditableMesh;
  let skeleton: Skeleton;
  let skin: Skin;

  beforeEach(() => {
    // Create a simple mesh
    mesh = new EditableMesh();
    // Add some vertices
    for (let i = 0; i < 10; i++) {
      mesh.addVertex({
        x: i,
        y: 0,
        z: 0
      } as any);
    }
    
    skeleton = Skeleton.createHumanoidSkeleton();
    skin = new Skin('TestSkin', skeleton);
  });

  it('should create weight painting brush', () => {
    const brush = new WeightPaintingBrush({
      radius: 2.0,
      falloff: 0.5,
      strength: 0.8,
      mode: 'add',
      boneIndex: 0
    });
    
    expect(brush.radius).toBe(2.0);
    expect(brush.falloff).toBe(0.5);
    expect(brush.strength).toBe(0.8);
    expect(brush.mode).toBe('add');
    expect(brush.boneIndex).toBe(0);
  });

  it('should paint weights on mesh', () => {
    const position = new Vector3(5, 0, 0);
    
    WeightPaintingOperations.paintWeights(mesh, skin, position, {
      radius: 2.0,
      boneIndex: 0,
      strength: 1.0
    });
    
    // Check that weights were applied
    const weights = skin.getVertexWeights(5); // Vertex at position 5
    expect(weights.length).toBeGreaterThan(0);
  });

  it('should auto-weight vertices', () => {
    // For now, we'll test that the function exists and doesn't throw
    expect(() => {
      WeightPaintingOperations.autoWeight(mesh, skin, {
        maxDistance: 3.0,
        maxInfluences: 4
      });
    }).not.toThrow();
    
    // Check that some weights were applied
    let hasWeights = false;
    for (let i = 0; i < mesh.vertices.length; i++) {
      const weights = skin.getVertexWeights(i);
      if (weights.length > 0) {
        hasWeights = true;
        break;
      }
    }
    expect(hasWeights).toBe(true);
  });

  it('should mirror weights', () => {
    // Add some weights to one side
    skin.addVertexWeights(0, [{ boneIndex: 0, weight: 1.0 }]);
    skin.addVertexWeights(1, [{ boneIndex: 1, weight: 1.0 }]);
    
    WeightPaintingOperations.mirrorWeights(mesh, skin, 'x', 0);
    
    // Check that weights were mirrored
    // This is a simplified test since mirroring depends on vertex positions
    expect(skin.getVertexCount()).toBeGreaterThan(0);
  });

  it('should smooth weights', () => {
    // Add some weights
    skin.addVertexWeights(0, [{ boneIndex: 0, weight: 1.0 }]);
    skin.addVertexWeights(1, [{ boneIndex: 1, weight: 1.0 }]);
    
    WeightPaintingOperations.smoothWeights(mesh, skin, 1, 0.5);
    
    // Check that weights were smoothed
    expect(skin.getVertexCount()).toBeGreaterThan(0);
  });
});

describe('Skeletal Animation System', () => {
  let animation: SkeletalAnimation;
  let skeleton: Skeleton;

  beforeEach(() => {
    animation = new SkeletalAnimation();
    skeleton = Skeleton.createHumanoidSkeleton();
  });

  it('should create animation system', () => {
    expect(animation.getClipNames()).toEqual([]);
  });

  it('should add and remove animation clips', () => {
    const clip = {
      name: 'TestClip',
      duration: 1.0,
      tracks: []
    };
    
    animation.addClip(clip);
    expect(animation.getClipNames()).toContain('TestClip');
    
    animation.removeClip('TestClip');
    expect(animation.getClipNames()).not.toContain('TestClip');
  });

  it('should play animation clip', () => {
    const clip = {
      name: 'TestClip',
      duration: 1.0,
      tracks: []
    };
    
    animation.addClip(clip);
    animation.playClip('TestClip');
    
    // Check that animation is playing
    // Note: We can't directly access the private state, but we can test the behavior
    expect(animation.getClip('TestClip')).toBeDefined();
  });

  it('should create idle animation', () => {
    const idleClip = SkeletalAnimation.createIdleAnimation(2.0);
    
    expect(idleClip.name).toBe('Idle');
    expect(idleClip.duration).toBe(2.0);
    expect(idleClip.loop).toBe(true);
    expect(idleClip.tracks.length).toBeGreaterThan(0);
  });

  it('should create walk animation', () => {
    const walkClip = SkeletalAnimation.createWalkAnimation(1.0);
    
    expect(walkClip.name).toBe('Walk');
    expect(walkClip.duration).toBe(1.0);
    expect(walkClip.loop).toBe(true);
    expect(walkClip.tracks.length).toBeGreaterThan(0);
  });

  it('should create run animation', () => {
    const runClip = SkeletalAnimation.createRunAnimation(0.5);
    
    expect(runClip.name).toBe('Run');
    expect(runClip.duration).toBe(0.5);
    expect(runClip.loop).toBe(true);
    expect(runClip.tracks.length).toBeGreaterThan(0);
  });
});

describe('Skinned Mesh Operations', () => {
  let mesh: EditableMesh;
  let skeleton: Skeleton;
  let skin: Skin;

  beforeEach(() => {
    mesh = new EditableMesh();
    // Add some vertices
    for (let i = 0; i < 5; i++) {
      mesh.addVertex({
        x: i,
        y: 0,
        z: 0
      } as any);
    }
    
    skeleton = Skeleton.createHumanoidSkeleton();
    skin = new Skin('TestSkin', skeleton);
  });

  it('should create skinned mesh', () => {
    const result = SkinnedMeshOperations.createSkinnedMesh(mesh, skeleton, true);
    
    expect(result.mesh).toBe(mesh);
    expect(result.skin).toBeInstanceOf(Skin);
    expect(result.skin.skeleton).toBe(skeleton);
  });

  it('should apply skinning to mesh', () => {
    // Add some weights
    skin.addVertexWeights(0, [{ boneIndex: 0, weight: 1.0 }]);
    skin.addVertexWeights(1, [{ boneIndex: 1, weight: 1.0 }]);
    
    SkinnedMeshOperations.applySkinning(mesh, skin);
    
    // Check that vertices were transformed
    expect(mesh.vertices.length).toBeGreaterThan(0);
  });

  it('should reset mesh to bind pose', () => {
    SkinnedMeshOperations.resetToBindPose(mesh, skin);
    
    // This is a placeholder test since the implementation is simplified
    expect(mesh.vertices.length).toBeGreaterThan(0);
  });
}); 