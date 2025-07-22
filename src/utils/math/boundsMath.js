/**
 * @fileoverview Bounds Math Operations
 * Bounds and spatial mathematical utility functions for the 3D editor
 */

/**
 * Check if a point is within bounds
 * @param {Object} point - Point {x, y, z}
 * @param {Object} bounds - Bounds {min: {x, y, z}, max: {x, y, z}}
 * @returns {boolean} True if point is within bounds
 */
export function pointInBounds(point, bounds) {
  return point.x >= bounds.min.x && point.x <= bounds.max.x &&
         point.y >= bounds.min.y && point.y <= bounds.max.y &&
         point.z >= bounds.min.z && point.z <= bounds.max.z;
}

/**
 * Calculate bounding box from array of points
 * @param {Array<Object>} points - Array of points {x, y, z}
 * @returns {Object} Bounding box {min: {x, y, z}, max: {x, y, z}}
 */
export function calculateBounds(points) {
  if (points.length === 0) {
    return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
  }

  let minX = points[0].x;
  let minY = points[0].y;
  let minZ = points[0].z;
  let maxX = points[0].x;
  let maxY = points[0].y;
  let maxZ = points[0].z;

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    minZ = Math.min(minZ, point.z);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
    maxZ = Math.max(maxZ, point.z);
  }

  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ }
  };
}

/**
 * Calculate center of bounding box
 * @param {Object} bounds - Bounding box {min: {x, y, z}, max: {x, y, z}}
 * @returns {Object} Center point {x, y, z}
 */
export function boundsCenter(bounds) {
  return {
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
    z: (bounds.min.z + bounds.max.z) / 2
  };
}

/**
 * Calculate size of bounding box
 * @param {Object} bounds - Bounding box {min: {x, y, z}, max: {x, y, z}}
 * @returns {Object} Size {x, y, z}
 */
export function boundsSize(bounds) {
  return {
    x: bounds.max.x - bounds.min.x,
    y: bounds.max.y - bounds.min.y,
    z: bounds.max.z - bounds.min.z
  };
}

/**
 * Expand bounds to include a point
 * @param {Object} bounds - Bounding box {min: {x, y, z}, max: {x, y, z}}
 * @param {Object} point - Point to include {x, y, z}
 * @returns {Object} Expanded bounding box
 */
export function expandBounds(bounds, point) {
  return {
    min: {
      x: Math.min(bounds.min.x, point.x),
      y: Math.min(bounds.min.y, point.y),
      z: Math.min(bounds.min.z, point.z)
    },
    max: {
      x: Math.max(bounds.max.x, point.x),
      y: Math.max(bounds.max.y, point.y),
      z: Math.max(bounds.max.z, point.z)
    }
  };
}

/**
 * Check if two bounding boxes intersect
 * @param {Object} bounds1 - First bounding box
 * @param {Object} bounds2 - Second bounding box
 * @returns {boolean} True if bounds intersect
 */
export function boundsIntersect(bounds1, bounds2) {
  return bounds1.min.x <= bounds2.max.x && bounds1.max.x >= bounds2.min.x &&
         bounds1.min.y <= bounds2.max.y && bounds1.max.y >= bounds2.min.y &&
         bounds1.min.z <= bounds2.max.z && bounds1.max.z >= bounds2.min.z;
} 