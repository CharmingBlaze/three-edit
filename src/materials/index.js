/**
 * @fileoverview Materials System
 * Provides comprehensive material management for the 3D editor
 */

import { MaterialManager } from './MaterialManager.js';
import { Material } from './Material.js';

/**
 * Create a material manager with default settings
 * @param {Object} options - Configuration options
 * @returns {MaterialManager} Material manager instance
 */
export function createMaterialManager(options = {}) {
  return new MaterialManager(options);
}

/**
 * Predefined material types
 */
export const MaterialTypes = {
  BASIC: 'basic',
  LAMBERT: 'lambert',
  PHONG: 'phong',
  STANDARD: 'standard',
  PHYSICAL: 'physical',
  TOON: 'toon',
  SHADER: 'shader'
};

/**
 * Create a basic material
 * @param {Object} options - Material options
 * @returns {Material} Basic material
 */
export function createBasicMaterial(options = {}) {
  return new Material({
    type: MaterialTypes.BASIC,
    ...options
  });
}

/**
 * Create a standard material
 * @param {Object} options - Material options
 * @returns {Material} Standard material
 */
export function createStandardMaterial(options = {}) {
  return new Material({
    type: MaterialTypes.STANDARD,
    ...options
  });
}

/**
 * Create a metal material
 * @param {Object} options - Material options
 * @returns {Material} Metal material
 */
export function createMetalMaterial(options = {}) {
  return new Material({
    type: MaterialTypes.STANDARD,
    color: { r: 0.7, g: 0.7, b: 0.7 },
    roughness: 0.1,
    metalness: 0.9,
    ...options
  });
}

/**
 * Create a plastic material
 * @param {Object} options - Material options
 * @returns {Material} Plastic material
 */
export function createPlasticMaterial(options = {}) {
  return new Material({
    type: MaterialTypes.STANDARD,
    color: { r: 0.9, g: 0.9, b: 0.9 },
    roughness: 0.8,
    metalness: 0,
    ...options
  });
}

/**
 * Create a glass material
 * @param {Object} options - Material options
 * @returns {Material} Glass material
 */
export function createGlassMaterial(options = {}) {
  return new Material({
    type: MaterialTypes.PHYSICAL,
    color: { r: 1, g: 1, b: 1 },
    opacity: 0.3,
    transparent: true,
    roughness: 0,
    metalness: 0,
    customProperties: {
      clearcoat: 1,
      clearcoatRoughness: 0
    },
    ...options
  });
}

/**
 * Create a wireframe material
 * @param {Object} options - Material options
 * @returns {Material} Wireframe material
 */
export function createWireframeMaterial(options = {}) {
  return new Material({
    type: MaterialTypes.BASIC,
    color: { r: 0, g: 0, b: 0 },
    wireframe: true,
    ...options
  });
}

/**
 * Create a shader material
 * @param {Object} options - Material options
 * @param {string} options.vertexShader - Vertex shader code
 * @param {string} options.fragmentShader - Fragment shader code
 * @param {Object} options.uniforms - Shader uniforms
 * @returns {Material} Shader material
 */
export function createShaderMaterial(options = {}) {
  const { vertexShader, fragmentShader, uniforms, ...otherOptions } = options;
  
  return new Material({
    type: MaterialTypes.SHADER,
    customProperties: {
      vertexShader: vertexShader || '',
      fragmentShader: fragmentShader || '',
      uniforms: uniforms || {}
    },
    ...otherOptions
  });
}

/**
 * Utility function to create material from color
 * @param {Object} color - Color object {r, g, b}
 * @param {string} type - Material type
 * @param {Object} options - Additional options
 * @returns {Material} Material with specified color
 */
export function createMaterialFromColor(color, type = MaterialTypes.STANDARD, options = {}) {
  return new Material({
    type,
    color,
    ...options
  });
}

/**
 * Utility function to create material from hex color
 * @param {string} hexColor - Hex color string
 * @param {string} type - Material type
 * @param {Object} options - Additional options
 * @returns {Material} Material with specified color
 */
export function createMaterialFromHex(hexColor, type = MaterialTypes.STANDARD, options = {}) {
  const color = hexToRgb(hexColor);
  return createMaterialFromColor(color, type, options);
}

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color string
 * @returns {Object} RGB color object
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB color to hex
 * @param {Object} rgb - RGB color object
 * @returns {string} Hex color string
 */
export function rgbToHex(rgb) {
  const r = Math.round(rgb.r * 255);
  const g = Math.round(rgb.g * 255);
  const b = Math.round(rgb.b * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Get material type information
 * @param {string} type - Material type
 * @returns {Object} Material type information
 */
export function getMaterialTypeInfo(type) {
  const typeInfo = {
    [MaterialTypes.BASIC]: {
      name: 'Basic',
      description: 'Simple material without lighting',
      supports: ['color', 'opacity', 'transparent', 'wireframe']
    },
    [MaterialTypes.LAMBERT]: {
      name: 'Lambert',
      description: 'Diffuse material with basic lighting',
      supports: ['color', 'opacity', 'transparent', 'emissive']
    },
    [MaterialTypes.PHONG]: {
      name: 'Phong',
      description: 'Material with specular highlights',
      supports: ['color', 'opacity', 'transparent', 'emissive', 'shininess']
    },
    [MaterialTypes.STANDARD]: {
      name: 'Standard',
      description: 'Physically based material',
      supports: ['color', 'opacity', 'transparent', 'roughness', 'metalness', 'emissive']
    },
    [MaterialTypes.PHYSICAL]: {
      name: 'Physical',
      description: 'Advanced physically based material',
      supports: ['color', 'opacity', 'transparent', 'roughness', 'metalness', 'emissive', 'clearcoat']
    },
    [MaterialTypes.TOON]: {
      name: 'Toon',
      description: 'Cel-shaded material',
      supports: ['color', 'opacity', 'transparent']
    },
    [MaterialTypes.SHADER]: {
      name: 'Shader',
      description: 'Custom shader material',
      supports: ['custom']
    }
  };

  return typeInfo[type] || typeInfo[MaterialTypes.STANDARD];
}

/**
 * Get all material types
 * @returns {Object} All material types with information
 */
export function getAllMaterialTypes() {
  return Object.values(MaterialTypes).reduce((acc, type) => {
    acc[type] = getMaterialTypeInfo(type);
    return acc;
  }, {});
} 