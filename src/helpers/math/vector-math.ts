/**
 * Vector Math Operations - Pure functions for vector calculations
 * Extracted from math.ts for better modularity
 */

import { Vector3 } from 'three';

/**
 * Calculate squared distance between two 3D points
 */
export function distanceSquared3D(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Calculate distance between two 3D points
 */
export function distance3D(a: Vector3, b: Vector3): number {
  return Math.sqrt(distanceSquared3D(a, b));
}

/**
 * Calculate dot product of two vectors
 */
export function dotProduct(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Calculate cross product of two vectors
 */
export function crossProduct(a: Vector3, b: Vector3): Vector3 {
  return new Vector3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}

/**
 * Calculate vector length
 */
export function vectorLength(v: Vector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Normalize a vector
 */
export function normalizeVector(v: Vector3): Vector3 {
  const length = vectorLength(v);
  if (length === 0) return new Vector3(0, 0, 0);
  return new Vector3(v.x / length, v.y / length, v.z / length);
}

/**
 * Add two vectors
 */
export function addVectors(a: Vector3, b: Vector3): Vector3 {
  return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
}

/**
 * Subtract two vectors
 */
export function subtractVectors(a: Vector3, b: Vector3): Vector3 {
  return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
}

/**
 * Multiply vector by scalar
 */
export function multiplyVectorByScalar(v: Vector3, scalar: number): Vector3 {
  return new Vector3(v.x * scalar, v.y * scalar, v.z * scalar);
}

/**
 * Calculate angle between two vectors
 */
export function angleBetweenVectors(a: Vector3, b: Vector3): number {
  const dot = dotProduct(a, b);
  const lengthA = vectorLength(a);
  const lengthB = vectorLength(b);
  
  if (lengthA === 0 || lengthB === 0) return 0;
  
  const cosAngle = dot / (lengthA * lengthB);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}

/**
 * Calculate midpoint between two points
 */
export function midpoint(a: Vector3, b: Vector3): Vector3 {
  return new Vector3(
    (a.x + b.x) * 0.5,
    (a.y + b.y) * 0.5,
    (a.z + b.z) * 0.5
  );
}

/**
 * Calculate centroid of multiple points
 */
export function centroid(points: Vector3[]): Vector3 {
  if (points.length === 0) return new Vector3(0, 0, 0);
  
  const sum = points.reduce((acc, point) => addVectors(acc, point), new Vector3(0, 0, 0));
  return multiplyVectorByScalar(sum, 1 / points.length);
}

/**
 * Check if two vectors are approximately equal
 */
export function vectorsEqual(a: Vector3, b: Vector3, tolerance: number = 1e-6): boolean {
  return distanceSquared3D(a, b) <= tolerance * tolerance;
}

/**
 * Calculate reflection vector
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
 * Calculate projection of vector a onto vector b
 */
export function projectVector(a: Vector3, b: Vector3): Vector3 {
  const dot = dotProduct(a, b);
  const lengthSquared = dotProduct(b, b);
  
  if (lengthSquared === 0) return new Vector3(0, 0, 0);
  
  const scalar = dot / lengthSquared;
  return multiplyVectorByScalar(b, scalar);
} 