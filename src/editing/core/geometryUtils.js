/**
 * @fileoverview Geometry Utilities
 * Core utility functions for geometry manipulation used across all operations
 */

import * as THREE from 'three';

/**
 * Extracts vertex positions from geometry based on indices
 * @param {THREE.BufferGeometry} geometry - The geometry to extract vertices from
 * @param {Array<number>} indices - The indices of the vertices to extract
 * @returns {Array<THREE.Vector3>} Array of vertex positions
 */
export function getVerticesFromIndices(geometry, indices) {
  const vertices = [];
  const positionAttribute = geometry.getAttribute('position');
  
  if (!positionAttribute) {
    console.error('Geometry must have position attribute');
    return vertices;
  }

  indices.forEach(index => {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(positionAttribute, index);
    vertices.push(vertex);
  });

  return vertices;
}

/**
 * Gets the vertices of a specific face
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {number} faceIndex - The index of the face
 * @returns {Array<THREE.Vector3>} Array of the face's vertex positions
 */
export function getFaceVertices(geometry, faceIndex) {
  const vertices = [];
  const positionAttribute = geometry.getAttribute('position');
  const indexAttribute = geometry.getIndex();

  if (!positionAttribute || !indexAttribute) {
    console.error('Geometry must be indexed and have a position attribute');
    return vertices;
  }

  const startIndex = faceIndex * 3;
  for (let i = 0; i < 3; i++) {
    const vertexIndex = indexAttribute.getX(startIndex + i);
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(positionAttribute, vertexIndex);
    vertices.push(vertex);
  }
  
  return vertices;
}

/**
 * Builds a map of all unique edges in the geometry
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @returns {Map<string, Array<number>>} Map where keys are unique edge strings and values are [v1, v2]
 */
export function getEdges(geometry) {
  const edges = new Map();
  const index = geometry.getIndex();
  
  if (!index) return edges;

  for (let i = 0; i < index.count; i += 3) {
    const v1 = index.getX(i);
    const v2 = index.getX(i + 1);
    const v3 = index.getX(i + 2);
    
    const faceEdges = [[v1, v2], [v2, v3], [v3, v1]];
    
    faceEdges.forEach(([a, b]) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edges.has(key)) {
        edges.set(key, [a, b]);
      }
    });
  }
  
  return edges;
}

/**
 * Finds all faces adjacent to a given vertex
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {number} vertexIndex - The index of the vertex
 * @returns {Array<THREE.Triangle>} Array of faces adjacent to the vertex
 */
export function getAdjacentFaces(geometry, vertexIndex) {
  const adjacentFaces = [];
  const index = geometry.getIndex();
  const position = geometry.getAttribute('position');
  
  if (!index || !position) return adjacentFaces;

  for (let i = 0; i < index.count; i += 3) {
    const v1 = index.getX(i);
    const v2 = index.getX(i + 1);
    const v3 = index.getX(i + 2);

    if (v1 === vertexIndex || v2 === vertexIndex || v3 === vertexIndex) {
      const face = new THREE.Triangle(
        new THREE.Vector3().fromBufferAttribute(position, v1),
        new THREE.Vector3().fromBufferAttribute(position, v2),
        new THREE.Vector3().fromBufferAttribute(position, v3)
      );
      adjacentFaces.push(face);
    }
  }
  
  return adjacentFaces;
}

/**
 * Calculates the normal of a face
 * @param {Array<THREE.Vector3>} vertices - The vertices of the face
 * @returns {THREE.Vector3} The face normal
 */
export function calculateFaceNormal(vertices) {
  if (vertices.length < 3) {
    return new THREE.Vector3(0, 1, 0);
  }

  const v1 = vertices[0];
  const v2 = vertices[1];
  const v3 = vertices[2];

  const edge1 = new THREE.Vector3().subVectors(v2, v1);
  const edge2 = new THREE.Vector3().subVectors(v3, v1);
  
  const normal = new THREE.Vector3().crossVectors(edge1, edge2);
  normal.normalize();
  
  return normal;
}

/**
 * Calculates the center point of a face
 * @param {Array<THREE.Vector3>} vertices - The vertices of the face
 * @returns {THREE.Vector3} The center point
 */
export function calculateFaceCenter(vertices) {
  if (vertices.length === 0) {
    return new THREE.Vector3();
  }

  const center = new THREE.Vector3();
  vertices.forEach(vertex => center.add(vertex));
  center.divideScalar(vertices.length);
  
  return center;
}

/**
 * Creates a new geometry from vertices and indices
 * @param {Array<THREE.Vector3>} vertices - The vertices
 * @param {Array<number>} indices - The indices
 * @returns {THREE.BufferGeometry} The new geometry
 */
export function createGeometryFromVertices(vertices, indices) {
  const geometry = new THREE.BufferGeometry();
  
  const positions = [];
  vertices.forEach(vertex => {
    positions.push(vertex.x, vertex.y, vertex.z);
  });
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
}

/**
 * Clones a geometry with new vertex positions
 * @param {THREE.BufferGeometry} geometry - The original geometry
 * @param {Array<THREE.Vector3>} newPositions - The new vertex positions
 * @returns {THREE.BufferGeometry} The cloned geometry
 */
export function cloneGeometryWithPositions(geometry, newPositions) {
  const cloned = geometry.clone();
  
  const positions = [];
  newPositions.forEach(vertex => {
    positions.push(vertex.x, vertex.y, vertex.z);
  });
  
  cloned.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  cloned.computeVertexNormals();
  
  return cloned;
}

/**
 * Merges multiple geometries into one
 * @param {Array<THREE.BufferGeometry>} geometries - Array of geometries to merge
 * @returns {THREE.BufferGeometry} The merged geometry
 */
export function mergeGeometries(geometries) {
  if (geometries.length === 0) {
    return new THREE.BufferGeometry();
  }
  
  if (geometries.length === 1) {
    return geometries[0].clone();
  }

  const merged = new THREE.BufferGeometry();
  const positions = [];
  const indices = [];
  let vertexOffset = 0;

  geometries.forEach(geometry => {
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.getIndex();

    if (positionAttribute) {
      for (let i = 0; i < positionAttribute.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positionAttribute, i);
        positions.push(vertex.x, vertex.y, vertex.z);
      }
    }

    if (indexAttribute) {
      for (let i = 0; i < indexAttribute.count; i++) {
        indices.push(indexAttribute.getX(i) + vertexOffset);
      }
    }

    vertexOffset += positionAttribute ? positionAttribute.count : 0;
  });

  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (indices.length > 0) {
    merged.setIndex(indices);
  }
  merged.computeVertexNormals();

  return merged;
}

/**
 * Validates geometry integrity
 * @param {THREE.BufferGeometry} geometry - Geometry to validate
 * @returns {boolean} True if geometry is valid
 */
export function isValidGeometry(geometry) {
  if (!geometry || !(geometry instanceof THREE.BufferGeometry)) {
    return false;
  }

  const positionAttribute = geometry.getAttribute('position');
  if (!positionAttribute) {
    return false;
  }

  const indexAttribute = geometry.getIndex();
  if (!indexAttribute) {
    return false;
  }

  // Check for invalid indices
  const vertexCount = positionAttribute.count;
  for (let i = 0; i < indexAttribute.count; i++) {
    const index = indexAttribute.getX(i);
    if (index < 0 || index >= vertexCount) {
      return false;
    }
  }

  return true;
}

/**
 * Remaps vertex indices in the index buffer and removes degenerate faces.
 * This is used after merging vertices.
 * @param {THREE.BufferAttribute} originalIndex - The original index buffer attribute.
 * @param {Map<number, number>} indexMap - A map from old vertex indices to new ones.
 * @returns {Array<number>} A new, cleaned array of indices.
 */
export function remapAndCleanIndices(originalIndex, indexMap) {
  const newIndices = [];
  const oldIndices = Array.from(originalIndex.array);

  for (let i = 0; i < oldIndices.length; i += 3) {
    // Get the original vertex indices for the face
    let v1 = oldIndices[i];
    let v2 = oldIndices[i + 1];
    let v3 = oldIndices[i + 2];

    // Remap them if they are in the map
    if (indexMap.has(v1)) v1 = indexMap.get(v1);
    if (indexMap.has(v2)) v2 = indexMap.get(v2);
    if (indexMap.has(v3)) v3 = indexMap.get(v3);

    // Check for degenerate faces (where two or more vertices are the same)
    if (v1 !== v2 && v1 !== v3 && v2 !== v3) {
      newIndices.push(v1, v2, v3);
    }
  }

  return newIndices;
}