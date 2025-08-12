/**
 * Core edge manipulation helpers
 * Pure, composable functions for edge operations
 */

import { Vector3 } from 'three';
import { Edge } from '../../core/Edge';
import { Vertex } from '../../core/Vertex';
import { UserData } from '../../types/core';

/**
 * Create a new edge between two vertices
 */
export function createEdge(
  v1: number,
  v2: number,
  options: {
    userData?: UserData;
  } = {}
): Edge {
  return new Edge(v1, v2, options);
}

/**
 * Clone an edge with optional modifications
 */
export function cloneEdge(
  edge: Edge,
  modifications: Partial<{
    v1: number;
    v2: number;
    userData: UserData;
  }> = {}
): Edge {
  return new Edge(
    modifications.v1 ?? edge.v1,
    modifications.v2 ?? edge.v2,
    {
      userData: modifications.userData ?? { ...edge.userData }
    }
  );
}

/**
 * Get the other vertex index in an edge
 */
export function getOtherVertex(edge: Edge, vertexIndex: number): number {
  return edge.v1 === vertexIndex ? edge.v2 : edge.v1;
}

/**
 * Check if an edge contains a specific vertex
 */
export function edgeContainsVertex(edge: Edge, vertexIndex: number): boolean {
  return edge.v1 === vertexIndex || edge.v2 === vertexIndex;
}

/**
 * Check if two edges are equal (same vertices, order doesn't matter)
 */
export function edgesEqual(edge1: Edge, edge2: Edge): boolean {
  return (edge1.v1 === edge2.v1 && edge1.v2 === edge2.v2) ||
         (edge1.v1 === edge2.v2 && edge1.v2 === edge2.v1);
}

/**
 * Get edge key for consistent ordering (smaller index first)
 */
export function getEdgeKey(edge: Edge): string {
  return edge.v1 < edge.v2 ? `${edge.v1}-${edge.v2}` : `${edge.v2}-${edge.v1}`;
}

/**
 * Create edge key from vertex indices
 */
export function createEdgeKey(v1: number, v2: number): string {
  return v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
}

/**
 * Parse edge key back to vertex indices
 */
export function parseEdgeKey(key: string): [number, number] {
  const [v1, v2] = key.split('-').map(Number);
  return [v1, v2];
}

/**
 * Calculate edge length using vertex positions
 */
export function calculateEdgeLength(
  edge: Edge,
  vertices: Vertex[]
): number {
  const v1 = vertices[edge.v1];
  const v2 = vertices[edge.v2];
  
  if (!v1 || !v2) {
    throw new Error(`Invalid vertex indices in edge: ${edge.v1}, ${edge.v2}`);
  }

  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  const dz = v2.z - v1.z;
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate edge direction vector
 */
export function calculateEdgeDirection(
  edge: Edge,
  vertices: Vertex[]
): { direction: Vector3; length: number } {
  const v1 = vertices[edge.v1];
  const v2 = vertices[edge.v2];
  
  if (!v1 || !v2) {
    throw new Error(`Invalid vertex indices in edge: ${edge.v1}, ${edge.v2}`);
  }

  const direction = new Vector3(
    v2.x - v1.x,
    v2.y - v1.y,
    v2.z - v1.z
  );
  
  const length = direction.length();
  direction.normalize();
  
  return { direction, length };
}

/**
 * Find edges connected to a vertex
 */
export function findEdgesConnectedToVertex(
  vertexIndex: number,
  edges: Edge[]
): Edge[] {
  return edges.filter(edge => edgeContainsVertex(edge, vertexIndex));
}

/**
 * Find all vertices connected to a vertex through edges
 */
export function findConnectedVertices(
  vertexIndex: number,
  edges: Edge[]
): number[] {
  const connected: number[] = [];
  
  for (const edge of edges) {
    if (edgeContainsVertex(edge, vertexIndex)) {
      const otherVertex = getOtherVertex(edge, vertexIndex);
      if (!connected.includes(otherVertex)) {
        connected.push(otherVertex);
      }
    }
  }
  
  return connected;
}

/**
 * Check if two vertices are connected by an edge
 */
export function verticesConnected(
  v1: number,
  v2: number,
  edges: Edge[]
): boolean {
  return edges.some(edge => 
    (edge.v1 === v1 && edge.v2 === v2) || 
    (edge.v1 === v2 && edge.v2 === v1)
  );
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
 * Create edges from a sequence of vertices (for a face)
 */
export function createEdgesFromVertices(vertexIndices: number[]): Edge[] {
  const edges: Edge[] = [];
  
  for (let i = 0; i < vertexIndices.length; i++) {
    const v1 = vertexIndices[i];
    const v2 = vertexIndices[(i + 1) % vertexIndices.length];
    edges.push(createEdge(v1, v2));
  }
  
  return edges;
}

/**
 * Remove duplicate edges from a list
 */
export function removeDuplicateEdges(edges: Edge[]): Edge[] {
  const seen = new Set<string>();
  const unique: Edge[] = [];
  
  for (const edge of edges) {
    const key = getEdgeKey(edge);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(edge);
    }
  }
  
  return unique;
}

/**
 * Sort edges by length
 */
export function sortEdgesByLength(
  edges: Edge[],
  vertices: Vertex[],
  ascending: boolean = true
): Edge[] {
  return [...edges].sort((a, b) => {
    const lengthA = calculateEdgeLength(a, vertices);
    const lengthB = calculateEdgeLength(b, vertices);
    return ascending ? lengthA - lengthB : lengthB - lengthA;
  });
}

/**
 * Find the shortest edge in a list
 */
export function findShortestEdge(
  edges: Edge[],
  vertices: Vertex[]
): Edge | null {
  if (edges.length === 0) return null;
  
  let shortest = edges[0];
  let shortestLength = calculateEdgeLength(shortest, vertices);
  
  for (const edge of edges) {
    const length = calculateEdgeLength(edge, vertices);
    if (length < shortestLength) {
      shortest = edge;
      shortestLength = length;
    }
  }
  
  return shortest;
}

/**
 * Find the longest edge in a list
 */
export function findLongestEdge(
  edges: Edge[],
  vertices: Vertex[]
): Edge | null {
  if (edges.length === 0) return null;
  
  let longest = edges[0];
  let longestLength = calculateEdgeLength(longest, vertices);
  
  for (const edge of edges) {
    const length = calculateEdgeLength(edge, vertices);
    if (length > longestLength) {
      longest = edge;
      longestLength = length;
    }
  }
  
  return longest;
} 