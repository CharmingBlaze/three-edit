/**
 * @fileoverview Validation Utilities
 * Validation utility functions for the 3D editor
 */

/**
 * Validation utility functions
 */
export class ValidationUtils {
  /**
   * Check if value is a valid number
   * @param {*} value - Value to check
   * @param {Object} options - Validation options
   * @param {number} options.min - Minimum value
   * @param {number} options.max - Maximum value
   * @param {boolean} options.allowNaN - Allow NaN values
   * @param {boolean} options.allowInfinity - Allow Infinity values
   * @returns {Object} Validation result
   */
  static isValidNumber(value, options = {}) {
    const {
      min = -Infinity,
      max = Infinity,
      allowNaN = false,
      allowInfinity = false
    } = options;

    const errors = [];

    if (typeof value !== 'number') {
      errors.push('Value must be a number');
      return { isValid: false, errors };
    }

    if (!allowNaN && isNaN(value)) {
      errors.push('Value cannot be NaN');
    }

    if (!allowInfinity && !isFinite(value)) {
      errors.push('Value cannot be Infinity');
    }

    if (value < min) {
      errors.push(`Value must be at least ${min}`);
    }

    if (value > max) {
      errors.push(`Value must be at most ${max}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if value is a valid 3D vector
   * @param {*} value - Value to check
   * @param {Object} options - Validation options
   * @param {number} options.minLength - Minimum vector length
   * @param {number} options.maxLength - Maximum vector length
   * @param {boolean} options.allowZero - Allow zero vectors
   * @returns {Object} Validation result
   */
  static isValidVector(value, options = {}) {
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
   * @param {boolean} options.allowAlpha - Allow alpha channel
   * @returns {Object} Validation result
   */
  static isValidColor(value, options = {}) {
    const { allowAlpha = false } = options;
    const errors = [];

    if (!value || typeof value !== 'object') {
      errors.push('Color must be an object');
      return { isValid: false, errors };
    }

    const requiredChannels = allowAlpha ? ['r', 'g', 'b', 'a'] : ['r', 'g', 'b'];

    requiredChannels.forEach(channel => {
      if (typeof value[channel] !== 'number') {
        errors.push(`Color must have numeric ${channel} property`);
      } else if (value[channel] < 0 || value[channel] > 1) {
        errors.push(`Color ${channel} must be between 0 and 1`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if value is a valid string
   * @param {*} value - Value to check
   * @param {Object} options - Validation options
   * @param {number} options.minLength - Minimum string length
   * @param {number} options.maxLength - Maximum string length
   * @param {RegExp} options.pattern - Regular expression pattern
   * @param {boolean} options.allowEmpty - Allow empty strings
   * @returns {Object} Validation result
   */
  static isValidString(value, options = {}) {
    const {
      minLength = 0,
      maxLength = Infinity,
      pattern = null,
      allowEmpty = true
    } = options;

    const errors = [];

    if (typeof value !== 'string') {
      errors.push('Value must be a string');
      return { isValid: false, errors };
    }

    if (!allowEmpty && value.length === 0) {
      errors.push('String cannot be empty');
    }

    if (value.length < minLength) {
      errors.push(`String must be at least ${minLength} characters long`);
    }

    if (value.length > maxLength) {
      errors.push(`String must be at most ${maxLength} characters long`);
    }

    if (pattern && !pattern.test(value)) {
      errors.push('String does not match required pattern');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if value is a valid array
   * @param {*} value - Value to check
   * @param {Object} options - Validation options
   * @param {number} options.minLength - Minimum array length
   * @param {number} options.maxLength - Maximum array length
   * @param {Function} options.itemValidator - Function to validate array items
   * @returns {Object} Validation result
   */
  static isValidArray(value, options = {}) {
    const {
      minLength = 0,
      maxLength = Infinity,
      itemValidator = null
    } = options;

    const errors = [];

    if (!Array.isArray(value)) {
      errors.push('Value must be an array');
      return { isValid: false, errors };
    }

    if (value.length < minLength) {
      errors.push(`Array must have at least ${minLength} items`);
    }

    if (value.length > maxLength) {
      errors.push(`Array must have at most ${maxLength} items`);
    }

    if (itemValidator) {
      value.forEach((item, index) => {
        const itemValidation = itemValidator(item);
        if (!itemValidation.isValid) {
          errors.push(`Item ${index}: ${itemValidation.errors.join(', ')}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if value is a valid object
   * @param {*} value - Value to check
   * @param {Object} options - Validation options
   * @param {Array} options.requiredKeys - Required object keys
   * @param {Object} options.keyValidators - Validators for specific keys
   * @param {boolean} options.allowExtraKeys - Allow extra keys
   * @returns {Object} Validation result
   */
  static isValidObject(value, options = {}) {
    const {
      requiredKeys = [],
      keyValidators = {},
      allowExtraKeys = true
    } = options;

    const errors = [];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push('Value must be an object');
      return { isValid: false, errors };
    }

    // Check required keys
    requiredKeys.forEach(key => {
      if (!(key in value)) {
        errors.push(`Missing required key: ${key}`);
      }
    });

    // Validate specific keys
    Object.entries(keyValidators).forEach(([key, validator]) => {
      if (key in value) {
        const keyValidation = validator(value[key]);
        if (!keyValidation.isValid) {
          errors.push(`Key ${key}: ${keyValidation.errors.join(', ')}`);
        }
      }
    });

    // Check for extra keys
    if (!allowExtraKeys) {
      const allowedKeys = [...requiredKeys, ...Object.keys(keyValidators)];
      Object.keys(value).forEach(key => {
        if (!allowedKeys.includes(key)) {
          errors.push(`Unexpected key: ${key}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate mesh data
   * @param {Object} meshData - Mesh data to validate
   * @returns {Object} Validation result
   */
  static validateMeshData(meshData) {
    const errors = [];
    const warnings = [];

    // Check basic structure
    if (!meshData || typeof meshData !== 'object') {
      errors.push('Mesh data must be an object');
      return { isValid: false, errors, warnings };
    }

    // Check vertices
    if (!meshData.vertices || typeof meshData.vertices !== 'object') {
      errors.push('Mesh must have vertices');
    } else {
      Object.entries(meshData.vertices).forEach(([id, vertex]) => {
        const vertexValidation = this.isValidVector(vertex);
        if (!vertexValidation.isValid) {
          errors.push(`Vertex ${id}: ${vertexValidation.errors.join(', ')}`);
        }
      });
    }

    // Check faces
    if (meshData.faces) {
      Object.entries(meshData.faces).forEach(([id, face]) => {
        if (!Array.isArray(face.vertexIds) || face.vertexIds.length < 3) {
          errors.push(`Face ${id} must have at least 3 vertices`);
        }
      });
    }

    // Check edges
    if (meshData.edges) {
      Object.entries(meshData.edges).forEach(([id, edge]) => {
        if (!edge.vertexId1 || !edge.vertexId2) {
          errors.push(`Edge ${id} must have two vertex IDs`);
        }
      });
    }

    // Check UVs
    if (meshData.uvs) {
      Object.entries(meshData.uvs).forEach(([id, uv]) => {
        if (typeof uv.u !== 'number' || typeof uv.v !== 'number') {
          errors.push(`UV ${id} must have numeric u and v coordinates`);
        }
        if (uv.u < 0 || uv.u > 1 || uv.v < 0 || uv.v > 1) {
          warnings.push(`UV ${id} coordinates outside [0,1] range`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate scene data
   * @param {Object} sceneData - Scene data to validate
   * @returns {Object} Validation result
   */
  static validateSceneData(sceneData) {
    const errors = [];
    const warnings = [];

    // Check basic structure
    if (!sceneData || typeof sceneData !== 'object') {
      errors.push('Scene data must be an object');
      return { isValid: false, errors, warnings };
    }

    // Check required properties
    if (!sceneData.name) {
      errors.push('Scene must have a name');
    }

    if (!sceneData.id) {
      errors.push('Scene must have an ID');
    }

    // Check meshes
    if (sceneData.meshes) {
      Object.entries(sceneData.meshes).forEach(([id, meshData]) => {
        const meshValidation = this.validateMeshData(meshData);
        if (!meshValidation.isValid) {
          errors.push(`Mesh ${id}: ${meshValidation.errors.join(', ')}`);
        }
        warnings.push(...meshValidation.warnings.map(warning => `Mesh ${id}: ${warning}`));
      });
    }

    // Check children
    if (sceneData.children) {
      Object.entries(sceneData.children).forEach(([id, childData]) => {
        const childValidation = this.validateSceneData(childData);
        if (!childValidation.isValid) {
          errors.push(`Child ${id}: ${childValidation.errors.join(', ')}`);
        }
        warnings.push(...childValidation.warnings.map(warning => `Child ${id}: ${warning}`));
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 