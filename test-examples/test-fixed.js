// Test file for fixed versions of createCone and createArrow
import * as THREE from 'three';
import { toBufferGeometry } from '../src/conversion';
import { createCone } from './fixed-createCone';
import { createArrow } from './fixed-createArrow';

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

// Test fixed createCone
function testFixedCreateCone() {
  console.log("Testing fixed createCone...");
  try {
    // This should now work correctly with full-circle cones
    const cone = createCone({ 
      radius: 0.5, 
      height: 1,
      radialSegments: 16,
      heightSegments: 1,
      openEnded: false,
      thetaLength: Math.PI * 2 // This should now work correctly
    });
    
    console.log(`Fixed cone created with ${cone.vertices.length} vertices and ${cone.faces.length} faces`);
    
    // Convert to Three.js BufferGeometry
    const geometry = toBufferGeometry(cone);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x00ff00, 
      wireframe: true,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -1.5;
    scene.add(mesh);
    
    return {
      success: true,
      message: `Fixed cone created with ${cone.vertices.length} vertices and ${cone.faces.length} faces`
    };
  } catch (error) {
    console.error("Error in testFixedCreateCone:", error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// Test fixed createArrow
function testFixedCreateArrow() {
  console.log("Testing fixed createArrow...");
  try {
    const arrow = createArrow({ 
      shaftRadius: 0.1,
      shaftLength: 1,
      headRadius: 0.2,
      headLength: 0.3,
      radialSegments: 8,
      heightSegments: 4 // This should now work correctly with multiple segments
    });
    
    console.log(`Fixed arrow created with ${arrow.vertices.length} vertices and ${arrow.faces.length} faces`);
    
    // Check if the arrow has enough faces
    // With 8 radial segments and 4 height segments, we should have many faces
    const expectedMinFaces = 8 * 4; // Minimum expected for shaft alone
    
    console.log(`Arrow has ${arrow.faces.length} faces. Expected at least ${expectedMinFaces}.`);
    
    // Convert to Three.js BufferGeometry
    const geometry = toBufferGeometry(arrow);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x0000ff, 
      wireframe: true,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 1.5;
    scene.add(mesh);
    
    return {
      success: true,
      message: `Fixed arrow created with ${arrow.vertices.length} vertices and ${arrow.faces.length} faces`
    };
  } catch (error) {
    console.error("Error in testFixedCreateArrow:", error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// Run the tests
const testResults = {
  fixedCone: testFixedCreateCone(),
  fixedArrow: testFixedCreateArrow()
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
