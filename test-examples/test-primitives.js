// Test file for three-edit primitives
import * as THREE from 'three';
import { 
  createCube, 
  createPlane, 
  createSphere, 
  createCone,
  createArrow,
  createCylinder,
  createTorus
} from '../src/primitives';
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

// Test createCube
function testCreateCube() {
  console.log("Testing createCube...");
  try {
    const cube = createCube({ 
      width: 1, 
      height: 1, 
      depth: 1,
      widthSegments: 2,
      heightSegments: 2,
      depthSegments: 2
    });
    console.log(`Cube created with ${cube.vertices.length} vertices and ${cube.faces.length} faces`);
    
    // Convert to Three.js BufferGeometry
    const geometry = toBufferGeometry(cube);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -2;
    scene.add(mesh);
    
    return true;
  } catch (error) {
    console.error("Error in testCreateCube:", error);
    return false;
  }
}

// Test createPlane
function testCreatePlane() {
  console.log("Testing createPlane...");
  try {
    const plane = createPlane({ 
      width: 1, 
      height: 1,
      widthSegments: 4,
      heightSegments: 4
    });
    console.log(`Plane created with ${plane.vertices.length} vertices and ${plane.faces.length} faces`);
    
    // Convert to Three.js BufferGeometry
    const geometry = toBufferGeometry(plane);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 0;
    scene.add(mesh);
    
    return true;
  } catch (error) {
    console.error("Error in testCreatePlane:", error);
    return false;
  }
}

// Test createSphere
function testCreateSphere() {
  console.log("Testing createSphere...");
  try {
    const sphere = createSphere({ 
      radius: 0.5, 
      widthSegments: 16,
      heightSegments: 12
    });
    console.log(`Sphere created with ${sphere.vertices.length} vertices and ${sphere.faces.length} faces`);
    
    // Convert to Three.js BufferGeometry
    const geometry = toBufferGeometry(sphere);
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 2;
    scene.add(mesh);
    
    return true;
  } catch (error) {
    console.error("Error in testCreateSphere:", error);
    return false;
  }
}

// Test createCone
function testCreateCone() {
  console.log("Testing createCone...");
  try {
    const cone = createCone({ 
      radius: 0.5, 
      height: 1,
      radialSegments: 16,
      heightSegments: 1,
      openEnded: false
    });
    console.log(`Cone created with ${cone.vertices.length} vertices and ${cone.faces.length} faces`);
    
    // Convert to Three.js BufferGeometry
    const geometry = toBufferGeometry(cone);
    const material = new THREE.MeshStandardMaterial({ color: 0xffff00, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -2;
    mesh.position.y = -2;
    scene.add(mesh);
    
    return true;
  } catch (error) {
    console.error("Error in testCreateCone:", error);
    return false;
  }
}

// Test createArrow
function testCreateArrow() {
  console.log("Testing createArrow...");
  try {
    const arrow = createArrow({ 
      shaftRadius: 0.1,
      shaftLength: 1,
      headRadius: 0.2,
      headLength: 0.3,
      radialSegments: 8,
      heightSegments: 2
    });
    console.log(`Arrow created with ${arrow.vertices.length} vertices and ${arrow.faces.length} faces`);
    
    // Convert to Three.js BufferGeometry
    const geometry = toBufferGeometry(arrow);
    const material = new THREE.MeshStandardMaterial({ color: 0xff00ff, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 0;
    mesh.position.y = -2;
    scene.add(mesh);
    
    return true;
  } catch (error) {
    console.error("Error in testCreateArrow:", error);
    return false;
  }
}

// Test createCylinder
function testCreateCylinder() {
  console.log("Testing createCylinder...");
  try {
    const cylinder = createCylinder({ 
      radiusTop: 0.5,
      radiusBottom: 0.5,
      height: 1,
      radialSegments: 16,
      heightSegments: 1
    });
    console.log(`Cylinder created with ${cylinder.vertices.length} vertices and ${cylinder.faces.length} faces`);
    
    // Convert to Three.js BufferGeometry
    const geometry = toBufferGeometry(cylinder);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 2;
    mesh.position.y = -2;
    scene.add(mesh);
    
    return true;
  } catch (error) {
    console.error("Error in testCreateCylinder:", error);
    return false;
  }
}

// Run the tests
const testResults = {
  cube: testCreateCube(),
  plane: testCreatePlane(),
  sphere: testCreateSphere(),
  cone: testCreateCone(),
  arrow: testCreateArrow(),
  cylinder: testCreateCylinder()
};

console.log("Test Results:", testResults);

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
