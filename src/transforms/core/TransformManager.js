/**
 * @fileoverview Transform Manager for 3D Editor
 * Manages multiple transforms and their application to objects
 */

import { Transform } from './Transform.js';

/**
 * Transform Manager for handling multiple transforms
 */
export class TransformManager {
  /**
   * Create a transform manager
   * @param {Object} options - Manager options
   * @param {boolean} options.enableHistory - Whether to enable transform history
   * @param {number} options.maxHistorySize - Maximum history size
   */
  constructor(options = {}) {
    const {
      enableHistory = true,
      maxHistorySize = 100
    } = options;

    this.transforms = new Map();
    this.history = [];
    this.maxHistorySize = maxHistorySize;
    this.enableHistory = enableHistory;
    this.eventListeners = new Map();
    this.nextTransformId = 1;
  }

  /**
   * Create a new transform
   * @param {string} id - Transform ID
   * @param {Object} options - Transform options
   * @returns {Transform} Created transform
   */
  createTransform(id, options = {}) {
    if (this.transforms.has(id)) {
      console.error(`Transform with ID ${id} already exists`);
      return null;
    }

    const transform = new Transform(options);
    this.transforms.set(id, transform);
    this.notifyListeners('transformCreated', { id, transform });
    return transform;
  }

  /**
   * Get transform by ID
   * @param {string} id - Transform ID
   * @returns {Transform|null} Transform or null if not found
   */
  getTransform(id) {
    return this.transforms.get(id) || null;
  }

  /**
   * Update transform
   * @param {string} id - Transform ID
   * @param {Object} updates - Update object
   * @returns {boolean} Success status
   */
  updateTransform(id, updates) {
    const transform = this.getTransform(id);
    if (!transform) {
      console.error(`Transform with ID ${id} not found`);
      return false;
    }

    const oldTransform = transform.clone();

    // Apply updates
    if (updates.position) {
      transform.setPosition(updates.position.x, updates.position.y, updates.position.z);
    }

    if (updates.rotation) {
      if (updates.rotation.degrees) {
        transform.setRotationDegrees(updates.rotation.x, updates.rotation.y, updates.rotation.z);
      } else {
        transform.setRotation(updates.rotation.x, updates.rotation.y, updates.rotation.z);
      }
    }

    if (updates.scale) {
      if (typeof updates.scale === 'number') {
        transform.setUniformScale(updates.scale);
      } else {
        transform.setScale(updates.scale.x, updates.scale.y, updates.scale.z);
      }
    }

    if (updates.pivot) {
      transform.setPivot(updates.pivot.x, updates.pivot.y, updates.pivot.z);
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
    if (!transform) {
      return false;
    }

    this.transforms.delete(id);
    this.addToHistory('remove', { id, transform });
    this.notifyListeners('transformRemoved', { id, transform });
    return true;
  }

  /**
   * Apply transform to objects
   * @param {string} transformId - Transform ID
   * @param {Array} objects - Objects to transform
   * @param {Object} options - Application options
   * @returns {boolean} Success status
   */
  applyTransform(transformId, objects, options = {}) {
    const transform = this.getTransform(transformId);
    if (!transform) {
      console.error(`Transform with ID ${transformId} not found`);
      return false;
    }

    const results = [];
    for (const object of objects) {
      const result = this.applyTransformToObject(transform, object, options);
      results.push(result);
    }

    this.notifyListeners('transformApplied', { transformId, objects, results });
    return true;
  }

  /**
   * Apply transform to a single object
   * @param {Transform} transform - Transform to apply
   * @param {Object} object - Object to transform
   * @param {Object} options - Application options
   * @returns {Object} Application result
   */
  applyTransformToObject(transform, object, options = {}) {
    const {
      transformType = 'all', // 'all', 'position', 'rotation', 'scale'
      space = 'world'
    } = options;

    try {
      if (object.vertices) {
        // Handle EditableMesh
        return this.applyTransformToMesh(transform, object, transformType, space);
      } else if (object.position || object.rotation || object.scale) {
        // Handle Three.js objects
        return this.applyTransformToThreeJSObject(transform, object, transformType, space);
      } else {
        return { success: false, error: 'Unsupported object type' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply transform to EditableMesh
   * @param {Transform} transform - Transform to apply
   * @param {EditableMesh} mesh - Mesh to transform
   * @param {string} transformType - Type of transform to apply
   * @param {string} space - Transform space
   * @returns {Object} Application result
   */
  applyTransformToMesh(transform, mesh, transformType, space) {
    const transformedVertices = [];

    for (const [id, vertex] of mesh.vertices) {
      const transformedVertex = { ...vertex };

      if (transformType === 'all' || transformType === 'position') {
        const transformedPoint = transform.transformPoint(vertex);
        transformedVertex.x = transformedPoint.x;
        transformedVertex.y = transformedPoint.y;
        transformedVertex.z = transformedPoint.z;
      }

      if (transformType === 'all' || transformType === 'rotation') {
        // Apply rotation to vertex normal if it exists
        if (vertex.normal) {
          const transformedNormal = transform.transformVector(vertex.normal);
          transformedVertex.normal = transformedNormal;
        }
      }

      transformedVertices.push({ id, vertex: transformedVertex });
    }

    // Apply transformations
    for (const { id, vertex } of transformedVertices) {
      mesh.vertices.set(id, vertex);
    }

    return {
      success: true,
      transformedVertices: transformedVertices.length
    };
  }

  /**
   * Apply transform to Three.js object
   * @param {Transform} transform - Transform to apply
   * @param {Object} object - Three.js object
   * @param {string} transformType - Type of transform to apply
   * @param {string} space - Transform space
   * @returns {Object} Application result
   */
  applyTransformToThreeJSObject(transform, object, transformType, space) {
    if (transformType === 'all' || transformType === 'position') {
      const transformedPosition = transform.transformPoint(object.position);
      object.position.set(transformedPosition.x, transformedPosition.y, transformedPosition.z);
    }

    if (transformType === 'all' || transformType === 'rotation') {
      const rotation = transform.getRotation();
      object.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    if (transformType === 'all' || transformType === 'scale') {
      const scale = transform.getScale();
      object.scale.set(scale.x, scale.y, scale.z);
    }

    return {
      success: true,
      objectType: 'ThreeJS'
    };
  }

  /**
   * Create transform from matrix
   * @param {Array<Array<number>>} matrix - 4x4 transformation matrix
   * @returns {Transform} Created transform
   */
  createTransformFromMatrix(matrix) {
    // This is a simplified implementation
    // In a real application, you would decompose the matrix properly
    const transform = new Transform({
      position: { x: matrix[0][3], y: matrix[1][3], z: matrix[2][3] },
      scale: { x: 1, y: 1, z: 1 }, // Would need proper decomposition
      rotation: { x: 0, y: 0, z: 0 } // Would need proper decomposition
    });

    return transform;
  }

  /**
   * Interpolate between two transforms
   * @param {Transform} transform1 - First transform
   * @param {Transform} transform2 - Second transform
   * @param {number} t - Interpolation factor (0-1)
   * @returns {Transform} Interpolated transform
   */
  interpolateTransforms(transform1, transform2, t) {
    const interpolated = new Transform();

    // Interpolate position
    interpolated.setPosition(
      transform1.position.x + (transform2.position.x - transform1.position.x) * t,
      transform1.position.y + (transform2.position.y - transform1.position.y) * t,
      transform1.position.z + (transform2.position.z - transform1.position.z) * t
    );

    // Interpolate scale
    interpolated.setScale(
      transform1.scale.x + (transform2.scale.x - transform1.scale.x) * t,
      transform1.scale.y + (transform2.scale.y - transform1.scale.y) * t,
      transform1.scale.z + (transform2.scale.z - transform1.scale.z) * t
    );

    // Interpolate rotation (simplified - would need quaternion interpolation for proper results)
    interpolated.setRotation(
      transform1.rotation.x + (transform2.rotation.x - transform1.rotation.x) * t,
      transform1.rotation.y + (transform2.rotation.y - transform1.rotation.y) * t,
      transform1.rotation.z + (transform2.rotation.z - transform1.rotation.z) * t
    );

    return interpolated;
  }

  /**
   * Get all transforms
   * @returns {Array<Transform>} Array of all transforms
   */
  getAllTransforms() {
    return Array.from(this.transforms.values());
  }

  /**
   * Get transform IDs
   * @returns {Array<string>} Array of transform IDs
   */
  getTransformIds() {
    return Array.from(this.transforms.keys());
  }

  /**
   * Clear all transforms
   */
  clearTransforms() {
    const transformCount = this.transforms.size;
    this.transforms.clear();
    this.addToHistory('clear', { transformCount });
    this.notifyListeners('transformsCleared', { transformCount });
  }

  /**
   * Get manager statistics
   * @returns {Object} Manager statistics
   */
  getStatistics() {
    let totalTransforms = 0;
    let validTransforms = 0;
    let invalidTransforms = 0;

    this.transforms.forEach(transform => {
      totalTransforms++;
      const validation = transform.validate();
      if (validation.isValid) {
        validTransforms++;
      } else {
        invalidTransforms++;
      }
    });

    return {
      totalTransforms,
      validTransforms,
      invalidTransforms,
      historySize: this.history.length,
      enableHistory: this.enableHistory
    };
  }

  /**
   * Add action to history
   * @param {string} action - Action type
   * @param {Object} data - Action data
   */
  addToHistory(action, data) {
    if (!this.enableHistory) return;

    this.history.push({
      timestamp: Date.now(),
      action,
      data
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
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify event listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
} 