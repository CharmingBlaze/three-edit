/**
 * Three.js Converter - Pure functions for converting between EditableMesh and Three.js objects
 * Handles conversion between our modular mesh format and Three.js geometry/mesh objects
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
    positions.push(vertex.position.x, vertex.position.y, vertex.position.z);
    vertexIdToIndex.set(vertexId, vertexIndex++);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  // Create faces as triangles
  const indices = [];
  for (const [faceId, face] of mesh.faces) {
    if (face.vertices.length < 3) {continue;}
    
    // Triangulate face
    for (let i = 1; i < face.vertices.length - 1; i++) {
      const v0 = vertexIdToIndex.get(face.vertices[0]);
      const v1 = vertexIdToIndex.get(face.vertices[i]);
      const v2 = vertexIdToIndex.get(face.vertices[i + 1]);
      
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
    const vertexId = mesh.nextVertexId++;
    mesh.vertices.set(vertexId, {
      id: vertexId,
      position: {
        x: positions[i],
        y: positions[i + 1],
        z: positions[i + 2]
      }
    });
  }
  
  // Create faces from indices
  if (indices) {
    for (let i = 0; i < indices.length; i += 3) {
      const v0 = indices[i];
      const v1 = indices[i + 1];
      const v2 = indices[i + 2];
      
      // Create edges
      const edge1Id = mesh.nextEdgeId++;
      mesh.edges.set(edge1Id, {
        id: edge1Id,
        vertexA: v0,
        vertexB: v1
      });
      
      const edge2Id = mesh.nextEdgeId++;
      mesh.edges.set(edge2Id, {
        id: edge2Id,
        vertexA: v1,
        vertexB: v2
      });
      
      const edge3Id = mesh.nextEdgeId++;
      mesh.edges.set(edge3Id, {
        id: edge3Id,
        vertexA: v2,
        vertexB: v0
      });
      
      // Create face
      const faceId = mesh.nextFaceId++;
      mesh.faces.set(faceId, {
        id: faceId,
        vertices: [v0, v1, v2],
        edges: [edge1Id, edge2Id, edge3Id]
      });
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
  return bufferGeometryToEditableMesh(mesh.geometry);
}

/**
 * Convert EditableMesh to Three.js Group with individual meshes for each face
 * @param {EditableMesh} mesh - The mesh to convert
 * @param {THREE.Material} material - Three.js material (optional)
 * @returns {THREE.Group} Three.js Group containing individual face meshes
 */
export function editableMeshToGroup(mesh, material = null) {
  const group = new THREE.Group();
  
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      side: THREE.DoubleSide
    });
  }
  
  // Create vertex positions array
  const positions = [];
  const vertexIdToIndex = new Map();
  let vertexIndex = 0;
  
  for (const [vertexId, vertex] of mesh.vertices) {
    positions.push(vertex.position.x, vertex.position.y, vertex.position.z);
    vertexIdToIndex.set(vertexId, vertexIndex++);
  }
  
  // Create individual mesh for each face
  for (const [faceId, face] of mesh.faces) {
    if (face.vertices.length < 3) {continue;}
    
    const faceGeometry = new THREE.BufferGeometry();
    const facePositions = [];
    const faceIndices = [];
    
    // Add vertices for this face
    for (let i = 0; i < face.vertices.length; i++) {
      const vertexId = face.vertices[i];
      const vertex = mesh.vertices.get(vertexId);
      if (vertex) {
        facePositions.push(vertex.position.x, vertex.position.y, vertex.position.z);
      }
    }
    
    faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3));
    
    // Create triangles for this face
    for (let i = 1; i < face.vertices.length - 1; i++) {
      faceIndices.push(0, i, i + 1);
    }
    
    if (faceIndices.length > 0) {
      faceGeometry.setIndex(faceIndices);
    }
    
    faceGeometry.computeVertexNormals();
    
    const faceMesh = new THREE.Mesh(faceGeometry, material.clone());
    group.add(faceMesh);
  }
  
  return group;
}

/**
 * Convert EditableMesh to Three.js LineSegments for wireframe display
 * @param {EditableMesh} mesh - The mesh to convert
 * @param {THREE.Material} material - Three.js material (optional)
 * @returns {THREE.LineSegments} Three.js LineSegments for wireframe
 */
export function editableMeshToWireframe(mesh, material = null) {
  const geometry = new THREE.BufferGeometry();
  
  if (mesh.edges.size === 0) {
    return new THREE.LineSegments(geometry, material);
  }
  
  // Create line positions array
  const positions = [];
  
  for (const [edgeId, edge] of mesh.edges) {
    const vertexA = mesh.vertices.get(edge.vertexA);
    const vertexB = mesh.vertices.get(edge.vertexB);
    
    if (vertexA && vertexB) {
      positions.push(
        vertexA.position.x, vertexA.position.y, vertexA.position.z,
        vertexB.position.x, vertexB.position.y, vertexB.position.z
      );
    }
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  if (!material) {
    material = new THREE.LineBasicMaterial({ color: 0x000000 });
  }
  
  return new THREE.LineSegments(geometry, material);
}

/**
 * Convert EditableMesh to Three.js Points for vertex display
 * @param {EditableMesh} mesh - The mesh to convert
 * @param {THREE.Material} material - Three.js material (optional)
 * @returns {THREE.Points} Three.js Points for vertex display
 */
export function editableMeshToPoints(mesh, material = null) {
  const geometry = new THREE.BufferGeometry();
  
  if (mesh.vertices.size === 0) {
    return new THREE.Points(geometry, material);
  }
  
  // Create point positions array
  const positions = [];
  
  for (const [vertexId, vertex] of mesh.vertices) {
    positions.push(vertex.position.x, vertex.position.y, vertex.position.z);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  if (!material) {
    material = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.1,
      sizeAttenuation: false
    });
  }
  
  return new THREE.Points(geometry, material);
}

/**
 * Convert EditableMesh to Three.js Object3D with all representations
 * @param {EditableMesh} mesh - The mesh to convert
 * @param {Object} options - Conversion options
 * @param {THREE.Material} options.material - Material for solid mesh
 * @param {THREE.Material} options.wireframeMaterial - Material for wireframe
 * @param {THREE.Material} options.pointsMaterial - Material for points
 * @param {boolean} options.showSolid - Show solid mesh
 * @param {boolean} options.showWireframe - Show wireframe
 * @param {boolean} options.showPoints - Show vertex points
 * @returns {THREE.Object3D} Three.js Object3D containing all representations
 */
export function editableMeshToObject3D(mesh, options = {}) {
  const {
    material = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide }),
    wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }),
    pointsMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.1, sizeAttenuation: false }),
    showSolid = true,
    showWireframe = false,
    showPoints = false
  } = options;
  
  const object = new THREE.Object3D();
  
  if (showSolid) {
    const solidMesh = editableMeshToMesh(mesh, material);
    object.add(solidMesh);
  }
  
  if (showWireframe) {
    const wireframe = editableMeshToWireframe(mesh, wireframeMaterial);
    object.add(wireframe);
  }
  
  if (showPoints) {
    const points = editableMeshToPoints(mesh, pointsMaterial);
    object.add(points);
  }
  
  return object;
}

/**
 * Extract vertex positions from EditableMesh as array
 * @param {EditableMesh} mesh - The mesh to extract from
 * @returns {Array} Array of vertex positions [{x,y,z}, ...]
 */
export function getVertexPositions(mesh) {
  const positions = [];
  
  for (const [vertexId, vertex] of mesh.vertices) {
    positions.push({ ...vertex.position });
  }
  
  return positions;
}

/**
 * Extract face indices from EditableMesh as array
 * @param {EditableMesh} mesh - The mesh to extract from
 * @returns {Array} Array of face vertex indices [[v0,v1,v2], ...]
 */
export function getFaceIndices(mesh) {
  const faces = [];
  
  for (const [faceId, face] of mesh.faces) {
    faces.push([...face.vertices]);
  }
  
  return faces;
}

/**
 * Extract edge indices from EditableMesh as array
 * @param {EditableMesh} mesh - The mesh to extract from
 * @returns {Array} Array of edge vertex indices [[v0,v1], ...]
 */
export function getEdgeIndices(mesh) {
  const edges = [];
  
  for (const [edgeId, edge] of mesh.edges) {
    edges.push([edge.vertexA, edge.vertexB]);
  }
  
  return edges;
} 