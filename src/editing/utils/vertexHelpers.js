/**
 * @fileoverview Vertex Helper Functions
 * A collection of utility functions for vertex operations.
 */

import { 
  snapVertices as snapVerticesOp,
  connectVertices as connectVerticesOp,
  mergeVertices as mergeVerticesOp,
  splitVertices as splitVerticesOp
} from '../operations/vertex/index.js';

/**
 * Snap vertices to target
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} vertexIndices - Indices of vertices to snap
 * @param {Object} options - Snap options
 * @returns {Object} Snap result
 */
export function snapVertices(geometry, vertexIndices, options = {}) {
  return snapVerticesOp(geometry, vertexIndices, options);
}

/**
 * Connect vertices with edges
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} vertexGroup1 - First group of vertices
 * @param {Array<Number>} vertexGroup2 - Second group of vertices
 * @param {Object} options - Connect options
 * @returns {Object} Connect result
 */
export function connectVertices(geometry, vertexGroup1, vertexGroup2, options = {}) {
  return connectVerticesOp(geometry, vertexGroup1, vertexGroup2, options);
}

/**
 * Merge vertices
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} vertexIndices - Indices of vertices to merge
 * @param {Object} options - Merge options
 * @returns {Object} Merge result
 */
export function mergeVertices(geometry, vertexIndices, options = {}) {
  return mergeVerticesOp(geometry, vertexIndices, options);
}

/**
 * Split vertices
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} vertexIndices - Indices of vertices to split
 * @param {Object} options - Split options
 * @returns {Object} Split result
 */
export function splitVertices(geometry, vertexIndices, options = {}) {
  return splitVerticesOp(geometry, vertexIndices, options);
}
