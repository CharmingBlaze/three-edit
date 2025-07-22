/**
 * @fileoverview Scene Manager for 3D Editor
 * Manages multiple scenes, scene hierarchy, and scene operations
 */

import { Scene } from './Scene.js';

/**
 * Scene Manager for handling multiple scenes
 */
export class SceneManager {
  /**
   * Create a scene manager
   * @param {Object} options - Manager options
   * @param {string} options.defaultSceneName - Default scene name
   * @param {boolean} options.autoCreateDefault - Whether to auto-create default scene
   */
  constructor(options = {}) {
    const {
      defaultSceneName = 'Default Scene',
      autoCreateDefault = true
    } = options;

    this.scenes = new Map();
    this.activeSceneId = null;
    this.defaultSceneName = defaultSceneName;
    this.eventListeners = new Map();

    if (autoCreateDefault) {
      this.createDefaultScene();
    }
  }

  /**
   * Create default scene
   * @returns {Scene} Created default scene
   */
  createDefaultScene() {
    const defaultScene = new Scene({
      name: this.defaultSceneName,
      camera: {
        position: { x: 0, y: 0, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        fov: 75
      },
      lighting: {
        ambient: { color: 0x404040, intensity: 0.4 },
        directional: { color: 0xffffff, intensity: 0.8, position: { x: 1, y: 1, z: 1 } }
      },
      environment: {
        background: 0x000000,
        fog: null
      }
    });

    this.addScene(defaultScene);
    this.setActiveScene(defaultScene.id);
    return defaultScene;
  }

  /**
   * Create a new scene
   * @param {Object} options - Scene options
   * @returns {Scene} Created scene
   */
  createScene(options = {}) {
    const scene = new Scene(options);
    this.addScene(scene);
    return scene;
  }

  /**
   * Add scene to manager
   * @param {Scene} scene - Scene to add
   * @returns {boolean} Success status
   */
  addScene(scene) {
    if (!scene || !(scene instanceof Scene)) {
      console.error('Invalid scene provided to manager');
      return false;
    }

    if (this.scenes.has(scene.id)) {
      console.error(`Scene with ID ${scene.id} already exists`);
      return false;
    }

    this.scenes.set(scene.id, scene);
    this.notifyListeners('sceneAdded', { scene });
    return true;
  }

  /**
   * Get scene by ID
   * @param {string} sceneId - Scene ID
   * @returns {Scene|null} Scene or null if not found
   */
  getScene(sceneId) {
    return this.scenes.get(sceneId) || null;
  }

  /**
   * Get scene by name
   * @param {string} name - Scene name
   * @returns {Scene|null} Scene or null if not found
   */
  getSceneByName(name) {
    for (const [id, scene] of this.scenes) {
      if (scene.name === name) {
        return scene;
      }
    }
    return null;
  }

  /**
   * Get all scenes
   * @returns {Array<Scene>} Array of all scenes
   */
  getAllScenes() {
    return Array.from(this.scenes.values());
  }

  /**
   * Set active scene
   * @param {string} sceneId - Scene ID to set as active
   * @returns {boolean} Success status
   */
  setActiveScene(sceneId) {
    if (!this.scenes.has(sceneId)) {
      console.error(`Scene with ID ${sceneId} not found`);
      return false;
    }

    const previousActive = this.activeSceneId;
    this.activeSceneId = sceneId;

    // Update scene active states
    this.scenes.forEach((scene, id) => {
      scene.active = (id === sceneId);
    });

    this.notifyListeners('activeSceneChanged', { 
      previousActive, 
      currentActive: sceneId 
    });

    return true;
  }

  /**
   * Get active scene
   * @returns {Scene|null} Active scene or null if none
   */
  getActiveScene() {
    return this.activeSceneId ? this.scenes.get(this.activeSceneId) : null;
  }

  /**
   * Delete scene
   * @param {string} sceneId - Scene ID to delete
   * @returns {boolean} Success status
   */
  deleteScene(sceneId) {
    if (!this.scenes.has(sceneId)) {
      console.error(`Scene with ID ${sceneId} not found`);
      return false;
    }

    // Don't delete if it's the only scene
    if (this.scenes.size === 1) {
      console.error('Cannot delete the last scene');
      return false;
    }

    const scene = this.scenes.get(sceneId);
    this.scenes.delete(sceneId);

    // If deleted scene was active, set another scene as active
    if (this.activeSceneId === sceneId) {
      const remainingScenes = Array.from(this.scenes.keys());
      if (remainingScenes.length > 0) {
        this.setActiveScene(remainingScenes[0]);
      }
    }

    this.notifyListeners('sceneDeleted', { scene });
    return true;
  }

  /**
   * Clone scene
   * @param {string} sceneId - Scene ID to clone
   * @returns {Scene|null} Cloned scene or null if not found
   */
  cloneScene(sceneId) {
    const scene = this.getScene(sceneId);
    if (!scene) {
      return null;
    }

    const clonedScene = scene.clone();
    this.addScene(clonedScene);
    return clonedScene;
  }

  /**
   * Merge scenes
   * @param {string} sourceSceneId - Source scene ID
   * @param {string} targetSceneId - Target scene ID
   * @returns {boolean} Success status
   */
  mergeScenes(sourceSceneId, targetSceneId) {
    const sourceScene = this.getScene(sourceSceneId);
    const targetScene = this.getScene(targetSceneId);

    if (!sourceScene || !targetScene) {
      console.error('Source or target scene not found');
      return false;
    }

    // Merge meshes
    sourceScene.getAllMeshes().forEach(mesh => {
      targetScene.addMesh(mesh);
    });

    // Merge children
    sourceScene.getAllChildren().forEach(child => {
      targetScene.addChild(child);
    });

    // Delete source scene
    this.deleteScene(sourceSceneId);

    this.notifyListeners('scenesMerged', { sourceScene, targetScene });
    return true;
  }

  /**
   * Get manager statistics
   * @returns {Object} Manager statistics
   */
  getStatistics() {
    let totalMeshes = 0;
    let totalVertices = 0;
    let totalFaces = 0;
    let totalEdges = 0;

    this.scenes.forEach(scene => {
      const stats = scene.getStatistics();
      totalMeshes += stats.meshCount;
      totalVertices += stats.totalVertices;
      totalFaces += stats.totalFaces;
      totalEdges += stats.totalEdges;
    });

    return {
      sceneCount: this.scenes.size,
      activeSceneId: this.activeSceneId,
      totalMeshes,
      totalVertices,
      totalFaces,
      totalEdges
    };
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