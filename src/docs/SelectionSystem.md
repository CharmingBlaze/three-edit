# Selection System Documentation

## Overview

The Selection System provides comprehensive object and mesh selection capabilities for the 3D editor. It supports multiple selection types, visualization, and advanced selection methods.

## Table of Contents

1. [Core Components](#core-components)
2. [Selection Types](#selection-types)
3. [Selection Modes](#selection-modes)
4. [Usage Examples](#usage-examples)
5. [API Reference](#api-reference)
6. [Best Practices](#best-practices)
7. [Performance Considerations](#performance-considerations)

## Core Components

### SelectionManager

The main selection management class that handles all selection operations.

```javascript
import { createSelectionManager } from './selection/index.js';

const selectionManager = createSelectionManager({
  multiSelect: true,
  autoHighlight: true,
  maxSelections: 1000
});
```

### ObjectSelector

Handles object-specific selection operations like raycasting and area selection.

```javascript
import { ObjectSelector } from './selection/ObjectSelector.js';

// Select object by raycasting
const selectedObject = ObjectSelector.selectByRay(ray, objects);
```

### MeshSelector

Handles mesh-specific selection operations for vertices, edges, and faces.

```javascript
import { MeshSelector } from './selection/MeshSelector.js';

// Select vertices by raycasting
const selectedVertices = MeshSelector.selectVerticesByRay(ray, mesh);
```

### SelectionVisualizer

Creates visual representations for selections and transform gizmos.

```javascript
import { SelectionVisualizer } from './selection/SelectionVisualizer.js';

// Create highlight material
const highlightMaterial = SelectionVisualizer.createHighlightMaterial({
  color: { r: 1, g: 1, b: 0 },
  opacity: 0.8
});
```

## Selection Types

### Object Selection

Select entire 3D objects with transforms and properties.

```javascript
// Add object selection
selectionManager.addSelection('object', 'cube-1', {
  name: 'Cube',
  transform: { position: { x: 0, y: 0, z: 0 } }
});

// Check if object is selected
const isSelected = selectionManager.isSelected('object', 'cube-1');

// Get all selected objects
const selectedObjects = selectionManager.getSelectionsByType('object');
```

### Mesh Selection

Select mesh geometry for editing operations.

```javascript
// Add mesh selection
selectionManager.addSelection('mesh', 'mesh-1', {
  name: 'MyMesh',
  vertexCount: 100,
  faceCount: 50
});
```

### Vertex Selection

Select individual mesh vertices for detailed editing.

```javascript
// Add vertex selection
selectionManager.addSelection('vertex', 'vertex-1', {
  position: { x: 1, y: 2, z: 3 },
  meshId: 'mesh-1'
});

// Select multiple vertices
const vertexIds = ['vertex-1', 'vertex-2', 'vertex-3'];
vertexIds.forEach(id => {
  selectionManager.addSelection('vertex', id);
});
```

### Edge Selection

Select mesh edges for modeling operations.

```javascript
// Add edge selection
selectionManager.addSelection('edge', 'edge-1', {
  vertexIds: ['vertex-1', 'vertex-2'],
  meshId: 'mesh-1'
});
```

### Face Selection

Select mesh faces for material and texture work.

```javascript
// Add face selection
selectionManager.addSelection('face', 'face-1', {
  vertexIds: ['vertex-1', 'vertex-2', 'vertex-3'],
  meshId: 'mesh-1',
  material: 'material-1'
});
```

## Selection Modes

### Object Mode

Select entire objects with full transform support.

```javascript
selectionManager.setSelectionMode('object');

// Object selection supports:
// - Transform operations (move, rotate, scale)
// - Material assignment
// - Visibility toggle
// - Duplication
```

### Vertex Mode

Select individual vertices for precise editing.

```javascript
selectionManager.setSelectionMode('vertex');

// Vertex selection supports:
// - Move vertices
// - Merge vertices
// - Split vertices
// - Vertex weight painting
```

### Edge Mode

Select mesh edges for modeling operations.

```javascript
selectionManager.setSelectionMode('edge');

// Edge selection supports:
// - Extrude edges
// - Bevel edges
// - Split edges
// - Edge loops
```

### Face Mode

Select mesh faces for material and texture work.

```javascript
selectionManager.setSelectionMode('face');

// Face selection supports:
// - Extrude faces
// - Bevel faces
// - Material assignment
// - UV mapping
```

## Usage Examples

### Basic Selection

```javascript
import { createSelectionManager, SelectionTypes } from './selection/index.js';

// Create selection manager
const selectionManager = createSelectionManager({
  multiSelect: true,
  autoHighlight: true
});

// Set selection mode
selectionManager.setSelectionMode('object');

// Add selections
selectionManager.addSelection('object', 'cube-1', { name: 'Cube' });
selectionManager.addSelection('object', 'sphere-1', { name: 'Sphere' });

// Get all selections
const allSelections = selectionManager.getAllSelections();
console.log(`Selected ${allSelections.length} items`);

// Clear selections
selectionManager.clearSelection();
```

### Raycasting Selection

```javascript
import { ObjectSelector } from './selection/ObjectSelector.js';

// Create ray for mouse position
const ray = {
  origin: { x: 0, y: 0, z: 0 },
  direction: { x: 0, y: 0, z: -1 }
};

// Select object by raycasting
const selectedObject = ObjectSelector.selectByRay(ray, objects, {
  includeChildren: true,
  maxDistance: 100
});

if (selectedObject) {
  selectionManager.addSelection('object', selectedObject.id);
}
```

### Area Selection

```javascript
import { ObjectSelector } from './selection/ObjectSelector.js';

// Rectangle bounds
const bounds = {
  min: { x: 100, y: 100 },
  max: { x: 300, y: 300 }
};

// Select objects in rectangle
const selectedObjects = ObjectSelector.selectByRectangle(bounds, objects, {
  partial: true
});

// Add all selected objects to selection manager
selectedObjects.forEach(obj => {
  selectionManager.addSelection('object', obj.id);
});
```

### Mesh Selection

```javascript
import { MeshSelector } from './selection/MeshSelector.js';

// Select vertices by raycasting
const selectedVertices = MeshSelector.selectVerticesByRay(ray, mesh, {
  threshold: 0.1,
  selectNearest: true
});

// Add vertex selections
selectedVertices.forEach(vertexId => {
  selectionManager.addSelection('vertex', vertexId, {
    meshId: mesh.id
  });
});

// Select faces by rectangle
const selectedFaces = MeshSelector.selectFacesByRectangle(bounds, mesh, camera);

selectedFaces.forEach(faceId => {
  selectionManager.addSelection('face', faceId, {
    meshId: mesh.id
  });
});
```

### Selection Visualization

```javascript
import { SelectionVisualizer } from './selection/SelectionVisualizer.js';

// Create highlight material
const highlightMaterial = SelectionVisualizer.createHighlightMaterial({
  color: { r: 1, g: 1, b: 0 },
  opacity: 0.8,
  wireframe: false
});

// Create selection box
const bounds = { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } };
const selectionBox = SelectionVisualizer.createSelectionBoxGeometry(bounds, {
  thickness: 0.01
});

// Create transform gizmo
const gizmo = SelectionVisualizer.createTransformGizmoGeometry(position, {
  mode: 'translate',
  size: 1.0
});
```

### Event Handling

```javascript
// Listen for selection events
selectionManager.addEventListener('selectionAdded', (data) => {
  console.log('Selection added:', data.item);
  updateVisualization(data.item);
});

selectionManager.addEventListener('selectionRemoved', (data) => {
  console.log('Selection removed:', data.item);
  removeVisualization(data.item);
});

selectionManager.addEventListener('selectionModeChanged', (data) => {
  console.log('Mode changed from', data.previousMode, 'to', data.currentMode);
  updateUI(data.currentMode);
});
```

## API Reference

### SelectionManager

#### Constructor Options

```javascript
{
  multiSelect: boolean,        // Enable multi-selection (default: true)
  autoHighlight: boolean,      // Auto-highlight selections (default: true)
  maxSelections: number        // Maximum selections allowed (default: 1000)
}
```

#### Methods

- `setSelectionMode(mode)` - Set selection mode
- `getSelectionMode()` - Get current selection mode
- `addSelection(type, id, data, options)` - Add selection
- `removeSelection(type, id)` - Remove selection
- `isSelected(type, id)` - Check if item is selected
- `getSelection(type, id)` - Get selection item
- `getAllSelections()` - Get all selections
- `getSelectionsByType(type)` - Get selections by type
- `clearSelection()` - Clear all selections
- `toggleSelection(type, id, data, options)` - Toggle selection

### ObjectSelector

#### Methods

- `selectByRay(ray, objects, options)` - Select by raycasting
- `selectByRectangle(bounds, objects, options)` - Select by rectangle
- `selectByLasso(points, objects, options)` - Select by lasso
- `selectByName(pattern, objects)` - Select by name pattern
- `selectByType(type, objects)` - Select by type
- `selectByMaterial(materialId, objects)` - Select by material
- `selectByLayer(layer, objects)` - Select by layer

### MeshSelector

#### Methods

- `selectVerticesByRay(ray, mesh, options)` - Select vertices by ray
- `selectEdgesByRay(ray, mesh, options)` - Select edges by ray
- `selectFacesByRay(ray, mesh, options)` - Select faces by ray
- `selectVerticesByRectangle(bounds, mesh, camera)` - Select vertices by rectangle
- `selectEdgesByRectangle(bounds, mesh, camera)` - Select edges by rectangle
- `selectFacesByRectangle(bounds, mesh, camera)` - Select faces by rectangle

### SelectionVisualizer

#### Methods

- `createHighlightMaterial(options)` - Create highlight material
- `createVertexHighlightGeometry(vertices, options)` - Create vertex highlight geometry
- `createEdgeHighlightGeometry(edges, vertices, options)` - Create edge highlight geometry
- `createFaceHighlightGeometry(faces, vertices, options)` - Create face highlight geometry
- `createSelectionBoxGeometry(bounds, options)` - Create selection box
- `createTransformGizmoGeometry(position, options)` - Create transform gizmo

## Best Practices

### 1. Selection Mode Management

```javascript
// Always set the appropriate selection mode before operations
selectionManager.setSelectionMode('vertex');

// Check current mode before performing operations
if (selectionManager.getSelectionMode() === 'vertex') {
  // Perform vertex-specific operations
}
```

### 2. Event Handling

```javascript
// Use event listeners for UI updates
selectionManager.addEventListener('selectionChanged', updateUI);
selectionManager.addEventListener('selectionModeChanged', updateToolbar);

// Clean up listeners when done
const listener = (data) => console.log(data);
selectionManager.addEventListener('selectionAdded', listener);
// Later...
selectionManager.removeEventListener('selectionAdded', listener);
```

### 3. Performance Optimization

```javascript
// Use appropriate thresholds for raycasting
const options = {
  threshold: 0.1,        // Smaller for precise selection
  maxDistance: 100,      // Limit ray distance
  selectNearest: true    // Only select closest item
};

// Batch selection operations
const itemsToSelect = ['item1', 'item2', 'item3'];
selectionManager.selectMultiple(itemsToSelect.map(id => ({
  type: 'object',
  id,
  data: { name: `Item ${id}` }
})));
```

### 4. Visualization

```javascript
// Create reusable visualization materials
const vertexHighlightMaterial = SelectionVisualizer.createHighlightMaterial({
  color: { r: 1, g: 0, b: 0 },
  opacity: 0.8
});

const edgeHighlightMaterial = SelectionVisualizer.createHighlightMaterial({
  color: { r: 0, g: 1, b: 0 },
  opacity: 0.6
});

// Use appropriate gizmo for transform mode
const gizmo = SelectionVisualizer.createTransformGizmoGeometry(position, {
  mode: transformMode, // 'translate', 'rotate', 'scale'
  size: 1.0
});
```

## Performance Considerations

### 1. Selection Limits

- Set appropriate `maxSelections` to prevent memory issues
- Use `selectNearest: true` for raycasting to limit results
- Implement spatial indexing for large scenes

### 2. Raycasting Optimization

```javascript
// Use bounding box checks before detailed raycasting
const bounds = ObjectSelector.getObjectBounds(object);
if (ObjectSelector.raycastObject(ray, bounds) !== null) {
  // Perform detailed raycasting
}
```

### 3. Visualization Performance

```javascript
// Use instanced rendering for multiple selections
const geometry = SelectionVisualizer.createVertexHighlightGeometry(vertices, {
  size: 0.05
});

// Batch material updates
const materials = selections.map(selection => 
  SelectionVisualizer.createHighlightMaterial({
    color: getSelectionColor(selection.type)
  })
);
```

### 4. Memory Management

```javascript
// Clear selections when switching modes
selectionManager.setSelectionMode('object');
selectionManager.clearSelection();

// Remove event listeners
selectionManager.removeEventListener('selectionAdded', listener);

// Dispose of visualization objects
visualizationObjects.forEach(obj => obj.dispose());
```

## Troubleshooting

### Common Issues

1. **Selections not appearing**
   - Check if selection mode is correct
   - Verify event listeners are attached
   - Ensure visualization is enabled

2. **Performance issues**
   - Reduce `maxSelections` limit
   - Use spatial indexing for large scenes
   - Implement selection culling

3. **Raycasting not working**
   - Check ray direction is normalized
   - Verify object bounds are correct
   - Adjust threshold values

### Debug Tips

```javascript
// Enable debug logging
const selectionManager = createSelectionManager({
  debug: true
});

// Log selection statistics
console.log(selectionManager.getStatistics());

// Check selection history
console.log(selectionManager.getHistory());
``` 