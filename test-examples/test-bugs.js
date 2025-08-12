// Test file specifically for testing the buggy components
import * as THREE from 'three';
import { createCone, createArrow } from '../src/primitives';
import { toBufferGeometry } from '../src/conversion';

// Set up a basic Three.js scene for visualization
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Test createCone with bug
function testCreateCone() {
  console.log("Testing createCone with potential bug...");
  try {
    // This should trigger the bug with full-circle cones (thetaLength === Math.PI * 2)
    const cone = createCone({ 
      radius: 0.5, 
      height: 1,
      radialSegments: 16,
      heightSegments: 1,
      openEnded: false,
      thetaLength: Math.PI * 2 // This should trigger the bug
    });
    
    console.log(`Cone created with ${cone.vertices.length} vertices and ${cone.faces.length} faces`);
    console.log("Cone base faces:", cone.faces.filter(f => f.vertexIds.length > 3).length);
    
    // Convert to Three.js BufferGeometry
    const geometry = toBufferGeometry(cone);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xffff00, 
      wireframe: true,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -1.5;
    scene.add(mesh);
    
    return {
      success: true,
      message: `Cone created with ${cone.vertices.length} vertices and ${cone.faces.length} faces`
    };
  } catch (error) {
    console.error("Error in testCreateCone:", error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// Test createArrow with bug
function testCreateArrow() {
  console.log("Testing createArrow with potential bugs...");
  try {
    const arrow = createArrow({ 
      shaftRadius: 0.1,
      shaftLength: 1,
      headRadius: 0.2,
      headLength: 0.3,
      radialSegments: 8,
      heightSegments: 4 // Increased to highlight the bug
    });
    
    console.log(`Arrow created with ${arrow.vertices.length} vertices and ${arrow.faces.length} faces`);
    
    // Check if the arrow has enough faces
    // With 8 radial segments and 4 height segments, we should have many faces
    // If the bug exists, we'll have far fewer faces than expected
    const expectedMinFaces = 8 * 4; // Minimum expected for shaft alone
    const hasBug = arrow.faces.length < expectedMinFaces;
    
    console.log(`Arrow has ${arrow.faces.length} faces. Expected at least ${expectedMinFaces}.`);
    console.log(`Bug detected: ${hasBug ? "Yes" : "No"}`);
    
    // Convert to Three.js BufferGeometry
    const geometry = toBufferGeometry(arrow);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xff00ff, 
      wireframe: true,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 1.5;
    scene.add(mesh);
    
    return {
      success: true,
      message: `Arrow created with ${arrow.vertices.length} vertices and ${arrow.faces.length} faces`,
      bugDetected: hasBug
    };
  } catch (error) {
    console.error("Error in testCreateArrow:", error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// Run the tests
const testResults = {
  cone: testCreateCone(),
  arrow: testCreateArrow()
};

console.log("Test Results:", JSON.stringify(testResults, null, 2));

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate all objects in the scene
  scene.children.forEach(child => {
    if (child instanceof THREE.Mesh) {
      child.rotation.x += 0.01;
      child.rotation.y += 0.01;
    }
  });
  
  renderer.render(scene, camera);
}

animate();
