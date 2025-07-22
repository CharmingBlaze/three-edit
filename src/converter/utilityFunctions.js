/**
 * @fileoverview Converter utility functions
 * Provides utility functions for mesh conversion operations
 */

import * as THREE from 'three';

/**
 * Get vertex positions from EditableMesh
 * @param {EditableMesh} mesh - The mesh to extract positions from
 * @returns {Array<THREE.Vector3>} Array of vertex positions
 */
export function getVertexPositions(mesh) {
  const positions = [];
  for (const [vertexId, vertex] of mesh.vertices) {
    positions.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
  }
  return positions;
}

/**
 * Get face indices from EditableMesh
 * @param {EditableMesh} mesh - The mesh to extract face indices from
 * @returns {Array<Array<number>>} Array of face vertex indices
 */
export function getFaceIndices(mesh) {
  const faces = [];
  const vertexIdToIndex = new Map();
  let index = 0;
  
  // Build vertex ID to index mapping
  for (const [vertexId, vertex] of mesh.vertices) {
    vertexIdToIndex.set(vertexId, index++);
  }
  
  // Convert face vertex IDs to indices
  for (const [faceId, face] of mesh.faces) {
    const faceIndices = face.vertexIds.map(vertexId => vertexIdToIndex.get(vertexId));
    faces.push(faceIndices);
  }
  
  return faces;
}

/**
 * Get edge indices from EditableMesh
 * @param {EditableMesh} mesh - The mesh to extract edge indices from
 * @returns {Array<Array<number>>} Array of edge vertex indices
 */
export function getEdgeIndices(mesh) {
  const edges = [];
  const vertexIdToIndex = new Map();
  let index = 0;
  
  // Build vertex ID to index mapping
  for (const [vertexId, vertex] of mesh.vertices) {
    vertexIdToIndex.set(vertexId, index++);
  }
  
  // Convert edge vertex IDs to indices
  for (const [edgeId, edge] of mesh.edges) {
    const edgeIndices = edge.vertexIds.map(vertexId => vertexIdToIndex.get(vertexId));
    edges.push(edgeIndices);
  }
  
  return edges;
}

/**
 * Convert EditableMesh to Object3D with various options
 * @param {EditableMesh} mesh - The mesh to convert
 * @param {Object} options - Conversion options
 * @param {string} [options.type='mesh'] - Output type: 'mesh', 'wireframe', 'points', 'group'
 * @param {THREE.Material} [options.material] - Material to use
 * @param {boolean} [options.showWireframe=false] - Whether to show wireframe
 * @returns {THREE.Object3D} Three.js Object3D
 */
export function editableMeshToObject3D(mesh, options = {}) {
  const { 
    type = 'mesh', 
    material = null, 
    showWireframe = false 
  } = options;
  
  switch (type) {
    case 'mesh':
      return editableMeshToMesh(mesh, material);
    case 'wireframe':
      return editableMeshToWireframe(mesh, material);
    case 'points':
      return editableMeshToPoints(mesh, material);
    case 'group':
      return editableMeshToGroup(mesh, material);
    default:
      return editableMeshToMesh(mesh, material);
  }
} 