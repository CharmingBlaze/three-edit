/**
 * @fileoverview Scene Class
 * Represents a scene in the 3D editor with meshes, hierarchy, and settings
 */

import { EditableMesh } from '../../mesh/EditableMesh.js';
import { convertToThreeJS } from '../../threejsConverter.js';

/**
 * Scene object representing a scene in the editor
 */
export class Scene {
  /**
   * Create a scene
   * @param {Object} options - Scene options
   * @param {string} [options.name='Scene'] - Scene name
   * @param {string} [options.id] - Scene ID (auto-generated if not provided)
   * @param {Object} [options.camera={}] - Camera settings
   * @param {Object} [options.lighting={}] - Lighting settings
   * @param {Object} [options.environment={}] - Environment settings
   * @param {Object} [options.customProperties={}] - Custom properties
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
   * @returns {EditableMesh|undefined} Mesh or undefined if not found
   */
  getMesh(meshId) {
    return this.meshes.get(meshId);
  }

  /**
   * Get all meshes in scene
   * @returns {Array<EditableMesh>} Array of all meshes
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

    if (child.parent) {
      console.error('Child scene already has a parent');
      return false;
    }

    this.children.set(child.id, child);
    child.parent = this;
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
    if (!child) {
      return false;
    }

    this.children.delete(childId);
    child.parent = null;
    this.updatedAt = Date.now();
    return true;
  }

  /**
   * Get child scene by ID
   * @param {string} childId - Child scene ID
   * @returns {Scene|undefined} Child scene or undefined if not found
   */
  getChild(childId) {
    return this.children.get(childId);
  }

  /**
   * Get all child scenes
   * @returns {Array<Scene>} Array of all child scenes
   */
  getAllChildren() {
    return Array.from(this.children.values());
  }

  /**
   * Get scene hierarchy
   * @returns {Object} Hierarchy object
   */
  getHierarchy() {
    const hierarchy = {
      id: this.id,
      name: this.name,
      meshes: Array.from(this.meshes.keys()),
      children: []
    };

    this.children.forEach(child => {
      hierarchy.children.push(child.getHierarchy());
    });

    return hierarchy;
  }

  /**
   * Get scene statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    let totalVertices = 0;
    let totalEdges = 0;
    let totalFaces = 0;
    let totalUVs = 0;

    // Count mesh statistics
    this.meshes.forEach(mesh => {
      totalVertices += mesh.vertices.size;
      totalEdges += mesh.edges.size;
      totalFaces += mesh.faces.size;
      totalUVs += mesh.uvs.size;
    });

    // Count child scene statistics
    this.children.forEach(child => {
      const childStats = child.getStatistics();
      totalVertices += childStats.totalVertices;
      totalEdges += childStats.totalEdges;
      totalFaces += childStats.totalFaces;
      totalUVs += childStats.totalUVs;
    });

    return {
      meshCount: this.meshes.size,
      childCount: this.children.size,
      totalVertices,
      totalEdges,
      totalFaces,
      totalUVs,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      visible: this.visible,
      active: this.active
    };
  }

  /**
   * Convert scene to Three.js format
   * @returns {Object} Three.js scene object
   */
  toThreeJS() {
    const threeScene = {
      scene: new THREE.Scene(),
      meshes: [],
      cameras: [],
      lights: []
    };

    // Convert meshes
    this.meshes.forEach(mesh => {
      try {
        const threeMesh = convertToThreeJS(mesh);
        if (threeMesh) {
          threeScene.meshes.push(threeMesh);
          threeScene.scene.add(threeMesh);
        }
      } catch (error) {
        console.error('Error converting mesh to Three.js:', error);
      }
    });

    // Convert children
    this.children.forEach(child => {
      const childThreeJS = child.toThreeJS();
      threeScene.scene.add(childThreeJS.scene);
      threeScene.meshes.push(...childThreeJS.meshes);
      threeScene.cameras.push(...childThreeJS.cameras);
      threeScene.lights.push(...childThreeJS.lights);
    });

    return threeScene;
  }

  /**
   * Validate scene structure
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

      scene.children.forEach(child => {
        checkCircular(child, new Set(visited));
      });
    };

    checkCircular(this);

    // Check mesh validity
    this.meshes.forEach((mesh, meshId) => {
      const meshValidation = mesh.validate();
      if (!meshValidation.isValid) {
        errors.push(`Mesh ${meshId}: ${meshValidation.errors.join(', ')}`);
      }
      if (meshValidation.warnings.length > 0) {
        warnings.push(`Mesh ${meshId}: ${meshValidation.warnings.join(', ')}`);
      }
    });

    // Check child scenes
    this.children.forEach(child => {
      const childValidation = child.validate();
      errors.push(...childValidation.errors);
      warnings.push(...childValidation.warnings);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Set scene name
   * @param {string} name - New scene name
   */
  setName(name) {
    this.name = name;
    this.updatedAt = Date.now();
  }

  /**
   * Set scene visibility
   * @param {boolean} visible - Visibility state
   */
  setVisible(visible) {
    this.visible = visible;
    this.updatedAt = Date.now();
  }

  /**
   * Set scene active state
   * @param {boolean} active - Active state
   */
  setActive(active) {
    this.active = active;
    this.updatedAt = Date.now();
  }

  /**
   * Update camera settings
   * @param {Object} cameraSettings - New camera settings
   */
  updateCamera(cameraSettings) {
    this.camera = { ...this.camera, ...cameraSettings };
    this.updatedAt = Date.now();
  }

  /**
   * Update lighting settings
   * @param {Object} lightingSettings - New lighting settings
   */
  updateLighting(lightingSettings) {
    this.lighting = { ...this.lighting, ...lightingSettings };
    this.updatedAt = Date.now();
  }

  /**
   * Update environment settings
   * @param {Object} environmentSettings - New environment settings
   */
  updateEnvironment(environmentSettings) {
    this.environment = { ...this.environment, ...environmentSettings };
    this.updatedAt = Date.now();
  }

  /**
   * Set custom property
   * @param {string} key - Property key
   * @param {*} value - Property value
   */
  setCustomProperty(key, value) {
    this.customProperties[key] = value;
    this.updatedAt = Date.now();
  }

  /**
   * Get custom property
   * @param {string} key - Property key
   * @returns {*} Property value or undefined
   */
  getCustomProperty(key) {
    return this.customProperties[key];
  }

  /**
   * Remove custom property
   * @param {string} key - Property key
   * @returns {boolean} True if property was removed
   */
  removeCustomProperty(key) {
    const removed = delete this.customProperties[key];
    if (removed) {
      this.updatedAt = Date.now();
    }
    return removed;
  }

  /**
   * Get all custom properties
   * @returns {Object} Custom properties object
   */
  getCustomProperties() {
    return { ...this.customProperties };
  }

  /**
   * Find mesh by name
   * @param {string} name - Mesh name
   * @returns {EditableMesh|undefined} Mesh or undefined if not found
   */
  findMeshByName(name) {
    for (const mesh of this.meshes.values()) {
      if (mesh.name === name) {
        return mesh;
      }
    }
    return undefined;
  }

  /**
   * Find child scene by name
   * @param {string} name - Child scene name
   * @returns {Scene|undefined} Child scene or undefined if not found
   */
  findChildByName(name) {
    for (const child of this.children.values()) {
      if (child.name === name) {
        return child;
      }
    }
    return undefined;
  }

  /**
   * Get scene depth in hierarchy
   * @returns {number} Depth level (0 for root)
   */
  getDepth() {
    let depth = 0;
    let current = this.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }

  /**
   * Get root scene
   * @returns {Scene} Root scene
   */
  getRoot() {
    let root = this;
    while (root.parent) {
      root = root.parent;
    }
    return root;
  }

  /**
   * Get all ancestors
   * @returns {Array<Scene>} Array of ancestor scenes
   */
  getAncestors() {
    const ancestors = [];
    let current = this.parent;
    while (current) {
      ancestors.unshift(current);
      current = current.parent;
    }
    return ancestors;
  }

  /**
   * Get all descendants
   * @returns {Array<Scene>} Array of descendant scenes
   */
  getDescendants() {
    const descendants = [];
    this.children.forEach(child => {
      descendants.push(child);
      descendants.push(...child.getDescendants());
    });
    return descendants;
  }
} 