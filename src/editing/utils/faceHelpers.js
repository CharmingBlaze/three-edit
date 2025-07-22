/**
 * @fileoverview Face Helper Functions
 * A collection of utility functions for face operations.
 */

import { 
  extrudeFaces as extrudeFacesOp,
  insetFaces as insetFacesOp,
  bevelFaces as bevelFacesOp,
  fillFaces as fillFacesOp
} from '../operations/face/index.js';

/**
 * Extrude faces
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} faceIndices - Indices of faces to extrude
 * @param {Object} options - Extrude options
 * @returns {Object} Extrude result
 */
export function extrudeFaces(geometry, faceIndices, options = {}) {
  return extrudeFacesOp(geometry, faceIndices, options);
}

/**
 * Inset faces
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} faceIndices - Indices of faces to inset
 * @param {Object} options - Inset options
 * @returns {Object} Inset result
 */
export function insetFaces(geometry, faceIndices, options = {}) {
  return insetFacesOp(geometry, faceIndices, options);
}

/**
 * Bevel faces
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} faceIndices - Indices of faces to bevel
 * @param {Object} options - Bevel options
 * @returns {Object} Bevel result
 */
export function bevelFaces(geometry, faceIndices, options = {}) {
  return bevelFacesOp(geometry, faceIndices, options);
}

/**
 * Fill faces
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Number>} faceIndices - Indices of faces to fill
 * @param {Object} options - Fill options
 * @returns {Object} Fill result
 */
export function fillFaces(geometry, faceIndices, options = {}) {
  return fillFacesOp(geometry, faceIndices, options);
}
