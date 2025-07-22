/**
 * @fileoverview Face Helper Functions
 * A collection of utility functions for face operations.
 */

import { FaceOperations } from '../operations/faceOperations.js';

/**
 * Split faces
 * @param {Array} faces - Faces to split
 * @param {Object} options - Split options
 * @returns {Object} Split result
 */
export function splitFaces(faces, options = {}) {
  return FaceOperations.splitFaces(faces, options);
}

/**
 * Collapse faces
 * @param {Array} faces - Faces to collapse
 * @param {Object} options - Collapse options
 * @returns {Object} Collapse result
 */
export function collapseFaces(faces, options = {}) {
  return FaceOperations.collapseFaces(faces, options);
}

/**
 * Dissolve faces
 * @param {Array} faces - Faces to dissolve
 * @param {Object} options - Dissolve options
 * @returns {Object} Dissolve result
 */
export function dissolveFaces(faces, options = {}) {
  return FaceOperations.dissolveFaces(faces, options);
}

/**
 * Bevel faces
 * @param {Array} faces - Faces to bevel
 * @param {Object} options - Bevel options
 * @returns {Object} Bevel result
 */
export function bevelFaces(faces, options = {}) {
  return FaceOperations.bevelFaces(faces, options);
}

/**
 * Extrude faces
 * @param {Array} faces - Faces to extrude
 * @param {Object} options - Extrude options
 * @returns {Object} Extrude result
 */
export function extrudeFaces(faces, options = {}) {
  return FaceOperations.extrudeFaces(faces, options);
}

/**
 * Inset faces
 * @param {Array} faces - Faces to inset
 * @param {Object} options - Inset options
 * @returns {Object} Inset result
 */
export function insetFaces(faces, options = {}) {
  return FaceOperations.insetFaces(faces, options);
}

/**
 * Poke faces
 * @param {Array} faces - Faces to poke
 * @param {Object} options - Poke options
 * @returns {Object} Poke result
 */
export function pokeFaces(faces, options = {}) {
  return FaceOperations.pokeFaces(faces, options);
}

/**
 * Triangulate faces
 * @param {Array} faces - Faces to triangulate
 * @param {Object} options - Triangulate options
 * @returns {Object} Triangulate result
 */
export function triangulateFaces(faces, options = {}) {
  return FaceOperations.triangulateFaces(faces, options);
}

/**
 * Quadify faces
 * @param {Array} faces - Faces to quadify
 * @param {Object} options - Quadify options
 * @returns {Object} Quadify result
 */
export function quadifyFaces(faces, options = {}) {
  return FaceOperations.quadifyFaces(faces, options);
}

/**
 * Smooth faces
 * @param {Array} faces - Faces to smooth
 * @param {Object} options - Smooth options
 * @returns {Object} Smooth result
 */
export function smoothFaces(faces, options = {}) {
  return FaceOperations.smoothFaces(faces, options);
}

/**
 * Flatten faces
 * @param {Array} faces - Faces to flatten
 * @param {Object} options - Flatten options
 * @returns {Object} Flatten result
 */
export function flattenFaces(faces, options = {}) {
  return FaceOperations.flattenFaces(faces, options);
}

/**
 * Fill faces
 * @param {Array} faces - Faces to fill
 * @param {Object} options - Fill options
 * @returns {Object} Fill result
 */
export function fillFaces(faces, options = {}) {
  return FaceOperations.fillFaces(faces, options);
}

/**
 * Bridge faces
 * @param {Array} facePairs - Pairs of faces to bridge
 * @param {Object} options - Bridge options
 * @returns {Object} Bridge result
 */
export function bridgeFaces(facePairs, options = {}) {
  return FaceOperations.bridgeFaces(facePairs, options);
}

/**
 * Knife cut faces
 * @param {Array} faces - Faces to cut
 * @param {Object} options - Knife options
 * @returns {Object} Knife result
 */
export function knifeFaces(faces, options = {}) {
  return FaceOperations.knifeFaces(faces, options);
}

/**
 * Slice faces
 * @param {Array} faces - Faces to slice
 * @param {Object} options - Slice options
 * @returns {Object} Slice result
 */
export function sliceFaces(faces, options = {}) {
  return FaceOperations.sliceFaces(faces, options);
}

/**
 * Subdivide faces
 * @param {Array} faces - Faces to subdivide
 * @param {Object} options - Subdivide options
 * @returns {Object} Subdivide result
 */
export function subdivideFaces(faces, options = {}) {
  return FaceOperations.subdivideFaces(faces, options);
}

/**
 * Make faces planar
 * @param {Array} faces - Faces to make planar
 * @param {Object} options - Planar options
 * @returns {Object} Planar result
 */
export function planarFaces(faces, options = {}) {
  return FaceOperations.planarFaces(faces, options);
}

/**
 * Make faces concave
 * @param {Array} faces - Faces to make concave
 * @param {Object} options - Concave options
 * @returns {Object} Concave result
 */
export function concaveFaces(faces, options = {}) {
  return FaceOperations.concaveFaces(faces, options);
}

/**
 * Make faces convex
 * @param {Array} faces - Faces to make convex
 * @param {Object} options - Convex options
 * @returns {Object} Convex result
 */
export function convexFaces(faces, options = {}) {
  return FaceOperations.convexFaces(faces, options);
}

/**
 * Mark faces as seam
 * @param {Array} faces - Faces to mark
 * @param {Object} options - Seam options
 * @returns {Object} Seam result
 */
export function markSeamFaces(faces, options = {}) {
  return FaceOperations.markSeamFaces(faces, options);
}

/**
 * Mark faces as sharp
 * @param {Array} faces - Faces to mark
 * @param {Object} options - Sharp options
 * @returns {Object} Sharp result
 */
export function markSharpFaces(faces, options = {}) {
  return FaceOperations.markSharpFaces(faces, options);
}

/**
 * Mark faces as freestyle
 * @param {Array} faces - Faces to mark
 * @param {Object} options - Freestyle options
 * @returns {Object} Freestyle result
 */
export function markFreestyleFaces(faces, options = {}) {
  return FaceOperations.markFreestyleFaces(faces, options);
}
