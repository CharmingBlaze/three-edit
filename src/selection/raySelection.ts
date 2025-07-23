import { Vector3, Ray, Triangle } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from './Selection';
import { RaySelectionOptions } from './types';

/**
 * Select mesh elements using a ray
 */
export function selectByRay(
  mesh: EditableMesh,
  ray: Ray,
  options: RaySelectionOptions = {}
): Selection {
  const maxDistance = options.maxDistance ?? 1.0;
  const selectFaces = options.selectFaces ?? true;
  const selectVertices = options.selectVertices ?? true;
  const selectEdges = options.selectEdges ?? true;
  const tolerance = options.tolerance ?? 0.001;

  const selection = new Selection();

  if (selectFaces) {
    const faceIndices = selectFacesByRay(mesh, ray, maxDistance, tolerance);
    selection.addFaces(faceIndices);
  }

  if (selectVertices) {
    const vertexIndices = selectVerticesByRay(mesh, ray, maxDistance, tolerance);
    selection.addVertices(vertexIndices);
  }

  if (selectEdges) {
    const edgeIndices = selectEdgesByRay(mesh, ray, maxDistance, tolerance);
    selection.addEdges(edgeIndices);
  }

  return selection;
}

/**
 * Select faces using a ray
 */
function selectFacesByRay(mesh: EditableMesh, ray: Ray, maxDistance: number, _tolerance: number): number[] {
  const selectedFaces: number[] = [];
  
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    
    // Get face vertices
    const v1 = mesh.getVertex(face.vertices[0]);
    const v2 = mesh.getVertex(face.vertices[1]);
    const v3 = mesh.getVertex(face.vertices[2]);
    
    if (!v1 || !v2 || !v3) {
      continue;
    }
    
    // Create triangle
    const triangle = new Triangle(
      new Vector3(v1.x, v1.y, v1.z),
      new Vector3(v2.x, v2.y, v2.z),
      new Vector3(v3.x, v3.y, v3.z)
    );
    
    // Check ray-triangle intersection
    const intersection = rayIntersectsTriangle(ray, triangle);
    
    if (intersection && intersection.distance <= maxDistance) {
      selectedFaces.push(i);
    }
  }
  
  return selectedFaces;
}

/**
 * Select vertices using a ray
 */
function selectVerticesByRay(mesh: EditableMesh, ray: Ray, maxDistance: number, _tolerance: number): number[] {
  const selectedVertices: number[] = [];
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const vertexPos = new Vector3(vertex.x, vertex.y, vertex.z);
    
    // Check distance from ray to vertex
    const distance = distanceFromRayToPoint(ray, vertexPos);
    
    if (distance <= _tolerance && distance <= maxDistance) {
      selectedVertices.push(i);
    }
  }
  
  return selectedVertices;
}

/**
 * Select edges using a ray
 */
function selectEdgesByRay(mesh: EditableMesh, ray: Ray, maxDistance: number, _tolerance: number): number[] {
  const selectedEdges: number[] = [];
  
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    const v1 = mesh.getVertex(edge.v1);
    const v2 = mesh.getVertex(edge.v2);
    
    if (!v1 || !v2) {
      continue;
    }
    
    const start = new Vector3(v1.x, v1.y, v1.z);
    const end = new Vector3(v2.x, v2.y, v2.z);
    
    // Check ray-line segment intersection
    const intersection = rayIntersectsLineSegment(ray, start, end);
    
    if (intersection && intersection.distance <= maxDistance) {
      selectedEdges.push(i);
    }
  }
  
  return selectedEdges;
}

/**
 * Check if a ray intersects a triangle
 */
function rayIntersectsTriangle(ray: Ray, triangle: Triangle): { distance: number, point: Vector3 } | null {
  const edge1 = triangle.b.clone().sub(triangle.a);
  const edge2 = triangle.c.clone().sub(triangle.a);
  const h = new Vector3().crossVectors(ray.direction, edge2);
  const a = edge1.dot(h);
  
  if (Math.abs(a) < 1e-6) {
    return null; // Ray is parallel to triangle
  }
  
  const f = 1 / a;
  const s = ray.origin.clone().sub(triangle.a);
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
  
  const point = ray.origin.clone().addScaledVector(ray.direction, t);
  
  return {
    distance: t,
    point
  };
}

/**
 * Check if a ray intersects a line segment
 */
function rayIntersectsLineSegment(ray: Ray, start: Vector3, end: Vector3): { distance: number, point: Vector3 } | null {
  const direction = end.clone().sub(start);
  const cross = new Vector3().crossVectors(ray.direction, direction);
  const det = cross.lengthSq();
  
  if (det < 1e-6) {
    return null; // Lines are parallel
  }
  
  const toStart = start.clone().sub(ray.origin);
  const t = new Vector3().crossVectors(toStart, direction).dot(cross) / det;
  const u = new Vector3().crossVectors(toStart, ray.direction).dot(cross) / det;
  
  if (t < 0 || u < 0 || u > 1) {
    return null;
  }
  
  const point = ray.origin.clone().addScaledVector(ray.direction, t);
  
  return {
    distance: t,
    point
  };
}

/**
 * Calculate distance from ray to point
 */
function distanceFromRayToPoint(ray: Ray, point: Vector3): number {
  const toPoint = point.clone().sub(ray.origin);
  const projection = toPoint.dot(ray.direction);
  const projectedPoint = ray.origin.clone().addScaledVector(ray.direction, projection);
  
  return point.distanceTo(projectedPoint);
} 