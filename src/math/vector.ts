/**
 * Unified Vector Math Operations
 * Consolidates all vector operations from scattered math files
 * Pure functions for vector calculations with proper TypeScript types
 */

import { Vector3 } from 'three';
import { EPSILON, GEOMETRY_EPSILON } from './constants';

/**
 * Vector operation result with success status
 */
export interface VectorResult {
  success: boolean;
  vector?: Vector3;
  error?: string;
}

/**
 * Calculate squared distance between two 3D points
 * @param a First point
 * @param b Second point
 * @returns Squared distance (faster than distance3D)
 */
export function distanceSquared3D(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Calculate distance between two 3D points
 * @param a First point
 * @param b Second point
 * @returns Distance between points
 */
export function distance3D(a: Vector3, b: Vector3): number {
  return Math.sqrt(distanceSquared3D(a, b));
}

/**
 * Calculate dot product of two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Dot product
 */
export function dotProduct(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Calculate cross product of two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Cross product vector
 */
export function crossProduct(a: Vector3, b: Vector3): Vector3 {
  return new Vector3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}

/**
 * Calculate vector length (magnitude)
 * @param v Vector
 * @returns Length of the vector
 */
export function vectorLength(v: Vector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Normalize a vector to unit length
 * @param v Vector to normalize
 * @returns Normalized vector, or zero vector if input is zero
 */
export function normalizeVector(v: Vector3): Vector3 {
  const length = vectorLength(v);
  if (length < EPSILON) return new Vector3(0, 0, 0);
  return new Vector3(v.x / length, v.y / length, v.z / length);
}

/**
 * Add two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Sum of vectors
 */
export function addVectors(a: Vector3, b: Vector3): Vector3 {
  return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
}

/**
 * Subtract two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Difference of vectors (a - b)
 */
export function subtractVectors(a: Vector3, b: Vector3): Vector3 {
  return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
}

/**
 * Multiply vector by scalar
 * @param v Vector
 * @param scalar Scalar value
 * @returns Scaled vector
 */
export function multiplyVectorByScalar(v: Vector3, scalar: number): Vector3 {
  return new Vector3(v.x * scalar, v.y * scalar, v.z * scalar);
}

/**
 * Calculate angle between two vectors in radians
 * @param a First vector
 * @param b Second vector
 * @returns Angle in radians
 */
export function angleBetweenVectors(a: Vector3, b: Vector3): number {
  const dot = dotProduct(a, b);
  const lengthA = vectorLength(a);
  const lengthB = vectorLength(b);
  
  if (lengthA < EPSILON || lengthB < EPSILON) return 0;
  
  const cosAngle = dot / (lengthA * lengthB);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}

/**
 * Calculate midpoint between two points
 * @param a First point
 * @param b Second point
 * @returns Midpoint
 */
export function midpoint(a: Vector3, b: Vector3): Vector3 {
  return new Vector3(
    (a.x + b.x) * 0.5,
    (a.y + b.y) * 0.5,
    (a.z + b.z) * 0.5
  );
}

/**
 * Calculate centroid (average) of multiple points
 * @param points Array of points
 * @returns Centroid point
 */
export function centroid(points: Vector3[]): Vector3 {
  if (points.length === 0) return new Vector3(0, 0, 0);
  
  const sum = points.reduce(
    (acc, point) => addVectors(acc, point),
    new Vector3(0, 0, 0)
  );
  
  return multiplyVectorByScalar(sum, 1 / points.length);
}

/**
 * Check if two vectors are equal within tolerance
 * @param a First vector
 * @param b Second vector
 * @param tolerance Tolerance for comparison
 * @returns True if vectors are equal within tolerance
 */
export function vectorsEqual(a: Vector3, b: Vector3, tolerance: number = EPSILON): boolean {
  return Math.abs(a.x - b.x) < tolerance &&
         Math.abs(a.y - b.y) < tolerance &&
         Math.abs(a.z - b.z) < tolerance;
}

/**
 * Reflect a vector off a surface with given normal
 * @param incident Incident vector
 * @param normal Surface normal (should be normalized)
 * @returns Reflected vector
 */
export function reflectVector(incident: Vector3, normal: Vector3): Vector3 {
  const dot = dotProduct(incident, normal);
  return new Vector3(
    incident.x - 2 * dot * normal.x,
    incident.y - 2 * dot * normal.y,
    incident.z - 2 * dot * normal.z
  );
}

/**
 * Project vector a onto vector b
 * @param a Vector to project
 * @param b Vector to project onto
 * @returns Projected vector
 */
export function projectVector(a: Vector3, b: Vector3): Vector3 {
  const lengthB = vectorLength(b);
  if (lengthB < EPSILON) return new Vector3(0, 0, 0);
  
  const dot = dotProduct(a, b);
  const scale = dot / (lengthB * lengthB);
  
  return multiplyVectorByScalar(b, scale);
}

/**
 * Linear interpolation between two vectors
 * @param a First vector
 * @param b Second vector
 * @param t Interpolation factor (0-1)
 * @returns Interpolated vector
 */
export function lerpVectors(a: Vector3, b: Vector3, t: number): Vector3 {
  return new Vector3(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t,
    a.z + (b.z - a.z) * t
  );
}

/**
 * Spherical linear interpolation between two vectors
 * @param a First vector
 * @param b Second vector
 * @param t Interpolation factor (0-1)
 * @returns Interpolated vector
 */
export function slerpVectors(a: Vector3, b: Vector3, t: number): Vector3 {
  const dot = dotProduct(a, b);
  const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
  
  if (theta < EPSILON) return a.clone();
  
  const sinTheta = Math.sin(theta);
  const wa = Math.sin((1 - t) * theta) / sinTheta;
  const wb = Math.sin(t * theta) / sinTheta;
  
  return addVectors(
    multiplyVectorByScalar(a, wa),
    multiplyVectorByScalar(b, wb)
  );
}

/**
 * Check if a vector is zero within tolerance
 * @param v Vector to check
 * @param tolerance Tolerance for comparison
 * @returns True if vector is approximately zero
 */
export function isZeroVector(v: Vector3, tolerance: number = EPSILON): boolean {
  return Math.abs(v.x) < tolerance &&
         Math.abs(v.y) < tolerance &&
         Math.abs(v.z) < tolerance;
}

/**
 * Get the minimum component of a vector
 * @param v Vector
 * @returns Minimum component value
 */
export function minComponent(v: Vector3): number {
  return Math.min(v.x, v.y, v.z);
}

/**
 * Get the maximum component of a vector
 * @param v Vector
 * @returns Maximum component value
 */
export function maxComponent(v: Vector3): number {
  return Math.max(v.x, v.y, v.z);
}

/**
 * Clamp vector components to a range
 * @param v Vector to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped vector
 */
export function clampVector(v: Vector3, min: number, max: number): Vector3 {
  return new Vector3(
    Math.max(min, Math.min(max, v.x)),
    Math.max(min, Math.min(max, v.y)),
    Math.max(min, Math.min(max, v.z))
  );
}

/**
 * Round vector components to specified decimal places
 * @param v Vector to round
 * @param decimals Number of decimal places
 * @returns Rounded vector
 */
export function roundVector(v: Vector3, decimals: number = 6): Vector3 {
  const factor = Math.pow(10, decimals);
  return new Vector3(
    Math.round(v.x * factor) / factor,
    Math.round(v.y * factor) / factor,
    Math.round(v.z * factor) / factor
  );
} 