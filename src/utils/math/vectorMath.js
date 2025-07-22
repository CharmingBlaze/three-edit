/**
 * @fileoverview Vector Math Utilities
 * Vector mathematical utility functions for 3D operations
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
 * @returns {Object} Cross product {x, y, z}
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
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  
  if (length === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
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
 * Calculate squared length of a 3D vector
 * @param {Object} vector - Vector {x, y, z}
 * @returns {number} Squared vector length
 */
export function lengthSquared(vector) {
  return vector.x * vector.x + vector.y * vector.y + vector.z * vector.z;
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
 * Multiply a 3D vector by a scalar
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
 * Divide a 3D vector by a scalar
 * @param {Object} vector - Vector {x, y, z}
 * @param {number} scalar - Scalar value
 * @returns {Object} Divided vector {x, y, z}
 */
export function divide(vector, scalar) {
  if (scalar === 0) {
    throw new Error('Cannot divide vector by zero');
  }
  
  return {
    x: vector.x / scalar,
    y: vector.y / scalar,
    z: vector.z / scalar
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
  const lengthA = length(a);
  const lengthB = length(b);
  
  if (lengthA === 0 || lengthB === 0) {
    return 0;
  }
  
  const cosAngle = dotProduct / (lengthA * lengthB);
  return Math.acos(clamp(cosAngle, -1, 1));
}

/**
 * Linear interpolation between two 3D vectors
 * @param {Object} a - First vector {x, y, z}
 * @param {Object} b - Second vector {x, y, z}
 * @param {number} t - Interpolation factor (0-1)
 * @returns {Object} Interpolated vector {x, y, z}
 */
export function lerp(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t
  };
}

/**
 * Spherical linear interpolation between two 3D vectors
 * @param {Object} a - First vector {x, y, z}
 * @param {Object} b - Second vector {x, y, z}
 * @param {number} t - Interpolation factor (0-1)
 * @returns {Object} Interpolated vector {x, y, z}
 */
export function slerp(a, b, t) {
  const angle = angleBetween(a, b);
  
  if (angle === 0) {
    return { ...a };
  }
  
  const sinAngle = Math.sin(angle);
  const sinT = Math.sin(t * angle);
  const sin1T = Math.sin((1 - t) * angle);
  
  const factorA = sin1T / sinAngle;
  const factorB = sinT / sinAngle;
  
  return {
    x: a.x * factorA + b.x * factorB,
    y: a.y * factorA + b.y * factorB,
    z: a.z * factorA + b.z * factorB
  };
}

/**
 * Reflect a vector off a surface with given normal
 * @param {Object} vector - Incident vector {x, y, z}
 * @param {Object} normal - Surface normal {x, y, z}
 * @returns {Object} Reflected vector {x, y, z}
 */
export function reflect(vector, normal) {
  const dotProduct = dot(vector, normal);
  return {
    x: vector.x - 2 * dotProduct * normal.x,
    y: vector.y - 2 * dotProduct * normal.y,
    z: vector.z - 2 * dotProduct * normal.z
  };
}

/**
 * Project a vector onto another vector
 * @param {Object} vector - Vector to project {x, y, z}
 * @param {Object} onto - Vector to project onto {x, y, z}
 * @returns {Object} Projected vector {x, y, z}
 */
export function project(vector, onto) {
  const dotProduct = dot(vector, onto);
  const lengthSq = lengthSquared(onto);
  
  if (lengthSq === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  
  const scale = dotProduct / lengthSq;
  return multiply(onto, scale);
}

/**
 * Reject a vector from another vector (perpendicular component)
 * @param {Object} vector - Vector to reject {x, y, z}
 * @param {Object} from - Vector to reject from {x, y, z}
 * @returns {Object} Rejected vector {x, y, z}
 */
export function reject(vector, from) {
  const projected = project(vector, from);
  return subtract(vector, projected);
}

/**
 * Calculate the midpoint between two 3D points
 * @param {Object} a - First point {x, y, z}
 * @param {Object} b - Second point {x, y, z}
 * @returns {Object} Midpoint {x, y, z}
 */
export function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2
  };
}

/**
 * Calculate the centroid of multiple 3D points
 * @param {Array<Object>} points - Array of points [{x, y, z}, ...]
 * @returns {Object} Centroid {x, y, z}
 */
export function centroid(points) {
  if (points.length === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  
  const sum = points.reduce((acc, point) => add(acc, point), { x: 0, y: 0, z: 0 });
  return divide(sum, points.length);
}

/**
 * Check if two vectors are approximately equal
 * @param {Object} a - First vector {x, y, z}
 * @param {Object} b - Second vector {x, y, z}
 * @param {number} [epsilon=1e-6] - Tolerance
 * @returns {boolean} True if vectors are approximately equal
 */
export function approximatelyEqual(a, b, epsilon = 1e-6) {
  return Math.abs(a.x - b.x) < epsilon &&
         Math.abs(a.y - b.y) < epsilon &&
         Math.abs(a.z - b.z) < epsilon;
}

/**
 * Check if a vector is a zero vector
 * @param {Object} vector - Vector {x, y, z}
 * @param {number} [epsilon=1e-6] - Tolerance
 * @returns {boolean} True if vector is approximately zero
 */
export function isZero(vector, epsilon = 1e-6) {
  return Math.abs(vector.x) < epsilon &&
         Math.abs(vector.y) < epsilon &&
         Math.abs(vector.z) < epsilon;
}

/**
 * Create a zero vector
 * @returns {Object} Zero vector {x: 0, y: 0, z: 0}
 */
export function zero() {
  return { x: 0, y: 0, z: 0 };
}

/**
 * Create a unit vector in the X direction
 * @returns {Object} Unit X vector {x: 1, y: 0, z: 0}
 */
export function unitX() {
  return { x: 1, y: 0, z: 0 };
}

/**
 * Create a unit vector in the Y direction
 * @returns {Object} Unit Y vector {x: 0, y: 1, z: 0}
 */
export function unitY() {
  return { x: 0, y: 1, z: 0 };
}

/**
 * Create a unit vector in the Z direction
 * @returns {Object} Unit Z vector {x: 0, y: 0, z: 1}
 */
export function unitZ() {
  return { x: 0, y: 0, z: 1 };
}

/**
 * Clamp a value between min and max (helper function)
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
} 