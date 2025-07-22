/**
 * @fileoverview Transform Operations
 * Advanced transform operations and utilities
 */

import { MathUtils } from '../utils/MathUtils.js';

/**
 * Transform operations and utilities
 */
export class TransformOperations {
  /**
   * Align objects to target
   * @param {Array} objects - Objects to align
   * @param {Object} target - Target object or point
   * @param {Object} options - Alignment options
   * @param {string} options.axis - Alignment axis ('x', 'y', 'z', 'all')
   * @param {string} options.mode - Alignment mode ('min', 'max', 'center', 'pivot')
   * @returns {Array} Aligned objects
   */
  static alignObjects(objects, target, options = {}) {
    const {
      axis = 'all',
      mode = 'center'
    } = options;

    if (objects.length === 0) {return objects;}

    const targetBounds = this.calculateBounds(target);
    const objectBounds = this.calculateBounds(objects);

    objects.forEach(object => {
      const newPosition = { ...object.position };

      if (axis === 'all' || axis === 'x') {
        newPosition.x = this.getAlignmentPosition(
          objectBounds.min.x,
          objectBounds.max.x,
          targetBounds.min.x,
          targetBounds.max.x,
          mode
        );
      }

      if (axis === 'all' || axis === 'y') {
        newPosition.y = this.getAlignmentPosition(
          objectBounds.min.y,
          objectBounds.max.y,
          targetBounds.min.y,
          targetBounds.max.y,
          mode
        );
      }

      if (axis === 'all' || axis === 'z') {
        newPosition.z = this.getAlignmentPosition(
          objectBounds.min.z,
          objectBounds.max.z,
          targetBounds.min.z,
          targetBounds.max.z,
          mode
        );
      }

      object.position = newPosition;
    });

    return objects;
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
  static distributeObjects(objects, options = {}) {
    const {
      axis = 'x',
      spacing = 1,
      includeBounds = true
    } = options;

    if (objects.length < 2) {return objects;}

    // Sort objects by position on specified axis
    const sortedObjects = [...objects].sort((a, b) => a.position[axis] - b.position[axis]);

    // Calculate total bounds
    const bounds = this.calculateBounds(sortedObjects);
    const totalSize = bounds.max[axis] - bounds.min[axis];

    // Calculate spacing
    const totalSpacing = (sortedObjects.length - 1) * spacing;
    const availableSpace = totalSize + totalSpacing;
    const step = availableSpace / (sortedObjects.length - 1);

    // Distribute objects
    sortedObjects.forEach((object, index) => {
      const newPosition = { ...object.position };
      newPosition[axis] = bounds.min[axis] + (index * step);
      object.position = newPosition;
    });

    return sortedObjects;
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
  static arrangeInGrid(objects, options = {}) {
    const {
      rows = 3,
      columns = 3,
      spacing = 1,
      axis = 'x'
    } = options;

    if (objects.length === 0) {return objects;}

    const secondaryAxis = axis === 'x' ? 'z' : axis === 'y' ? 'z' : 'x';
    const tertiaryAxis = axis === 'x' ? 'y' : axis === 'y' ? 'x' : 'y';

    objects.forEach((object, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;

      const newPosition = { ...object.position };
      newPosition[axis] = col * spacing;
      newPosition[secondaryAxis] = row * spacing;
      newPosition[tertiaryAxis] = 0;

      object.position = newPosition;
    });

    return objects;
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
  static mirrorObjects(objects, options = {}) {
    const {
      axis = 'x',
      center = { x: 0, y: 0, z: 0 },
      duplicate = false
    } = options;

    const mirroredObjects = [];

    objects.forEach(object => {
      const mirroredObject = duplicate ? { ...object } : object;
      const newPosition = { ...mirroredObject.position };

      // Mirror position
      newPosition[axis] = 2 * center[axis] - newPosition[axis];
      mirroredObject.position = newPosition;

      // Mirror scale
      const newScale = { ...mirroredObject.scale };
      newScale[axis] = -newScale[axis];
      mirroredObject.scale = newScale;

      if (duplicate) {
        mirroredObjects.push(mirroredObject);
      }
    });

    return duplicate ? mirroredObjects : objects;
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
  static rotateAroundPoint(objects, center, rotation, options = {}) {
    const { space = 'world' } = options;

    objects.forEach(object => {
      const matrix = MathUtils.createRotationMatrix(rotation.x, rotation.y, rotation.z);
      
      // Translate to origin
      const toOrigin = {
        x: object.position.x - center.x,
        y: object.position.y - center.y,
        z: object.position.z - center.z
      };

      // Apply rotation
      const rotated = MathUtils.transformPoint(toOrigin, matrix);

      // Translate back
      object.position = {
        x: rotated.x + center.x,
        y: rotated.y + center.y,
        z: rotated.z + center.z
      };

      // Update object rotation
      if (space === 'local') {
        object.rotation.x += rotation.x;
        object.rotation.y += rotation.y;
        object.rotation.z += rotation.z;
      }
    });

    return objects;
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
  static scaleFromPoint(objects, center, scale, options = {}) {
    const { uniform = false } = options;

    objects.forEach(object => {
      // Calculate distance from center
      const distance = {
        x: object.position.x - center.x,
        y: object.position.y - center.y,
        z: object.position.z - center.z
      };

      // Apply scaling
      const scaleFactor = uniform ? scale.x : 1;
      const newPosition = {
        x: center.x + distance.x * (uniform ? scaleFactor : scale.x),
        y: center.y + distance.y * (uniform ? scaleFactor : scale.y),
        z: center.z + distance.z * (uniform ? scaleFactor : scale.z)
      };

      object.position = newPosition;

      // Update object scale
      object.scale.x *= uniform ? scaleFactor : scale.x;
      object.scale.y *= uniform ? scaleFactor : scale.y;
      object.scale.z *= uniform ? scaleFactor : scale.z;
    });

    return objects;
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
  static snapToGrid(objects, options = {}) {
    const {
      gridSize = 1,
      axis = 'all',
      snapToCenter = true
    } = options;

    objects.forEach(object => {
      const newPosition = { ...object.position };

      if (axis === 'all' || axis === 'x') {
        newPosition.x = this.snapValue(newPosition.x, gridSize, snapToCenter);
      }

      if (axis === 'all' || axis === 'y') {
        newPosition.y = this.snapValue(newPosition.y, gridSize, snapToCenter);
      }

      if (axis === 'all' || axis === 'z') {
        newPosition.z = this.snapValue(newPosition.z, gridSize, snapToCenter);
      }

      object.position = newPosition;
    });

    return objects;
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
  static snapToObjects(objects, targets, options = {}) {
    const {
      threshold = 0.5,
      mode = 'center'
    } = options;

    objects.forEach(object => {
      let closestTarget = null;
      let closestDistance = Infinity;

      targets.forEach(target => {
        const distance = MathUtils.distance(object.position, target.position);
        if (distance < closestDistance && distance < threshold) {
          closestDistance = distance;
          closestTarget = target;
        }
      });

      if (closestTarget) {
        object.position = { ...closestTarget.position };
      }
    });

    return objects;
  }

  /**
   * Create transform from two points
   * @param {Object} point1 - First point
   * @param {Object} point2 - Second point
   * @returns {Object} Transform data
   */
  static createTransformFromPoints(point1, point2) {
    const position = {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2,
      z: (point1.z + point2.z) / 2
    };

    const direction = MathUtils.subtractVectors(point2, point1);
    const length = MathUtils.vectorLength(direction);
    const scale = { x: length, y: 1, z: 1 };

    const rotation = MathUtils.directionToRotation(direction);

    return {
      position,
      rotation,
      scale
    };
  }

  /**
   * Create transform from bounding box
   * @param {Object} bounds - Bounding box
   * @returns {Object} Transform data
   */
  static createTransformFromBounds(bounds) {
    const position = {
      x: (bounds.min.x + bounds.max.x) / 2,
      y: (bounds.min.y + bounds.max.y) / 2,
      z: (bounds.min.z + bounds.max.z) / 2
    };

    const scale = {
      x: bounds.max.x - bounds.min.x,
      y: bounds.max.y - bounds.min.y,
      z: bounds.max.z - bounds.min.z
    };

    return {
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale
    };
  }

  /**
   * Get alignment position
   * @param {number} min1 - First object min
   * @param {number} max1 - First object max
   * @param {number} min2 - Second object min
   * @param {number} max2 - Second object max
   * @param {string} mode - Alignment mode
   * @returns {number} Alignment position
   */
  static getAlignmentPosition(min1, max1, min2, max2, mode) {
    switch (mode) {
      case 'min':
        return min2 - min1;
      case 'max':
        return max2 - max1;
      case 'center':
        const center1 = (min1 + max1) / 2;
        const center2 = (min2 + max2) / 2;
        return center2 - center1;
      case 'pivot':
        return 0; // Keep original position
      default:
        return 0;
    }
  }

  /**
   * Snap value to grid
   * @param {number} value - Value to snap
   * @param {number} gridSize - Grid size
   * @param {boolean} snapToCenter - Snap to grid center
   * @returns {number} Snapped value
   */
  static snapValue(value, gridSize, snapToCenter = true) {
    if (snapToCenter) {
      return Math.round(value / gridSize) * gridSize;
    } else {
      return Math.floor(value / gridSize) * gridSize;
    }
  }

  /**
   * Calculate bounds for objects
   * @param {Array|Object} objects - Objects or single object
   * @returns {Object} Bounds object
   */
  static calculateBounds(objects) {
    const objectArray = Array.isArray(objects) ? objects : [objects];
    
    if (objectArray.length === 0) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }

    const bounds = {
      min: { x: Infinity, y: Infinity, z: Infinity },
      max: { x: -Infinity, y: -Infinity, z: -Infinity }
    };

    objectArray.forEach(object => {
      if (object.position) {
        bounds.min.x = Math.min(bounds.min.x, object.position.x);
        bounds.min.y = Math.min(bounds.min.y, object.position.y);
        bounds.min.z = Math.min(bounds.min.z, object.position.z);
        bounds.max.x = Math.max(bounds.max.x, object.position.x);
        bounds.max.y = Math.max(bounds.max.y, object.position.y);
        bounds.max.z = Math.max(bounds.max.z, object.position.z);
      }

      if (object.bounds) {
        bounds.min.x = Math.min(bounds.min.x, object.bounds.min.x);
        bounds.min.y = Math.min(bounds.min.y, object.bounds.min.y);
        bounds.min.z = Math.min(bounds.min.z, object.bounds.min.z);
        bounds.max.x = Math.max(bounds.max.x, object.bounds.max.x);
        bounds.max.y = Math.max(bounds.max.y, object.bounds.max.y);
        bounds.max.z = Math.max(bounds.max.z, object.bounds.max.z);
      }
    });

    return bounds;
  }

  /**
   * Validate transform operation
   * @param {Object} operation - Transform operation
   * @returns {Object} Validation result
   */
  static validateOperation(operation) {
    const errors = [];

    if (!operation.type) {
      errors.push('Operation type is required');
    }

    if (!operation.objects || !Array.isArray(operation.objects)) {
      errors.push('Objects array is required');
    }

    if (operation.objects && operation.objects.length === 0) {
      errors.push('At least one object is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 