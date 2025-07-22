/**
 * @fileoverview Edge Helper Functions
 * A collection of utility functions for edge operations.
 */

import { 
  splitEdges as splitEdgesOp,
  collapseEdges as collapseEdgesOp,
  dissolveEdges as dissolveEdgesOp,
  bevelEdges as bevelEdgesOp,
  extrudeEdges as extrudeEdgesOp
} from '../operations/edge/index.js';

/**
 * Split edges
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} edgeIndices - Indices of edges to split
 * @param {Object} options - Split options
 * @returns {Object} Split result
 */
export function splitEdges(geometry, edgeIndices, options = {}) {
  return splitEdgesOp(geometry, edgeIndices, options);
}

/**
 * Collapse edges
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} edgeIndices - Indices of edges to collapse
 * @param {Object} options - Collapse options
 * @returns {Object} Collapse result
 */
export function collapseEdges(geometry, edgeIndices, options = {}) {
  return collapseEdgesOp(geometry, edgeIndices, options);
}

/**
 * Dissolve edges
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} edgeIndices - Indices of edges to dissolve
 * @param {Object} options - Dissolve options
 * @returns {Object} Dissolve result
 */
export function dissolveEdges(geometry, edgeIndices, options = {}) {
  return dissolveEdgesOp(geometry, edgeIndices, options);
}

/**
 * Bevel edges
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} edgeIndices - Indices of edges to bevel
 * @param {Object} options - Bevel options
 * @returns {Object} Bevel result
 */
export function bevelEdges(geometry, edgeIndices, options = {}) {
  return bevelEdgesOp(geometry, edgeIndices, options);
}

/**
 * Extrude edges
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} edgeIndices - Indices of edges to extrude
 * @param {Object} options - Extrude options
 * @returns {Object} Extrude result
 */
export function extrudeEdges(geometry, edgeIndices, options = {}) {
  return extrudeEdgesOp(geometry, edgeIndices, options);
}

/**
 * Bridge edges
 * @param {Array} edgePairs - Pairs of edges to bridge
 * @param {Object} options - Bridge options
 * @returns {Object} Bridge result
 */
export function bridgeEdges(edgePairs, options = {}) {
  return EdgeOperations.bridgeEdges(edgePairs, options);
}

/**
 * Loop cut edges
 * @param {Array} edges - Edges to cut
 * @param {Object} options - Loop cut options
 * @returns {Object} Loop cut result
 */
export function loopCutEdges(edges, options = {}) {
  return EdgeOperations.loopCutEdges(edges, options);
}

/**
 * Ring cut edges
 * @param {Array} edges - Edges to cut
 * @param {Object} options - Ring cut options
 * @returns {Object} Ring cut result
 */
export function ringCutEdges(edges, options = {}) {
  return EdgeOperations.ringCutEdges(edges, options);
}

/**
 * Connect edges
 * @param {Array} edges - Edges to connect
 * @param {Object} options - Connect options
 * @returns {Object} Connect result
 */
export function connectEdges(edges, options = {}) {
  return EdgeOperations.connectEdges(edges, options);
}

/**
 * Merge edges
 * @param {Array} edges - Edges to merge
 * @param {Object} options - Merge options
 * @returns {Object} Merge result
 */
export function mergeEdges(edges, options = {}) {
  return EdgeOperations.mergeEdges(edges, options);
}

/**
 * Remove double edges
 * @param {Array} edges - Edges to check for doubles
 * @param {Object} options - Remove doubles options
 * @returns {Object} Remove doubles result
 */
export function removeDoubleEdges(edges, options = {}) {
  return EdgeOperations.removeDoubleEdges(edges, options);
}

/**
 * Smooth edges
 * @param {Array} edges - Edges to smooth
 * @param {Object} options - Smooth options
 * @returns {Object} Smooth result
 */
export function smoothEdges(edges, options = {}) {
  return EdgeOperations.smoothEdges(edges, options);
}

/**
 * Relax edges
 * @param {Array} edges - Edges to relax
 * @param {Object} options - Relax options
 * @returns {Object} Relax result
 */
export function relaxEdges(edges, options = {}) {
  return EdgeOperations.relaxEdges(edges, options);
}

/**
 * Fill edges to create faces
 * @param {Array} edges - Edges to fill
 * @param {Object} options - Fill options
 * @returns {Object} Fill result
 */
export function fillEdges(edges, options = {}) {
  return EdgeOperations.fillEdges(edges, options);
}

/**
 * Knife cut edges
 * @param {Array} edges - Edges to cut
 * @param {Object} options - Knife options
 * @returns {Object} Knife result
 */
export function knifeEdges(edges, options = {}) {
  return EdgeOperations.knifeEdges(edges, options);
}

/**
 * Slice edges
 * @param {Array} edges - Edges to slice
 * @param {Object} options - Slice options
 * @returns {Object} Slice result
 */
export function sliceEdges(edges, options = {}) {
  return EdgeOperations.sliceEdges(edges, options);
}

/**
 * Subdivide edges
 * @param {Array} edges - Edges to subdivide
 * @param {Object} options - Subdivide options
 * @returns {Object} Subdivide result
 */
export function subdivideEdges(edges, options = {}) {
  return EdgeOperations.subdivideEdges(edges, options);
}

/**
 * Mark edges as crease
 * @param {Array} edges - Edges to mark
 * @param {Object} options - Crease options
 * @returns {Object} Crease result
 */
export function creaseEdges(edges, options = {}) {
  return EdgeOperations.creaseEdges(edges, options);
}

/**
 * Mark edges as seam
 * @param {Array} edges - Edges to mark
 * @param {Object} options - Seam options
 * @returns {Object} Seam result
 */
export function markSeamEdges(edges, options = {}) {
  return EdgeOperations.markSeamEdges(edges, options);
}

/**
 * Mark edges as sharp
 * @param {Array} edges - Edges to mark
 * @param {Object} options - Sharp options
 * @returns {Object} Sharp result
 */
export function markSharpEdges(edges, options = {}) {
  return EdgeOperations.markSharpEdges(edges, options);
}

/**
 * Mark edges as boundary
 * @param {Array} edges - Edges to mark
 * @param {Object} options - Boundary options
 * @returns {Object} Boundary result
 */
export function markBoundaryEdges(edges, options = {}) {
  return EdgeOperations.markBoundaryEdges(edges, options);
}

/**
 * Mark edges as freestyle
 * @param {Array} edges - Edges to mark
 * @param {Object} options - Freestyle options
 * @returns {Object} Freestyle result
 */
export function markFreestyleEdges(edges, options = {}) {
  return EdgeOperations.markFreestyleEdges(edges, options);
}
