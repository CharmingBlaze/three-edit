# Editing System Documentation

## Overview

The Editing System provides comprehensive editing capabilities for the 3D editor. It handles all editing operations, tools, history management, and provides a modular architecture with focused components.

## Table of Contents

1. [Core Components](#core-components)
2. [Edit Management](#edit-management)
3. [Edit Operations](#edit-operations)
4. [Edit Tools](#edit-tools)
5. [Edit History](#edit-history)
6. [Usage Examples](#usage-examples)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)
9. [Performance Considerations](#performance-considerations)

## Core Components

### EditManager

The main editing management class that coordinates all editing operations.

```javascript
import { createEditManager } from './editing/index.js';

const editManager = createEditManager({
  autoSave: true,
  validation: true,
  maxHistory: 100,
  defaultMode: 'object'
});
```

### EditOperations

Specific editing operations for creating, modifying, and manipulating objects.

```javascript
import { EditOperations } from './editing/EditOperations.js';

// Create new object
const object = EditOperations.createObject({
  name: 'Cube',
  type: 'mesh'
}, {
  type: 'mesh',
  position: { x: 0, y: 0, z: 0 }
});
```

### EditTools

Interactive editing tools for specific operations.

```javascript
import { createSelectTool, createMoveTool } from './editing/index.js';

const selectTool = createSelectTool({
  mode: 'object',
  multiSelect: true
});

const moveTool = createMoveTool({
  space: 'world',
  snap: true,
  snapDistance: 0.1
});
```

### EditHistory

History management for undo/redo functionality.

```javascript
import { createEditHistory } from './editing/index.js';

const editHistory = createEditHistory({
  maxEntries: 100,
  autoSave: true,
  compression: false
});
```

## Edit Management

### Creating Edit Manager

```javascript
// Create edit manager
const editManager = createEditManager({
  autoSave: true,
  validation: true,
  maxHistory: 100,
  defaultMode: 'object'
});

// Start editing session
editManager.startEdit('object', {
  selectionMode: 'single',
  transformSpace: 'world'
});

// Add operation to current edit
editManager.addOperation('create', {
  type: 'mesh',
  position: { x: 1, y: 2, z: 3 }
});

// End editing session
const result = editManager.endEdit(true);
console.log('Edit result:', result);
```

### Managing Edit Sessions

```javascript
// Check if currently editing
if (editManager.isCurrentlyEditing()) {
  console.log('Currently in edit mode');
}

// Get current edit mode
const currentMode = editManager.getEditMode();
console.log('Current mode:', currentMode);

// Set edit mode
editManager.setEditMode('vertex');

// Get edit statistics
const stats = editManager.getEditStatistics();
console.log('Edit stats:', stats);
```

### Object Selection

```javascript
// Select objects
editManager.selectObjects([object1, object2], {
  clear: true,
  add: false
});

// Deselect objects
editManager.deselectObjects([object1]);

// Clear all selections
editManager.clearSelection();

// Get selected objects
const selected = editManager.getSelectedObjects();
console.log('Selected objects:', selected);

// Get selection count
const count = editManager.getSelectionCount();
console.log('Selection count:', count);
```

## Edit Operations

### Creating Objects

```javascript
import { createObject } from './editing/index.js';

// Create basic object
const object = createObject({
  name: 'MyCube',
  type: 'mesh',
  geometry: { type: 'box', width: 1, height: 1, depth: 1 }
}, {
  type: 'mesh',
  position: { x: 0, y: 0, z: 0 }
});

// Create object with material
const objectWithMaterial = createObject({
  name: 'Sphere',
  type: 'mesh',
  geometry: { type: 'sphere', radius: 0.5 },
  material: { type: 'standard', color: '#ff0000' }
}, {
  type: 'mesh',
  position: { x: 2, y: 0, z: 0 }
});
```

### Deleting Objects

```javascript
import { deleteObjects } from './editing/index.js';

// Delete objects
const deletedObjects = deleteObjects([object1, object2], {
  permanent: false,
  backup: true
});

console.log('Deleted objects:', deletedObjects);
```

### Duplicating Objects

```javascript
import { duplicateObjects } from './editing/index.js';

// Duplicate objects
const duplicatedObjects = duplicateObjects([object1, object2], {
  offset: { x: 2, y: 0, z: 0 },
  inheritTransform: true
});

console.log('Duplicated objects:', duplicatedObjects);
```

### Grouping Objects

```javascript
import { groupObjects, ungroupObjects } from './editing/index.js';

// Group objects
const group = groupObjects([object1, object2, object3], {
  name: 'MyGroup',
  keepOriginals: false
});

console.log('Created group:', group);

// Ungroup objects
const ungroupedObjects = ungroupObjects([group], {
  preserveTransform: true
});

console.log('Ungrouped objects:', ungroupedObjects);
```

### Aligning Objects

```javascript
import { alignObjects } from './editing/index.js';

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
import { distributeObjects } from './editing/index.js';

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

### Mirroring Objects

```javascript
import { mirrorObjects } from './editing/index.js';

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

### Array Operations

```javascript
import { arrayObjects } from './editing/index.js';

// Create linear array
const linearArray = arrayObjects(objects, {
  count: 5,
  offset: { x: 2, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 }
});

// Create radial array
const radialArray = arrayObjects(objects, {
  count: 8,
  offset: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: Math.PI / 4, z: 0 },
  scale: { x: 0.9, y: 0.9, z: 0.9 }
});
```

### Extrusion Operations

```javascript
import { extrudeObjects } from './editing/index.js';

// Extrude objects
const extrudedObjects = extrudeObjects(objects, {
  distance: 2.0,
  direction: { x: 0, y: 1, z: 0 }
});

// Extrude with custom direction
const customExtruded = extrudeObjects(objects, {
  distance: 1.5,
  direction: { x: 1, y: 0, z: 1 }
});
```

### Bevel Operations

```javascript
import { bevelObjects } from './editing/index.js';

// Bevel objects
const beveledObjects = bevelObjects(objects, {
  amount: 0.1,
  segments: 3,
  mode: 'edge'
});

// Bevel with custom settings
const customBeveled = bevelObjects(objects, {
  amount: 0.2,
  segments: 5,
  mode: 'vertex'
});
```

### Boolean Operations

```javascript
import { booleanOperation } from './editing/index.js';

// Union operation
const unionResult = booleanOperation([object1, object2], {
  operation: 'union',
  keepOriginal: false
});

// Difference operation
const differenceResult = booleanOperation([object1, object2], {
  operation: 'difference',
  keepOriginal: true
});

// Intersection operation
const intersectionResult = booleanOperation([object1, object2], {
  operation: 'intersection',
  keepOriginal: false
});
```

## Edit Tools

### Select Tool

```javascript
import { createSelectTool } from './editing/index.js';

// Create select tool
const selectTool = createSelectTool({
  mode: 'object',
  multiSelect: true,
  bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 10, y: 10, z: 10 } }
});

// Activate tool
selectTool.activate();

// Select object
selectTool.select(object1);

// Get selected objects
const selected = selectTool.getSelectedObjects();
console.log('Selected:', selected);

// Deactivate tool
selectTool.deactivate();
```

### Move Tool

```javascript
import { createMoveTool } from './editing/index.js';

// Create move tool
const moveTool = createMoveTool({
  space: 'world',
  snap: true,
  snapDistance: 0.1
});

// Activate tool
moveTool.activate();

// Start drag
moveTool.startDrag({ x: 0, y: 0, z: 0 });

// Update drag
moveTool.updateDrag({ x: 1, y: 2, z: 3 });

// End drag and get delta
const delta = moveTool.endDrag();
console.log('Move delta:', delta);
```

### Rotate Tool

```javascript
import { createRotateTool } from './editing/index.js';

// Create rotate tool
const rotateTool = createRotateTool({
  space: 'local',
  center: { x: 0, y: 0, z: 0 },
  snap: true,
  snapAngle: 15
});

// Activate tool
rotateTool.activate();

// Start rotation
rotateTool.startDrag({ x: 1, y: 0, z: 0 });

// Update rotation
rotateTool.updateDrag({ x: 0, y: 1, z: 0 });

// End rotation and get angle
const rotation = rotateTool.endDrag();
console.log('Rotation:', rotation);
```

### Scale Tool

```javascript
import { createScaleTool } from './editing/index.js';

// Create scale tool
const scaleTool = createScaleTool({
  mode: 'uniform',
  center: { x: 0, y: 0, z: 0 },
  snap: true,
  snapScale: 0.1
});

// Activate tool
scaleTool.activate();

// Start scaling
scaleTool.startDrag({ x: 1, y: 0, z: 0 });

// Update scaling
scaleTool.updateDrag({ x: 2, y: 0, z: 0 });

// End scaling and get scale
const scale = scaleTool.endDrag();
console.log('Scale:', scale);
```

### Extrude Tool

```javascript
import { createExtrudeTool } from './editing/index.js';

// Create extrude tool
const extrudeTool = createExtrudeTool({
  distance: 1.0,
  direction: { x: 0, y: 1, z: 0 },
  cap: true
});

// Activate tool
extrudeTool.activate();

// Extrude faces
const result = extrudeTool.extrude(faces);
console.log('Extrusion result:', result);
```

### Bevel Tool

```javascript
import { createBevelTool } from './editing/index.js';

// Create bevel tool
const bevelTool = createBevelTool({
  amount: 0.1,
  segments: 3,
  mode: 'edge'
});

// Activate tool
bevelTool.activate();

// Bevel elements
const result = bevelTool.bevel(elements);
console.log('Bevel result:', result);
```

### Boolean Tool

```javascript
import { createBooleanTool } from './editing/index.js';

// Create boolean tool
const booleanTool = createBooleanTool({
  operation: 'union',
  keepOriginal: false
});

// Activate tool
booleanTool.activate();

// Perform boolean operation
const result = booleanTool.performBoolean([object1, object2]);
console.log('Boolean result:', result);
```

### Array Tool

```javascript
import { createArrayTool } from './editing/index.js';

// Create array tool
const arrayTool = createArrayTool({
  count: 5,
  offset: { x: 2, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 }
});

// Activate tool
arrayTool.activate();

// Create array
const result = arrayTool.createArray(objects);
console.log('Array result:', result);
```

### Mirror Tool

```javascript
import { createMirrorTool } from './editing/index.js';

// Create mirror tool
const mirrorTool = createMirrorTool({
  axis: 'x',
  center: { x: 0, y: 0, z: 0 },
  duplicate: true
});

// Activate tool
mirrorTool.activate();

// Mirror objects
const result = mirrorTool.mirror(objects);
console.log('Mirror result:', result);
```

## Edit History

### Creating Edit History

```javascript
import { createEditHistory } from './editing/index.js';

// Create edit history
const editHistory = createEditHistory({
  maxEntries: 100,
  autoSave: true,
  compression: false
});

// Add entry to history
editHistory.addEntry({
  type: 'create',
  data: { object: newObject },
  description: 'Created new cube'
});
```

### Undo/Redo Operations

```javascript
// Check if undo is available
if (editHistory.canUndo()) {
  // Undo last action
  const undoneEntry = editHistory.undo();
  console.log('Undone:', undoneEntry);
}

// Check if redo is available
if (editHistory.canRedo()) {
  // Redo last undone action
  const redoneEntry = editHistory.redo();
  console.log('Redone:', redoneEntry);
}
```

### History Management

```javascript
// Get all entries
const allEntries = editHistory.getAllEntries();

// Get entries by type
const createEntries = editHistory.getEntriesByType('create');

// Get entries in range
const rangeEntries = editHistory.getEntriesInRange(0, 10);

// Search entries
const searchResults = editHistory.searchEntries({
  type: 'create',
  description: 'cube'
});

// Get history statistics
const stats = editHistory.getStatistics();
console.log('History stats:', stats);
```

### Export/Import History

```javascript
// Export history
const exportData = editHistory.exportHistory({
  includeMetadata: true,
  compress: false
});

// Import history
const importSuccess = editHistory.importHistory(exportData, {
  clearExisting: true,
  validate: true
});
```

## Usage Examples

### Complete Editing Workflow

```javascript
import { 
  createEditManager, 
  createEditHistory,
  createObject,
  duplicateObjects,
  alignObjects,
  groupObjects 
} from './editing/index.js';

// Create managers
const editManager = createEditManager({
  autoSave: true,
  validation: true
});

const editHistory = createEditHistory({
  maxEntries: 100
});

// Start editing session
editManager.startEdit('object');

// Create objects
const cube1 = createObject({
  name: 'Cube1',
  type: 'mesh'
}, {
  type: 'mesh',
  position: { x: 0, y: 0, z: 0 }
});

const cube2 = createObject({
  name: 'Cube2',
  type: 'mesh'
}, {
  type: 'mesh',
  position: { x: 2, y: 0, z: 0 }
});

// Add to history
editHistory.addEntry({
  type: 'create',
  data: { objects: [cube1, cube2] },
  description: 'Created two cubes'
});

// Duplicate objects
const duplicated = duplicateObjects([cube1, cube2], {
  offset: { x: 0, y: 2, z: 0 }
});

// Align objects
const aligned = alignObjects([...duplicated], { x: 0, y: 0, z: 0 }, {
  axis: 'x',
  mode: 'center'
});

// Group objects
const group = groupObjects(aligned, {
  name: 'CubeGroup'
});

// Add to history
editHistory.addEntry({
  type: 'group',
  data: { group, objects: aligned },
  description: 'Grouped aligned cubes'
});

// End editing session
const result = editManager.endEdit(true);
console.log('Edit workflow completed:', result);
```

### Interactive Tool Usage

```javascript
import { 
  createSelectTool,
  createMoveTool,
  createRotateTool 
} from './editing/index.js';

// Create tools
const selectTool = createSelectTool({
  mode: 'object',
  multiSelect: true
});

const moveTool = createMoveTool({
  space: 'world',
  snap: true
});

const rotateTool = createRotateTool({
  space: 'local',
  snap: true,
  snapAngle: 15
});

// Tool interaction workflow
function handleToolInteraction(tool, event) {
  switch (tool.type) {
    case 'select':
      if (event.type === 'click') {
        const object = getObjectAtPoint(event.point);
        if (object) {
          tool.select(object);
        }
      }
      break;
      
    case 'move':
      if (event.type === 'mousedown') {
        tool.startDrag(event.point);
      } else if (event.type === 'mousemove') {
        tool.updateDrag(event.point);
      } else if (event.type === 'mouseup') {
        const delta = tool.endDrag();
        applyMoveToSelected(delta);
      }
      break;
      
    case 'rotate':
      if (event.type === 'mousedown') {
        tool.startDrag(event.point);
      } else if (event.type === 'mousemove') {
        tool.updateDrag(event.point);
      } else if (event.type === 'mouseup') {
        const rotation = tool.endDrag();
        applyRotationToSelected(rotation);
      }
      break;
  }
}
```

### Advanced Editing Operations

```javascript
import { 
  extrudeObjects,
  bevelObjects,
  booleanOperation,
  arrayObjects,
  mirrorObjects 
} from './editing/index.js';

// Extrude selected faces
const extrudedFaces = extrudeObjects(selectedFaces, {
  distance: 1.0,
  direction: { x: 0, y: 1, z: 0 }
});

// Bevel selected edges
const beveledEdges = bevelObjects(selectedEdges, {
  amount: 0.1,
  segments: 3,
  mode: 'edge'
});

// Boolean operation
const booleanResult = booleanOperation([object1, object2], {
  operation: 'union',
  keepOriginal: false
});

// Create array
const arrayResult = arrayObjects(selectedObjects, {
  count: 5,
  offset: { x: 2, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 0.9, y: 0.9, z: 0.9 }
});

// Mirror objects
const mirrorResult = mirrorObjects(selectedObjects, {
  axis: 'x',
  center: { x: 0, y: 0, z: 0 },
  duplicate: true
});
```

## API Reference

### EditManager

#### Constructor

```javascript
new EditManager(options)
```

**Parameters:**
- `options` (Object, optional)
  - `autoSave` (boolean): Auto-save edits (default: true)
  - `validation` (boolean): Enable validation (default: true)
  - `maxHistory` (number): Maximum history size (default: 100)
  - `defaultMode` (string): Default edit mode (default: 'object')

#### Methods

##### `startEdit(mode, options)`
Start editing session.

**Parameters:**
- `mode` (string): Edit mode
- `options` (Object, optional): Edit options

**Returns:** boolean - Success status

##### `endEdit(commit)`
End editing session.

**Parameters:**
- `commit` (boolean): Whether to commit changes

**Returns:** Object - Edit result

##### `addOperation(type, data, options)`
Add operation to current edit.

**Parameters:**
- `type` (string): Operation type
- `data` (Object): Operation data
- `options` (Object, optional): Operation options

**Returns:** boolean - Success status

### EditOperations

#### Methods

##### `createObject(data, options)`
Create new object.

**Parameters:**
- `data` (Object): Object data
- `options` (Object, optional): Creation options

**Returns:** Object - Created object

##### `deleteObjects(objects, options)`
Delete objects.

**Parameters:**
- `objects` (Array): Objects to delete
- `options` (Object, optional): Deletion options

**Returns:** Array - Deleted objects

##### `duplicateObjects(objects, options)`
Duplicate objects.

**Parameters:**
- `objects` (Array): Objects to duplicate
- `options` (Object, optional): Duplication options

**Returns:** Array - Duplicated objects

### EditTools

#### Methods

##### `createSelectTool(options)`
Create select tool.

**Parameters:**
- `options` (Object, optional): Tool options

**Returns:** Object - Select tool instance

##### `createMoveTool(options)`
Create move tool.

**Parameters:**
- `options` (Object, optional): Tool options

**Returns:** Object - Move tool instance

### EditHistory

#### Constructor

```javascript
new EditHistory(options)
```

**Parameters:**
- `options` (Object, optional): Configuration options

#### Methods

##### `addEntry(entry)`
Add entry to history.

**Parameters:**
- `entry` (Object): History entry

**Returns:** boolean - Success status

##### `undo()`
Undo last action.

**Returns:** Object|null - Undone entry or null

##### `redo()`
Redo last undone action.

**Returns:** Object|null - Redone entry or null

## Best Practices

### 1. Edit Session Management

```javascript
// Always start and end edit sessions properly
const editManager = createEditManager();

try {
  editManager.startEdit('object');
  
  // Perform operations
  editManager.addOperation('create', { object: newObject });
  editManager.addOperation('modify', { object: modifiedObject });
  
  // Commit changes
  editManager.endEdit(true);
} catch (error) {
  // Cancel changes on error
  editManager.endEdit(false);
  console.error('Edit failed:', error);
}
```

### 2. Tool State Management

```javascript
// Properly manage tool states
const tool = createMoveTool();

tool.activate();

// Always deactivate tools when done
try {
  // Use tool
  tool.startDrag(point);
  tool.updateDrag(newPoint);
  const delta = tool.endDrag();
} finally {
  tool.deactivate();
}
```

### 3. History Management

```javascript
// Use history for undo/redo
const editHistory = createEditHistory();

// Add meaningful entries
editHistory.addEntry({
  type: 'create',
  data: { object: newObject },
  description: 'Created new cube at position (1, 2, 3)'
});

// Check before undo/redo
if (editHistory.canUndo()) {
  const undone = editHistory.undo();
  console.log('Undone:', undone.description);
}
```

### 4. Validation

```javascript
// Validate operations before execution
import { validateEditOperation, validateToolOptions } from './editing/index.js';

const operation = {
  type: 'create',
  data: { object: newObject }
};

const validation = validateEditOperation(operation);
if (!validation.isValid) {
  console.error('Operation validation failed:', validation.errors);
  return;
}

// Validate tool options
const toolOptions = { count: 5, distance: 1.0 };
const toolValidation = validateToolOptions(toolOptions);
if (!toolValidation.isValid) {
  console.error('Tool validation failed:', toolValidation.errors);
  return;
}
```

## Performance Considerations

### 1. Batch Operations

```javascript
// Use batch operations for multiple objects
const objects = [obj1, obj2, obj3, obj4, obj5];

// Instead of individual operations
objects.forEach(obj => deleteObject(obj));

// Use batch operation
deleteObjects(objects, { batch: true });
```

### 2. History Optimization

```javascript
// Use compression for large histories
const editHistory = createEditHistory({
  compression: true,
  maxEntries: 50 // Limit history size
});

// Clear old history periodically
if (editHistory.getStatistics().totalEntries > 100) {
  editHistory.clearHistory();
}
```

### 3. Tool Performance

```javascript
// Deactivate unused tools
const tools = [selectTool, moveTool, rotateTool];

function activateTool(toolType) {
  tools.forEach(tool => {
    if (tool.type === toolType) {
      tool.activate();
    } else {
      tool.deactivate();
    }
  });
}
```

### 4. Memory Management

```javascript
// Clean up large objects
function cleanupEditSession() {
  // Clear selections
  editManager.clearSelection();
  
  // Clear history if too large
  if (editHistory.getStatistics().totalEntries > 100) {
    editHistory.clearHistory();
  }
  
  // Deactivate all tools
  tools.forEach(tool => tool.deactivate());
}
```

## Troubleshooting

### Common Issues

1. **Edit session not starting**
   - Check if already in edit mode
   - Verify edit mode is valid
   - Check validation settings

2. **Tools not responding**
   - Ensure tool is activated
   - Check tool state
   - Verify event handling

3. **History not working**
   - Check history size limits
   - Verify entry validation
   - Check compression settings

4. **Performance issues**
   - Use batch operations
   - Limit history size
   - Deactivate unused tools

### Debug Tips

```javascript
// Enable debug logging
const editManager = createEditManager({
  debug: true,
  logLevel: 'verbose'
});

// Get detailed statistics
const stats = editManager.getEditStatistics();
console.log('Edit stats:', stats);

// Validate all operations
const operations = editManager.getCurrentEdit().operations;
operations.forEach(op => {
  const validation = validateEditOperation(op);
  if (!validation.isValid) {
    console.error('Invalid operation:', validation.errors);
  }
});
``` 