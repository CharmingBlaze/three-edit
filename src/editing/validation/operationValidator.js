/**
 * @fileoverview Operation Validation System
 * Centralized validation for all editing operations with consistent error handling
 */

import * as THREE from 'three';
import { 
  GeometryOperationTypes, 
  VertexOperationTypes, 
  EdgeOperationTypes, 
  FaceOperationTypes, 
  UVOperationTypes,
  ValidationResult 
} from '../types/operationTypes.js';

/**
 * Base validator class for all operations
 */
export class OperationValidator {
  /**
   * Validates basic operation parameters
   * @param {Object} params - Parameters to validate
   * @param {THREE.BufferGeometry} params.geometry - Geometry to operate on
   * @param {Array<number>} params.indices - Indices of elements to operate on
   * @param {Object} params.options - Operation options
   * @returns {Object} Validation result
   */
  static validateBasicParams(params) {
    const result = { ...ValidationResult };

    if (!params || typeof params !== 'object') {
      result.errors.push('Parameters must be an object');
      return result;
    }

    if (!params.geometry || !(params.geometry instanceof THREE.BufferGeometry)) {
      result.errors.push('Valid THREE.BufferGeometry is required');
    }

    if (!params.indices || !Array.isArray(params.indices)) {
      result.errors.push('Indices array is required');
    } else if (params.indices.length === 0) {
      result.errors.push('At least one index is required');
    }

    if (params.options && typeof params.options !== 'object') {
      result.errors.push('Options must be an object');
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Validates operation result structure
   * @param {Object} result - Operation result to validate
   * @returns {Object} Validation result
   */
  static validateOperationResult(result) {
    const validation = { ...ValidationResult };

    if (!result || typeof result !== 'object') {
      validation.errors.push('Result must be an object');
      return validation;
    }

    if (typeof result.success !== 'boolean') {
      validation.errors.push('Result must have a boolean success property');
    }

    if (result.success && !result.geometry) {
      validation.errors.push('Successful operations must return geometry');
    }

    if (result.errors && !Array.isArray(result.errors)) {
      validation.errors.push('Result errors must be an array');
    }

    if (result.warnings && !Array.isArray(result.warnings)) {
      validation.errors.push('Result warnings must be an array');
    }

    validation.isValid = validation.errors.length === 0;
    return validation;
  }

  /**
   * Validates geometry integrity
   * @param {THREE.BufferGeometry} geometry - Geometry to validate
   * @returns {Object} Validation result
   */
  static validateGeometry(geometry) {
    const result = { ...ValidationResult };

    if (!geometry || !(geometry instanceof THREE.BufferGeometry)) {
      result.errors.push('Valid THREE.BufferGeometry is required');
      return result;
    }

    const positionAttribute = geometry.getAttribute('position');
    if (!positionAttribute) {
      result.errors.push('Geometry must have position attribute');
    }

    const indexAttribute = geometry.getIndex();
    if (!indexAttribute) {
      result.errors.push('Geometry must be indexed');
    }

    if (positionAttribute && indexAttribute) {
      const vertexCount = positionAttribute.count;
      const maxIndex = Math.max(...Array.from({ length: indexAttribute.count }, (_, i) => indexAttribute.getX(i)));
      
      if (maxIndex >= vertexCount) {
        result.errors.push('Index references non-existent vertex');
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }
}

/**
 * Geometry operation validator
 */
export class GeometryOperationValidator extends OperationValidator {
  /**
   * Validates geometry operation parameters
   * @param {Object} params - Parameters to validate
   * @param {string} operationType - Type of operation
   * @returns {Object} Validation result
   */
  static validateParams(params, operationType) {
    const result = this.validateBasicParams(params);

    if (!operationType || !Object.values(GeometryOperationTypes).includes(operationType)) {
      result.errors.push(`Invalid geometry operation type: ${operationType}`);
    }

    // Operation-specific validation
    switch (operationType) {
      case GeometryOperationTypes.BEVEL:
        if (params.options && typeof params.options.amount !== 'number') {
          result.errors.push('Bevel amount must be a number');
        }
        break;
      case GeometryOperationTypes.EXTRUDE:
        if (params.options && typeof params.options.distance !== 'number') {
          result.errors.push('Extrude distance must be a number');
        }
        break;
      case GeometryOperationTypes.SUBDIVIDE:
        if (params.options && (!Number.isInteger(params.options.iterations) || params.options.iterations < 1)) {
          result.errors.push('Subdivision iterations must be a positive integer');
        }
        break;
    }

    result.isValid = result.errors.length === 0;
    return result;
  }
}

/**
 * Vertex operation validator
 */
export class VertexOperationValidator extends OperationValidator {
  /**
   * Validates vertex operation parameters
   * @param {Object} params - Parameters to validate
   * @param {string} operationType - Type of operation
   * @returns {Object} Validation result
   */
  static validateParams(params, operationType) {
    const result = this.validateBasicParams(params);

    if (!operationType || !Object.values(VertexOperationTypes).includes(operationType)) {
      result.errors.push(`Invalid vertex operation type: ${operationType}`);
    }

    // Operation-specific validation
    switch (operationType) {
      case VertexOperationTypes.SNAP:
        if (!params.target || !(params.target instanceof THREE.Vector3)) {
          result.errors.push('Snap operation requires valid target Vector3');
        }
        break;
      case VertexOperationTypes.CONNECT:
        if (!params.vertexPairs || !Array.isArray(params.vertexPairs)) {
          result.errors.push('Connect operation requires vertex pairs array');
        }
        break;
      case VertexOperationTypes.MERGE:
        if (params.options && typeof params.options.threshold !== 'number') {
          result.errors.push('Merge threshold must be a number');
        }
        break;
    }

    result.isValid = result.errors.length === 0;
    return result;
  }
}

/**
 * Edge operation validator
 */
export class EdgeOperationValidator extends OperationValidator {
  /**
   * Validates edge operation parameters
   * @param {Object} params - Parameters to validate
   * @param {string} operationType - Type of operation
   * @returns {Object} Validation result
   */
  static validateParams(params, operationType) {
    const result = this.validateBasicParams(params);

    if (!operationType || !Object.values(EdgeOperationTypes).includes(operationType)) {
      result.errors.push(`Invalid edge operation type: ${operationType}`);
    }

    // Operation-specific validation
    switch (operationType) {
      case EdgeOperationTypes.SPLIT:
        if (params.options && (!Number.isInteger(params.options.cuts) || params.options.cuts < 1)) {
          result.errors.push('Split cuts must be a positive integer');
        }
        break;
      case EdgeOperationTypes.BRIDGE:
        if (!params.edgePairs || !Array.isArray(params.edgePairs)) {
          result.errors.push('Bridge operation requires edge pairs array');
        }
        break;
      case EdgeOperationTypes.LOOP_CUT:
        if (params.options && (!Number.isInteger(params.options.cuts) || params.options.cuts < 1)) {
          result.errors.push('Loop cut count must be a positive integer');
        }
        break;
    }

    result.isValid = result.errors.length === 0;
    return result;
  }
}

/**
 * Face operation validator
 */
export class FaceOperationValidator extends OperationValidator {
  /**
   * Validates face operation parameters
   * @param {Object} params - Parameters to validate
   * @param {string} operationType - Type of operation
   * @returns {Object} Validation result
   */
  static validateParams(params, operationType) {
    const result = this.validateBasicParams(params);

    if (!operationType || !Object.values(FaceOperationTypes).includes(operationType)) {
      result.errors.push(`Invalid face operation type: ${operationType}`);
    }

    // Operation-specific validation
    switch (operationType) {
      case FaceOperationTypes.EXTRUDE:
        if (params.options && typeof params.options.distance !== 'number') {
          result.errors.push('Extrude distance must be a number');
        }
        break;
      case FaceOperationTypes.INSET:
        if (params.options && typeof params.options.amount !== 'number') {
          result.errors.push('Inset amount must be a number');
        }
        break;
      case FaceOperationTypes.TRIANGULATE:
        if (params.options && typeof params.options.method !== 'string') {
          result.errors.push('Triangulation method must be a string');
        }
        break;
    }

    result.isValid = result.errors.length === 0;
    return result;
  }
}

/**
 * UV operation validator
 */
export class UVOperationValidator extends OperationValidator {
  /**
   * Validates UV operation parameters
   * @param {Object} params - Parameters to validate
   * @param {string} operationType - Type of operation
   * @returns {Object} Validation result
   */
  static validateParams(params, operationType) {
    const result = this.validateBasicParams(params);

    if (!operationType || !Object.values(UVOperationTypes).includes(operationType)) {
      result.errors.push(`Invalid UV operation type: ${operationType}`);
    }

    // Operation-specific validation
    switch (operationType) {
      case UVOperationTypes.UNWRAP:
        if (params.options && typeof params.options.method !== 'string') {
          result.errors.push('Unwrap method must be a string');
        }
        break;
      case UVOperationTypes.PACK:
        if (params.options && typeof params.options.margin !== 'number') {
          result.errors.push('Pack margin must be a number');
        }
        break;
      case UVOperationTypes.TRANSFORM:
        if (params.options && typeof params.options.matrix !== 'object') {
          result.errors.push('Transform matrix must be an object');
        }
        break;
    }

    result.isValid = result.errors.length === 0;
    return result;
  }
}

/**
 * Factory function to get appropriate validator
 * @param {string} operationType - Type of operation
 * @returns {Class} Appropriate validator class
 */
export function getValidator(operationType) {
  if (Object.values(GeometryOperationTypes).includes(operationType)) {
    return GeometryOperationValidator;
  }
  if (Object.values(VertexOperationTypes).includes(operationType)) {
    return VertexOperationValidator;
  }
  if (Object.values(EdgeOperationTypes).includes(operationType)) {
    return EdgeOperationValidator;
  }
  if (Object.values(FaceOperationTypes).includes(operationType)) {
    return FaceOperationValidator;
  }
  if (Object.values(UVOperationTypes).includes(operationType)) {
    return UVOperationValidator;
  }
  
  return OperationValidator;
} 