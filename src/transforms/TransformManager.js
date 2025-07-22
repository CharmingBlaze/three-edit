/**
 * @fileoverview Transform Manager
 * Manages transformations for objects, vertices, edges, and faces
 */

import { MathUtils } from '../utils/MathUtils.js';

/**
 * Transform data structure
 */
export class Transform {
  /**
   * Create a transform
   * @param {Object} options - Transform options
   * @param {Object} options.position - Position {x, y, z}
   * @param {Object} options.rotation - Rotation {x, y, z} in radians
   * @param {Object} options.scale - Scale {x, y, z}
   * @param {Object} options.pivot - Pivot point {x, y, z}
   * @param {string} options.space - Transform space ('world', 'local')
   */
  constructor(options = {}) {
    const {
      position = { x: 0, y: 0, z: 0 },
      rotation = { x: 0, y: 0, z: 0 },
      scale = { x: 1, y: 1, z: 1 },
      pivot = { x: 0, y: 0, z: 0 },
      space = 'world'
    } = options;

    this.position = { ...position };
    this.rotation = { ...rotation };
    this.scale = { ...scale };
    this.pivot = { ...pivot };
    this.space = space;
    this.matrix = null;
    this.inverseMatrix = null;
    this.dirty = true;
  }

  /**
   * Clone the transform
   * @returns {Transform} Cloned transform
   */
  clone() {
    return new Transform({
      position: { ...this.position },
      rotation: { ...this.rotation },
      scale: { ...this.scale },
      pivot: { ...this.pivot },
      space: this.space
    });
  }

  /**
   * Set position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   */
  setPosition(x, y, z) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    this.dirty = true;
  }

  /**
   * Set rotation in radians
   * @param {number} x - X rotation in radians
   * @param {number} y - Y rotation in radians
   * @param {number} z - Z rotation in radians
   */
  setRotation(x, y, z) {
    this.rotation.x = x;
    this.rotation.y = y;
    this.rotation.z = z;
    this.dirty = true;
  }

  /**
   * Set rotation in degrees
   * @param {number} x - X rotation in degrees
   * @param {number} y - Y rotation in degrees
   * @param {number} z - Z rotation in degrees
   */
  setRotationDegrees(x, y, z) {
    this.setRotation(
      MathUtils.degreesToRadians(x),
      MathUtils.degreesToRadians(y),
      MathUtils.degreesToRadians(z)
    );
  }

  /**
   * Set scale
   * @param {number} x - X scale
   * @param {number} y - Y scale
   * @param {number} z - Z scale
   */
  setScale(x, y, z) {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
    this.dirty = true;
  }

  /**
   * Set uniform scale
   * @param {number} scale - Uniform scale value
   */
  setUniformScale(scale) {
    this.setScale(scale, scale, scale);
  }

  /**
   * Set pivot point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   */
  setPivot(x, y, z) {
    this.pivot.x = x;
    this.pivot.y = y;
    this.pivot.z = z;
    this.dirty = true;
  }

  /**
   * Get position
   * @returns {Object} Position {x, y, z}
   */
  getPosition() {
    return { ...this.position };
  }

  /**
   * Get rotation in radians
   * @returns {Object} Rotation {x, y, z} in radians
   */
  getRotation() {
    return { ...this.rotation };
  }

  /**
   * Get rotation in degrees
   * @returns {Object} Rotation {x, y, z} in degrees
   */
  getRotationDegrees() {
    return {
      x: MathUtils.radiansToDegrees(this.rotation.x),
      y: MathUtils.radiansToDegrees(this.rotation.y),
      z: MathUtils.radiansToDegrees(this.rotation.z)
    };
  }

  /**
   * Get scale
   * @returns {Object} Scale {x, y, z}
   */
  getScale() {
    return { ...this.scale };
  }

  /**
   * Get pivot point
   * @returns {Object} Pivot {x, y, z}
   */
  getPivot() {
    return { ...this.pivot };
  }

  /**
   * Get transformation matrix
   * @returns {Array} 4x4 transformation matrix
   */
  getMatrix() {
    if (this.dirty || !this.matrix) {
      this.updateMatrix();
    }
    return this.matrix;
  }

  /**
   * Get inverse transformation matrix
   * @returns {Array} 4x4 inverse transformation matrix
   */
  getInverseMatrix() {
    if (this.dirty || !this.inverseMatrix) {
      this.updateMatrix();
    }
    return this.inverseMatrix;
  }

  /**
   * Update transformation matrix
   */
  updateMatrix() {
    const translationMatrix = MathUtils.createTranslationMatrix(
      this.position.x,
      this.position.y,
      this.position.z
    );

    const rotationMatrix = MathUtils.createRotationMatrix(
      this.rotation.x,
      this.rotation.y,
      this.rotation.z
    );

    const scaleMatrix = MathUtils.createScaleMatrix(
      this.scale.x,
      this.scale.y,
      this.scale.z
    );

    const pivotMatrix = MathUtils.createTranslationMatrix(
      this.pivot.x,
      this.pivot.y,
      this.pivot.z
    );

    const inversePivotMatrix = MathUtils.createTranslationMatrix(
      -this.pivot.x,
      -this.pivot.y,
      -this.pivot.z
    );

    // Combine matrices: pivot * scale * rotation * translation * inverse_pivot
    this.matrix = MathUtils.multiplyMatrices(
      pivotMatrix,
      MathUtils.multiplyMatrices(
        scaleMatrix,
        MathUtils.multiplyMatrices(
          rotationMatrix,
          MathUtils.multiplyMatrices(translationMatrix, inversePivotMatrix)
        )
      )
    );

    this.inverseMatrix = MathUtils.invertMatrix(this.matrix);
    this.dirty = false;
  }

  /**
   * Apply transform to a point
   * @param {Object} point - Point {x, y, z}
   * @returns {Object} Transformed point {x, y, z}
   */
  transformPoint(point) {
    const matrix = this.getMatrix();
    return MathUtils.transformPoint(point, matrix);
  }

  /**
   * Apply inverse transform to a point
   * @param {Object} point - Point {x, y, z}
   * @returns {Object} Inverse transformed point {x, y, z}
   */
  inverseTransformPoint(point) {
    const inverseMatrix = this.getInverseMatrix();
    return MathUtils.transformPoint(point, inverseMatrix);
  }

  /**
   * Apply transform to a vector
   * @param {Object} vector - Vector {x, y, z}
   * @returns {Object} Transformed vector {x, y, z}
   */
  transformVector(vector) {
    const matrix = this.getMatrix();
    return MathUtils.transformVector(vector, matrix);
  }

  /**
   * Get transform summary
   * @returns {Object} Transform summary
   */
  getSummary() {
    return {
      position: { ...this.position },
      rotation: { ...this.rotation },
      rotationDegrees: this.getRotationDegrees(),
      scale: { ...this.scale },
      pivot: { ...this.pivot },
      space: this.space,
      dirty: this.dirty
    };
  }

  /**
   * Validate transform
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    // Validate position
    if (!MathUtils.isValidNumber(this.position.x) ||
        !MathUtils.isValidNumber(this.position.y) ||
        !MathUtils.isValidNumber(this.position.z)) {
      errors.push('Invalid position values');
    }

    // Validate rotation
    if (!MathUtils.isValidNumber(this.rotation.x) ||
        !MathUtils.isValidNumber(this.rotation.y) ||
        !MathUtils.isValidNumber(this.rotation.z)) {
      errors.push('Invalid rotation values');
    }

    // Validate scale
    if (!MathUtils.isValidNumber(this.scale.x) ||
        !MathUtils.isValidNumber(this.scale.y) ||
        !MathUtils.isValidNumber(this.scale.z) ||
        this.scale.x <= 0 || this.scale.y <= 0 || this.scale.z <= 0) {
      errors.push('Invalid scale values (must be positive)');
    }

    // Validate pivot
    if (!MathUtils.isValidNumber(this.pivot.x) ||
        !MathUtils.isValidNumber(this.pivot.y) ||
        !MathUtils.isValidNumber(this.pivot.z)) {
      errors.push('Invalid pivot values');
    }

    // Validate space
    if (!['world', 'local'].includes(this.space)) {
      errors.push('Invalid transform space');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Transform Manager for managing multiple transforms
 */
export class TransformManager {
  /**
   * Create a transform manager
   * @param {Object} options - Configuration options
   * @param {boolean} options.autoUpdate - Auto-update transforms
   * @param {boolean} options.cacheMatrices - Cache transformation matrices
   * @param {number} options.maxTransforms - Maximum transforms to manage
   */
  constructor(options = {}) {
    const {
      autoUpdate = true,
      cacheMatrices = true,
      maxTransforms = 1000
    } = options;

    this.autoUpdate = autoUpdate;
    this.cacheMatrices = cacheMatrices;
    this.maxTransforms = maxTransforms;
    this.transforms = new Map();
    this.listeners = new Set();
    this.history = [];
    this.maxHistorySize = 50;
  }

  /**
   * Create a new transform
   * @param {string} id - Transform ID
   * @param {Object} options - Transform options
   * @returns {Transform} Created transform
   */
  createTransform(id, options = {}) {
    if (this.transforms.size >= this.maxTransforms) {
      console.warn('Maximum transforms reached');
      return null;
    }

    const transform = new Transform(options);
    this.transforms.set(id, transform);

    this.addToHistory('create', { id, transform: transform.clone() });
    this.notifyListeners('transformCreated', { id, transform });

    return transform;
  }

  /**
   * Get transform by ID
   * @param {string} id - Transform ID
   * @returns {Transform|null} Transform or null
   */
  getTransform(id) {
    return this.transforms.get(id) || null;
  }

  /**
   * Update transform
   * @param {string} id - Transform ID
   * @param {Object} updates - Transform updates
   * @returns {boolean} Success status
   */
  updateTransform(id, updates) {
    const transform = this.getTransform(id);
    if (!transform) {return false;}

    const oldTransform = transform.clone();

    if (updates.position) {
      transform.setPosition(
        updates.position.x,
        updates.position.y,
        updates.position.z
      );
    }

    if (updates.rotation) {
      if (updates.rotation.degrees) {
        transform.setRotationDegrees(
          updates.rotation.x,
          updates.rotation.y,
          updates.rotation.z
        );
      } else {
        transform.setRotation(
          updates.rotation.x,
          updates.rotation.y,
          updates.rotation.z
        );
      }
    }

    if (updates.scale) {
      transform.setScale(
        updates.scale.x,
        updates.scale.y,
        updates.scale.z
      );
    }

    if (updates.pivot) {
      transform.setPivot(
        updates.pivot.x,
        updates.pivot.y,
        updates.pivot.z
      );
    }

    if (updates.space) {
      transform.space = updates.space;
    }

    this.addToHistory('update', { id, oldTransform, newTransform: transform.clone() });
    this.notifyListeners('transformUpdated', { id, transform, updates });

    return true;
  }

  /**
   * Remove transform
   * @param {string} id - Transform ID
   * @returns {boolean} Success status
   */
  removeTransform(id) {
    const transform = this.getTransform(id);
    if (!transform) {return false;}

    this.transforms.delete(id);
    this.addToHistory('remove', { id, transform: transform.clone() });
    this.notifyListeners('transformRemoved', { id, transform });

    return true;
  }

  /**
   * Apply transform to multiple objects
   * @param {string} transformId - Transform ID
   * @param {Array} objects - Objects to transform
   * @param {Object} options - Transform options
   * @returns {Array} Transformed objects
   */
  applyTransform(transformId, objects, options = {}) {
    const transform = this.getTransform(transformId);
    if (!transform) {return [];}

    const { space = 'world', relative = false } = options;
    const transformedObjects = [];

    objects.forEach(object => {
      const transformedObject = this.applyTransformToObject(transform, object, {
        space,
        relative
      });
      transformedObjects.push(transformedObject);
    });

    this.notifyListeners('transformApplied', {
      transformId,
      objects: transformedObjects,
      options
    });

    return transformedObjects;
  }

  /**
   * Apply transform to single object
   * @param {Transform} transform - Transform to apply
   * @param {Object} object - Object to transform
   * @param {Object} options - Transform options
   * @returns {Object} Transformed object
   */
  applyTransformToObject(transform, object, options = {}) {
    const { space = 'world', relative = false } = options;
    const transformedObject = { ...object };

    if (object.vertices) {
      // Transform mesh vertices
      transformedObject.vertices = new Map();
      object.vertices.forEach((vertex, id) => {
        const transformedVertex = { ...vertex };
        
        if (space === 'world') {
          transformedVertex.x = vertex.x + transform.position.x;
          transformedVertex.y = vertex.y + transform.position.y;
          transformedVertex.z = vertex.z + transform.position.z;
        } else {
          // Local space transformation
          const transformedPoint = transform.transformPoint(vertex);
          transformedVertex.x = transformedPoint.x;
          transformedVertex.y = transformedPoint.y;
          transformedVertex.z = transformedPoint.z;
        }

        transformedObject.vertices.set(id, transformedVertex);
      });
    } else if (object.position) {
      // Transform object position
      if (relative) {
        transformedObject.position.x += transform.position.x;
        transformedObject.position.y += transform.position.y;
        transformedObject.position.z += transform.position.z;
      } else {
        transformedObject.position.x = transform.position.x;
        transformedObject.position.y = transform.position.y;
        transformedObject.position.z = transform.position.z;
      }
    }

    return transformedObject;
  }

  /**
   * Create transform from matrix
   * @param {Array} matrix - 4x4 transformation matrix
   * @returns {Transform} Created transform
   */
  createTransformFromMatrix(matrix) {
    const position = MathUtils.extractPosition(matrix);
    const rotation = MathUtils.extractRotation(matrix);
    const scale = MathUtils.extractScale(matrix);

    return new Transform({
      position,
      rotation,
      scale
    });
  }

  /**
   * Interpolate between two transforms
   * @param {Transform} transform1 - First transform
   * @param {Transform} transform2 - Second transform
   * @param {number} t - Interpolation factor (0-1)
   * @returns {Transform} Interpolated transform
   */
  interpolateTransforms(transform1, transform2, t) {
    const position = MathUtils.lerpVector(transform1.position, transform2.position, t);
    const rotation = MathUtils.lerpVector(transform1.rotation, transform2.rotation, t);
    const scale = MathUtils.lerpVector(transform1.scale, transform2.scale, t);
    const pivot = MathUtils.lerpVector(transform1.pivot, transform2.pivot, t);

    return new Transform({
      position,
      rotation,
      scale,
      pivot,
      space: transform1.space
    });
  }

  /**
   * Get all transforms
   * @returns {Array} All transforms
   */
  getAllTransforms() {
    return Array.from(this.transforms.values());
  }

  /**
   * Get transform IDs
   * @returns {Array} Transform IDs
   */
  getTransformIds() {
    return Array.from(this.transforms.keys());
  }

  /**
   * Clear all transforms
   */
  clearTransforms() {
    const transforms = this.getAllTransforms();
    this.transforms.clear();

    transforms.forEach(transform => {
      this.notifyListeners('transformRemoved', { transform });
    });

    this.notifyListeners('transformsCleared', { count: transforms.length });
  }

  /**
   * Get transform statistics
   * @returns {Object} Transform statistics
   */
  getStatistics() {
    const transforms = this.getAllTransforms();
    const stats = {
      totalTransforms: transforms.length,
      autoUpdate: this.autoUpdate,
      cacheMatrices: this.cacheMatrices
    };

    // Calculate average position, rotation, scale
    if (transforms.length > 0) {
      const avgPosition = { x: 0, y: 0, z: 0 };
      const avgRotation = { x: 0, y: 0, z: 0 };
      const avgScale = { x: 0, y: 0, z: 0 };

      transforms.forEach(transform => {
        avgPosition.x += transform.position.x;
        avgPosition.y += transform.position.y;
        avgPosition.z += transform.position.z;
        avgRotation.x += transform.rotation.x;
        avgRotation.y += transform.rotation.y;
        avgRotation.z += transform.rotation.z;
        avgScale.x += transform.scale.x;
        avgScale.y += transform.scale.y;
        avgScale.z += transform.scale.z;
      });

      const count = transforms.length;
      avgPosition.x /= count;
      avgPosition.y /= count;
      avgPosition.z /= count;
      avgRotation.x /= count;
      avgRotation.y /= count;
      avgRotation.z /= count;
      avgScale.x /= count;
      avgScale.y /= count;
      avgScale.z /= count;

      stats.averagePosition = avgPosition;
      stats.averageRotation = avgRotation;
      stats.averageScale = avgScale;
    }

    return stats;
  }

  /**
   * Add to history
   * @param {string} action - History action
   * @param {Object} data - History data
   */
  addToHistory(action, data) {
    this.history.push({
      action,
      data,
      timestamp: Date.now()
    });

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get transform history
   * @returns {Array} Transform history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    this.listeners.add({ event, callback });
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    for (const listener of this.listeners) {
      if (listener.event === event && listener.callback === callback) {
        this.listeners.delete(listener);
        break;
      }
    }
  }

  /**
   * Notify all listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    for (const listener of this.listeners) {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('Transform listener error:', error);
        }
      }
    }
  }
} 