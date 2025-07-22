/**
 * @fileoverview Math Utilities
 * Mathematical utility functions for the 3D editor
 */

/**
 * Mathematical utility functions
 */
export class MathUtils {
  /**
   * Clamp value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   * @param {number} a - Start value
   * @param {number} b - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Smooth interpolation using smoothstep
   * @param {number} a - Start value
   * @param {number} b - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Smoothly interpolated value
   */
  static smoothLerp(a, b, t) {
    const smoothT = t * t * (3 - 2 * t);
    return this.lerp(a, b, smoothT);
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  static degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * Convert radians to degrees
   * @param {number} radians - Radians
   * @returns {number} Degrees
   */
  static radToDeg(radians) {
    return radians * 180 / Math.PI;
  }

  /**
   * Calculate distance between two 3D points
   * @param {Object} a - First point {x, y, z}
   * @param {Object} b - Second point {x, y, z}
   * @returns {number} Distance
   */
  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate squared distance between two 3D points
   * @param {Object} a - First point {x, y, z}
   * @param {Object} b - Second point {x, y, z}
   * @returns {number} Squared distance
   */
  static distanceSquared(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Calculate dot product of two 3D vectors
   * @param {Object} a - First vector {x, y, z}
   * @param {Object} b - Second vector {x, y, z}
   * @returns {number} Dot product
   */
  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  /**
   * Calculate cross product of two 3D vectors
   * @param {Object} a - First vector {x, y, z}
   * @param {Object} b - Second vector {x, y, z}
   * @returns {Object} Cross product {x, y, z}
   */
  static cross(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  /**
   * Normalize a 3D vector
   * @param {Object} vector - Vector to normalize {x, y, z}
   * @returns {Object} Normalized vector {x, y, z}
   */
  static normalize(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    if (length === 0) {return { x: 0, y: 0, z: 0 };}
    
    return {
      x: vector.x / length,
      y: vector.y / length,
      z: vector.z / length
    };
  }

  /**
   * Calculate vector length
   * @param {Object} vector - Vector {x, y, z}
   * @returns {number} Vector length
   */
  static length(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  }

  /**
   * Add two 3D vectors
   * @param {Object} a - First vector {x, y, z}
   * @param {Object} b - Second vector {x, y, z}
   * @returns {Object} Sum vector {x, y, z}
   */
  static add(a, b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z
    };
  }

  /**
   * Subtract two 3D vectors
   * @param {Object} a - First vector {x, y, z}
   * @param {Object} b - Second vector {x, y, z}
   * @returns {Object} Difference vector {x, y, z}
   */
  static subtract(a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: a.z - b.z
    };
  }

  /**
   * Multiply vector by scalar
   * @param {Object} vector - Vector {x, y, z}
   * @param {number} scalar - Scalar value
   * @returns {Object} Scaled vector {x, y, z}
   */
  static multiply(vector, scalar) {
    return {
      x: vector.x * scalar,
      y: vector.y * scalar,
      z: vector.z * scalar
    };
  }

  /**
   * Calculate angle between two vectors
   * @param {Object} a - First vector {x, y, z}
   * @param {Object} b - Second vector {x, y, z}
   * @returns {number} Angle in radians
   */
  static angleBetween(a, b) {
    const dotProduct = this.dot(a, b);
    const lengthA = this.length(a);
    const lengthB = this.length(b);
    
    if (lengthA === 0 || lengthB === 0) {return 0;}
    
    const cosAngle = dotProduct / (lengthA * lengthB);
    return Math.acos(this.clamp(cosAngle, -1, 1));
  }

  /**
   * Create rotation matrix around X axis
   * @param {number} angle - Rotation angle in radians
   * @returns {Array} 4x4 rotation matrix
   */
  static rotationMatrixX(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    return [
      1, 0, 0, 0,
      0, cos, -sin, 0,
      0, sin, cos, 0,
      0, 0, 0, 1
    ];
  }

  /**
   * Create rotation matrix around Y axis
   * @param {number} angle - Rotation angle in radians
   * @returns {Array} 4x4 rotation matrix
   */
  static rotationMatrixY(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    return [
      cos, 0, sin, 0,
      0, 1, 0, 0,
      -sin, 0, cos, 0,
      0, 0, 0, 1
    ];
  }

  /**
   * Create rotation matrix around Z axis
   * @param {number} angle - Rotation angle in radians
   * @returns {Array} 4x4 rotation matrix
   */
  static rotationMatrixZ(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    return [
      cos, -sin, 0, 0,
      sin, cos, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  /**
   * Multiply matrix by vector
   * @param {Array} matrix - 4x4 matrix
   * @param {Object} vector - 3D vector {x, y, z}
   * @returns {Object} Transformed vector {x, y, z}
   */
  static transformVector(matrix, vector) {
    const x = matrix[0] * vector.x + matrix[1] * vector.y + matrix[2] * vector.z + matrix[3];
    const y = matrix[4] * vector.x + matrix[5] * vector.y + matrix[6] * vector.z + matrix[7];
    const z = matrix[8] * vector.x + matrix[9] * vector.y + matrix[10] * vector.z + matrix[11];
    
    return { x, y, z };
  }

  /**
   * Check if point is inside bounding box
   * @param {Object} point - Point {x, y, z}
   * @param {Object} bounds - Bounds {min: {x, y, z}, max: {x, y, z}}
   * @returns {boolean} True if point is inside bounds
   */
  static pointInBounds(point, bounds) {
    return point.x >= bounds.min.x && point.x <= bounds.max.x &&
           point.y >= bounds.min.y && point.y <= bounds.max.y &&
           point.z >= bounds.min.z && point.z <= bounds.max.z;
  }

  /**
   * Calculate bounding box from points
   * @param {Array} points - Array of points {x, y, z}
   * @returns {Object} Bounding box {min: {x, y, z}, max: {x, y, z}}
   */
  static calculateBounds(points) {
    if (points.length === 0) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }

    const bounds = {
      min: { x: Infinity, y: Infinity, z: Infinity },
      max: { x: -Infinity, y: -Infinity, z: -Infinity }
    };

    points.forEach(point => {
      bounds.min.x = Math.min(bounds.min.x, point.x);
      bounds.min.y = Math.min(bounds.min.y, point.y);
      bounds.min.z = Math.min(bounds.min.z, point.z);
      bounds.max.x = Math.max(bounds.max.x, point.x);
      bounds.max.y = Math.max(bounds.max.y, point.y);
      bounds.max.z = Math.max(bounds.max.z, point.z);
    });

    return bounds;
  }

  /**
   * Calculate center of bounding box
   * @param {Object} bounds - Bounding box {min: {x, y, z}, max: {x, y, z}}
   * @returns {Object} Center point {x, y, z}
   */
  static boundsCenter(bounds) {
    return {
      x: (bounds.min.x + bounds.max.x) / 2,
      y: (bounds.min.y + bounds.max.y) / 2,
      z: (bounds.min.z + bounds.max.z) / 2
    };
  }

  /**
   * Calculate bounding box size
   * @param {Object} bounds - Bounding box {min: {x, y, z}, max: {x, y, z}}
   * @returns {Object} Size {width, height, depth}
   */
  static boundsSize(bounds) {
    return {
      width: bounds.max.x - bounds.min.x,
      height: bounds.max.y - bounds.min.y,
      depth: bounds.max.z - bounds.min.z
    };
  }
} 