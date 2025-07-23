/**
 * Triangle Math Operations - Pure functions for triangle calculations
 * Extracted from math.ts for better modularity
 */

import { Vector3 } from 'three';
import { crossProduct, dotProduct, vectorLength } from './vector-math';

/**
 * Check if three points form a valid triangle
 */
export function isValidTriangle(a: Vector3, b: Vector3, c: Vector3): boolean {
  // Check if any two points are the same
  if (a.equals(b) || b.equals(c) || a.equals(c)) {
    return false;
  }
  
  // Check if the three points are collinear
  const ab = new Vector3().subVectors(b, a);
  const ac = new Vector3().subVectors(c, a);
  const cross = crossProduct(ab, ac);
  
  return vectorLength(cross) > 1e-6;
}

/**
 * Calculate triangle area
 */
export function calculateTriangleArea(a: Vector3, b: Vector3, c: Vector3): number {
  const ab = new Vector3().subVectors(b, a);
  const ac = new Vector3().subVectors(c, a);
  const cross = crossProduct(ab, ac);
  return vectorLength(cross) * 0.5;
}

/**
 * Calculate triangle normal
 */
export function calculateTriangleNormal(a: Vector3, b: Vector3, c: Vector3): Vector3 {
  const ab = new Vector3().subVectors(b, a);
  const ac = new Vector3().subVectors(c, a);
  const normal = crossProduct(ab, ac);
  normal.normalize();
  return normal;
}

/**
 * Calculate triangle centroid
 */
export function calculateTriangleCentroid(a: Vector3, b: Vector3, c: Vector3): Vector3 {
  return new Vector3(
    (a.x + b.x + c.x) / 3,
    (a.y + b.y + c.y) / 3,
    (a.z + b.z + c.z) / 3
  );
}

/**
 * Check if a point is inside a triangle using barycentric coordinates
 */
export function pointInTriangle(point: Vector3, a: Vector3, b: Vector3, c: Vector3): boolean {
  const v0 = new Vector3().subVectors(c, a);
  const v1 = new Vector3().subVectors(b, a);
  const v2 = new Vector3().subVectors(point, a);
  
  const dot00 = dotProduct(v0, v0);
  const dot01 = dotProduct(v0, v1);
  const dot02 = dotProduct(v0, v2);
  const dot11 = dotProduct(v1, v1);
  const dot12 = dotProduct(v1, v2);
  
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  
  return u >= 0 && v >= 0 && u + v <= 1;
}

/**
 * Calculate barycentric coordinates of a point relative to a triangle
 */
export function calculateBarycentricCoordinates(
  point: Vector3,
  a: Vector3,
  b: Vector3,
  c: Vector3
): { u: number; v: number; w: number } {
  const v0 = new Vector3().subVectors(c, a);
  const v1 = new Vector3().subVectors(b, a);
  const v2 = new Vector3().subVectors(point, a);
  
  const dot00 = dotProduct(v0, v0);
  const dot01 = dotProduct(v0, v1);
  const dot02 = dotProduct(v0, v2);
  const dot11 = dotProduct(v1, v1);
  const dot12 = dotProduct(v1, v2);
  
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  const w = 1 - u - v;
  
  return { u, v, w };
}

/**
 * Calculate closest point on triangle to a given point
 */
export function closestPointOnTriangle(
  point: Vector3,
  a: Vector3,
  b: Vector3,
  c: Vector3
): Vector3 {
  const normal = calculateTriangleNormal(a, b, c);
  const planePoint = a;
  
  // Project point onto triangle plane
  const toPoint = new Vector3().subVectors(point, planePoint);
  const distance = dotProduct(toPoint, normal);
  const projectedPoint = new Vector3().subVectors(point, normal.clone().multiplyScalar(distance));
  
  // Check if projected point is inside triangle
  if (pointInTriangle(projectedPoint, a, b, c)) {
    return projectedPoint;
  }
  
  // Find closest point on triangle edges
  const closestOnAB = closestPointOnLineSegment(projectedPoint, a, b);
  const closestOnBC = closestPointOnLineSegment(projectedPoint, b, c);
  const closestOnCA = closestPointOnLineSegment(projectedPoint, c, a);
  
  const distAB = projectedPoint.distanceToSquared(closestOnAB);
  const distBC = projectedPoint.distanceToSquared(closestOnBC);
  const distCA = projectedPoint.distanceToSquared(closestOnCA);
  
  if (distAB <= distBC && distAB <= distCA) {
    return closestOnAB;
  } else if (distBC <= distCA) {
    return closestOnBC;
  } else {
    return closestOnCA;
  }
}

/**
 * Calculate closest point on line segment
 */
function closestPointOnLineSegment(point: Vector3, a: Vector3, b: Vector3): Vector3 {
  const ab = new Vector3().subVectors(b, a);
  const ap = new Vector3().subVectors(point, a);
  
  const t = Math.max(0, Math.min(1, dotProduct(ap, ab) / dotProduct(ab, ab)));
  
  return new Vector3().addVectors(a, ab.clone().multiplyScalar(t));
}

/**
 * Calculate triangle circumcenter
 */
export function calculateTriangleCircumcenter(a: Vector3, b: Vector3, c: Vector3): Vector3 {
  const ab = new Vector3().subVectors(b, a);
  const ac = new Vector3().subVectors(c, a);
  
  const crossAB = crossProduct(ab, ac);
  const lengthSquared = dotProduct(crossAB, crossAB);
  
  if (lengthSquared === 0) {
    // Collinear points, return centroid
    return calculateTriangleCentroid(a, b, c);
  }
  
  const u = crossProduct(crossAB, ab).multiplyScalar(dotProduct(ac, ac) / (2 * lengthSquared));
  const v = crossProduct(ac, crossAB).multiplyScalar(dotProduct(ab, ab) / (2 * lengthSquared));
  
  return new Vector3().addVectors(a, u).add(v);
}

/**
 * Calculate triangle incenter
 */
export function calculateTriangleIncenter(a: Vector3, b: Vector3, c: Vector3): Vector3 {
  const ab = new Vector3().subVectors(b, a);
  const bc = new Vector3().subVectors(c, b);
  const ca = new Vector3().subVectors(a, c);
  
  const lengthAB = vectorLength(ab);
  const lengthBC = vectorLength(bc);
  const lengthCA = vectorLength(ca);
  
  const perimeter = lengthAB + lengthBC + lengthCA;
  
  if (perimeter === 0) return a;
  
  const weightA = lengthBC / perimeter;
  const weightB = lengthCA / perimeter;
  const weightC = lengthAB / perimeter;
  
  return new Vector3(
    a.x * weightA + b.x * weightB + c.x * weightC,
    a.y * weightA + b.y * weightB + c.y * weightC,
    a.z * weightA + b.z * weightB + c.z * weightC
  );
} 