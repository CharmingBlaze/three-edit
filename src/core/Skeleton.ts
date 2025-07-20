import { Bone } from './Bone';
import { Matrix4, Vector3, Quaternion } from '../utils/math';

/**
 * Skeleton structure for managing bone hierarchies
 */
export class Skeleton {
  public name: string;
  public rootBone: Bone | null;
  public bones: Bone[];
  public bindMatrix: Matrix4;
  public bindMatrixInverse: Matrix4;

  constructor(name: string) {
    this.name = name;
    this.rootBone = null;
    this.bones = [];
    this.bindMatrix = new Matrix4();
    this.bindMatrixInverse = new Matrix4();
  }

  /**
   * Set the root bone of the skeleton
   */
  setRootBone(bone: Bone): void {
    this.rootBone = bone;
    this.updateBoneList();
  }

  /**
   * Add a bone to the skeleton
   */
  addBone(bone: Bone, parentName?: string): void {
    if (parentName) {
      const parent = this.findBone(parentName);
      if (parent) {
        parent.addChild(bone);
      } else {
        throw new Error(`Parent bone '${parentName}' not found`);
      }
    } else {
      if (!this.rootBone) {
        this.rootBone = bone;
      } else {
        this.rootBone.addChild(bone);
      }
    }
    
    this.updateBoneList();
  }

  /**
   * Remove a bone from the skeleton
   */
  removeBone(boneName: string): void {
    const bone = this.findBone(boneName);
    if (bone) {
      if (bone.parent) {
        bone.parent.removeChild(bone);
      } else if (bone === this.rootBone) {
        this.rootBone = null;
      }
      this.updateBoneList();
    }
  }

  /**
   * Find a bone by name
   */
  findBone(name: string): Bone | null {
    if (!this.rootBone) {
      return null;
    }
    return this.rootBone.findBone(name);
  }

  /**
   * Get all bones in the skeleton
   */
  getAllBones(): Bone[] {
    if (!this.rootBone) {
      return [];
    }
    return this.rootBone.getAllBones();
  }

  /**
   * Update the bone list
   */
  updateBoneList(): void {
    this.bones = this.getAllBones();
  }

  /**
   * Calculate bind matrices for all bones
   */
  calculateBindMatrices(): void {
    if (!this.rootBone) {
      return;
    }

    // Update all bone matrices
    this.rootBone.updateMatrices();
    
    // Calculate inverse bind matrices for skinning
    for (const bone of this.bones) {
      bone.calculateInverseBindMatrix();
    }
  }

  /**
   * Set the skeleton's bind matrix
   */
  setBindMatrix(matrix: Matrix4): void {
    this.bindMatrix.copy(matrix);
    this.bindMatrixInverse.copy(matrix).invert();
  }

  /**
   * Get the bind matrix
   */
  getBindMatrix(): Matrix4 {
    return this.bindMatrix;
  }

  /**
   * Get the inverse bind matrix
   */
  getBindMatrixInverse(): Matrix4 {
    return this.bindMatrixInverse;
  }

  /**
   * Reset all bones to their bind pose
   */
  resetToBindPose(): void {
    for (const bone of this.bones) {
      bone.position.set(0, 0, 0);
      bone.rotation.set(0, 0, 0, 1);
      bone.scale.set(1, 1, 1);
      bone.updateMatrices();
    }
  }

  /**
   * Get bone transforms for skinning
   */
  getBoneTransforms(): Matrix4[] {
    return this.bones.map(bone => bone.worldMatrix);
  }

  /**
   * Get inverse bind matrices for skinning
   */
  getInverseBindMatrices(): Matrix4[] {
    return this.bones.map(bone => bone.inverseBindMatrix);
  }

  /**
   * Clone the skeleton
   */
  clone(): Skeleton {
    const cloned = new Skeleton(this.name);
    cloned.bindMatrix.copy(this.bindMatrix);
    cloned.bindMatrixInverse.copy(this.bindMatrixInverse);
    
    if (this.rootBone) {
      cloned.setRootBone(this.rootBone.clone());
    }
    
    return cloned;
  }

  /**
   * Get skeleton statistics
   */
  getStatistics(): {
    boneCount: number;
    maxDepth: number;
    averageChildren: number;
    leafCount: number;
    rootCount: number;
  } {
    if (!this.rootBone) {
      return {
        boneCount: 0,
        maxDepth: 0,
        averageChildren: 0,
        leafCount: 0,
        rootCount: 0
      };
    }

    const bones = this.getAllBones();
    const depths = bones.map(bone => bone.getDepth());
    const maxDepth = Math.max(...depths);
    const totalChildren = bones.reduce((sum, bone) => sum + bone.getChildCount(), 0);
    const averageChildren = totalChildren / bones.length;
    const leafCount = bones.filter(bone => bone.isLeaf()).length;
    const rootCount = bones.filter(bone => !bone.parent).length;

    return {
      boneCount: bones.length,
      maxDepth,
      averageChildren,
      leafCount,
      rootCount
    };
  }

  /**
   * Validate skeleton structure
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.rootBone) {
      errors.push('Skeleton has no root bone');
      return { isValid: false, errors };
    }

    const bones = this.getAllBones();
    const boneNames = new Set<string>();

    for (const bone of bones) {
      // Check for duplicate names
      if (boneNames.has(bone.name)) {
        errors.push(`Duplicate bone name: ${bone.name}`);
      }
      boneNames.add(bone.name);

      // Check for circular references
      if (bone.isDescendantOf(bone)) {
        errors.push(`Circular reference detected in bone: ${bone.name}`);
      }

      // Check for invalid parent references
      if (bone.parent && !bones.includes(bone.parent)) {
        errors.push(`Bone ${bone.name} has invalid parent reference`);
      }
    }

    // Check for orphaned bones
    const rootBones = bones.filter(bone => !bone.parent);
    if (rootBones.length > 1) {
      errors.push(`Multiple root bones found: ${rootBones.map(b => b.name).join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get bones by depth level
   */
  getBonesByDepth(): Bone[][] {
    if (!this.rootBone) return [];

    const bonesByDepth: Bone[][] = [];
    const maxDepth = this.getStatistics().maxDepth;

    for (let depth = 0; depth <= maxDepth; depth++) {
      const bonesAtDepth = this.getAllBones().filter(bone => bone.getDepth() === depth);
      bonesByDepth.push(bonesAtDepth);
    }

    return bonesByDepth;
  }

  /**
   * Get leaf bones (bones with no children)
   */
  getLeafBones(): Bone[] {
    return this.getAllBones().filter(bone => bone.isLeaf());
  }

  /**
   * Get bones by name pattern
   */
  getBonesByNamePattern(pattern: RegExp): Bone[] {
    return this.getAllBones().filter(bone => pattern.test(bone.name));
  }

  /**
   * Get bones by type (based on name)
   */
  getBonesByType(type: string): Bone[] {
    const typePattern = new RegExp(type, 'i');
    return this.getBonesByNamePattern(typePattern);
  }

  /**
   * Get arm bones (for humanoid skeletons)
   */
  getArmBones(): Bone[] {
    return this.getBonesByType('arm');
  }

  /**
   * Get leg bones (for humanoid skeletons)
   */
  getLegBones(): Bone[] {
    return this.getBonesByType('leg');
  }

  /**
   * Get spine bones (for humanoid skeletons)
   */
  getSpineBones(): Bone[] {
    return this.getBonesByType('spine');
  }

  /**
   * Get head bones (for humanoid skeletons)
   */
  getHeadBones(): Bone[] {
    return this.getBonesByType('head');
  }

  /**
   * Get bone chain from start to end bone
   */
  getBoneChain(startBone: Bone, endBone: Bone): Bone[] {
    if (!startBone || !endBone) return [];

    const chain: Bone[] = [];
    let current: Bone | null = endBone;

    // Walk up the hierarchy from end bone
    while (current && current !== startBone) {
      chain.unshift(current);
      current = current.parent;
    }

    // Add start bone if found
    if (current && current === startBone) {
      chain.unshift(current);
      return chain;
    }

    return [];
  }

  /**
   * Get the longest bone chain in the skeleton
   */
  getLongestChain(): Bone[] {
    if (!this.rootBone) return [];

    let longestChain: Bone[] = [];
    const leafBones = this.getLeafBones();

    for (const leaf of leafBones) {
      const chain = this.getBoneChain(this.rootBone, leaf);
      if (chain.length > longestChain.length) {
        longestChain = chain;
      }
    }

    return longestChain;
  }

  /**
   * Get bones within a certain distance of a point
   */
  getBonesNearPoint(point: Vector3, maxDistance: number): Bone[] {
    return this.getAllBones().filter(bone => {
      const bonePosition = bone.getWorldPosition();
      const distance = bonePosition.distanceTo(point);
      return distance <= maxDistance;
    });
  }

  /**
   * Get the closest bone to a point
   */
  getClosestBone(point: Vector3): Bone | null {
    const bones = this.getAllBones();
    if (bones.length === 0) return null;

    let closestBone: Bone = bones[0];
    let closestDistance = point.distanceTo(closestBone.getWorldPosition());

    for (const bone of bones) {
      const distance = point.distanceTo(bone.getWorldPosition());
      if (distance < closestDistance) {
        closestDistance = distance;
        closestBone = bone;
      }
    }

    return closestBone;
  }

  /**
   * Apply a transformation to all bones
   */
  applyTransform(transform: Matrix4): void {
    for (const bone of this.getAllBones()) {
      const worldPos = bone.getWorldPosition();
      const worldRot = bone.getWorldRotation();

      // Apply transform
      worldPos.applyMatrix4(transform);
      worldRot.multiply(new Quaternion().setFromRotationMatrix(transform));

      // Update bone
      bone.position.copy(worldPos);
      bone.rotation.copy(worldRot);
      bone.updateMatrices();
    }
  }

  /**
   * Scale the skeleton uniformly
   */
  scale(scale: number): void {
    for (const bone of this.getAllBones()) {
      bone.scale.multiplyScalar(scale);
      bone.updateMatrices();
    }
  }

  /**
   * Rotate the skeleton around a point
   */
  rotateAroundPoint(point: Vector3, rotation: Quaternion): void {
    for (const bone of this.getAllBones()) {
      const worldPos = bone.getWorldPosition();
      
      // Translate to origin
      worldPos.sub(point);
      
      // Apply rotation
      worldPos.applyQuaternion(rotation);
      
      // Translate back
      worldPos.add(point);
      
      // Update bone
      bone.position.copy(worldPos);
      bone.rotation.multiply(rotation);
      bone.updateMatrices();
    }
  }

  /**
   * Create a simple humanoid skeleton
   */
  static createHumanoidSkeleton(): Skeleton {
    const skeleton = new Skeleton('Humanoid');
    
    // Root bone (pelvis)
    const pelvis = new Bone('Pelvis');
    skeleton.setRootBone(pelvis);
    
    // Spine
    const spine1 = new Bone('Spine1');
    const spine2 = new Bone('Spine2');
    const spine3 = new Bone('Spine3');
    const neck = new Bone('Neck');
    const head = new Bone('Head');
    
    pelvis.addChild(spine1);
    spine1.addChild(spine2);
    spine2.addChild(spine3);
    spine3.addChild(neck);
    neck.addChild(head);
    
    // Left leg
    const leftThigh = new Bone('LeftThigh');
    const leftShin = new Bone('LeftShin');
    const leftFoot = new Bone('LeftFoot');
    
    pelvis.addChild(leftThigh);
    leftThigh.addChild(leftShin);
    leftShin.addChild(leftFoot);
    
    // Right leg
    const rightThigh = new Bone('RightThigh');
    const rightShin = new Bone('RightShin');
    const rightFoot = new Bone('RightFoot');
    
    pelvis.addChild(rightThigh);
    rightThigh.addChild(rightShin);
    rightShin.addChild(rightFoot);
    
    // Left arm
    const leftShoulder = new Bone('LeftShoulder');
    const leftUpperArm = new Bone('LeftUpperArm');
    const leftForeArm = new Bone('LeftForeArm');
    const leftHand = new Bone('LeftHand');
    
    spine3.addChild(leftShoulder);
    leftShoulder.addChild(leftUpperArm);
    leftUpperArm.addChild(leftForeArm);
    leftForeArm.addChild(leftHand);
    
    // Right arm
    const rightShoulder = new Bone('RightShoulder');
    const rightUpperArm = new Bone('RightUpperArm');
    const rightForeArm = new Bone('RightForeArm');
    const rightHand = new Bone('RightHand');
    
    spine3.addChild(rightShoulder);
    rightShoulder.addChild(rightUpperArm);
    rightUpperArm.addChild(rightForeArm);
    rightForeArm.addChild(rightHand);
    
    skeleton.updateBoneList();
    skeleton.calculateBindMatrices();
    return skeleton;
  }

  /**
   * Create a simple quadruped skeleton
   */
  static createQuadrupedSkeleton(): Skeleton {
    const skeleton = new Skeleton('Quadruped');
    
    // Root bone (spine)
    const spine = new Bone('Spine');
    skeleton.setRootBone(spine);
    
    // Head
    const neck = new Bone('Neck');
    const head = new Bone('Head');
    
    spine.addChild(neck);
    neck.addChild(head);
    
    // Tail
    const tail1 = new Bone('Tail1');
    const tail2 = new Bone('Tail2');
    const tail3 = new Bone('Tail3');
    
    spine.addChild(tail1);
    tail1.addChild(tail2);
    tail2.addChild(tail3);
    
    // Front legs
    const frontLeftUpper = new Bone('FrontLeftUpper');
    const frontLeftLower = new Bone('FrontLeftLower');
    const frontLeftFoot = new Bone('FrontLeftFoot');
    
    const frontRightUpper = new Bone('FrontRightUpper');
    const frontRightLower = new Bone('FrontRightLower');
    const frontRightFoot = new Bone('FrontRightFoot');
    
    spine.addChild(frontLeftUpper);
    frontLeftUpper.addChild(frontLeftLower);
    frontLeftLower.addChild(frontLeftFoot);
    
    spine.addChild(frontRightUpper);
    frontRightUpper.addChild(frontRightLower);
    frontRightLower.addChild(frontRightFoot);
    
    // Back legs
    const backLeftUpper = new Bone('BackLeftUpper');
    const backLeftLower = new Bone('BackLeftLower');
    const backLeftFoot = new Bone('BackLeftFoot');
    
    const backRightUpper = new Bone('BackRightUpper');
    const backRightLower = new Bone('BackRightLower');
    const backRightFoot = new Bone('BackRightFoot');
    
    spine.addChild(backLeftUpper);
    backLeftUpper.addChild(backLeftLower);
    backLeftLower.addChild(backLeftFoot);
    
    spine.addChild(backRightUpper);
    backRightUpper.addChild(backRightLower);
    backRightLower.addChild(backRightFoot);
    
    skeleton.updateBoneList();
    skeleton.calculateBindMatrices();
    return skeleton;
  }
} 