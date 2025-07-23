// Simple three-edit + Three.js Integration Example
// This demonstrates the basic workflow of creating, editing, and rendering 3D geometry

import { createCube, toBufferGeometry } from 'three-edit';
import * as THREE from 'three';

// Step 1: Create editable geometry with three-edit
console.log('Creating editable cube...');
const editableCube = createCube({
    width: 2,
    height: 2,
    depth: 2,
    name: 'MyEditableCube',
    centered: true,
    materialId: 0
});

console.log('Editable cube created:', {
    vertexCount: editableCube.vertices.length,
    faceCount: editableCube.faces.length,
    edgeCount: editableCube.edges.length
});

// Step 2: Convert to Three.js BufferGeometry
console.log('Converting to Three.js BufferGeometry...');
const geometry = toBufferGeometry(editableCube, {
    includeNormals: true,
    includeUVs: true,
    includeMaterialIndices: true
});

console.log('BufferGeometry created:', {
    vertexCount: geometry.attributes.position.count,
    hasNormals: !!geometry.attributes.normal,
    hasUVs: !!geometry.attributes.uv,
    hasMaterialIndices: !!geometry.attributes.materialIndex
});

// Step 3: Create Three.js scene and render
console.log('Setting up Three.js scene...');

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Create material
const material = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    roughness: 0.7,
    metalness: 0.3
});

// Create mesh
const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Add controls (if available)
let controls;
if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    // Optional: Rotate the mesh to show it's working
    mesh.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('Integration complete! The cube should be visible and rotating.');
console.log('This demonstrates:');
console.log('1. Creating editable geometry with three-edit');
console.log('2. Converting to Three.js BufferGeometry');
console.log('3. Rendering with Three.js');
console.log('4. Real-time updates and interaction');

// Example of how you would edit the geometry in real-time:
/*
function editGeometry() {
    // Perform editing operations on the editable mesh
    extrudeFace(editableCube, editableCube.faces[0], { distance: 1 });
    
    // Convert back to Three.js
    const newGeometry = toBufferGeometry(editableCube);
    
    // Update the Three.js mesh
    mesh.geometry.dispose(); // Clean up old geometry
    mesh.geometry = newGeometry;
}

// You could call editGeometry() on button click or other events
*/ 