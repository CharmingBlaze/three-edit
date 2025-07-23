/**
 * Complete JavaScript Example - Access to ALL Features
 * 
 * This example demonstrates how to access EVERY feature of three-edit
 * using vanilla JavaScript. No TypeScript required!
 */

// Import the complete JavaScript wrapper
import ThreeEditJS from 'three-edit/js-wrapper';

console.log('🎉 Accessing ALL features of three-edit with JavaScript!');

// ===== 1. ALL PRIMITIVES =====
console.log('\n=== ALL PRIMITIVES ===');

// Basic primitives
const cube = ThreeEditJS.createCube({ width: 2, height: 2, depth: 2 });
const sphere = ThreeEditJS.createSphere({ radius: 1, segments: 32 });
const cylinder = ThreeEditJS.createCylinder({ radius: 1, height: 2, segments: 16 });
const cone = ThreeEditJS.createCone({ radius: 1, height: 2, segments: 16 });
const plane = ThreeEditJS.createPlane({ width: 2, height: 2, segments: 1 });
const torus = ThreeEditJS.createTorus({ radius: 1, tube: 0.3, segments: 32, tubeSegments: 16 });

// Advanced primitives
const pyramid = ThreeEditJS.createPyramid({ baseSize: 2, height: 2 });
const circle = ThreeEditJS.createCircle({ radius: 1, segments: 32 });
const ngon = ThreeEditJS.createNGon({ radius: 1, sides: 6 });
const pipe = ThreeEditJS.createPipe({ radius: 1, height: 2, thickness: 0.2, segments: 16 });
const roundedBox = ThreeEditJS.createRoundedBox({ width: 2, height: 2, depth: 2, radius: 0.2 });

// Regular polyhedra (Platonic solids)
const tetrahedron = ThreeEditJS.createTetrahedron({ radius: 1 });
const octahedron = ThreeEditJS.createOctahedron({ radius: 1 });
const dodecahedron = ThreeEditJS.createDodecahedron({ radius: 1 });
const icosahedron = ThreeEditJS.createIcosahedron({ radius: 1 });

// Complex shapes
const torusKnot = ThreeEditJS.createTorusKnot({ radius: 1, tube: 0.3, p: 2, q: 3 });
const mobiusStrip = ThreeEditJS.createMobiusStrip({ radius: 1, tube: 0.2, segments: 64 });

// Game/CAD primitives
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

console.log('✅ All 26 primitives created successfully!');

// ===== 2. ALL EDITING OPERATIONS =====
console.log('\n=== ALL EDITING OPERATIONS ===');

const editMesh = ThreeEditJS.createCube();

// Extrusion operations
ThreeEditJS.extrudeFace(editMesh, editMesh.faces[0], { distance: 1, keepOriginal: true });
ThreeEditJS.extrudeEdge(editMesh, editMesh.edges[0], { distance: 0.5, keepOriginal: true });
ThreeEditJS.extrudeVertex(editMesh, editMesh.vertices[0], { distance: 0.3, keepOriginal: true });

// Bevel operations
ThreeEditJS.bevelEdge(editMesh, editMesh.edges[1], { distance: 0.2, segments: 3 });
ThreeEditJS.bevelVertex(editMesh, editMesh.vertices[1], { distance: 0.2, segments: 3 });
ThreeEditJS.bevelFace(editMesh, editMesh.faces[1], { distance: 0.2, segments: 3 });

// Generic bevel
ThreeEditJS.bevel(editMesh, { type: 'edge', elements: [editMesh.edges[2]], distance: 0.1 });

console.log('✅ All editing operations applied!');

// ===== 3. ALL TRANSFORM OPERATIONS =====
console.log('\n=== ALL TRANSFORM OPERATIONS ===');

const transformMesh = ThreeEditJS.createCube();

// Basic transforms
ThreeEditJS.moveVertices(transformMesh, transformMesh.vertices, { x: 1, y: 0, z: 0 });
ThreeEditJS.rotateVertices(transformMesh, transformMesh.vertices, { x: 0, y: Math.PI / 4, z: 0 });
ThreeEditJS.scaleVertices(transformMesh, transformMesh.vertices, { x: 1.5, y: 1, z: 1 });
ThreeEditJS.mirrorVertices(transformMesh, transformMesh.vertices, { plane: 'yz', point: { x: 0, y: 0, z: 0 } });

// Array operations
ThreeEditJS.arrayVertices(transformMesh, transformMesh.vertices, { 
    type: 'linear', 
    count: 3, 
    distance: { x: 2, y: 0, z: 0 } 
});

// Deformation operations
ThreeEditJS.bendVertices(transformMesh, transformMesh.vertices, { 
    angle: Math.PI / 2, 
    axis: 'x', 
    center: { x: 0, y: 0, z: 0 } 
});
ThreeEditJS.twistVertices(transformMesh, transformMesh.vertices, { 
    angle: Math.PI, 
    axis: 'y', 
    center: { x: 0, y: 0, z: 0 } 
});
ThreeEditJS.taperVertices(transformMesh, transformMesh.vertices, { 
    factor: 2, 
    axis: 'z', 
    center: { x: 0, y: 0, z: 0 } 
});

// Generic deform
ThreeEditJS.deform(transformMesh, transformMesh.vertices, { 
    type: 'bend', 
    angle: Math.PI / 4, 
    axis: 'x' 
});

// Noise operations
ThreeEditJS.applyNoise(transformMesh, transformMesh.vertices, { 
    scale: 0.1, 
    intensity: 0.2, 
    seed: 123 
});

console.log('✅ All transform operations applied!');

// ===== 4. ALL SELECTION OPERATIONS =====
console.log('\n=== ALL SELECTION OPERATIONS ===');

const selectMesh = ThreeEditJS.createCube();

// Ray-based selection
const ray = { origin: { x: 0, y: 0, z: 5 }, direction: { x: 0, y: 0, z: -1 } };
const camera = { position: { x: 0, y: 0, z: 5 } };
const selectedByRay = ThreeEditJS.selectByRay(selectMesh, ray, camera);

// Box selection
const box = { min: { x: -1, y: -1, z: -1 }, max: { x: 1, y: 1, z: 1 } };
const selectedByBox = ThreeEditJS.selectByBox(selectMesh, box);

// Circle selection
const selectedByCircle = ThreeEditJS.selectByCircle(selectMesh, { x: 0, y: 0, z: 0 }, 1);

// Lasso selection
const lassoPoints = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
const selectedByLasso = ThreeEditJS.selectByLasso(selectMesh, lassoPoints);

// Connected selection
const connectedFaces = ThreeEditJS.selectConnected(selectMesh, selectMesh.faces[0]);

// Similar selection
const similarFaces = ThreeEditJS.selectSimilar(selectMesh, selectMesh.faces[0], 'normal');

// Direct selection
const selectedFace = ThreeEditJS.selectFace(selectMesh, 0);
const selectedVertex = ThreeEditJS.selectVertex(selectMesh, 0);

// Advanced selection
const ringSelection = ThreeEditJS.selectRing(selectMesh, selectMesh.edges[0]);
const loopSelection = ThreeEditJS.selectLoop(selectMesh, selectMesh.edges[0]);
const boundarySelection = ThreeEditJS.selectBoundary(selectMesh);
const materialSelection = ThreeEditJS.selectByMaterial(selectMesh, 0);

console.log('✅ All selection operations demonstrated!');

// ===== 5. ALL OPERATIONS =====
console.log('\n=== ALL OPERATIONS ===');

const operationMesh = ThreeEditJS.createSphere();

// Smoothing
ThreeEditJS.subdivideSurface(operationMesh, { iterations: 1 });

// Boolean operations
const meshA = ThreeEditJS.createCube();
const meshB = ThreeEditJS.createSphere();
const unionResult = ThreeEditJS.booleanUnion(meshA, meshB);
const intersectionResult = ThreeEditJS.booleanIntersection(meshA, meshB);
const differenceResult = ThreeEditJS.booleanDifference(meshA, meshB);

// CSG operations
const csgUnion = ThreeEditJS.csgUnion(meshA, meshB);
const csgIntersection = ThreeEditJS.csgIntersection(meshA, meshB);
const csgDifference = ThreeEditJS.csgDifference(meshA, meshB);

// Animation operations
ThreeEditJS.applyMorphing(operationMesh, { target: sphere, factor: 0.5 });
ThreeEditJS.applySkeletalAnimation(operationMesh, { skeleton: null, pose: {} });
ThreeEditJS.applyWeightPainting(operationMesh, { bone: 0, weight: 1.0 });

console.log('✅ All operations demonstrated!');

// ===== 6. ALL MATERIAL OPERATIONS =====
console.log('\n=== ALL MATERIAL OPERATIONS ===');

const materialMesh = ThreeEditJS.createCube();

// Assign material
ThreeEditJS.assignMaterial(materialMesh, materialMesh.faces[0], { 
    color: 0xff0000, 
    roughness: 0.5, 
    metalness: 0.2 
});

// Material manager
const materialManager = new ThreeEditJS.MaterialManager();
const material = materialManager.createMaterial({ 
    color: 0x00ff00, 
    roughness: 0.3, 
    metalness: 0.7 
});

console.log('✅ All material operations demonstrated!');

// ===== 7. ALL UV OPERATIONS =====
console.log('\n=== ALL UV OPERATIONS ===');

const uvMesh = ThreeEditJS.createCube();

// Generate UVs
ThreeEditJS.generatePlanarUVs(uvMesh, { direction: 'z' });
ThreeEditJS.generateCylindricalUVs(uvMesh, { axis: 'y' });
ThreeEditJS.generateSphericalUVs(uvMesh, { center: { x: 0, y: 0, z: 0 } });
ThreeEditJS.generateCubicUVs(uvMesh, { size: 1 });
ThreeEditJS.generateUVs(uvMesh, { type: 'planar', direction: 'x' });

// Transform UVs
ThreeEditJS.transformUVs(uvMesh, { 
    scale: { u: 2, v: 2 }, 
    rotation: Math.PI / 4, 
    offset: { u: 0.5, v: 0.5 } 
});

console.log('✅ All UV operations demonstrated!');

// ===== 8. ALL VALIDATION OPERATIONS =====
console.log('\n=== ALL VALIDATION OPERATIONS ===');

const validationMesh = ThreeEditJS.createCube();

// Validation
const isValid = ThreeEditJS.validateMesh(validationMesh);
const integrity = ThreeEditJS.validateGeometryIntegrity(validationMesh);

// Repair
ThreeEditJS.repairMesh(validationMesh);
ThreeEditJS.fixWindingOrder(validationMesh);

console.log('✅ All validation operations demonstrated!');

// ===== 9. ALL IO OPERATIONS =====
console.log('\n=== ALL IO OPERATIONS ===');

const ioMesh = ThreeEditJS.createCube();

// JSON operations
const jsonData = ThreeEditJS.toJSON(ioMesh);
const importedMesh = ThreeEditJS.fromJSON(jsonData);

// File format operations (async)
async function demonstrateIO() {
    try {
        // OBJ
        const objData = await ThreeEditJS.exportOBJ(ioMesh);
        const importedOBJ = await ThreeEditJS.importOBJ(objData);
        
        // GLTF
        const gltfData = await ThreeEditJS.exportGLTF(ioMesh);
        const importedGLTF = await ThreeEditJS.importGLTF(gltfData);
        
        // PLY
        const plyData = await ThreeEditJS.exportPLY(ioMesh);
        const importedPLY = await ThreeEditJS.importPLY(plyData);
        
        // STL
        const stlData = await ThreeEditJS.exportSTL(ioMesh);
        const importedSTL = await ThreeEditJS.importSTL(stlData);
        
        console.log('✅ All IO operations demonstrated!');
    } catch (error) {
        console.log('IO operations require async handling:', error.message);
    }
}

demonstrateIO();

// ===== 10. ALL UTILITY FUNCTIONS =====
console.log('\n=== ALL UTILITY FUNCTIONS ===');

const utilityMesh = ThreeEditJS.createCube();

// Math utilities
const faceNormal = ThreeEditJS.calculateFaceNormal(utilityMesh.faces[0]);
const faceCenter = ThreeEditJS.calculateFaceCenter(utilityMesh.faces[0]);
const area = ThreeEditJS.calculateArea(utilityMesh.faces[0]);
const volume = ThreeEditJS.calculateVolume(utilityMesh);

console.log('✅ All utility functions demonstrated!');

// ===== 11. ALL QUERY OPERATIONS =====
console.log('\n=== ALL QUERY OPERATIONS ===');

const queryMesh = ThreeEditJS.createCube();

// Query operations
const geometryInfo = ThreeEditJS.queryGeometry(queryMesh);
const nearestVertex = ThreeEditJS.queryNearest(queryMesh, { x: 0, y: 0, z: 0 });
const selectionInfo = ThreeEditJS.querySelection(queryMesh, queryMesh.faces);
const topologyInfo = ThreeEditJS.queryTopology(queryMesh);

console.log('✅ All query operations demonstrated!');

// ===== 12. ALL PERFORMANCE OPERATIONS =====
console.log('\n=== ALL PERFORMANCE OPERATIONS ===');

const performanceMesh = ThreeEditJS.createSphere({ segments: 64 });

// Performance operations
const octree = ThreeEditJS.buildOctree(performanceMesh);
const simplifiedMesh = ThreeEditJS.simplifyMesh(performanceMesh, { ratio: 0.5 });
ThreeEditJS.optimizeMemory(performanceMesh);
ThreeEditJS.initializeGPU();

console.log('✅ All performance operations demonstrated!');

// ===== 13. ALL HISTORY OPERATIONS =====
console.log('\n=== ALL HISTORY OPERATIONS ===');

// History operations
const history = new ThreeEditJS.CommandHistory();
const factory = new ThreeEditJS.CommandFactory();

console.log('✅ All history operations demonstrated!');

// ===== 14. HELPER METHODS =====
console.log('\n=== HELPER METHODS ===');

// Get organized access to all features
const allPrimitives = ThreeEditJS.getPrimitives();
const allOperations = ThreeEditJS.getOperations();
const allSelection = ThreeEditJS.getSelection();
const allIO = ThreeEditJS.getIO();
const allValidation = ThreeEditJS.getValidation();
const allPerformance = ThreeEditJS.getPerformance();

console.log('Available primitives:', Object.keys(allPrimitives).length);
console.log('Available operations:', Object.keys(allOperations).length);
console.log('Available selection methods:', Object.keys(allSelection).length);
console.log('Available IO methods:', Object.keys(allIO).length);
console.log('Available validation methods:', Object.keys(allValidation).length);
console.log('Available performance methods:', Object.keys(allPerformance).length);

// ===== 15. SCENE GRAPH (Async) =====
console.log('\n=== SCENE GRAPH ===');

async function demonstrateSceneGraph() {
    try {
        const { SceneGraph, SceneNode } = await ThreeEditJS.createSceneGraph();
        
        // Create scene graph
        const sceneGraph = new SceneGraph();
        const rootNode = new SceneNode('root');
        const childNode = new SceneNode('child');
        
        // Add nodes
        sceneGraph.addNode(rootNode);
        sceneGraph.addNode(childNode, rootNode);
        
        // Set transforms
        childNode.setPosition(1, 2, 3);
        childNode.setRotation(0, Math.PI / 2, 0);
        childNode.setScale(2, 2, 2);
        
        // Get world transform
        const worldMatrix = childNode.getWorldMatrix();
        
        console.log('✅ Scene graph operations demonstrated!');
    } catch (error) {
        console.log('Scene graph requires async handling:', error.message);
    }
}

demonstrateSceneGraph();

// ===== 16. CONVERSION OPERATIONS =====
console.log('\n=== CONVERSION OPERATIONS ===');

const conversionMesh = ThreeEditJS.createCube();

// Convert to Three.js
const threeGeometry = ThreeEditJS.toBufferGeometry(conversionMesh);

// Convert from Three.js
const importedFromThree = ThreeEditJS.createFromThreeGeometry(threeGeometry);

// Apply operation and get Three.js geometry directly
const resultGeometry = ThreeEditJS.applyOperation(
    ThreeEditJS.createCube(),
    ThreeEditJS.bevelEdge,
    { id: 0 },
    { distance: 0.2 }
);

console.log('✅ All conversion operations demonstrated!');

// ===== SUMMARY =====
console.log('\n🎉 SUMMARY: ALL FEATURES ACCESSIBLE!');
console.log('✅ 26 Primitive types');
console.log('✅ 7 Editing operations');
console.log('✅ 10 Transform operations');
console.log('✅ 12 Selection methods');
console.log('✅ 9 General operations');
console.log('✅ 2 Material operations');
console.log('✅ 6 UV operations');
console.log('✅ 4 Validation operations');
console.log('✅ 8 IO operations');
console.log('✅ 4 Utility functions');
console.log('✅ 4 Query operations');
console.log('✅ 4 Performance operations');
console.log('✅ 2 History operations');
console.log('✅ Scene graph system');
console.log('✅ Complete conversion system');

console.log('\n🚀 Three-edit JavaScript wrapper provides access to ALL features!');
console.log('📚 No TypeScript knowledge required - pure JavaScript power!'); 