/**
 * @fileoverview Transform System Index
 * Centralized exports for all transform functionality
 */

// Core transform classes
export { Transform } from './core/Transform.js';
export { TransformManager } from './core/TransformManager.js';

// Transform operations
export * from './TransformOperations.js';
export * from './meshTransforms.js';
export * from './vertexTransforms.js';

// Transform gizmos and visualizers
export * from './TransformGizmo.js';

// Modern transform system
export * from './modernTransformManager.js';
export * from './modernIndex.js';

// Export constants
export const TransformSpaces = {
  WORLD: 'world',
  LOCAL: 'local'
};

export const TransformModes = {
  ABSOLUTE: 'absolute',
  RELATIVE: 'relative'
};

export const AlignmentModes = {
  MIN: 'min',
  MAX: 'max',
  CENTER: 'center',
  PIVOT: 'pivot'
};

export const DistributionAxes = {
  X: 'x',
  Y: 'y',
  Z: 'z'
};

export const SnapModes = {
  VERTEX: 'vertex',
  EDGE: 'edge',
  FACE: 'face',
  CENTER: 'center'
};

// Export utility functions
export const TransformUtils = {
  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  degreesToRadians: (degrees) => degrees * (Math.PI / 180),

  /**
   * Convert radians to degrees
   * @param {number} radians - Radians
   * @returns {number} Degrees
   */
  radiansToDegrees: (radians) => radians * (180 / Math.PI),

  /**
   * Create identity transform
   * @returns {Transform} Identity transform
   */
  createIdentityTransform: () => new Transform(),

  /**
   * Create transform from matrix
   * @param {Array} matrix - 4x4 transformation matrix
   * @returns {Transform} Transform instance
   */
  createTransformFromMatrix: (matrix) => {
    const position = { x: matrix[12], y: matrix[13], z: matrix[14] };
    const scale = {
      x: Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1] + matrix[2] * matrix[2]),
      y: Math.sqrt(matrix[4] * matrix[4] + matrix[5] * matrix[5] + matrix[6] * matrix[6]),
      z: Math.sqrt(matrix[8] * matrix[8] + matrix[9] * matrix[9] + matrix[10] * matrix[10])
    };
    
    return new Transform({ position, scale });
  },

  /**
   * Interpolate between two transforms
   * @param {Transform} transform1 - First transform
   * @param {Transform} transform2 - Second transform
   * @param {number} t - Interpolation factor (0-1)
   * @returns {Transform} Interpolated transform
   */
  interpolateTransforms: (transform1, transform2, t) => {
    const position = {
      x: transform1.position.x + (transform2.position.x - transform1.position.x) * t,
      y: transform1.position.y + (transform2.position.y - transform1.position.y) * t,
      z: transform1.position.z + (transform2.position.z - transform1.position.z) * t
    };
    
    const rotation = {
      x: transform1.rotation.x + (transform2.rotation.x - transform1.rotation.x) * t,
      y: transform1.rotation.y + (transform2.rotation.y - transform1.rotation.y) * t,
      z: transform1.rotation.z + (transform2.rotation.z - transform1.rotation.z) * t
    };
    
    const scale = {
      x: transform1.scale.x + (transform2.scale.x - transform1.scale.x) * t,
      y: transform1.scale.y + (transform2.scale.y - transform1.scale.y) * t,
      z: transform1.scale.z + (transform2.scale.z - transform1.scale.z) * t
    };
    
    return new Transform({ position, rotation, scale });
  },

  /**
   * Validate transform data
   * @param {Object} transformData - Transform data to validate
   * @returns {Object} Validation result
   */
  validateTransformData: (transformData) => {
    const errors = [];
    
    if (!transformData) {
      errors.push('Transform data is required');
      return { isValid: false, errors };
    }
    
    if (transformData.position) {
      const pos = transformData.position;
      if (typeof pos.x !== 'number' || typeof pos.y !== 'number' || typeof pos.z !== 'number') {
        errors.push('Position must have numeric x, y, z values');
      }
    }
    
    if (transformData.rotation) {
      const rot = transformData.rotation;
      if (typeof rot.x !== 'number' || typeof rot.y !== 'number' || typeof rot.z !== 'number') {
        errors.push('Rotation must have numeric x, y, z values');
      }
    }
    
    if (transformData.scale) {
      const scale = transformData.scale;
      if (typeof scale.x !== 'number' || typeof scale.y !== 'number' || typeof scale.z !== 'number') {
        errors.push('Scale must have numeric x, y, z values');
      }
      if (scale.x <= 0 || scale.y <= 0 || scale.z <= 0) {
        errors.push('Scale values must be positive');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Default export
export default {
  TransformUtils,
  TransformSpaces,
  TransformModes,
  AlignmentModes,
  DistributionAxes,
  SnapModes,
  GizmoTypes,
  GizmoColors
}; 