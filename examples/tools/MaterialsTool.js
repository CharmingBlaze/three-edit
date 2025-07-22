/**
 * MaterialsTool - Handles material operations
 */

import * as THREE from 'three';

export default class MaterialsTool {
  constructor(editor) {
    this.editor = editor;
    this.materialPresets = this.createMaterialPresets();
    this.materialHelpers = [];
  }

  // Create material presets
  createMaterialPresets() {
    return {
      // Basic materials
      basic: {
        name: 'Basic Material',
        create: (options = {}) => new THREE.MeshBasicMaterial({
          color: options.color || 0xcccccc,
          transparent: options.transparent || false,
          opacity: options.opacity || 1.0,
          wireframe: options.wireframe || false,
          ...options
        })
      },
      standard: {
        name: 'Standard Material',
        create: (options = {}) => new THREE.MeshStandardMaterial({
          color: options.color || 0xcccccc,
          roughness: options.roughness || 0.5,
          metalness: options.metalness || 0.0,
          transparent: options.transparent || false,
          opacity: options.opacity || 1.0,
          ...options
        })
      },
      phong: {
        name: 'Phong Material',
        create: (options = {}) => new THREE.MeshPhongMaterial({
          color: options.color || 0xcccccc,
          shininess: options.shininess || 30,
          transparent: options.transparent || false,
          opacity: options.opacity || 1.0,
          ...options
        })
      },
      lambert: {
        name: 'Lambert Material',
        create: (options = {}) => new THREE.MeshLambertMaterial({
          color: options.color || 0xcccccc,
          transparent: options.transparent || false,
          opacity: options.opacity || 1.0,
          ...options
        })
      },
      toon: {
        name: 'Toon Material',
        create: (options = {}) => new THREE.MeshToonMaterial({
          color: options.color || 0xcccccc,
          transparent: options.transparent || false,
          opacity: options.opacity || 1.0,
          ...options
        })
      },
      physical: {
        name: 'Physical Material',
        create: (options = {}) => new THREE.MeshPhysicalMaterial({
          color: options.color || 0xcccccc,
          roughness: options.roughness || 0.5,
          metalness: options.metalness || 0.0,
          clearcoat: options.clearcoat || 0.0,
          clearcoatRoughness: options.clearcoatRoughness || 0.0,
          transparent: options.transparent || false,
          opacity: options.opacity || 1.0,
          ...options
        })
      },

      // Special materials
      wireframe: {
        name: 'Wireframe Material',
        create: (options = {}) => new THREE.MeshBasicMaterial({
          color: options.color || 0x000000,
          wireframe: true,
          transparent: options.transparent || false,
          opacity: options.opacity || 1.0,
          ...options
        })
      },
      transparent: {
        name: 'Transparent Material',
        create: (options = {}) => new THREE.MeshBasicMaterial({
          color: options.color || 0xcccccc,
          transparent: true,
          opacity: options.opacity || 0.5,
          ...options
        })
      },
      emissive: {
        name: 'Emissive Material',
        create: (options = {}) => new THREE.MeshBasicMaterial({
          color: options.color || 0x00ff00,
          emissive: options.emissive || options.color || 0x00ff00,
          emissiveIntensity: options.emissiveIntensity || 0.5,
          ...options
        })
      },
      matcap: {
        name: 'Matcap Material',
        create: (options = {}) => new THREE.MeshMatcapMaterial({
          ...options
        })
      },
      normal: {
        name: 'Normal Material',
        create: (options = {}) => new THREE.MeshNormalMaterial({
          ...options
        })
      },
      depth: {
        name: 'Depth Material',
        create: (options = {}) => new THREE.MeshDepthMaterial({
          ...options
        })
      },
      distance: {
        name: 'Distance Material',
        create: (options = {}) => new THREE.MeshDistanceMaterial({
          ...options
        })
      },

      // Common colors
      red: {
        name: 'Red Material',
        create: (options = {}) => new THREE.MeshStandardMaterial({
          color: 0xff0000,
          ...options
        })
      },
      green: {
        name: 'Green Material',
        create: (options = {}) => new THREE.MeshStandardMaterial({
          color: 0x00ff00,
          ...options
        })
      },
      blue: {
        name: 'Blue Material',
        create: (options = {}) => new THREE.MeshStandardMaterial({
          color: 0x0000ff,
          ...options
        })
      },
      yellow: {
        name: 'Yellow Material',
        create: (options = {}) => new THREE.MeshStandardMaterial({
          color: 0xffff00,
          ...options
        })
      },
      cyan: {
        name: 'Cyan Material',
        create: (options = {}) => new THREE.MeshStandardMaterial({
          color: 0x00ffff,
          ...options
        })
      },
      magenta: {
        name: 'Magenta Material',
        create: (options = {}) => new THREE.MeshStandardMaterial({
          color: 0xff00ff,
          ...options
        })
      },
      white: {
        name: 'White Material',
        create: (options = {}) => new THREE.MeshStandardMaterial({
          color: 0xffffff,
          ...options
        })
      },
      black: {
        name: 'Black Material',
        create: (options = {}) => new THREE.MeshStandardMaterial({
          color: 0x000000,
          ...options
        })
      },
      gray: {
        name: 'Gray Material',
        create: (options = {}) => new THREE.MeshStandardMaterial({
          color: 0x808080,
          ...options
        })
      }
    };
  }

  // Create material from preset
  createMaterialFromPreset(presetName, options = {}) {
    if (!this.materialPresets[presetName]) {
      console.error(`Material preset '${presetName}' not found`);
      return null;
    }

    try {
      return this.materialPresets[presetName].create(options);
    } catch (error) {
      console.error(`Failed to create material from preset '${presetName}':`, error);
      return null;
    }
  }

  // Apply material to object
  applyMaterial(object, material) {
    if (!object || !material) return false;

    try {
      if (Array.isArray(object.material)) {
        // Handle multi-material objects
        object.material = object.material.map(() => material.clone());
      } else {
        object.material = material;
      }
      return true;
    } catch (error) {
      console.error('Failed to apply material:', error);
      return false;
    }
  }

  // Apply material preset to object
  applyMaterialPreset(object, presetName, options = {}) {
    if (!object) return false;

    const material = this.createMaterialFromPreset(presetName, options);
    if (!material) return false;

    return this.applyMaterial(object, material);
  }

  // Clone material
  cloneMaterial(material) {
    if (!material) return null;

    try {
      return material.clone();
    } catch (error) {
      console.error('Failed to clone material:', error);
      return null;
    }
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

    try {
      if (material[property] !== undefined) {
        material[property] = value;
        material.needsUpdate = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to set material property '${property}':`, error);
      return false;
    }
  }

  // Get material property
  getMaterialProperty(material, property) {
    if (!material) return null;
    return material[property];
  }

  // Set material color
  setMaterialColor(material, color) {
    if (!material) return false;

    try {
      const colorObj = new THREE.Color(color);
      return this.setMaterialProperty(material, 'color', colorObj);
    } catch (error) {
      console.error('Failed to set material color:', error);
      return false;
    }
  }

  // Set material opacity
  setMaterialOpacity(material, opacity) {
    if (!material) return false;

    try {
      this.setMaterialProperty(material, 'opacity', opacity);
      this.setMaterialProperty(material, 'transparent', opacity < 1.0);
      return true;
    } catch (error) {
      console.error('Failed to set material opacity:', error);
      return false;
    }
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
    if (!material) return false;

    try {
      const colorObj = new THREE.Color(color);
      this.setMaterialProperty(material, 'emissive', colorObj);
      this.setMaterialProperty(material, 'emissiveIntensity', intensity);
      return true;
    } catch (error) {
      console.error('Failed to set material emissive:', error);
      return false;
    }
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
    if (!texture) return null;

    try {
      const material = this.createMaterialFromPreset(type, options);
      if (material) {
        material.map = texture;
        return material;
      }
      return null;
    } catch (error) {
      console.error('Failed to create material from texture:', error);
      return null;
    }
  }

  // Create material from color map
  createMaterialFromColorMap(colorMap, type = 'standard', options = {}) {
    if (!colorMap || !colorMap.data) return null;

    try {
      const texture = new THREE.DataTexture(
        colorMap.data,
        colorMap.width,
        colorMap.height,
        THREE.RGBAFormat
      );
      texture.needsUpdate = true;
      return this.createMaterialFromTexture(texture, type, options);
    } catch (error) {
      console.error('Failed to create material from color map:', error);
      return null;
    }
  }

  // Get material statistics
  getMaterialStatistics(material) {
    if (!material) return null;

    try {
      const stats = {
        type: material.type,
        color: material.color ? material.color.getHexString() : null,
        transparent: material.transparent || false,
        opacity: material.opacity || 1.0,
        wireframe: material.wireframe || false,
        side: material.side || THREE.FrontSide
      };

      // Add type-specific properties
      if (material.roughness !== undefined) {
        stats.roughness = material.roughness;
      }
      if (material.metalness !== undefined) {
        stats.metalness = material.metalness;
      }
      if (material.emissive) {
        stats.emissive = material.emissive.getHexString();
        stats.emissiveIntensity = material.emissiveIntensity || 0.0;
      }
      if (material.shininess !== undefined) {
        stats.shininess = material.shininess;
      }

      return stats;
    } catch (error) {
      console.error('Failed to get material statistics:', error);
      return null;
    }
  }

  // Create material helper
  createMaterialHelper(material, size = 1.0) {
    if (!material) return null;

    try {
      const geometry = new THREE.BoxGeometry(size, size, size);
      const mesh = new THREE.Mesh(geometry, material);
      
      this.materialHelpers.push(mesh);
      this.editor.scene.add(mesh);
      return mesh;
    } catch (error) {
      console.error('Failed to create material helper:', error);
      return null;
    }
  }

  // Remove material helper
  removeMaterialHelper(helper) {
    const index = this.materialHelpers.indexOf(helper);
    if (index !== -1) {
      this.materialHelpers.splice(index, 1);
      this.editor.scene.remove(helper);
      return true;
    }
    return false;
  }

  // Clear all material helpers
  clearMaterialHelpers() {
    this.materialHelpers.forEach(helper => {
      this.editor.scene.remove(helper);
    });
    this.materialHelpers = [];
  }

  // Get available material presets
  getAvailablePresets() {
    return Object.keys(this.materialPresets);
  }

  // Get preset info
  getPresetInfo(presetName) {
    if (!this.materialPresets[presetName]) return null;
    
    return {
      name: this.materialPresets[presetName].name,
      type: presetName
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
      'createFromPreset', 'applyPreset', 'clone', 'merge',
      'setColor', 'setOpacity', 'setRoughness', 'setMetalness',
      'setEmissive', 'setWireframe', 'setSide'
    ];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      createFromPreset: 'Create material from preset',
      applyPreset: 'Apply material preset to objects',
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
