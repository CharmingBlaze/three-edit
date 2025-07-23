/**
 * Edge utility functions for three-edit
 * Pure functions for edge key generation, seam detection, and vertex ordering
 */

import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';

/**
 * Generate a unique edge key for two vertex indices
 * Ensures consistent ordering regardless of vertex order
 */
export function generateEdgeKey(v1Index: number, v2Index: number): string {
  // Ensure consistent ordering (smaller ID first)
  const minId = Math.min(v1Index, v2Index);
  const maxId = Math.max(v1Index, v2Index);
  
  return `${minId}-${maxId}`;
}

/**
 * Generate edge key from vertex indices (alias for generateEdgeKey)
 */
export function generateEdgeKeyFromIds(id1: number, id2: number): string {
  return generateEdgeKey(id1, id2);
}

/**
 * Sort edge vertex indices to ensure consistent ordering
 */
export function sortEdgeVertices(v1Index: number, v2Index: number): [number, number] {
  if (v1Index <= v2Index) {
    return [v1Index, v2Index];
  } else {
    return [v2Index, v1Index];
  }
}

/**
 * Get the other vertex index in an edge
 */
export function getOtherVertexIndex(edge: Edge, vertexIndex: number): number {
  return edge.getOtherVertex(vertexIndex);
}

/**
 * Check if two edges share a vertex
 */
export function edgesShareVertex(edge1: Edge, edge2: Edge): boolean {
  return edge1.v1 === edge2.v1 || 
         edge1.v1 === edge2.v2 || 
         edge1.v2 === edge2.v1 || 
         edge1.v2 === edge2.v2;
}

/**
 * Get the shared vertex index between two edges
 */
export function getSharedVertexIndex(edge1: Edge, edge2: Edge): number | null {
  if (edge1.v1 === edge2.v1 || edge1.v1 === edge2.v2) {
    return edge1.v1;
  } else if (edge1.v2 === edge2.v1 || edge1.v2 === edge2.v2) {
    return edge1.v2;
  }
  return null;
}

/**
 * Calculate the length of an edge using vertex positions
 */
export function calculateEdgeLength(edge: Edge, vertices: Vertex[]): number {
  const v1 = vertices[edge.v1];
  const v2 = vertices[edge.v2];
  
  if (!v1 || !v2) return 0;
  
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  const dz = v2.z - v1.z;
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate the squared length of an edge (faster than calculateEdgeLength)
 */
export function calculateEdgeLengthSquared(edge: Edge, vertices: Vertex[]): number {
  const v1 = vertices[edge.v1];
  const v2 = vertices[edge.v2];
  
  if (!v1 || !v2) return 0;
  
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  const dz = v2.z - v1.z;
  
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Get the midpoint of an edge
 */
export function getEdgeMidpoint(edge: Edge, vertices: Vertex[]): { x: number; y: number; z: number } | null {
  const v1 = vertices[edge.v1];
  const v2 = vertices[edge.v2];
  
  if (!v1 || !v2) return null;
  
  return {
    x: (v1.x + v2.x) / 2,
    y: (v1.y + v2.y) / 2,
    z: (v1.z + v2.z) / 2
  };
}

/**
 * Check if an edge is approximately straight (for validation)
 */
export function isEdgeStraight(edge: Edge, vertices: Vertex[], tolerance: number = 1e-6): boolean {
  const length = calculateEdgeLength(edge, vertices);
  return length > tolerance;
}

/**
 * Get edge statistics for a mesh
 */
export function getEdgeStatistics(edges: Edge[], vertices: Vertex[]): {
  total: number;
  averageLength: number;
  minLength: number;
  maxLength: number;
} {
  const total = edges.length;
  
  if (total === 0) {
    return {
      total: 0,
      averageLength: 0,
      minLength: 0,
      maxLength: 0
    };
  }
  
  const lengths = edges.map(edge => calculateEdgeLength(edge, vertices));
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  const averageLength = totalLength / total;
  const minLength = Math.min(...lengths);
  const maxLength = Math.max(...lengths);
  
  return {
    total,
    averageLength,
    minLength,
    maxLength
  };
} 