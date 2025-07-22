/**
 * @fileoverview Merge Vertices Operation
 * Merges selected vertices into a single vertex
 */

import * as THREE from 'three';
import { VertexOperationTypes } from '../../types/operationTypes.js';
import { VertexOperationValidator } from '../../validation/operationValidator.js';
import { getVerticesFromIndices } from '../../core/geometryUtils.js';
import { calculateCentroid } from '../../core/mathUtils.js';

/**
 * Merges selected vertices into a single vertex
 * @param {THREE.BufferGeometry} geometry - The geometry to modify
 * @param {Array<number>} vertexIndices - The indices of the vertices to merge
 * @param {Object} options - Configuration options
 * @param {THREE.Vector3} [options.target] - Target position for merged vertex
 * @returns {Object} Operation result
 */
export function mergeVertices(geometry, vertexIndices, options = {}) {
  const validation = VertexOperationValidator.validateParams({ geometry, indices: vertexIndices, options }, VertexOperationTypes.MERGE);
  
  if (!validation.isValid) {
    return { success: false, errors: validation.errors, geometry: null };
  }

  if (!vertexIndices || vertexIndices.length < 2) {
    return { success: false, errors: ['At least two vertices are required to merge.'], geometry: null };
  }

  const { target } = options;
  const vertices = getVerticesFromIndices(geometry, vertexIndices);
  
  if (!vertices || vertices.length === 0) {
    return { success: false, errors: ['No valid vertices found'], geometry: null };
  }

  // Check for invalid indices
  const positionAttribute = geometry.getAttribute('position');
  const vertexCount = positionAttribute.count;
  for (const idx of vertexIndices) {
    if (idx < 0 || idx >= vertexCount) {
      return { success: false, errors: ['Invalid vertex index'], geometry: null };
    }
  }

  try {
    const newGeometry = geometry.clone();
    const positionAttribute = newGeometry.getAttribute('position');
    const indexAttribute = newGeometry.getIndex();
    
    // Calculate target position (centroid of vertices to merge)
    const targetPosition = target || calculateCentroid(vertices);
    
    // Use the first vertex index as the target vertex
    const targetVertexIndex = vertexIndices[0];
    const targetVertex = new THREE.Vector3();
    targetVertex.fromBufferAttribute(positionAttribute, targetVertexIndex);
    
    // Set target vertex to the calculated position
    positionAttribute.setXYZ(targetVertexIndex, targetPosition.x, targetPosition.y, targetPosition.z);
    
    // Update all faces that reference the merged vertices
    if (indexAttribute) {
      const indices = indexAttribute.array;
      const newIndices = [];
      
      // Process faces (triplets of indices)
      for (let i = 0; i < indices.length; i += 3) {
        const face = [
          indices[i],
          indices[i + 1],
          indices[i + 2]
        ];
        
        // Replace merged vertex indices with target vertex index
        const newFace = face.map(index => 
          vertexIndices.includes(index) ? targetVertexIndex : index
        );
        
        // Skip degenerate faces (any two indices are the same)
        if (newFace[0] === newFace[1] || newFace[1] === newFace[2] || newFace[2] === newFace[0]) {
          continue;
        }
        
        // Add valid face to new indices
        newIndices.push(...newFace);
      }
      
      // Create new index buffer
      newGeometry.setIndex(newIndices);
    }
    
    // Remove duplicate vertices and faces
    newGeometry.deleteAttribute('normal');
    newGeometry.computeVertexNormals();

    return {
      success: true,
      geometry: newGeometry,
      metadata: {
        mergedCount: vertices.length,
        target: targetPosition
      }
    };
  } catch (error) {
    return { success: false, errors: [error.message], geometry: null };
  }
} 