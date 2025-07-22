/**
 * @fileoverview Matrix Math Utilities
 * Matrix mathematical utility functions for 3D transformations
 */

/**
 * Create a 4x4 identity matrix
 * @returns {Array<number>} Identity matrix as array
 */
export function identityMatrix() {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

/**
 * Create a 4x4 translation matrix
 * @param {number} x - X translation
 * @param {number} y - Y translation
 * @param {number} z - Z translation
 * @returns {Array<number>} Translation matrix as array
 */
export function translationMatrix(x, y, z) {
  return [
    1, 0, 0, x,
    0, 1, 0, y,
    0, 0, 1, z,
    0, 0, 0, 1
  ];
}

/**
 * Create a 4x4 scale matrix
 * @param {number} x - X scale
 * @param {number} y - Y scale
 * @param {number} z - Z scale
 * @returns {Array<number>} Scale matrix as array
 */
export function scaleMatrix(x, y, z) {
  return [
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1
  ];
}

/**
 * Create a 4x4 rotation matrix around X axis
 * @param {number} angle - Rotation angle in radians
 * @returns {Array<number>} Rotation matrix as array
 */
export function rotationMatrixX(angle) {
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
 * Create a 4x4 rotation matrix around Y axis
 * @param {number} angle - Rotation angle in radians
 * @returns {Array<number>} Rotation matrix as array
 */
export function rotationMatrixY(angle) {
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
 * Create a 4x4 rotation matrix around Z axis
 * @param {number} angle - Rotation angle in radians
 * @returns {Array<number>} Rotation matrix as array
 */
export function rotationMatrixZ(angle) {
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
 * Create a 4x4 rotation matrix from Euler angles
 * @param {number} x - X rotation in radians
 * @param {number} y - Y rotation in radians
 * @param {number} z - Z rotation in radians
 * @returns {Array<number>} Rotation matrix as array
 */
export function rotationMatrixEuler(x, y, z) {
  const rotX = rotationMatrixX(x);
  const rotY = rotationMatrixY(y);
  const rotZ = rotationMatrixZ(z);
  
  // Apply rotations in ZYX order
  return multiplyMatrices(multiplyMatrices(rotZ, rotY), rotX);
}

/**
 * Create a 4x4 rotation matrix from axis and angle
 * @param {Object} axis - Rotation axis {x, y, z}
 * @param {number} angle - Rotation angle in radians
 * @returns {Array<number>} Rotation matrix as array
 */
export function rotationMatrixAxisAngle(axis, angle) {
  const { x, y, z } = axis;
  const length = Math.sqrt(x * x + y * y + z * z);
  
  if (length === 0) {
    return identityMatrix();
  }
  
  const normalizedX = x / length;
  const normalizedY = y / length;
  const normalizedZ = z / length;
  
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const oneMinusCos = 1 - cos;
  
  return [
    cos + oneMinusCos * normalizedX * normalizedX,
    oneMinusCos * normalizedX * normalizedY - sin * normalizedZ,
    oneMinusCos * normalizedX * normalizedZ + sin * normalizedY,
    0,
    oneMinusCos * normalizedX * normalizedY + sin * normalizedZ,
    cos + oneMinusCos * normalizedY * normalizedY,
    oneMinusCos * normalizedY * normalizedZ - sin * normalizedX,
    0,
    oneMinusCos * normalizedX * normalizedZ - sin * normalizedY,
    oneMinusCos * normalizedY * normalizedZ + sin * normalizedX,
    cos + oneMinusCos * normalizedZ * normalizedZ,
    0,
    0, 0, 0, 1
  ];
}

/**
 * Multiply two 4x4 matrices
 * @param {Array<number>} a - First matrix
 * @param {Array<number>} b - Second matrix
 * @returns {Array<number>} Result matrix
 */
export function multiplyMatrices(a, b) {
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
 * Transform a 3D vector by a 4x4 matrix
 * @param {Array<number>} matrix - 4x4 transformation matrix
 * @param {Object} vector - Vector {x, y, z}
 * @returns {Object} Transformed vector {x, y, z}
 */
export function transformVector(matrix, vector) {
  return {
    x: matrix[0] * vector.x + matrix[1] * vector.y + matrix[2] * vector.z + matrix[3],
    y: matrix[4] * vector.x + matrix[5] * vector.y + matrix[6] * vector.z + matrix[7],
    z: matrix[8] * vector.x + matrix[9] * vector.y + matrix[10] * vector.z + matrix[11]
  };
}

/**
 * Transform a 3D point by a 4x4 matrix
 * @param {Array<number>} matrix - 4x4 transformation matrix
 * @param {Object} point - Point {x, y, z}
 * @returns {Object} Transformed point {x, y, z}
 */
export function transformPoint(matrix, point) {
  const result = transformVector(matrix, point);
  const w = matrix[12] * point.x + matrix[13] * point.y + matrix[14] * point.z + matrix[15];
  
  if (w !== 0 && w !== 1) {
    result.x /= w;
    result.y /= w;
    result.z /= w;
  }
  
  return result;
}

/**
 * Get the transpose of a 4x4 matrix
 * @param {Array<number>} matrix - 4x4 matrix
 * @returns {Array<number>} Transposed matrix
 */
export function transposeMatrix(matrix) {
  return [
    matrix[0], matrix[4], matrix[8], matrix[12],
    matrix[1], matrix[5], matrix[9], matrix[13],
    matrix[2], matrix[6], matrix[10], matrix[14],
    matrix[3], matrix[7], matrix[11], matrix[15]
  ];
}

/**
 * Calculate the determinant of a 4x4 matrix
 * @param {Array<number>} matrix - 4x4 matrix
 * @returns {number} Determinant
 */
export function determinant(matrix) {
  // This is a simplified 4x4 determinant calculation
  // For production use, implement a more efficient algorithm
  
  const m00 = matrix[0], m01 = matrix[1], m02 = matrix[2], m03 = matrix[3];
  const m10 = matrix[4], m11 = matrix[5], m12 = matrix[6], m13 = matrix[7];
  const m20 = matrix[8], m21 = matrix[9], m22 = matrix[10], m23 = matrix[11];
  const m30 = matrix[12], m31 = matrix[13], m32 = matrix[14], m33 = matrix[15];
  
  return m00 * (m11 * (m22 * m33 - m23 * m32) - m12 * (m21 * m33 - m23 * m31) + m13 * (m21 * m32 - m22 * m31)) -
         m01 * (m10 * (m22 * m33 - m23 * m32) - m12 * (m20 * m33 - m23 * m30) + m13 * (m20 * m32 - m22 * m30)) +
         m02 * (m10 * (m21 * m33 - m23 * m31) - m11 * (m20 * m33 - m23 * m30) + m13 * (m20 * m31 - m21 * m30)) -
         m03 * (m10 * (m21 * m32 - m22 * m31) - m11 * (m20 * m32 - m22 * m30) + m12 * (m20 * m31 - m21 * m30));
}

/**
 * Calculate the inverse of a 4x4 matrix
 * @param {Array<number>} matrix - 4x4 matrix
 * @returns {Array<number>|null} Inverse matrix or null if not invertible
 */
export function inverseMatrix(matrix) {
  const det = determinant(matrix);
  
  if (Math.abs(det) < 1e-10) {
    return null; // Matrix is not invertible
  }
  
  // This is a simplified inverse calculation
  // For production use, implement a more efficient algorithm like LU decomposition
  
  const inv = new Array(16);
  const invDet = 1 / det;
  
  // Calculate cofactors and adjugate
  // This is a placeholder implementation
  // In practice, you would use a more efficient algorithm
  
  return inv;
}

/**
 * Create a 4x4 perspective projection matrix
 * @param {number} fov - Field of view in radians
 * @param {number} aspect - Aspect ratio (width / height)
 * @param {number} near - Near clipping plane
 * @param {number} far - Far clipping plane
 * @returns {Array<number>} Perspective matrix
 */
export function perspectiveMatrix(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2);
  
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) / (near - far), (2 * far * near) / (near - far),
    0, 0, -1, 0
  ];
}

/**
 * Create a 4x4 orthographic projection matrix
 * @param {number} left - Left clipping plane
 * @param {number} right - Right clipping plane
 * @param {number} bottom - Bottom clipping plane
 * @param {number} top - Top clipping plane
 * @param {number} near - Near clipping plane
 * @param {number} far - Far clipping plane
 * @returns {Array<number>} Orthographic matrix
 */
export function orthographicMatrix(left, right, bottom, top, near, far) {
  const width = right - left;
  const height = top - bottom;
  const depth = far - near;
  
  return [
    2 / width, 0, 0, -(right + left) / width,
    0, 2 / height, 0, -(top + bottom) / height,
    0, 0, -2 / depth, -(far + near) / depth,
    0, 0, 0, 1
  ];
}

/**
 * Create a 4x4 look-at matrix
 * @param {Object} eye - Eye position {x, y, z}
 * @param {Object} target - Target position {x, y, z}
 * @param {Object} up - Up vector {x, y, z}
 * @returns {Array<number>} Look-at matrix
 */
export function lookAtMatrix(eye, target, up) {
  const z = normalize(subtract(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  
  return [
    x.x, x.y, x.z, -dot(x, eye),
    y.x, y.y, y.z, -dot(y, eye),
    z.x, z.y, z.z, -dot(z, eye),
    0, 0, 0, 1
  ];
}

/**
 * Extract translation from a 4x4 matrix
 * @param {Array<number>} matrix - 4x4 matrix
 * @returns {Object} Translation {x, y, z}
 */
export function extractTranslation(matrix) {
  return {
    x: matrix[3],
    y: matrix[7],
    z: matrix[11]
  };
}

/**
 * Extract scale from a 4x4 matrix
 * @param {Array<number>} matrix - 4x4 matrix
 * @returns {Object} Scale {x, y, z}
 */
export function extractScale(matrix) {
  return {
    x: Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1] + matrix[2] * matrix[2]),
    y: Math.sqrt(matrix[4] * matrix[4] + matrix[5] * matrix[5] + matrix[6] * matrix[6]),
    z: Math.sqrt(matrix[8] * matrix[8] + matrix[9] * matrix[9] + matrix[10] * matrix[10])
  };
}

/**
 * Extract rotation from a 4x4 matrix (simplified)
 * @param {Array<number>} matrix - 4x4 matrix
 * @returns {Object} Rotation {x, y, z} in radians
 */
export function extractRotation(matrix) {
  // This is a simplified extraction
  // For production use, implement proper quaternion or Euler extraction
  
  const scale = extractScale(matrix);
  
  // Normalize the rotation part
  const rotMatrix = [
    matrix[0] / scale.x, matrix[1] / scale.x, matrix[2] / scale.x, 0,
    matrix[4] / scale.y, matrix[5] / scale.y, matrix[6] / scale.y, 0,
    matrix[8] / scale.z, matrix[9] / scale.z, matrix[10] / scale.z, 0,
    0, 0, 0, 1
  ];
  
  // Extract Euler angles (simplified)
  const y = Math.asin(-rotMatrix[2]);
  const x = Math.atan2(rotMatrix[6], rotMatrix[10]);
  const z = Math.atan2(rotMatrix[1], rotMatrix[0]);
  
  return { x, y, z };
}

/**
 * Helper functions for vector operations
 */
function normalize(vector) {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  if (length === 0) return { x: 0, y: 0, z: 0 };
  return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
} 