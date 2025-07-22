# EditableMesh Guide

## Overview

The EditableMesh system provides a comprehensive framework for creating, manipulating, and managing 3D meshes with advanced editing capabilities. This guide covers the core concepts, usage patterns, and best practices for working with editable meshes.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Creating Meshes](#creating-meshes)
3. [Mesh Operations](#mesh-operations)
4. [Geometry Operations](#geometry-operations)
5. [Vertex Operations](#vertex-operations)
6. [Edge Operations](#edge-operations)
7. [Face Operations](#face-operations)
8. [UV Operations](#uv-operations)
9. [Material Operations](#material-operations)
10. [Transform Operations](#transform-operations)
11. [Selection Operations](#selection-operations)
12. [History and Undo/Redo](#history-and-undoredo)
13. [Performance Optimization](#performance-optimization)
14. [Best Practices](#best-practices)
15. [Troubleshooting](#troubleshooting)
16. [Migration Guide](#migration-guide)

## Core Concepts

### EditableMesh Class

The EditableMesh class is the central component that wraps THREE.js geometry and provides advanced editing capabilities.

```javascript
import { EditableMesh } from '../EditableMesh.js';

const mesh = new EditableMesh({
  geometry: threeJSGeometry,
  material: threeJSMaterial,
  name: 'MyMesh'
});
```

### Modular Operations (New Style)

All mesh operations are now pure functions, imported directly from their respective modules:

```javascript
// Import specific operations
import { extrudeFaces } from '../editing/operations/face/index.js';
import { mergeVertices } from '../editing/operations/vertex/index.js';
import { splitEdges } from '../editing/operations/edge/index.js';
import { bevel } from '../editing/operations/geometry/index.js';

// Or import from the main operations index
import { extrudeFaces, mergeVertices, splitEdges, bevel } from '../editing/operations/index.js';
```

## Creating Meshes

### From THREE.js Geometry

```javascript
import { EditableMesh } from '../EditableMesh.js';
import * as THREE from 'three';

// Create THREE.js geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// Create editable mesh
const mesh = new EditableMesh({
  geometry,
  material,
  name: 'Cube'
});
```

### From Primitives

```javascript
import { createCube, createSphere, createCylinder } from '../primitives/index.js';

// Create primitive meshes
const cube = createCube({ size: 1, name: 'Cube' });
const sphere = createSphere({ radius: 0.5, name: 'Sphere' });
const cylinder = createCylinder({ radius: 0.3, height: 1, name: 'Cylinder' });
```

### From Existing Mesh

```javascript
import { EditableMesh } from '../EditableMesh.js';

// Convert existing THREE.js mesh
const threeMesh = scene.getObjectByName('ExistingMesh');
const editableMesh = new EditableMesh({
  geometry: threeMesh.geometry,
  material: threeMesh.material,
  name: threeMesh.name
});
```

## Mesh Operations

### Basic Mesh Properties

```javascript
import { EditableMesh } from '../EditableMesh.js';

const mesh = new EditableMesh({ geometry, material });

// Get mesh properties
console.log('Name:', mesh.name);
console.log('UUID:', mesh.uuid);
console.log('Visible:', mesh.visible);
console.log('Position:', mesh.position);
console.log('Rotation:', mesh.rotation);
console.log('Scale:', mesh.scale);

// Set mesh properties
mesh.name = 'UpdatedMesh';
mesh.visible = false;
mesh.position.set(1, 2, 3);
mesh.rotation.set(0, Math.PI / 2, 0);
mesh.scale.set(2, 2, 2);
```

### Mesh Validation

```javascript
import { validateMesh } from '../editing/validation/index.js';

const validation = validateMesh(mesh);

if (validation.isValid) {
  console.log('Mesh is valid');
} else {
  console.error('Mesh validation errors:', validation.errors);
}
```

## Geometry Operations

### Extrude Geometry

```javascript
import { extrude } from '../editing/operations/geometry/index.js';

const result = extrude(geometry, {
  amount: 1.0,
  direction: { x: 0, y: 1, z: 0 },
  bevelEnabled: true,
  bevelThickness: 0.1,
  bevelSize: 0.05
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Bevel Geometry

```javascript
import { bevel } from '../editing/operations/geometry/index.js';

const result = bevel(geometry, {
  amount: 0.1,
  segments: 3,
  profile: 'linear'
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

## Vertex Operations

### Merge Vertices

```javascript
import { mergeVertices } from '../editing/operations/vertex/index.js';

const result = mergeVertices(geometry, [0, 1, 2]);

if (result.success) {
  mesh.geometry = result.geometry;
  console.log('Vertices merged successfully');
} else {
  console.error('Merge failed:', result.errors);
}
```

### Snap Vertices

```javascript
import { snapVertices } from '../editing/operations/vertex/index.js';

const result = snapVertices(geometry, [0, 1, 2], {
  threshold: 0.1,
  target: { x: 0, y: 0, z: 0 }
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Split Vertices

```javascript
import { splitVertices } from '../editing/operations/vertex/index.js';

const result = splitVertices(geometry, [0, 1, 2]);

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Smooth Vertices

```javascript
import { smoothVertices } from '../editing/operations/vertex/index.js';

const result = smoothVertices(geometry, [0, 1, 2], {
  iterations: 3,
  strength: 0.5
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Connect Vertices

```javascript
import { connectVertices } from '../editing/operations/vertex/index.js';

const result = connectVertices(geometry, [0, 1], [2, 3]);

if (result.success) {
  mesh.geometry = result.geometry;
}
```

## Edge Operations

### Split Edges

```javascript
import { splitEdges } from '../editing/operations/edge/index.js';

const result = splitEdges(geometry, [0, 1, 2]);

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Collapse Edges

```javascript
import { collapseEdges } from '../editing/operations/edge/index.js';

const result = collapseEdges(geometry, [0, 1, 2]);

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Dissolve Edges

```javascript
import { dissolveEdges } from '../editing/operations/edge/index.js';

const result = dissolveEdges(geometry, [0, 1, 2]);

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Bevel Edges

```javascript
import { bevelEdges } from '../editing/operations/edge/index.js';

const result = bevelEdges(geometry, [0, 1, 2], {
  amount: 0.1,
  segments: 3
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Extrude Edges

```javascript
import { extrudeEdges } from '../editing/operations/edge/index.js';

const result = extrudeEdges(geometry, [0, 1, 2], {
  amount: 1.0,
  direction: { x: 0, y: 1, z: 0 }
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

## Face Operations

### Extrude Faces

```javascript
import { extrudeFaces } from '../editing/operations/face/index.js';

const result = extrudeFaces(geometry, [0, 1, 2], {
  amount: 1.0,
  direction: { x: 0, y: 1, z: 0 },
  keepOriginal: true
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Inset Faces

```javascript
import { insetFaces } from '../editing/operations/face/index.js';

const result = insetFaces(geometry, [0, 1, 2], {
  amount: 0.1,
  keepOriginal: true
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Bevel Faces

```javascript
import { bevelFaces } from '../editing/operations/face/index.js';

const result = bevelFaces(geometry, [0, 1, 2], {
  amount: 0.1,
  segments: 3
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Fill Faces

```javascript
import { fillFaces } from '../editing/operations/face/index.js';

const result = fillFaces(geometry, [0, 1, 2]);

if (result.success) {
  mesh.geometry = result.geometry;
}
```

## UV Operations

### Unwrap Faces

```javascript
import { unwrapFaces } from '../editing/operations/uv/index.js';

const result = unwrapFaces(geometry, [0, 1, 2], {
  method: 'angle_based',
  margin: 0.01
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Pack UVs

```javascript
import { packUVs } from '../editing/operations/uv/index.js';

const result = packUVs(geometry, {
  margin: 0.01,
  rotate: true
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

## Material Operations

### Create Material

```javascript
import { createMaterial } from '../materials/index.js';

const material = createMaterial('standard', {
  color: 0x00ff00,
  metalness: 0.5,
  roughness: 0.3
});

mesh.material = material;
```

### Set Material Property

```javascript
import { setMaterialProperty } from '../materials/index.js';

setMaterialProperty(material, 'color', 0xff0000);
setMaterialProperty(material, 'metalness', 0.8);
```

## Transform Operations

### Basic Transforms

```javascript
import { setPosition, setRotation, setScale } from '../transforms/index.js';

// Set position
setPosition(mesh, 1, 2, 3);

// Set rotation (in radians)
setRotation(mesh, 0, Math.PI / 2, 0);

// Set scale
setScale(mesh, 2, 2, 2);
```

### Advanced Transforms

```javascript
import { transformVertices, transformFaces } from '../transforms/index.js';

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

## Selection Operations

### Set Selection Mode

```javascript
import { setSelectionMode } from '../selection/index.js';

setSelectionMode('vertex'); // 'vertex', 'edge', 'face', 'object'
```

### Add Selection

```javascript
import { addSelection, removeSelection, isSelected } from '../selection/index.js';

// Add vertices to selection
addSelection('vertex', 'v1');
addSelection('vertex', 'v2');

// Check if selected
if (isSelected('vertex', 'v1')) {
  console.log('Vertex v1 is selected');
}

// Remove from selection
removeSelection('vertex', 'v1');
```

### Get All Selections

```javascript
import { getAllSelections, getSelectionsByType } from '../selection/index.js';

// Get all selections
const allSelections = getAllSelections();

// Get selections by type
const vertexSelections = getSelectionsByType('vertex');
const edgeSelections = getSelectionsByType('edge');
const faceSelections = getSelectionsByType('face');
```

## History and Undo/Redo

### Add to History

```javascript
import { addToHistory, undo, redo } from '../history/index.js';

// Add operation to history
addToHistory({
  type: 'vertex_merge',
  data: { vertices: [0, 1], geometry: geometry.clone() },
  timestamp: Date.now()
});
```

### Undo/Redo Operations

```javascript
import { undo, redo, canUndo, canRedo } from '../history/index.js';

// Check if undo/redo is available
if (canUndo()) {
  const result = undo();
  if (result.success) {
    mesh.geometry = result.geometry;
  }
}

if (canRedo()) {
  const result = redo();
  if (result.success) {
    mesh.geometry = result.geometry;
  }
}
```

## Performance Optimization

### Geometry Optimization

```javascript
import { optimizeGeometry } from '../editing/operations/geometry/index.js';

const result = optimizeGeometry(geometry, {
  mergeVertices: true,
  removeUnused: true,
  removeDegenerate: true
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### Batch Operations

```javascript
import { batchOperations } from '../editing/core/index.js';

// Perform multiple operations in a single batch
const operations = [
  { type: 'merge_vertices', data: { vertices: [0, 1] } },
  { type: 'extrude_faces', data: { faces: [0, 1], amount: 1.0 } },
  { type: 'bevel_edges', data: { edges: [0, 1], amount: 0.1 } }
];

const result = batchOperations(geometry, operations);

if (result.success) {
  mesh.geometry = result.geometry;
}
```

## Best Practices

### 1. Always Validate Operations

```javascript
import { validateOperation } from '../editing/validation/index.js';

const validation = validateOperation('merge_vertices', {
  geometry,
  vertices: [0, 1]
});

if (!validation.isValid) {
  console.error('Operation validation failed:', validation.errors);
  return;
}

// Proceed with operation
const result = mergeVertices(geometry, [0, 1]);
```

### 2. Use Appropriate Selection Modes

```javascript
import { setSelectionMode } from '../selection/index.js';

// Set selection mode before performing operations
setSelectionMode('vertex');
// Perform vertex operations

setSelectionMode('edge');
// Perform edge operations

setSelectionMode('face');
// Perform face operations
```

### 3. Handle Operation Results

```javascript
// Always check operation results
const result = extrudeFaces(geometry, [0, 1, 2]);

if (result.success) {
  mesh.geometry = result.geometry;
  console.log('Operation completed successfully');
} else {
  console.error('Operation failed:', result.errors);
  // Handle error appropriately
}
```

### 4. Optimize Geometry Regularly

```javascript
import { optimizeGeometry } from '../editing/operations/geometry/index.js';

// Optimize geometry after multiple operations
const result = optimizeGeometry(mesh.geometry, {
  mergeVertices: true,
  removeUnused: true
});

if (result.success) {
  mesh.geometry = result.geometry;
}
```

### 5. Use History for Complex Operations

```javascript
import { addToHistory, undo } from '../history/index.js';

// Add to history before complex operations
addToHistory({
  type: 'complex_operation',
  data: { geometry: mesh.geometry.clone() }
});

// Perform complex operations
// ... multiple operations ...

// If something goes wrong, undo
if (operationFailed) {
  const undoResult = undo();
  if (undoResult.success) {
    mesh.geometry = undoResult.geometry;
  }
}
```

## Troubleshooting

### Common Issues

1. **Operation Fails with Validation Error**
   ```javascript
   // Check operation parameters
   const validation = validateOperation('merge_vertices', {
     geometry,
     vertices: [0, 1]
   });
   console.log('Validation errors:', validation.errors);
   ```

2. **Geometry Becomes Invalid**
   ```javascript
   // Validate geometry
   const validation = validateMesh(mesh);
   if (!validation.isValid) {
     console.error('Geometry validation failed:', validation.errors);
   }
   ```

3. **Performance Issues**
   ```javascript
   // Optimize geometry
   const result = optimizeGeometry(mesh.geometry, {
     mergeVertices: true,
     removeUnused: true
   });
   ```

4. **Selection Issues**
   ```javascript
   // Check selection mode
   const currentMode = getSelectionMode();
   console.log('Current selection mode:', currentMode);
   
   // Clear selection if needed
   clearSelection();
   ```

## Migration Guide

**Old Style (Legacy):**
```javascript
import { EditManager } from '../editing/EditManager.js';
import { VertexOperations } from '../editing/operations/vertexOperations.js';

const editManager = new EditManager();
const result = VertexOperations.merge(geometry, [0, 1]);
```

**New Modular Style:**
```javascript
import { mergeVertices } from '../editing/operations/vertex/index.js';

const result = mergeVertices(geometry, [0, 1]);
```

**Key Changes:**
- All operations are now pure functions imported directly from their respective modules
- No more manager classes or group objects
- Direct function calls instead of method calls on objects
- Better tree-shaking and performance
- Cleaner, more maintainable code structure

**Migration Steps:**
1. Update all import statements to use the new modular imports
2. Replace manager object method calls with direct function calls
3. Update operation parameter structures if needed
4. Test all operations to ensure they work correctly
5. Remove any unused legacy imports 