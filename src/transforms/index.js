/**
 * @fileoverview Transform System
 * Main entry point for the transform system
 */

import { TransformGizmo, GizmoTypes, GizmoColors } from './TransformGizmo.js';
import { TransformManager, Transform } from './TransformManager.js';
import { TransformOperations } from './TransformOperations.js';

/**
 * Create a transform manager
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoUpdate - Auto-update transforms
 * @param {boolean} options.cacheMatrices - Cache transformation matrices
 * @param {number} options.maxTransforms - Maximum transforms to manage
 * @returns {TransformManager} Transform manager instance
 */
export function createTransformManager(options = {}) {
  return new TransformManager(options);
}

/**
 * Create a transform
 * @param {Object} options - Transform options
 * @param {Object} options.position - Position {x, y, z}
 * @param {Object} options.rotation - Rotation {x, y, z} in radians
 * @param {Object} options.scale - Scale {x, y, z}
 * @param {Object} options.pivot - Pivot point {x, y, z}
 * @param {string} options.space - Transform space ('world', 'local')
 * @returns {Transform} Transform instance
 */
export function createTransform(options = {}) {
  return new Transform(options);
}

/**
 * Create a transform gizmo
 * @param {Object} options - Gizmo options
 * @param {string} options.type - Gizmo type
 * @param {number} options.size - Gizmo size
 * @param {Object} options.position - Gizmo position
 * @param {boolean} options.visible - Gizmo visibility
 * @returns {TransformGizmo} Transform gizmo instance
 */
export function createTransformGizmo(options = {}) {
  return new TransformGizmo(options);
}

/**
 * Align objects to target
 * @param {Array} objects - Objects to align
 * @param {Object} target - Target object or point
 * @param {Object} options - Alignment options
 * @param {string} options.axis - Alignment axis ('x', 'y', 'z', 'all')
 * @param {string} options.mode - Alignment mode ('min', 'max', 'center', 'pivot')
 * @returns {Array} Aligned objects
 */
export function alignObjects(objects, target, options = {}) {
  return TransformOperations.alignObjects(objects, target, options);
}

/**
 * Distribute objects evenly
 * @param {Array} objects - Objects to distribute
 * @param {Object} options - Distribution options
 * @param {string} options.axis - Distribution axis ('x', 'y', 'z')
 * @param {number} options.spacing - Spacing between objects
 * @param {boolean} options.includeBounds - Include object bounds in spacing
 * @returns {Array} Distributed objects
 */
export function distributeObjects(objects, options = {}) {
  return TransformOperations.distributeObjects(objects, options);
}

/**
 * Arrange objects in grid
 * @param {Array} objects - Objects to arrange
 * @param {Object} options - Grid options
 * @param {number} options.rows - Number of rows
 * @param {number} options.columns - Number of columns
 * @param {number} options.spacing - Spacing between objects
 * @param {string} options.axis - Primary axis ('x', 'y', 'z')
 * @returns {Array} Arranged objects
 */
export function arrangeInGrid(objects, options = {}) {
  return TransformOperations.arrangeInGrid(objects, options);
}

/**
 * Mirror objects
 * @param {Array} objects - Objects to mirror
 * @param {Object} options - Mirror options
 * @param {string} options.axis - Mirror axis ('x', 'y', 'z')
 * @param {Object} options.center - Mirror center point
 * @param {boolean} options.duplicate - Create duplicates
 * @returns {Array} Mirrored objects
 */
export function mirrorObjects(objects, options = {}) {
  return TransformOperations.mirrorObjects(objects, options);
}

/**
 * Rotate objects around point
 * @param {Array} objects - Objects to rotate
 * @param {Object} center - Rotation center
 * @param {Object} rotation - Rotation angles in radians
 * @param {Object} options - Rotation options
 * @param {string} options.space - Rotation space ('world', 'local')
 * @returns {Array} Rotated objects
 */
export function rotateAroundPoint(objects, center, rotation, options = {}) {
  return TransformOperations.rotateAroundPoint(objects, center, rotation, options);
}

/**
 * Scale objects from point
 * @param {Array} objects - Objects to scale
 * @param {Object} center - Scaling center
 * @param {Object} scale - Scale factors
 * @param {Object} options - Scaling options
 * @param {boolean} options.uniform - Uniform scaling
 * @returns {Array} Scaled objects
 */
export function scaleFromPoint(objects, center, scale, options = {}) {
  return TransformOperations.scaleFromPoint(objects, center, scale, options);
}

/**
 * Snap objects to grid
 * @param {Array} objects - Objects to snap
 * @param {Object} options - Snap options
 * @param {number} options.gridSize - Grid size
 * @param {string} options.axis - Snap axis ('x', 'y', 'z', 'all')
 * @param {boolean} options.snapToCenter - Snap to grid center
 * @returns {Array} Snapped objects
 */
export function snapToGrid(objects, options = {}) {
  return TransformOperations.snapToGrid(objects, options);
}

/**
 * Snap objects to other objects
 * @param {Array} objects - Objects to snap
 * @param {Array} targets - Target objects
 * @param {Object} options - Snap options
 * @param {number} options.threshold - Snap threshold
 * @param {string} options.mode - Snap mode ('vertex', 'edge', 'face', 'center')
 * @returns {Array} Snapped objects
 */
export function snapToObjects(objects, targets, options = {}) {
  return TransformOperations.snapToObjects(objects, targets, options);
}

/**
 * Create transform from two points
 * @param {Object} point1 - First point
 * @param {Object} point2 - Second point
 * @returns {Object} Transform data
 */
export function createTransformFromPoints(point1, point2) {
  return TransformOperations.createTransformFromPoints(point1, point2);
}

/**
 * Create transform from bounding box
 * @param {Object} bounds - Bounding box
 * @returns {Object} Transform data
 */
export function createTransformFromBounds(bounds) {
  return TransformOperations.createTransformFromBounds(bounds);
}

/**
 * Validate transform operation
 * @param {Object} operation - Transform operation
 * @returns {Object} Validation result
 */
export function validateTransformOperation(operation) {
  return TransformOperations.validateOperation(operation);
}

/**
 * Calculate bounds for objects
 * @param {Array|Object} objects - Objects or single object
 * @returns {Object} Bounds object
 */
export function calculateBounds(objects) {
  return TransformOperations.calculateBounds(objects);
}

// Export classes
export { TransformManager, Transform } from './TransformManager.js';
export { TransformOperations } from './TransformOperations.js';
export { TransformGizmo, GizmoTypes, GizmoColors } from './TransformGizmo.js';

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
  createTransformManager,
  createTransform,
  createTransformGizmo,
  alignObjects,
  distributeObjects,
  arrangeInGrid,
  mirrorObjects,
  rotateAroundPoint,
  scaleFromPoint,
  snapToGrid,
  snapToObjects,
  createTransformFromPoints,
  createTransformFromBounds,
  validateTransformOperation,
  calculateBounds,
  TransformUtils,
  TransformSpaces,
  TransformModes,
  AlignmentModes,
  DistributionAxes,
  SnapModes,
  GizmoTypes,
  GizmoColors
}; 