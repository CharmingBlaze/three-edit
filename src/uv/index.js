/**
 * @fileoverview UV System
 * Provides comprehensive UV coordinate management for the 3D editor
 */

import { UVManager } from './UVManager.js';
import { UV } from './UV.js';

/**
 * Create a UV manager with default settings
 * @param {Object} options - Configuration options
 * @returns {UVManager} UV manager instance
 */
export function createUVManager(options = {}) {
  return new UVManager(options);
}

/**
 * UV mapping types
 */
export const UVMappingTypes = {
  PLANAR: 'planar',
  SPHERICAL: 'spherical',
  CYLINDRICAL: 'cylindrical',
  BOX: 'box',
  TRIPLANAR: 'triplanar'
};

/**
 * Generate planar UV mapping
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} parameters - Mapping parameters
 * @returns {boolean} Success status
 */
export function generatePlanarUVs(mesh, parameters = {}) {
  const manager = new UVManager();
  return manager.generatePlanarUVs(mesh, parameters);
}

/**
 * Generate spherical UV mapping
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} parameters - Mapping parameters
 * @returns {boolean} Success status
 */
export function generateSphericalUVs(mesh, parameters = {}) {
  const manager = new UVManager();
  return manager.generateSphericalUVs(mesh, parameters);
}

/**
 * Generate cylindrical UV mapping
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} parameters - Mapping parameters
 * @returns {boolean} Success status
 */
export function generateCylindricalUVs(mesh, parameters = {}) {
  const manager = new UVManager();
  return manager.generateCylindricalUVs(mesh, parameters);
}

/**
 * Generate box UV mapping
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} parameters - Mapping parameters
 * @returns {boolean} Success status
 */
export function generateBoxUVs(mesh, parameters = {}) {
  const manager = new UVManager();
  return manager.generateBoxUVs(mesh, parameters);
}

/**
 * Transform UV coordinates
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} transform - Transform parameters
 * @returns {boolean} Success status
 */
export function transformUVs(mesh, transform = {}) {
  const manager = new UVManager();
  return manager.transformUVs(mesh, transform);
}

/**
 * Pack UV coordinates
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} options - Packing options
 * @returns {boolean} Success status
 */
export function packUVs(mesh, options = {}) {
  const manager = new UVManager();
  return manager.packUVs(mesh, options);
}

/**
 * Validate UV coordinates
 * @param {EditableMesh} mesh - Target mesh
 * @returns {Object} Validation result
 */
export function validateUVs(mesh) {
  const manager = new UVManager();
  return manager.validateUVs(mesh);
}

/**
 * Create UV coordinate
 * @param {number} u - U coordinate
 * @param {number} v - V coordinate
 * @param {string} vertexId - Associated vertex ID
 * @param {Object} options - Additional options
 * @returns {UV} UV coordinate
 */
export function createUV(u, v, vertexId, options = {}) {
  return new UV(u, v, vertexId, options);
}

/**
 * Get UV mapping type information
 * @param {string} type - Mapping type
 * @returns {Object} Mapping type information
 */
export function getUVMappingInfo(type) {
  const mappingInfo = {
    [UVMappingTypes.PLANAR]: {
      name: 'Planar',
      description: 'Project vertices onto a plane',
      parameters: ['axis', 'offset', 'scale'],
      bestFor: ['Flat surfaces', 'Simple geometry']
    },
    [UVMappingTypes.SPHERICAL]: {
      name: 'Spherical',
      description: 'Map vertices to a sphere',
      parameters: ['center', 'radius'],
      bestFor: ['Spherical objects', 'Organic shapes']
    },
    [UVMappingTypes.CYLINDRICAL]: {
      name: 'Cylindrical',
      description: 'Map vertices to a cylinder',
      parameters: ['center', 'axis'],
      bestFor: ['Cylindrical objects', 'Pipes and tubes']
    },
    [UVMappingTypes.BOX]: {
      name: 'Box',
      description: 'Map vertices to a box',
      parameters: [],
      bestFor: ['Box-like objects', 'Architecture']
    },
    [UVMappingTypes.TRIPLANAR]: {
      name: 'Triplanar',
      description: 'Use three planar projections',
      parameters: ['scale'],
      bestFor: ['Complex geometry', 'Terrain']
    }
  };

  return mappingInfo[type] || mappingInfo[UVMappingTypes.PLANAR];
}

/**
 * Get all UV mapping types
 * @returns {Object} All mapping types with information
 */
export function getAllUVMappingTypes() {
  return Object.values(UVMappingTypes).reduce((acc, type) => {
    acc[type] = getUVMappingInfo(type);
    return acc;
  }, {});
}

/**
 * Utility function to create UV from Three.js UV
 * @param {THREE.Vector2} threeUV - Three.js UV coordinate
 * @param {string} vertexId - Associated vertex ID
 * @returns {UV} UV coordinate
 */
export function createFromThreeJS(threeUV, vertexId) {
  return new UV(threeUV.x, threeUV.y, vertexId);
}

/**
 * Utility function to convert UV to Three.js Vector2
 * @param {UV} uv - UV coordinate
 * @returns {THREE.Vector2} Three.js Vector2
 */
export function toThreeJS(uv) {
  const THREE = window.THREE;
  if (!THREE) {
    console.error('Three.js not available');
    return null;
  }
  
  return new THREE.Vector2(uv.u, uv.v);
} 