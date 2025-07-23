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

// Example 3: Convert to Three.js geometry
console.log('\n=== Converting to Three.js ===');
const geometry = ThreeEditJS.toBufferGeometry(cube);
console.log('Three.js geometry created:', geometry);

// Example 4: Import from Three.js geometry
console.log('\n=== Importing from Three.js ===');
const importedMesh = ThreeEditJS.createFromThreeGeometry(geometry);
console.log('Imported mesh:', importedMesh);

// Example 5: Apply operations
console.log('\n=== Applying Operations ===');
const mesh = ThreeEditJS.createCube();

// Extrude a face
ThreeEditJS.extrudeFace(mesh, mesh.faces[0], { distance: 1 });
console.log('Face extruded');

// Bevel an edge
ThreeEditJS.bevelEdge(mesh, mesh.edges[0], { distance: 0.2 });
console.log('Edge beveled');

// Convert back to Three.js
const resultGeometry = ThreeEditJS.toBufferGeometry(mesh);
console.log('Final geometry:', resultGeometry);

// Example 6: Using the applyOperation helper
console.log('\n=== Using applyOperation Helper ===');
const simpleMesh = ThreeEditJS.createCube();
const finalGeometry = ThreeEditJS.applyOperation(
    simpleMesh, 
    ThreeEditJS.bevelEdge, 
    simpleMesh.edges[0], 
    { distance: 0.3 }
);
console.log('Operation applied and geometry returned:', finalGeometry);

// Example 7: Selection operations
console.log('\n=== Selection Operations ===');
const selectionMesh = ThreeEditJS.createCube();

// Select faces by ray (simulated)
const ray = { origin: { x: 0, y: 0, z: 5 }, direction: { x: 0, y: 0, z: -1 } };
const camera = { position: { x: 0, y: 0, z: 5 } };
const selectedFaces = ThreeEditJS.selectByRay(selectionMesh, ray, camera);
console.log('Faces selected by ray:', selectedFaces);

// Select connected faces
const connectedFaces = ThreeEditJS.selectConnected(selectionMesh, selectionMesh.faces[0]);
console.log('Connected faces:', connectedFaces);

// Example 8: Utility functions
console.log('\n=== Utility Functions ===');
const face = selectionMesh.faces[0];
const normal = ThreeEditJS.calculateFaceNormal(face);
const center = ThreeEditJS.calculateFaceCenter(face);
console.log('Face normal:', normal);
console.log('Face center:', center);

// Example 9: Scene Graph usage (if available)
console.log('\n=== Scene Graph Usage ===');
try {
    // Import scene graph functionality
    const { SceneGraph, SceneNode } = await import('three-edit/scene');
    
    // Create a scene graph
    const sceneGraph = new SceneGraph();
    const rootNode = new SceneNode('root');
    const childNode = new SceneNode('child');
    
    // Add child to root
    sceneGraph.addNode(rootNode);
    sceneGraph.addNode(childNode, rootNode);
    
    console.log('Scene graph created with hierarchy');
    console.log('Root node:', rootNode);
    console.log('Child node:', childNode);
    
} catch (error) {
    console.log('Scene graph not available in this version');
}

// Example 10: Performance tips
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

console.log('\n=== JavaScript Example Complete ===');
console.log('Three-edit works perfectly with vanilla JavaScript!'); 