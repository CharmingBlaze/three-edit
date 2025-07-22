# Transform System Documentation

## Overview

The Transform System provides comprehensive transformation capabilities for 3D objects, including position, rotation, scale, and advanced geometric transformations. It supports both object-level and component-level transformations.

## Table of Contents

1. [Core Components](#core-components)
2. [Basic Transforms](#basic-transforms)
3. [Advanced Transforms](#advanced-transforms)
4. [Geometric Transforms](#geometric-transforms)
5. [Transform Utilities](#transform-utilities)
6. [Transform Gizmos](#transform-gizmos)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)
9. [Performance Considerations](#performance-considerations)
10. [Migration Guide](#migration-guide)

## Core Components (New Modular Style)

All transform operations are now pure functions, imported directly from their respective files or group index files:

```javascript
import { 
  setPosition, 
  setRotation, 
  setScale, 
  getTransform,
  transformVertices,
  transformFaces
} from '../transforms/index.js';
```

**Example Usage:**
```javascript
import { setPosition, setRotation } from '../transforms/index.js';

setPosition(mesh, 1, 2, 3);
setRotation(mesh, 0, Math.PI / 2, 0);
```

## Basic Transforms

### Position Transforms

```javascript
import { setPosition, getPosition, translate } from '../transforms/index.js';

// Set absolute position
setPosition(mesh, 1, 2, 3);

// Get current position
const position = getPosition(mesh);
console.log('Current position:', position);

// Translate (relative movement)
translate(mesh, 0.5, 0, 0); // Move 0.5 units in X direction
```

### Rotation Transforms

```javascript
import { setRotation, getRotation, rotate } from '../transforms/index.js';

// Set absolute rotation (in radians)
setRotation(mesh, 0, Math.PI / 2, 0); // 90 degrees around Y axis

// Get current rotation
const rotation = getRotation(mesh);
console.log('Current rotation:', rotation);

// Rotate (relative rotation)
rotate(mesh, 0, Math.PI / 4, 0); // Rotate 45 degrees around Y axis
```

### Scale Transforms

```javascript
import { setScale, getScale, scale } from '../transforms/index.js';

// Set absolute scale
setScale(mesh, 2, 2, 2); // Uniform scale of 2x

// Get current scale
const currentScale = getScale(mesh);
console.log('Current scale:', currentScale);

// Scale (relative scaling)
scale(mesh, 1.5, 1, 1); // Scale 1.5x in X direction only
```

### Combined Transforms

```javascript
import { setTransform, getTransform } from '../transforms/index.js';

// Set complete transform
setTransform(mesh, {
  position: { x: 1, y: 2, z: 3 },
  rotation: { x: 0, y: Math.PI / 2, z: 0 },
  scale: { x: 2, y: 1, z: 1 }
});

// Get complete transform
const transform = getTransform(mesh);
console.log('Complete transform:', transform);
```

## Advanced Transforms

### Matrix Transforms

```javascript
import { setMatrix, getMatrix, applyMatrix } from '../transforms/index.js';

// Set transform matrix directly
const matrix = new THREE.Matrix4();
matrix.makeRotationY(Math.PI / 2);
matrix.setPosition(1, 2, 3);
setMatrix(mesh, matrix);

// Get current matrix
const currentMatrix = getMatrix(mesh);

// Apply matrix transformation
const transformMatrix = new THREE.Matrix4();
transformMatrix.makeScale(2, 1, 1);
applyMatrix(mesh, transformMatrix);
```

### Quaternion Transforms

```javascript
import { setQuaternion, getQuaternion, rotateByQuaternion } from '../transforms/index.js';

// Set rotation using quaternion
const quaternion = new THREE.Quaternion();
quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
setQuaternion(mesh, quaternion);

// Get current quaternion
const currentQuaternion = getQuaternion(mesh);

// Rotate by quaternion
const rotationQuaternion = new THREE.Quaternion();
rotationQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 4);
rotateByQuaternion(mesh, rotationQuaternion);
```

### Look-at Transforms

```javascript
import { lookAt, lookAtPoint } from '../transforms/index.js';

// Look at another object
lookAt(mesh, targetObject);

// Look at specific point
lookAtPoint(mesh, { x: 0, y: 5, z: 0 });

// Look at with up vector
lookAtPoint(mesh, { x: 0, y: 5, z: 0 }, { x: 0, y: 1, z: 0 });
```

## Geometric Transforms

### Vertex Transforms

```javascript
import { transformVertices } from '../transforms/index.js';

// Transform specific vertices
const result = transformVertices(geometry, [0, 1, 2], {
  translation: { x: 1, y: 0, z: 0 },
  rotation: { x: 0, y: Math.PI / 4, z: 0 },
  scale: { x: 1.5, y: 1, z: 1 }
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Face Transforms

```javascript
import { transformFaces } from '../transforms/index.js';

// Transform specific faces
const result = transformFaces(geometry, [0, 1, 2], {
  translation: { x: 0, y: 1, z: 0 },
  rotation: { x: Math.PI / 6, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 2 }
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Edge Transforms

```javascript
import { transformEdges } from '../transforms/index.js';

// Transform specific edges
const result = transformEdges(geometry, [0, 1, 2], {
  translation: { x: 0.5, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: Math.PI / 3 },
  scale: { x: 2, y: 1, z: 1 }
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

## Transform Utilities

### Transform Calculations

```javascript
import { 
  calculateCentroid, 
  calculateBoundingBox, 
  calculateTransformFromPoints 
} from '../transforms/index.js';

// Calculate centroid of vertices
const centroid = calculateCentroid(vertexPositions);
console.log('Centroid:', centroid);

// Calculate bounding box
const boundingBox = calculateBoundingBox(vertexPositions);
console.log('Bounding box:', boundingBox);

// Calculate transform from point sets
const transform = calculateTransformFromPoints(sourcePoints, targetPoints);
```

### Transform Interpolation

```javascript
import { interpolateTransform, interpolatePosition, interpolateRotation } from '../transforms/index.js';

// Interpolate between two transforms
const interpolatedTransform = interpolateTransform(transform1, transform2, 0.5);

// Interpolate position
const interpolatedPosition = interpolatePosition(position1, position2, 0.3);

// Interpolate rotation
const interpolatedRotation = interpolateRotation(rotation1, rotation2, 0.7);
```

### Transform Constraints

```javascript
import { 
  constrainPosition, 
  constrainRotation, 
  constrainScale 
} from '../transforms/index.js';

// Constrain position to bounds
const constrainedPosition = constrainPosition(position, {
  min: { x: -10, y: -10, z: -10 },
  max: { x: 10, y: 10, z: 10 }
});

// Constrain rotation to axis
const constrainedRotation = constrainRotation(rotation, {
  axis: 'y', // Only allow Y-axis rotation
  min: -Math.PI,
  max: Math.PI
});

// Constrain scale
const constrainedScale = constrainScale(scale, {
  min: 0.1,
  max: 10,
  uniform: true // Keep uniform scaling
});
```

## Transform Gizmos

### Creating Gizmos

```javascript
import { 
  createTransformGizmo, 
  createPositionGizmo, 
  createRotationGizmo, 
  createScaleGizmo 
} from '../transforms/TransformGizmo.js';

// Create general transform gizmo
const gizmo = createTransformGizmo(mesh, {
  mode: 'translate', // 'translate', 'rotate', 'scale'
  size: 1.0,
  showAxes: true
});

// Create specific gizmo types
const positionGizmo = createPositionGizmo(mesh, { size: 1.0 });
const rotationGizmo = createRotationGizmo(mesh, { size: 1.5 });
const scaleGizmo = createScaleGizmo(mesh, { size: 1.0 });
```

### Gizmo Interaction

```javascript
import { 
  updateGizmo, 
  setGizmoMode, 
  enableGizmo, 
  disableGizmo 
} from '../transforms/TransformGizmo.js';

// Update gizmo position
updateGizmo(gizmo, mesh.position);

// Change gizmo mode
setGizmoMode(gizmo, 'rotate');

// Enable/disable gizmo
enableGizmo(gizmo);
disableGizmo(gizmo);
```

## Usage Examples

### Basic Object Transformation

```javascript
import { 
  setPosition, 
  setRotation, 
  setScale, 
  getTransform 
} from '../transforms/index.js';

// Set up object transforms
setPosition(mesh, 5, 0, 0);
setRotation(mesh, 0, Math.PI / 2, 0);
setScale(mesh, 2, 1, 1);

// Get complete transform
const transform = getTransform(mesh);
console.log('Object transform:', transform);
```

### Interactive Transformation

```javascript
import { translate, rotate, scale } from '../transforms/index.js';

// Handle keyboard input for transformation
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w':
      translate(mesh, 0, 0, -0.1); // Move forward
      break;
    case 's':
      translate(mesh, 0, 0, 0.1); // Move backward
      break;
    case 'a':
      translate(mesh, -0.1, 0, 0); // Move left
      break;
    case 'd':
      translate(mesh, 0.1, 0, 0); // Move right
      break;
    case 'q':
      rotate(mesh, 0, -0.1, 0); // Rotate left
      break;
    case 'e':
      rotate(mesh, 0, 0.1, 0); // Rotate right
      break;
  }
});
```

### Geometric Transformation

```javascript
import { transformVertices } from '../transforms/index.js';

// Transform selected vertices
function transformSelectedVertices(translation, rotation, scale) {
  const selectedVertices = getSelectedVertices(); // Get from selection system
  
  const result = transformVertices(mesh.geometry, selectedVertices, {
    translation,
    rotation,
    scale
  });
  
  if (result.success) {
    mesh.geometry = result.geometry;
    console.log('Vertices transformed successfully');
  } else {
    console.error('Vertex transformation failed:', result.errors);
  }
}

// Example usage
transformSelectedVertices(
  { x: 1, y: 0, z: 0 },
  { x: 0, y: Math.PI / 4, z: 0 },
  { x: 1.5, y: 1, z: 1 }
);
```

### Animation with Transforms

```javascript
import { 
  setPosition, 
  interpolatePosition, 
  interpolateRotation 
} from '../transforms/index.js';

// Animate object movement
function animateObject(startPos, endPos, duration) {
  const startTime = Date.now();
  
  function animate() {
    const elapsed = (Date.now() - startTime) / 1000;
    const progress = Math.min(elapsed / duration, 1);
    
    const currentPos = interpolatePosition(startPos, endPos, progress);
    setPosition(mesh, currentPos.x, currentPos.y, currentPos.z);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}

// Example animation
animateObject(
  { x: 0, y: 0, z: 0 },
  { x: 10, y: 5, z: 0 },
  2.0 // 2 seconds
);
```

### Transform with Constraints

```javascript
import { 
  setPosition, 
  constrainPosition, 
  constrainRotation 
} from '../transforms/index.js';

// Apply constrained transformation
function applyConstrainedTransform(mesh, newPosition, newRotation) {
  // Constrain position to bounds
  const constrainedPos = constrainPosition(newPosition, {
    min: { x: -10, y: 0, z: -10 },
    max: { x: 10, y: 20, z: 10 }
  });
  
  // Constrain rotation to Y-axis only
  const constrainedRot = constrainRotation(newRotation, {
    axis: 'y',
    min: -Math.PI,
    max: Math.PI
  });
  
  // Apply constrained transforms
  setPosition(mesh, constrainedPos.x, constrainedPos.y, constrainedPos.z);
  setRotation(mesh, constrainedRot.x, constrainedRot.y, constrainedRot.z);
}
```

## Best Practices

### 1. Use Appropriate Transform Functions

```javascript
import { setPosition, translate } from '../transforms/index.js';

// Use setPosition for absolute positioning
setPosition(mesh, 5, 0, 0);

// Use translate for relative movement
translate(mesh, 0.1, 0, 0); // Move 0.1 units in X direction
```

### 2. Validate Transforms

```javascript
import { validateTransform } from '../transforms/index.js';

// Validate transform before applying
const transform = {
  position: { x: 1, y: 2, z: 3 },
  rotation: { x: 0, y: Math.PI / 2, z: 0 },
  scale: { x: 2, y: 1, z: 1 }
};

const validation = validateTransform(transform);
if (validation.isValid) {
  setTransform(mesh, transform);
} else {
  console.error('Invalid transform:', validation.errors);
}
```

### 3. Use Efficient Geometric Transforms

```javascript
import { transformVertices } from '../transforms/index.js';

// Batch vertex transformations for better performance
const vertexIndices = [0, 1, 2, 3, 4, 5];
const result = transformVertices(geometry, vertexIndices, {
  translation: { x: 1, y: 0, z: 0 }
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### 4. Handle Transform Errors

```javascript
import { setPosition, getPosition } from '../transforms/index.js';

// Always check transform results
try {
  setPosition(mesh, 1, 2, 3);
  const position = getPosition(mesh);
  console.log('Position set successfully:', position);
} catch (error) {
  console.error('Transform error:', error.message);
}
```

### 5. Use Transform Constraints

```javascript
import { constrainPosition, setPosition } from '../transforms/index.js';

// Apply constraints to prevent invalid transforms
const newPosition = { x: 15, y: -5, z: 20 };
const constrainedPosition = constrainPosition(newPosition, {
  min: { x: -10, y: 0, z: -10 },
  max: { x: 10, y: 20, z: 10 }
});

setPosition(mesh, constrainedPosition.x, constrainedPosition.y, constrainedPosition.z);
```

## Performance Considerations

### 1. Batch Transform Operations

```javascript
import { setTransform } from '../transforms/index.js';

// Set complete transform at once instead of separate calls
setTransform(mesh, {
  position: { x: 1, y: 2, z: 3 },
  rotation: { x: 0, y: Math.PI / 2, z: 0 },
  scale: { x: 2, y: 1, z: 1 }
});
```

### 2. Use Efficient Geometric Transforms

```javascript
import { transformVertices } from '../transforms/index.js';

// Transform multiple vertices in a single operation
const result = transformVertices(geometry, vertexIndices, transformOptions);
```

### 3. Optimize Gizmo Updates

```javascript
import { updateGizmo } from '../transforms/TransformGizmo.js';

// Only update gizmo when necessary
let lastPosition = null;
function updateGizmoIfNeeded(mesh) {
  const currentPosition = mesh.position;
  if (!lastPosition || !currentPosition.equals(lastPosition)) {
    updateGizmo(gizmo, currentPosition);
    lastPosition = currentPosition.clone();
  }
}
```

### 4. Use Transform Caching

```javascript
import { getTransform, setTransform } from '../transforms/index.js';

// Cache transforms for performance
const transformCache = new Map();

function getCachedTransform(mesh) {
  if (!transformCache.has(mesh.id)) {
    transformCache.set(mesh.id, getTransform(mesh));
  }
  return transformCache.get(mesh.id);
}
```

## Migration Guide

**Old Style (Legacy):**
```javascript
import { TransformManager } from '../transforms/TransformManager.js';

const transformManager = new TransformManager();
transformManager.setPosition(mesh, 1, 2, 3);
transformManager.setRotation(mesh, 0, Math.PI / 2, 0);
```

**New Modular Style:**
```javascript
import { setPosition, setRotation } from '../transforms/index.js';

setPosition(mesh, 1, 2, 3);
setRotation(mesh, 0, Math.PI / 2, 0);
```

**Key Changes:**
- All transform operations are now pure functions imported directly from their respective modules
- No more manager classes or group objects
- Direct function calls instead of method calls on objects
- Better tree-shaking and performance
- Cleaner, more maintainable code structure

**Migration Steps:**
1. Update all import statements to use the new modular imports
2. Replace manager object method calls with direct function calls
3. Update transform parameter structures if needed
4. Test all transform operations to ensure they work correctly
5. Remove any unused legacy imports 