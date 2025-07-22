/**
 * Tool utilities - Helper functions for tool operations
 */

import * as THREE from 'three';

/**
 * Get object bounds
 * @param {THREE.Object3D} object - The object to get bounds for
 * @returns {THREE.Box3} Bounding box
 */
export function getObjectBounds(object) {
  const box = new THREE.Box3();
  box.setFromObject(object);
  return box;
}

/**
 * Get object center
 * @param {THREE.Object3D} object - The object to get center for
 * @returns {THREE.Vector3} Object center
 */
export function getObjectCenter(object) {
  const box = getObjectBounds(object);
  const center = new THREE.Vector3();
  box.getCenter(center);
  return center;
}

/**
 * Get object size
 * @param {THREE.Object3D} object - The object to get size for
 * @returns {THREE.Vector3} Object size
 */
export function getObjectSize(object) {
  const box = getObjectBounds(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  return size;
}

/**
 * Check if object is selected
 * @param {THREE.Object3D} object - The object to check
 * @param {Array} selectedObjects - Array of selected objects
 * @returns {boolean} True if object is selected
 */
export function isObjectSelected(object, selectedObjects) {
  return selectedObjects.includes(object);
}

/**
 * Get objects by type
 * @param {Array} objects - Array of objects
 * @param {string} type - Object type to filter by
 * @returns {Array} Filtered objects
 */
export function getObjectsByType(objects, type) {
  return objects.filter(obj => obj.type === type);
}

/**
 * Get objects by geometry type
 * @param {Array} objects - Array of objects
 * @param {string} geometryType - Geometry type to filter by
 * @returns {Array} Filtered objects
 */
export function getObjectsByGeometryType(objects, geometryType) {
  return objects.filter(obj => obj.geometry && obj.geometry.type === geometryType);
}

/**
 * Clone object with transformations
 * @param {THREE.Object3D} object - Object to clone
 * @returns {THREE.Object3D} Cloned object
 */
export function cloneObject(object) {
  const clone = object.clone();
  clone.position.copy(object.position);
  clone.rotation.copy(object.rotation);
  clone.scale.copy(object.scale);
  return clone;
}

/**
 * Apply transformation to object
 * @param {THREE.Object3D} object - Object to transform
 * @param {THREE.Matrix4} matrix - Transformation matrix
 */
export function applyTransformation(object, matrix) {
  object.applyMatrix4(matrix);
}

/**
 * Reset object transformations
 * @param {THREE.Object3D} object - Object to reset
 */
export function resetTransformations(object) {
  object.position.set(0, 0, 0);
  object.rotation.set(0, 0, 0);
  object.scale.set(1, 1, 1);
}

/**
 * Snap object to grid
 * @param {THREE.Object3D} object - Object to snap
 * @param {number} gridSize - Grid size
 */
export function snapToGrid(object, gridSize = 1) {
  object.position.x = Math.round(object.position.x / gridSize) * gridSize;
  object.position.y = Math.round(object.position.y / gridSize) * gridSize;
  object.position.z = Math.round(object.position.z / gridSize) * gridSize;
}

/**
 * Snap object to angle
 * @param {THREE.Object3D} object - Object to snap
 * @param {number} angleStep - Angle step in radians
 */
export function snapToAngle(object, angleStep = Math.PI / 4) {
  object.rotation.x = Math.round(object.rotation.x / angleStep) * angleStep;
  object.rotation.y = Math.round(object.rotation.y / angleStep) * angleStep;
  object.rotation.z = Math.round(object.rotation.z / angleStep) * angleStep;
}

/**
 * Get distance between objects
 * @param {THREE.Object3D} objectA - First object
 * @param {THREE.Object3D} objectB - Second object
 * @returns {number} Distance between objects
 */
export function getDistanceBetweenObjects(objectA, objectB) {
  return objectA.position.distanceTo(objectB.position);
}

/**
 * Get angle between objects
 * @param {THREE.Object3D} objectA - First object
 * @param {THREE.Object3D} objectB - Second object
 * @returns {number} Angle between objects
 */
export function getAngleBetweenObjects(objectA, objectB) {
  const direction = new THREE.Vector3().subVectors(objectB.position, objectA.position);
  return Math.atan2(direction.z, direction.x);
}

/**
 * Create preview material
 * @param {THREE.Material} originalMaterial - Original material
 * @returns {THREE.Material} Preview material
 */
export function createPreviewMaterial(originalMaterial) {
  const previewMaterial = originalMaterial.clone();
  previewMaterial.transparent = true;
  previewMaterial.opacity = 0.5;
  return previewMaterial;
}

/**
 * Create wireframe material
 * @param {string} color - Wireframe color
 * @returns {THREE.Material} Wireframe material
 */
export function createWireframeMaterial(color = 0x00ff00) {
  return new THREE.MeshBasicMaterial({
    color: color,
    wireframe: true
  });
}

/**
 * Create selection material
 * @param {string} color - Selection color
 * @returns {THREE.Material} Selection material
 */
export function createSelectionMaterial(color = 0xffff00) {
  return new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3
  });
}

/**
 * Get tool description
 * @param {string} toolName - Tool name
 * @returns {string} Tool description
 */
export function getToolDescription(toolName) {
  const descriptions = {
    transform: 'Move, rotate, and scale objects',
    extrude: 'Extrude faces and edges',
    bevel: 'Add bevels to edges',
    boolean: 'Combine objects with boolean operations',
    array: 'Create arrays of objects',
    mirror: 'Mirror objects across axes',
    subdivision: 'Subdivide geometry',
    smooth: 'Smooth geometry',
    bend: 'Bend objects',
    twist: 'Twist objects'
  };
  
  return descriptions[toolName] || 'Unknown tool';
}

/**
 * Validate tool parameters
 * @param {Object} parameters - Parameters to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
export function validateToolParameters(parameters, schema) {
  const errors = [];
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = parameters[key];
    
    if (rules.required && value === undefined) {
      errors.push(`${key} is required`);
      continue;
    }
    
    if (value !== undefined) {
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${key} must be of type ${rules.type}`);
      }
      
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${key} must be at least ${rules.min}`);
      }
      
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${key} must be at most ${rules.max}`);
      }
      
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${key} must be one of: ${rules.enum.join(', ')}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Create tool helper
 * @param {string} type - Helper type
 * @param {Object} options - Helper options
 * @returns {THREE.Object3D} Helper object
 */
export function createToolHelper(type, options = {}) {
  switch (type.toLowerCase()) {
    case 'grid':
      return new THREE.GridHelper(options.size || 10, options.divisions || 10);
    case 'axes':
      return new THREE.AxesHelper(options.size || 1);
    case 'box':
      return new THREE.BoxHelper(options.object, options.color || 0xffff00);
    case 'wireframe':
      return new THREE.WireframeHelper(options.object, options.color || 0x00ff00);
    default:
      return null;
  }
}

/**
 * Remove tool helper
 * @param {THREE.Object3D} helper - Helper to remove
 * @param {THREE.Scene} scene - Scene to remove from
 */
export function removeToolHelper(helper, scene) {
  if (helper && scene) {
    scene.remove(helper);
  }
}

/**
 * Update tool helper
 * @param {THREE.Object3D} helper - Helper to update
 * @param {Object} options - Update options
 */
export function updateToolHelper(helper, options = {}) {
  if (!helper) return;
  
  if (options.position) {
    helper.position.copy(options.position);
  }
  
  if (options.rotation) {
    helper.rotation.copy(options.rotation);
  }
  
  if (options.scale) {
    helper.scale.copy(options.scale);
  }
  
  if (options.visible !== undefined) {
    helper.visible = options.visible;
  }
}

// Default export containing all utility functions
export default {
  getObjectBounds,
  getObjectCenter,
  getObjectSize,
  isObjectSelected,
  getObjectsByType,
  getObjectsByGeometryType,
  cloneObject,
  applyTransformation,
  resetTransformations,
  snapToGrid,
  snapToAngle,
  getDistanceBetweenObjects,
  getAngleBetweenObjects,
  createPreviewMaterial,
  createWireframeMaterial,
  createSelectionMaterial,
  getToolDescription,
  validateToolParameters,
  createToolHelper,
  removeToolHelper,
  updateToolHelper
}; 