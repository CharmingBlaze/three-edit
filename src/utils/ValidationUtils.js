/**
 * @fileoverview Validation Utilities
 * Validation utility functions for the 3D editor
 * 
 * @deprecated Use the modular validation functions from './validation/' instead
 */

// Re-export all modular validation functions for backward compatibility
export * from './validation/index.js';

/**
 * Validation utility functions class
 * @deprecated Use individual functions from './validation/' instead
 */
export class ValidationUtils {
  // Re-export all static methods from modular functions for backward compatibility
  static isValidNumber = (await import('./validation/basicValidation.js')).isValidNumber;
  static isValidString = (await import('./validation/basicValidation.js')).isValidString;
  static isValidArray = (await import('./validation/basicValidation.js')).isValidArray;
  static isValidObject = (await import('./validation/basicValidation.js')).isValidObject;
  
  static isValidVector = (await import('./validation/geometryValidation.js')).isValidVector;
  static isValidColor = (await import('./validation/geometryValidation.js')).isValidColor;
  static validateMeshData = (await import('./validation/geometryValidation.js')).validateMeshData;
  static validateSceneData = (await import('./validation/geometryValidation.js')).validateSceneData;
} 