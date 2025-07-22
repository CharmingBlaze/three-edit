/**
 * @fileoverview Utils System
 * Utility functions for the 3D editor
 */

// Mathematical utilities
export { MathUtils } from './MathUtils.js';

// Validation utilities
export { ValidationUtils } from './ValidationUtils.js';

// String utilities
export { StringUtils } from './StringUtils.js';

// Array utilities
export { ArrayUtils } from './ArrayUtils.js';

// Object utilities
export { ObjectUtils } from './ObjectUtils.js';

// Color utilities
export { ColorUtils } from './ColorUtils.js';

// Geometry utilities
export { GeometryUtils } from './GeometryUtils.js';

/**
 * Common utility functions
 */
export class Utils {
  /**
   * Deep clone an object
   * @param {*} obj - Object to clone
   * @returns {*} Cloned object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }

    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }

    return obj;
  }

  /**
   * Merge objects deeply
   * @param {...Object} objects - Objects to merge
   * @returns {Object} Merged object
   */
  static deepMerge(...objects) {
    const result = {};

    objects.forEach(obj => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            result[key] = this.deepMerge(result[key] || {}, obj[key]);
          } else {
            result[key] = obj[key];
          }
        });
      }
    });

    return result;
  }

  /**
   * Generate unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  static generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Throttled function
   */
  static throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  }

  /**
   * Format file size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) {return '0 Bytes';}
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration
   * @param {number} milliseconds - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  static formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Check if two objects are equal
   * @param {*} a - First object
   * @param {*} b - Second object
   * @returns {boolean} True if objects are equal
   */
  static isEqual(a, b) {
    if (a === b) {return true;}
    
    if (a == null || b == null) {return false;}
    
    if (typeof a !== typeof b) {return false;}
    
    if (typeof a !== 'object') {return false;}
    
    if (Array.isArray(a) !== Array.isArray(b)) {return false;}
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) {return false;}
      for (let i = 0; i < a.length; i++) {
        if (!this.isEqual(a[i], b[i])) {return false;}
      }
      return true;
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) {return false;}
    
    for (const key of keysA) {
      if (!keysB.includes(key)) {return false;}
      if (!this.isEqual(a[key], b[key])) {return false;}
    }
    
    return true;
  }

  /**
   * Get object size
   * @param {Object} obj - Object to measure
   * @returns {number} Object size in bytes (approximate)
   */
  static getObjectSize(obj) {
    const str = JSON.stringify(obj);
    return new Blob([str]).size;
  }

  /**
   * Create a promise that resolves after a delay
   * @param {number} delay - Delay in milliseconds
   * @returns {Promise} Promise that resolves after delay
   */
  static delay(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Retry a function with exponential backoff
   * @param {Function} func - Function to retry
   * @param {Object} options - Retry options
   * @param {number} options.maxAttempts - Maximum retry attempts
   * @param {number} options.baseDelay - Base delay in milliseconds
   * @param {number} options.maxDelay - Maximum delay in milliseconds
   * @returns {Promise} Promise that resolves with function result
   */
  static async retry(func, options = {}) {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await func();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }

        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        await this.delay(delay);
      }
    }
  }
} 