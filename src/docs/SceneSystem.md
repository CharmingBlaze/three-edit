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

## Core Components

### SceneManager

The main scene management class that handles all scene operations.

```javascript
import { createSceneManager } from './scene/index.js';

const sceneManager = createSceneManager({
  maxScenes: 10,
  autoSave: true,
  validation: true
});
```

### Scene

Individual scene class with mesh management and hierarchy support.

```javascript
import { Scene } from './scene/SceneManager.js';

const scene = new Scene('MyScene', {
  description: 'A test scene',
  metadata: { version: '1.0' }
});
```

### SceneUtils

Utility functions for scene analysis and optimization.

```javascript
import { SceneUtils } from './scene/SceneUtils.js';

// Calculate scene bounds
const bounds = SceneUtils.calculateBounds(meshes);

// Get scene statistics
const stats = SceneUtils.getStatistics(scene);
```

### SceneOperations

Scene operation functions for common tasks.

```javascript
import { SceneOperations } from './scene/SceneOperations.js';

// Duplicate mesh
const duplicatedMesh = SceneOperations.duplicateMesh(mesh);

// Group meshes
const groupedMesh = SceneOperations.groupMeshes(meshes);
```

### SceneValidator

Scene and mesh validation functions.

```javascript
import { SceneValidator } from './scene/SceneValidator.js';

// Validate scene
const validation = SceneValidator.validateScene(scene);

// Validate mesh
const meshValidation = SceneValidator.validateMesh(mesh);
```

### SceneSerializer

Scene serialization and export functions.

```javascript
import { SceneSerializer } from './scene/SceneSerializer.js';

// Serialize to JSON
const json = SceneSerializer.serializeScene(scene);

// Export to GLTF
const gltf = SceneSerializer.exportToGLTF(scene);
```

## Scene Management

### Creating Scenes

```javascript
// Create scene manager
const sceneManager = createSceneManager({
  maxScenes: 10,
  autoSave: true,
  validation: true
});

// Create new scene
const scene = sceneManager.addScene('MyScene', {
  description: 'A test scene',
  metadata: { version: '1.0', author: 'User' }
});

console.log('Scene created:', scene.id);
```

### Managing Scenes

```javascript
// Get all scenes
const allScenes = sceneManager.getAllScenes();

// Get specific scene
const scene = sceneManager.getScene('scene-1');

// Remove scene
const removed = sceneManager.removeScene('scene-1');

// Check if scene exists
const exists = sceneManager.hasScene('scene-1');
```

### Scene Properties

```javascript
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
// Create mesh
const mesh = new EditableMesh({
  name: 'Cube',
  type: 'cube',
  geometry: { width: 1, height: 1, depth: 1 }
});

// Add mesh to scene
const added = scene.addMesh(mesh);

if (added) {
  console.log('Mesh added:', mesh.id);
}
```

### Managing Meshes

```javascript
// Get all meshes in scene
const meshes = scene.getAllMeshes();

// Get specific mesh
const mesh = scene.getMesh('mesh-1');

// Remove mesh
const removed = scene.removeMesh('mesh-1');

// Check if mesh exists
const exists = scene.hasMesh('mesh-1');
```

### Mesh Hierarchy

```javascript
// Set parent-child relationships
scene.setParent('child-mesh', 'parent-mesh');

// Get children
const children = scene.getChildren('parent-mesh');

// Get parent
const parent = scene.getParent('child-mesh');

// Remove parent
scene.removeParent('child-mesh');
```

### Mesh Transformations

```javascript
// Set mesh position
mesh.setPosition(1, 2, 3);

// Set mesh rotation
mesh.setRotation(0, Math.PI / 2, 0);

// Set mesh scale
mesh.setScale(2, 2, 2);

// Get mesh transform
const transform = mesh.getTransform();
```

## Scene Utilities

### Bounds Calculation

```javascript
import { SceneUtils } from './scene/SceneUtils.js';

// Calculate bounds for all meshes
const bounds = SceneUtils.calculateBounds(scene.getAllMeshes());

console.log('Scene bounds:', bounds);
// Output: { min: { x: -1, y: -1, z: -1 }, max: { x: 1, y: 1, z: 1 } }
```

### Center Calculation

```javascript
// Calculate scene center
const center = SceneUtils.calculateCenter(scene.getAllMeshes());

console.log('Scene center:', center);
// Output: { x: 0, y: 0, z: 0 }
```

### Statistics

```javascript
// Get scene statistics
const stats = SceneUtils.getStatistics(scene);

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
// Optimize scene
const optimization = SceneUtils.optimizeScene(scene, {
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
import { SceneOperations } from './scene/SceneOperations.js';

// Duplicate single mesh
const duplicatedMesh = SceneOperations.duplicateMesh(mesh, {
  name: 'Cube_Copy',
  offset: { x: 2, y: 0, z: 0 }
});

// Duplicate multiple meshes
const duplicatedMeshes = SceneOperations.duplicateMeshes(meshes, {
  offset: { x: 0, y: 2, z: 0 }
});
```

### Grouping Meshes

```javascript
// Group selected meshes
const groupedMesh = SceneOperations.groupMeshes(meshes, {
  name: 'Group',
  keepOriginals: false
});

// Ungroup mesh
const ungroupedMeshes = SceneOperations.ungroupMesh(groupedMesh);
```

### Aligning Meshes

```javascript
// Align meshes to center
SceneOperations.alignMeshes(meshes, 'center');

// Align meshes to bounds
SceneOperations.alignMeshes(meshes, 'bounds');

// Align meshes to specific axis
SceneOperations.alignMeshes(meshes, 'x-axis');
```

### Distributing Meshes

```javascript
// Distribute meshes evenly
SceneOperations.distributeMeshes(meshes, {
  axis: 'x',
  spacing: 2
});

// Arrange meshes in grid
SceneOperations.arrangeMeshes(meshes, {
  rows: 3,
  columns: 3,
  spacing: 2
});
```

## Scene Validation

### Scene Validation

```javascript
import { SceneValidator } from './scene/SceneValidator.js';

// Validate entire scene
const validation = SceneValidator.validateScene(scene);

if (validation.isValid) {
  console.log('Scene is valid');
} else {
  console.log('Scene validation errors:', validation.errors);
}
```

### Mesh Validation

```javascript
// Validate specific mesh
const meshValidation = SceneValidator.validateMesh(mesh);

if (meshValidation.isValid) {
  console.log('Mesh is valid');
} else {
  console.log('Mesh validation errors:', meshValidation.errors);
}
```

### Performance Validation

```javascript
// Check scene performance
const performance = SceneValidator.validatePerformance(scene, {
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
import { SceneSerializer } from './scene/SceneSerializer.js';

// Serialize scene to JSON
const json = SceneSerializer.serializeScene(scene);

// Save to file
const fs = require('fs');
fs.writeFileSync('scene.json', json);

// Deserialize from JSON
const loadedScene = SceneSerializer.deserializeScene(json);
```

### GLTF Export

```javascript
// Export scene to GLTF
const gltf = SceneSerializer.exportToGLTF(scene, {
  binary: false,
  embedTextures: true,
  embedBuffers: true
});

// Save GLTF file
fs.writeFileSync('scene.gltf', JSON.stringify(gltf, null, 2));
```

### OBJ Export

```javascript
// Export scene to OBJ
const obj = SceneSerializer.exportToOBJ(scene, {
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
import { createSceneManager } from './scene/index.js';
import { EditableMesh } from '../EditableMesh.js';

// Create scene manager
const sceneManager = createSceneManager({
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
const gltf = SceneSerializer.exportToGLTF(scene, {
  embedMaterials: true,
  embedTextures: true
});
```

### Scene Optimization

```javascript
import { SceneUtils } from './scene/SceneUtils.js';

// Create complex scene
const scene = createComplexScene();

// Analyze scene before optimization
const beforeStats = SceneUtils.getStatistics(scene);
console.log('Before optimization:', beforeStats);

// Optimize scene
const optimization = SceneUtils.optimizeScene(scene, {
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
const scene = sceneManager.addScene('Kitchen_Scene_v1.2', {
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
scene.setParent('Kitchen_Cabinet_Upper_01', 'Kitchen_Cabinets');
scene.setParent('Kitchen_Cabinet_Upper_02', 'Kitchen_Cabinets');
scene.setParent('Kitchen_Cabinet_Lower_01', 'Kitchen_Cabinets');
```

### 4. Performance Optimization

```javascript
// Regular scene optimization
const optimization = SceneUtils.optimizeScene(scene, {
  mergeVertices: true,
  removeUnused: true,
  simplifyGeometry: true,
  mergeMaterials: true
});

// Monitor scene statistics
const stats = SceneUtils.getStatistics(scene);
if (stats.meshCount > 100) {
  console.warn('Scene has many meshes, consider optimization');
}
```

### 5. Validation

```javascript
// Validate scenes before saving
const validation = SceneValidator.validateScene(scene);
if (!validation.isValid) {
  console.error('Scene validation failed:', validation.errors);
  return;
}

// Check performance limits
const performance = SceneValidator.validatePerformance(scene, {
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