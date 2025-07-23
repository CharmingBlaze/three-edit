/**
 * Math utility functions for three-edit
 * Pure functions for common mathematical operations
 */

import { Vector3 } from 'three';

/**
 * Round a number to a specified number of decimal places
 */
export function roundTo(value: number, decimals: number = 6): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Check if two numbers are close to each other within a tolerance
 */
export function isClose(a: number, b: number, tolerance: number = 1e-6): boolean {
  return Math.abs(a - b) < tolerance;
}

/**
 * Check if a number is approximately zero
 */
export function isZero(value: number, tolerance: number = 1e-6): boolean {
  return Math.abs(value) < tolerance;
}

/**
 * Get the sign of a number (-1, 0, or 1)
 */
export function sign(value: number): number {
  return value > 0 ? 1 : value < 0 ? -1 : 0;
}

/**
 * Calculate the distance between two 3D points
 */
export function distance3D(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate the squared distance between two 3D points (faster than distance3D)
 */
export function distanceSquared3D(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Normalize a value from one range to another
 */
export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

/**
 * Map a normalized value (0-1) to a new range
 */
export function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return outMin + (outMax - outMin) * normalize(value, inMin, inMax);
}

/**
 * Modulo operation that handles negative numbers correctly
 */
export function modulo(n: number, d: number): number {
  return ((n % d) + d) % d;
}

/**
 * Ensure a value is within a valid range, wrapping if necessary
 */
export function wrap(value: number, min: number, max: number): number {
  const range = max - min;
  if (range === 0) return min;
  
  let wrapped = ((value - min) % range + range) % range;
  return wrapped + min;
}

/**
 * Calculate the angle between two 3D vectors in radians
 */
export function angleBetweenVectors(a: Vector3, b: Vector3): number {
  const dot = a.dot(b);
  const magA = a.length();
  const magB = b.length();
  
  if (magA === 0 || magB === 0) return 0;
  
  const cosAngle = clamp(dot / (magA * magB), -1, 1);
  return Math.acos(cosAngle);
}

/**
 * Check if three points form a valid triangle (non-degenerate)
 */
export function isValidTriangle(a: Vector3, b: Vector3, c: Vector3, minArea: number = 1e-10): boolean {
  const ab = new Vector3().subVectors(b, a);
  const ac = new Vector3().subVectors(c, a);
  const cross = new Vector3().crossVectors(ab, ac);
  const area = cross.length() * 0.5;
  
  return area > minArea;
}

/**
 * Calculate the area of a triangle
 */
export function triangleArea(a: Vector3, b: Vector3, c: Vector3): number {
  const ab = new Vector3().subVectors(b, a);
  const ac = new Vector3().subVectors(c, a);
  const cross = new Vector3().crossVectors(ab, ac);
  return cross.length() * 0.5;
}

/**
 * Calculate the centroid (center of mass) of a triangle
 */
export function triangleCentroid(a: Vector3, b: Vector3, c: Vector3): Vector3 {
  return new Vector3(
    (a.x + b.x + c.x) / 3,
    (a.y + b.y + c.y) / 3,
    (a.z + b.z + c.z) / 3
  );
}

/**
 * Check if a point is inside a triangle (barycentric coordinates)
 */
export function pointInTriangle(point: Vector3, a: Vector3, b: Vector3, c: Vector3): boolean {
  const v0 = new Vector3().subVectors(c, a);
  const v1 = new Vector3().subVectors(b, a);
  const v2 = new Vector3().subVectors(point, a);

  const dot00 = v0.dot(v0);
  const dot01 = v0.dot(v1);
  const dot02 = v0.dot(v2);
  const dot11 = v1.dot(v1);
  const dot12 = v1.dot(v2);

  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

  return u >= 0 && v >= 0 && u + v <= 1;
} 