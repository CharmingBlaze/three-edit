/**
 * @fileoverview Transform Class
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
   * @param {Object} [options.position={x: 0, y: 0, z: 0}] - Position {x, y, z}
   * @param {Object} [options.rotation={x: 0, y: 0, z: 0}] - Rotation {x, y, z} in radians
   * @param {Object} [options.scale={x: 1, y: 1, z: 1}] - Scale {x, y, z}
   * @param {Object} [options.pivot={x: 0, y: 0, z: 0}] - Pivot point {x, y, z}
   * @param {string} [options.space='world'] - Transform space ('world', 'local')
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
   * @returns {Transform} This transform (for chaining)
   */
  setPosition(x, y, z) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    this.dirty = true;
    return this;
  }

  /**
   * Set rotation in radians
   * @param {number} x - X rotation in radians
   * @param {number} y - Y rotation in radians
   * @param {number} z - Z rotation in radians
   * @returns {Transform} This transform (for chaining)
   */
  setRotation(x, y, z) {
    this.rotation.x = x;
    this.rotation.y = y;
    this.rotation.z = z;
    this.dirty = true;
    return this;
  }

  /**
   * Set rotation in degrees
   * @param {number} x - X rotation in degrees
   * @param {number} y - Y rotation in degrees
   * @param {number} z - Z rotation in degrees
   * @returns {Transform} This transform (for chaining)
   */
  setRotationDegrees(x, y, z) {
    this.setRotation(
      MathUtils.degreesToRadians(x),
      MathUtils.degreesToRadians(y),
      MathUtils.degreesToRadians(z)
    );
    return this;
  }

  /**
   * Set scale
   * @param {number} x - X scale
   * @param {number} y - Y scale
   * @param {number} z - Z scale
   * @returns {Transform} This transform (for chaining)
   */
  setScale(x, y, z) {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
    this.dirty = true;
    return this;
  }

  /**
   * Set uniform scale
   * @param {number} scale - Uniform scale value
   * @returns {Transform} This transform (for chaining)
   */
  setUniformScale(scale) {
    this.scale.x = scale;
    this.scale.y = scale;
    this.scale.z = scale;
    this.dirty = true;
    return this;
  }

  /**
   * Set pivot point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @returns {Transform} This transform (for chaining)
   */
  setPivot(x, y, z) {
    this.pivot.x = x;
    this.pivot.y = y;
    this.pivot.z = z;
    this.dirty = true;
    return this;
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
   * Get pivot
   * @returns {Object} Pivot {x, y, z}
   */
  getPivot() {
    return { ...this.pivot };
  }

  /**
   * Get transformation matrix
   * @returns {Array<number>} 4x4 transformation matrix as array
   */
  getMatrix() {
    if (this.dirty) {
      this.updateMatrix();
    }
    return [...this.matrix];
  }

  /**
   * Get inverse transformation matrix
   * @returns {Array<number>} 4x4 inverse transformation matrix as array
   */
  getInverseMatrix() {
    if (this.dirty) {
      this.updateMatrix();
    }
    return [...this.inverseMatrix];
  }

  /**
   * Update the transformation matrix
   */
  updateMatrix() {
    // Create identity matrix
    this.matrix = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];

    // Apply pivot translation
    this.translateMatrix(-this.pivot.x, -this.pivot.y, -this.pivot.z);

    // Apply scale
    this.scaleMatrix(this.scale.x, this.scale.y, this.scale.z);

    // Apply rotation (Z, Y, X order)
    this.rotateMatrix(this.rotation.z, 'z');
    this.rotateMatrix(this.rotation.y, 'y');
    this.rotateMatrix(this.rotation.x, 'x');

    // Apply position translation
    this.translateMatrix(this.position.x, this.position.y, this.position.z);

    // Calculate inverse matrix
    this.calculateInverseMatrix();

    this.dirty = false;
  }

  /**
   * Apply translation to matrix
   * @param {number} x - X translation
   * @param {number} y - Y translation
   * @param {number} z - Z translation
   */
  translateMatrix(x, y, z) {
    const translationMatrix = [
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1
    ];
    this.matrix = this.multiplyMatrices(this.matrix, translationMatrix);
  }

  /**
   * Apply scale to matrix
   * @param {number} x - X scale
   * @param {number} y - Y scale
   * @param {number} z - Z scale
   */
  scaleMatrix(x, y, z) {
    const scaleMatrix = [
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ];
    this.matrix = this.multiplyMatrices(this.matrix, scaleMatrix);
  }

  /**
   * Apply rotation to matrix
   * @param {number} angle - Rotation angle in radians
   * @param {string} axis - Rotation axis ('x', 'y', 'z')
   */
  rotateMatrix(angle, axis) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let rotationMatrix;

    switch (axis) {
      case 'x':
        rotationMatrix = [
          1, 0, 0, 0,
          0, cos, -sin, 0,
          0, sin, cos, 0,
          0, 0, 0, 1
        ];
        break;
      case 'y':
        rotationMatrix = [
          cos, 0, sin, 0,
          0, 1, 0, 0,
          -sin, 0, cos, 0,
          0, 0, 0, 1
        ];
        break;
      case 'z':
        rotationMatrix = [
          cos, -sin, 0, 0,
          sin, cos, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
        ];
        break;
      default:
        return;
    }

    this.matrix = this.multiplyMatrices(this.matrix, rotationMatrix);
  }

  /**
   * Multiply two 4x4 matrices
   * @param {Array<number>} a - First matrix
   * @param {Array<number>} b - Second matrix
   * @returns {Array<number>} Result matrix
   */
  multiplyMatrices(a, b) {
    const result = new Array(16);
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] = 
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }
    
    return result;
  }

  /**
   * Calculate inverse matrix
   */
  calculateInverseMatrix() {
    // This is a simplified inverse calculation
    // For production use, implement proper matrix inversion
    this.inverseMatrix = [...this.matrix];
    
    // For now, just create a basic inverse for translation
    this.inverseMatrix[3] = -this.matrix[3];
    this.inverseMatrix[7] = -this.matrix[7];
    this.inverseMatrix[11] = -this.matrix[11];
  }

  /**
   * Transform a point
   * @param {Object} point - Point {x, y, z}
   * @returns {Object} Transformed point {x, y, z}
   */
  transformPoint(point) {
    const matrix = this.getMatrix();
    return {
      x: matrix[0] * point.x + matrix[1] * point.y + matrix[2] * point.z + matrix[3],
      y: matrix[4] * point.x + matrix[5] * point.y + matrix[6] * point.z + matrix[7],
      z: matrix[8] * point.x + matrix[9] * point.y + matrix[10] * point.z + matrix[11]
    };
  }

  /**
   * Inverse transform a point
   * @param {Object} point - Point {x, y, z}
   * @returns {Object} Inverse transformed point {x, y, z}
   */
  inverseTransformPoint(point) {
    const matrix = this.getInverseMatrix();
    return {
      x: matrix[0] * point.x + matrix[1] * point.y + matrix[2] * point.z + matrix[3],
      y: matrix[4] * point.x + matrix[5] * point.y + matrix[6] * point.z + matrix[7],
      z: matrix[8] * point.x + matrix[9] * point.y + matrix[10] * point.z + matrix[11]
    };
  }

  /**
   * Transform a vector (ignores translation)
   * @param {Object} vector - Vector {x, y, z}
   * @returns {Object} Transformed vector {x, y, z}
   */
  transformVector(vector) {
    const matrix = this.getMatrix();
    return {
      x: matrix[0] * vector.x + matrix[1] * vector.y + matrix[2] * vector.z,
      y: matrix[4] * vector.x + matrix[5] * vector.y + matrix[6] * vector.z,
      z: matrix[8] * vector.x + matrix[9] * vector.y + matrix[10] * vector.z
    };
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
   * Validate transform data
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

    // Check for infinite values
    if (!isFinite(this.position.x) || !isFinite(this.position.y) || !isFinite(this.position.z)) {
      errors.push('Position contains infinite values');
    }

    // Check space value
    if (this.space !== 'world' && this.space !== 'local') {
      warnings.push('Space should be "world" or "local"');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 