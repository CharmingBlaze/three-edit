/**
 * @fileoverview Convert EditableMesh to Three.js objects
 * Provides functionality to convert EditableMesh to various Three.js formats
 */

import * as THREE from 'three';
import { EditableMesh } from '../EditableMesh.js';

/**
 * Convert EditableMesh to Three.js BufferGeometry
 * @param {EditableMesh} mesh - The mesh to convert
 * @returns {THREE.BufferGeometry} Three.js BufferGeometry
 */
export function editableMeshToBufferGeometry(mesh) {
  const geometry = new THREE.BufferGeometry();
  
  if (mesh.vertices.size === 0) {
    return geometry;
  }
  
  // Create vertex positions array
  const positions = [];
  const vertexIdToIndex = new Map();
  let vertexIndex = 0;
  
  for (const [vertexId, vertex] of mesh.vertices) {
    positions.push(vertex.x, vertex.y, vertex.z);
    vertexIdToIndex.set(vertexId, vertexIndex++);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  // Create faces as triangles
  const indices = [];
  for (const [faceId, face] of mesh.faces) {
    if (face.vertexIds.length < 3) {continue;}
    
    // Triangulate face
    for (let i = 1; i < face.vertexIds.length - 1; i++) {
      const v0 = vertexIdToIndex.get(face.vertexIds[0]);
      const v1 = vertexIdToIndex.get(face.vertexIds[i]);
      const v2 = vertexIdToIndex.get(face.vertexIds[i + 1]);
      
      if (v0 !== undefined && v1 !== undefined && v2 !== undefined) {
        indices.push(v0, v1, v2);
      }
    }
  }
  
  if (indices.length > 0) {
    geometry.setIndex(indices);
  }
  
  // Calculate normals
  geometry.computeVertexNormals();
  
  return geometry;
}

/**
 * Convert EditableMesh to Three.js Mesh with material
 * @param {EditableMesh} mesh - The mesh to convert
 * @param {THREE.Material} material - Three.js material (optional)
 * @returns {THREE.Mesh} Three.js Mesh
 */
export function editableMeshToMesh(mesh, material = null) {
  const geometry = editableMeshToBufferGeometry(mesh);
  
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      side: THREE.DoubleSide
    });
  }
  
  return new THREE.Mesh(geometry, material);
}

/**
 * Convert EditableMesh to Three.js Group with material
 * @param {EditableMesh} mesh - The mesh to convert
 * @param {THREE.Material} material - Three.js material (optional)
 * @returns {THREE.Group} Three.js Group
 */
export function editableMeshToGroup(mesh, material = null) {
  const group = new THREE.Group();
  
  if (mesh.vertices.size === 0) {
    return group;
  }
  
  // Create mesh
  const threeMesh = editableMeshToMesh(mesh, material);
  group.add(threeMesh);
  
  // Add wireframe if needed
  if (mesh.attributes.get('showWireframe')) {
    const wireframe = editableMeshToWireframe(mesh);
    group.add(wireframe);
  }
  
  return group;
}

/**
 * Convert EditableMesh to Three.js Wireframe
 * @param {EditableMesh} mesh - The mesh to convert
 * @param {THREE.Material} material - Three.js material (optional)
 * @returns {THREE.LineSegments} Three.js Wireframe
 */
export function editableMeshToWireframe(mesh, material = null) {
  const geometry = new THREE.BufferGeometry();
  
  if (mesh.edges.size === 0) {
    return new THREE.LineSegments(geometry);
  }
  
  // Create edge positions
  const positions = [];
  const vertexIdToIndex = new Map();
  let vertexIndex = 0;
  
  // Build vertex index map
  for (const [vertexId, vertex] of mesh.vertices) {
    vertexIdToIndex.set(vertexId, vertexIndex++);
  }
  
  // Create edge lines
  for (const [edgeId, edge] of mesh.edges) {
    const v1 = vertexIdToIndex.get(edge.vertexIds[0]);
    const v2 = vertexIdToIndex.get(edge.vertexIds[1]);
    
    if (v1 !== undefined && v2 !== undefined) {
      const vertex1 = mesh.vertices.get(edge.vertexIds[0]);
      const vertex2 = mesh.vertices.get(edge.vertexIds[1]);
      
      positions.push(vertex1.x, vertex1.y, vertex1.z);
      positions.push(vertex2.x, vertex2.y, vertex2.z);
    }
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  if (!material) {
    material = new THREE.LineBasicMaterial({ color: 0x000000 });
  }
  
  return new THREE.LineSegments(geometry, material);
}

/**
 * Convert EditableMesh to Three.js Points
 * @param {EditableMesh} mesh - The mesh to convert
 * @param {THREE.Material} material - Three.js material (optional)
 * @returns {THREE.Points} Three.js Points
 */
export function editableMeshToPoints(mesh, material = null) {
  const geometry = new THREE.BufferGeometry();
  
  if (mesh.vertices.size === 0) {
    return new THREE.Points(geometry);
  }
  
  // Create vertex positions
  const positions = [];
  for (const [vertexId, vertex] of mesh.vertices) {
    positions.push(vertex.x, vertex.y, vertex.z);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  if (!material) {
    material = new THREE.PointsMaterial({ 
      color: 0x000000,
      size: 0.1
    });
  }
  
  return new THREE.Points(geometry, material);
} 