import { Vector3, Ray, Triangle } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { RayIntersectionOptions, RayIntersectionResult } from './types';
import { rayIntersectsSphere, rayIntersectsTriangle, rayIntersectsLineSegment } from './geometry';

/**
 * Finds all intersections of a ray with mesh elements
 * @param mesh The mesh to test against
 * @param ray The ray to test
 * @param options Query options
 * @returns Array of intersection results, sorted by distance
 */
export function findRayIntersections(
  mesh: EditableMesh,
  ray: Ray,
  options: RayIntersectionOptions = {}
): RayIntersectionResult[] {
  const opts = {
    maxDistance: options.maxDistance ?? Infinity,
    includeVertices: options.includeVertices ?? true,
    includeEdges: options.includeEdges ?? true,
    includeFaces: options.includeFaces ?? true,
    vertexIndices: options.vertexIndices,
    edgeIndices: options.edgeIndices,
    faceIndices: options.faceIndices,
    vertexRadius: options.vertexRadius ?? 0.1
  };
  
  const intersections: RayIntersectionResult[] = [];
  
  // Check vertices
  if (opts.includeVertices) {
    for (let i = 0; i < mesh.vertices.length; i++) {
      if (opts.vertexIndices && !opts.vertexIndices.has(i)) {
        continue;
      }
      
      const vertex = mesh.vertices[i];
      const sphere = {
        center: new Vector3(vertex.x, vertex.y, vertex.z),
        radius: opts.vertexRadius
      };
      
      const intersection = rayIntersectsSphere(ray, sphere);
      if (intersection && intersection.distance <= opts.maxDistance) {
        intersections.push({
          type: 'vertex',
          index: i,
          distance: intersection.distance,
          point: intersection.point
        });
      }
    }
  }
  
  // Check edges
  if (opts.includeEdges) {
    for (let i = 0; i < mesh.edges.length; i++) {
      if (opts.edgeIndices && !opts.edgeIndices.has(i)) {
        continue;
      }
      
      const edge = mesh.edges[i];
      const v1 = mesh.getVertex(edge.v1);
      const v2 = mesh.getVertex(edge.v2);
      
      if (!v1 || !v2) {
        continue;
      }
      
      const start = new Vector3(v1.x, v1.y, v1.z);
      const end = new Vector3(v2.x, v2.y, v2.z);
      
      const intersection = rayIntersectsLineSegment(ray, start, end);
      if (intersection && intersection.distance <= opts.maxDistance) {
        intersections.push({
          type: 'edge',
          index: i,
          distance: intersection.distance,
          point: intersection.point,
          parameter: intersection.parameter
        });
      }
    }
  }
  
  // Check faces
  if (opts.includeFaces) {
    for (let i = 0; i < mesh.faces.length; i++) {
      if (opts.faceIndices && !opts.faceIndices.has(i)) {
        continue;
      }
      
      const face = mesh.faces[i];
      
      // Create triangle from face vertices
      const v1 = mesh.getVertex(face.vertices[0]);
      const v2 = mesh.getVertex(face.vertices[1]);
      const v3 = mesh.getVertex(face.vertices[2]);
      
      if (!v1 || !v2 || !v3) {
        continue;
      }
      
      const triangle = new Triangle(
        new Vector3(v1.x, v1.y, v1.z),
        new Vector3(v2.x, v2.y, v2.z),
        new Vector3(v3.x, v3.y, v3.z)
      );
      
      const intersection = rayIntersectsTriangle(ray, triangle);
      if (intersection && intersection.distance <= opts.maxDistance) {
        intersections.push({
          type: 'face',
          index: i,
          distance: intersection.distance,
          point: intersection.point,
          barycentric: intersection.barycentric
        });
      }
    }
  }
  
  // Sort by distance
  intersections.sort((a, b) => a.distance - b.distance);
  
  return intersections;
}

/**
 * Finds the first intersection of a ray with mesh elements
 * @param mesh The mesh to test against
 * @param ray The ray to test
 * @param options Query options
 * @returns The first intersection result, or null if none found
 */
export function findFirstRayIntersection(
  mesh: EditableMesh,
  ray: Ray,
  options: RayIntersectionOptions = {}
): RayIntersectionResult | null {
  const intersections = findRayIntersections(mesh, ray, options);
  return intersections.length > 0 ? intersections[0] : null;
}

/**
 * Checks if a ray intersects with any mesh elements
 * @param mesh The mesh to test against
 * @param ray The ray to test
 * @param options Query options
 * @returns True if the ray intersects with any element
 */
export function hasRayIntersection(
  mesh: EditableMesh,
  ray: Ray,
  options: RayIntersectionOptions = {}
): boolean {
  const opts = {
    maxDistance: options.maxDistance ?? Infinity,
    includeVertices: options.includeVertices ?? true,
    includeEdges: options.includeEdges ?? true,
    includeFaces: options.includeFaces ?? true,
    vertexIndices: options.vertexIndices,
    edgeIndices: options.edgeIndices,
    faceIndices: options.faceIndices,
    vertexRadius: options.vertexRadius ?? 0.1
  };
  
  // Check vertices
  if (opts.includeVertices) {
    for (let i = 0; i < mesh.vertices.length; i++) {
      if (opts.vertexIndices && !opts.vertexIndices.has(i)) {
        continue;
      }
      
      const vertex = mesh.vertices[i];
      const sphere = {
        center: new Vector3(vertex.x, vertex.y, vertex.z),
        radius: opts.vertexRadius
      };
      
      const intersection = rayIntersectsSphere(ray, sphere);
      if (intersection && intersection.distance <= opts.maxDistance) {
        return true;
      }
    }
  }
  
  // Check edges
  if (opts.includeEdges) {
    for (let i = 0; i < mesh.edges.length; i++) {
      if (opts.edgeIndices && !opts.edgeIndices.has(i)) {
        continue;
      }
      
      const edge = mesh.edges[i];
      const v1 = mesh.getVertex(edge.v1);
      const v2 = mesh.getVertex(edge.v2);
      
      if (!v1 || !v2) {
        continue;
      }
      
      const start = new Vector3(v1.x, v1.y, v1.z);
      const end = new Vector3(v2.x, v2.y, v2.z);
      
      const intersection = rayIntersectsLineSegment(ray, start, end);
      if (intersection && intersection.distance <= opts.maxDistance) {
        return true;
      }
    }
  }
  
  // Check faces
  if (opts.includeFaces) {
    for (let i = 0; i < mesh.faces.length; i++) {
      if (opts.faceIndices && !opts.faceIndices.has(i)) {
        continue;
      }
      
      const face = mesh.faces[i];
      
      // Create triangle from face vertices
      const v1 = mesh.getVertex(face.vertices[0]);
      const v2 = mesh.getVertex(face.vertices[1]);
      const v3 = mesh.getVertex(face.vertices[2]);
      
      if (!v1 || !v2 || !v3) {
        continue;
      }
      
      const triangle = new Triangle(
        new Vector3(v1.x, v1.y, v1.z),
        new Vector3(v2.x, v2.y, v2.z),
        new Vector3(v3.x, v3.y, v3.z)
      );
      
      const intersection = rayIntersectsTriangle(ray, triangle);
      if (intersection && intersection.distance <= opts.maxDistance) {
        return true;
      }
    }
  }
  
  return false;
} 