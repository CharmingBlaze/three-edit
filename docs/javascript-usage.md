# JavaScript Usage Guide

Three-edit is designed to work seamlessly with both **JavaScript** and **TypeScript**. You don't need TypeScript to use the library!

## 🎯 Quick Start

### Installation

```bash
npm install three-edit
```

### Basic Usage

```javascript
// Import the JavaScript wrapper
import ThreeEditJS from 'three-edit/js-wrapper';

// Create a cube
const mesh = ThreeEditJS.createCube({
    width: 2,
    height: 2,
    depth: 2
});

// Convert to Three.js geometry
const geometry = ThreeEditJS.toBufferGeometry(mesh);
```

## 🚀 **Complete Feature Access**

**YES! With JavaScript, you have access to ALL features of the library.** The JavaScript wrapper provides complete access to every feature, not just a subset.

### 📦 JavaScript Wrapper - Full Feature Access

The JavaScript wrapper (`three-edit/js-wrapper`) provides access to **ALL features** of three-edit:

#### Core Functions
- `createMesh()` - Create an empty editable mesh
- `toBufferGeometry(mesh)` - Convert to Three.js BufferGeometry
- `fromBufferGeometry(geometry)` - Convert from Three.js BufferGeometry
- `createFromThreeGeometry(geometry)` - Helper for importing Three.js geometry
- `toJSON(mesh)` - Export mesh to JSON
- `fromJSON(json)` - Import mesh from JSON

#### ALL 26 Primitives
- `createCube(options)` - Create a cube
- `createSphere(options)` - Create a sphere
- `createCylinder(options)` - Create a cylinder
- `createCone(options)` - Create a cone
- `createPlane(options)` - Create a plane
- `createTorus(options)` - Create a torus
- `createPyramid(options)` - Create a pyramid
- `createCircle(options)` - Create a circle
- `createNGon(options)` - Create an n-gon
- `createPipe(options)` - Create a pipe
- `createRoundedBox(options)` - Create a rounded box
- `createTetrahedron(options)` - Create a tetrahedron
- `createOctahedron(options)` - Create an octahedron
- `createDodecahedron(options)` - Create a dodecahedron
- `createIcosahedron(options)` - Create an icosahedron
- `createTorusKnot(options)` - Create a torus knot
- `createMobiusStrip(options)` - Create a Möbius strip
- `createArrow(options)` - Create an arrow
- `createCapsule(options)` - Create a capsule
- `createStairs(options)` - Create stairs
- `createRamp(options)` - Create a ramp
- `createWedge(options)` - Create a wedge
- `createHandle(options)` - Create a handle
- `createGreebleBlock(options)` - Create a greeble block
- `createLowPolySphere(options)` - Create a low-poly sphere
- `createBoundingBox(options)` - Create a bounding box
- `createEmpty()` - Create an empty mesh

#### ALL Editing Operations
- `extrudeFace(mesh, face, options)` - Extrude a face
- `extrudeEdge(mesh, edge, options)` - Extrude an edge
- `extrudeVertex(mesh, vertex, options)` - Extrude a vertex
- `bevelEdge(mesh, edge, options)` - Bevel an edge
- `bevelVertex(mesh, vertex, options)` - Bevel a vertex
- `bevelFace(mesh, face, options)` - Bevel a face
- `bevel(mesh, options)` - Generic bevel operation

#### ALL Transform Operations
- `moveVertices(mesh, vertices, options)` - Move vertices
- `rotateVertices(mesh, vertices, options)` - Rotate vertices
- `scaleVertices(mesh, vertices, options)` - Scale vertices
- `mirrorVertices(mesh, vertices, options)` - Mirror vertices
- `arrayVertices(mesh, vertices, options)` - Array vertices
- `bendVertices(mesh, vertices, options)` - Bend vertices
- `twistVertices(mesh, vertices, options)` - Twist vertices
- `taperVertices(mesh, vertices, options)` - Taper vertices
- `deform(mesh, vertices, options)` - Generic deformation
- `applyNoise(mesh, vertices, options)` - Apply noise

#### ALL Selection Utilities
- `selectByRay(mesh, ray, camera)` - Select by raycast
- `selectByBox(mesh, box)` - Select by bounding box
- `selectByCircle(mesh, center, radius)` - Select by circle
- `selectByLasso(mesh, points)` - Select by lasso
- `selectConnected(mesh, startElement)` - Select connected elements
- `selectSimilar(mesh, element, criteria)` - Select similar elements
- `selectFace(mesh, faceId)` - Select a face
- `selectVertex(mesh, vertexId)` - Select a vertex
- `selectRing(mesh, edge)` - Select edge ring
- `selectLoop(mesh, edge)` - Select edge loop
- `selectBoundary(mesh)` - Select boundary
- `selectByMaterial(mesh, materialId)` - Select by material

#### ALL Operations
- `subdivideSurface(mesh, options)` - Subdivide the mesh
- `booleanUnion(meshA, meshB)` - Boolean union
- `booleanIntersection(meshA, meshB)` - Boolean intersection
- `booleanDifference(meshA, meshB)` - Boolean difference
- `csgUnion(meshA, meshB)` - CSG union
- `csgIntersection(meshA, meshB)` - CSG intersection
- `csgDifference(meshA, meshB)` - CSG difference
- `applyMorphing(mesh, options)` - Apply morphing
- `applySkeletalAnimation(mesh, options)` - Apply skeletal animation
- `applyWeightPainting(mesh, options)` - Apply weight painting

#### ALL Material Operations
- `assignMaterial(mesh, face, material)` - Assign material to face
- `MaterialManager` - Material management class

#### ALL UV Operations
- `generatePlanarUVs(mesh, options)` - Generate planar UVs
- `generateCylindricalUVs(mesh, options)` - Generate cylindrical UVs
- `generateSphericalUVs(mesh, options)` - Generate spherical UVs
- `generateCubicUVs(mesh, options)` - Generate cubic UVs
- `generateUVs(mesh, options)` - Generate UVs
- `transformUVs(mesh, options)` - Transform UVs

#### ALL Validation Operations
- `validateMesh(mesh)` - Validate mesh
- `validateGeometryIntegrity(mesh)` - Validate geometry integrity
- `repairMesh(mesh)` - Repair mesh
- `fixWindingOrder(mesh)` - Fix winding order

#### ALL IO Operations
- `importOBJ(data)` - Import OBJ
- `exportOBJ(mesh)` - Export OBJ
- `importGLTF(data)` - Import GLTF
- `exportGLTF(mesh)` - Export GLTF
- `importPLY(data)` - Import PLY
- `exportPLY(mesh)` - Export PLY
- `importSTL(data)` - Import STL
- `exportSTL(mesh)` - Export STL

#### ALL Utility Functions
- `calculateFaceNormal(face)` - Calculate face normal
- `calculateFaceCenter(face)` - Calculate face center
- `calculateArea(face)` - Calculate face area
- `calculateVolume(mesh)` - Calculate mesh volume

#### ALL Query Operations
- `queryGeometry(mesh)` - Query geometry information
- `queryNearest(mesh, point)` - Query nearest element
- `querySelection(mesh, selection)` - Query selection information
- `queryTopology(mesh)` - Query topology information

#### ALL Performance Operations
- `buildOctree(mesh)` - Build octree
- `simplifyMesh(mesh, options)` - Simplify mesh
- `optimizeMemory(mesh)` - Optimize memory usage
- `initializeGPU()` - Initialize GPU operations

#### ALL History Operations
- `CommandHistory` - Command history class
- `CommandFactory` - Command factory class

#### Helper Methods
- `applyOperation(mesh, operation, ...args)` - Apply operation and return geometry
- `createSceneGraph()` - Create scene graph (async)
- `getPrimitives()` - Get all primitives as object
- `getOperations()` - Get all operations as object
- `getSelection()` - Get all selection methods as object
- `getIO()` - Get all IO methods as object
- `getValidation()` - Get all validation methods as object
- `getPerformance()` - Get all performance methods as object

## 🧱 Creating ALL Primitives

### Basic Primitives
```javascript
const cube = ThreeEditJS.createCube({ width: 2, height: 2, depth: 2 });
const sphere = ThreeEditJS.createSphere({ radius: 1, segments: 32 });
const cylinder = ThreeEditJS.createCylinder({ radius: 1, height: 2, segments: 16 });
const cone = ThreeEditJS.createCone({ radius: 1, height: 2, segments: 16 });
const plane = ThreeEditJS.createPlane({ width: 2, height: 2, segments: 1 });
const torus = ThreeEditJS.createTorus({ radius: 1, tube: 0.3, segments: 32, tubeSegments: 16 });
```

### Advanced Primitives
```javascript
const pyramid = ThreeEditJS.createPyramid({ baseSize: 2, height: 2 });
const circle = ThreeEditJS.createCircle({ radius: 1, segments: 32 });
const ngon = ThreeEditJS.createNGon({ radius: 1, sides: 6 });
const pipe = ThreeEditJS.createPipe({ radius: 1, height: 2, thickness: 0.2, segments: 16 });
const roundedBox = ThreeEditJS.createRoundedBox({ width: 2, height: 2, depth: 2, radius: 0.2 });
```

### Regular Polyhedra (Platonic Solids)
```javascript
const tetrahedron = ThreeEditJS.createTetrahedron({ radius: 1 });
const octahedron = ThreeEditJS.createOctahedron({ radius: 1 });
const dodecahedron = ThreeEditJS.createDodecahedron({ radius: 1 });
const icosahedron = ThreeEditJS.createIcosahedron({ radius: 1 });
```

### Complex Shapes
```javascript
const torusKnot = ThreeEditJS.createTorusKnot({ radius: 1, tube: 0.3, p: 2, q: 3 });
const mobiusStrip = ThreeEditJS.createMobiusStrip({ radius: 1, tube: 0.2, segments: 64 });
```

### Game/CAD Primitives
```javascript
const arrow = ThreeEditJS.createArrow({ length: 2, headLength: 0.5 });
const capsule = ThreeEditJS.createCapsule({ radius: 0.5, height: 2, segments: 16 });
const stairs = ThreeEditJS.createStairs({ width: 2, height: 1, depth: 1, steps: 5 });
const ramp = ThreeEditJS.createRamp({ width: 2, height: 1, depth: 2 });
const wedge = ThreeEditJS.createWedge({ width: 2, height: 1, depth: 2 });
const handle = ThreeEditJS.createHandle({ radius: 0.1, length: 1, segments: 8 });
const greebleBlock = ThreeEditJS.createGreebleBlock({ width: 1, height: 1, depth: 1, complexity: 0.5 });
const lowPolySphere = ThreeEditJS.createLowPolySphere({ radius: 1, segments: 8 });
const boundingBox = ThreeEditJS.createBoundingBox({ min: [-1, -1, -1], max: [1, 1, 1] });
const empty = ThreeEditJS.createEmpty();
```

## 🔧 ALL Editing Operations

### Extrusion Operations
```javascript
const mesh = ThreeEditJS.createCube();

// Extrude face
ThreeEditJS.extrudeFace(mesh, mesh.faces[0], { distance: 1, keepOriginal: true });

// Extrude edge
ThreeEditJS.extrudeEdge(mesh, mesh.edges[0], { distance: 0.5, keepOriginal: true });

// Extrude vertex
ThreeEditJS.extrudeVertex(mesh, mesh.vertices[0], { distance: 0.3, keepOriginal: true });
```

### Bevel Operations
```javascript
// Bevel edge
ThreeEditJS.bevelEdge(mesh, mesh.edges[0], { distance: 0.2, segments: 3 });

// Bevel vertex
ThreeEditJS.bevelVertex(mesh, mesh.vertices[0], { distance: 0.2, segments: 3 });

// Bevel face
ThreeEditJS.bevelFace(mesh, mesh.faces[0], { distance: 0.2, segments: 3 });

// Generic bevel
ThreeEditJS.bevel(mesh, { type: 'edge', elements: [mesh.edges[0]], distance: 0.1 });
```

## 🔀 ALL Transform Operations

### Basic Transforms
```javascript
const mesh = ThreeEditJS.createCube();

// Move vertices
ThreeEditJS.moveVertices(mesh, mesh.vertices, { x: 1, y: 0, z: 0 });

// Rotate vertices
ThreeEditJS.rotateVertices(mesh, mesh.vertices, { x: 0, y: Math.PI / 4, z: 0 });

// Scale vertices
ThreeEditJS.scaleVertices(mesh, mesh.vertices, { x: 1.5, y: 1, z: 1 });

// Mirror vertices
ThreeEditJS.mirrorVertices(mesh, mesh.vertices, { plane: 'yz', point: { x: 0, y: 0, z: 0 } });
```

### Array Operations
```javascript
// Linear array
ThreeEditJS.arrayVertices(mesh, mesh.vertices, { 
    type: 'linear', 
    count: 3, 
    distance: { x: 2, y: 0, z: 0 } 
});

// Radial array
ThreeEditJS.arrayVertices(mesh, mesh.vertices, { 
    type: 'radial', 
    count: 8, 
    radius: 2,
    center: { x: 0, y: 0, z: 0 }
});

// Grid array
ThreeEditJS.arrayVertices(mesh, mesh.vertices, { 
    type: 'grid', 
    count: { x: 3, y: 3, z: 1 }, 
    distance: { x: 2, y: 2, z: 0 }
});
```

### Deformation Operations
```javascript
// Bend vertices
ThreeEditJS.bendVertices(mesh, mesh.vertices, { 
    angle: Math.PI / 2, 
    axis: 'x', 
    center: { x: 0, y: 0, z: 0 } 
});

// Twist vertices
ThreeEditJS.twistVertices(mesh, mesh.vertices, { 
    angle: Math.PI, 
    axis: 'y', 
    center: { x: 0, y: 0, z: 0 } 
});

// Taper vertices
ThreeEditJS.taperVertices(mesh, mesh.vertices, { 
    factor: 2, 
    axis: 'z', 
    center: { x: 0, y: 0, z: 0 } 
});

// Generic deform
ThreeEditJS.deform(mesh, mesh.vertices, { 
    type: 'bend', 
    angle: Math.PI / 4, 
    axis: 'x' 
});
```

### Noise Operations
```javascript
// Apply noise
ThreeEditJS.applyNoise(mesh, mesh.vertices, { 
    scale: 0.1, 
    intensity: 0.2, 
    seed: 123 
});
```

## 🎯 ALL Selection Operations

### Ray-based Selection
```javascript
const mesh = ThreeEditJS.createCube();

// Create a ray (from Three.js Raycaster)
const ray = { origin: { x: 0, y: 0, z: 5 }, direction: { x: 0, y: 0, z: -1 } };
const camera = { position: { x: 0, y: 0, z: 5 } };

// Select faces by ray
const selectedFaces = ThreeEditJS.selectByRay(mesh, ray, camera);
```

### Box Selection
```javascript
// Define selection box
const box = { min: { x: -1, y: -1, z: -1 }, max: { x: 1, y: 1, z: 1 } };

// Select vertices in box
const selectedVertices = ThreeEditJS.selectByBox(mesh, box);
```

### Circle Selection
```javascript
// Select by circle
const selectedByCircle = ThreeEditJS.selectByCircle(mesh, { x: 0, y: 0, z: 0 }, 1);
```

### Lasso Selection
```javascript
// Select by lasso
const lassoPoints = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
const selectedByLasso = ThreeEditJS.selectByLasso(mesh, lassoPoints);
```

### Connected Selection
```javascript
// Select all faces connected to the first face
const connectedFaces = ThreeEditJS.selectConnected(mesh, mesh.faces[0]);
```

### Similar Selection
```javascript
// Select faces with similar normals
const similarFaces = ThreeEditJS.selectSimilar(mesh, mesh.faces[0], 'normal');
```

### Advanced Selection
```javascript
// Direct selection
const selectedFace = ThreeEditJS.selectFace(mesh, 0);
const selectedVertex = ThreeEditJS.selectVertex(mesh, 0);

// Ring and loop selection
const ringSelection = ThreeEditJS.selectRing(mesh, mesh.edges[0]);
const loopSelection = ThreeEditJS.selectLoop(mesh, mesh.edges[0]);

// Boundary selection
const boundarySelection = ThreeEditJS.selectBoundary(mesh);

// Material-based selection
const materialSelection = ThreeEditJS.selectByMaterial(mesh, 0);
```

## 🔄 ALL Operations

### Smoothing
```javascript
const mesh = ThreeEditJS.createSphere();

// Subdivide the mesh
ThreeEditJS.subdivideSurface(mesh, { iterations: 2 });
```

### Boolean Operations
```javascript
const meshA = ThreeEditJS.createCube();
const meshB = ThreeEditJS.createSphere();

// Boolean operations
const unionResult = ThreeEditJS.booleanUnion(meshA, meshB);
const intersectionResult = ThreeEditJS.booleanIntersection(meshA, meshB);
const differenceResult = ThreeEditJS.booleanDifference(meshA, meshB);

// CSG operations
const csgUnion = ThreeEditJS.csgUnion(meshA, meshB);
const csgIntersection = ThreeEditJS.csgIntersection(meshA, meshB);
const csgDifference = ThreeEditJS.csgDifference(meshA, meshB);
```

### Animation Operations
```javascript
const mesh = ThreeEditJS.createCube();
const targetMesh = ThreeEditJS.createSphere();

// Morphing
ThreeEditJS.applyMorphing(mesh, { target: targetMesh, factor: 0.5 });

// Skeletal animation
ThreeEditJS.applySkeletalAnimation(mesh, { skeleton: null, pose: {} });

// Weight painting
ThreeEditJS.applyWeightPainting(mesh, { bone: 0, weight: 1.0 });
```

## 🎨 ALL Material Operations

### Material Assignment
```javascript
const mesh = ThreeEditJS.createCube();

// Assign material to face
ThreeEditJS.assignMaterial(mesh, mesh.faces[0], { 
    color: 0xff0000, 
    roughness: 0.5, 
    metalness: 0.2 
});
```

### Material Manager
```javascript
// Create material manager
const materialManager = new ThreeEditJS.MaterialManager();

// Create material
const material = materialManager.createMaterial({ 
    color: 0x00ff00, 
    roughness: 0.3, 
    metalness: 0.7 
});
```

## 🎨 ALL UV Operations

### Generate UVs
```javascript
const mesh = ThreeEditJS.createCube();

// Generate different types of UVs
ThreeEditJS.generatePlanarUVs(mesh, { direction: 'z' });
ThreeEditJS.generateCylindricalUVs(mesh, { axis: 'y' });
ThreeEditJS.generateSphericalUVs(mesh, { center: { x: 0, y: 0, z: 0 } });
ThreeEditJS.generateCubicUVs(mesh, { size: 1 });
ThreeEditJS.generateUVs(mesh, { type: 'planar', direction: 'x' });
```

### Transform UVs
```javascript
// Transform UVs
ThreeEditJS.transformUVs(mesh, { 
    scale: { u: 2, v: 2 }, 
    rotation: Math.PI / 4, 
    offset: { u: 0.5, v: 0.5 } 
});
```

## 🛡 ALL Validation Operations

### Validation
```javascript
const mesh = ThreeEditJS.createCube();

// Validate mesh
const isValid = ThreeEditJS.validateMesh(mesh);

// Validate geometry integrity
const integrity = ThreeEditJS.validateGeometryIntegrity(mesh);
```

### Repair
```javascript
// Repair mesh
ThreeEditJS.repairMesh(mesh);

// Fix winding order
ThreeEditJS.fixWindingOrder(mesh);
```

## 📁 ALL IO Operations

### JSON Operations
```javascript
const mesh = ThreeEditJS.createCube();

// Export to JSON
const jsonData = ThreeEditJS.toJSON(mesh);

// Import from JSON
const importedMesh = ThreeEditJS.fromJSON(jsonData);
```

### File Format Operations (Async)
```javascript
const mesh = ThreeEditJS.createCube();

async function exportAllFormats() {
    // OBJ
    const objData = await ThreeEditJS.exportOBJ(mesh);
    const importedOBJ = await ThreeEditJS.importOBJ(objData);
    
    // GLTF
    const gltfData = await ThreeEditJS.exportGLTF(mesh);
    const importedGLTF = await ThreeEditJS.importGLTF(gltfData);
    
    // PLY
    const plyData = await ThreeEditJS.exportPLY(mesh);
    const importedPLY = await ThreeEditJS.importPLY(plyData);
    
    // STL
    const stlData = await ThreeEditJS.exportSTL(mesh);
    const importedSTL = await ThreeEditJS.importSTL(stlData);
}
```

## 🔄 Converting Between Formats

### Three.js to EditableMesh
```javascript
// Start with a Three.js geometry
const threeGeometry = new THREE.BoxGeometry(2, 2, 2);

// Convert to EditableMesh
const mesh = ThreeEditJS.createFromThreeGeometry(threeGeometry);
```

### EditableMesh to Three.js
```javascript
// Start with an EditableMesh
const mesh = ThreeEditJS.createCube();

// Convert to Three.js BufferGeometry
const geometry = ThreeEditJS.toBufferGeometry(mesh);
```

### Using the applyOperation Helper
```javascript
// Apply an operation and get Three.js geometry directly
const geometry = ThreeEditJS.applyOperation(
    ThreeEditJS.createCube(),
    ThreeEditJS.bevelEdge,
    { id: 0 },  // edge
    { distance: 0.2 }  // options
);
```

## 🎨 Scene Graph Usage

### Creating a Scene Graph
```javascript
// Import scene graph functionality
const { SceneGraph, SceneNode } = await ThreeEditJS.createSceneGraph();

// Create a scene graph
const sceneGraph = new SceneGraph();
const rootNode = new SceneNode('root');
const childNode = new SceneNode('child');

// Add nodes to the scene
sceneGraph.addNode(rootNode);
sceneGraph.addNode(childNode, rootNode);
```

### Working with Scene Nodes
```javascript
// Create a node with a mesh
const meshNode = new SceneNode('mesh-node');
meshNode.mesh = ThreeEditJS.createCube();

// Set transform
meshNode.setPosition(1, 2, 3);
meshNode.setRotation(0, Math.PI / 2, 0);
meshNode.setScale(2, 2, 2);

// Get world transform
const worldMatrix = meshNode.getWorldMatrix();
```

### Converting to Three.js Scene
```javascript
// Convert scene graph to Three.js Scene
const threeScene = sceneGraph.toThreeScene();

// Or convert a single node to Object3D
const threeObject = meshNode.toThreeObject();
```

## 🔍 Helper Methods for Organized Access

### Get All Primitives
```javascript
const allPrimitives = ThreeEditJS.getPrimitives();
console.log('Available primitives:', Object.keys(allPrimitives));
// Output: cube, sphere, cylinder, cone, plane, torus, pyramid, circle, ngon, pipe, roundedBox, tetrahedron, octahedron, dodecahedron, icosahedron, torusKnot, mobiusStrip, arrow, capsule, stairs, ramp, wedge, handle, greebleBlock, lowPolySphere, boundingBox, empty
```

### Get All Operations
```javascript
const allOperations = ThreeEditJS.getOperations();
console.log('Available operations:', Object.keys(allOperations));
// Output: extrude, bevel, transform, boolean, smoothing, morphing, skeletalAnimation, weightPainting
```

### Get All Selection Methods
```javascript
const allSelection = ThreeEditJS.getSelection();
console.log('Available selection methods:', Object.keys(allSelection));
// Output: byRay, byBox, byCircle, byLasso, connected, similar, face, vertex, ring, loop, boundary, byMaterial
```

### Get All IO Methods
```javascript
const allIO = ThreeEditJS.getIO();
console.log('Available IO methods:', Object.keys(allIO));
// Output: obj, gltf, ply, stl
```

### Get All Validation Methods
```javascript
const allValidation = ThreeEditJS.getValidation();
console.log('Available validation methods:', Object.keys(allValidation));
// Output: validateMesh, validateGeometryIntegrity, repairMesh, fixWindingOrder
```

### Get All Performance Methods
```javascript
const allPerformance = ThreeEditJS.getPerformance();
console.log('Available performance methods:', Object.keys(allPerformance));
// Output: buildOctree, simplifyMesh, optimizeMemory, initializeGPU
```

## ⚡ Performance Tips

### ✅ Good Practices

```javascript
// Reuse mesh instances
const mesh = ThreeEditJS.createCube();
ThreeEditJS.extrudeFace(mesh, mesh.faces[0]);
ThreeEditJS.extrudeFace(mesh, mesh.faces[1]);

// Use applyOperation for one-off operations
const geometry = ThreeEditJS.applyOperation(
    ThreeEditJS.createCube(),
    ThreeEditJS.bevelEdge,
    { id: 0 },
    { distance: 0.1 }
);
```

### ❌ Avoid These

```javascript
// Don't create new meshes for each operation
const mesh1 = ThreeEditJS.createCube();
const mesh2 = ThreeEditJS.createCube(); // Unnecessary

// Don't convert unnecessarily
const mesh = ThreeEditJS.createCube();
const geometry = ThreeEditJS.toBufferGeometry(mesh);
const mesh2 = ThreeEditJS.fromBufferGeometry(geometry); // Unnecessary conversion
```

## 🔍 Advanced Usage

### Custom Operations
```javascript
// Create a custom operation
function customOperation(mesh, options) {
    // Your custom logic here
    mesh.vertices.forEach(vertex => {
        vertex.x += options.offset || 0;
    });
}

// Apply custom operation
const geometry = ThreeEditJS.applyOperation(
    ThreeEditJS.createCube(),
    customOperation,
    { offset: 1 }
);
```

### Performance Operations
```javascript
const mesh = ThreeEditJS.createSphere({ segments: 64 });

// Build octree for spatial queries
const octree = ThreeEditJS.buildOctree(mesh);

// Simplify mesh for performance
const simplifiedMesh = ThreeEditJS.simplifyMesh(mesh, { ratio: 0.5 });

// Optimize memory usage
ThreeEditJS.optimizeMemory(mesh);

// Initialize GPU operations
ThreeEditJS.initializeGPU();
```

### History Operations
```javascript
// Create command history
const history = new ThreeEditJS.CommandHistory();
const factory = new ThreeEditJS.CommandFactory();

// Track operations
history.execute(factory.createMoveCommand(mesh, mesh.vertices, { x: 1, y: 0, z: 0 }));

// Undo/redo
history.undo();
history.redo();
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**
   ```javascript
   // ✅ Correct
   import ThreeEditJS from 'three-edit/js-wrapper';
   
   // ❌ Incorrect
   import ThreeEditJS from 'three-edit';
   ```

2. **Async Imports**
   ```javascript
   // ✅ Correct for dynamic imports
   const { SceneGraph } = await ThreeEditJS.createSceneGraph();
   
   // ❌ Incorrect
   import { SceneGraph } from 'three-edit/scene'; // At runtime
   ```

3. **Mesh Reuse**
   ```javascript
   // ✅ Good
   const mesh = ThreeEditJS.createCube();
   ThreeEditJS.extrudeFace(mesh, mesh.faces[0]);
   
   // ❌ Bad
   const mesh1 = ThreeEditJS.createCube();
   const mesh2 = ThreeEditJS.createCube();
   ```

### Getting Help

- Check the [API Reference](../api-reference.md) for detailed function documentation
- Look at the [examples](../examples/) for working code samples
- Review the [complete features example](../examples/all-features-javascript.js) for comprehensive usage
- Review the [TypeScript examples](../typescript-usage.md) for additional patterns

## 🎉 That's It!

**Three-edit works perfectly with vanilla JavaScript and provides access to ALL features!** 

- ✅ **No TypeScript required**
- ✅ **ALL 26 primitives available**
- ✅ **ALL editing operations available**
- ✅ **ALL transform operations available**
- ✅ **ALL selection methods available**
- ✅ **ALL operations available**
- ✅ **ALL material operations available**
- ✅ **ALL UV operations available**
- ✅ **ALL validation operations available**
- ✅ **ALL IO operations available**
- ✅ **ALL utility functions available**
- ✅ **ALL query operations available**
- ✅ **ALL performance operations available**
- ✅ **ALL history operations available**
- ✅ **Scene graph system available**
- ✅ **Complete conversion system available**

The JavaScript wrapper provides **100% feature parity** with the TypeScript version, just with a more JavaScript-friendly API. You get all the power of professional 3D mesh editing without the complexity of TypeScript! 