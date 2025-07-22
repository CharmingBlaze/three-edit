# API Documentation

## Table of Contents

1. [Selection System](#selection-system)
2. [Scene System](#scene-system)
3. [Events System](#events-system)
4. [Materials System](#materials-system)
5. [UV System](#uv-system)
6. [Undo/Redo System](#undoredo-system)
7. [Utils System](#utils-system)

## Selection System

### SelectionManager

The main selection management class.

#### Constructor

```javascript
new SelectionManager(options)
```

**Parameters:**
- `options` (Object, optional)
  - `multiSelect` (boolean): Enable multi-selection (default: true)
  - `autoHighlight` (boolean): Auto-highlight selections (default: true)
  - `maxSelections` (number): Maximum selections allowed (default: 1000)

#### Methods

##### `setSelectionMode(mode)`
Set the current selection mode.

**Parameters:**
- `mode` (string): Selection mode ('object', 'vertex', 'edge', 'face', 'mesh')

**Returns:** boolean - Success status

##### `getSelectionMode()`
Get the current selection mode.

**Returns:** string - Current selection mode

##### `addSelection(type, id, data, options)`
Add a selection item.

**Parameters:**
- `type` (string): Selection type
- `id` (string): Element ID
- `data` (Object, optional): Additional data
- `options` (Object, optional): Selection options

**Returns:** SelectionItem - Created selection item or null

##### `removeSelection(type, id)`
Remove a selection item.

**Parameters:**
- `type` (string): Selection type
- `id` (string): Element ID

**Returns:** boolean - Success status

##### `isSelected(type, id)`
Check if an item is selected.

**Parameters:**
- `type` (string): Selection type
- `id` (string): Element ID

**Returns:** boolean - True if selected

##### `getSelection(type, id)`
Get a selection item.

**Parameters:**
- `type` (string): Selection type
- `id` (string): Element ID

**Returns:** SelectionItem - Selection item or null

##### `getAllSelections()`
Get all selection items.

**Returns:** Array<SelectionItem> - All selections

##### `getSelectionsByType(type)`
Get selections by type.

**Parameters:**
- `type` (string): Selection type

**Returns:** Array<SelectionItem> - Selections of specified type

##### `clearSelection()`
Clear all selections.

##### `toggleSelection(type, id, data, options)`
Toggle a selection.

**Parameters:**
- `type` (string): Selection type
- `id` (string): Element ID
- `data` (Object, optional): Additional data
- `options` (Object, optional): Selection options

**Returns:** boolean - True if added, false if removed

##### `getStatistics()`
Get selection statistics.

**Returns:** Object - Selection statistics

### ObjectSelector

Object selection utilities.

#### Methods

##### `selectByRay(ray, objects, options)`
Select objects by raycasting.

**Parameters:**
- `ray` (Object): Ray object {origin: {x,y,z}, direction: {x,y,z}}
- `objects` (Array): Array of selectable objects
- `options` (Object, optional): Selection options

**Returns:** Object - Selected object or null

##### `selectByRectangle(bounds, objects, options)`
Select objects in rectangle.

**Parameters:**
- `bounds` (Object): Rectangle bounds
- `objects` (Array): Array of selectable objects
- `options` (Object, optional): Selection options

**Returns:** Array - Selected objects

##### `selectByLasso(points, objects, options)`
Select objects in lasso.

**Parameters:**
- `points` (Array): Lasso points
- `objects` (Array): Array of selectable objects
- `options` (Object, optional): Selection options

**Returns:** Array - Selected objects

##### `selectByName(pattern, objects)`
Select objects by name pattern.

**Parameters:**
- `pattern` (string): Name pattern (supports wildcards)
- `objects` (Array): Array of selectable objects

**Returns:** Array - Selected objects

##### `selectByType(type, objects)`
Select objects by type.

**Parameters:**
- `type` (string): Object type
- `objects` (Array): Array of selectable objects

**Returns:** Array - Selected objects

### MeshSelector

Mesh selection utilities.

#### Methods

##### `selectVerticesByRay(ray, mesh, options)`
Select mesh vertices by raycasting.

**Parameters:**
- `ray` (Object): Ray object
- `mesh` (EditableMesh): Target mesh
- `options` (Object, optional): Selection options

**Returns:** Array - Selected vertex IDs

##### `selectEdgesByRay(ray, mesh, options)`
Select mesh edges by raycasting.

**Parameters:**
- `ray` (Object): Ray object
- `mesh` (EditableMesh): Target mesh
- `options` (Object, optional): Selection options

**Returns:** Array - Selected edge IDs

##### `selectFacesByRay(ray, mesh, options)`
Select mesh faces by raycasting.

**Parameters:**
- `ray` (Object): Ray object
- `mesh` (EditableMesh): Target mesh
- `options` (Object, optional): Selection options

**Returns:** Array - Selected face IDs

### SelectionVisualizer

Selection visualization utilities.

#### Methods

##### `createHighlightMaterial(options)`
Create highlight material.

**Parameters:**
- `options` (Object, optional): Material options

**Returns:** Object - Highlight material

##### `createVertexHighlightGeometry(vertices, options)`
Create vertex highlight geometry.

**Parameters:**
- `vertices` (Array): Vertex positions
- `options` (Object, optional): Geometry options

**Returns:** Object - Vertex highlight geometry

##### `createSelectionBoxGeometry(bounds, options)`
Create selection box geometry.

**Parameters:**
- `bounds` (Object): Selection bounds
- `options` (Object, optional): Box options

**Returns:** Object - Selection box geometry

##### `createTransformGizmoGeometry(position, options)`
Create transform gizmo geometry.

**Parameters:**
- `position` (Object): Gizmo position
- `options` (Object, optional): Gizmo options

**Returns:** Object - Transform gizmo geometry

## Scene System

### SceneManager

Scene management class.

#### Constructor

```javascript
new SceneManager(options)
```

**Parameters:**
- `options` (Object, optional): Configuration options

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

Scene class.

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

### SceneUtils

Scene utility functions.

#### Methods

##### `calculateBounds(meshes)`
Calculate scene bounds.

**Parameters:**
- `meshes` (Array<EditableMesh>): Meshes to calculate bounds for

**Returns:** Object - Bounds object

##### `calculateCenter(meshes)`
Calculate scene center.

**Parameters:**
- `meshes` (Array<EditableMesh>): Meshes to calculate center for

**Returns:** Object - Center point

##### `getStatistics(scene)`
Get scene statistics.

**Parameters:**
- `scene` (Scene): Scene to analyze

**Returns:** Object - Scene statistics

### SceneOperations

Scene operation functions.

#### Methods

##### `duplicateMesh(mesh)`
Duplicate a mesh.

**Parameters:**
- `mesh` (EditableMesh): Mesh to duplicate

**Returns:** EditableMesh - Duplicated mesh

##### `groupMeshes(meshes)`
Group multiple meshes.

**Parameters:**
- `meshes` (Array<EditableMesh>): Meshes to group

**Returns:** EditableMesh - Grouped mesh

##### `alignMeshes(meshes, alignment)`
Align meshes.

**Parameters:**
- `meshes` (Array<EditableMesh>): Meshes to align
- `alignment` (string): Alignment type

**Returns:** boolean - Success status

### SceneValidator

Scene validation functions.

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

### SceneSerializer

Scene serialization functions.

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

##### `exportToGLTF(scene)`
Export scene to GLTF format.

**Parameters:**
- `scene` (Scene): Scene to export

**Returns:** Object - GLTF data

## Events System

### EventManager

Event management class.

#### Constructor

```javascript
new EventManager(options)
```

**Parameters:**
- `options` (Object, optional): Configuration options

#### Methods

##### `addEventListener(event, callback)`
Add an event listener.

**Parameters:**
- `event` (string): Event name
- `callback` (Function): Callback function

##### `removeEventListener(event, callback)`
Remove an event listener.

**Parameters:**
- `event` (string): Event name
- `callback` (Function): Callback function

##### `emit(event, data)`
Emit an event.

**Parameters:**
- `event` (string): Event name
- `data` (Object): Event data

##### `getEventHistory()`
Get event history.

**Returns:** Array - Event history

### EventTypes

Event type constants.

#### Properties

- `APPLICATION_STARTED`
- `APPLICATION_STOPPED`
- `SCENE_CREATED`
- `SCENE_DELETED`
- `MESH_ADDED`
- `MESH_REMOVED`
- `SELECTION_CHANGED`
- `TRANSFORM_CHANGED`
- `MATERIAL_CHANGED`
- `CAMERA_MOVED`
- `RENDERER_UPDATED`
- `FILE_LOADED`
- `FILE_SAVED`
- `HISTORY_CHANGED`
- `PLUGIN_LOADED`

## Materials System

### MaterialManager

Material management class.

#### Constructor

```javascript
new MaterialManager(options)
```

**Parameters:**
- `options` (Object, optional): Configuration options

#### Methods

##### `createMaterial(type, properties)`
Create a new material.

**Parameters:**
- `type` (string): Material type
- `properties` (Object): Material properties

**Returns:** Material - Created material

##### `getMaterial(id)`
Get a material by ID.

**Parameters:**
- `id` (string): Material ID

**Returns:** Material - Material or null

##### `updateMaterial(id, properties)`
Update a material.

**Parameters:**
- `id` (string): Material ID
- `properties` (Object): New properties

**Returns:** boolean - Success status

##### `deleteMaterial(id)`
Delete a material.

**Parameters:**
- `id` (string): Material ID

**Returns:** boolean - Success status

### Material

Material class.

#### Properties

- `id` (string): Material ID
- `name` (string): Material name
- `type` (string): Material type
- `properties` (Object): Material properties

#### Methods

##### `clone()`
Clone the material.

**Returns:** Material - Cloned material

##### `toThreeJS()`
Convert to Three.js material.

**Returns:** Object - Three.js material

## UV System

### UVManager

UV management class.

#### Constructor

```javascript
new UVManager(options)
```

**Parameters:**
- `options` (Object, optional): Configuration options

#### Methods

##### `createUVMapping(type, parameters)`
Create UV mapping.

**Parameters:**
- `type` (string): Mapping type
- `parameters` (Object): Mapping parameters

**Returns:** UV - Created UV mapping

##### `getUVMapping(id)`
Get UV mapping by ID.

**Parameters:**
- `id` (string): UV mapping ID

**Returns:** UV - UV mapping or null

##### `updateUVMapping(id, parameters)`
Update UV mapping.

**Parameters:**
- `id` (string): UV mapping ID
- `parameters` (Object): New parameters

**Returns:** boolean - Success status

### UV

UV coordinate class.

#### Properties

- `u` (number): U coordinate
- `v` (number): V coordinate

#### Methods

##### `clone()`
Clone the UV coordinate.

**Returns:** UV - Cloned UV coordinate

##### `validate()`
Validate the UV coordinate.

**Returns:** Object - Validation result

## Undo/Redo System

### HistoryManager

History management class.

#### Constructor

```javascript
new HistoryManager(options)
```

**Parameters:**
- `options` (Object, optional): Configuration options

#### Methods

##### `addOperation(operation)`
Add an operation to history.

**Parameters:**
- `operation` (Object): Operation to add

##### `undo()`
Undo the last operation.

**Returns:** boolean - Success status

##### `redo()`
Redo the last undone operation.

**Returns:** boolean - Success status

##### `canUndo()`
Check if undo is possible.

**Returns:** boolean - True if undo is possible

##### `canRedo()`
Check if redo is possible.

**Returns:** boolean - True if redo is possible

##### `clearHistory()`
Clear all history.

##### `getHistory()`
Get operation history.

**Returns:** Array - Operation history

## Utils System

### MathUtils

Mathematical utility functions.

#### Methods

##### `addVectors(a, b)`
Add two vectors.

**Parameters:**
- `a` (Object): First vector
- `b` (Object): Second vector

**Returns:** Object - Result vector

##### `subtractVectors(a, b)`
Subtract two vectors.

**Parameters:**
- `a` (Object): First vector
- `b` (Object): Second vector

**Returns:** Object - Result vector

##### `multiplyVector(vector, scalar)`
Multiply vector by scalar.

**Parameters:**
- `vector` (Object): Vector
- `scalar` (number): Scalar value

**Returns:** Object - Result vector

##### `normalizeVector(vector)`
Normalize a vector.

**Parameters:**
- `vector` (Object): Vector to normalize

**Returns:** Object - Normalized vector

##### `calculateDistance(a, b)`
Calculate distance between two points.

**Parameters:**
- `a` (Object): First point
- `b` (Object): Second point

**Returns:** number - Distance

##### `interpolate(a, b, t)`
Interpolate between two values.

**Parameters:**
- `a` (number): First value
- `b` (number): Second value
- `t` (number): Interpolation factor (0-1)

**Returns:** number - Interpolated value

### ValidationUtils

Validation utility functions.

#### Methods

##### `validateNumber(value, min, max)`
Validate a number.

**Parameters:**
- `value` (number): Value to validate
- `min` (number, optional): Minimum value
- `max` (number, optional): Maximum value

**Returns:** Object - Validation result

##### `validateVector(vector)`
Validate a vector.

**Parameters:**
- `vector` (Object): Vector to validate

**Returns:** Object - Validation result

##### `validateColor(color)`
Validate a color.

**Parameters:**
- `color` (Object): Color to validate

**Returns:** Object - Validation result

##### `validateString(value, minLength, maxLength)`
Validate a string.

**Parameters:**
- `value` (string): String to validate
- `minLength` (number, optional): Minimum length
- `maxLength` (number, optional): Maximum length

**Returns:** Object - Validation result

##### `validateArray(array, minLength, maxLength)`
Validate an array.

**Parameters:**
- `array` (Array): Array to validate
- `minLength` (number, optional): Minimum length
- `maxLength` (number, optional): Maximum length

**Returns:** Object - Validation result

##### `validateObject(obj, requiredKeys)`
Validate an object.

**Parameters:**
- `obj` (Object): Object to validate
- `requiredKeys` (Array, optional): Required keys

**Returns:** Object - Validation result

### Common Utils

Common utility functions.

#### Methods

##### `deepClone(obj)`
Deep clone an object.

**Parameters:**
- `obj` (Object): Object to clone

**Returns:** Object - Cloned object

##### `mergeObjects(target, source)`
Merge two objects.

**Parameters:**
- `target` (Object): Target object
- `source` (Object): Source object

**Returns:** Object - Merged object

##### `debounce(func, delay)`
Debounce a function.

**Parameters:**
- `func` (Function): Function to debounce
- `delay` (number): Delay in milliseconds

**Returns:** Function - Debounced function

##### `throttle(func, delay)`
Throttle a function.

**Parameters:**
- `func` (Function): Function to throttle
- `delay` (number): Delay in milliseconds

**Returns:** Function - Throttled function

##### `formatBytes(bytes)`
Format bytes to human readable string.

**Parameters:**
- `bytes` (number): Bytes to format

**Returns:** string - Formatted string

##### `formatDuration(ms)`
Format milliseconds to human readable string.

**Parameters:**
- `ms` (number): Milliseconds to format

**Returns:** string - Formatted string

## Factory Functions

### Selection System

```javascript
import { createSelectionManager, createTypedSelectionManager } from './selection/index.js';

// Create selection manager
const selectionManager = createSelectionManager({
  multiSelect: true,
  autoHighlight: true
});

// Create typed selection manager
const objectSelector = createTypedSelectionManager('object', {
  multiSelect: true
});
```

### Scene System

```javascript
import { createSceneManager } from './scene/index.js';

// Create scene manager
const sceneManager = createSceneManager({
  maxScenes: 10
});
```

### Events System

```javascript
import { createEventManager } from './events/index.js';

// Create event manager
const eventManager = createEventManager({
  maxHistory: 100
});
```

### Materials System

```javascript
import { createMaterialManager } from './materials/index.js';

// Create material manager
const materialManager = createMaterialManager({
  maxMaterials: 50
});
```

### UV System

```javascript
import { createUVManager } from './uv/index.js';

// Create UV manager
const uvManager = createUVManager({
  maxMappings: 20
});
```

### Undo/Redo System

```javascript
import { createHistoryManager } from './undoRedo/index.js';

// Create history manager
const historyManager = createHistoryManager({
  maxOperations: 100
});
```

## Error Handling

All functions that can fail return appropriate error information:

```javascript
// Example error handling
try {
  const result = someFunction(params);
  if (result.success) {
    // Handle success
  } else {
    console.error('Error:', result.error);
  }
} catch (error) {
  console.error('Exception:', error.message);
}
```

## Performance Considerations

- Use appropriate thresholds for raycasting
- Implement spatial indexing for large scenes
- Batch operations when possible
- Use object pooling for frequently created objects
- Implement lazy evaluation for expensive operations

## Browser Compatibility

The library is designed to work with modern browsers that support:
- ES6 modules
- Classes
- Arrow functions
- Template literals
- Destructuring assignment
- Spread/rest operators

## TypeScript Support

All modules include JSDoc comments for TypeScript support. The library can be used with TypeScript by importing the modules directly. 