// Common utility functions for three-edit examples as ES modules
import * as THREE from 'three';

// Fallback conversion function in case window.threeEdit.conversion is not available
export function convertToBufferGeometry(editableMesh) {
  console.log('Using fallback conversion function');
  const geometry = new THREE.BufferGeometry();
  
  // Extract vertices
  const vertices = [];
  editableMesh.vertices.forEach(vertex => {
    vertices.push(vertex.x, vertex.y, vertex.z);
  });
  
  // Extract faces (indices)
  const indices = [];
  editableMesh.faces.forEach(face => {
    if (face.vertexIds.length === 3) {
      // Triangle
      indices.push(face.vertexIds[0], face.vertexIds[1], face.vertexIds[2]);
    } else if (face.vertexIds.length === 4) {
      // Quad - split into two triangles
      indices.push(
        face.vertexIds[0], face.vertexIds[1], face.vertexIds[2],
        face.vertexIds[0], face.vertexIds[2], face.vertexIds[3]
      );
    }
  });
  
  // Set attributes
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
}

// Setup basic Three.js scene
export function setupScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);
  
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  // Add grid helper
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);
  
  return { scene, camera, renderer };
}

// Create and add mesh to scene
export function createAndAddMesh(scene, editableMesh, color, position) {
  try {
    // Convert to Three.js BufferGeometry
    const geometry = window.threeEdit.conversion ? 
      window.threeEdit.conversion.toBufferGeometry(editableMesh) : 
      convertToBufferGeometry(editableMesh);
    
    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      side: THREE.DoubleSide
    });
    
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    if (position) {
      mesh.position.copy(position);
    }
    scene.add(mesh);
    
    const wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
    if (position) {
      wireframe.position.copy(position);
    }
    scene.add(wireframe);
    
    return mesh;
  } catch (error) {
    console.error("Error creating mesh:", error);
    document.getElementById('info').textContent = 'Error: ' + error.message;
    return null;
  }
}

// Clear existing meshes
export function clearMeshes(scene) {
  const toRemove = [];
  scene.children.forEach(child => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Object3D) {
      if (!(child instanceof THREE.GridHelper) && 
          !(child instanceof THREE.DirectionalLight) && 
          !(child instanceof THREE.AmbientLight)) {
        toRemove.push(child);
      }
    }
  });
  
  toRemove.forEach(obj => scene.remove(obj));
}

// Helper function to visualize vertices
export function visualizeVertices(scene, mesh, color, position) {
  mesh.vertices.forEach(vertex => {
    const sphereGeom = new THREE.SphereGeometry(0.05, 8, 8);
    const sphereMat = new THREE.MeshBasicMaterial({ color: color });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    sphere.position.set(vertex.x, vertex.y, vertex.z);
    if (position) {
      sphere.position.add(position);
    }
    scene.add(sphere);
  });
}

// Helper function to visualize edges
export function visualizeEdges(scene, mesh, color, position) {
  mesh.edges.forEach(edge => {
    const v1 = mesh.vertices[edge.vertexIds[0]];
    const v2 = mesh.vertices[edge.vertexIds[1]];
    
    const lineGeom = new THREE.BufferGeometry();
    const points = [
      new THREE.Vector3(v1.x, v1.y, v1.z),
      new THREE.Vector3(v2.x, v2.y, v2.z)
    ];
    lineGeom.setFromPoints(points);
    
    const lineMat = new THREE.LineBasicMaterial({ color: color, linewidth: 3 });
    const line = new THREE.Line(lineGeom, lineMat);
    if (position) {
      line.position.copy(position);
    }
    scene.add(line);
  });
}
