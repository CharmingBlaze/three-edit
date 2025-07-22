/**
 * @fileoverview Matrix Math Operations
 * Matrix mathematical utility functions for the 3D editor
 */

/**
 * Create rotation matrix around X axis
 * @param {number} angle - Rotation angle in radians
 * @returns {Array<Array<number>>} 4x4 rotation matrix
 */
export function rotationMatrixX(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  return [
    [1, 0, 0, 0],
    [0, cos, -sin, 0],
    [0, sin, cos, 0],
    [0, 0, 0, 1]
  ];
}

/**
 * Create rotation matrix around Y axis
 * @param {number} angle - Rotation angle in radians
 * @returns {Array<Array<number>>} 4x4 rotation matrix
 */
export function rotationMatrixY(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  return [
    [cos, 0, sin, 0],
    [0, 1, 0, 0],
    [-sin, 0, cos, 0],
    [0, 0, 0, 1]
  ];
}

/**
 * Create rotation matrix around Z axis
 * @param {number} angle - Rotation angle in radians
 * @returns {Array<Array<number>>} 4x4 rotation matrix
 */
export function rotationMatrixZ(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  return [
    [cos, -sin, 0, 0],
    [sin, cos, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
}

/**
 * Create translation matrix
 * @param {number} x - X translation
 * @param {number} y - Y translation
 * @param {number} z - Z translation
 * @returns {Array<Array<number>>} 4x4 translation matrix
 */
export function translationMatrix(x, y, z) {
  return [
    [1, 0, 0, x],
    [0, 1, 0, y],
    [0, 0, 1, z],
    [0, 0, 0, 1]
  ];
}

/**
 * Create scale matrix
 * @param {number} x - X scale
 * @param {number} y - Y scale
 * @param {number} z - Z scale
 * @returns {Array<Array<number>>} 4x4 scale matrix
 */
export function scaleMatrix(x, y, z) {
  return [
    [x, 0, 0, 0],
    [0, y, 0, 0],
    [0, 0, z, 0],
    [0, 0, 0, 1]
  ];
}

/**
 * Transform a vector by a matrix
 * @param {Array<Array<number>>} matrix - 4x4 transformation matrix
 * @param {Object} vector - Vector {x, y, z}
 * @returns {Object} Transformed vector {x, y, z}
 */
export function transformVector(matrix, vector) {
  const x = matrix[0][0] * vector.x + matrix[0][1] * vector.y + matrix[0][2] * vector.z + matrix[0][3];
  const y = matrix[1][0] * vector.x + matrix[1][1] * vector.y + matrix[1][2] * vector.z + matrix[1][3];
  const z = matrix[2][0] * vector.x + matrix[2][1] * vector.y + matrix[2][2] * vector.z + matrix[2][3];
  
  return { x, y, z };
}

/**
 * Multiply two matrices
 * @param {Array<Array<number>>} a - First matrix
 * @param {Array<Array<number>>} b - Second matrix
 * @returns {Array<Array<number>>} Result matrix
 */
export function multiplyMatrices(a, b) {
  const result = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = [];
    for (let j = 0; j < b[0].length; j++) {
      result[i][j] = 0;
      for (let k = 0; k < a[0].length; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

/**
 * Create identity matrix
 * @returns {Array<Array<number>>} 4x4 identity matrix
 */
export function identityMatrix() {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
} 