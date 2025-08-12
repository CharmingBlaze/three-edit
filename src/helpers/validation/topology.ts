/**
 * Topology validation helpers
 * Pure, composable functions for topology validation
 */

import { Vertex } from '../../core/Vertex';
import { Face } from '../../core/Face';
import { Edge } from '../../core/Edge';
import { getEdgeKey } from '../core/edge';
import { findAdjacentFaces } from '../core/face';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate topology integrity
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
    result.warnings.push(`Found ${orphanedVertices.length} orphaned vertices`);
  }

  // Check for invalid face references
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      if (vertexIndex < 0 || vertexIndex >= vertices.length) {
        result.isValid = false;
        result.errors.push(`Face references invalid vertex index: ${vertexIndex}`);
      }
    }
  }

  // Check for invalid edge references
  for (const edge of edges) {
    if (edge.v1 < 0 || edge.v1 >= vertices.length) {
      result.isValid = false;
      result.errors.push(`Edge references invalid vertex index: ${edge.v1}`);
    }
    if (edge.v2 < 0 || edge.v2 >= vertices.length) {
      result.isValid = false;
      result.errors.push(`Edge references invalid vertex index: ${edge.v2}`);
    }
  }

  // Check for degenerate faces (less than 3 vertices)
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    if (face.vertices.length < 3) {
      result.isValid = false;
      result.errors.push(`Face ${i} has less than 3 vertices: ${face.vertices.length}`);
    }
  }

  // Check for non-manifold edges
  const nonManifoldEdges = findNonManifoldEdges(edges);
  if (nonManifoldEdges.length > 0) {
    result.warnings.push(`Found ${nonManifoldEdges.length} non-manifold edges`);
  }

  // Check for boundary edges
  const boundaryEdges = findBoundaryEdges(edges);
  if (boundaryEdges.length > 0) {
    result.warnings.push(`Found ${boundaryEdges.length} boundary edges`);
  }

  return result;
}

/**
 * Find orphaned vertices (not used by any face)
 */
export function findOrphanedVertices(vertices: Vertex[], faces: Face[]): number[] {
  const usedVertices = new Set<number>();
  
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      usedVertices.add(vertexIndex);
    }
  }

  const orphaned: number[] = [];
  for (let i = 0; i < vertices.length; i++) {
    if (!usedVertices.has(i)) {
      orphaned.push(i);
    }
  }

  return orphaned;
}

/**
 * Find non-manifold edges (edges that belong to more than two faces)
 */
export function findNonManifoldEdges(edges: Edge[]): Edge[] {
  const edgeCount = new Map<string, number>();
  
  // Count how many times each edge appears
  for (const edge of edges) {
    const key = getEdgeKey(edge);
    edgeCount.set(key, (edgeCount.get(key) || 0) + 1);
  }
  
  // Return edges that appear more than twice
  return edges.filter(edge => {
    const key = getEdgeKey(edge);
    return (edgeCount.get(key) || 0) > 2;
  });
}

/**
 * Find boundary edges (edges that belong to only one face)
 */
export function findBoundaryEdges(edges: Edge[]): Edge[] {
  const edgeCount = new Map<string, number>();
  
  // Count how many times each edge appears
  for (const edge of edges) {
    const key = getEdgeKey(edge);
    edgeCount.set(key, (edgeCount.get(key) || 0) + 1);
  }
  
  // Return edges that appear only once
  return edges.filter(edge => {
    const key = getEdgeKey(edge);
    return edgeCount.get(key) === 1;
  });
}

/**
 * Find connected components in a mesh
 */
export function findConnectedComponents(
  vertices: Vertex[],
  faces: Face[]
): { componentVertices: Set<number>; componentFaces: Set<number> }[] {
  const visited = new Set<number>();
  const components: { componentVertices: Set<number>; componentFaces: Set<number> }[] = [];

  for (let i = 0; i < faces.length; i++) {
    if (visited.has(i)) continue;

    const componentVertices = new Set<number>();
    const componentFaces = new Set<number>();
    
    dfs(i, faces, visited, componentVertices, componentFaces);
    
    components.push({ componentVertices, componentFaces });
  }

  return components;
}

/**
 * Depth-first search for connected components
 */
function dfs(
  faceIndex: number,
  faces: Face[],
  visited: Set<number>,
  componentVertices: Set<number>,
  componentFaces: Set<number>
): void {
  visited.add(faceIndex);
  componentFaces.add(faceIndex);

  const face = faces[faceIndex];
  for (const vertexIndex of face.vertices) {
    componentVertices.add(vertexIndex);
  }

  // Find adjacent faces and continue DFS
  for (let i = 0; i < faces.length; i++) {
    if (visited.has(i)) continue;

    const otherFace = faces[i];
    if (facesShareVertices(face, otherFace)) {
      dfs(i, faces, visited, componentVertices, componentFaces);
    }
  }
}

/**
 * Check if two faces share any vertices
 */
function facesShareVertices(face1: Face, face2: Face): boolean {
  const vertices1 = new Set(face1.vertices);
  for (const vertexIndex of face2.vertices) {
    if (vertices1.has(vertexIndex)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if mesh is watertight (no boundary edges)
 */
export function isWatertight(edges: Edge[]): boolean {
  const boundaryEdges = findBoundaryEdges(edges);
  return boundaryEdges.length === 0;
}

/**
 * Check if mesh is manifold (each edge belongs to at most two faces)
 */
export function isManifold(edges: Edge[]): boolean {
  const nonManifoldEdges = findNonManifoldEdges(edges);
  return nonManifoldEdges.length === 0;
}

/**
 * Calculate genus of a mesh (number of holes)
 */
export function calculateGenus(
  vertices: Vertex[],
  faces: Face[],
  edges: Edge[]
): number {
  if (!isWatertight(edges)) {
    throw new Error('Cannot calculate genus for non-watertight mesh');
  }

  if (!isManifold(edges)) {
    throw new Error('Cannot calculate genus for non-manifold mesh');
  }

  // Euler characteristic: χ = V - E + F
  const V = vertices.length;
  const E = edges.length;
  const F = faces.length;
  const chi = V - E + F;

  // For a closed surface, genus g = (2 - χ) / 2
  const genus = (2 - chi) / 2;

  return Math.max(0, Math.round(genus));
}

/**
 * Validate mesh connectivity
 */
export function validateConnectivity(
  vertices: Vertex[],
  faces: Face[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const components = findConnectedComponents(vertices, faces);
  
  if (components.length > 1) {
    result.warnings.push(`Mesh has ${components.length} disconnected components`);
  }

  // Check for isolated vertices
  const usedVertices = new Set<number>();
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      usedVertices.add(vertexIndex);
    }
  }

  const isolatedVertices = [];
  for (let i = 0; i < vertices.length; i++) {
    if (!usedVertices.has(i)) {
      isolatedVertices.push(i);
    }
  }

  if (isolatedVertices.length > 0) {
    result.warnings.push(`Found ${isolatedVertices.length} isolated vertices`);
  }

  return result;
}

/**
 * Validate face winding consistency
 */
export function validateFaceWinding(
  faces: Face[],
  vertices: Vertex[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check if all faces have consistent winding
  const faceNormals: { x: number; y: number; z: number }[] = [];
  
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const faceVertices = face.vertices.map((index: number) => vertices[index]).filter(Boolean);
    
    if (faceVertices.length < 3) continue;

    // Calculate face normal using first three vertices
    const v0 = faceVertices[0];
    const v1 = faceVertices[1];
    const v2 = faceVertices[2];

    const edge1 = {
      x: v1.x - v0.x,
      y: v1.y - v0.y,
      z: v1.z - v0.z
    };

    const edge2 = {
      x: v2.x - v0.x,
      y: v2.y - v0.y,
      z: v2.z - v0.z
    };

    const normal = {
      x: edge1.y * edge2.z - edge1.z * edge2.y,
      y: edge1.z * edge2.x - edge1.x * edge2.z,
      z: edge1.x * edge2.y - edge1.y * edge2.x
    };

    // Normalize
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    if (length > 0) {
      normal.x /= length;
      normal.y /= length;
      normal.z /= length;
    }

    faceNormals.push(normal);
  }

  // Check for inconsistent winding (this is a simplified check)
  // In a proper implementation, you'd check adjacent faces
  let inconsistentCount = 0;
  for (let i = 0; i < faceNormals.length; i++) {
    for (let j = i + 1; j < faceNormals.length; j++) {
      const dotProduct = 
        faceNormals[i].x * faceNormals[j].x +
        faceNormals[i].y * faceNormals[j].y +
        faceNormals[i].z * faceNormals[j].z;
      
      if (dotProduct < -0.9) {
        inconsistentCount++;
      }
    }
  }

  if (inconsistentCount > 0) {
    result.warnings.push(`Found ${inconsistentCount} potentially inconsistent face windings`);
  }

  return result;
} 