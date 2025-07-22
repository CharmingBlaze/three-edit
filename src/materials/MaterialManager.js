/**
 * @fileoverview Material Manager for 3D Editor
 * Manages materials with support for different types, properties, and Three.js integration
 */

/**
 * Material class representing a material in the editor
 */
export class Material {
  /**
   * Create a material
   * @param {Object} options - Material options
   * @param {string} options.name - Material name, defaults to 'Material'
   * @param {string} options.type - Material type, defaults to 'standard'
   * @param {Object} options.color - Color object {r, g, b}, defaults to {r: 0.8, g: 0.8, b: 0.8}
   * @param {number} options.opacity - Opacity (0-1), defaults to 1
   * @param {boolean} options.transparent - Whether material is transparent, defaults to false
   * @param {number} options.roughness - Roughness (0-1), defaults to 0.5
   * @param {number} options.metalness - Metalness (0-1), defaults to 0
   * @param {number} options.emissive - Emissive intensity, defaults to 0
   * @param {Object} options.emissiveColor - Emissive color, defaults to {r: 0, g: 0, b: 0}
   * @param {number} options.shininess - Shininess for phong materials, defaults to 30
   * @param {number} options.reflectivity - Reflectivity, defaults to 1
   * @param {number} options.refractionRatio - Refraction ratio, defaults to 0.98
   * @param {boolean} options.wireframe - Wireframe mode, defaults to false
   * @param {boolean} options.doubleSided - Double-sided rendering, defaults to true
   * @param {Object} options.textures - Texture objects, defaults to {}
   * @param {Object} options.customProperties - Custom properties, defaults to {}
   */
  constructor(options = {}) {
    const {
      name = 'Material',
      type = 'standard',
      color = { r: 0.8, g: 0.8, b: 0.8 },
      opacity = 1,
      transparent = false,
      roughness = 0.5,
      metalness = 0,
      emissive = 0,
      emissiveColor = { r: 0, g: 0, b: 0 },
      shininess = 30,
      reflectivity = 1,
      refractionRatio = 0.98,
      wireframe = false,
      doubleSided = true,
      textures = {},
      customProperties = {}
    } = options;

    this.name = name;
    this.type = type;
    this.color = { ...color };
    this.opacity = opacity;
    this.transparent = transparent;
    this.roughness = roughness;
    this.metalness = metalness;
    this.emissive = emissive;
    this.emissiveColor = { ...emissiveColor };
    this.shininess = shininess;
    this.reflectivity = reflectivity;
    this.refractionRatio = refractionRatio;
    this.wireframe = wireframe;
    this.doubleSided = doubleSided;
    this.textures = { ...textures };
    this.customProperties = { ...customProperties };
    this.id = this.generateId();
  }

  /**
   * Generate unique material ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clone the material
   * @returns {Material} Cloned material
   */
  clone() {
    return new Material({
      name: `${this.name}_copy`,
      type: this.type,
      color: { ...this.color },
      opacity: this.opacity,
      transparent: this.transparent,
      roughness: this.roughness,
      metalness: this.metalness,
      emissive: this.emissive,
      emissiveColor: { ...this.emissiveColor },
      shininess: this.shininess,
      reflectivity: this.reflectivity,
      refractionRatio: this.refractionRatio,
      wireframe: this.wireframe,
      doubleSided: this.doubleSided,
      textures: { ...this.textures },
      customProperties: { ...this.customProperties }
    });
  }

  /**
   * Convert to Three.js material
   * @returns {THREE.Material} Three.js material
   */
  toThreeJS() {
    const THREE = window.THREE;
    if (!THREE) {
      console.error('Three.js not available');
      return null;
    }

    let material;

    switch (this.type) {
      case 'basic':
        material = new THREE.MeshBasicMaterial();
        break;
      case 'lambert':
        material = new THREE.MeshLambertMaterial();
        break;
      case 'phong':
        material = new THREE.MeshPhongMaterial();
        material.shininess = this.shininess;
        break;
      case 'standard':
        material = new THREE.MeshStandardMaterial();
        material.roughness = this.roughness;
        material.metalness = this.metalness;
        break;
      case 'physical':
        material = new THREE.MeshPhysicalMaterial();
        material.roughness = this.roughness;
        material.metalness = this.metalness;
        material.reflectivity = this.reflectivity;
        material.clearcoat = this.customProperties.clearcoat || 0;
        material.clearcoatRoughness = this.customProperties.clearcoatRoughness || 0;
        break;
      case 'toon':
        material = new THREE.MeshToonMaterial();
        break;
      case 'shader':
        // Custom shader material
        material = new THREE.ShaderMaterial({
          vertexShader: this.customProperties.vertexShader || '',
          fragmentShader: this.customProperties.fragmentShader || '',
          uniforms: this.customProperties.uniforms || {}
        });
        break;
      default:
        material = new THREE.MeshStandardMaterial();
    }

    // Apply common properties
    material.color.setRGB(this.color.r, this.color.g, this.color.b);
    material.opacity = this.opacity;
    material.transparent = this.transparent;
    material.emissive.setRGB(this.emissiveColor.r, this.emissiveColor.g, this.emissiveColor.b);
    material.emissiveIntensity = this.emissive;
    material.wireframe = this.wireframe;
    material.side = this.doubleSided ? THREE.DoubleSide : THREE.FrontSide;

    // Apply textures
    this.applyTextures(material);

    return material;
  }

  /**
   * Apply textures to Three.js material
   * @param {THREE.Material} material - Three.js material
   */
  applyTextures(material) {
    const THREE = window.THREE;
    if (!THREE) {return;}

    Object.entries(this.textures).forEach(([type, textureData]) => {
      if (textureData && textureData.image) {
        const texture = new THREE.Texture(textureData.image);
        texture.wrapS = textureData.wrapS || THREE.ClampToEdgeWrapping;
        texture.wrapT = textureData.wrapT || THREE.ClampToEdgeWrapping;
        texture.repeat.set(textureData.repeat?.x || 1, textureData.repeat?.y || 1);
        texture.offset.set(textureData.offset?.x || 0, textureData.offset?.y || 0);
        texture.rotation = textureData.rotation || 0;

        switch (type) {
          case 'map':
            material.map = texture;
            break;
          case 'normalMap':
            material.normalMap = texture;
            break;
          case 'roughnessMap':
            material.roughnessMap = texture;
            break;
          case 'metalnessMap':
            material.metalnessMap = texture;
            break;
          case 'emissiveMap':
            material.emissiveMap = texture;
            break;
          case 'aoMap':
            material.aoMap = texture;
            break;
          case 'displacementMap':
            material.displacementMap = texture;
            material.displacementScale = textureData.scale || 1;
            break;
        }
      }
    });
  }

  /**
   * Get material summary
   * @returns {Object} Material summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      color: this.color,
      opacity: this.opacity,
      transparent: this.transparent,
      roughness: this.roughness,
      metalness: this.metalness,
      emissive: this.emissive,
      wireframe: this.wireframe,
      textureCount: Object.keys(this.textures).length
    };
  }

  /**
   * Validate material properties
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (this.opacity < 0 || this.opacity > 1) {
      errors.push('Opacity must be between 0 and 1');
    }

    if (this.roughness < 0 || this.roughness > 1) {
      errors.push('Roughness must be between 0 and 1');
    }

    if (this.metalness < 0 || this.metalness > 1) {
      errors.push('Metalness must be between 0 and 1');
    }

    if (this.emissive < 0) {
      errors.push('Emissive intensity must be non-negative');
    }

    if (this.shininess < 0) {
      errors.push('Shininess must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Material Manager for managing materials in the editor
 */
export class MaterialManager {
  /**
   * Create a material manager
   * @param {Object} options - Configuration options
   * @param {boolean} options.autoSave - Auto-save materials, defaults to true
   * @param {number} options.maxMaterials - Maximum materials to keep, defaults to 100
   */
  constructor(options = {}) {
    const {
      autoSave = true,
      maxMaterials = 100
    } = options;

    this.autoSave = autoSave;
    this.maxMaterials = maxMaterials;
    this.materials = new Map();
    this.defaultMaterials = new Map();
    this.listeners = new Set();

    this.initializeDefaultMaterials();
  }

  /**
   * Initialize default materials
   */
  initializeDefaultMaterials() {
    const defaults = [
      {
        name: 'Default',
        type: 'standard',
        color: { r: 0.8, g: 0.8, b: 0.8 },
        roughness: 0.5,
        metalness: 0
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
        metalness: 0
      },
      {
        name: 'Glass',
        type: 'physical',
        color: { r: 1, g: 1, b: 1 },
        opacity: 0.3,
        transparent: true,
        roughness: 0,
        metalness: 0,
        customProperties: {
          clearcoat: 1,
          clearcoatRoughness: 0
        }
      },
      {
        name: 'Wireframe',
        type: 'basic',
        color: { r: 0, g: 0, b: 0 },
        wireframe: true
      }
    ];

    defaults.forEach(materialData => {
      const material = new Material(materialData);
      this.defaultMaterials.set(material.name, material);
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
   */
  addMaterial(material) {
    this.materials.set(material.id, material);
    
    // Maintain max materials limit
    if (this.materials.size > this.maxMaterials) {
      const firstKey = this.materials.keys().next().value;
      this.materials.delete(firstKey);
    }

    this.notifyListeners('materialAdded', { material });
  }

  /**
   * Get material by ID
   * @param {string} id - Material ID
   * @returns {Material|null} Material or null
   */
  getMaterial(id) {
    return this.materials.get(id) || null;
  }

  /**
   * Get material by name
   * @param {string} name - Material name
   * @returns {Material|null} Material or null
   */
  getMaterialByName(name) {
    for (const material of this.materials.values()) {
      if (material.name === name) {
        return material;
      }
    }
    return null;
  }

  /**
   * Get all materials
   * @returns {Material[]} All materials
   */
  getAllMaterials() {
    return Array.from(this.materials.values());
  }

  /**
   * Get default materials
   * @returns {Material[]} Default materials
   */
  getDefaultMaterials() {
    return Array.from(this.defaultMaterials.values());
  }

  /**
   * Update material
   * @param {string} id - Material ID
   * @param {Object} updates - Updates to apply
   * @returns {boolean} Success status
   */
  updateMaterial(id, updates) {
    const material = this.getMaterial(id);
    if (!material) {return false;}

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
    if (!material) {return false;}

    this.materials.delete(id);
    this.notifyListeners('materialDeleted', { material });
    return true;
  }

  /**
   * Clone material
   * @param {string} id - Material ID
   * @returns {Material|null} Cloned material or null
   */
  cloneMaterial(id) {
    const material = this.getMaterial(id);
    if (!material) {return null;}

    const cloned = material.clone();
    this.addMaterial(cloned);
    return cloned;
  }

  /**
   * Create material from Three.js material
   * @param {THREE.Material} threeMaterial - Three.js material
   * @param {string} name - Material name
   * @returns {Material} Created material
   */
  createFromThreeJS(threeMaterial, name = 'Imported') {
    const options = {
      name,
      type: this.getMaterialType(threeMaterial),
      color: {
        r: threeMaterial.color.r,
        g: threeMaterial.color.g,
        b: threeMaterial.color.b
      },
      opacity: threeMaterial.opacity,
      transparent: threeMaterial.transparent,
      wireframe: threeMaterial.wireframe,
      doubleSided: threeMaterial.side === window.THREE.DoubleSide
    };

    // Add type-specific properties
    if (threeMaterial.roughness !== undefined) {
      options.roughness = threeMaterial.roughness;
    }
    if (threeMaterial.metalness !== undefined) {
      options.metalness = threeMaterial.metalness;
    }
    if (threeMaterial.shininess !== undefined) {
      options.shininess = threeMaterial.shininess;
    }
    if (threeMaterial.emissive) {
      options.emissive = threeMaterial.emissiveIntensity;
      options.emissiveColor = {
        r: threeMaterial.emissive.r,
        g: threeMaterial.emissive.g,
        b: threeMaterial.emissive.b
      };
    }

    return this.createMaterial(options);
  }

  /**
   * Get material type from Three.js material
   * @param {THREE.Material} threeMaterial - Three.js material
   * @returns {string} Material type
   */
  getMaterialType(threeMaterial) {
    if (threeMaterial instanceof window.THREE.MeshBasicMaterial) {return 'basic';}
    if (threeMaterial instanceof window.THREE.MeshLambertMaterial) {return 'lambert';}
    if (threeMaterial instanceof window.THREE.MeshPhongMaterial) {return 'phong';}
    if (threeMaterial instanceof window.THREE.MeshStandardMaterial) {return 'standard';}
    if (threeMaterial instanceof window.THREE.MeshPhysicalMaterial) {return 'physical';}
    if (threeMaterial instanceof window.THREE.MeshToonMaterial) {return 'toon';}
    if (threeMaterial instanceof window.THREE.ShaderMaterial) {return 'shader';}
    return 'standard';
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
          console.error('Material listener error:', error);
        }
      }
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
      maxMaterials: this.maxMaterials,
      autoSave: this.autoSave
    };
  }
} 