/**
 * @fileoverview Scene Manager for 3D Editor
 * Manages scenes, scene hierarchy, and scene operations
 */

import { EditableMesh } from '../EditableMesh.js';
import { convertToThreeJS } from '../threejsConverter.js';
import * as THREE from 'three';

/**
 * Scene object representing a scene in the editor
 */
export class Scene {
  /**
   * Create a scene
   * @param {Object} options - Scene options
   * @param {string} options.name - Scene name, defaults to 'Scene'
   * @param {string} options.id - Scene ID
   * @param {Object} options.camera - Camera settings
   * @param {Object} options.lighting - Lighting settings
   * @param {Object} options.environment - Environment settings
   * @param {Object} options.customProperties - Custom properties
   */
  constructor(options = {}) {
    const {
      name = 'Scene',
      id = this.generateId(),
      camera = {},
      lighting = {},
      environment = {},
      customProperties = {}
    } = options;

    this.name = name;
    this.id = id;
    this.camera = { ...camera };
    this.lighting = { ...lighting };
    this.environment = { ...environment };
    this.customProperties = { ...customProperties };

    this.meshes = new Map();
    this.children = new Map();
    this.parent = null;
    this.visible = true;
    this.active = false;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }

  /**
   * Generate unique scene ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clone the scene
   * @returns {Scene} Cloned scene
   */
  clone() {
    const cloned = new Scene({
      name: `${this.name}_copy`,
      camera: { ...this.camera },
      lighting: { ...this.lighting },
      environment: { ...this.environment },
      customProperties: { ...this.customProperties }
    });

    // Clone meshes
    this.meshes.forEach((mesh, id) => {
      cloned.addMesh(mesh.clone());
    });

    // Clone children
    this.children.forEach((child, id) => {
      cloned.addChild(child.clone());
    });

    return cloned;
  }

  /**
   * Add mesh to scene
   * @param {EditableMesh} mesh - Mesh to add
   * @returns {boolean} Success status
   */
  addMesh(mesh) {
    if (!mesh || !(mesh instanceof EditableMesh)) {
      console.error('Invalid mesh provided to scene');
      return false;
    }

    this.meshes.set(mesh.id, mesh);
    this.updatedAt = Date.now();
    return true;
  }

  /**
   * Remove mesh from scene
   * @param {string} meshId - Mesh ID
   * @returns {boolean} Success status
   */
  removeMesh(meshId) {
    const removed = this.meshes.delete(meshId);
    if (removed) {
      this.updatedAt = Date.now();
    }
    return removed;
  }

  /**
   * Get mesh by ID
   * @param {string} meshId - Mesh ID
   * @returns {EditableMesh|null} Mesh or null
   */
  getMesh(meshId) {
    return this.meshes.get(meshId) || null;
  }

  /**
   * Get all meshes
   * @returns {EditableMesh[]} All meshes
   */
  getAllMeshes() {
    return Array.from(this.meshes.values());
  }

  /**
   * Add child scene
   * @param {Scene} child - Child scene
   * @returns {boolean} Success status
   */
  addChild(child) {
    if (!child || !(child instanceof Scene)) {
      console.error('Invalid child scene provided');
      return false;
    }

    child.parent = this;
    this.children.set(child.id, child);
    this.updatedAt = Date.now();
    return true;
  }

  /**
   * Remove child scene
   * @param {string} childId - Child scene ID
   * @returns {boolean} Success status
   */
  removeChild(childId) {
    const child = this.children.get(childId);
    if (child) {
      child.parent = null;
      this.children.delete(childId);
      this.updatedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Get child scene by ID
   * @param {string} childId - Child scene ID
   * @returns {Scene|null} Child scene or null
   */
  getChild(childId) {
    return this.children.get(childId) || null;
  }

  /**
   * Get all child scenes
   * @returns {Scene[]} All child scenes
   */
  getAllChildren() {
    return Array.from(this.children.values());
  }

  /**
   * Get scene hierarchy
   * @returns {Object} Scene hierarchy
   */
  getHierarchy() {
    return {
      id: this.id,
      name: this.name,
      meshes: Array.from(this.meshes.keys()),
      children: Array.from(this.children.values()).map(child => child.getHierarchy())
    };
  }

  /**
   * Get scene statistics
   * @returns {Object} Scene statistics
   */
  getStatistics() {
    let totalMeshes = this.meshes.size;
    let totalVertices = 0;
    let totalFaces = 0;
    let totalEdges = 0;

    this.meshes.forEach(mesh => {
      totalVertices += mesh.vertices.size;
      totalFaces += mesh.faces.size;
      totalEdges += mesh.edges.size;
    });

    // Include children statistics
    this.children.forEach(child => {
      const childStats = child.getStatistics();
      totalMeshes += childStats.totalMeshes;
      totalVertices += childStats.totalVertices;
      totalFaces += childStats.totalFaces;
      totalEdges += childStats.totalEdges;
    });

    return {
      totalMeshes,
      totalVertices,
      totalFaces,
      totalEdges,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convert scene to Three.js scene
   * @returns {THREE.Scene} Three.js scene
   */
  toThreeJS() {
    const THREE = window.THREE;
    if (!THREE) {
      console.error('Three.js not available');
      return null;
    }

    const scene = new THREE.Scene();

    // Add meshes
    this.meshes.forEach(mesh => {
      const threeMesh = convertToThreeJS(mesh);
      if (threeMesh) {
        scene.add(threeMesh);
      }
    });

    // Add children
    this.children.forEach(child => {
      const childScene = child.toThreeJS();
      if (childScene) {
        scene.add(childScene);
      }
    });

    return scene;
  }

  /**
   * Validate scene
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Check for orphaned meshes
    this.meshes.forEach(mesh => {
      const validation = mesh.validate();
      if (!validation.isValid) {
        errors.push(`Mesh ${mesh.name}: ${validation.errors.join(', ')}`);
      }
    });

    // Check for circular references
    const visited = new Set();
    const checkCircular = (scene) => {
      if (visited.has(scene.id)) {
        errors.push('Circular reference detected in scene hierarchy');
        return;
      }
      visited.add(scene.id);
      scene.children.forEach(child => checkCircular(child));
    };
    checkCircular(this);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Scene Manager for managing multiple scenes
 */
export class SceneManager {
  /**
   * Create a scene manager
   * @param {Object} options - Configuration options
   * @param {boolean} options.autoSave - Auto-save scenes
   * @param {number} options.maxScenes - Maximum scenes to keep
   */
  constructor(options = {}) {
    const {
      autoSave = true,
      maxScenes = 50
    } = options;

    this.autoSave = autoSave;
    this.maxScenes = maxScenes;
    this.scenes = new Map();
    this.activeScene = null;
    this.listeners = new Set();

    this.createDefaultScene();
  }

  /**
   * Create default scene
   */
  createDefaultScene() {
    const defaultScene = new Scene({
      name: 'Default Scene',
      camera: {
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        fov: 75
      },
      lighting: {
        ambient: { intensity: 0.4, color: { r: 0.4, g: 0.4, b: 0.4 } },
        directional: { intensity: 0.8, color: { r: 1, g: 1, b: 1 } }
      },
      environment: {
        background: { r: 0.1, g: 0.1, b: 0.1 },
        fog: { enabled: false }
      }
    });

    this.addScene(defaultScene);
    this.setActiveScene(defaultScene.id);
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
   */
  addScene(scene) {
    this.scenes.set(scene.id, scene);
    
    // Maintain max scenes limit
    if (this.scenes.size > this.maxScenes) {
      const firstKey = this.scenes.keys().next().value;
      this.scenes.delete(firstKey);
    }

    this.notifyListeners('sceneAdded', { scene });
  }

  /**
   * Get scene by ID
   * @param {string} sceneId - Scene ID
   * @returns {Scene|null} Scene or null
   */
  getScene(sceneId) {
    return this.scenes.get(sceneId) || null;
  }

  /**
   * Get scene by name
   * @param {string} name - Scene name
   * @returns {Scene|null} Scene or null
   */
  getSceneByName(name) {
    for (const scene of this.scenes.values()) {
      if (scene.name === name) {
        return scene;
      }
    }
    return null;
  }

  /**
   * Get all scenes
   * @returns {Scene[]} All scenes
   */
  getAllScenes() {
    return Array.from(this.scenes.values());
  }

  /**
   * Set active scene
   * @param {string} sceneId - Scene ID
   * @returns {boolean} Success status
   */
  setActiveScene(sceneId) {
    const scene = this.getScene(sceneId);
    if (!scene) {return false;}

    if (this.activeScene) {
      this.activeScene.active = false;
    }

    this.activeScene = scene;
    scene.active = true;
    this.notifyListeners('activeSceneChanged', { scene });
    return true;
  }

  /**
   * Get active scene
   * @returns {Scene|null} Active scene or null
   */
  getActiveScene() {
    return this.activeScene;
  }

  /**
   * Delete scene
   * @param {string} sceneId - Scene ID
   * @returns {boolean} Success status
   */
  deleteScene(sceneId) {
    const scene = this.getScene(sceneId);
    if (!scene) {return false;}

    // Don't delete the last scene
    if (this.scenes.size === 1) {
      console.warn('Cannot delete the last scene');
      return false;
    }

    this.scenes.delete(sceneId);

    // If deleted scene was active, set another scene as active
    if (this.activeScene === scene) {
      const firstScene = this.scenes.values().next().value;
      this.setActiveScene(firstScene.id);
    }

    this.notifyListeners('sceneDeleted', { scene });
    return true;
  }

  /**
   * Clone scene
   * @param {string} sceneId - Scene ID
   * @returns {Scene|null} Cloned scene or null
   */
  cloneScene(sceneId) {
    const scene = this.getScene(sceneId);
    if (!scene) {return null;}

    const cloned = scene.clone();
    this.addScene(cloned);
    return cloned;
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

    if (!sourceScene || !targetScene) {return false;}

    // Move all meshes from source to target
    sourceScene.getAllMeshes().forEach(mesh => {
      targetScene.addMesh(mesh);
    });

    // Move all children from source to target
    sourceScene.getAllChildren().forEach(child => {
      targetScene.addChild(child);
    });

    // Delete source scene
    this.deleteScene(sourceSceneId);

    return true;
  }

  /**
   * Get manager statistics
   * @returns {Object} Manager statistics
   */
  getStatistics() {
    const totalScenes = this.scenes.size;
    let totalMeshes = 0;
    let totalVertices = 0;
    let totalFaces = 0;

    this.scenes.forEach(scene => {
      const stats = scene.getStatistics();
      totalMeshes += stats.totalMeshes;
      totalVertices += stats.totalVertices;
      totalFaces += stats.totalFaces;
    });

    return {
      totalScenes,
      totalMeshes,
      totalVertices,
      totalFaces,
      activeScene: this.activeScene?.name || 'None'
    };
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
          console.error('Scene listener error:', error);
        }
      }
    }
  }
} 