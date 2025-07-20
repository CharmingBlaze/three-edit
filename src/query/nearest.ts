import { Vector3, Triangle } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { NearestElementResult, NearestElementOptions } from './types';
import { closestPointOnLineSegment, closestPointOnTriangle } from './geometry';

/**
 * Finds the nearest element (vertex, edge, or face) to a point
 * @param mesh The mesh to search in
 * @param point The query point
 * @param options Query options
 * @returns The nearest element, or null if none found within maxDistance
 */
export function findNearestElement(
  mesh: EditableMesh,
  point: Vector3,
  options: NearestElementOptions = {}
): NearestElementResult | null {
  // Set default options
  const opts = {
    maxDistance: options.maxDistance ?? Infinity,
    includeVertices: options.includeVertices ?? true,
    includeEdges: options.includeEdges ?? true,
    includeFaces: options.includeFaces ?? true,
    vertexIndices: options.vertexIndices,
    edgeIndices: options.edgeIndices,
    faceIndices: options.faceIndices
  };
  
  let nearestResult: NearestElementResult | null = null;
  let minDistance = opts.maxDistance;
  
  // Check vertices
  if (opts.includeVertices) {
    const vertexResult = findNearestVertex(mesh, point, opts.vertexIndices, minDistance);
    if (vertexResult && vertexResult.distance < minDistance) {
      nearestResult = vertexResult;
      minDistance = vertexResult.distance;
    }
  }
  
  // Check edges
  if (opts.includeEdges) {
    const edgeResult = findNearestEdge(mesh, point, opts.edgeIndices, minDistance);
    if (edgeResult && edgeResult.distance < minDistance) {
      nearestResult = edgeResult;
      minDistance = edgeResult.distance;
    }
  }
  
  // Check faces
  if (opts.includeFaces) {
    const faceResult = findNearestFace(mesh, point, opts.faceIndices, minDistance);
    if (faceResult && faceResult.distance < minDistance) {
      nearestResult = faceResult;
      minDistance = faceResult.distance;
    }
  }
  
  return nearestResult;
}

/**
 * Finds the nearest vertex to a point
 * @param mesh The mesh to search in
 * @param point The query point
 * @param vertexIndices Optional set of vertex indices to include in the search
 * @param maxDistance Maximum distance to consider
 * @returns The nearest vertex, or null if none found within maxDistance
 */
export function findNearestVertex(
  mesh: EditableMesh,
  point: Vector3,
  vertexIndices?: Set<number>,
  maxDistance: number = Infinity
): NearestElementResult | null {
  let nearestIndex = -1;
  let minDistanceSquared = maxDistance * maxDistance;
  
  // Iterate through vertices
  for (let i = 0; i < mesh.vertices.length; i++) {
    // Skip if not in the specified indices
    if (vertexIndices && !vertexIndices.has(i)) {
      continue;
    }
    
    const vertex = mesh.vertices[i];
    const dx = vertex.x - point.x;
    const dy = vertex.y - point.y;
    const dz = vertex.z - point.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    
    if (distanceSquared < minDistanceSquared) {
      minDistanceSquared = distanceSquared;
      nearestIndex = i;
    }
  }
  
  if (nearestIndex === -1) {
    return null;
  }
  
  const nearestVertex = mesh.vertices[nearestIndex];
  const nearestPoint = new Vector3(nearestVertex.x, nearestVertex.y, nearestVertex.z);
  
  return {
    type: 'vertex',
    index: nearestIndex,
    distance: Math.sqrt(minDistanceSquared),
    point: nearestPoint
  };
}

/**
 * Finds the nearest edge to a point
 * @param mesh The mesh to search in
 * @param point The query point
 * @param edgeIndices Optional set of edge indices to include in the search
 * @param maxDistance Maximum distance to consider
 * @returns The nearest edge, or null if none found within maxDistance
 */
export function findNearestEdge(
  mesh: EditableMesh,
  point: Vector3,
  edgeIndices?: Set<number>,
  maxDistance: number = Infinity
): NearestElementResult | null {
  let nearestIndex = -1;
  let minDistanceSquared = maxDistance * maxDistance;
  let nearestPoint = new Vector3();
  let nearestParameter = 0;
  
  // Iterate through edges
  for (let i = 0; i < mesh.edges.length; i++) {
    // Skip if not in the specified indices
    if (edgeIndices && !edgeIndices.has(i)) {
      continue;
    }
    
    const edge = mesh.edges[i];
    const v1 = mesh.getVertex(edge.v1);
    const v2 = mesh.getVertex(edge.v2);
    
    if (!v1 || !v2) {
      continue;
    }
    
    // Create line segment
    const start = new Vector3(v1.x, v1.y, v1.z);
    const end = new Vector3(v2.x, v2.y, v2.z);
    
    // Find closest point on line segment
    const result = closestPointOnLineSegment(point, start, end);
    
    if (result.distanceSquared < minDistanceSquared) {
      minDistanceSquared = result.distanceSquared;
      nearestIndex = i;
      nearestPoint = result.point;
      nearestParameter = result.parameter;
    }
  }
  
  if (nearestIndex === -1) {
    return null;
  }
  
  return {
    type: 'edge',
    index: nearestIndex,
    distance: Math.sqrt(minDistanceSquared),
    point: nearestPoint,
    parameter: nearestParameter
  };
}

/**
 * Finds the nearest face to a point
 * @param mesh The mesh to search in
 * @param point The query point
 * @param faceIndices Optional set of face indices to include in the search
 * @param maxDistance Maximum distance to consider
 * @returns The nearest face, or null if none found within maxDistance
 */
export function findNearestFace(
  mesh: EditableMesh,
  point: Vector3,
  faceIndices?: Set<number>,
  maxDistance: number = Infinity
): NearestElementResult | null {
  let nearestIndex = -1;
  let minDistanceSquared = maxDistance * maxDistance;
  let nearestPoint = new Vector3();
  let nearestBarycentric = new Vector3();
  
  // Iterate through faces
  for (let i = 0; i < mesh.faces.length; i++) {
    // Skip if not in the specified indices
    if (faceIndices && !faceIndices.has(i)) {
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
    
    // Find closest point on triangle
    const result = closestPointOnTriangle(point, triangle);
    
    if (result.distanceSquared < minDistanceSquared) {
      minDistanceSquared = result.distanceSquared;
      nearestIndex = i;
      nearestPoint = result.point;
      nearestBarycentric = result.barycentric;
    }
  }
  
  if (nearestIndex === -1) {
    return null;
  }
  
  return {
    type: 'face',
    index: nearestIndex,
    distance: Math.sqrt(minDistanceSquared),
    point: nearestPoint,
    barycentric: nearestBarycentric
  };
} 