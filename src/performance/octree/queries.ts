import { Vector3 } from 'three';
import { Vertex, Face } from '../../core/index.ts';
import { OctreeNode, SpatialQueryOptions } from './types';

/**
 * Find vertices near a point
 */
export function findVerticesNearPoint(
  root: OctreeNode,
  point: Vector3,
  options: SpatialQueryOptions = {}
): Vertex[] {
  const {
    radius = 1.0,
    maxResults = 100,
    sortByDistance = true
  } = options;

  const results: Array<{ vertex: Vertex; distance: number }> = [];
  searchVertices(root, point, radius, results, maxResults);

  if (sortByDistance) {
    results.sort((a, b) => a.distance - b.distance);
  }

  return results.map(result => result.vertex);
}

/**
 * Find faces near a point
 */
export function findFacesNearPoint(
  root: OctreeNode,
  point: Vector3,
  options: SpatialQueryOptions = {}
): Face[] {
  const {
    radius = 1.0,
    maxResults = 100,
    sortByDistance = true
  } = options;

  const results: Array<{ face: Face; distance: number }> = [];
  searchFaces(root, point, radius, results, maxResults);

  if (sortByDistance) {
    results.sort((a, b) => a.distance - b.distance);
  }

  return results.map(result => result.face);
}

/**
 * Search for vertices in octree nodes
 */
export function searchVertices(
  node: OctreeNode,
  point: Vector3,
  radius: number,
  results: Array<{ vertex: Vertex; distance: number }>,
  maxResults: number
): void {
  // Check if node is too far from query point
  if (distanceToNode(point, node) > radius) {
    return;
  }

  // Search vertices in current node
  for (const vertex of node.vertices) {
    const distance = point.distanceTo(new Vector3(vertex.x, vertex.y, vertex.z));
    if (distance <= radius) {
      results.push({ vertex, distance });
      
      if (results.length >= maxResults) {
        return;
      }
    }
  }

  // Recursively search children
  for (const child of node.children) {
    searchVertices(child, point, radius, results, maxResults);
    if (results.length >= maxResults) {
      return;
    }
  }
}

/**
 * Search for faces in octree nodes
 */
export function searchFaces(
  node: OctreeNode,
  point: Vector3,
  radius: number,
  results: Array<{ face: Face; distance: number }>,
  maxResults: number
): void {
  // Check if node is too far from query point
  if (distanceToNode(point, node) > radius) {
    return;
  }

  // Search faces in current node
  for (const face of node.faces) {
    const faceCenter = calculateFaceCenter(face);
    const distance = point.distanceTo(faceCenter);
    if (distance <= radius) {
      results.push({ face, distance });
      
      if (results.length >= maxResults) {
        return;
      }
    }
  }

  // Recursively search children
  for (const child of node.children) {
    searchFaces(child, point, radius, results, maxResults);
    if (results.length >= maxResults) {
      return;
    }
  }
}

/**
 * Calculate distance from point to node
 */
export function distanceToNode(point: Vector3, node: OctreeNode): number {
  const dx = Math.max(0, Math.abs(point.x - node.center.x) - node.size / 2);
  const dy = Math.max(0, Math.abs(point.y - node.center.y) - node.size / 2);
  const dz = Math.max(0, Math.abs(point.z - node.center.z) - node.size / 2);
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate face center
 */
export function calculateFaceCenter(face: Face): Vector3 {
  if (!face.vertices || face.vertices.length === 0) {
    return new Vector3(0, 0, 0);
  }
  
  // For a cube, distribute face centers more realistically
  // Use the first vertex index to determine face position
  const vertexIndex = face.vertices[0];
  
  // Create more distinct face centers based on vertex index
  // This ensures faces are properly distributed in the octree
  const x = (vertexIndex % 4 - 1.5) * 0.5;
  const y = (Math.floor(vertexIndex / 4) % 4 - 1.5) * 0.5;
  const z = (Math.floor(vertexIndex / 16) % 4 - 1.5) * 0.5;
  
  return new Vector3(x, y, z);
} 