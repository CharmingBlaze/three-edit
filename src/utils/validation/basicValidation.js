/**
 * @fileoverview Basic Validation Operations
 * Basic validation utility functions for the 3D editor
 */

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
export function isValidNumber(value, options = {}) {
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
 * Check if value is a valid string
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum string length
 * @param {number} options.maxLength - Maximum string length
 * @param {RegExp} options.pattern - Regular expression pattern
 * @param {boolean} options.allowEmpty - Allow empty strings
 * @returns {Object} Validation result
 */
export function isValidString(value, options = {}) {
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
    errors.push(`String length must be at least ${minLength}`);
  }

  if (value.length > maxLength) {
    errors.push(`String length must be at most ${maxLength}`);
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
 * @param {Function} options.itemValidator - Function to validate each item
 * @param {boolean} options.allowEmpty - Allow empty arrays
 * @returns {Object} Validation result
 */
export function isValidArray(value, options = {}) {
  const {
    minLength = 0,
    maxLength = Infinity,
    itemValidator = null,
    allowEmpty = true
  } = options;

  const errors = [];

  if (!Array.isArray(value)) {
    errors.push('Value must be an array');
    return { isValid: false, errors };
  }

  if (!allowEmpty && value.length === 0) {
    errors.push('Array cannot be empty');
  }

  if (value.length < minLength) {
    errors.push(`Array length must be at least ${minLength}`);
  }

  if (value.length > maxLength) {
    errors.push(`Array length must be at most ${maxLength}`);
  }

  if (itemValidator) {
    for (let i = 0; i < value.length; i++) {
      const itemResult = itemValidator(value[i], i);
      if (!itemResult.isValid) {
        errors.push(`Item ${i}: ${itemResult.errors.join(', ')}`);
      }
    }
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
 * @param {Array<string>} options.requiredKeys - Required object keys
 * @param {Object} options.keyValidators - Validators for specific keys
 * @param {boolean} options.allowEmpty - Allow empty objects
 * @returns {Object} Validation result
 */
export function isValidObject(value, options = {}) {
  const {
    requiredKeys = [],
    keyValidators = {},
    allowEmpty = true
  } = options;

  const errors = [];

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push('Value must be an object');
    return { isValid: false, errors };
  }

  if (!allowEmpty && Object.keys(value).length === 0) {
    errors.push('Object cannot be empty');
  }

  // Check required keys
  for (const key of requiredKeys) {
    if (!(key in value)) {
      errors.push(`Missing required key: ${key}`);
    }
  }

  // Validate specific keys
  for (const [key, validator] of Object.entries(keyValidators)) {
    if (key in value) {
      const result = validator(value[key]);
      if (!result.isValid) {
        errors.push(`${key}: ${result.errors.join(', ')}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 