/**
 * @fileoverview Vertex Helper Functions
 * A collection of utility functions for vertex operations.
 */

import { VertexOperations } from '../operations/vertexOperations.js';

/**
 * Snap vertices to target
 * @param {Array} vertices - Vertices to snap
 * @param {Object} target - Target object or point
 * @param {Object} options - Snap options
 * @returns {Object} Snap result
 */
export function snapVertices(vertices, target, options = {}) {
  return VertexOperations.snapVertices(vertices, target, options);
}

/**
 * Connect vertices with edges
 * @param {Array} vertexPairs - Pairs of vertices to connect
 * @param {Object} options - Connect options
 * @returns {Object} Connect result
 */
export function connectVertices(vertexPairs, options = {}) {
  return VertexOperations.connectVertices(vertexPairs, options);
}

/**
 * Merge vertices
 * @param {Array} vertices - Vertices to merge
 * @param {Object} options - Merge options
 * @returns {Object} Merge result
 */
export function mergeVertices(vertices, options = {}) {
  return VertexOperations.mergeVertices(vertices, options);
}

/**
 * Split vertices
 * @param {Array} vertices - Vertices to split
 * @param {Object} options - Split options
 * @returns {Object} Split result
 */
export function splitVertices(vertices, options = {}) {
  return VertexOperations.splitVertices(vertices, options);
}

/**
 * Collapse vertices
 * @param {Array} vertices - Vertices to collapse
 * @param {Object} options - Collapse options
 * @returns {Object} Collapse result
 */
export function collapseVertices(vertices, options = {}) {
  return VertexOperations.collapseVertices(vertices, options);
}
