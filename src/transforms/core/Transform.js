/**
 * @fileoverview Transform class for 3D transformations
 * Represents a 3D transformation with position, rotation, scale, and pivot
 */

import { MathUtils } from '../../utils/MathUtils.js';

/**
 * Transform data structure
 */
export class Transform {
  /**
   * Create a transform
   * @param {Object} options - Transform options
   * @param {Object} options.position - Position {x, y, z}
   * @param {Object} options.rotation - Rotation {x, y, z} in radians
   * @param {Object} options.scale - Scale {x, y, z}
   * @param {Object} options.pivot - Pivot point {x, y, z}
   * @param {string} options.space - Transform space ('world', 'local')
   */
  constructor(options = {}) {
    const {
      position = { x: 0, y: 0, z: 0 },
      rotation = { x: 0, y: 0, z: 0 },
      scale = { x: 1, y: 1, z: 1 },
      pivot = { x: 0, y: 0, z: 0 },
      space = 'world'
    } = options;

    this.position = { ...position };
    this.rotation = { ...rotation };
    this.scale = { ...scale };
    this.pivot = { ...pivot };
    this.space = space;
    this.matrix = null;
    this.inverseMatrix = null;
    this.dirty = true;
  }

  /**
   * Clone the transform
   * @returns {Transform} Cloned transform
   */
  clone() {
    return new Transform({
      position: { ...this.position },
      rotation: { ...this.rotation },
      scale: { ...this.scale },
      pivot: { ...this.pivot },
      space: this.space
    });
  }

  /**
   * Set position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   */
  setPosition(x, y, z) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    this.dirty = true;
  }

  /**
   * Set rotation in radians
   * @param {number} x - X rotation in radians
   * @param {number} y - Y rotation in radians
   * @param {number} z - Z rotation in radians
   */
  setRotation(x, y, z) {
    this.rotation.x = x;
    this.rotation.y = y;
    this.rotation.z = z;
    this.dirty = true;
  }

  /**
   * Set rotation in degrees
   * @param {number} x - X rotation in degrees
   * @param {number} y - Y rotation in degrees
   * @param {number} z - Z rotation in degrees
   */
  setRotationDegrees(x, y, z) {
    this.setRotation(
      MathUtils.degreesToRadians(x),
      MathUtils.degreesToRadians(y),
      MathUtils.degreesToRadians(z)
    );
  }

  /**
   * Set scale
   * @param {number} x - X scale
   * @param {number} y - Y scale
   * @param {number} z - Z scale
   */
  setScale(x, y, z) {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
    this.dirty = true;
  }

  /**
   * Set uniform scale
   * @param {number} scale - Uniform scale value
   */
  setUniformScale(scale) {
    this.scale.x = scale;
    this.scale.y = scale;
    this.scale.z = scale;
    this.dirty = true;
  }

  /**
   * Set pivot point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   */
  setPivot(x, y, z) {
    this.pivot.x = x;
    this.pivot.y = y;
    this.pivot.z = z;
    this.dirty = true;
  }

  /**
   * Get position
   * @returns {Object} Position {x, y, z}
   */
  getPosition() {
    return { ...this.position };
  }

  /**
   * Get rotation in radians
   * @returns {Object} Rotation {x, y, z} in radians
   */
  getRotation() {
    return { ...this.rotation };
  }

  /**
   * Get rotation in degrees
   * @returns {Object} Rotation {x, y, z} in degrees
   */
  getRotationDegrees() {
    return {
      x: MathUtils.radiansToDegrees(this.rotation.x),
      y: MathUtils.radiansToDegrees(this.rotation.y),
      z: MathUtils.radiansToDegrees(this.rotation.z)
    };
  }

  /**
   * Get scale
   * @returns {Object} Scale {x, y, z}
   */
  getScale() {
    return { ...this.scale };
  }

  /**
   * Get pivot point
   * @returns {Object} Pivot {x, y, z}
   */
  getPivot() {
    return { ...this.pivot };
  }

  /**
   * Get transformation matrix
   * @returns {Array<Array<number>>} 4x4 transformation matrix
   */
  getMatrix() {
    if (this.dirty) {
      this.updateMatrix();
    }
    return this.matrix;
  }

  /**
   * Get inverse transformation matrix
   * @returns {Array<Array<number>>} 4x4 inverse transformation matrix
   */
  getInverseMatrix() {
    if (this.dirty) {
      this.updateMatrix();
    }
    return this.inverseMatrix;
  }

  /**
   * Update transformation matrix
   */
  updateMatrix() {
    // Create translation matrix
    const translationMatrix = [
      [1, 0, 0, this.position.x],
      [0, 1, 0, this.position.y],
      [0, 0, 1, this.position.z],
      [0, 0, 0, 1]
    ];

    // Create rotation matrices
    const cosX = Math.cos(this.rotation.x);
    const sinX = Math.sin(this.rotation.x);
    const cosY = Math.cos(this.rotation.y);
    const sinY = Math.sin(this.rotation.y);
    const cosZ = Math.cos(this.rotation.z);
    const sinZ = Math.sin(this.rotation.z);

    const rotationXMatrix = [
      [1, 0, 0, 0],
      [0, cosX, -sinX, 0],
      [0, sinX, cosX, 0],
      [0, 0, 0, 1]
    ];

    const rotationYMatrix = [
      [cosY, 0, sinY, 0],
      [0, 1, 0, 0],
      [-sinY, 0, cosY, 0],
      [0, 0, 0, 1]
    ];

    const rotationZMatrix = [
      [cosZ, -sinZ, 0, 0],
      [sinZ, cosZ, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];

    // Create scale matrix
    const scaleMatrix = [
      [this.scale.x, 0, 0, 0],
      [0, this.scale.y, 0, 0],
      [0, 0, this.scale.z, 0],
      [0, 0, 0, 1]
    ];

    // Create pivot translation matrices
    const pivotToOriginMatrix = [
      [1, 0, 0, -this.pivot.x],
      [0, 1, 0, -this.pivot.y],
      [0, 0, 1, -this.pivot.z],
      [0, 0, 0, 1]
    ];

    const pivotFromOriginMatrix = [
      [1, 0, 0, this.pivot.x],
      [0, 1, 0, this.pivot.y],
      [0, 0, 1, this.pivot.z],
      [0, 0, 0, 1]
    ];

    // Combine matrices: pivot -> scale -> rotation -> translation -> pivot
    const rotationMatrix = MathUtils.multiplyMatrices(
      MathUtils.multiplyMatrices(rotationZMatrix, rotationYMatrix),
      rotationXMatrix
    );

    const transformMatrix = MathUtils.multiplyMatrices(
      MathUtils.multiplyMatrices(
        MathUtils.multiplyMatrices(
          MathUtils.multiplyMatrices(pivotFromOriginMatrix, translationMatrix),
          rotationMatrix
        ),
        scaleMatrix
      ),
      pivotToOriginMatrix
    );

    this.matrix = transformMatrix;
    this.inverseMatrix = MathUtils.invertMatrix(transformMatrix);
    this.dirty = false;
  }

  /**
   * Transform a point
   * @param {Object} point - Point to transform {x, y, z}
   * @returns {Object} Transformed point {x, y, z}
   */
  transformPoint(point) {
    const matrix = this.getMatrix();
    return MathUtils.transformPoint(point, matrix);
  }

  /**
   * Inverse transform a point
   * @param {Object} point - Point to inverse transform {x, y, z}
   * @returns {Object} Inverse transformed point {x, y, z}
   */
  inverseTransformPoint(point) {
    const matrix = this.getInverseMatrix();
    return MathUtils.transformPoint(point, matrix);
  }

  /**
   * Transform a vector (ignores translation)
   * @param {Object} vector - Vector to transform {x, y, z}
   * @returns {Object} Transformed vector {x, y, z}
   */
  transformVector(vector) {
    const matrix = this.getMatrix();
    return MathUtils.transformVector(vector, matrix);
  }

  /**
   * Get transform summary
   * @returns {Object} Transform summary
   */
  getSummary() {
    return {
      position: this.getPosition(),
      rotation: this.getRotationDegrees(),
      scale: this.getScale(),
      pivot: this.getPivot(),
      space: this.space,
      dirty: this.dirty
    };
  }

  /**
   * Validate transform
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Check for invalid scale values
    if (this.scale.x === 0 || this.scale.y === 0 || this.scale.z === 0) {
      errors.push('Scale values cannot be zero');
    }

    // Check for NaN values
    if (isNaN(this.position.x) || isNaN(this.position.y) || isNaN(this.position.z)) {
      errors.push('Position contains NaN values');
    }

    if (isNaN(this.rotation.x) || isNaN(this.rotation.y) || isNaN(this.rotation.z)) {
      errors.push('Rotation contains NaN values');
    }

    if (isNaN(this.scale.x) || isNaN(this.scale.y) || isNaN(this.scale.z)) {
      errors.push('Scale contains NaN values');
    }

    // Check for extreme values
    const maxValue = 1e6;
    if (Math.abs(this.position.x) > maxValue || 
        Math.abs(this.position.y) > maxValue || 
        Math.abs(this.position.z) > maxValue) {
      warnings.push('Position values are very large');
    }

    if (Math.abs(this.scale.x) > maxValue || 
        Math.abs(this.scale.y) > maxValue || 
        Math.abs(this.scale.z) > maxValue) {
      warnings.push('Scale values are very large');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 