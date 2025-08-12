/**
 * Topology validation functions for three-edit
 * Pure functions for validating mesh topology and connectivity
 */

import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Edge } from '../core/Edge';
import { ValidationResult } from './types';

/**
 * Validate mesh topology (connectivity and structure)
 */
export function validateTopology(
  vertices: Vertex[],
  faces: Face[],
  edges: Edge[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check for orphaned vertices
  const orphanedVertices = findOrphanedVertices(vertices, faces);
  if (orphanedVertices.length > 0) {
    result.warnings.push(`Found ${orphanedVertices.length} orphaned vertices: ${orphanedVertices.join(', ')}`);
  }

  // Check for non-manifold edges
  const nonManifoldEdges = findNonManifoldEdges(faces);
  if (nonManifoldEdges.length > 0) {
    result.warnings.push(`Found ${nonManifoldEdges.length} non-manifold edges`);
  }

  // Check for open boundaries
  const boundaryEdges = findBoundaryEdges(faces);
  if (boundaryEdges.length > 0) {
    result.warnings.push(`Found ${boundaryEdges.length} boundary edges`);
  }

  // Check for disconnected components
  const components = findConnectedComponents(vertices, faces);
  if (components.length > 1) {
    result.warnings.push(`Mesh has ${components.length} disconnected components`);
  }

  // Check for invalid face references
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    
    // Check if face has enough vertices
    if (face.vertices.length < 3) {
      result.isValid = false;
      result.errors.push(`Face ${i} has less than 3 vertices: ${face.vertices.length}`);
      continue;
    }

    // Check if all vertex indices are valid
    for (const vertexIndex of face.vertices) {
      if (vertexIndex < 0 || vertexIndex >= vertices.length) {
        result.isValid = false;
        result.errors.push(`Face ${i} references invalid vertex index: ${vertexIndex}`);
      }
    }

    // Check for duplicate vertices in face
    const uniqueVertices = new Set(face.vertices);
    if (uniqueVertices.size !== face.vertices.length) {
      result.isValid = false;
      result.errors.push(`Face ${i} has duplicate vertices`);
    }
  }

  return result;
}

/**
 * Find orphaned vertices (not used by any face)
 */
export function findOrphanedVertices(vertices: Vertex[], faces: Face[]): number[] {
  const usedVertices = new Set<number>();
  
  // Collect all vertex indices used by faces
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      usedVertices.add(vertexIndex);
    }
  }
  
  // Find vertices not used by any face
  const orphaned: number[] = [];
  for (let i = 0; i < vertices.length; i++) {
    if (!usedVertices.has(i)) {
      orphaned.push(i);
    }
  }
  
  return orphaned;
}

/**
 * Find non-manifold edges (edges shared by more than 2 faces)
 */
export function findNonManifoldEdges(faces: Face[]): Array<[number, number]> {
  const edgeCount = new Map<string, number>();
  
  // Count how many faces use each edge
  for (const face of faces) {
    for (let i = 0; i < face.vertices.length; i++) {
      const v1 = face.vertices[i];
      const v2 = face.vertices[(i + 1) % face.vertices.length];
      
      // Create consistent edge key (smaller index first)
      const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      edgeCount.set(edgeKey, (edgeCount.get(edgeKey) || 0) + 1);
    }
  }
  
  // Find edges used by more than 2 faces
  const nonManifold: Array<[number, number]> = [];
  for (const [edgeKey, count] of edgeCount.entries()) {
    if (count > 2) {
      const [v1, v2] = edgeKey.split('-').map(Number);
      nonManifold.push([v1, v2]);
    }
  }
  
  return nonManifold;
}

/**
 * Find boundary edges (edges shared by only 1 face)
 */
export function findBoundaryEdges(faces: Face[]): Array<[number, number]> {
  const edgeCount = new Map<string, number>();
  
  // Count how many faces use each edge
  for (const face of faces) {
    for (let i = 0; i < face.vertices.length; i++) {
      const v1 = face.vertices[i];
      const v2 = face.vertices[(i + 1) % face.vertices.length];
      
      // Create consistent edge key (smaller index first)
      const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      edgeCount.set(edgeKey, (edgeCount.get(edgeKey) || 0) + 1);
    }
  }
  
  // Find edges used by only 1 face
  const boundary: Array<[number, number]> = [];
  for (const [edgeKey, count] of edgeCount.entries()) {
    if (count === 1) {
      const [v1, v2] = edgeKey.split('-').map(Number);
      boundary.push([v1, v2]);
    }
  }
  
  return boundary;
}

/**
 * Find connected components in the mesh
 */
export function findConnectedComponents(vertices: Vertex[], faces: Face[]): number[][] {
  const visited = new Set<number>();
  const components: number[][] = [];
  
  // Create adjacency list for vertices
  const adjacency = new Map<number, Set<number>>();
  for (let i = 0; i < vertices.length; i++) {
    adjacency.set(i, new Set());
  }
  
  // Build adjacency list from faces
  for (const face of faces) {
    for (let i = 0; i < face.vertices.length; i++) {
      const v1 = face.vertices[i];
      const v2 = face.vertices[(i + 1) % face.vertices.length];
      
      adjacency.get(v1)!.add(v2);
      adjacency.get(v2)!.add(v1);
    }
  }
  
  // Find connected components using DFS
  for (let i = 0; i < vertices.length; i++) {
    if (!visited.has(i)) {
      const component: number[] = [];
      dfs(i, adjacency, visited, component);
      components.push(component);
    }
  }
  
  return components;
}

/**
 * Depth-first search for finding connected components
 */
function dfs(
  vertex: number,
  adjacency: Map<number, Set<number>>,
  visited: Set<number>,
  component: number[]
): void {
  visited.add(vertex);
  component.push(vertex);
  
  const neighbors = adjacency.get(vertex);
  if (neighbors) {
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, adjacency, visited, component);
      }
    }
  }
}

/**
 * Check if mesh is watertight (no boundary edges)
 */
export function isWatertight(faces: Face[]): boolean {
  const boundaryEdges = findBoundaryEdges(faces);
  return boundaryEdges.length === 0;
}

/**
 * Check if mesh is manifold (no non-manifold edges)
 */
export function isManifold(faces: Face[]): boolean {
  const nonManifoldEdges = findNonManifoldEdges(faces);
  return nonManifoldEdges.length === 0;
}

/**
 * Get mesh genus (number of holes)
 */
export function calculateGenus(vertices: Vertex[], faces: Face[]): number {
  // Euler characteristic: V - E + F = 2 - 2g
  // where V = vertices, E = edges, F = faces, g = genus
  
  const V = vertices.length;
  const F = faces.length;
  
  // Count unique edges
  const uniqueEdges = new Set<string>();
  for (const face of faces) {
    for (let i = 0; i < face.vertices.length; i++) {
      const v1 = face.vertices[i];
      const v2 = face.vertices[(i + 1) % face.vertices.length];
      const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      uniqueEdges.add(edgeKey);
    }
  }
  const E = uniqueEdges.size;
  
  // Calculate Euler characteristic
  const chi = V - E + F;
  
  // For a closed surface, genus = (2 - chi) / 2
  // For surfaces with boundaries, this is more complex
  const genus = Math.max(0, (2 - chi) / 2);
  
  return Math.round(genus);
} 