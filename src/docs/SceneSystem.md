# Scene System Documentation

## Overview

The Scene System provides comprehensive scene management capabilities for the 3D editor. It handles scene creation, mesh management, hierarchy, validation, serialization, and operations.

## Table of Contents

1. [Core Components](#core-components)
2. [Scene Management](#scene-management)
3. [Mesh Operations](#mesh-operations)
4. [Scene Utilities](#scene-utilities)
5. [Scene Operations](#scene-operations)
6. [Scene Validation](#scene-validation)
7. [Scene Serialization](#scene-serialization)
8. [Usage Examples](#usage-examples)
9. [API Reference](#api-reference)
10. [Best Practices](#best-practices)
11. [Performance Considerations](#performance-considerations)
12. [Migration Guide](#migration-guide)

## Core Components (New Modular Style)

All scene operations are now pure functions, imported directly from their respective files or group index files. Example:

```js
import { createScene, duplicateMesh, groupMeshes } from '../scene/index.js';
```

**Example Usage:**
```js
import { createScene } from '../scene/index.js';
const scene = createScene('MyScene');
```

## Migration Guide

**Old Style:**
```js
import { SceneManager } from '../scene/SceneManager.js';
const manager = new SceneManager();
manager.createScene('MyScene');
```

**New Modular Style:**
```js
import { createScene } from '../scene/index.js';
const scene = createScene('MyScene');
```
- All operations are now imported as individual functions from their respective files or group index files.
- There are no more manager or group objects—just pure functions.
- Update all your imports and usage accordingly for the new modular system.

## Scene Management

### Creating Scenes

```javascript
import { createScene } from '../scene/index.js';

// Create new scene
const scene = createScene('MyScene', {
  description: 'A test scene',
  metadata: { version: '1.0', author: 'User' }
});

console.log('Scene created:', scene.id);
```

### Managing Scenes

```javascript
import { getAllScenes, getScene, removeScene, hasScene } from '../scene/index.js';

// Get all scenes
const allScenes = getAllScenes();

// Get specific scene
const scene = getScene('scene-1');

// Remove scene
const removed = removeScene('scene-1');

// Check if scene exists
const exists = hasScene('scene-1');
```

### Scene Properties

```javascript
import { Scene } from '../scene/Scene.js';

// Set scene properties
scene.setName('Updated Scene Name');
scene.setDescription('Updated description');
scene.setMetadata({ version: '2.0', updated: Date.now() });

// Get scene properties
const name = scene.getName();
const description = scene.getDescription();
const metadata = scene.getMetadata();
```

## Mesh Operations

### Adding Meshes

```javascript
import { EditableMesh } from '../EditableMesh.js';
import { addMesh } from '../scene/index.js';

// Create mesh
const mesh = new EditableMesh({
  name: 'Cube',
  type: 'cube',
  geometry: { width: 1, height: 1, depth: 1 }
});

// Add mesh to scene
const added = addMesh(mesh);

if (added) {
  console.log('Mesh added:', mesh.id);
}
```

### Managing Meshes

```javascript
import { getAllMeshes, getMesh, removeMesh, hasMesh } from '../scene/index.js';

// Get all meshes in scene
const meshes = getAllMeshes();

// Get specific mesh
const mesh = getMesh('mesh-1');

// Remove mesh
const removed = removeMesh('mesh-1');

// Check if mesh exists
const exists = hasMesh('mesh-1');
```

### Mesh Hierarchy

```javascript
import { setParent, getChildren, getParent, removeParent } from '../scene/index.js';

// Set parent-child relationships
setParent('child-mesh', 'parent-mesh');

// Get children
const children = getChildren('parent-mesh');

// Get parent
const parent = getParent('child-mesh');

// Remove parent
removeParent('child-mesh');
```

### Mesh Transformations

```javascript
import { EditableMesh } from '../EditableMesh.js';
import { setPosition, setRotation, setScale, getTransform } from '../scene/index.js';

// Set mesh position
setPosition(mesh, 1, 2, 3);

// Set mesh rotation
setRotation(mesh, 0, Math.PI / 2, 0);

// Set mesh scale
setScale(mesh, 2, 2, 2);

// Get mesh transform
const transform = getTransform(mesh);
```

## Scene Utilities

### Bounds Calculation

```javascript
import { SceneUtils } from '../scene/SceneUtils.js';
import { calculateBounds } from '../scene/index.js';

// Calculate bounds for all meshes
const bounds = calculateBounds(getAllMeshes());

console.log('Scene bounds:', bounds);
// Output: { min: { x: -1, y: -1, z: -1 }, max: { x: 1, y: 1, z: 1 } }
```

### Center Calculation

```javascript
import { SceneUtils } from '../scene/SceneUtils.js';
import { calculateCenter } from '../scene/index.js';

// Calculate scene center
const center = calculateCenter(getAllMeshes());

console.log('Scene center:', center);
// Output: { x: 0, y: 0, z: 0 }
```

### Statistics

```javascript
import { SceneUtils } from '../scene/SceneUtils.js';
import { getStatistics } from '../scene/index.js';

// Get scene statistics
const stats = getStatistics(scene);

console.log('Scene statistics:', stats);
// Output: {
//   meshCount: 5,
//   vertexCount: 1000,
//   faceCount: 500,
//   memoryUsage: '2.5MB',
//   bounds: { min: {...}, max: {...} }
// }
```

### Optimization

```javascript
import { SceneUtils } from '../scene/SceneUtils.js';
import { optimizeScene } from '../scene/index.js';

// Optimize scene
const optimization = optimizeScene(scene, {
  mergeVertices: true,
  removeUnused: true,
  simplifyGeometry: true
});

console.log('Optimization results:', optimization);
// Output: {
//   verticesRemoved: 100,
//   facesRemoved: 50,
//   memorySaved: '0.5MB'
// }
```

## Scene Operations

### Duplicating Meshes

```javascript
import { duplicateMesh } from '../scene/index.js';

// Duplicate single mesh
const duplicatedMesh = duplicateMesh(mesh, {
  name: 'Cube_Copy',
  offset: { x: 2, y: 0, z: 0 }
});

// Duplicate multiple meshes
const duplicatedMeshes = duplicateMeshes(meshes, {
  offset: { x: 0, y: 2, z: 0 }
});
```

### Grouping Meshes

```javascript
import { groupMeshes, ungroupMesh } from '../scene/index.js';

// Group selected meshes
const groupedMesh = groupMeshes(meshes, {
  name: 'Group',
  keepOriginals: false
});

// Ungroup mesh
const ungroupedMeshes = ungroupMesh(groupedMesh);
```

### Aligning Meshes

```javascript
import { alignMeshes } from '../scene/index.js';

// Align meshes to center
alignMeshes(meshes, 'center');

// Align meshes to bounds
alignMeshes(meshes, 'bounds');

// Align meshes to specific axis
alignMeshes(meshes, 'x-axis');
```

### Distributing Meshes

```javascript
import { distributeMeshes, arrangeMeshes } from '../scene/index.js';

// Distribute meshes evenly
distributeMeshes(meshes, {
  axis: 'x',
  spacing: 2
});

// Arrange meshes in grid
arrangeMeshes(meshes, {
  rows: 3,
  columns: 3,
  spacing: 2
});
```

## Scene Validation

### Scene Validation

```javascript
import { SceneValidator } from '../scene/SceneValidator.js';
import { validateScene } from '../scene/index.js';

// Validate entire scene
const validation = validateScene(scene);

if (validation.isValid) {
  console.log('Scene is valid');
} else {
  console.log('Scene validation errors:', validation.errors);
}
```

### Mesh Validation

```javascript
import { SceneValidator } from '../scene/SceneValidator.js';
import { validateMesh } from '../scene/index.js';

// Validate specific mesh
const meshValidation = validateMesh(mesh);

if (meshValidation.isValid) {
  console.log('Mesh is valid');
} else {
  console.log('Mesh validation errors:', meshValidation.errors);
}
```

### Performance Validation

```javascript
import { SceneValidator } from '../scene/SceneValidator.js';
import { validatePerformance } from '../scene/index.js';

// Check scene performance
const performance = validatePerformance(scene, {
  maxVertices: 10000,
  maxFaces: 5000,
  maxMeshes: 100
});

if (performance.isValid) {
  console.log('Scene meets performance requirements');
} else {
  console.log('Performance issues:', performance.issues);
}
```

## Scene Serialization

### JSON Serialization

```javascript
import { SceneSerializer } from '../scene/SceneSerializer.js';
import { serializeScene, deserializeScene } from '../scene/index.js';

// Serialize scene to JSON
const json = serializeScene(scene);

// Save to file
const fs = require('fs');
fs.writeFileSync('scene.json', json);

// Deserialize from JSON
const loadedScene = deserializeScene(json);
```

### GLTF Export

```javascript
import { SceneSerializer } from '../scene/SceneSerializer.js';
import { exportToGLTF } from '../scene/index.js';

// Export scene to GLTF
const gltf = exportToGLTF(scene, {
  binary: false,
  embedTextures: true,
  embedBuffers: true
});

// Save GLTF file
fs.writeFileSync('scene.gltf', JSON.stringify(gltf, null, 2));
```

### OBJ Export

```javascript
import { SceneSerializer } from '../scene/SceneSerializer.js';
import { exportToOBJ } from '../scene/index.js';

// Export scene to OBJ
const obj = exportToOBJ(scene, {
  includeMaterials: true,
  includeNormals: true,
  includeUVs: true
});

// Save OBJ file
fs.writeFileSync('scene.obj', obj);
```

## Usage Examples

### Complete Scene Workflow

```javascript
import { createScene } from '../scene/index.js';
import { EditableMesh } from '../EditableMesh.js';

// Create scene manager
const sceneManager = createScene({
  maxScenes: 10,
  autoSave: true
});

// Create scene
const scene = sceneManager.addScene('MyScene', {
  description: 'A test scene with multiple objects'
});

// Create and add meshes
const cube = new EditableMesh({
  name: 'Cube',
  type: 'cube',
  geometry: { width: 1, height: 1, depth: 1 }
});

const sphere = new EditableMesh({
  name: 'Sphere',
  type: 'sphere',
  geometry: { radius: 0.5, segments: 32 }
});

scene.addMesh(cube);
scene.addMesh(sphere);

// Set up hierarchy
scene.setParent(sphere.id, cube.id);

// Transform meshes
cube.setPosition(0, 0, 0);
sphere.setPosition(2, 0, 0);

// Get scene statistics
const stats = scene.getStatistics();
console.log('Scene stats:', stats);

// Validate scene
const validation = scene.validate();
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}

// Export scene
const json = scene.serialize();
console.log('Scene exported:', json);
```

### Scene with Materials and Textures

```javascript
import { MaterialManager } from '../materials/index.js';
import { exportToGLTF } from '../scene/index.js';

// Create material manager
const materialManager = new MaterialManager();

// Create materials
const metalMaterial = materialManager.createMaterial('metal', {
  color: { r: 0.8, g: 0.8, b: 0.8 },
  roughness: 0.2,
  metallic: 1.0
});

const plasticMaterial = materialManager.createMaterial('plastic', {
  color: { r: 0.2, g: 0.8, b: 0.2 },
  roughness: 0.8,
  metallic: 0.0
});

// Create meshes with materials
const metalCube = new EditableMesh({
  name: 'MetalCube',
  type: 'cube',
  geometry: { width: 1, height: 1, depth: 1 },
  material: metalMaterial
});

const plasticSphere = new EditableMesh({
  name: 'PlasticSphere',
  type: 'sphere',
  geometry: { radius: 0.5, segments: 32 },
  material: plasticMaterial
});

// Add to scene
scene.addMesh(metalCube);
scene.addMesh(plasticSphere);

// Export with materials
const gltf = exportToGLTF(scene, {
  embedMaterials: true,
  embedTextures: true
});
```

### Scene Optimization

```javascript
import { SceneUtils } from '../scene/SceneUtils.js';
import { optimizeScene } from '../scene/index.js';

// Create complex scene
const scene = createComplexScene();

// Analyze scene before optimization
const beforeStats = SceneUtils.getStatistics(scene);
console.log('Before optimization:', beforeStats);

// Optimize scene
const optimization = optimizeScene(scene, {
  mergeVertices: true,
  removeUnused: true,
  simplifyGeometry: true,
  mergeMaterials: true
});

// Analyze scene after optimization
const afterStats = SceneUtils.getStatistics(scene);
console.log('After optimization:', afterStats);
console.log('Optimization results:', optimization);
```

## API Reference

### SceneManager

#### Constructor

```javascript
new SceneManager(options)
```

**Parameters:**
- `options` (Object, optional)
  - `maxScenes` (number): Maximum scenes allowed (default: 10)
  - `autoSave` (boolean): Auto-save scenes (default: false)
  - `validation` (boolean): Enable validation (default: true)

#### Methods

##### `addScene(name, options)`
Add a new scene.

**Parameters:**
- `name` (string): Scene name
- `options` (Object, optional): Scene options

**Returns:** Scene - Created scene

##### `getScene(id)`
Get a scene by ID.

**Parameters:**
- `id` (string): Scene ID

**Returns:** Scene - Scene or null

##### `getAllScenes()`
Get all scenes.

**Returns:** Array<Scene> - All scenes

##### `removeScene(id)`
Remove a scene.

**Parameters:**
- `id` (string): Scene ID

**Returns:** boolean - Success status

### Scene

#### Constructor

```javascript
new Scene(name, options)
```

**Parameters:**
- `name` (string): Scene name
- `options` (Object, optional): Scene options

#### Methods

##### `addMesh(mesh)`
Add a mesh to the scene.

**Parameters:**
- `mesh` (EditableMesh): Mesh to add

**Returns:** boolean - Success status

##### `removeMesh(meshId)`
Remove a mesh from the scene.

**Parameters:**
- `meshId` (string): Mesh ID

**Returns:** boolean - Success status

##### `getMesh(meshId)`
Get a mesh by ID.

**Parameters:**
- `meshId` (string): Mesh ID

**Returns:** EditableMesh - Mesh or null

##### `getAllMeshes()`
Get all meshes in the scene.

**Returns:** Array<EditableMesh> - All meshes

##### `setParent(childId, parentId)`
Set parent-child relationship.

**Parameters:**
- `childId` (string): Child mesh ID
- `parentId` (string): Parent mesh ID

**Returns:** boolean - Success status

##### `getChildren(parentId)`
Get children of a mesh.

**Parameters:**
- `parentId` (string): Parent mesh ID

**Returns:** Array<EditableMesh> - Child meshes

##### `getParent(childId)`
Get parent of a mesh.

**Parameters:**
- `childId` (string): Child mesh ID

**Returns:** EditableMesh - Parent mesh or null

### SceneUtils

#### Methods

##### `calculateBounds(meshes)`
Calculate bounds for meshes.

**Parameters:**
- `meshes` (Array<EditableMesh>): Meshes to calculate bounds for

**Returns:** Object - Bounds object

##### `calculateCenter(meshes)`
Calculate center for meshes.

**Parameters:**
- `meshes` (Array<EditableMesh>): Meshes to calculate center for

**Returns:** Object - Center point

##### `getStatistics(scene)`
Get scene statistics.

**Parameters:**
- `scene` (Scene): Scene to analyze

**Returns:** Object - Scene statistics

##### `optimizeScene(scene, options)`
Optimize scene.

**Parameters:**
- `scene` (Scene): Scene to optimize
- `options` (Object, optional): Optimization options

**Returns:** Object - Optimization results

### SceneOperations

#### Methods

##### `duplicateMesh(mesh, options)`
Duplicate a mesh.

**Parameters:**
- `mesh` (EditableMesh): Mesh to duplicate
- `options` (Object, optional): Duplication options

**Returns:** EditableMesh - Duplicated mesh

##### `groupMeshes(meshes, options)`
Group multiple meshes.

**Parameters:**
- `meshes` (Array<EditableMesh>): Meshes to group
- `options` (Object, optional): Grouping options

**Returns:** EditableMesh - Grouped mesh

##### `alignMeshes(meshes, alignment)`
Align meshes.

**Parameters:**
- `meshes` (Array<EditableMesh>): Meshes to align
- `alignment` (string): Alignment type

**Returns:** boolean - Success status

##### `distributeMeshes(meshes, options)`
Distribute meshes evenly.

**Parameters:**
- `meshes` (Array<EditableMesh>): Meshes to distribute
- `options` (Object): Distribution options

**Returns:** boolean - Success status

### SceneValidator

#### Methods

##### `validateScene(scene)`
Validate a scene.

**Parameters:**
- `scene` (Scene): Scene to validate

**Returns:** Object - Validation result

##### `validateMesh(mesh)`
Validate a mesh.

**Parameters:**
- `mesh` (EditableMesh): Mesh to validate

**Returns:** Object - Validation result

##### `validatePerformance(scene, limits)`
Validate scene performance.

**Parameters:**
- `scene` (Scene): Scene to validate
- `limits` (Object): Performance limits

**Returns:** Object - Performance validation result

### SceneSerializer

#### Methods

##### `serializeScene(scene)`
Serialize a scene to JSON.

**Parameters:**
- `scene` (Scene): Scene to serialize

**Returns:** string - Serialized scene

##### `deserializeScene(data)`
Deserialize a scene from JSON.

**Parameters:**
- `data` (string): Serialized scene data

**Returns:** Scene - Deserialized scene

##### `exportToGLTF(scene, options)`
Export scene to GLTF format.

**Parameters:**
- `scene` (Scene): Scene to export
- `options` (Object, optional): Export options

**Returns:** Object - GLTF data

##### `exportToOBJ(scene, options)`
Export scene to OBJ format.

**Parameters:**
- `scene` (Scene): Scene to export
- `options` (Object, optional): Export options

**Returns:** string - OBJ data

## Best Practices

### 1. Scene Organization

```javascript
// Use descriptive scene names
const scene = createScene('Kitchen_Scene_v1.2', {
  description: 'Kitchen scene with appliances and furniture',
  metadata: { 
    version: '1.2',
    author: 'Designer Name',
    created: Date.now(),
    tags: ['kitchen', 'interior', 'furniture']
  }
});
```

### 2. Mesh Naming

```javascript
// Use consistent naming conventions
const mesh = new EditableMesh({
  name: 'Kitchen_Cabinet_Upper_01',
  type: 'cube',
  geometry: { width: 2, height: 0.8, depth: 0.6 }
});
```

### 3. Hierarchy Management

```javascript
// Organize meshes in logical hierarchy
setParent('Kitchen_Cabinet_Upper_01', 'Kitchen_Cabinets');
setParent('Kitchen_Cabinet_Upper_02', 'Kitchen_Cabinets');
setParent('Kitchen_Cabinet_Lower_01', 'Kitchen_Cabinets');
```

### 4. Performance Optimization

```javascript
// Regular scene optimization
const optimization = optimizeScene(scene, {
  mergeVertices: true,
  removeUnused: true,
  simplifyGeometry: true,
  mergeMaterials: true
});

// Monitor scene statistics
const stats = getStatistics(scene);
if (stats.meshCount > 100) {
  console.warn('Scene has many meshes, consider optimization');
}
```

### 5. Validation

```javascript
// Validate scenes before saving
const validation = validateScene(scene);
if (!validation.isValid) {
  console.error('Scene validation failed:', validation.errors);
  return;
}

// Check performance limits
const performance = validatePerformance(scene, {
  maxVertices: 10000,
  maxFaces: 5000,
  maxMeshes: 100
});
```

## Performance Considerations

### 1. Scene Size Limits

- **Vertices**: Keep under 10,000 per scene
- **Faces**: Keep under 5,000 per scene
- **Meshes**: Keep under 100 per scene
- **Materials**: Keep under 50 per scene

### 2. Optimization Strategies

```javascript
// Merge similar meshes
const mergedMesh = SceneOperations.mergeMeshes(similarMeshes);

// Simplify complex geometry
const simplifiedMesh = SceneOperations.simplifyMesh(complexMesh, {
  tolerance: 0.01
});

// Use LOD (Level of Detail)
const lodMesh = SceneOperations.createLOD(mesh, [
  { distance: 0, mesh: highDetailMesh },
  { distance: 10, mesh: mediumDetailMesh },
  { distance: 50, mesh: lowDetailMesh }
]);
```

### 3. Memory Management

```javascript
// Dispose unused resources
scene.disposeUnusedResources();

// Clear scene cache
sceneManager.clearCache();

// Monitor memory usage
const memoryUsage = SceneUtils.getMemoryUsage(scene);
console.log('Memory usage:', memoryUsage);
```

### 4. Loading and Saving

```javascript
// Use async loading for large scenes
const scene = await SceneSerializer.loadSceneAsync('large-scene.json');

// Use compression for scene files
const compressedScene = SceneSerializer.compressScene(scene);

// Use streaming for very large scenes
const stream = SceneSerializer.createSceneStream(scene);
```

## Troubleshooting

### Common Issues

1. **Scene too large**
   - Use optimization tools
   - Split into multiple scenes
   - Use LOD for distant objects

2. **Performance issues**
   - Check vertex/face counts
   - Optimize materials and textures
   - Use spatial indexing

3. **Memory leaks**
   - Dispose unused resources
   - Clear scene cache regularly
   - Monitor memory usage

4. **Export errors**
   - Validate scene before export
   - Check file permissions
   - Use appropriate export format

### Debug Tips

```javascript
// Enable debug logging
const sceneManager = createSceneManager({
  debug: true,
  logLevel: 'verbose'
});

// Get detailed scene information
const debugInfo = scene.getDebugInfo();
console.log('Debug info:', debugInfo);

// Profile scene operations
const profile = SceneUtils.profileScene(scene);
console.log('Performance profile:', profile);
``` 