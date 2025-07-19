# Three-Edit User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Operations](#basic-operations)
3. [Creating Primitives](#creating-primitives)
4. [Transform Operations](#transform-operations)
5. [Array Operations](#array-operations)
6. [Boolean Operations](#boolean-operations)
7. [Selection and Editing](#selection-and-editing)
8. [Extrusion and Beveling](#extrusion-and-beveling)
9. [Deformation Operations](#deformation-operations)
10. [Noise and Displacement](#noise-and-displacement)
11. [Import/Export](#importexport)
12. [Advanced Techniques](#advanced-techniques)
13. [Performance Tips](#performance-tips)
14. [Troubleshooting](#troubleshooting)

## Getting Started

### Installation

```bash
npm install three-edit
```

### Basic Setup

```typescript
import { EditableMesh, createCube, move, rotate } from 'three-edit';
import { Vector3 } from 'three';

// Create a simple cube
const mesh = createCube({
  width: 1,
  height: 1,
  depth: 1,
  generateUVs: true,
  generateNormals: true
});

// Transform the mesh
move(mesh, {
  direction: new Vector3(1, 0, 0),
  distance: 2
});

rotate(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 4
});
```

### Core Concepts

**EditableMesh**: The main class representing a 3D mesh with editable geometry.

**Vertices**: Points in 3D space that define the mesh structure.

**Edges**: Connections between vertices that define the mesh topology.

**Faces**: Surfaces defined by multiple vertices and edges.

## Basic Operations

### Creating and Manipulating Meshes

```typescript
import { EditableMesh } from 'three-edit';

// Create an empty mesh
const mesh = new EditableMesh();

// Add vertices
const v1 = mesh.addVertex({ x: 0, y: 0, z: 0 });
const v2 = mesh.addVertex({ x: 1, y: 0, z: 0 });
const v3 = mesh.addVertex({ x: 0, y: 1, z: 0 });

// Add edges
const e1 = mesh.addEdge(new Edge(v1, v2));
const e2 = mesh.addEdge(new Edge(v2, v3));
const e3 = mesh.addEdge(new Edge(v3, v1));

// Add a face
const face = new Face([v1, v2, v3], [e1, e2, e3]);
mesh.addFace(face);
```

### Validation and Repair

```typescript
// Validate mesh integrity
if (!mesh.validateMesh()) {
  console.warn('Mesh has issues, attempting repair...');
  mesh.repairMesh();
}

// Check mesh statistics
console.log(`Vertices: ${mesh.getVertexCount()}`);
console.log(`Edges: ${mesh.getEdgeCount()}`);
console.log(`Faces: ${mesh.getFaceCount()}`);
```

## Creating Primitives

### Basic Primitives

```typescript
import { 
  createCube, 
  createSphere, 
  createCylinder,
  createCone,
  createTorus,
  createPlane 
} from 'three-edit';

// Create a cube
const cube = createCube({
  width: 2,
  height: 1,
  depth: 1,
  center: new Vector3(0, 0, 0),
  materialIndex: 0,
  generateUVs: true,
  generateNormals: true
});

// Create a sphere
const sphere = createSphere({
  radius: 1,
  segments: 32,
  rings: 16,
  center: new Vector3(0, 0, 0)
});

// Create a cylinder
const cylinder = createCylinder({
  radius: 0.5,
  height: 2,
  segments: 16,
  center: new Vector3(0, 0, 0)
});
```

### Regular Polyhedra

```typescript
import { 
  createTetrahedron,
  createOctahedron,
  createDodecahedron,
  createIcosahedron 
} from 'three-edit';

// Create Platonic solids
const tetrahedron = createTetrahedron({ size: 1 });
const octahedron = createOctahedron({ size: 1 });
const dodecahedron = createDodecahedron({ size: 1 });
const icosahedron = createIcosahedron({ size: 1 });
```

### Complex Shapes

```typescript
import { createTorusKnot, createMobiusStrip } from 'three-edit';

// Create a torus knot
const torusKnot = createTorusKnot({
  radius: 1,
  tubeRadius: 0.3,
  tubularSegments: 64,
  radialSegments: 8,
  p: 2,
  q: 3
});

// Create a Möbius strip
const mobiusStrip = createMobiusStrip({
  radius: 1,
  width: 0.3,
  segments: 64,
  widthSegments: 8,
  twists: 1
});
```

## Transform Operations

### Basic Transforms

```typescript
import { move, rotate, scale } from 'three-edit';
import { Vector3 } from 'three';

// Move mesh
move(mesh, {
  direction: new Vector3(1, 0, 0),
  distance: 2,
  selectedOnly: false
});

// Rotate mesh
rotate(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 2,
  center: new Vector3(0, 0, 0),
  selectedOnly: false
});

// Scale mesh
scale(mesh, {
  factor: new Vector3(2, 1, 1),
  center: new Vector3(0, 0, 0),
  selectedOnly: false
});
```

### Mirror Operations

```typescript
import { mirror } from 'three-edit';

// Mirror by plane
mirror(mesh, {
  type: 'plane',
  plane: {
    point: new Vector3(0, 0, 0),
    normal: new Vector3(1, 0, 0)
  },
  selectedOnly: false
});

// Mirror by axis
mirror(mesh, {
  type: 'axis',
  axis: {
    point: new Vector3(0, 0, 0),
    direction: new Vector3(0, 1, 0)
  },
  selectedOnly: false
});

// Mirror by point
mirror(mesh, {
  type: 'point',
  point: new Vector3(0, 0, 0),
  selectedOnly: false
});
```

## Array Operations

### Linear Array

```typescript
import { createLinearArray } from 'three-edit';

const arrayedMesh = createLinearArray(mesh, {
  count: 5,
  direction: new Vector3(1, 0, 0),
  distance: 2,
  offset: new Vector3(0, 0, 0),
  merge: false
});
```

### Radial Array

```typescript
import { createRadialArray } from 'three-edit';

const radialMesh = createRadialArray(mesh, {
  count: 8,
  radius: 3,
  center: new Vector3(0, 0, 0),
  axis: new Vector3(0, 1, 0),
  startAngle: 0,
  endAngle: Math.PI * 2,
  merge: false
});
```

### Grid Array

```typescript
import { createGridArray } from 'three-edit';

const gridMesh = createGridArray(mesh, {
  counts: new Vector3(3, 2, 1),
  distances: new Vector3(2, 2, 2),
  offset: new Vector3(0, 0, 0),
  merge: false
});
```

### Generic Array

```typescript
import { createArray } from 'three-edit';

// Linear array
const linearArray = createArray(mesh, {
  type: 'linear',
  linear: {
    count: 5,
    direction: new Vector3(1, 0, 0),
    distance: 2
  }
});

// Radial array
const radialArray = createArray(mesh, {
  type: 'radial',
  radial: {
    count: 8,
    radius: 3,
    center: new Vector3(0, 0, 0),
    axis: new Vector3(0, 1, 0)
  }
});
```

## Boolean Operations

### Union

```typescript
import { union } from 'three-edit';

const cube1 = createCube({ width: 1, height: 1, depth: 1 });
const cube2 = createCube({ width: 1, height: 1, depth: 1 });

// Move second cube
move(cube2, { direction: new Vector3(0.5, 0, 0), distance: 1 });

// Union operation
const unionMesh = union(cube1, cube2, {
  materialIndex: 0,
  mergeVertices: true
});
```

### Intersection

```typescript
import { intersection } from 'three-edit';

const intersectionMesh = intersection(cube1, cube2, {
  materialIndex: 1,
  mergeVertices: true
});
```

### Difference

```typescript
import { difference } from 'three-edit';

const differenceMesh = difference(cube1, cube2, {
  materialIndex: 2,
  mergeVertices: true
});
```

## Selection and Editing

### Basic Selection

```typescript
import { selectVertices, selectEdges, selectFaces } from 'three-edit';

// Select specific vertices
const vertexSelection = selectVertices(mesh, [0, 1, 2]);

// Select specific edges
const edgeSelection = selectEdges(mesh, [0, 1, 2]);

// Select specific faces
const faceSelection = selectFaces(mesh, [0, 1, 2]);
```

### Advanced Selection

```typescript
import { 
  selectRing, 
  selectLoop, 
  selectConnected, 
  selectBoundary,
  selectByMaterial 
} from 'three-edit';

// Select edge ring
const ringSelection = selectRing(mesh, 0);

// Select edge loop
const loopSelection = selectLoop(mesh, 0);

// Select connected vertices
const connectedSelection = selectConnected(mesh, 0);

// Select boundary edges
const boundarySelection = selectBoundary(mesh);

// Select by material
const materialSelection = selectByMaterial(mesh, 0);
```

## Extrusion and Beveling

### Vertex Extrusion

```typescript
import { extrudeVertex } from 'three-edit';

extrudeVertex(mesh, 0, {
  direction: new Vector3(0, 1, 0),
  distance: 1,
  keepOriginal: true,
  materialIndex: 0
});
```

### Edge Extrusion

```typescript
import { extrudeEdge } from 'three-edit';

extrudeEdge(mesh, 0, {
  direction: new Vector3(0, 1, 0),
  distance: 1,
  keepOriginal: true,
  materialIndex: 0
});
```

### Face Extrusion

```typescript
import { extrudeFace } from 'three-edit';

extrudeFace(mesh, 0, {
  direction: new Vector3(0, 1, 0),
  distance: 1,
  keepOriginal: true,
  materialIndex: 0
});
```

### Beveling

```typescript
import { bevelEdge, bevelVertex, bevelFace } from 'three-edit';

// Bevel an edge
bevelEdge(mesh, 0, {
  distance: 0.1,
  segments: 3,
  profile: 0.5,
  materialIndex: 0,
  bothSides: true
});

// Bevel a vertex
bevelVertex(mesh, 0, {
  distance: 0.1,
  segments: 3,
  profile: 0.5,
  materialIndex: 0,
  allEdges: true
});

// Bevel a face
bevelFace(mesh, 0, {
  distance: 0.1,
  segments: 3,
  profile: 0.5,
  materialIndex: 0,
  allEdges: true
});
```

## Deformation Operations

### Bend

```typescript
import { bend } from 'three-edit';

bend(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 4,
  center: new Vector3(0, 0, 0),
  direction: new Vector3(1, 0, 0)
});
```

### Twist

```typescript
import { twist } from 'three-edit';

twist(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 2,
  center: new Vector3(0, 0, 0),
  direction: new Vector3(1, 0, 0)
});
```

### Taper

```typescript
import { taper } from 'three-edit';

taper(mesh, {
  axis: new Vector3(0, 1, 0),
  factor: 0.5,
  center: new Vector3(0, 0, 0),
  direction: new Vector3(1, 0, 0)
});
```

## Noise and Displacement

### Vertex Noise

```typescript
import { applyVertexNoise } from 'three-edit';

applyVertexNoise(mesh, {
  scale: 1.0,
  intensity: 0.1,
  seed: 12345,
  type: 'perlin'
});
```

### Face Displacement

```typescript
import { applyFaceDisplacement } from 'three-edit';

applyFaceDisplacement(mesh, {
  intensity: 0.2,
  direction: new Vector3(0, 1, 0),
  texture: 'displacement.png'
});
```

### Generic Noise

```typescript
import { applyNoise } from 'three-edit';

applyNoise(mesh, {
  type: 'vertex',
  scale: 1.0,
  intensity: 0.1,
  seed: 12345,
  noiseType: 'fractal'
});
```

## Import/Export

### OBJ Format

```typescript
import { parseOBJ, exportOBJ, loadOBJ, saveOBJ } from 'three-edit';

// Parse OBJ content
const mesh = parseOBJ(objContent, {
  includeNormals: true,
  includeUVs: true,
  includeMaterials: true
});

// Export to OBJ
const objContent = exportOBJ(mesh, {
  includeNormals: true,
  includeUVs: true,
  includeMaterials: true
});

// Load OBJ file
const mesh = await loadOBJ('model.obj', {
  includeNormals: true,
  includeUVs: true
});

// Save OBJ file
await saveOBJ(mesh, 'output.obj', {
  includeNormals: true,
  includeUVs: true
});
```

### GLTF Format

```typescript
import { parseGLTF, exportGLTF, loadGLTF, saveGLTF } from 'three-edit';

// Parse GLTF content
const mesh = parseGLTF(gltfContent, {
  includeAnimations: true,
  includeMaterials: true,
  binary: false
});

// Export to GLTF
const gltfContent = exportGLTF(mesh, {
  includeAnimations: true,
  includeMaterials: true,
  binary: false
});

// Load GLTF file
const mesh = await loadGLTF('model.gltf', {
  includeAnimations: true,
  includeMaterials: true
});

// Save GLTF file
await saveGLTF(mesh, 'output.gltf', {
  includeAnimations: true,
  includeMaterials: true
});
```

### PLY Format

```typescript
import { parsePLY, exportPLY, loadPLY, savePLY } from 'three-edit';

// Parse PLY content
const mesh = parsePLY(plyContent, {
  includeColors: true,
  includeNormals: true,
  includeUVs: true,
  binary: false
});

// Export to PLY
const plyContent = exportPLY(mesh, {
  includeColors: true,
  includeNormals: true,
  includeUVs: true,
  binary: false
});

// Load PLY file
const mesh = await loadPLY('model.ply', {
  includeColors: true,
  includeNormals: true
});

// Save PLY file
await savePLY(mesh, 'output.ply', {
  includeColors: true,
  includeNormals: true
});
```

## Advanced Techniques

### Working with Materials

```typescript
import { MaterialManager } from 'three-edit';

const materialManager = new MaterialManager();

// Add materials
const material1 = materialManager.addMaterial({
  name: 'Red Material',
  type: 'standard',
  color: { r: 1, g: 0, b: 0 },
  opacity: 1.0,
  transparent: false,
  wireframe: false
});

const material2 = materialManager.addMaterial({
  name: 'Blue Material',
  type: 'phong',
  color: { r: 0, g: 0, b: 1 },
  opacity: 0.8,
  transparent: true,
  wireframe: false
});

// Assign materials to faces
mesh.getFace(0)!.materialIndex = material1;
mesh.getFace(1)!.materialIndex = material2;
```

### History System

```typescript
import { CommandHistory } from 'three-edit';

const history = new CommandHistory();

// Execute commands
history.execute(new MoveCommand(mesh, new Vector3(1, 0, 0)));
history.execute(new RotateCommand(mesh, new Vector3(0, 1, 0), Math.PI / 4));

// Undo/Redo
if (history.canUndo()) {
  history.undo();
}

if (history.canRedo()) {
  history.redo();
}
```

### Conversion to Three.js

```typescript
import { toBufferGeometry, fromBufferGeometry } from 'three-edit';
import * as THREE from 'three';

// Convert to Three.js BufferGeometry
const geometry = toBufferGeometry(mesh);
const material = new THREE.MeshStandardMaterial();
const mesh3D = new THREE.Mesh(geometry, material);

// Convert from Three.js BufferGeometry
const editableMesh = fromBufferGeometry(geometry);
```

## Performance Tips

### Memory Management

```typescript
// Dispose of geometries when done
geometry.dispose();
material.dispose();

// Clear history to free memory
history.clear();

// Validate meshes periodically
if (!mesh.validateMesh()) {
  mesh.repairMesh();
}
```

### Optimization Strategies

```typescript
// Use selectedOnly for large meshes
move(mesh, {
  direction: new Vector3(1, 0, 0),
  distance: 1,
  selectedOnly: true
});

// Batch operations when possible
const commands = [
  new MoveCommand(mesh, new Vector3(1, 0, 0)),
  new RotateCommand(mesh, new Vector3(0, 1, 0), Math.PI / 4),
  new ScaleCommand(mesh, new Vector3(2, 1, 1))
];

commands.forEach(command => history.execute(command));

// Use appropriate segment counts
const sphere = createSphere({
  radius: 1,
  segments: 16, // Lower for performance
  rings: 8
});
```

### Best Practices

1. **Validate meshes** after complex operations
2. **Use the history system** for undo/redo functionality
3. **Handle errors gracefully** with try-catch blocks
4. **Test with various mesh sizes** to ensure performance
5. **Reuse objects** when possible to reduce memory allocations
6. **Use appropriate primitive settings** for your use case
7. **Enable/disable UV and normal generation** as needed

## Troubleshooting

### Common Issues

#### Mesh Validation Errors

```typescript
// Check for validation issues
if (!mesh.validateMesh()) {
  console.warn('Mesh validation failed');
  
  // Attempt repair
  mesh.repairMesh();
  
  // Check again
  if (!mesh.validateMesh()) {
    console.error('Mesh repair failed');
  }
}
```

#### Performance Issues

```typescript
// Monitor mesh size
console.log(`Mesh size: ${mesh.getVertexCount()} vertices, ${mesh.getFaceCount()} faces`);

// Use appropriate settings for large meshes
if (mesh.getVertexCount() > 10000) {
  // Use lower segment counts
  // Enable selectedOnly options
  // Consider mesh simplification
}
```

#### Import/Export Issues

```typescript
// Handle import errors
try {
  const mesh = await loadOBJ('model.obj');
} catch (error) {
  console.error('Failed to load OBJ:', error);
  
  // Try with different options
  const mesh = await loadOBJ('model.obj', {
    includeNormals: false,
    includeUVs: false
  });
}
```

### Debug Tips

1. **Check mesh statistics** before and after operations
2. **Validate meshes** after complex operations
3. **Use console.log** to track operation progress
4. **Test with simple meshes** first
5. **Check Three.js compatibility** when converting geometries

### Error Handling

```typescript
import { ThreeEditError, ValidationError, OperationError } from 'three-edit';

try {
  // Perform operations
  move(mesh, { direction: new Vector3(1, 0, 0), distance: 1 });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
    mesh.repairMesh();
  } else if (error instanceof OperationError) {
    console.error('Operation error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

This comprehensive user guide provides everything needed to get started with the three-edit library and covers all major features and best practices. 