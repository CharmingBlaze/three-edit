import { Vector3, Triangle } from 'three';

/**
 * Finds the closest point on a line segment to a given point
 * @param point The query point
 * @param start Start point of the line segment
 * @param end End point of the line segment
 * @returns Object containing the closest point, squared distance, and parameter t
 */
export function closestPointOnLineSegment(
  point: Vector3,
  start: Vector3,
  end: Vector3
): { point: Vector3, distanceSquared: number, parameter: number } {
  const direction = new Vector3().subVectors(end, start);
  const lengthSquared = direction.lengthSq();
  
  if (lengthSquared === 0) {
    // Line segment is a point
    return {
      point: start.clone(),
      distanceSquared: point.distanceToSquared(start),
      parameter: 0
    };
  }
  
  // Calculate parameter t
  const t = Math.max(0, Math.min(1, 
    new Vector3().subVectors(point, start).dot(direction) / lengthSquared
  ));
  
  // Calculate closest point
  const closestPoint = new Vector3().lerpVectors(start, end, t);
  
  return {
    point: closestPoint,
    distanceSquared: point.distanceToSquared(closestPoint),
    parameter: t
  };
}

/**
 * Finds the closest point on a triangle to a given point
 * @param point The query point
 * @param triangle The triangle
 * @returns Object containing the closest point, squared distance, and barycentric coordinates
 */
export function closestPointOnTriangle(
  point: Vector3,
  triangle: Triangle
): { point: Vector3, distanceSquared: number, barycentric: Vector3 } {
  const a = triangle.a;
  const b = triangle.b;
  const c = triangle.c;
  
  // Calculate barycentric coordinates
  const v0 = new Vector3().subVectors(b, a);
  const v1 = new Vector3().subVectors(c, a);
  const v2 = new Vector3().subVectors(point, a);
  
  const d00 = v0.dot(v0);
  const d01 = v0.dot(v1);
  const d11 = v1.dot(v1);
  const d20 = v2.dot(v0);
  const d21 = v2.dot(v1);
  
  const denom = d00 * d11 - d01 * d01;
  let v = 0;
  let w = 0;
  
  if (denom !== 0) {
    v = (d11 * d20 - d01 * d21) / denom;
    w = (d00 * d21 - d01 * d20) / denom;
  }
  
  let u = 1 - v - w;
  
  // Clamp to triangle
  if (u < 0) {
    v = Math.max(0, Math.min(1, v));
    w = Math.max(0, Math.min(1, 1 - v));
  } else if (v < 0) {
    u = Math.max(0, Math.min(1, u));
    w = Math.max(0, Math.min(1, 1 - u));
  } else if (w < 0) {
    u = Math.max(0, Math.min(1, u));
    v = Math.max(0, Math.min(1, 1 - u));
  }
  
  // Calculate closest point
  const closestPoint = new Vector3()
    .addScaledVector(a, u)
    .addScaledVector(b, v)
    .addScaledVector(c, w);
  
  return {
    point: closestPoint,
    distanceSquared: point.distanceToSquared(closestPoint),
    barycentric: new Vector3(u, v, w)
  };
}

/**
 * Checks if a ray intersects with a sphere
 * @param ray The ray
 * @param sphere The sphere (center and radius)
 * @returns Intersection result or null if no intersection
 */
export function rayIntersectsSphere(
  ray: any, // Using any for now since Ray type might not be available
  sphere: { center: Vector3, radius: number }
): { distance: number, point: Vector3 } | null {
  const toCenter = new Vector3().subVectors(sphere.center, ray.origin);
  const projectionLength = toCenter.dot(ray.direction);
  
  if (projectionLength < 0) {
    return null;
  }
  
  const distanceSquared = toCenter.lengthSq() - projectionLength * projectionLength;
  const radiusSquared = sphere.radius * sphere.radius;
  
  if (distanceSquared > radiusSquared) {
    return null;
  }
  
  const halfChord = Math.sqrt(radiusSquared - distanceSquared);
  const distance = projectionLength - halfChord;
  
  if (distance < 0) {
    return null;
  }
  
  const intersectionPoint = new Vector3()
    .copy(ray.origin)
    .addScaledVector(ray.direction, distance);
  
  return {
    distance,
    point: intersectionPoint
  };
}

/**
 * Checks if a ray intersects with a triangle
 * @param ray The ray
 * @param triangle The triangle
 * @returns Intersection result or null if no intersection
 */
export function rayIntersectsTriangle(
  ray: any, // Using any for now since Ray type might not be available
  triangle: Triangle
): { distance: number, point: Vector3, barycentric: Vector3 } | null {
  const a = triangle.a;
  const b = triangle.b;
  const c = triangle.c;
  
  const edge1 = new Vector3().subVectors(b, a);
  const edge2 = new Vector3().subVectors(c, a);
  const h = new Vector3().crossVectors(ray.direction, edge2);
  const a_ = edge1.dot(h);
  
  if (Math.abs(a_) < 1e-6) {
    return null; // Ray is parallel to triangle
  }
  
  const f = 1 / a_;
  const s = new Vector3().subVectors(ray.origin, a);
  const u = f * s.dot(h);
  
  if (u < 0 || u > 1) {
    return null;
  }
  
  const q = new Vector3().crossVectors(s, edge1);
  const v = f * ray.direction.dot(q);
  
  if (v < 0 || u + v > 1) {
    return null;
  }
  
  const t = f * edge2.dot(q);
  
  if (t < 0) {
    return null;
  }
  
  const intersectionPoint = new Vector3()
    .copy(ray.origin)
    .addScaledVector(ray.direction, t);
  
  return {
    distance: t,
    point: intersectionPoint,
    barycentric: new Vector3(1 - u - v, u, v)
  };
}

/**
 * Checks if a ray intersects with a line segment
 * @param ray The ray
 * @param start Start point of the line segment
 * @param end End point of the line segment
 * @returns Intersection result or null if no intersection
 */
export function rayIntersectsLineSegment(
  ray: any, // Using any for now since Ray type might not be available
  start: Vector3,
  end: Vector3
): { distance: number, point: Vector3, parameter: number } | null {
  const direction = new Vector3().subVectors(end, start);
  const cross = new Vector3().crossVectors(ray.direction, direction);
  const det = cross.lengthSq();
  
  if (det < 1e-6) {
    return null; // Lines are parallel
  }
  
  const toStart = new Vector3().subVectors(start, ray.origin);
  const t = new Vector3().crossVectors(toStart, direction).dot(cross) / det;
  const u = new Vector3().crossVectors(toStart, ray.direction).dot(cross) / det;
  
  if (t < 0 || u < 0 || u > 1) {
    return null;
  }
  
  const intersectionPoint = new Vector3()
    .copy(ray.origin)
    .addScaledVector(ray.direction, t);
  
  return {
    distance: t,
    point: intersectionPoint,
    parameter: u
  };
} 