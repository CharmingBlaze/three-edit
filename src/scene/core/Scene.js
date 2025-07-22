/**
 * @fileoverview Scene class for 3D Editor
 * Represents a scene in the editor with meshes, hierarchy, and properties
 */

import { EditableMesh } from '../../EditableMesh.js';
import { convertToThreeJS } from '../../threejsConverter.js';
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
   * @param {string} meshId - Mesh ID to remove
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
   * @returns {EditableMesh|null} Mesh or null if not found
   */
  getMesh(meshId) {
    return this.meshes.get(meshId) || null;
  }

  /**
   * Get all meshes in scene
   * @returns {Array<EditableMesh>} Array of meshes
   */
  getAllMeshes() {
    return Array.from(this.meshes.values());
  }

  /**
   * Add child scene
   * @param {Scene} child - Child scene to add
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
   * @param {string} childId - Child scene ID to remove
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
   * @returns {Scene|null} Child scene or null if not found
   */
  getChild(childId) {
    return this.children.get(childId) || null;
  }

  /**
   * Get all child scenes
   * @returns {Array<Scene>} Array of child scenes
   */
  getAllChildren() {
    return Array.from(this.children.values());
  }

  /**
   * Get scene hierarchy as tree structure
   * @returns {Object} Hierarchy tree
   */
  getHierarchy() {
    return {
      id: this.id,
      name: this.name,
      type: 'scene',
      children: Array.from(this.children.values()).map(child => child.getHierarchy()),
      meshes: Array.from(this.meshes.values()).map(mesh => ({
        id: mesh.id,
        name: mesh.name,
        type: 'mesh'
      }))
    };
  }

  /**
   * Get scene statistics
   * @returns {Object} Scene statistics
   */
  getStatistics() {
    let totalVertices = 0;
    let totalFaces = 0;
    let totalEdges = 0;

    this.meshes.forEach(mesh => {
      totalVertices += mesh.vertices.size;
      totalFaces += mesh.faces.size;
      totalEdges += mesh.edges.size;
    });

    return {
      meshCount: this.meshes.size,
      childSceneCount: this.children.size,
      totalVertices,
      totalFaces,
      totalEdges,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convert scene to Three.js objects
   * @returns {THREE.Group} Three.js group containing scene objects
   */
  toThreeJS() {
    const group = new THREE.Group();
    group.name = this.name;

    // Convert meshes
    this.meshes.forEach(mesh => {
      try {
        const threeMesh = convertToThreeJS(mesh);
        if (threeMesh) {
          group.add(threeMesh);
        }
      } catch (error) {
        console.error(`Error converting mesh ${mesh.id}:`, error);
      }
    });

    // Convert children
    this.children.forEach(child => {
      try {
        const childGroup = child.toThreeJS();
        if (childGroup) {
          group.add(childGroup);
        }
      } catch (error) {
        console.error(`Error converting child scene ${child.id}:`, error);
      }
    });

    return group;
  }

  /**
   * Validate scene integrity
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Check for circular references
    const checkCircular = (scene, visited = new Set()) => {
      if (visited.has(scene.id)) {
        errors.push(`Circular reference detected in scene hierarchy: ${scene.id}`);
        return;
      }

      visited.add(scene.id);
      scene.children.forEach(child => checkCircular(child, new Set(visited)));
    };

    checkCircular(this);

    // Check mesh validity
    this.meshes.forEach(mesh => {
      const validation = mesh.validate();
      if (!validation.isValid) {
        errors.push(`Invalid mesh ${mesh.id}: ${validation.errors.join(', ')}`);
      }
      if (validation.warnings.length > 0) {
        warnings.push(`Mesh ${mesh.id} warnings: ${validation.warnings.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 