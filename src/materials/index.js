/**
 * @fileoverview Materials System Index
 * Centralized exports for all materials functionality
 */

// Core material classes
export { Material } from './core/Material.js';
export { MaterialManager } from './core/MaterialManager.js';

// Material utilities and constants
export const MaterialTypes = {
  STANDARD: 'standard',
  PHONG: 'phong',
  BASIC: 'basic',
  LAMBERT: 'lambert'
};

export const MaterialProperties = {
  COLOR: 'color',
  OPACITY: 'opacity',
  TRANSPARENT: 'transparent',
  ROUGHNESS: 'roughness',
  METALNESS: 'metalness',
  EMISSIVE: 'emissive',
  SHININESS: 'shininess',
  WIREFRAME: 'wireframe',
  DOUBLE_SIDED: 'doubleSided'
}; 