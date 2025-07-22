/**
 * @fileoverview Math Utilities
 * Mathematical utility functions for geometric calculations in editing operations
 */

import * as THREE from 'three';

/**
 * Calculates the distance between two points
 * @param {THREE.Vector3} point1 - First point
 * @param {THREE.Vector3} point2 - Second point
 * @returns {number} Distance between points
 */
export function distance(point1, point2) {
  return point1.distanceTo(point2);
}

/**
 * Calculates the squared distance between two points (faster than distance)
 * @param {THREE.Vector3} point1 - First point
 * @param {THREE.Vector3} point2 - Second point
 * @returns {number} Squared distance between points
 */
export function distanceSquared(point1, point2) {
  return point1.distanceToSquared(point2);
}

/**
 * Finds the closest point on a line to a given point
 * @param {THREE.Vector3} point - The point
 * @param {THREE.Vector3} lineStart - Start of the line
 * @param {THREE.Vector3} lineEnd - End of the line
 * @returns {THREE.Vector3} Closest point on the line
 */
export function closestPointOnLine(point, lineStart, lineEnd) {
  const lineVector = new THREE.Vector3().subVectors(lineEnd, lineStart);
  const pointVector = new THREE.Vector3().subVectors(point, lineStart);
  
  const t = pointVector.dot(lineVector) / lineVector.dot(lineVector);
  const clampedT = Math.max(0, Math.min(1, t));
  
  return new THREE.Vector3().addVectors(
    lineStart,
    lineVector.multiplyScalar(clampedT)
  );
}

/**
 * Finds the closest point on a plane to a given point
 * @param {THREE.Vector3} point - The point
 * @param {THREE.Vector3} planePoint - A point on the plane
 * @param {THREE.Vector3} planeNormal - Normal of the plane
 * @returns {THREE.Vector3} Closest point on the plane
 */
export function closestPointOnPlane(point, planePoint, planeNormal) {
  const normalizedNormal = planeNormal.clone().normalize();
  const distance = point.clone().sub(planePoint).dot(normalizedNormal);
  
  return point.clone().sub(normalizedNormal.multiplyScalar(distance));
}

/**
 * Calculates the angle between two vectors
 * @param {THREE.Vector3} vector1 - First vector
 * @param {THREE.Vector3} vector2 - Second vector
 * @returns {number} Angle in radians
 */
export function angleBetweenVectors(vector1, vector2) {
  const normalized1 = vector1.clone().normalize();
  const normalized2 = vector2.clone().normalize();
  return Math.acos(Math.max(-1, Math.min(1, normalized1.dot(normalized2))));
}

/**
 * Interpolates between two points
 * @param {THREE.Vector3} start - Start point
 * @param {THREE.Vector3} end - End point
 * @param {number} t - Interpolation factor (0-1)
 * @returns {THREE.Vector3} Interpolated point
 */
export function interpolatePoints(start, end, t) {
  return new THREE.Vector3().lerpVectors(start, end, t);
}

/**
 * Calculates the centroid of multiple points
 * @param {Array<THREE.Vector3>} points - Array of points
 * @returns {THREE.Vector3} Centroid
 */
export function calculateCentroid(points) {
  if (points.length === 0) {
    return new THREE.Vector3();
  }
  
  const centroid = new THREE.Vector3();
  points.forEach(point => centroid.add(point));
  centroid.divideScalar(points.length);
  
  return centroid;
}

/**
 * Calculates the bounding box of multiple points
 * @param {Array<THREE.Vector3>} points - Array of points
 * @returns {Object} Bounding box with min and max properties
 */
export function calculateBoundingBox(points) {
  if (points.length === 0) {
    return { min: new THREE.Vector3(), max: new THREE.Vector3() };
  }
  
  const min = points[0].clone();
  const max = points[0].clone();
  
  points.forEach(point => {
    min.min(point);
    max.max(point);
  });
  
  return { min, max };
}

/**
 * Calculates the bounding sphere of multiple points
 * @param {Array<THREE.Vector3>} points - Array of points
 * @returns {Object} Bounding sphere with center and radius properties
 */
export function calculateBoundingSphere(points) {
  if (points.length === 0) {
    return { center: new THREE.Vector3(), radius: 0 };
  }
  
  const centroid = calculateCentroid(points);
  let maxDistance = 0;
  
  points.forEach(point => {
    const distance = point.distanceTo(centroid);
    maxDistance = Math.max(maxDistance, distance);
  });
  
  return { center: centroid, radius: maxDistance };
}

/**
 * Rotates a point around an axis
 * @param {THREE.Vector3} point - Point to rotate
 * @param {THREE.Vector3} axis - Axis of rotation
 * @param {number} angle - Angle in radians
 * @param {THREE.Vector3} center - Center of rotation
 * @returns {THREE.Vector3} Rotated point
 */
export function rotatePointAroundAxis(point, axis, angle, center = new THREE.Vector3()) {
  const matrix = new THREE.Matrix4();
  matrix.makeRotationAxis(axis, angle);
  
  const translatedPoint = point.clone().sub(center);
  translatedPoint.applyMatrix4(matrix);
  translatedPoint.add(center);
  
  return translatedPoint;
}

/**
 * Scales a point from a center
 * @param {THREE.Vector3} point - Point to scale
 * @param {THREE.Vector3} scale - Scale factors
 * @param {THREE.Vector3} center - Center of scaling
 * @returns {THREE.Vector3} Scaled point
 */
export function scalePointFromCenter(point, scale, center = new THREE.Vector3()) {
  const translatedPoint = point.clone().sub(center);
  translatedPoint.multiply(scale);
  translatedPoint.add(center);
  
  return translatedPoint;
}

/**
 * Reflects a point across a plane
 * @param {THREE.Vector3} point - Point to reflect
 * @param {THREE.Vector3} planePoint - Point on the plane
 * @param {THREE.Vector3} planeNormal - Normal of the plane
 * @returns {THREE.Vector3} Reflected point
 */
export function reflectPointAcrossPlane(point, planePoint, planeNormal) {
  const normalizedNormal = planeNormal.clone().normalize();
  const distance = point.clone().sub(planePoint).dot(normalizedNormal);
  
  return point.clone().sub(normalizedNormal.multiplyScalar(2 * distance));
}

/**
 * Calculates the area of a triangle
 * @param {THREE.Vector3} v1 - First vertex
 * @param {THREE.Vector3} v2 - Second vertex
 * @param {THREE.Vector3} v3 - Third vertex
 * @returns {number} Area of the triangle
 */
export function calculateTriangleArea(v1, v2, v3) {
  const edge1 = new THREE.Vector3().subVectors(v2, v1);
  const edge2 = new THREE.Vector3().subVectors(v3, v1);
  const cross = new THREE.Vector3().crossVectors(edge1, edge2);
  
  return cross.length() * 0.5;
}

/**
 * Calculates the volume of a tetrahedron
 * @param {THREE.Vector3} v1 - First vertex
 * @param {THREE.Vector3} v2 - Second vertex
 * @param {THREE.Vector3} v3 - Third vertex
 * @param {THREE.Vector3} v4 - Fourth vertex
 * @returns {number} Volume of the tetrahedron
 */
export function calculateTetrahedronVolume(v1, v2, v3, v4) {
  const edge1 = new THREE.Vector3().subVectors(v2, v1);
  const edge2 = new THREE.Vector3().subVectors(v3, v1);
  const edge3 = new THREE.Vector3().subVectors(v4, v1);
  
  const cross = new THREE.Vector3().crossVectors(edge1, edge2);
  const volume = cross.dot(edge3) / 6;
  
  return Math.abs(volume);
}

/**
 * Checks if a point is inside a triangle
 * @param {THREE.Vector3} point - Point to test
 * @param {THREE.Vector3} v1 - First vertex of triangle
 * @param {THREE.Vector3} v2 - Second vertex of triangle
 * @param {THREE.Vector3} v3 - Third vertex of triangle
 * @returns {boolean} True if point is inside triangle
 */
export function isPointInTriangle(point, v1, v2, v3) {
  const area = calculateTriangleArea(v1, v2, v3);
  const area1 = calculateTriangleArea(point, v2, v3);
  const area2 = calculateTriangleArea(v1, point, v3);
  const area3 = calculateTriangleArea(v1, v2, point);
  
  const tolerance = 1e-10;
  return Math.abs(area - (area1 + area2 + area3)) < tolerance;
}

/**
 * Calculates the signed distance from a point to a plane
 * @param {THREE.Vector3} point - The point
 * @param {THREE.Vector3} planePoint - A point on the plane
 * @param {THREE.Vector3} planeNormal - Normal of the plane
 * @returns {number} Signed distance (positive if on normal side)
 */
export function signedDistanceToPlane(point, planePoint, planeNormal) {
  const normalizedNormal = planeNormal.clone().normalize();
  return point.clone().sub(planePoint).dot(normalizedNormal);
}

/**
 * Clamps a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linearly interpolates between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Smoothly interpolates between two values using smoothstep
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Smoothly interpolated value
 */
export function smoothstep(a, b, t) {
  const smoothT = t * t * (3 - 2 * t);
  return a + (b - a) * smoothT;
} 