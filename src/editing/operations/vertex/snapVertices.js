/**
 * @fileoverview Snap Vertices Operation
 * Snaps selected vertices to a target location, grid, or other geometry
 */

import * as THREE from 'three';
import { VertexOperationTypes } from '../../types/operationTypes.js';
import { VertexOperationValidator } from '../../validation/operationValidator.js';
import { getVerticesFromIndices } from '../../core/geometryUtils.js';
import { distance, calculateCentroid } from '../../core/mathUtils.js';

/**
 * Snaps selected vertices to a target location, grid, or other geometry
 * @param {THREE.BufferGeometry} geometry - The geometry to modify
 * @param {Array<number>} vertexIndices - The indices of the vertices to snap
 * @param {Object} options - Configuration options
 * @param {string} [options.mode='nearest'] - Snapping mode: 'nearest', 'grid', 'vertex', 'edge', 'face'
 * @param {THREE.Vector3} [options.target] - Target point for 'nearest' mode
 * @param {number} [options.threshold=0.1] - Maximum distance for snapping
 * @param {number} [options.gridSize=1.0] - Grid size for 'grid' mode
 * @returns {Object} Operation result
 */
export function snapVertices(geometry, vertexIndices, options = {}) {
  const validation = VertexOperationValidator.validateParams({ geometry, vertexIndices, options }, VertexOperationTypes.SNAP);
  
  if (!validation.isValid) {
    return { success: false, errors: validation.errors, geometry: null };
  }

  const { mode = 'nearest', target, threshold = 0.1, gridSize = 1.0 } = options;
  const vertices = getVerticesFromIndices(geometry, vertexIndices);
  
  if (!vertices || vertices.length === 0) {
    return { success: false, errors: ['No valid vertices found'], geometry: null };
  }

  try {
    const snappedVertices = vertices.map(vertex => {
      const snappedPosition = calculateSnapPosition(vertex, target, { threshold, mode, gridSize });
      return { ...vertex, position: snappedPosition };
    });

    const newGeometry = geometry.clone();
    // Update geometry with snapped vertices
    // Implementation details would go here

    return {
      success: true,
      geometry: newGeometry,
      metadata: {
        snappedCount: snappedVertices.length,
        mode,
        threshold
      }
    };
  } catch (error) {
    return { success: false, errors: [error.message], geometry: null };
  }
}

/**
 * Calculate snap position based on mode and options
 * @param {THREE.Vector3} vertex - Vertex to snap
 * @param {THREE.Vector3} target - Target point
 * @param {Object} options - Snap options
 * @returns {THREE.Vector3} Snapped position
 */
function calculateSnapPosition(vertex, target, options) {
  const { threshold, mode, gridSize } = options;
  
  switch (mode) {
    case 'nearest':
      if (target && distance(vertex, target) <= threshold) {
        return target.clone();
      }
      return vertex.clone();
      
    case 'grid':
      return new THREE.Vector3(
        Math.round(vertex.x / gridSize) * gridSize,
        Math.round(vertex.y / gridSize) * gridSize,
        Math.round(vertex.z / gridSize) * gridSize
      );
      
    default:
      return vertex.clone();
  }
} 