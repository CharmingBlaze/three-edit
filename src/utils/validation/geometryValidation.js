/**
 * @fileoverview Geometry Validation Operations
 * Geometry-specific validation utility functions for the 3D editor
 */

/**
 * Check if value is a valid 3D vector
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum vector length
 * @param {number} options.maxLength - Maximum vector length
 * @param {boolean} options.allowZero - Allow zero vectors
 * @returns {Object} Validation result
 */
export function isValidVector(value, options = {}) {
  const {
    minLength = 0,
    maxLength = Infinity,
    allowZero = true
  } = options;

  const errors = [];

  if (!value || typeof value !== 'object') {
    errors.push('Value must be an object');
    return { isValid: false, errors };
  }

  if (typeof value.x !== 'number' || typeof value.y !== 'number' || typeof value.z !== 'number') {
    errors.push('Vector must have numeric x, y, z properties');
    return { isValid: false, errors };
  }

  const length = Math.sqrt(value.x * value.x + value.y * value.y + value.z * value.z);

  if (!allowZero && length === 0) {
    errors.push('Vector cannot be zero');
  }

  if (length < minLength) {
    errors.push(`Vector length must be at least ${minLength}`);
  }

  if (length > maxLength) {
    errors.push(`Vector length must be at most ${maxLength}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if value is a valid color
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {string} options.format - Color format ('rgb', 'hex', 'hsl')
 * @param {boolean} options.allowAlpha - Allow alpha channel
 * @returns {Object} Validation result
 */
export function isValidColor(value, options = {}) {
  const {
    format = 'rgb',
    allowAlpha = false
  } = options;

  const errors = [];

  if (!value || typeof value !== 'object') {
    errors.push('Value must be an object');
    return { isValid: false, errors };
  }

  if (format === 'rgb') {
    if (typeof value.r !== 'number' || typeof value.g !== 'number' || typeof value.b !== 'number') {
      errors.push('Color must have numeric r, g, b properties');
      return { isValid: false, errors };
    }

    if (value.r < 0 || value.r > 1 || value.g < 0 || value.g > 1 || value.b < 0 || value.b > 1) {
      errors.push('RGB values must be between 0 and 1');
    }

    if (allowAlpha && 'a' in value) {
      if (typeof value.a !== 'number' || value.a < 0 || value.a > 1) {
        errors.push('Alpha value must be a number between 0 and 1');
      }
    }
  } else if (format === 'hex') {
    if (typeof value !== 'string') {
      errors.push('Hex color must be a string');
      return { isValid: false, errors };
    }

    const hexPattern = allowAlpha ? /^#[0-9A-Fa-f]{8}$/ : /^#[0-9A-Fa-f]{6}$/;
    if (!hexPattern.test(value)) {
      errors.push('Invalid hex color format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate mesh data structure
 * @param {Object} meshData - Mesh data to validate
 * @returns {Object} Validation result
 */
export function validateMeshData(meshData) {
  const errors = [];

  if (!meshData || typeof meshData !== 'object') {
    errors.push('Mesh data must be an object');
    return { isValid: false, errors };
  }

  // Validate vertices
  if (!meshData.vertices || !Array.isArray(meshData.vertices)) {
    errors.push('Mesh must have vertices array');
  } else {
    for (let i = 0; i < meshData.vertices.length; i++) {
      const vertex = meshData.vertices[i];
      if (!vertex || typeof vertex !== 'object') {
        errors.push(`Vertex ${i} must be an object`);
        continue;
      }
      if (typeof vertex.x !== 'number' || typeof vertex.y !== 'number' || typeof vertex.z !== 'number') {
        errors.push(`Vertex ${i} must have numeric x, y, z properties`);
      }
    }
  }

  // Validate faces
  if (!meshData.faces || !Array.isArray(meshData.faces)) {
    errors.push('Mesh must have faces array');
  } else {
    for (let i = 0; i < meshData.faces.length; i++) {
      const face = meshData.faces[i];
      if (!face || !Array.isArray(face)) {
        errors.push(`Face ${i} must be an array`);
        continue;
      }
      if (face.length < 3) {
        errors.push(`Face ${i} must have at least 3 vertices`);
      }
      for (let j = 0; j < face.length; j++) {
        if (typeof face[j] !== 'number' || face[j] < 0 || face[j] >= meshData.vertices.length) {
          errors.push(`Face ${i} vertex ${j} must be a valid vertex index`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate scene data structure
 * @param {Object} sceneData - Scene data to validate
 * @returns {Object} Validation result
 */
export function validateSceneData(sceneData) {
  const errors = [];

  if (!sceneData || typeof sceneData !== 'object') {
    errors.push('Scene data must be an object');
    return { isValid: false, errors };
  }

  // Validate scene properties
  if (sceneData.name && typeof sceneData.name !== 'string') {
    errors.push('Scene name must be a string');
  }

  if (sceneData.meshes && !Array.isArray(sceneData.meshes)) {
    errors.push('Scene meshes must be an array');
  } else if (sceneData.meshes) {
    for (let i = 0; i < sceneData.meshes.length; i++) {
      const meshResult = validateMeshData(sceneData.meshes[i]);
      if (!meshResult.isValid) {
        errors.push(`Mesh ${i}: ${meshResult.errors.join(', ')}`);
      }
    }
  }

  // Validate camera
  if (sceneData.camera && typeof sceneData.camera !== 'object') {
    errors.push('Scene camera must be an object');
  }

  // Validate lights
  if (sceneData.lights && !Array.isArray(sceneData.lights)) {
    errors.push('Scene lights must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 