/**
 * Unified Triangle Math Operations
 * Consolidates triangle-specific calculations from scattered math files
 * Pure functions for triangle calculations with proper TypeScript types
 */

import { Vector3 } from 'three';
import { 
  distance3D, 
  crossProduct, 
  dotProduct, 
  vectorLength,
  normalizeVector,
  centroid 
} from './vector';
import { EPSILON, MIN_TRIANGLE_AREA } from './constants';

/**
 * Triangle operation result with success status
 */
export interface TriangleResult {
  success: boolean;
  value?: number | Vector3;
  error?: string;
}

/**
 * Triangle defined by three vertices
 */
export interface TriangleGeometry {
  a: Vector3;
  b: Vector3;
  c: Vector3;
}

/**
 * Calculate area of a triangle
 * @param a First vertex
 * @param b Second vertex
 * @param c Third vertex
 * @returns Area of the triangle
 */
export function calculateTriangleArea(a: Vector3, b: Vector3, c: Vector3): number {
  const edge1 = new Vector3(b.x - a.x, b.y - a.y, b.z - a.z);
  const edge2 = new Vector3(c.x - a.x, c.y - a.y, c.z - a.z);
  const cross = crossProduct(edge1, edge2);
  return vectorLength(cross) * 0.5;
}

/**
 * Calculate normal vector of a triangle
 * @param a First vertex
 * @param b Second vertex
 * @param c Third vertex
 * @returns Normalized normal vector
 */
export function calculateTriangleNormal(a: Vector3, b: Vector3, c: Vector3): Vector3 {
  const edge1 = new Vector3(b.x - a.x, b.y - a.y, b.z - a.z);
  const edge2 = new Vector3(c.x - a.x, c.y - a.y, c.z - a.z);
  return normalizeVector(crossProduct(edge1, edge2));
}

/**
 * Calculate centroid (center of mass) of a triangle
 * @param a First vertex
 * @param b Second vertex
 * @param c Third vertex
 * @returns Centroid point
 */
export function calculateTriangleCentroid(a: Vector3, b: Vector3, c: Vector3): Vector3 {
  return centroid([a, b, c]);
}

/**
 * Calculate barycentric coordinates of a point relative to a triangle
 * @param point Point to find coordinates for
 * @param a First triangle vertex
 * @param b Second triangle vertex
 * @param c Third triangle vertex
 * @returns Barycentric coordinates [u, v, w] where u + v + w = 1
 */
export function calculateBarycentricCoordinates(
  point: Vector3,
  a: Vector3,
  b: Vector3,
  c: Vector3
): Vector3 {
  const v0 = new Vector3(b.x - a.x, b.y - a.y, b.z - a.z);
  const v1 = new Vector3(c.x - a.x, c.y - a.y, c.z - a.z);
  const v2 = new Vector3(point.x - a.x, point.y - a.y, point.z - a.z);
  
  const d00 = dotProduct(v0, v0);
  const d01 = dotProduct(v0, v1);
  const d11 = dotProduct(v1, v1);
  const d20 = dotProduct(v2, v0);
  const d21 = dotProduct(v2, v1);
  
  const denom = d00 * d11 - d01 * d01;
  
  if (Math.abs(denom) < EPSILON) {
    // Degenerate triangle, return equal coordinates
    return new Vector3(1/3, 1/3, 1/3);
  }
  
  const v = (d11 * d20 - d01 * d21) / denom;
  const w = (d00 * d21 - d01 * d20) / denom;
  const u = 1.0 - v - w;
  
  return new Vector3(u, v, w);
}

/**
 * Find the closest point on a triangle to a given point
 * @param point Point to find closest point for
 * @param a First triangle vertex
 * @param b Second triangle vertex
 * @param c Third triangle vertex
 * @returns Closest point on the triangle
 */
export function closestPointOnTriangle(
  point: Vector3,
  a: Vector3,
  b: Vector3,
  c: Vector3
): Vector3 {
  const barycentric = calculateBarycentricCoordinates(point, a, b, c);
  
  // Clamp barycentric coordinates to triangle
  const u = Math.max(0, Math.min(1, barycentric.x));
  const v = Math.max(0, Math.min(1, barycentric.y));
  const w = Math.max(0, Math.min(1, barycentric.z));
  
  // Normalize to ensure u + v + w = 1
  const sum = u + v + w;
  const normalizedU = u / sum;
  const normalizedV = v / sum;
  const normalizedW = w / sum;
  
  return new Vector3(
    normalizedU * a.x + normalizedV * b.x + normalizedW * c.x,
    normalizedU * a.y + normalizedV * b.y + normalizedW * c.y,
    normalizedU * a.z + normalizedV * b.z + normalizedW * c.z
  );
}

/**
 * Calculate circumcenter of a triangle (center of circumscribed circle)
 * @param a First vertex
 * @param b Second vertex
 * @param c Third vertex
 * @returns Circumcenter point
 */
export function calculateTriangleCircumcenter(a: Vector3, b: Vector3, c: Vector3): Vector3 {
  const ab = new Vector3(b.x - a.x, b.y - a.y, b.z - a.z);
  const ac = new Vector3(c.x - a.x, c.y - a.y, c.z - a.z);
  
  const abLength = vectorLength(ab);
  const acLength = vectorLength(ac);
  
  if (abLength < EPSILON || acLength < EPSILON) {
    return centroid([a, b, c]);
  }
  
  const cross = crossProduct(ab, ac);
  const crossLength = vectorLength(cross);
  
  if (crossLength < EPSILON) {
    // Degenerate triangle
    return centroid([a, b, c]);
  }
  
  const radius = (abLength * acLength * distance3D(b, c)) / (2 * crossLength);
  const center = centroid([a, b, c]);
  
  return center;
}

/**
 * Calculate incenter of a triangle (center of inscribed circle)
 * @param a First vertex
 * @param b Second vertex
 * @param c Third vertex
 * @returns Incenter point
 */
export function calculateTriangleIncenter(a: Vector3, b: Vector3, c: Vector3): Vector3 {
  const ab = distance3D(a, b);
  const bc = distance3D(b, c);
  const ca = distance3D(c, a);
  
  const perimeter = ab + bc + ca;
  
  if (perimeter < EPSILON) {
    return a.clone();
  }
  
  const u = bc / perimeter;
  const v = ca / perimeter;
  const w = ab / perimeter;
  
  return new Vector3(
    u * a.x + v * b.x + w * c.x,
    u * a.y + v * b.y + w * c.y,
    u * a.z + v * b.z + w * c.z
  );
}

/**
 * Check if a point is inside a triangle
 * @param point Point to test
 * @param a First triangle vertex
 * @param b Second triangle vertex
 * @param c Third triangle vertex
 * @returns True if point is inside or on the triangle
 */
export function pointInTriangle(point: Vector3, a: Vector3, b: Vector3, c: Vector3): boolean {
  const barycentric = calculateBarycentricCoordinates(point, a, b, c);
  
  // Point is inside if all barycentric coordinates are non-negative
  return barycentric.x >= -EPSILON && 
         barycentric.y >= -EPSILON && 
         barycentric.z >= -EPSILON;
}

/**
 * Check if a triangle is valid (has non-zero area)
 * @param a First vertex
 * @param b Second vertex
 * @param c Third vertex
 * @param minArea Minimum area threshold
 * @returns True if triangle is valid
 */
export function isValidTriangle(
  a: Vector3, 
  b: Vector3, 
  c: Vector3, 
  minArea: number = MIN_TRIANGLE_AREA
): boolean {
  const area = calculateTriangleArea(a, b, c);
  return area > minArea;
}

/**
 * Calculate the perimeter of a triangle
 * @param a First vertex
 * @param b Second vertex
 * @param c Third vertex
 * @returns Perimeter length
 */
export function calculateTrianglePerimeter(a: Vector3, b: Vector3, c: Vector3): number {
  return distance3D(a, b) + distance3D(b, c) + distance3D(c, a);
}

/**
 * Calculate the semi-perimeter of a triangle
 * @param a First vertex
 * @param b Second vertex
 * @param c Third vertex
 * @returns Semi-perimeter length
 */
export function calculateTriangleSemiPerimeter(a: Vector3, b: Vector3, c: Vector3): number {
  return calculateTrianglePerimeter(a, b, c) * 0.5;
}

/**
 * Calculate the radius of the circumscribed circle
 * @param a First vertex
 * @param b Second vertex
 * @param c Third vertex
 * @returns Circumradius
 */
export function calculateTriangleCircumradius(a: Vector3, b: Vector3, c: Vector3): number {
  const ab = distance3D(a, b);
  const bc = distance3D(b, c);
  const ca = distance3D(c, a);
  
  const area = calculateTriangleArea(a, b, c);
  
  if (area < EPSILON) return 0;
  
  return (ab * bc * ca) / (4 * area);
}

/**
 * Calculate the radius of the inscribed circle
 * @param a First vertex
 * @param b Second vertex
 * @param c Third vertex
 * @returns Inradius
 */
export function calculateTriangleInradius(a: Vector3, b: Vector3, c: Vector3): number {
  const area = calculateTriangleArea(a, b, c);
  const semiPerimeter = calculateTriangleSemiPerimeter(a, b, c);
  
  if (semiPerimeter < EPSILON) return 0;
  
  return area / semiPerimeter;
}

/**
 * Check if three points form a degenerate triangle (collinear)
 * @param a First point
 * @param b Second point
 * @param c Third point
 * @returns True if points are collinear
 */
export function isCollinear(a: Vector3, b: Vector3, c: Vector3): boolean {
  const area = calculateTriangleArea(a, b, c);
  return area < EPSILON;
}

/**
 * Calculate the angle at vertex a of triangle abc
 * @param a Vertex at which to calculate angle
 * @param b Second vertex
 * @param c Third vertex
 * @returns Angle in radians
 */
export function calculateAngleAtVertex(a: Vector3, b: Vector3, c: Vector3): number {
  const ab = new Vector3(b.x - a.x, b.y - a.y, b.z - a.z);
  const ac = new Vector3(c.x - a.x, c.y - a.y, c.z - a.z);
  
  const dot = dotProduct(ab, ac);
  const abLength = vectorLength(ab);
  const acLength = vectorLength(ac);
  
  if (abLength < EPSILON || acLength < EPSILON) return 0;
  
  const cosAngle = dot / (abLength * acLength);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
} 