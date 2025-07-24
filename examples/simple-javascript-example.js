/**
 * Simple JavaScript Example for Three-Edit
 * 
 * This example shows how to use three-edit with vanilla JavaScript.
 * No TypeScript required!
 */

// Import the JavaScript wrapper
import ThreeEditJS from 'three-edit/js-wrapper';

// Example 1: Create a basic cube
console.log('=== Creating a Cube ===');
const cube = ThreeEditJS.createCube({
    width: 2,
    height: 2,
    depth: 2
});
console.log('Cube created:', cube);

// Example 2: Create a sphere
console.log('\n=== Creating a Sphere ===');
const sphere = ThreeEditJS.createSphere({
    radius: 1,
    segments: 32
});
console.log('Sphere created:', sphere);

// Example 3: Create a cylinder
console.log('\n=== Creating a Cylinder ===');
const cylinder = ThreeEditJS.createCylinder({
    radius: 1,
    height: 2,
    segments: 16
});
console.log('Cylinder created:', cylinder);

// Example 4: Create a plane
console.log('\n=== Creating a Plane ===');
const plane = ThreeEditJS.createPlane({
    width: 4,
    height: 4,
    widthSegments: 4,
    heightSegments: 4
});
console.log('Plane created:', plane);

// Example 5: Convert to Three.js geometry
console.log('\n=== Converting to Three.js ===');
const geometry = ThreeEditJS.toBufferGeometry(cube);
console.log('Three.js geometry created:', geometry);

// Example 6: Import from Three.js geometry
console.log('\n=== Importing from Three.js ===');
const importedMesh = ThreeEditJS.createFromThreeGeometry(geometry);
console.log('Imported mesh:', importedMesh);

// Example 7: Apply operations
console.log('\n=== Applying Operations ===');
const mesh = ThreeEditJS.createCube();

// Extrude a face
if (mesh.faces.length > 0) {
    ThreeEditJS.extrudeFace(mesh, mesh.faces[0], { distance: 1 });
    console.log('Face extruded');
}

// Bevel an edge
if (mesh.edges.length > 0) {
    ThreeEditJS.bevelEdge(mesh, mesh.edges[0], { distance: 0.2 });
    console.log('Edge beveled');
}

// Convert back to Three.js
const resultGeometry = ThreeEditJS.toBufferGeometry(mesh);
console.log('Final geometry:', resultGeometry);

// Example 8: Using the applyOperation helper
console.log('\n=== Using applyOperation Helper ===');
const simpleMesh = ThreeEditJS.createCube();
const finalGeometry = ThreeEditJS.applyOperation(
    simpleMesh, 
    ThreeEditJS.bevelEdge, 
    simpleMesh.edges[0], 
    { distance: 0.3 }
);
console.log('Operation applied and geometry returned:', finalGeometry);

// Example 9: Using helper functions
console.log('\n=== Using Helper Functions ===');
const helpers = ThreeEditJS.getHelpers();

// Math helpers
const math = helpers.math;
console.log('Math helpers available:', Object.keys(math));

// Geometry helpers
const geometryHelpers = helpers.geometry;
console.log('Geometry helpers available:', Object.keys(geometryHelpers));

// Editor helpers
const editorHelpers = helpers.editor;
console.log('Editor helpers available:', Object.keys(editorHelpers));

// Utility helpers
const utilityHelpers = helpers.utilities;
console.log('Utility helpers available:', Object.keys(utilityHelpers));

// Example 10: Using primitives helper
console.log('\n=== Using Primitives Helper ===');
const primitives = ThreeEditJS.getPrimitives();
console.log('Available primitives:', Object.keys(primitives));

// Example 11: Using operations helper
console.log('\n=== Using Operations Helper ===');
const operations = ThreeEditJS.getOperations();
console.log('Available operations:', Object.keys(operations));

// Example 12: Validation and debugging
console.log('\n=== Validation and Debugging ===');
const testMesh = ThreeEditJS.createCube();

// Validate mesh
const validation = ThreeEditJS.validateMesh(testMesh);
console.log('Mesh validation:', validation);

// Debug mesh
ThreeEditJS.getHelpers().utilities.debugMesh(testMesh);

// Example 13: Face operations
console.log('\n=== Face Operations ===');
const faceMesh = ThreeEditJS.createCube();
const face = faceMesh.faces[0];

// Calculate face normal
const normal = ThreeEditJS.calculateFaceNormal(face);
console.log('Face normal:', normal);

// Calculate face center
const center = ThreeEditJS.calculateFaceCenter(face);
console.log('Face center:', center);

// Example 14: Performance tips
console.log('\n=== Performance Tips ===');

// ✅ Good: Reuse mesh instances
const reusableMesh = ThreeEditJS.createCube();
ThreeEditJS.extrudeFace(reusableMesh, reusableMesh.faces[0]);
ThreeEditJS.extrudeFace(reusableMesh, reusableMesh.faces[1]);
console.log('Reused mesh for multiple operations');

// ✅ Good: Use applyOperation for one-off operations
const oneOffGeometry = ThreeEditJS.applyOperation(
    ThreeEditJS.createCube(),
    ThreeEditJS.bevelEdge,
    { id: 0 },
    { distance: 0.1 }
);
console.log('One-off operation completed');

// ❌ Avoid: Creating new meshes for each operation
// const mesh1 = ThreeEditJS.createCube();
// const mesh2 = ThreeEditJS.createCube(); // Unnecessary

// Example 15: UV generation
console.log('\n=== UV Generation ===');
const uvMesh = ThreeEditJS.createCube();

// Generate planar UVs
ThreeEditJS.getHelpers().utilities.generatePlanarUVs(uvMesh.vertices, {
    projection: 'xy',
    scale: { x: 1, y: 1 },
    offset: { x: 0, y: 0 }
});
console.log('Generated planar UVs for cube');

// Example 16: Geometry operations
console.log('\n=== Geometry Operations ===');
const geoMesh = ThreeEditJS.createCube();

// Merge vertices
const mergedVertices = ThreeEditJS.getHelpers().geometry.mergeVertices(geoMesh.vertices, 0.001);
console.log(`Merged vertices: ${geoMesh.vertices.length} -> ${mergedVertices.length}`);

// Center vertices
ThreeEditJS.getHelpers().geometry.centerVertices(geoMesh.vertices);
console.log('Centered vertices around origin');

console.log('\n=== JavaScript Example Complete ===');
console.log('Three-edit works perfectly with vanilla JavaScript!');
console.log('All features are available through the JavaScript wrapper.'); 