# Three-Edit Tutorials

## Table of Contents

1. [Tutorial 1: Basic Primitives](#tutorial-1-basic-primitives)
2. [Tutorial 2: Transform Operations](#tutorial-2-transform-operations)
3. [Tutorial 3: Array Operations](#tutorial-3-array-operations)
4. [Tutorial 4: Boolean Operations](#tutorial-4-boolean-operations)
5. [Tutorial 5: Selection and Editing](#tutorial-5-selection-and-editing)
6. [Tutorial 6: Extrusion and Beveling](#tutorial-6-extrusion-and-beveling)
7. [Tutorial 7: Deformation Operations](#tutorial-7-deformation-operations)
8. [Tutorial 8: Noise and Displacement](#tutorial-8-noise-and-displacement)
9. [Tutorial 9: Import/Export](#tutorial-9-importexport)
10. [Tutorial 10: Advanced Techniques](#tutorial-10-advanced-techniques)

## Tutorial 1: Basic Primitives

### Creating Simple Shapes

```typescript
import { 
  createCube, 
  createSphere, 
  createCylinder,
  createCone,
  createTorus,
  createPlane 
} from 'three-edit';
import { Vector3 } from 'three';

// Create a basic cube
const cube = createCube({
  width: 2,
  height: 1,
  depth: 1,
  center: new Vector3(0, 0, 0),
  materialIndex: 0,
  generateUVs: true,
  generateNormals: true
});

console.log(`Cube created with ${cube.getVertexCount()} vertices and ${cube.getFaceCount()} faces`);

// Create a sphere
const sphere = createSphere({
  radius: 1,
  segments: 32,
  rings: 16,
  center: new Vector3(3, 0, 0)
});

// Create a cylinder
const cylinder = createCylinder({
  radius: 0.5,
  height: 2,
  segments: 16,
  center: new Vector3(-3, 0, 0)
});

// Create a cone
const cone = createCone({
  radius: 0.5,
  height: 2,
  segments: 16,
  center: new Vector3(0, 3, 0)
});

// Create a torus
const torus = createTorus({
  radius: 1,
  tubeRadius: 0.3,
  radialSegments: 16,
  tubularSegments: 32,
  center: new Vector3(0, -3, 0)
});

// Create a plane
const plane = createPlane({
  width: 2,
  height: 2,
  widthSegments: 4,
  heightSegments: 4,
  center: new Vector3(0, 0, 3)
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

// Create all Platonic solids
const tetrahedron = createTetrahedron({ size: 1, center: new Vector3(-4, 0, 0) });
const octahedron = createOctahedron({ size: 1, center: new Vector3(-2, 0, 0) });
const dodecahedron = createDodecahedron({ size: 1, center: new Vector3(0, 0, 0) });
const icosahedron = createIcosahedron({ size: 1, center: new Vector3(2, 0, 0) });

console.log('Platonic solids created:');
console.log(`Tetrahedron: ${tetrahedron.getVertexCount()} vertices, ${tetrahedron.getFaceCount()} faces`);
console.log(`Octahedron: ${octahedron.getVertexCount()} vertices, ${octahedron.getFaceCount()} faces`);
console.log(`Dodecahedron: ${dodecahedron.getVertexCount()} vertices, ${dodecahedron.getFaceCount()} faces`);
console.log(`Icosahedron: ${icosahedron.getVertexCount()} vertices, ${icosahedron.getFaceCount()} faces`);
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
  q: 3,
  center: new Vector3(-3, 0, 0)
});

// Create a Möbius strip
const mobiusStrip = createMobiusStrip({
  radius: 1,
  width: 0.3,
  segments: 64,
  widthSegments: 8,
  twists: 1,
  center: new Vector3(3, 0, 0)
});

console.log('Complex shapes created:');
console.log(`Torus Knot: ${torusKnot.getVertexCount()} vertices, ${torusKnot.getFaceCount()} faces`);
console.log(`Möbius Strip: ${mobiusStrip.getVertexCount()} vertices, ${mobiusStrip.getFaceCount()} faces`);
```

## Tutorial 2: Transform Operations

### Basic Transforms

```typescript
import { move, rotate, scale } from 'three-edit';
import { Vector3 } from 'three';

const mesh = createCube();

// Move the mesh
move(mesh, {
  direction: new Vector3(1, 0, 0),
  distance: 2,
  selectedOnly: false
});

// Rotate the mesh
rotate(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 4,
  center: new Vector3(0, 0, 0),
  selectedOnly: false
});

// Scale the mesh
scale(mesh, {
  factor: new Vector3(2, 1, 1),
  center: new Vector3(0, 0, 0),
  selectedOnly: false
});
```

### Mirror Operations

```typescript
import { mirror } from 'three-edit';

const mesh = createCube();

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

### Complex Transform Combinations

```typescript
import { move, rotate, scale, mirror } from 'three-edit';

const mesh = createCube();

// Create a complex transformation sequence
move(mesh, { direction: new Vector3(1, 0, 0), distance: 2 });
rotate(mesh, { axis: new Vector3(0, 1, 0), angle: Math.PI / 4 });
scale(mesh, { factor: new Vector3(1.5, 1, 1) });
mirror(mesh, { type: 'plane', plane: { point: new Vector3(0, 0, 0), normal: new Vector3(0, 1, 0) } });

console.log('Complex transformation applied');
```

## Tutorial 3: Array Operations

### Linear Array

```typescript
import { createLinearArray } from 'three-edit';

const baseMesh = createCube({ width: 0.5, height: 0.5, depth: 0.5 });

// Create a linear array
const linearArray = createLinearArray(baseMesh, {
  count: 5,
  direction: new Vector3(1, 0, 0),
  distance: 1,
  offset: new Vector3(0, 0, 0),
  merge: false
});

console.log(`Linear array created with ${linearArray.getVertexCount()} vertices`);
```

### Radial Array

```typescript
import { createRadialArray } from 'three-edit';

const baseMesh = createCube({ width: 0.3, height: 0.3, depth: 0.3 });

// Create a radial array
const radialArray = createRadialArray(baseMesh, {
  count: 8,
  radius: 2,
  center: new Vector3(0, 0, 0),
  axis: new Vector3(0, 1, 0),
  startAngle: 0,
  endAngle: Math.PI * 2,
  merge: false
});

console.log(`Radial array created with ${radialArray.getVertexCount()} vertices`);
```

### Grid Array

```typescript
import { createGridArray } from 'three-edit';

const baseMesh = createSphere({ radius: 0.2 });

// Create a grid array
const gridArray = createGridArray(baseMesh, {
  counts: new Vector3(3, 2, 1),
  distances: new Vector3(1, 1, 1),
  offset: new Vector3(0, 0, 0),
  merge: false
});

console.log(`Grid array created with ${gridArray.getVertexCount()} vertices`);
```

### Complex Array Combinations

```typescript
import { createLinearArray, createRadialArray } from 'three-edit';

const baseMesh = createCube({ width: 0.2, height: 0.2, depth: 0.2 });

// Create a linear array first
const linearArray = createLinearArray(baseMesh, {
  count: 3,
  direction: new Vector3(1, 0, 0),
  distance: 1
});

// Then create a radial array from the linear array
const complexArray = createRadialArray(linearArray, {
  count: 6,
  radius: 2,
  center: new Vector3(0, 0, 0),
  axis: new Vector3(0, 1, 0)
});

console.log(`Complex array created with ${complexArray.getVertexCount()} vertices`);
```

## Tutorial 4: Boolean Operations

### Union Operation

```typescript
import { union } from 'three-edit';

// Create two cubes
const cube1 = createCube({ width: 1, height: 1, depth: 1 });
const cube2 = createCube({ width: 1, height: 1, depth: 1 });

// Move second cube
move(cube2, { direction: new Vector3(0.5, 0, 0), distance: 1 });

// Perform union operation
const unionMesh = union(cube1, cube2, {
  materialIndex: 0,
  mergeVertices: true
});

console.log(`Union mesh created with ${unionMesh.getVertexCount()} vertices`);
```

### Intersection Operation

```typescript
import { intersection } from 'three-edit';

// Create two spheres
const sphere1 = createSphere({ radius: 1, center: new Vector3(0, 0, 0) });
const sphere2 = createSphere({ radius: 1, center: new Vector3(0.5, 0, 0) });

// Perform intersection operation
const intersectionMesh = intersection(sphere1, sphere2, {
  materialIndex: 1,
  mergeVertices: true
});

console.log(`Intersection mesh created with ${intersectionMesh.getVertexCount()} vertices`);
```

### Difference Operation

```typescript
import { difference } from 'three-edit';

// Create a cube and a sphere
const cube = createCube({ width: 2, height: 2, depth: 2 });
const sphere = createSphere({ radius: 1, center: new Vector3(0, 0, 0) });

// Perform difference operation
const differenceMesh = difference(cube, sphere, {
  materialIndex: 2,
  mergeVertices: true
});

console.log(`Difference mesh created with ${differenceMesh.getVertexCount()} vertices`);
```

### Complex Boolean Operations

```typescript
import { union, intersection, difference } from 'three-edit';

// Create multiple shapes
const cube = createCube({ width: 1, height: 1, depth: 1 });
const sphere = createSphere({ radius: 0.8, center: new Vector3(0, 0, 0) });
const cylinder = createCylinder({ radius: 0.3, height: 2, center: new Vector3(0, 0, 0) });

// Complex boolean operation: (cube ∪ sphere) - cylinder
const unionResult = union(cube, sphere);
const finalResult = difference(unionResult, cylinder);

console.log(`Complex boolean operation completed with ${finalResult.getVertexCount()} vertices`);
```

## Tutorial 5: Selection and Editing

### Basic Selection

```typescript
import { selectVertices, selectEdges, selectFaces } from 'three-edit';

const mesh = createCube();

// Select specific vertices
const vertexSelection = selectVertices(mesh, [0, 1, 2, 3]);
console.log(`Selected ${vertexSelection.vertices.size} vertices`);

// Select specific edges
const edgeSelection = selectEdges(mesh, [0, 1, 2]);
console.log(`Selected ${edgeSelection.edges.size} edges`);

// Select specific faces
const faceSelection = selectFaces(mesh, [0, 1]);
console.log(`Selected ${faceSelection.faces.size} faces`);
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

const mesh = createCube();

// Select edge ring
const ringSelection = selectRing(mesh, 0);
console.log(`Ring selection: ${ringSelection.edges.size} edges`);

// Select edge loop
const loopSelection = selectLoop(mesh, 0);
console.log(`Loop selection: ${loopSelection.edges.size} edges`);

// Select connected vertices
const connectedSelection = selectConnected(mesh, 0);
console.log(`Connected selection: ${connectedSelection.vertices.size} vertices`);

// Select boundary edges
const boundarySelection = selectBoundary(mesh);
console.log(`Boundary selection: ${boundarySelection.edges.size} edges`);

// Select by material
const materialSelection = selectByMaterial(mesh, 0);
console.log(`Material selection: ${materialSelection.faces.size} faces`);
```

### Selection with Transform Operations

```typescript
import { selectVertices, move, rotate, scale } from 'three-edit';

const mesh = createCube();

// Select top vertices (assuming cube vertices are ordered)
const topVertices = [4, 5, 6, 7]; // Adjust indices based on your cube
const selection = selectVertices(mesh, topVertices);

// Move only selected vertices
move(mesh, {
  direction: new Vector3(0, 1, 0),
  distance: 0.5,
  selectedOnly: true
});

// Rotate only selected vertices
rotate(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 4,
  center: new Vector3(0, 0, 0),
  selectedOnly: true
});

// Scale only selected vertices
scale(mesh, {
  factor: new Vector3(1.5, 1, 1.5),
  center: new Vector3(0, 0, 0),
  selectedOnly: true
});
```

## Tutorial 6: Extrusion and Beveling

### Vertex Extrusion

```typescript
import { extrudeVertex } from 'three-edit';

const mesh = createCube();

// Extrude a vertex
extrudeVertex(mesh, 0, {
  direction: new Vector3(0, 1, 0),
  distance: 1,
  keepOriginal: true,
  materialIndex: 0
});

console.log(`Vertex extrusion completed. Mesh now has ${mesh.getVertexCount()} vertices`);
```

### Edge Extrusion

```typescript
import { extrudeEdge } from 'three-edit';

const mesh = createCube();

// Extrude an edge
extrudeEdge(mesh, 0, {
  direction: new Vector3(0, 1, 0),
  distance: 1,
  keepOriginal: true,
  materialIndex: 0
});

console.log(`Edge extrusion completed. Mesh now has ${mesh.getFaceCount()} faces`);
```

### Face Extrusion

```typescript
import { extrudeFace } from 'three-edit';

const mesh = createCube();

// Extrude a face
extrudeFace(mesh, 0, {
  direction: new Vector3(0, 1, 0),
  distance: 1,
  keepOriginal: true,
  materialIndex: 0
});

console.log(`Face extrusion completed. Mesh now has ${mesh.getFaceCount()} faces`);
```

### Beveling Operations

```typescript
import { bevelEdge, bevelVertex, bevelFace } from 'three-edit';

const mesh = createCube();

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

console.log(`Beveling operations completed. Mesh now has ${mesh.getVertexCount()} vertices`);
```

## Tutorial 7: Deformation Operations

### Bend Operations

```typescript
import { bend } from 'three-edit';

const mesh = createCube({ width: 2, height: 1, depth: 1 });

// Bend the mesh
bend(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 4,
  center: new Vector3(0, 0, 0),
  direction: new Vector3(1, 0, 0)
});

console.log('Bend operation completed');
```

### Twist Operations

```typescript
import { twist } from 'three-edit';

const mesh = createCylinder({ radius: 0.5, height: 2 });

// Twist the mesh
twist(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 2,
  center: new Vector3(0, 0, 0),
  direction: new Vector3(1, 0, 0)
});

console.log('Twist operation completed');
```

### Taper Operations

```typescript
import { taper } from 'three-edit';

const mesh = createCylinder({ radius: 0.5, height: 2 });

// Taper the mesh
taper(mesh, {
  axis: new Vector3(0, 1, 0),
  factor: 0.5,
  center: new Vector3(0, 0, 0),
  direction: new Vector3(1, 0, 0)
});

console.log('Taper operation completed');
```

### Complex Deformation Combinations

```typescript
import { bend, twist, taper } from 'three-edit';

const mesh = createCylinder({ radius: 0.5, height: 3 });

// Apply multiple deformations
bend(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 6,
  center: new Vector3(0, 0, 0),
  direction: new Vector3(1, 0, 0)
});

twist(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 4,
  center: new Vector3(0, 0, 0),
  direction: new Vector3(1, 0, 0)
});

taper(mesh, {
  axis: new Vector3(0, 1, 0),
  factor: 0.7,
  center: new Vector3(0, 0, 0),
  direction: new Vector3(1, 0, 0)
});

console.log('Complex deformation sequence completed');
```

## Tutorial 8: Noise and Displacement

### Vertex Noise

```typescript
import { applyVertexNoise } from 'three-edit';

const mesh = createSphere({ radius: 1, segments: 32, rings: 16 });

// Apply Perlin noise to vertices
applyVertexNoise(mesh, {
  scale: 1.0,
  intensity: 0.1,
  seed: 12345,
  type: 'perlin'
});

console.log('Vertex noise applied');
```

### Different Noise Types

```typescript
import { applyVertexNoise } from 'three-edit';

const mesh = createPlane({ width: 2, height: 2, widthSegments: 32, heightSegments: 32 });

// Apply different noise types
const noiseTypes = ['perlin', 'fractal', 'cellular', 'turbulence'];

noiseTypes.forEach((type, index) => {
  const testMesh = mesh.clone();
  applyVertexNoise(testMesh, {
    scale: 1.0,
    intensity: 0.2,
    seed: 12345 + index,
    type: type
  });
  console.log(`${type} noise applied`);
});
```

### Face Displacement

```typescript
import { applyFaceDisplacement } from 'three-edit';

const mesh = createPlane({ width: 2, height: 2, widthSegments: 16, heightSegments: 16 });

// Apply face displacement
applyFaceDisplacement(mesh, {
  intensity: 0.2,
  direction: new Vector3(0, 1, 0)
});

console.log('Face displacement applied');
```

### Generic Noise Function

```typescript
import { applyNoise } from 'three-edit';

const mesh = createSphere({ radius: 1, segments: 32, rings: 16 });

// Apply vertex noise using generic function
applyNoise(mesh, {
  type: 'vertex',
  scale: 1.0,
  intensity: 0.1,
  seed: 12345,
  noiseType: 'fractal'
});

// Apply face displacement using generic function
applyNoise(mesh, {
  type: 'face',
  intensity: 0.1,
  direction: new Vector3(0, 1, 0)
});

console.log('Generic noise operations completed');
```

## Tutorial 9: Import/Export

### OBJ Format

```typescript
import { parseOBJ, exportOBJ, loadOBJ, saveOBJ } from 'three-edit';

// Parse OBJ content
const objContent = `
v 0 0 0
v 1 0 0
v 0 1 0
f 1 2 3
`;

const mesh = parseOBJ(objContent, {
  includeNormals: true,
  includeUVs: true,
  includeMaterials: true
});

console.log(`OBJ parsed: ${mesh.getVertexCount()} vertices, ${mesh.getFaceCount()} faces`);

// Export to OBJ
const exportedContent = exportOBJ(mesh, {
  includeNormals: true,
  includeUVs: true,
  includeMaterials: true
});

console.log('OBJ exported successfully');

// Load OBJ file (browser environment)
try {
  const loadedMesh = await loadOBJ('model.obj', {
    includeNormals: true,
    includeUVs: true
  });
  console.log(`OBJ loaded: ${loadedMesh.getVertexCount()} vertices`);
} catch (error) {
  console.error('Failed to load OBJ:', error);
}

// Save OBJ file (browser environment)
try {
  await saveOBJ(mesh, 'output.obj', {
    includeNormals: true,
    includeUVs: true
  });
  console.log('OBJ saved successfully');
} catch (error) {
  console.error('Failed to save OBJ:', error);
}
```

### GLTF Format

```typescript
import { parseGLTF, exportGLTF, loadGLTF, saveGLTF } from 'three-edit';

// Create a simple mesh for testing
const mesh = createCube();

// Export to GLTF
const gltfContent = exportGLTF(mesh, {
  includeAnimations: true,
  includeMaterials: true,
  binary: false
});

console.log('GLTF exported successfully');

// Parse GLTF content
const parsedMesh = parseGLTF(gltfContent, {
  includeAnimations: true,
  includeMaterials: true,
  binary: false
});

console.log(`GLTF parsed: ${parsedMesh.getVertexCount()} vertices`);

// Load GLTF file (browser environment)
try {
  const loadedMesh = await loadGLTF('model.gltf', {
    includeAnimations: true,
    includeMaterials: true
  });
  console.log(`GLTF loaded: ${loadedMesh.getVertexCount()} vertices`);
} catch (error) {
  console.error('Failed to load GLTF:', error);
}

// Save GLTF file (browser environment)
try {
  await saveGLTF(mesh, 'output.gltf', {
    includeAnimations: true,
    includeMaterials: true
  });
  console.log('GLTF saved successfully');
} catch (error) {
  console.error('Failed to save GLTF:', error);
}
```

### PLY Format

```typescript
import { parsePLY, exportPLY, loadPLY, savePLY } from 'three-edit';

// Create a simple mesh for testing
const mesh = createSphere({ radius: 1, segments: 16, rings: 8 });

// Export to PLY
const plyContent = exportPLY(mesh, {
  includeColors: true,
  includeNormals: true,
  includeUVs: true,
  binary: false
});

console.log('PLY exported successfully');

// Parse PLY content
const parsedMesh = parsePLY(plyContent, {
  includeColors: true,
  includeNormals: true,
  includeUVs: true,
  binary: false
});

console.log(`PLY parsed: ${parsedMesh.getVertexCount()} vertices`);

// Load PLY file (browser environment)
try {
  const loadedMesh = await loadPLY('model.ply', {
    includeColors: true,
    includeNormals: true
  });
  console.log(`PLY loaded: ${loadedMesh.getVertexCount()} vertices`);
} catch (error) {
  console.error('Failed to load PLY:', error);
}

// Save PLY file (browser environment)
try {
  await savePLY(mesh, 'output.ply', {
    includeColors: true,
    includeNormals: true
  });
  console.log('PLY saved successfully');
} catch (error) {
  console.error('Failed to save PLY:', error);
}
```

## Tutorial 10: Advanced Techniques

### Working with Materials

```typescript
import { MaterialManager } from 'three-edit';

const materialManager = new MaterialManager();

// Add materials
const redMaterial = materialManager.addMaterial({
  name: 'Red Material',
  type: 'standard',
  color: { r: 1, g: 0, b: 0 },
  opacity: 1.0,
  transparent: false,
  wireframe: false
});

const blueMaterial = materialManager.addMaterial({
  name: 'Blue Material',
  type: 'phong',
  color: { r: 0, g: 0, b: 1 },
  opacity: 0.8,
  transparent: true,
  wireframe: false
});

const greenMaterial = materialManager.addMaterial({
  name: 'Green Material',
  type: 'basic',
  color: { r: 0, g: 1, b: 0 },
  opacity: 1.0,
  transparent: false,
  wireframe: true
});

console.log(`Created ${materialManager.getMaterialCount()} materials`);

// Assign materials to faces
const mesh = createCube();
mesh.getFace(0)!.materialIndex = redMaterial;
mesh.getFace(1)!.materialIndex = blueMaterial;
mesh.getFace(2)!.materialIndex = greenMaterial;

console.log('Materials assigned to faces');
```

### History System

```typescript
import { CommandHistory } from 'three-edit';

const history = new CommandHistory();
const mesh = createCube();

// Execute a series of commands
history.execute(new MoveCommand(mesh, new Vector3(1, 0, 0)));
history.execute(new RotateCommand(mesh, new Vector3(0, 1, 0), Math.PI / 4));
history.execute(new ScaleCommand(mesh, new Vector3(2, 1, 1)));

console.log(`History: ${history.canUndo() ? 'Can undo' : 'Cannot undo'}`);

// Undo operations
if (history.canUndo()) {
  history.undo();
  console.log('Undone last operation');
}

if (history.canUndo()) {
  history.undo();
  console.log('Undone second operation');
}

// Redo operations
if (history.canRedo()) {
  history.redo();
  console.log('Redone operation');
}

// Clear history
history.clear();
console.log('History cleared');
```

### Validation and Repair

```typescript
import { validateGeometryIntegrity, repairMesh } from 'three-edit';

const mesh = createCube();

// Validate mesh integrity
if (validateGeometryIntegrity(mesh)) {
  console.log('Mesh is valid');
} else {
  console.warn('Mesh has issues, attempting repair...');
  repairMesh(mesh);
  
  if (validateGeometryIntegrity(mesh)) {
    console.log('Mesh repaired successfully');
  } else {
    console.error('Failed to repair mesh');
  }
}

// Check mesh statistics
console.log(`Mesh statistics:`);
console.log(`- Vertices: ${mesh.getVertexCount()}`);
console.log(`- Edges: ${mesh.getEdgeCount()}`);
console.log(`- Faces: ${mesh.getFaceCount()}`);
```

### Conversion to Three.js

```typescript
import { toBufferGeometry, fromBufferGeometry } from 'three-edit';
import * as THREE from 'three';

// Create editable mesh
const editableMesh = createSphere({ radius: 1, segments: 32, rings: 16 });

// Convert to Three.js BufferGeometry
const geometry = toBufferGeometry(editableMesh);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const mesh3D = new THREE.Mesh(geometry, material);

console.log('Converted to Three.js mesh');

// Convert from Three.js BufferGeometry
const convertedMesh = fromBufferGeometry(geometry);

console.log(`Converted back: ${convertedMesh.getVertexCount()} vertices`);
```

### Performance Optimization

```typescript
import { createSphere, move, rotate, scale } from 'three-edit';

// Create a high-poly mesh
const mesh = createSphere({ radius: 1, segments: 64, rings: 32 });

console.log(`High-poly mesh: ${mesh.getVertexCount()} vertices`);

// Use selectedOnly for performance
const selectedVertices = [0, 1, 2, 3, 4, 5, 6, 7]; // Top vertices of sphere

// Move only selected vertices
move(mesh, {
  direction: new Vector3(0, 1, 0),
  distance: 0.5,
  selectedOnly: true
});

// Rotate only selected vertices
rotate(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 4,
  center: new Vector3(0, 0, 0),
  selectedOnly: true
});

console.log('Performance-optimized operations completed');
```

### Error Handling

```typescript
import { ThreeEditError, ValidationError, OperationError } from 'three-edit';

// Example error handling
try {
  const mesh = createCube();
  
  // Perform operations that might fail
  move(mesh, { direction: new Vector3(1, 0, 0), distance: 1 });
  rotate(mesh, { axis: new Vector3(0, 1, 0), angle: Math.PI / 4 });
  
  // Validate mesh
  if (!validateGeometryIntegrity(mesh)) {
    throw new ValidationError('Mesh validation failed');
  }
  
  console.log('Operations completed successfully');
  
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
    // Attempt repair
    repairMesh(mesh);
  } else if (error instanceof OperationError) {
    console.error('Operation error:', error.message);
  } else if (error instanceof ThreeEditError) {
    console.error('Three-Edit error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

This comprehensive tutorial series covers all major features of the three-edit library, from basic operations to advanced techniques. Each tutorial includes practical examples and best practices for effective 3D mesh editing. 