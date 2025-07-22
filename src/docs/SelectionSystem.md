# Selection System Documentation

## Overview

The Selection System provides comprehensive selection management capabilities for vertices, edges, faces, and objects in the 3D editor. It supports multiple selection modes, raycasting, and visual feedback.

## Table of Contents

1. [Core Components](#core-components)
2. [Selection Modes](#selection-modes)
3. [Selection Operations](#selection-operations)
4. [Raycasting](#raycasting)
5. [Visual Feedback](#visual-feedback)
6. [Selection Utilities](#selection-utilities)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)
9. [Performance Considerations](#performance-considerations)
10. [Migration Guide](#migration-guide)

## Core Components (New Modular Style)

All selection operations are now pure functions, imported directly from their respective files or group index files:

```javascript
import { 
  setSelectionMode, 
  addSelection, 
  removeSelection, 
  isSelected, 
  getAllSelections,
  getSelectionsByType,
  clearSelection,
  toggleSelection
} from '../selection/index.js';
```

**Example Usage:**
```javascript
import { setSelectionMode, addSelection } from '../selection/index.js';

setSelectionMode('vertex');
addSelection('vertex', 'v1');
```

## Selection Modes

### Available Modes

The selection system supports four main modes:

- **'vertex'**: Select individual vertices
- **'edge'**: Select edges (connections between vertices)
- **'face'**: Select triangular faces
- **'object'**: Select entire mesh objects

### Setting Selection Mode

```javascript
import { setSelectionMode, getSelectionMode } from '../selection/index.js';

// Set selection mode
setSelectionMode('vertex');

// Get current selection mode
const currentMode = getSelectionMode();
console.log('Current selection mode:', currentMode);
```

## Selection Operations

### Adding Selections

```javascript
import { addSelection } from '../selection/index.js';

// Add single selection
addSelection('vertex', 'v1');

// Add multiple selections
addSelection('vertex', 'v2');
addSelection('vertex', 'v3');
addSelection('edge', 'e1');
addSelection('face', 'f1');
```

### Removing Selections

```javascript
import { removeSelection } from '../selection/index.js';

// Remove single selection
removeSelection('vertex', 'v1');

// Remove multiple selections
removeSelection('edge', 'e1');
removeSelection('face', 'f1');
```

### Checking Selections

```javascript
import { isSelected, getSelection } from '../selection/index.js';

// Check if item is selected
if (isSelected('vertex', 'v1')) {
  console.log('Vertex v1 is selected');
}

// Get selection data
const selection = getSelection('vertex', 'v1');
if (selection) {
  console.log('Selection data:', selection);
}
```

### Getting All Selections

```javascript
import { getAllSelections, getSelectionsByType } from '../selection/index.js';

// Get all selections
const allSelections = getAllSelections();
console.log('All selections:', allSelections);

// Get selections by type
const vertexSelections = getSelectionsByType('vertex');
const edgeSelections = getSelectionsByType('edge');
const faceSelections = getSelectionsByType('face');
const objectSelections = getSelectionsByType('object');

console.log('Vertex selections:', vertexSelections);
console.log('Edge selections:', edgeSelections);
console.log('Face selections:', faceSelections);
console.log('Object selections:', objectSelections);
```

### Clearing Selections

```javascript
import { clearSelection } from '../selection/index.js';

// Clear all selections
clearSelection();

// Clear selections by type
clearSelection('vertex');
clearSelection('edge');
clearSelection('face');
clearSelection('object');
```

### Toggling Selections

```javascript
import { toggleSelection } from '../selection/index.js';

// Toggle selection
const wasAdded = toggleSelection('vertex', 'v1');
if (wasAdded) {
  console.log('Vertex v1 was added to selection');
} else {
  console.log('Vertex v1 was removed from selection');
}
```

## Raycasting

### Vertex Raycasting

```javascript
import { selectVerticesByRay } from '../selection/raycasting/vertexRaycaster.js';

const ray = {
  origin: { x: 0, y: 0, z: 0 },
  direction: { x: 0, y: 0, z: 1 }
};

const selectedVertices = selectVerticesByRay(ray, mesh, {
  threshold: 0.1,
  maxDistance: 10
});

console.log('Selected vertices:', selectedVertices);
```

### Edge Raycasting

```javascript
import { selectEdgesByRay } from '../selection/raycasting/edgeRaycaster.js';

const ray = {
  origin: { x: 0, y: 0, z: 0 },
  direction: { x: 0, y: 0, z: 1 }
};

const selectedEdges = selectEdgesByRay(ray, mesh, {
  threshold: 0.1,
  maxDistance: 10
});

console.log('Selected edges:', selectedEdges);
```

### Object Raycasting

```javascript
import { selectByRay } from '../selection/ObjectSelector.js';

const ray = {
  origin: { x: 0, y: 0, z: 0 },
  direction: { x: 0, y: 0, z: 1 }
};

const selectedObject = selectByRay(ray, sceneObjects, {
  recursive: true,
  sort: true
});

if (selectedObject) {
  console.log('Selected object:', selectedObject);
}
```

## Visual Feedback

### Creating Highlight Materials

```javascript
import { createHighlightMaterial } from '../selection/SelectionVisualizer.js';

const highlightMaterial = createHighlightMaterial({
  color: 0x00ff00,
  opacity: 0.8,
  transparent: true
});
```

### Creating Selection Geometries

```javascript
import { 
  createVertexHighlightGeometry,
  createSelectionBoxGeometry,
  createTransformGizmoGeometry
} from '../selection/SelectionVisualizer.js';

// Vertex highlight geometry
const vertexGeometry = createVertexHighlightGeometry(vertexPositions, {
  size: 0.1,
  color: 0x00ff00
});

// Selection box geometry
const boxGeometry = createSelectionBoxGeometry(bounds, {
  color: 0x00ff00,
  lineWidth: 2
});

// Transform gizmo geometry
const gizmoGeometry = createTransformGizmoGeometry(position, {
  size: 1.0,
  showAxes: true
});
```

## Selection Utilities

### Rectangle Selection

```javascript
import { selectByRectangle } from '../selection/ObjectSelector.js';

const bounds = {
  min: { x: 0, y: 0 },
  max: { x: 100, y: 100 }
};

const selectedObjects = selectByRectangle(bounds, sceneObjects, {
  recursive: true
});

console.log('Objects in rectangle:', selectedObjects);
```

### Lasso Selection

```javascript
import { selectByLasso } from '../selection/ObjectSelector.js';

const lassoPoints = [
  { x: 0, y: 0 },
  { x: 50, y: 0 },
  { x: 50, y: 50 },
  { x: 0, y: 50 }
];

const selectedObjects = selectByLasso(lassoPoints, sceneObjects, {
  recursive: true
});

console.log('Objects in lasso:', selectedObjects);
```

### Name-based Selection

```javascript
import { selectByName, selectByType } from '../selection/ObjectSelector.js';

// Select by name pattern
const objectsByName = selectByName('Cube*', sceneObjects);
console.log('Objects matching pattern:', objectsByName);

// Select by type
const meshes = selectByType('Mesh', sceneObjects);
console.log('All meshes:', meshes);
```

## Usage Examples

### Basic Selection Workflow

```javascript
import { 
  setSelectionMode, 
  addSelection, 
  removeSelection, 
  clearSelection,
  getAllSelections 
} from '../selection/index.js';

// Set selection mode to vertices
setSelectionMode('vertex');

// Add some vertices to selection
addSelection('vertex', 'v1');
addSelection('vertex', 'v2');
addSelection('vertex', 'v3');

// Check what's selected
const selections = getAllSelections();
console.log('Current selections:', selections);

// Remove one vertex
removeSelection('vertex', 'v2');

// Clear all selections
clearSelection();
```

### Multi-mode Selection

```javascript
import { 
  setSelectionMode, 
  addSelection, 
  getSelectionsByType 
} from '../selection/index.js';

// Select vertices
setSelectionMode('vertex');
addSelection('vertex', 'v1');
addSelection('vertex', 'v2');

// Switch to edge mode and select edges
setSelectionMode('edge');
addSelection('edge', 'e1');
addSelection('edge', 'e2');

// Switch to face mode and select faces
setSelectionMode('face');
addSelection('face', 'f1');

// Get all selections by type
const vertexSelections = getSelectionsByType('vertex');
const edgeSelections = getSelectionsByType('edge');
const faceSelections = getSelectionsByType('face');

console.log('Vertex selections:', vertexSelections);
console.log('Edge selections:', edgeSelections);
console.log('Face selections:', faceSelections);
```

### Interactive Selection with Raycasting

```javascript
import { setSelectionMode, addSelection } from '../selection/index.js';
import { selectVerticesByRay } from '../selection/raycasting/vertexRaycaster.js';

// Set up raycasting for vertex selection
setSelectionMode('vertex');

function onMouseClick(event) {
  // Convert mouse position to ray
  const ray = convertMouseToRay(event);
  
  // Select vertices by ray
  const selectedVertices = selectVerticesByRay(ray, mesh, {
    threshold: 0.1
  });
  
  // Add selected vertices to selection
  selectedVertices.forEach(vertexId => {
    addSelection('vertex', vertexId);
  });
}

function convertMouseToRay(event) {
  // Implementation depends on your rendering setup
  // This is a placeholder for the actual conversion
  return {
    origin: { x: 0, y: 0, z: 0 },
    direction: { x: 0, y: 0, z: 1 }
  };
}
```

### Selection with Visual Feedback

```javascript
import { setSelectionMode, addSelection, getAllSelections } from '../selection/index.js';
import { createHighlightMaterial, createVertexHighlightGeometry } from '../selection/SelectionVisualizer.js';

// Set up selection with visual feedback
setSelectionMode('vertex');

// Create highlight material
const highlightMaterial = createHighlightMaterial({
  color: 0x00ff00,
  opacity: 0.8
});

// Add selection and create visual feedback
addSelection('vertex', 'v1');
addSelection('vertex', 'v2');

// Get selected vertices and create highlight geometry
const selections = getAllSelections();
const vertexPositions = selections
  .filter(s => s.type === 'vertex')
  .map(s => getVertexPosition(s.id));

const highlightGeometry = createVertexHighlightGeometry(vertexPositions, {
  size: 0.1,
  color: 0x00ff00
});

// Add highlight mesh to scene
const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
scene.add(highlightMesh);
```

## Best Practices

### 1. Use Appropriate Selection Modes

```javascript
import { setSelectionMode } from '../selection/index.js';

// Set the correct mode before performing operations
setSelectionMode('vertex');
// Perform vertex operations

setSelectionMode('edge');
// Perform edge operations

setSelectionMode('face');
// Perform face operations
```

### 2. Clear Selections When Switching Modes

```javascript
import { setSelectionMode, clearSelection } from '../selection/index.js';

// Clear selections when switching modes
clearSelection();
setSelectionMode('vertex');
```

### 3. Validate Selections Before Operations

```javascript
import { getSelectionsByType } from '../selection/index.js';

// Check if you have the right type of selections
const vertexSelections = getSelectionsByType('vertex');
if (vertexSelections.length === 0) {
  console.warn('No vertices selected for vertex operation');
  return;
}
```

### 4. Use Efficient Raycasting

```javascript
import { selectVerticesByRay } from '../selection/raycasting/vertexRaycaster.js';

// Use appropriate thresholds for raycasting
const selectedVertices = selectVerticesByRay(ray, mesh, {
  threshold: 0.1, // Small threshold for precise selection
  maxDistance: 10 // Limit search distance for performance
});
```

### 5. Batch Selection Operations

```javascript
import { addSelection, clearSelection } from '../selection/index.js';

// Clear existing selections first
clearSelection();

// Add multiple selections at once
const verticesToSelect = ['v1', 'v2', 'v3', 'v4'];
verticesToSelect.forEach(vertexId => {
  addSelection('vertex', vertexId);
});
```

## Performance Considerations

### 1. Limit Selection Count

```javascript
import { getAllSelections } from '../selection/index.js';

// Check selection count for performance
const selections = getAllSelections();
if (selections.length > 1000) {
  console.warn('Large number of selections may impact performance');
}
```

### 2. Use Efficient Raycasting

```javascript
import { selectVerticesByRay } from '../selection/raycasting/vertexRaycaster.js';

// Use spatial indexing for large meshes
const selectedVertices = selectVerticesByRay(ray, mesh, {
  useSpatialIndex: true, // Enable spatial indexing
  maxDistance: 10 // Limit search distance
});
```

### 3. Optimize Visual Feedback

```javascript
import { createVertexHighlightGeometry } from '../selection/SelectionVisualizer.js';

// Use instanced rendering for many highlights
const highlightGeometry = createVertexHighlightGeometry(vertexPositions, {
  useInstancing: true, // Enable instanced rendering
  maxInstances: 1000
});
```

## Migration Guide

**Old Style (Legacy):**
```javascript
import { SelectionManager } from '../selection/SelectionManager.js';

const selectionManager = new SelectionManager();
selectionManager.setSelectionMode('vertex');
selectionManager.addSelection('vertex', 'v1');
```

**New Modular Style:**
```javascript
import { setSelectionMode, addSelection } from '../selection/index.js';

setSelectionMode('vertex');
addSelection('vertex', 'v1');
```

**Key Changes:**
- All selection operations are now pure functions imported directly from their respective modules
- No more manager classes or group objects
- Direct function calls instead of method calls on objects
- Better tree-shaking and performance
- Cleaner, more maintainable code structure

**Migration Steps:**
1. Update all import statements to use the new modular imports
2. Replace manager object method calls with direct function calls
3. Update selection parameter structures if needed
4. Test all selection operations to ensure they work correctly
5. Remove any unused legacy imports 