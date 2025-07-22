/**
 * @fileoverview Material Manager for 3D Editor
 * Manages multiple materials with creation, storage, and Three.js integration
 */

import { Material } from './Material.js';

/**
 * Material Manager for handling multiple materials
 */
export class MaterialManager {
  /**
   * Create a material manager
   * @param {Object} options - Manager options
   * @param {boolean} options.autoInitialize - Whether to auto-initialize default materials
   */
  constructor(options = {}) {
    const {
      autoInitialize = true
    } = options;

    this.materials = new Map();
    this.defaultMaterials = new Map();
    this.eventListeners = new Map();

    if (autoInitialize) {
      this.initializeDefaultMaterials();
    }
  }

  /**
   * Initialize default materials
   */
  initializeDefaultMaterials() {
    const defaultMaterials = [
      {
        name: 'Default',
        type: 'standard',
        color: { r: 0.8, g: 0.8, b: 0.8 },
        roughness: 0.5,
        metalness: 0.0
      },
      {
        name: 'Metal',
        type: 'standard',
        color: { r: 0.7, g: 0.7, b: 0.7 },
        roughness: 0.1,
        metalness: 0.9
      },
      {
        name: 'Plastic',
        type: 'standard',
        color: { r: 0.9, g: 0.9, b: 0.9 },
        roughness: 0.8,
        metalness: 0.0
      },
      {
        name: 'Glass',
        type: 'standard',
        color: { r: 0.9, g: 0.9, b: 0.9 },
        opacity: 0.3,
        transparent: true,
        roughness: 0.0,
        metalness: 0.0
      },
      {
        name: 'Wireframe',
        type: 'basic',
        color: { r: 0.0, g: 0.0, b: 0.0 },
        wireframe: true
      }
    ];

    defaultMaterials.forEach(materialData => {
      const material = new Material(materialData);
      this.defaultMaterials.set(material.id, material);
      this.materials.set(material.id, material);
    });
  }

  /**
   * Create a new material
   * @param {Object} options - Material options
   * @returns {Material} Created material
   */
  createMaterial(options = {}) {
    const material = new Material(options);
    this.addMaterial(material);
    return material;
  }

  /**
   * Add material to manager
   * @param {Material} material - Material to add
   * @returns {boolean} Success status
   */
  addMaterial(material) {
    if (!material || !(material instanceof Material)) {
      console.error('Invalid material provided to manager');
      return false;
    }

    if (this.materials.has(material.id)) {
      console.error(`Material with ID ${material.id} already exists`);
      return false;
    }

    this.materials.set(material.id, material);
    this.notifyListeners('materialAdded', { material });
    return true;
  }

  /**
   * Get material by ID
   * @param {string} id - Material ID
   * @returns {Material|null} Material or null if not found
   */
  getMaterial(id) {
    return this.materials.get(id) || null;
  }

  /**
   * Get material by name
   * @param {string} name - Material name
   * @returns {Material|null} Material or null if not found
   */
  getMaterialByName(name) {
    for (const [id, material] of this.materials) {
      if (material.name === name) {
        return material;
      }
    }
    return null;
  }

  /**
   * Get all materials
   * @returns {Array<Material>} Array of all materials
   */
  getAllMaterials() {
    return Array.from(this.materials.values());
  }

  /**
   * Get default materials
   * @returns {Array<Material>} Array of default materials
   */
  getDefaultMaterials() {
    return Array.from(this.defaultMaterials.values());
  }

  /**
   * Update material
   * @param {string} id - Material ID
   * @param {Object} updates - Update object
   * @returns {boolean} Success status
   */
  updateMaterial(id, updates) {
    const material = this.getMaterial(id);
    if (!material) {
      console.error(`Material with ID ${id} not found`);
      return false;
    }

    // Apply updates
    Object.assign(material, updates);
    
    this.notifyListeners('materialUpdated', { material, updates });
    return true;
  }

  /**
   * Delete material
   * @param {string} id - Material ID
   * @returns {boolean} Success status
   */
  deleteMaterial(id) {
    const material = this.getMaterial(id);
    if (!material) {
      return false;
    }

    // Don't delete default materials
    if (this.defaultMaterials.has(id)) {
      console.error('Cannot delete default material');
      return false;
    }

    this.materials.delete(id);
    this.notifyListeners('materialDeleted', { material });
    return true;
  }

  /**
   * Clone material
   * @param {string} id - Material ID
   * @returns {Material|null} Cloned material or null if not found
   */
  cloneMaterial(id) {
    const material = this.getMaterial(id);
    if (!material) {
      return null;
    }

    const clonedMaterial = material.clone();
    this.addMaterial(clonedMaterial);
    return clonedMaterial;
  }

  /**
   * Create material from Three.js material
   * @param {THREE.Material} threeMaterial - Three.js material
   * @param {string} name - Material name
   * @returns {Material} Created material
   */
  createFromThreeJS(threeMaterial, name = 'Imported') {
    const materialData = {
      name,
      type: this.getMaterialType(threeMaterial),
      color: {
        r: threeMaterial.color ? threeMaterial.color.r : 0.8,
        g: threeMaterial.color ? threeMaterial.color.g : 0.8,
        b: threeMaterial.color ? threeMaterial.color.b : 0.8
      },
      opacity: threeMaterial.opacity || 1,
      transparent: threeMaterial.transparent || false,
      wireframe: threeMaterial.wireframe || false,
      doubleSided: threeMaterial.side === THREE.DoubleSide
    };

    // Add type-specific properties
    if (threeMaterial.roughness !== undefined) {
      materialData.roughness = threeMaterial.roughness;
    }
    if (threeMaterial.metalness !== undefined) {
      materialData.metalness = threeMaterial.metalness;
    }
    if (threeMaterial.shininess !== undefined) {
      materialData.shininess = threeMaterial.shininess;
    }
    if (threeMaterial.emissiveIntensity !== undefined) {
      materialData.emissive = threeMaterial.emissiveIntensity;
    }

    const material = new Material(materialData);
    this.addMaterial(material);
    return material;
  }

  /**
   * Get material type from Three.js material
   * @param {THREE.Material} threeMaterial - Three.js material
   * @returns {string} Material type
   */
  getMaterialType(threeMaterial) {
    if (threeMaterial instanceof THREE.MeshStandardMaterial) {
      return 'standard';
    } else if (threeMaterial instanceof THREE.MeshPhongMaterial) {
      return 'phong';
    } else if (threeMaterial instanceof THREE.MeshBasicMaterial) {
      return 'basic';
    } else if (threeMaterial instanceof THREE.MeshLambertMaterial) {
      return 'lambert';
    } else {
      return 'standard';
    }
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

  /**
   * Get manager state
   * @returns {Object} Manager state
   */
  getState() {
    return {
      materialCount: this.materials.size,
      defaultMaterialCount: this.defaultMaterials.size,
      materials: Array.from(this.materials.values()).map(material => material.getSummary())
    };
  }
} 