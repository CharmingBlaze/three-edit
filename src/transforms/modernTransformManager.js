/**
 * @fileoverview Modern Transform Manager
 * Manages transformations for objects, vertices, edges, and faces
 */

import { Transform } from './core/Transform.js';

/**
 * Modern transform manager for handling multiple transformations
 */
export class ModernTransformManager {
  /**
   * @param {Object} options - Manager options
   * @param {boolean} [options.enableHistory=true] - Enable transform history
   * @param {number} [options.maxHistorySize=50] - Maximum history entries
   * @param {boolean} [options.enableEvents=true] - Enable event notifications
   */
  constructor(options = {}) {
    const {
      enableHistory = true,
      maxHistorySize = 50,
      enableEvents = true
    } = options;

    this.transforms = new Map();
    this.enableHistory = enableHistory;
    this.maxHistorySize = maxHistorySize;
    this.enableEvents = enableEvents;
    this.history = [];
    this.eventListeners = new Map();
    this.nextId = 1;
  }

  /**
   * Create a new transform
   * @param {string} [id] - Transform ID (auto-generated if not provided)
   * @param {Object} options - Transform options
   * @returns {string} Transform ID
   */
  createTransform(id = null, options = {}) {
    const transformId = id || `transform_${this.nextId++}`;
    
    if (this.transforms.has(transformId)) {
      throw new Error(`Transform with ID '${transformId}' already exists`);
    }

    const transform = new Transform(options);
    this.transforms.set(transformId, transform);

    if (this.enableEvents) {
      this.notifyListeners('transformCreated', { id: transformId, transform });
    }

    return transformId;
  }

  /**
   * Get a transform by ID
   * @param {string} id - Transform ID
   * @returns {Transform|undefined} Transform or undefined if not found
   */
  getTransform(id) {
    return this.transforms.get(id);
  }

  /**
   * Update a transform
   * @param {string} id - Transform ID
   * @param {Object} updates - Update data
   * @param {Object} [updates.position] - New position
   * @param {Object} [updates.rotation] - New rotation (radians)
   * @param {Object} [updates.rotationDegrees] - New rotation (degrees)
   * @param {Object} [updates.scale] - New scale
   * @param {Object} [updates.pivot] - New pivot
   * @param {string} [updates.space] - New space
   * @returns {boolean} True if transform was updated successfully
   */
  updateTransform(id, updates) {
    const transform = this.getTransform(id);
    if (!transform) {
      return false;
    }

    // Store previous state for history
    const previousState = transform.clone();

    // Apply updates
    if (updates.position) {
      transform.setPosition(updates.position.x, updates.position.y, updates.position.z);
    }

    if (updates.rotation) {
      transform.setRotation(updates.rotation.x, updates.rotation.y, updates.rotation.z);
    }

    if (updates.rotationDegrees) {
      transform.setRotationDegrees(updates.rotationDegrees.x, updates.rotationDegrees.y, updates.rotationDegrees.z);
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

    // Add to history
    if (this.enableHistory) {
      this.addToHistory('update', {
        id,
        previousState,
        currentState: transform.clone(),
        updates
      });
    }

    if (this.enableEvents) {
      this.notifyListeners('transformUpdated', { id, transform, updates });
    }

    return true;
  }

  /**
   * Remove a transform
   * @param {string} id - Transform ID
   * @returns {boolean} True if transform was removed successfully
   */
  removeTransform(id) {
    const transform = this.getTransform(id);
    if (!transform) {
      return false;
    }

    this.transforms.delete(id);

    if (this.enableHistory) {
      this.addToHistory('remove', { id, transform });
    }

    if (this.enableEvents) {
      this.notifyListeners('transformRemoved', { id, transform });
    }

    return true;
  }

  /**
   * Apply a transform to objects
   * @param {string} transformId - Transform ID
   * @param {Array} objects - Objects to transform
   * @param {Object} options - Transform options
   * @param {string} [options.mode='replace'] - Transform mode ('replace', 'add', 'multiply')
   * @param {boolean} [options.preservePivot=true] - Preserve object pivot
   * @returns {boolean} True if transform was applied successfully
   */
  applyTransform(transformId, objects, options = {}) {
    const transform = this.getTransform(transformId);
    if (!transform) {
      return false;
    }

    const {
      mode = 'replace',
      preservePivot = true
    } = options;

    let successCount = 0;
    for (const object of objects) {
      if (this.applyTransformToObject(transform, object, { mode, preservePivot })) {
        successCount++;
      }
    }

    if (this.enableEvents) {
      this.notifyListeners('transformApplied', {
        transformId,
        objects,
        successCount,
        totalCount: objects.length
      });
    }

    return successCount > 0;
  }

  /**
   * Apply transform to a single object
   * @param {Transform} transform - Transform to apply
   * @param {Object} object - Object to transform
   * @param {Object} options - Transform options
   * @param {string} [options.mode='replace'] - Transform mode
   * @param {boolean} [options.preservePivot=true] - Preserve object pivot
   * @returns {boolean} True if transform was applied successfully
   */
  applyTransformToObject(transform, object, options = {}) {
    const {
      mode = 'replace',
      preservePivot = true
    } = options;

    try {
      // Handle different object types
      if (object.vertices) {
        // EditableMesh object
        this.applyTransformToMesh(transform, object, { mode, preservePivot });
      } else if (object.position || object.x !== undefined) {
        // Simple object with position
        this.applyTransformToSimpleObject(transform, object, { mode, preservePivot });
      } else {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error applying transform to object:', error);
      return false;
    }
  }

  /**
   * Apply transform to a mesh
   * @param {Transform} transform - Transform to apply
   * @param {EditableMesh} mesh - Mesh to transform
   * @param {Object} options - Transform options
   * @private
   */
  applyTransformToMesh(transform, mesh, options) {
    const { mode, preservePivot } = options;

    for (const vertex of mesh.vertices.values()) {
      const originalPosition = { x: vertex.x, y: vertex.y, z: vertex.z };
      let newPosition;

      if (mode === 'replace') {
        newPosition = transform.transformPoint(originalPosition);
      } else if (mode === 'add') {
        const transformed = transform.transformPoint(originalPosition);
        newPosition = {
          x: originalPosition.x + transformed.x,
          y: originalPosition.y + transformed.y,
          z: originalPosition.z + transformed.z
        };
      } else if (mode === 'multiply') {
        // For multiply mode, we'd need to combine transforms
        // This is a simplified implementation
        newPosition = transform.transformPoint(originalPosition);
      }

      vertex.x = newPosition.x;
      vertex.y = newPosition.y;
      vertex.z = newPosition.z;
    }
  }

  /**
   * Apply transform to a simple object
   * @param {Transform} transform - Transform to apply
   * @param {Object} object - Object to transform
   * @param {Object} options - Transform options
   * @private
   */
  applyTransformToSimpleObject(transform, object, options) {
    const { mode } = options;

    const originalPosition = {
      x: object.position?.x ?? object.x ?? 0,
      y: object.position?.y ?? object.y ?? 0,
      z: object.position?.z ?? object.z ?? 0
    };

    let newPosition;

    if (mode === 'replace') {
      newPosition = transform.transformPoint(originalPosition);
    } else if (mode === 'add') {
      const transformed = transform.transformPoint(originalPosition);
      newPosition = {
        x: originalPosition.x + transformed.x,
        y: originalPosition.y + transformed.y,
        z: originalPosition.z + transformed.z
      };
    }

    if (object.position) {
      object.position.x = newPosition.x;
      object.position.y = newPosition.y;
      object.position.z = newPosition.z;
    } else {
      object.x = newPosition.x;
      object.y = newPosition.y;
      object.z = newPosition.z;
    }
  }

  /**
   * Create a transform from a matrix
   * @param {Array<number>} matrix - 4x4 transformation matrix
   * @param {string} [id] - Transform ID
   * @returns {string} Transform ID
   */
  createTransformFromMatrix(matrix, id = null) {
    // This is a simplified implementation
    // In a real application, you would decompose the matrix into position, rotation, and scale
    
    const transformId = this.createTransform(id, {
      position: { x: matrix[3], y: matrix[7], z: matrix[11] },
      rotation: { x: 0, y: 0, z: 0 }, // Would need proper decomposition
      scale: { x: 1, y: 1, z: 1 }, // Would need proper decomposition
      pivot: { x: 0, y: 0, z: 0 }
    });

    return transformId;
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

    // Interpolate rotation (simplified - should use quaternions for proper interpolation)
    interpolated.setRotation(
      transform1.rotation.x + (transform2.rotation.x - transform1.rotation.x) * t,
      transform1.rotation.y + (transform2.rotation.y - transform1.rotation.y) * t,
      transform1.rotation.z + (transform2.rotation.z - transform1.rotation.z) * t
    );

    // Interpolate scale
    interpolated.setScale(
      transform1.scale.x + (transform2.scale.x - transform1.scale.x) * t,
      transform1.scale.y + (transform2.scale.y - transform1.scale.y) * t,
      transform1.scale.z + (transform2.scale.z - transform1.scale.z) * t
    );

    // Interpolate pivot
    interpolated.setPivot(
      transform1.pivot.x + (transform2.pivot.x - transform1.pivot.x) * t,
      transform1.pivot.y + (transform2.pivot.y - transform1.pivot.y) * t,
      transform1.pivot.z + (transform2.pivot.z - transform1.pivot.z) * t
    );

    return interpolated;
  }

  /**
   * Get all transforms
   * @returns {Map<string, Transform>} Map of transform ID to Transform objects
   */
  getAllTransforms() {
    return new Map(this.transforms);
  }

  /**
   * Get all transform IDs
   * @returns {Array<string>} Array of transform IDs
   */
  getTransformIds() {
    return Array.from(this.transforms.keys());
  }

  /**
   * Clear all transforms
   */
  clearTransforms() {
    const transformIds = this.getTransformIds();
    
    for (const id of transformIds) {
      this.removeTransform(id);
    }

    if (this.enableEvents) {
      this.notifyListeners('transformsCleared', { count: transformIds.length });
    }
  }

  /**
   * Get transform statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const transforms = Array.from(this.transforms.values());
    
    let totalPosition = { x: 0, y: 0, z: 0 };
    let totalRotation = { x: 0, y: 0, z: 0 };
    let totalScale = { x: 0, y: 0, z: 0 };
    let worldSpaceCount = 0;
    let localSpaceCount = 0;
    let dirtyCount = 0;

    for (const transform of transforms) {
      const position = transform.getPosition();
      const rotation = transform.getRotation();
      const scale = transform.getScale();

      totalPosition.x += position.x;
      totalPosition.y += position.y;
      totalPosition.z += position.z;

      totalRotation.x += rotation.x;
      totalRotation.y += rotation.y;
      totalRotation.z += rotation.z;

      totalScale.x += scale.x;
      totalScale.y += scale.y;
      totalScale.z += scale.z;

      if (transform.space === 'world') {
        worldSpaceCount++;
      } else {
        localSpaceCount++;
      }

      if (transform.dirty) {
        dirtyCount++;
      }
    }

    const count = transforms.length;
    const averagePosition = count > 0 ? {
      x: totalPosition.x / count,
      y: totalPosition.y / count,
      z: totalPosition.z / count
    } : { x: 0, y: 0, z: 0 };

    const averageRotation = count > 0 ? {
      x: totalRotation.x / count,
      y: totalRotation.y / count,
      z: totalRotation.z / count
    } : { x: 0, y: 0, z: 0 };

    const averageScale = count > 0 ? {
      x: totalScale.x / count,
      y: totalScale.y / count,
      z: totalScale.z / count
    } : { x: 0, y: 0, z: 0 };

    return {
      totalTransforms: count,
      worldSpaceCount,
      localSpaceCount,
      dirtyCount,
      averagePosition,
      averageRotation,
      averageScale,
      historySize: this.history.length
    };
  }

  /**
   * Add entry to history
   * @param {string} action - Action type
   * @param {Object} data - Action data
   * @private
   */
  addToHistory(action, data) {
    if (!this.enableHistory) {
      return;
    }

    const entry = {
      timestamp: Date.now(),
      action,
      data
    };

    this.history.push(entry);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get transform history
   * @returns {Array} History entries
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
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
   * @param {Function} callback - Event callback
   */
  removeEventListener(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify event listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @private
   */
  notifyListeners(event, data) {
    if (!this.enableEvents) {
      return;
    }

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      }
    }
  }
} 