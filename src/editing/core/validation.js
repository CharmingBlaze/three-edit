/**
 * @fileoverview Core validation utilities for the mesh editing system.
 */

import * as THREE from 'three';

/**
 * Provides static methods for validating geometry and operation parameters.
 */
export class Validator {
  /**
   * Validates if a list of vertex indices are valid for a given geometry.
   * @param {THREE.BufferGeometry} geometry - The geometry.
   * @param {number[]} vertexIndices - An array of vertex indices to validate.
   * @returns {{isValid: boolean, errors: string[]}} - The validation result.
   */
  static validateVertexIndices(geometry, vertexIndices) {
    const errors = [];
    if (!geometry || !geometry.getAttribute('position')) {
      errors.push('Invalid geometry or missing position attribute.');
      return { isValid: false, errors };
    }

    const vertexCount = geometry.getAttribute('position').count;
    for (const index of vertexIndices) {
      if (typeof index !== 'number' || index < 0 || index >= vertexCount) {
        errors.push(`Invalid vertex index: ${index}. Must be a number between 0 and ${vertexCount - 1}.`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}
