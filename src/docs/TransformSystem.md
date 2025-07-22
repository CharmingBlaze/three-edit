# Transform System Documentation

## Overview

The Transform System provides comprehensive transformation capabilities for the 3D editor. It handles position, rotation, scale, and advanced transformations with support for interactive gizmos and operations.

## Table of Contents

1. [Core Components](#core-components)
2. [Transform Management](#transform-management)
3. [Transform Operations](#transform-operations)
4. [Transform Gizmos](#transform-gizmos)
5. [Advanced Operations](#advanced-operations)
6. [Usage Examples](#usage-examples)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)
9. [Performance Considerations](#performance-considerations)

## Core Components

### TransformManager

The main transform management class that handles all transform operations.

```javascript
import { createTransformManager } from './transforms/index.js';

const transformManager = createTransformManager({
  autoUpdate: true,
  cacheMatrices: true,
  maxTransforms: 1000
});
```

### Transform

Individual transform class with position, rotation, scale, and pivot support.

```javascript
import { createTransform } from './transforms/index.js';

const transform = createTransform({
  position: { x: 1, y: 2, z: 3 },
  rotation: { x: 0, y: Math.PI / 2, z: 0 },
  scale: { x: 2, y: 2, z: 2 },
  pivot: { x: 0, y: 0, z: 0 },
  space: 'world'
});
```

### TransformOperations

Advanced transform operations for alignment, distribution, and manipulation.

```javascript
import { TransformOperations } from './transforms/TransformOperations.js';

// Align objects
const alignedObjects = TransformOperations.alignObjects(objects, target, {
  axis: 'x',
  mode: 'center'
});
```

### TransformGizmo

Interactive transform controls for visual manipulation.

```javascript
import { createTransformGizmo, GizmoTypes } from './transforms/index.js';

const gizmo = createTransformGizmo({
  type: GizmoTypes.TRANSLATE,
  size: 1.0,
  position: { x: 0, y: 0, z: 0 },
  visible: true
});
```

## Transform Management

### Creating Transforms

```javascript
// Create transform manager
const transformManager = createTransformManager({
  autoUpdate: true,
  cacheMatrices: true,
  maxTransforms: 1000
});

// Create new transform
const transform = transformManager.createTransform('transform-1', {
  position: { x: 1, y: 2, z: 3 },
  rotation: { x: 0, y: Math.PI / 2, z: 0 },
  scale: { x: 2, y: 2, z: 2 },
  pivot: { x: 0, y: 0, z: 0 },
  space: 'world'
});

console.log('Transform created:', transform.getSummary());
```

### Managing Transforms

```javascript
// Get transform by ID
const transform = transformManager.getTransform('transform-1');

// Update transform
transformManager.updateTransform('transform-1', {
  position: { x: 5, y: 5, z: 5 },
  rotation: { x: 0, y: Math.PI, z: 0 },
  scale: { x: 1, y: 1, z: 1 }
});

// Remove transform
transformManager.removeTransform('transform-1');

// Get all transforms
const allTransforms = transformManager.getAllTransforms();
```

### Transform Properties

```javascript
// Set transform properties
transform.setPosition(1, 2, 3);
transform.setRotation(0, Math.PI / 2, 0);
transform.setScale(2, 2, 2);
transform.setPivot(0, 0, 0);

// Get transform properties
const position = transform.getPosition();
const rotation = transform.getRotation();
const scale = transform.getScale();
const pivot = transform.getPivot();
```

### Transform Matrix Operations

```javascript
// Get transformation matrix
const matrix = transform.getMatrix();

// Get inverse transformation matrix
const inverseMatrix = transform.getInverseMatrix();

// Transform a point
const point = { x: 1, y: 1, z: 1 };
const transformedPoint = transform.transformPoint(point);

// Transform a vector
const vector = { x: 1, y: 0, z: 0 };
const transformedVector = transform.transformVector(vector);
```

## Transform Operations

### Aligning Objects

```javascript
import { alignObjects } from './transforms/index.js';

// Align objects to target
const alignedObjects = alignObjects(objects, target, {
  axis: 'x',
  mode: 'center'
});

// Align to minimum
const minAligned = alignObjects(objects, target, {
  axis: 'all',
  mode: 'min'
});

// Align to maximum
const maxAligned = alignObjects(objects, target, {
  axis: 'y',
  mode: 'max'
});
```

### Distributing Objects

```javascript
import { distributeObjects } from './transforms/index.js';

// Distribute objects evenly
const distributedObjects = distributeObjects(objects, {
  axis: 'x',
  spacing: 2,
  includeBounds: true
});

// Distribute in Y axis
const yDistributed = distributeObjects(objects, {
  axis: 'y',
  spacing: 1.5
});
```

### Arranging in Grid

```javascript
import { arrangeInGrid } from './transforms/index.js';

// Arrange objects in 3x3 grid
const gridObjects = arrangeInGrid(objects, {
  rows: 3,
  columns: 3,
  spacing: 2,
  axis: 'x'
});

// Arrange in 2x4 grid
const customGrid = arrangeInGrid(objects, {
  rows: 2,
  columns: 4,
  spacing: 1.5,
  axis: 'z'
});
```

### Mirroring Objects

```javascript
import { mirrorObjects } from './transforms/index.js';

// Mirror objects on X axis
const mirroredObjects = mirrorObjects(objects, {
  axis: 'x',
  center: { x: 0, y: 0, z: 0 },
  duplicate: true
});

// Mirror on Y axis with custom center
const yMirrored = mirrorObjects(objects, {
  axis: 'y',
  center: { x: 5, y: 0, z: 0 },
  duplicate: false
});
```

### Rotating Around Point

```javascript
import { rotateAroundPoint } from './transforms/index.js';

// Rotate objects around center
const rotatedObjects = rotateAroundPoint(objects, center, {
  x: Math.PI / 4,
  y: Math.PI / 2,
  z: 0
}, {
  space: 'world'
});

// Rotate in local space
const localRotated = rotateAroundPoint(objects, center, {
  x: 0,
  y: Math.PI,
  z: 0
}, {
  space: 'local'
});
```

### Scaling from Point

```javascript
import { scaleFromPoint } from './transforms/index.js';

// Scale objects from center
const scaledObjects = scaleFromPoint(objects, center, {
  x: 2,
  y: 2,
  z: 2
}, {
  uniform: false
});

// Uniform scaling
const uniformScaled = scaleFromPoint(objects, center, {
  x: 1.5,
  y: 1.5,
  z: 1.5
}, {
  uniform: true
});
```

## Transform Gizmos

### Creating Gizmos

```javascript
import { createTransformGizmo, GizmoTypes } from './transforms/index.js';

// Create translate gizmo
const translateGizmo = createTransformGizmo({
  type: GizmoTypes.TRANSLATE,
  size: 1.0,
  position: { x: 0, y: 0, z: 0 },
  visible: true
});

// Create rotate gizmo
const rotateGizmo = createTransformGizmo({
  type: GizmoTypes.ROTATE,
  size: 1.5,
  position: { x: 0, y: 0, z: 0 }
});

// Create scale gizmo
const scaleGizmo = createTransformGizmo({
  type: GizmoTypes.SCALE,
  size: 1.0,
  position: { x: 0, y: 0, z: 0 }
});
```

### Gizmo Interaction

```javascript
// Set up event listeners
gizmo.addEventListener('dragStart', (data) => {
  console.log('Drag started on axis:', data.axis);
});

gizmo.addEventListener('dragMove', (data) => {
  console.log('Dragging:', data.delta);
});

gizmo.addEventListener('dragEnd', (data) => {
  console.log('Drag ended:', data.delta);
});

gizmo.addEventListener('hoverChanged', (data) => {
  console.log('Hover axis:', data.axis);
});

// Handle mouse events
gizmo.onMouseDown(event, camera);
gizmo.onMouseMove(event, camera);
gizmo.onMouseUp();
```

### Gizmo Management

```javascript
// Update gizmo properties
gizmo.setPosition({ x: 1, y: 2, z: 3 });
gizmo.setType(GizmoTypes.ROTATE);
gizmo.setSize(2.0);
gizmo.setVisible(false);

// Get gizmo state
const state = gizmo.getState();
console.log('Gizmo state:', state);
```

## Advanced Operations

### Snapping to Grid

```javascript
import { snapToGrid } from './transforms/index.js';

// Snap objects to grid
const snappedObjects = snapToGrid(objects, {
  gridSize: 1.0,
  axis: 'all',
  snapToCenter: true
});

// Snap only X axis
const xSnapped = snapToGrid(objects, {
  gridSize: 0.5,
  axis: 'x',
  snapToCenter: false
});
```

### Snapping to Objects

```javascript
import { snapToObjects } from './transforms/index.js';

// Snap objects to targets
const snappedObjects = snapToObjects(objects, targets, {
  threshold: 0.5,
  mode: 'center'
});

// Snap to vertices
const vertexSnapped = snapToObjects(objects, targets, {
  threshold: 0.1,
  mode: 'vertex'
});
```

### Creating Transforms from Data

```javascript
import { createTransformFromPoints, createTransformFromBounds } from './transforms/index.js';

// Create transform from two points
const transform = createTransformFromPoints(
  { x: 0, y: 0, z: 0 },
  { x: 5, y: 5, z: 5 }
);

// Create transform from bounds
const bounds = {
  min: { x: -1, y: -1, z: -1 },
  max: { x: 1, y: 1, z: 1 }
};
const boundsTransform = createTransformFromBounds(bounds);
```

### Transform Validation

```javascript
import { validateTransformOperation } from './transforms/index.js';

// Validate transform operation
const operation = {
  type: 'align',
  objects: objects,
  target: target,
  options: { axis: 'x', mode: 'center' }
};

const validation = validateTransformOperation(operation);
if (validation.isValid) {
  console.log('Operation is valid');
} else {
  console.log('Validation errors:', validation.errors);
}
```

## Usage Examples

### Complete Transform Workflow

```javascript
import { 
  createTransformManager, 
  createTransform,
  alignObjects,
  distributeObjects,
  snapToGrid 
} from './transforms/index.js';

// Create transform manager
const transformManager = createTransformManager({
  autoUpdate: true,
  cacheMatrices: true
});

// Create transforms for objects
const objects = [
  { id: 'obj1', position: { x: 0, y: 0, z: 0 } },
  { id: 'obj2', position: { x: 2, y: 0, z: 0 } },
  { id: 'obj3', position: { x: 4, y: 0, z: 0 } }
];

// Create transform for each object
objects.forEach(obj => {
  transformManager.createTransform(obj.id, {
    position: obj.position,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  });
});

// Align objects to center
const alignedObjects = alignObjects(objects, { x: 0, y: 0, z: 0 }, {
  axis: 'x',
  mode: 'center'
});

// Distribute objects evenly
const distributedObjects = distributeObjects(alignedObjects, {
  axis: 'x',
  spacing: 2
});

// Snap to grid
const finalObjects = snapToGrid(distributedObjects, {
  gridSize: 0.5,
  axis: 'all'
});

console.log('Transform workflow completed');
```

### Interactive Gizmo Example

```javascript
import { createTransformGizmo, GizmoTypes } from './transforms/index.js';

// Create gizmo
const gizmo = createTransformGizmo({
  type: GizmoTypes.TRANSLATE,
  size: 1.0,
  position: { x: 0, y: 0, z: 0 }
});

// Set up event listeners
gizmo.addEventListener('dragStart', (data) => {
  console.log('Started dragging on axis:', data.axis);
});

gizmo.addEventListener('dragMove', (data) => {
  // Update object position based on drag
  const delta = data.delta;
  selectedObject.position.x += delta.x;
  selectedObject.position.y += delta.y;
  selectedObject.position.z += delta.z;
});

gizmo.addEventListener('dragEnd', (data) => {
  console.log('Finished dragging:', data.delta);
  // Save transform history
  saveTransformHistory();
});

// Handle mouse events
document.addEventListener('mousedown', (event) => {
  gizmo.onMouseDown(event, camera);
});

document.addEventListener('mousemove', (event) => {
  gizmo.onMouseMove(event, camera);
});

document.addEventListener('mouseup', () => {
  gizmo.onMouseUp();
});
```

### Advanced Transform Operations

```javascript
import { 
  mirrorObjects,
  rotateAroundPoint,
  scaleFromPoint,
  TransformUtils 
} from './transforms/index.js';

// Mirror objects
const mirroredObjects = mirrorObjects(objects, {
  axis: 'x',
  center: { x: 0, y: 0, z: 0 },
  duplicate: true
});

// Rotate around custom point
const rotationCenter = { x: 5, y: 0, z: 0 };
const rotatedObjects = rotateAroundPoint(objects, rotationCenter, {
  x: 0,
  y: Math.PI / 2,
  z: 0
}, {
  space: 'world'
});

// Scale from point
const scaleCenter = { x: 0, y: 0, z: 0 };
const scaledObjects = scaleFromPoint(objects, scaleCenter, {
  x: 2,
  y: 1.5,
  z: 0.5
}, {
  uniform: false
});

// Interpolate between transforms
const transform1 = createTransform({ position: { x: 0, y: 0, z: 0 } });
const transform2 = createTransform({ position: { x: 10, y: 10, z: 10 } });

const interpolatedTransform = TransformUtils.interpolateTransforms(
  transform1, 
  transform2, 
  0.5
);
```

## API Reference

### TransformManager

#### Constructor

```javascript
new TransformManager(options)
```

**Parameters:**
- `options` (Object, optional)
  - `autoUpdate` (boolean): Auto-update transforms (default: true)
  - `cacheMatrices` (boolean): Cache transformation matrices (default: true)
  - `maxTransforms` (number): Maximum transforms to manage (default: 1000)

#### Methods

##### `createTransform(id, options)`
Create a new transform.

**Parameters:**
- `id` (string): Transform ID
- `options` (Object, optional): Transform options

**Returns:** Transform - Created transform

##### `getTransform(id)`
Get a transform by ID.

**Parameters:**
- `id` (string): Transform ID

**Returns:** Transform - Transform or null

##### `updateTransform(id, updates)`
Update a transform.

**Parameters:**
- `id` (string): Transform ID
- `updates` (Object): Transform updates

**Returns:** boolean - Success status

##### `removeTransform(id)`
Remove a transform.

**Parameters:**
- `id` (string): Transform ID

**Returns:** boolean - Success status

### Transform

#### Constructor

```javascript
new Transform(options)
```

**Parameters:**
- `options` (Object, optional): Transform options

#### Methods

##### `setPosition(x, y, z)`
Set transform position.

**Parameters:**
- `x` (number): X coordinate
- `y` (number): Y coordinate
- `z` (number): Z coordinate

##### `setRotation(x, y, z)`
Set transform rotation in radians.

**Parameters:**
- `x` (number): X rotation in radians
- `y` (number): Y rotation in radians
- `z` (number): Z rotation in radians

##### `setScale(x, y, z)`
Set transform scale.

**Parameters:**
- `x` (number): X scale
- `y` (number): Y scale
- `z` (number): Z scale

##### `getMatrix()`
Get transformation matrix.

**Returns:** Array - 4x4 transformation matrix

##### `transformPoint(point)`
Transform a point.

**Parameters:**
- `point` (Object): Point {x, y, z}

**Returns:** Object - Transformed point

### TransformOperations

#### Methods

##### `alignObjects(objects, target, options)`
Align objects to target.

**Parameters:**
- `objects` (Array): Objects to align
- `target` (Object): Target object or point
- `options` (Object, optional): Alignment options

**Returns:** Array - Aligned objects

##### `distributeObjects(objects, options)`
Distribute objects evenly.

**Parameters:**
- `objects` (Array): Objects to distribute
- `options` (Object, optional): Distribution options

**Returns:** Array - Distributed objects

##### `mirrorObjects(objects, options)`
Mirror objects.

**Parameters:**
- `objects` (Array): Objects to mirror
- `options` (Object, optional): Mirror options

**Returns:** Array - Mirrored objects

### TransformGizmo

#### Constructor

```javascript
new TransformGizmo(options)
```

**Parameters:**
- `options` (Object, optional): Gizmo options

#### Methods

##### `setPosition(position)`
Set gizmo position.

**Parameters:**
- `position` (Object): New position

##### `setType(type)`
Set gizmo type.

**Parameters:**
- `type` (string): New gizmo type

##### `onMouseDown(event, camera)`
Handle mouse down event.

**Parameters:**
- `event` (Object): Mouse event
- `camera` (Object): Camera object

**Returns:** boolean - True if gizmo was clicked

## Best Practices

### 1. Transform Management

```javascript
// Use descriptive transform IDs
const transform = transformManager.createTransform('player-character-transform', {
  position: { x: 0, y: 0, z: 0 },
  description: 'Player character transform'
});

// Validate transforms before use
const validation = transform.validate();
if (!validation.isValid) {
  console.error('Transform validation failed:', validation.errors);
  return;
}
```

### 2. Performance Optimization

```javascript
// Cache frequently used transforms
const cachedTransforms = new Map();

function getCachedTransform(id) {
  if (!cachedTransforms.has(id)) {
    cachedTransforms.set(id, transformManager.getTransform(id));
  }
  return cachedTransforms.get(id);
}

// Batch transform operations
const transforms = objects.map(obj => ({
  id: obj.id,
  position: obj.position,
  rotation: obj.rotation,
  scale: obj.scale
}));

transformManager.batchUpdate(transforms);
```

### 3. Gizmo Interaction

```javascript
// Set up proper event handling
gizmo.addEventListener('dragStart', (data) => {
  // Store initial state for undo
  undoManager.saveState();
});

gizmo.addEventListener('dragMove', (data) => {
  // Update object in real-time
  updateObjectTransform(data);
});

gizmo.addEventListener('dragEnd', (data) => {
  // Commit changes
  commitTransformChanges(data);
});
```

### 4. Transform Validation

```javascript
// Validate all transform operations
function safeTransformOperation(operation) {
  const validation = validateTransformOperation(operation);
  if (!validation.isValid) {
    console.error('Transform operation validation failed:', validation.errors);
    return false;
  }
  
  try {
    // Perform operation
    return true;
  } catch (error) {
    console.error('Transform operation failed:', error);
    return false;
  }
}
```

## Performance Considerations

### 1. Matrix Caching

```javascript
// Enable matrix caching for better performance
const transformManager = createTransformManager({
  cacheMatrices: true,
  autoUpdate: false // Update manually for better control
});

// Update matrices only when needed
transformManager.updateMatrices();
```

### 2. Batch Operations

```javascript
// Use batch operations for multiple transforms
const batchUpdates = objects.map(obj => ({
  id: obj.id,
  updates: {
    position: obj.position,
    rotation: obj.rotation,
    scale: obj.scale
  }
}));

transformManager.batchUpdate(batchUpdates);
```

### 3. Gizmo Performance

```javascript
// Optimize gizmo rendering
const gizmo = createTransformGizmo({
  type: GizmoTypes.TRANSLATE,
  size: 1.0,
  visible: true
});

// Only render gizmo when needed
gizmo.setVisible(selectedObjects.length > 0);

// Use efficient raycasting
gizmo.setRaycastOptimization(true);
```

### 4. Memory Management

```javascript
// Clean up unused transforms
transformManager.cleanupUnusedTransforms();

// Dispose gizmo resources
gizmo.dispose();

// Clear transform cache
transformManager.clearCache();
```

## Troubleshooting

### Common Issues

1. **Transform not updating**
   - Check if `autoUpdate` is enabled
   - Call `updateMatrix()` manually
   - Verify transform is not marked as dirty

2. **Gizmo not responding**
   - Check camera reference
   - Verify gizmo is visible
   - Ensure proper event handling

3. **Performance issues**
   - Enable matrix caching
   - Use batch operations
   - Limit number of transforms

4. **Incorrect transformations**
   - Validate transform data
   - Check coordinate system
   - Verify pivot points

### Debug Tips

```javascript
// Enable debug logging
const transformManager = createTransformManager({
  debug: true,
  logLevel: 'verbose'
});

// Get transform statistics
const stats = transformManager.getStatistics();
console.log('Transform stats:', stats);

// Validate all transforms
const transforms = transformManager.getAllTransforms();
transforms.forEach(transform => {
  const validation = transform.validate();
  if (!validation.isValid) {
    console.error('Invalid transform:', validation.errors);
  }
});
``` 