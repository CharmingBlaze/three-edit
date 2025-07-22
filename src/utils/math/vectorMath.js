/**
 * @fileoverview Vector Math Operations
 * Vector mathematical utility functions for the 3D editor
 */

/**
 * Calculate distance between two 3D points
 * @param {Object} a - First point {x, y, z}
 * @param {Object} b - Second point {x, y, z}
 * @returns {number} Distance
 */
export function distance(a, b) {
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
export function distanceSquared(a, b) {
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
export function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Calculate cross product of two 3D vectors
 * @param {Object} a - First vector {x, y, z}
 * @param {Object} b - Second vector {x, y, z}
 * @returns {Object} Cross product vector {x, y, z}
 */
export function cross(a, b) {
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
export function normalize(vector) {
  const len = length(vector);
  if (len === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  return {
    x: vector.x / len,
    y: vector.y / len,
    z: vector.z / len
  };
}

/**
 * Calculate length of a 3D vector
 * @param {Object} vector - Vector {x, y, z}
 * @returns {number} Vector length
 */
export function length(vector) {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

/**
 * Add two 3D vectors
 * @param {Object} a - First vector {x, y, z}
 * @param {Object} b - Second vector {x, y, z}
 * @returns {Object} Sum vector {x, y, z}
 */
export function add(a, b) {
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
export function subtract(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
}

/**
 * Multiply a vector by a scalar
 * @param {Object} vector - Vector {x, y, z}
 * @param {number} scalar - Scalar value
 * @returns {Object} Scaled vector {x, y, z}
 */
export function multiply(vector, scalar) {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
    z: vector.z * scalar
  };
}

/**
 * Calculate angle between two 3D vectors
 * @param {Object} a - First vector {x, y, z}
 * @param {Object} b - Second vector {x, y, z}
 * @returns {number} Angle in radians
 */
export function angleBetween(a, b) {
  const dotProduct = dot(a, b);
  const lenA = length(a);
  const lenB = length(b);
  
  if (lenA === 0 || lenB === 0) {
    return 0;
  }
  
  const cosAngle = dotProduct / (lenA * lenB);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
} 