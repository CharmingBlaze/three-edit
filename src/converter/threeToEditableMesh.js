/**
 * @fileoverview Convert Three.js objects to EditableMesh
 * Provides functionality to convert Three.js objects to EditableMesh format
 */

import * as THREE from 'three';
import { EditableMesh, Vertex, Edge, Face, UV } from '../EditableMesh.js';

/**
 * Convert Three.js BufferGeometry to EditableMesh
 * @param {THREE.BufferGeometry} geometry - Three.js BufferGeometry
 * @returns {EditableMesh} EditableMesh instance
 */
export function bufferGeometryToEditableMesh(geometry) {
  const mesh = new EditableMesh();
  
  if (!geometry.attributes.position) {
    return mesh;
  }
  
  const positions = geometry.attributes.position.array;
  const indices = geometry.index ? geometry.index.array : null;
  
  // Create vertices
  for (let i = 0; i < positions.length; i += 3) {
    const vertexId = `v${mesh.nextVertexId++}`;
    const vertex = new Vertex(positions[i], positions[i + 1], positions[i + 2], vertexId);
    mesh.addVertex(vertex);
  }
  
  // Create faces from indices
  if (indices) {
    for (let i = 0; i < indices.length; i += 3) {
      const faceId = `f${mesh.nextFaceId++}`;
      const vertexIds = [
        `v${indices[i]}`,
        `v${indices[i + 1]}`,
        `v${indices[i + 2]}`
      ];
      const face = new Face(vertexIds, faceId);
      mesh.addFace(face);
    }
  } else {
    // No indices - create faces from sequential vertices
    for (let i = 0; i < positions.length / 3; i += 3) {
      const faceId = `f${mesh.nextFaceId++}`;
      const vertexIds = [
        `v${i}`,
        `v${i + 1}`,
        `v${i + 2}`
      ];
      const face = new Face(vertexIds, faceId);
      mesh.addFace(face);
    }
  }
  
  // Create edges from faces
  const edgeMap = new Map();
  for (const [faceId, face] of mesh.faces) {
    for (let i = 0; i < face.vertexIds.length; i++) {
      const v1 = face.vertexIds[i];
      const v2 = face.vertexIds[(i + 1) % face.vertexIds.length];
      
      const edgeKey = [v1, v2].sort().join('-');
      if (!edgeMap.has(edgeKey)) {
        const edgeId = `e${mesh.nextEdgeId++}`;
        const edge = new Edge(v1, v2, edgeId);
        mesh.addEdge(edge);
        edgeMap.set(edgeKey, edge);
      }
    }
  }
  
  // Copy UV coordinates if available
  if (geometry.attributes.uv) {
    const uvs = geometry.attributes.uv.array;
    for (let i = 0; i < uvs.length; i += 2) {
      const vertexId = `v${Math.floor(i / 2)}`;
      const uv = new UV(uvs[i], uvs[i + 1], vertexId);
      mesh.addUV(uv);
    }
  }
  
  return mesh;
}

/**
 * Convert Three.js Mesh to EditableMesh
 * @param {THREE.Mesh} mesh - Three.js Mesh
 * @returns {EditableMesh} EditableMesh instance
 */
export function meshToEditableMesh(mesh) {
  const editableMesh = bufferGeometryToEditableMesh(mesh.geometry);
  
  // Copy material properties if available
  if (mesh.material) {
    editableMesh.material = {
      name: mesh.material.name || 'Imported',
      type: mesh.material.type || 'standard',
      color: mesh.material.color ? {
        r: mesh.material.color.r,
        g: mesh.material.color.g,
        b: mesh.material.color.b
      } : { r: 0.8, g: 0.8, b: 0.8 },
      roughness: mesh.material.roughness || 0.5,
      metalness: mesh.material.metalness || 0.0,
      opacity: mesh.material.opacity || 1.0,
      transparent: mesh.material.transparent || false,
      side: mesh.material.side || 'front'
    };
  }
  
  return editableMesh;
}

/**
 * Convert Three.js Group to EditableMesh
 * @param {THREE.Group} group - Three.js Group
 * @returns {EditableMesh} EditableMesh instance
 */
export function groupToEditableMesh(group) {
  const mesh = new EditableMesh();
  
  // Process all children
  for (const child of group.children) {
    if (child instanceof THREE.Mesh) {
      const childMesh = meshToEditableMesh(child);
      // Merge child mesh into main mesh
      // Implementation would merge vertices, edges, faces
    }
  }
  
  return mesh;
} 