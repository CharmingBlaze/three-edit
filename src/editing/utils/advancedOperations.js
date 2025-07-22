/**
 * @fileoverview Advanced Geometry Operations
 * A collection of high-level functions for complex geometry manipulations.
 */

import { GeometryOperations } from '../operations/index.js';

/**
 * Extrude geometry elements
 * @param {Array} elements - Elements to extrude
 * @param {Object} options - Extrude options
 * @returns {Object} Extrude result
 */
export function extrudeGeometry(elements, options = {}) {
  return GeometryOperations.extrude(elements, options);
}

/**
 * Inset geometry faces
 * @param {Array} faces - Faces to inset
 * @param {Object} options - Inset options
 * @returns {Object} Inset result
 */
export function insetGeometry(faces, options = {}) {
  return GeometryOperations.inset(faces, options);
}

/**
 * Extrude region
 * @param {Array} faces - Faces to extrude as region
 * @param {Object} options - Extrude region options
 * @returns {Object} Extrude region result
 */
export function extrudeRegion(faces, options = {}) {
  return GeometryOperations.extrudeRegion(faces, options);
}

/**
 * Bevel region
 * @param {Array} faces - Faces to bevel as region
 * @param {Object} options - Bevel region options
 * @returns {Object} Bevel region result
 */
export function bevelRegion(faces, options = {}) {
  return GeometryOperations.bevelRegion(faces, options);
}

/**
 * Inset region
 * @param {Array} faces - Faces to inset as region
 * @param {Object} options - Inset region options
 * @returns {Object} Inset region result
 */
export function insetRegion(faces, options = {}) {
  return GeometryOperations.insetRegion(faces, options);
}

/**
 * Loft profiles
 * @param {Array} profiles - Profile curves to loft
 * @param {Object} options - Loft options
 * @returns {Object} Loft result
 */
export function loftProfiles(profiles, options = {}) {
  return GeometryOperations.loft(profiles, options);
}

/**
 * Revolve profile
 * @param {Array} profile - Profile curve to revolve
 * @param {Object} options - Revolve options
 * @returns {Object} Revolve result
 */
export function revolveProfile(profile, options = {}) {
  return GeometryOperations.revolve(profile, options);
}

/**
 * Sweep profile along path
 * @param {Array} profile - Profile to sweep
 * @param {Array} path - Sweep path
 * @param {Object} options - Sweep options
 * @returns {Object} Sweep result
 */
export function sweepProfile(profile, path, options = {}) {
  return GeometryOperations.sweep(profile, path, options);
}

/**
 * Thicken faces
 * @param {Array} faces - Faces to thicken
 * @param {Object} options - Thicken options
 * @returns {Object} Thicken result
 */
export function thickenFaces(faces, options = {}) {
  return GeometryOperations.thicken(faces, options);
}

/**
 * Shell faces
 * @param {Array} faces - Faces to shell
 * @param {Object} options - Shell options
 * @returns {Object} Shell result
 */
export function shellFaces(faces, options = {}) {
  return GeometryOperations.shell(faces, options);
}
