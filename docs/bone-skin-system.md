# Bone, Skin, and Weight Painting System

The Three-Edit library includes a comprehensive bone, skin, and weight painting system for skeletal animation. This system provides tools for creating skeletal hierarchies, managing vertex weights, and animating skinned meshes.

## Overview

The bone and skin system consists of several key components:

- **Bone**: Individual bone with transformation matrices and hierarchy support
- **Skeleton**: Manages bone hierarchies and provides skeletal operations
- **Skin**: Handles vertex weights and bone influences
- **WeightPainting**: Tools for painting and manipulating vertex weights
- **SkeletalAnimation**: Animation system with keyframes and interpolation

## Core Classes

### Bone

The `Bone` class represents a single bone in a skeletal hierarchy.

```typescript
import { Bone } from 'three-edit';

// Create a bone
const bone = new Bone('ArmBone');

// Set bone properties
bone.setPosition(1, 0, 0);
bone.setRotation(0, 0, 0.707, 0.707); // 90-degree rotation around Z
bone.setScale(1, 1, 1);

// Add child bones
const childBone = new Bone('ForearmBone');
bone.addChild(childBone);

// Update matrices
bone.updateMatrices();
```

#### Properties

- `name`: Bone identifier
- `parent`: Parent bone (null for root)
- `children`: Array of child bones
- `position`: Local position (Vector3)
- `rotation`: Local rotation (Quaternion)
- `scale`: Local scale (Vector3)
- `length`: Bone length for visualization
- `radius`: Bone radius for visualization
- `localMatrix`: Local transformation matrix
- `worldMatrix`: World transformation matrix
- `inverseBindMatrix`: Inverse bind matrix for skinning

#### Methods

- `setPosition(x, y, z)`: Set bone position
- `setRotation(x, y, z, w)`: Set bone rotation
- `setScale(x, y, z)`: Set bone scale
- `updateMatrices()`: Update transformation matrices
- `getWorldPosition()`: Get world position
- `getWorldRotation()`: Get world rotation
- `addChild(bone)`: Add child bone
- `removeChild(bone)`: Remove child bone
- `findBone(name)`: Find bone in hierarchy
- `getAllBones()`: Get all bones in hierarchy
- `clone()`: Clone bone hierarchy

### Skeleton

The `Skeleton` class manages bone hierarchies and provides skeletal operations.

```typescript
import { Skeleton } from 'three-edit';

// Create skeleton
const skeleton = new Skeleton('Humanoid');

// Set root bone
const rootBone = new Bone('Pelvis');
skeleton.setRootBone(rootBone);

// Add bones to hierarchy
const spineBone = new Bone('Spine');
skeleton.addBone(spineBone, 'Pelvis');

// Calculate bind matrices
skeleton.calculateBindMatrices();

// Reset to bind pose
skeleton.resetToBindPose();
```

#### Pre-built Skeletons

The library includes pre-built skeleton templates:

```typescript
// Create humanoid skeleton
const humanoid = Skeleton.createHumanoidSkeleton();

// Create quadruped skeleton
const quadruped = Skeleton.createQuadrupedSkeleton();
```

#### Methods

- `setRootBone(bone)`: Set the root bone
- `addBone(bone, parentName?)`: Add bone to hierarchy
- `removeBone(boneName)`: Remove bone from hierarchy
- `findBone(name)`: Find bone by name
- `getAllBones()`: Get all bones
- `calculateBindMatrices()`: Calculate bind matrices
- `resetToBindPose()`: Reset to bind pose
- `getBoneTransforms()`: Get bone transforms for skinning
- `getInverseBindMatrices()`: Get inverse bind matrices

### Skin

The `Skin` class manages vertex weights and bone influences for skinned meshes.

```typescript
import { Skin } from 'three-edit';

// Create skin
const skin = new Skin('CharacterSkin', skeleton);

// Add vertex weights
const weights = [
  { boneIndex: 0, weight: 0.7 },
  { boneIndex: 1, weight: 0.3 }
];
skin.addVertexWeights(vertexIndex, weights);

// Apply skinning
const originalPosition = new Vector3(1, 0, 0);
const skinnedPosition = skin.applySkinning(vertexIndex, originalPosition);
```

#### Methods

- `addVertexWeights(vertexIndex, weights)`: Add weights for vertex
- `getVertexWeights(vertexIndex)`: Get weights for vertex
- `setVertexWeights(vertexIndex, weights)`: Set weights for vertex
- `removeVertexWeights(vertexIndex)`: Remove weights for vertex
- `getBoneInfluences(vertexIndex)`: Get bone influences for vertex
- `applySkinning(vertexIndex, position)`: Apply skinning to vertex
- `validate()`: Validate skin data
- `getStatistics()`: Get skin statistics
- `clone()`: Clone skin

## Weight Painting

The weight painting system provides tools for painting and manipulating vertex weights.

### WeightPaintingBrush

```typescript
import { WeightPaintingBrush } from 'three-edit';

// Create brush
const brush = new WeightPaintingBrush({
  radius: 2.0,
  falloff: 0.5,
  strength: 1.0,
  mode: 'add',
  boneIndex: 0
});

// Paint weights
brush.paintWeights(mesh, skin, position, options);
```

#### Brush Options

- `radius`: Brush radius
- `falloff`: Falloff factor (0-1)
- `strength`: Painting strength (0-1)
- `mode`: Painting mode ('add', 'subtract', 'replace', 'smooth')
- `boneIndex`: Target bone index
- `maxInfluences`: Maximum bone influences per vertex

### WeightPaintingOperations

```typescript
import { WeightPaintingOperations } from 'three-edit';

// Paint weights
WeightPaintingOperations.paintWeights(mesh, skin, position, options);

// Auto-weight vertices
WeightPaintingOperations.autoWeight(mesh, skin, {
  maxDistance: 2.0,
  maxInfluences: 4,
  falloff: 0.5
});

// Mirror weights
WeightPaintingOperations.mirrorWeights(mesh, skin, 'x', 0);

// Smooth weights
WeightPaintingOperations.smoothWeights(mesh, skin, 1, 0.5);
```

## Skeletal Animation

The skeletal animation system provides keyframe-based animation with interpolation.

### SkeletalAnimation

```typescript
import { SkeletalAnimation } from 'three-edit';

// Create animation system
const animation = new SkeletalAnimation();

// Add animation clip
const clip = {
  name: 'Walk',
  duration: 1.0,
  loop: true,
  tracks: [
    {
      boneName: 'LeftThigh',
      keyframes: [
        { time: 0, rotation: new Quaternion(0.3, 0, 0, 0.954) },
        { time: 0.5, rotation: new Quaternion(-0.3, 0, 0, 0.954) },
        { time: 1.0, rotation: new Quaternion(0.3, 0, 0, 0.954) }
      ]
    }
  ]
};

animation.addClip(clip);

// Play animation
animation.playClip('Walk', {
  loop: true,
  speed: 1.0,
  startTime: 0
});

// Update animation
animation.update(deltaTime, skeleton);
```

#### Pre-built Animations

```typescript
// Create idle animation
const idleClip = SkeletalAnimation.createIdleAnimation(2.0);

// Create walk animation
const walkClip = SkeletalAnimation.createWalkAnimation(1.0);

// Create run animation
const runClip = SkeletalAnimation.createRunAnimation(0.5);
```

### SkinnedMeshOperations

```typescript
import { SkinnedMeshOperations } from 'three-edit';

// Create skinned mesh
const { mesh, skin } = SkinnedMeshOperations.createSkinnedMesh(
  editableMesh,
  skeleton,
  true // auto-weight
);

// Apply skinning
SkinnedMeshOperations.applySkinning(mesh, skin);

// Reset to bind pose
SkinnedMeshOperations.resetToBindPose(mesh, skin);
```

## Complete Example

Here's a complete example of creating a skinned character:

```typescript
import { 
  EditableMesh, 
  Skeleton, 
  Skin, 
  WeightPaintingOperations,
  SkeletalAnimation,
  SkinnedMeshOperations 
} from 'three-edit';

// 1. Create mesh and skeleton
const mesh = new EditableMesh();
const skeleton = Skeleton.createHumanoidSkeleton();

// 2. Create skin
const skin = new Skin('CharacterSkin', skeleton);

// 3. Auto-weight vertices
WeightPaintingOperations.autoWeight(mesh, skin, {
  maxDistance: 2.0,
  maxInfluences: 4
});

// 4. Create skinned mesh
const { mesh: skinnedMesh, skin: finalSkin } = SkinnedMeshOperations.createSkinnedMesh(
  mesh,
  skeleton,
  false // don't auto-weight again
);

// 5. Set up animation
const animation = new SkeletalAnimation();
const walkClip = SkeletalAnimation.createWalkAnimation(1.0);
animation.addClip(walkClip);

// 6. Animate
function animate() {
  animation.update(0.016, skeleton); // 60 FPS
  SkinnedMeshOperations.applySkinning(skinnedMesh, finalSkin);
  
  requestAnimationFrame(animate);
}

animation.playClip('Walk');
animate();
```

## Best Practices

### Weight Painting

1. **Start with auto-weighting**: Use `WeightPaintingOperations.autoWeight()` as a starting point
2. **Use appropriate brush settings**: Adjust radius, falloff, and strength for your needs
3. **Limit influences**: Keep maximum influences per vertex reasonable (2-4)
4. **Mirror weights**: Use `mirrorWeights()` for symmetrical characters
5. **Smooth weights**: Use `smoothWeights()` to reduce artifacts

### Animation

1. **Use keyframes sparingly**: Create key poses and let interpolation handle the rest
2. **Test bind pose**: Always test animations from the bind pose
3. **Optimize bone count**: Use only as many bones as necessary
4. **Use proper bone hierarchy**: Ensure logical parent-child relationships

### Performance

1. **Limit bone influences**: Keep maximum influences per vertex low
2. **Use LOD**: Implement level-of-detail for distant characters
3. **Batch updates**: Update multiple meshes together when possible
4. **Cache transforms**: Cache bone transforms when possible

## Troubleshooting

### Common Issues

1. **Weights not summing to 1.0**: Use `skin.validate()` to check weight normalization
2. **Animation artifacts**: Check bone hierarchy and keyframe interpolation
3. **Performance issues**: Reduce bone count or influence limits
4. **Skinning errors**: Verify bone indices and matrix calculations

### Debugging Tools

```typescript
// Validate skin data
const validation = skin.validate();
if (!validation.isValid) {
  console.error('Skin validation errors:', validation.errors);
}

// Get skin statistics
const stats = skin.getStatistics();
console.log('Skin stats:', stats);

// Check bone hierarchy
const allBones = skeleton.getAllBones();
console.log('Bone count:', allBones.length);
```

## API Reference

For detailed API documentation, see the individual class documentation:

- [Bone API](../api-reference.md#bone)
- [Skeleton API](../api-reference.md#skeleton)
- [Skin API](../api-reference.md#skin)
- [WeightPainting API](../api-reference.md#weightpainting)
- [SkeletalAnimation API](../api-reference.md#skeletalanimation) 