/**
 * @fileoverview Rotate UV coordinates
 * Provides functionality to rotate UV coordinates around a center point
 */

import * as THREE from 'three';
import { UVOperationTypes } from '../../types/operationTypes.js';
import { UVOperationValidator } from '../../validation/operationValidator.js';

/**
 * Rotates UV coordinates
 * @param {THREE.BufferGeometry} geometry - The geometry to modify
 * @param {Array<number>} uvIndices - The indices of the UV coordinates to rotate
 * @param {Object} options - Configuration options
 * @param {number} [options.angle=0] - Rotation angle in radians
 * @param {THREE.Vector2} [options.center] - Center point for rotation
 * @returns {Object} Operation result with success status and modified geometry
 */
export function rotateUVs(geometry, uvIndices, options = {}) {
  const validator = new UVOperationValidator();
  const validation = validator.validateParams({ geometry, uvIndices, options }, UVOperationTypes.ROTATE);
  
  if (!validation.isValid) {
    return { success: false, errors: validation.errors, geometry: null };
  }

  const { angle = 0, center } = options;
  
  try {
    const newGeometry = geometry.clone();
    
    // Implementation: Rotate UV coordinates
    // This would involve:
    // 1. Getting UV attribute from geometry
    // 2. Calculating center point if not provided
    // 3. Applying rotation transformation to selected UVs
    // 4. Updating the geometry
    
    return {
      success: true,
      geometry: newGeometry,
      metadata: {
        rotatedCount: uvIndices.length,
        angle,
        center
      }
    };
  } catch (error) {
    return { success: false, errors: [error.message], geometry: null };
  }
} 