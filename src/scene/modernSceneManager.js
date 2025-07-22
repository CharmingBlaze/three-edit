/**
 * @fileoverview Modern Scene Manager
 * Manages scenes, scene hierarchy, and scene operations
 */

import { Scene } from './core/Scene.js';

/**
 * Modern scene manager for handling multiple scenes
 */
export class ModernSceneManager {
  /**
   * @param {Object} options - Manager options
   * @param {boolean} [options.enableHistory=true] - Enable scene history
   * @param {number} [options.maxHistorySize=50] - Maximum history entries
   * @param {boolean} [options.enableEvents=true] - Enable event notifications
   * @param {boolean} [options.autoCreateDefault=true] - Auto-create default scene
   */
  constructor(options = {}) {
    const {
      enableHistory = true,
      maxHistorySize = 50,
      enableEvents = true,
      autoCreateDefault = true
    } = options;

    this.scenes = new Map();
    this.activeSceneId = null;
    this.enableHistory = enableHistory;
    this.maxHistorySize = maxHistorySize;
    this.enableEvents = enableEvents;
    this.history = [];
    this.eventListeners = new Map();

    if (autoCreateDefault) {
      this.createDefaultScene();
    }
  }

  /**
   * Create a default scene
   * @returns {string} Default scene ID
   */
  createDefaultScene() {
    const defaultScene = new Scene({
      name: 'Default Scene',
      camera: {
        position: { x: 0, y: 0, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        fov: 75,
        near: 0.1,
        far: 1000
      },
      lighting: {
        ambient: { color: '#404040', intensity: 0.4 },
        directional: { color: '#ffffff', intensity: 0.8, position: { x: 1, y: 1, z: 1 } }
      },
      environment: {
        background: '#000000',
        fog: { color: '#000000', near: 1, far: 1000 }
      }
    });

    this.addScene(defaultScene);
    this.setActiveScene(defaultScene.id);
    return defaultScene.id;
  }

  /**
   * Create a new scene
   * @param {Object} options - Scene options
   * @returns {string} Scene ID
   */
  createScene(options = {}) {
    const scene = new Scene(options);
    this.addScene(scene);
    return scene.id;
  }

  /**
   * Add a scene to the manager
   * @param {Scene} scene - Scene to add
   * @returns {boolean} Success status
   */
  addScene(scene) {
    if (!scene || !(scene instanceof Scene)) {
      console.error('Invalid scene provided to manager');
      return false;
    }

    if (this.scenes.has(scene.id)) {
      console.error(`Scene with ID '${scene.id}' already exists`);
      return false;
    }

    this.scenes.set(scene.id, scene);

    if (this.enableHistory) {
      this.addToHistory('add', { sceneId: scene.id, scene });
    }

    if (this.enableEvents) {
      this.notifyListeners('sceneAdded', { sceneId: scene.id, scene });
    }

    return true;
  }

  /**
   * Get a scene by ID
   * @param {string} sceneId - Scene ID
   * @returns {Scene|undefined} Scene or undefined if not found
   */
  getScene(sceneId) {
    return this.scenes.get(sceneId);
  }

  /**
   * Get a scene by name
   * @param {string} name - Scene name
   * @returns {Scene|undefined} Scene or undefined if not found
   */
  getSceneByName(name) {
    for (const scene of this.scenes.values()) {
      if (scene.name === name) {
        return scene;
      }
    }
    return undefined;
  }

  /**
   * Get all scenes
   * @returns {Array<Scene>} Array of all scenes
   */
  getAllScenes() {
    return Array.from(this.scenes.values());
  }

  /**
   * Set the active scene
   * @param {string} sceneId - Scene ID to set as active
   * @returns {boolean} Success status
   */
  setActiveScene(sceneId) {
    if (!this.scenes.has(sceneId)) {
      console.error(`Scene with ID '${sceneId}' not found`);
      return false;
    }

    const previousActiveId = this.activeSceneId;
    this.activeSceneId = sceneId;

    // Update scene active states
    this.scenes.forEach((scene, id) => {
      scene.setActive(id === sceneId);
    });

    if (this.enableHistory) {
      this.addToHistory('setActive', { 
        previousActiveId, 
        newActiveId: sceneId 
      });
    }

    if (this.enableEvents) {
      this.notifyListeners('activeSceneChanged', { 
        previousActiveId, 
        newActiveId: sceneId 
      });
    }

    return true;
  }

  /**
   * Get the active scene
   * @returns {Scene|undefined} Active scene or undefined if none
   */
  getActiveScene() {
    return this.activeSceneId ? this.scenes.get(this.activeSceneId) : undefined;
  }

  /**
   * Delete a scene
   * @param {string} sceneId - Scene ID to delete
   * @returns {boolean} Success status
   */
  deleteScene(sceneId) {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      return false;
    }

    // Don't delete the last scene
    if (this.scenes.size === 1) {
      console.error('Cannot delete the last scene');
      return false;
    }

    this.scenes.delete(sceneId);

    // If deleted scene was active, set another scene as active
    if (this.activeSceneId === sceneId) {
      const remainingScenes = Array.from(this.scenes.keys());
      if (remainingScenes.length > 0) {
        this.setActiveScene(remainingScenes[0]);
      }
    }

    if (this.enableHistory) {
      this.addToHistory('delete', { sceneId, scene });
    }

    if (this.enableEvents) {
      this.notifyListeners('sceneDeleted', { sceneId, scene });
    }

    return true;
  }

  /**
   * Clone a scene
   * @param {string} sceneId - Scene ID to clone
   * @returns {string|null} Cloned scene ID or null if failed
   */
  cloneScene(sceneId) {
    const scene = this.getScene(sceneId);
    if (!scene) {
      return null;
    }

    const clonedScene = scene.clone();
    this.addScene(clonedScene);
    return clonedScene.id;
  }

  /**
   * Merge two scenes
   * @param {string} sourceSceneId - Source scene ID
   * @param {string} targetSceneId - Target scene ID
   * @returns {boolean} Success status
   */
  mergeScenes(sourceSceneId, targetSceneId) {
    const sourceScene = this.getScene(sourceSceneId);
    const targetScene = this.getScene(targetSceneId);

    if (!sourceScene || !targetScene) {
      return false;
    }

    // Merge meshes
    sourceScene.getAllMeshes().forEach(mesh => {
      targetScene.addMesh(mesh.clone());
    });

    // Merge children
    sourceScene.getAllChildren().forEach(child => {
      targetScene.addChild(child.clone());
    });

    // Merge custom properties
    const sourceProps = sourceScene.getCustomProperties();
    Object.entries(sourceProps).forEach(([key, value]) => {
      targetScene.setCustomProperty(key, value);
    });

    if (this.enableHistory) {
      this.addToHistory('merge', { 
        sourceSceneId, 
        targetSceneId, 
        sourceScene, 
        targetScene 
      });
    }

    if (this.enableEvents) {
      this.notifyListeners('scenesMerged', { 
        sourceSceneId, 
        targetSceneId 
      });
    }

    return true;
  }

  /**
   * Get manager statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    let totalMeshes = 0;
    let totalVertices = 0;
    let totalEdges = 0;
    let totalFaces = 0;
    let totalUVs = 0;
    let totalChildren = 0;

    this.scenes.forEach(scene => {
      const stats = scene.getStatistics();
      totalMeshes += stats.meshCount;
      totalVertices += stats.totalVertices;
      totalEdges += stats.totalEdges;
      totalFaces += stats.totalFaces;
      totalUVs += stats.totalUVs;
      totalChildren += stats.childCount;
    });

    return {
      totalScenes: this.scenes.size,
      activeSceneId: this.activeSceneId,
      totalMeshes,
      totalVertices,
      totalEdges,
      totalFaces,
      totalUVs,
      totalChildren,
      historySize: this.history.length
    };
  }

  /**
   * Find scene containing a specific mesh
   * @param {string} meshId - Mesh ID to find
   * @returns {Scene|undefined} Scene containing the mesh or undefined
   */
  findSceneWithMesh(meshId) {
    for (const scene of this.scenes.values()) {
      if (scene.getMesh(meshId)) {
        return scene;
      }
      
      // Check child scenes
      const childWithMesh = this.findSceneWithMeshRecursive(scene, meshId);
      if (childWithMesh) {
        return childWithMesh;
      }
    }
    return undefined;
  }

  /**
   * Recursively find scene with mesh
   * @param {Scene} scene - Scene to search
   * @param {string} meshId - Mesh ID to find
   * @returns {Scene|undefined} Scene containing the mesh or undefined
   * @private
   */
  findSceneWithMeshRecursive(scene, meshId) {
    for (const child of scene.getAllChildren()) {
      if (child.getMesh(meshId)) {
        return child;
      }
      
      const result = this.findSceneWithMeshRecursive(child, meshId);
      if (result) {
        return result;
      }
    }
    return undefined;
  }

  /**
   * Get all scenes with a specific name pattern
   * @param {string} pattern - Name pattern (supports wildcards)
   * @returns {Array<Scene>} Array of matching scenes
   */
  getScenesByNamePattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const matchingScenes = [];

    this.scenes.forEach(scene => {
      if (regex.test(scene.name)) {
        matchingScenes.push(scene);
      }
    });

    return matchingScenes;
  }

  /**
   * Get scenes created within a time range
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   * @returns {Array<Scene>} Array of scenes in time range
   */
  getScenesInTimeRange(startTime, endTime) {
    const scenesInRange = [];

    this.scenes.forEach(scene => {
      if (scene.createdAt >= startTime && scene.createdAt <= endTime) {
        scenesInRange.push(scene);
      }
    });

    return scenesInRange;
  }

  /**
   * Get scenes updated within a time range
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   * @returns {Array<Scene>} Array of scenes updated in time range
   */
  getScenesUpdatedInTimeRange(startTime, endTime) {
    const scenesInRange = [];

    this.scenes.forEach(scene => {
      if (scene.updatedAt >= startTime && scene.updatedAt <= endTime) {
        scenesInRange.push(scene);
      }
    });

    return scenesInRange;
  }

  /**
   * Validate all scenes
   * @returns {Object} Validation result
   */
  validateAllScenes() {
    const errors = [];
    const warnings = [];

    this.scenes.forEach((scene, sceneId) => {
      const validation = scene.validate();
      if (!validation.isValid) {
        errors.push(`Scene ${sceneId}: ${validation.errors.join(', ')}`);
      }
      if (validation.warnings.length > 0) {
        warnings.push(`Scene ${sceneId}: ${validation.warnings.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
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
   * Get scene history
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