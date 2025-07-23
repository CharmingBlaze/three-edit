/**
 * Spatial Raycast Operations - Pure functions for ray-based queries
 * Extracted from query/raycast.ts for better modularity
 */

import { EditableMesh } from '../../core/EditableMesh';
import { Face } from '../../core/Face';
import { Vector3, Ray } from 'three';
import { calculateTriangleNormal, pointInTriangle } from '../../helpers/math/triangle-math';

/**
 * Ray intersection result
 */
export interface RayIntersection {
  face: Face;
  distance: number;
  point: Vector3;
  barycentric: { u: number; v: number; w: number };
  faceIndex: number;
}

/**
 * Find all ray intersections with mesh faces
 */
export function findRayIntersections(
  mesh: EditableMesh,
  ray: Ray,
  maxDistance: number = Infinity
): RayIntersection[] {
  const intersections: RayIntersection[] = [];
  
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    const intersection = intersectRayWithFace(mesh, ray, face, i);
    
    if (intersection && intersection.distance <= maxDistance) {
      intersections.push(intersection);
    }
  }
  
  // Sort by distance
  intersections.sort((a, b) => a.distance - b.distance);
  
  return intersections;
}

/**
 * Find the first ray intersection with mesh faces
 */
export function findFirstRayIntersection(
  mesh: EditableMesh,
  ray: Ray,
  maxDistance: number = Infinity
): RayIntersection | null {
  let closestIntersection: RayIntersection | null = null;
  let closestDistance = maxDistance;
  
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    const intersection = intersectRayWithFace(mesh, ray, face, i);
    
    if (intersection && intersection.distance < closestDistance) {
      closestIntersection = intersection;
      closestDistance = intersection.distance;
    }
  }
  
  return closestIntersection;
}

/**
 * Check if ray intersects with any mesh face
 */
export function hasRayIntersection(
  mesh: EditableMesh,
  ray: Ray,
  maxDistance: number = Infinity
): boolean {
  for (const face of mesh.faces) {
    const intersection = intersectRayWithFace(mesh, ray, face, 0);
    if (intersection && intersection.distance <= maxDistance) {
      return true;
    }
  }
  
  return false;
}

/**
 * Intersect ray with a single face
 */
function intersectRayWithFace(
  mesh: EditableMesh,
  ray: Ray,
  face: Face,
  faceIndex: number
): RayIntersection | null {
  if (face.vertices.length < 3) {
    return null;
  }
  
  // Get face vertices
  const vertices = face.vertices.map(index => mesh.vertices[index]).filter(Boolean);
  if (vertices.length < 3) {
    return null;
  }
  
  // For triangles, use direct intersection
  if (vertices.length === 3) {
    return intersectRayWithTriangle(ray, vertices[0], vertices[1], vertices[2], face, faceIndex);
  }
  
  // For polygons, triangulate and check each triangle
  const triangles = triangulatePolygon(vertices);
  let closestIntersection: RayIntersection | null = null;
  let closestDistance = Infinity;
  
  for (const triangle of triangles) {
    const intersection = intersectRayWithTriangle(
      ray,
      vertices[triangle[0]],
      vertices[triangle[1]],
      vertices[triangle[2]],
      face,
      faceIndex
    );
    
    if (intersection && intersection.distance < closestDistance) {
      closestIntersection = intersection;
      closestDistance = intersection.distance;
    }
  }
  
  return closestIntersection;
}

/**
 * Intersect ray with a triangle
 */
function intersectRayWithTriangle(
  ray: Ray,
  a: any,
  b: any,
  c: any,
  face: Face,
  faceIndex: number
): RayIntersection | null {
  const v0 = new Vector3(b.x - a.x, b.y - a.y, b.z - a.z);
  const v1 = new Vector3(c.x - a.x, c.y - a.y, c.z - a.z);
  const normal = calculateTriangleNormal(
    new Vector3(a.x, a.y, a.z),
    new Vector3(b.x, b.y, b.z),
    new Vector3(c.x, c.y, c.z)
  );
  
  // Check if ray is parallel to triangle
  const dot = ray.direction.dot(normal);
  if (Math.abs(dot) < 1e-6) {
    return null;
  }
  
  // Calculate intersection distance
  const t = (normal.dot(new Vector3(a.x, a.y, a.z)) - normal.dot(ray.origin)) / dot;
  
  if (t < 0) {
    return null;
  }
  
  // Calculate intersection point
  const point = ray.origin.clone().add(ray.direction.clone().multiplyScalar(t));
  
  // Check if point is inside triangle
  if (!pointInTriangle(point, new Vector3(a.x, a.y, a.z), new Vector3(b.x, b.y, b.z), new Vector3(c.x, c.y, c.z))) {
    return null;
  }
  
  // Calculate barycentric coordinates
  const barycentric = calculateBarycentricCoordinates(
    point,
    new Vector3(a.x, a.y, a.z),
    new Vector3(b.x, b.y, b.z),
    new Vector3(c.x, c.y, c.z)
  );
  
  return {
    face,
    distance: t,
    point,
    barycentric,
    faceIndex
  };
}

/**
 * Simple triangulation for ray intersection testing
 */
function triangulatePolygon(vertices: any[]): number[][] {
  const triangles: number[][] = [];
  
  if (vertices.length < 3) {
    return triangles;
  }
  
  // Simple fan triangulation
  for (let i = 1; i < vertices.length - 1; i++) {
    triangles.push([0, i, i + 1]);
  }
  
  return triangles;
}

/**
 * Calculate barycentric coordinates
 */
function calculateBarycentricCoordinates(
  point: Vector3,
  a: Vector3,
  b: Vector3,
  c: Vector3
): { u: number; v: number; w: number } {
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
  const w = 1 - u - v;
  
  return { u, v, w };
} 