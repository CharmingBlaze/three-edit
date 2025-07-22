/**
 * MaterialTool - Handles material operations
 */

import * as THREE from 'three';

export default class MaterialTool {
  constructor(editor) {
    this.editor = editor;
    this.materialPresets = this.createMaterialPresets();
  }

  // Create material presets
  createMaterialPresets() {
    return {
      // Basic materials
      basic: {
        name: 'Basic Material',
        create: (color = 0xcccccc) => new THREE.MeshBasicMaterial({ color })
      },
      standard: {
        name: 'Standard Material',
        create: (color = 0xcccccc) => new THREE.MeshStandardMaterial({ color })
      },
      phong: {
        name: 'Phong Material',
        create: (color = 0xcccccc) => new THREE.MeshPhongMaterial({ color })
      },
      lambert: {
        name: 'Lambert Material',
        create: (color = 0xcccccc) => new THREE.MeshLambertMaterial({ color })
      },
      toon: {
        name: 'Toon Material',
        create: (color = 0xcccccc) => new THREE.MeshToonMaterial({ color })
      },
      physical: {
        name: 'Physical Material',
        create: (color = 0xcccccc) => new THREE.MeshPhysicalMaterial({ color })
      },

      // Special materials
      wireframe: {
        name: 'Wireframe Material',
        create: (color = 0x000000) => new THREE.MeshBasicMaterial({ 
          color, 
          wireframe: true 
        })
      },
      transparent: {
        name: 'Transparent Material',
        create: (color = 0xcccccc, opacity = 0.5) => new THREE.MeshBasicMaterial({ 
          color, 
          transparent: true, 
          opacity 
        })
      },
      emissive: {
        name: 'Emissive Material',
        create: (color = 0x00ff00) => new THREE.MeshBasicMaterial({ 
          color, 
          emissive: color,
          emissiveIntensity: 0.5
        })
      },
      matcap: {
        name: 'Matcap Material',
        create: () => new THREE.MeshMatcapMaterial()
      },
      normal: {
        name: 'Normal Material',
        create: () => new THREE.MeshNormalMaterial()
      },
      depth: {
        name: 'Depth Material',
        create: () => new THREE.MeshDepthMaterial()
      },
      distance: {
        name: 'Distance Material',
        create: () => new THREE.MeshDistanceMaterial()
      },

      // Common colors
      red: {
        name: 'Red Material',
        create: () => new THREE.MeshStandardMaterial({ color: 0xff0000 })
      },
      green: {
        name: 'Green Material',
        create: () => new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      },
      blue: {
        name: 'Blue Material',
        create: () => new THREE.MeshStandardMaterial({ color: 0x0000ff })
      },
      yellow: {
        name: 'Yellow Material',
        create: () => new THREE.MeshStandardMaterial({ color: 0xffff00 })
      },
      cyan: {
        name: 'Cyan Material',
        create: () => new THREE.MeshStandardMaterial({ color: 0x00ffff })
      },
      magenta: {
        name: 'Magenta Material',
        create: () => new THREE.MeshStandardMaterial({ color: 0xff00ff })
      },
      white: {
        name: 'White Material',
        create: () => new THREE.MeshStandardMaterial({ color: 0xffffff })
      },
      black: {
        name: 'Black Material',
        create: () => new THREE.MeshStandardMaterial({ color: 0x000000 })
      },
      gray: {
        name: 'Gray Material',
        create: () => new THREE.MeshStandardMaterial({ color: 0x808080 })
      }
    };
  }

  // Apply material to object
  applyMaterial(object, material) {
    if (!object) return false;

    if (Array.isArray(object.material)) {
      // Handle multi-material objects
      object.material = object.material.map(() => material.clone());
    } else {
      object.material = material;
    }

    return true;
  }

  // Apply material preset to object
  applyMaterialPreset(object, presetName, options = {}) {
    if (!object || !this.materialPresets[presetName]) return false;

    const preset = this.materialPresets[presetName];
    const material = preset.create(options.color, options.opacity);
    
    return this.applyMaterial(object, material);
  }

  // Create custom material
  createCustomMaterial(type = 'standard', options = {}) {
    const defaultOptions = {
      color: 0xcccccc,
      transparent: false,
      opacity: 1.0,
      wireframe: false,
      side: THREE.FrontSide,
      ...options
    };

    let material;

    switch (type.toLowerCase()) {
      case 'basic':
        material = new THREE.MeshBasicMaterial(defaultOptions);
        break;
      case 'standard':
        material = new THREE.MeshStandardMaterial(defaultOptions);
        break;
      case 'phong':
        material = new THREE.MeshPhongMaterial(defaultOptions);
        break;
      case 'lambert':
        material = new THREE.MeshLambertMaterial(defaultOptions);
        break;
      case 'toon':
        material = new THREE.MeshToonMaterial(defaultOptions);
        break;
      case 'physical':
        material = new THREE.MeshPhysicalMaterial(defaultOptions);
        break;
      case 'matcap':
        material = new THREE.MeshMatcapMaterial(defaultOptions);
        break;
      case 'normal':
        material = new THREE.MeshNormalMaterial(defaultOptions);
        break;
      case 'depth':
        material = new THREE.MeshDepthMaterial(defaultOptions);
        break;
      case 'distance':
        material = new THREE.MeshDistanceMaterial(defaultOptions);
        break;
      default:
        material = new THREE.MeshStandardMaterial(defaultOptions);
    }

    return material;
  }

  // Clone material
  cloneMaterial(material) {
    if (!material) return null;
    return material.clone();
  }

  // Merge materials
  mergeMaterials(materials) {
    if (!materials || materials.length === 0) return null;

    // For now, return the first material
    // In a more complex implementation, you might want to blend materials
    return materials[0].clone();
  }

  // Set material property
  setMaterialProperty(material, property, value) {
    if (!material) return false;

    if (material[property] !== undefined) {
      material[property] = value;
      material.needsUpdate = true;
      return true;
    }

    return false;
  }

  // Get material property
  getMaterialProperty(material, property) {
    if (!material) return null;
    return material[property];
  }

  // Set material color
  setMaterialColor(material, color) {
    return this.setMaterialProperty(material, 'color', new THREE.Color(color));
  }

  // Set material opacity
  setMaterialOpacity(material, opacity) {
    this.setMaterialProperty(material, 'opacity', opacity);
    this.setMaterialProperty(material, 'transparent', opacity < 1.0);
    return true;
  }

  // Set material roughness
  setMaterialRoughness(material, roughness) {
    return this.setMaterialProperty(material, 'roughness', roughness);
  }

  // Set material metalness
  setMaterialMetalness(material, metalness) {
    return this.setMaterialProperty(material, 'metalness', metalness);
  }

  // Set material emissive
  setMaterialEmissive(material, color, intensity = 1.0) {
    this.setMaterialProperty(material, 'emissive', new THREE.Color(color));
    this.setMaterialProperty(material, 'emissiveIntensity', intensity);
    return true;
  }

  // Set material wireframe
  setMaterialWireframe(material, wireframe) {
    return this.setMaterialProperty(material, 'wireframe', wireframe);
  }

  // Set material side
  setMaterialSide(material, side) {
    let sideValue;
    switch (side.toLowerCase()) {
      case 'front':
        sideValue = THREE.FrontSide;
        break;
      case 'back':
        sideValue = THREE.BackSide;
        break;
      case 'double':
        sideValue = THREE.DoubleSide;
        break;
      default:
        sideValue = THREE.FrontSide;
    }
    return this.setMaterialProperty(material, 'side', sideValue);
  }

  // Create material from texture
  createMaterialFromTexture(texture, type = 'standard', options = {}) {
    const material = this.createCustomMaterial(type, options);
    material.map = texture;
    return material;
  }

  // Create material from color map
  createMaterialFromColorMap(colorMap, type = 'standard', options = {}) {
    const texture = new THREE.DataTexture(
      colorMap.data,
      colorMap.width,
      colorMap.height,
      THREE.RGBAFormat
    );
    texture.needsUpdate = true;
    return this.createMaterialFromTexture(texture, type, options);
  }

  // Get material statistics
  getMaterialStatistics(material) {
    if (!material) return null;

    return {
      type: material.type,
      color: material.color ? material.color.getHexString() : null,
      transparent: material.transparent || false,
      opacity: material.opacity || 1.0,
      wireframe: material.wireframe || false,
      side: material.side || THREE.FrontSide,
      roughness: material.roughness || 0.5,
      metalness: material.metalness || 0.0,
      emissive: material.emissive ? material.emissive.getHexString() : null,
      emissiveIntensity: material.emissiveIntensity || 0.0
    };
  }

  // Apply material operations to selected objects
  applyToSelected(operation, ...args) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const results = [];

    selected.forEach(obj => {
      let success = false;
      
      switch (operation) {
        case 'applyPreset':
          success = this.applyMaterialPreset(obj, ...args);
          break;
        case 'setColor':
          if (obj.material) {
            success = this.setMaterialColor(obj.material, ...args);
          }
          break;
        case 'setOpacity':
          if (obj.material) {
            success = this.setMaterialOpacity(obj.material, ...args);
          }
          break;
        case 'setRoughness':
          if (obj.material) {
            success = this.setMaterialRoughness(obj.material, ...args);
          }
          break;
        case 'setMetalness':
          if (obj.material) {
            success = this.setMaterialMetalness(obj.material, ...args);
          }
          break;
        case 'setEmissive':
          if (obj.material) {
            success = this.setMaterialEmissive(obj.material, ...args);
          }
          break;
        case 'setWireframe':
          if (obj.material) {
            success = this.setMaterialWireframe(obj.material, ...args);
          }
          break;
        case 'setSide':
          if (obj.material) {
            success = this.setMaterialSide(obj.material, ...args);
          }
          break;
      }

      results.push({ object: obj, success });
    });

    return results;
  }

  // Get supported material operations
  getSupportedOperations() {
    return [
      'applyPreset', 'createCustom', 'clone', 'merge', 
      'setColor', 'setOpacity', 'setRoughness', 'setMetalness',
      'setEmissive', 'setWireframe', 'setSide'
    ];
  }

  // Get available material presets
  getAvailablePresets() {
    return Object.keys(this.materialPresets);
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      applyPreset: 'Apply material preset to objects',
      createCustom: 'Create custom material',
      clone: 'Clone material',
      merge: 'Merge materials',
      setColor: 'Set material color',
      setOpacity: 'Set material opacity',
      setRoughness: 'Set material roughness',
      setMetalness: 'Set material metalness',
      setEmissive: 'Set material emissive',
      setWireframe: 'Set material wireframe',
      setSide: 'Set material side'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }
} 