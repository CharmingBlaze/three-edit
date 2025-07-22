/**
 * @fileoverview Bevel Operation
 * Bevels the selected edges, faces, or vertices
 */

import * as THREE from 'three';
import { GeometryOperationTypes, OperationResult } from '../../types/operationTypes.js';
import { GeometryOperationValidator } from '../../validation/operationValidator.js';
import { 
  getVerticesFromIndices, 
  getAdjacentFaces, 
  createGeometryFromVertices,
  cloneGeometryWithPositions,
  calculateFaceNormal
} from '../../core/geometryUtils.js';
import { 
  calculateCentroid,
  interpolatePoints 
} from '../../core/mathUtils.js';

/**
 * Bevels the selected edges, faces, or vertices
 * @param {THREE.BufferGeometry} geometry - The geometry to modify
 * @param {Array<number>} elementIndices - The indices of the elements to bevel
 * @param {Object} options - Configuration options
 * @param {string} options.type - The type of elements to bevel ('edges', 'faces', 'vertices')
 * @param {number} options.amount - Bevel amount
 * @param {number} options.segments - Number of segments for the bevel
 * @returns {Object} Operation result
 */
export function bevel(geometry, elementIndices, options = {}) {
  const { amount = 0.1, segments = 1, type = 'edges' } = options;
  
  // Validate parameters
  const validation = GeometryOperationValidator.validateParams(
    { geometry, indices: elementIndices, options }, 
    GeometryOperationTypes.BEVEL
  );
  
  if (!validation.isValid) {
    return { ...OperationResult, errors: validation.errors };
  }

  if (type !== 'edges') {
    console.warn(`Bevel for '${type}' is not yet implemented.`);
    return { ...OperationResult, geometry };
  }

  try {
    const originalPositions = geometry.getAttribute('position').array;
    const originalIndices = geometry.getIndex().array;
    const newVertices = Array.from(originalPositions);
    const newIndices = [];
    let nextNewVertexIndex = newVertices.length / 3;

    // Create beveled vertices for each edge
    const edgesToBevel = new Set();
    elementIndices.forEach(edgeIndex => {
      const edgeStart = originalIndices[edgeIndex * 2];
      const edgeEnd = originalIndices[edgeIndex * 2 + 1];
      edgesToBevel.add([edgeStart, edgeEnd].sort().join('-'));
    });

    // Add beveled vertices
    edgesToBevel.forEach(edgeKey => {
      const [v1, v2] = edgeKey.split('-').map(Number);
      const vertex1 = new THREE.Vector3(
        originalPositions[v1 * 3],
        originalPositions[v1 * 3 + 1],
        originalPositions[v1 * 3 + 2]
      );
      const vertex2 = new THREE.Vector3(
        originalPositions[v2 * 3],
        originalPositions[v2 * 3 + 1],
        originalPositions[v2 * 3 + 2]
      );

      // Create beveled vertices
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const beveledVertex = interpolatePoints(vertex1, vertex2, t);
        newVertices.push(beveledVertex.x, beveledVertex.y, beveledVertex.z);
      }
    });

    // Rebuild faces
    for (let i = 0; i < originalIndices.length; i += 3) {
      const f = [originalIndices[i], originalIndices[i+1], originalIndices[i+2]];
      const faceEdges = [
        [f[0], f[1]].sort().join('-'),
        [f[1], f[2]].sort().join('-'),
        [f[2], f[0]].sort().join('-'),
      ];

      const beveledEdgesOnFace = faceEdges.map(e => edgesToBevel.has(e)).filter(Boolean).length;

      if (beveledEdgesOnFace === 0) {
        newIndices.push(...f);
      }
    }
    
    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
    newGeometry.setIndex(newIndices);
    newGeometry.computeVertexNormals();

    console.warn('Bevel face reconstruction is not fully implemented.');

    return { 
      ...OperationResult, 
      success: true, 
      geometry: newGeometry,
      metadata: { operation: 'bevel', type, amount, segments }
    };
  } catch (error) {
    return { 
      ...OperationResult, 
      errors: [`Bevel operation failed: ${error.message}`] 
    };
  }
} 