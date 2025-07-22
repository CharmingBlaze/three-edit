/**
 * @fileoverview Material class for 3D Editor
 * Represents a material with properties, textures, and Three.js integration
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
    let material;

    switch (this.type) {
      case 'standard':
        material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(this.color.r, this.color.g, this.color.b),
          opacity: this.opacity,
          transparent: this.transparent,
          roughness: this.roughness,
          metalness: this.metalness,
          emissive: new THREE.Color(this.emissiveColor.r, this.emissiveColor.g, this.emissiveColor.b),
          emissiveIntensity: this.emissive,
          wireframe: this.wireframe,
          side: this.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
        break;

      case 'phong':
        material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(this.color.r, this.color.g, this.color.b),
          opacity: this.opacity,
          transparent: this.transparent,
          shininess: this.shininess,
          reflectivity: this.reflectivity,
          wireframe: this.wireframe,
          side: this.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
        break;

      case 'basic':
        material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(this.color.r, this.color.g, this.color.b),
          opacity: this.opacity,
          transparent: this.transparent,
          wireframe: this.wireframe,
          side: this.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
        break;

      case 'lambert':
        material = new THREE.MeshLambertMaterial({
          color: new THREE.Color(this.color.r, this.color.g, this.color.b),
          opacity: this.opacity,
          transparent: this.transparent,
          emissive: new THREE.Color(this.emissiveColor.r, this.emissiveColor.g, this.emissiveColor.b),
          emissiveIntensity: this.emissive,
          wireframe: this.wireframe,
          side: this.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
        break;

      default:
        material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(this.color.r, this.color.g, this.color.b),
          opacity: this.opacity,
          transparent: this.transparent,
          wireframe: this.wireframe,
          side: this.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    }

    // Apply textures if available
    this.applyTextures(material);

    return material;
  }

  /**
   * Apply textures to Three.js material
   * @param {THREE.Material} material - Three.js material
   */
  applyTextures(material) {
    if (this.textures.diffuse) {
      material.map = this.textures.diffuse;
    }
    if (this.textures.normal) {
      material.normalMap = this.textures.normal;
    }
    if (this.textures.roughness) {
      material.roughnessMap = this.textures.roughness;
    }
    if (this.textures.metalness) {
      material.metalnessMap = this.textures.metalness;
    }
    if (this.textures.emissive) {
      material.emissiveMap = this.textures.emissive;
    }
    if (this.textures.ao) {
      material.aoMap = this.textures.ao;
    }
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
      wireframe: this.wireframe,
      doubleSided: this.doubleSided,
      textureCount: Object.keys(this.textures).length
    };
  }

  /**
   * Validate material
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Check required properties
    if (!this.name || this.name.trim() === '') {
      errors.push('Material name is required');
    }

    if (!this.type) {
      errors.push('Material type is required');
    }

    // Check color values
    if (this.color.r < 0 || this.color.r > 1 || 
        this.color.g < 0 || this.color.g > 1 || 
        this.color.z < 0 || this.color.b > 1) {
      errors.push('Color values must be between 0 and 1');
    }

    // Check opacity
    if (this.opacity < 0 || this.opacity > 1) {
      errors.push('Opacity must be between 0 and 1');
    }

    // Check roughness and metalness
    if (this.roughness < 0 || this.roughness > 1) {
      errors.push('Roughness must be between 0 and 1');
    }

    if (this.metalness < 0 || this.metalness > 1) {
      errors.push('Metalness must be between 0 and 1');
    }

    // Check shininess
    if (this.shininess < 0) {
      errors.push('Shininess must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 