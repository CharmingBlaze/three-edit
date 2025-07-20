import { Vector3 } from 'three';

/**
 * Result of a nearest element query
 */
export interface NearestElementResult {
  /** Type of the nearest element */
  type: 'vertex' | 'edge' | 'face';
  /** Index of the nearest element */
  index: number;
  /** Distance to the nearest element */
  distance: number;
  /** Point on the element closest to the query point */
  point: Vector3;
  /** Barycentric coordinates (for face results) */
  barycentric?: Vector3;
  /** Parameter t along edge (for edge results, 0 at v1, 1 at v2) */
  parameter?: number;
}

/**
 * Options for nearest element queries
 */
export interface NearestElementOptions {
  /** Maximum distance to consider */
  maxDistance?: number;
  /** Whether to include vertices in the search */
  includeVertices?: boolean;
  /** Whether to include edges in the search */
  includeEdges?: boolean;
  /** Whether to include faces in the search */
  includeFaces?: boolean;
  /** Indices of vertices to include in the search (if undefined, all vertices are included) */
  vertexIndices?: Set<number>;
  /** Indices of edges to include in the search (if undefined, all edges are included) */
  edgeIndices?: Set<number>;
  /** Indices of faces to include in the search (if undefined, all faces are included) */
  faceIndices?: Set<number>;
}

/**
 * Options for ray intersection queries
 */
export interface RayIntersectionOptions {
  maxDistance?: number;
  includeVertices?: boolean;
  includeEdges?: boolean;
  includeFaces?: boolean;
  vertexIndices?: Set<number>;
  edgeIndices?: Set<number>;
  faceIndices?: Set<number>;
  vertexRadius?: number;
}

/**
 * Result of a ray intersection query
 */
export interface RayIntersectionResult {
  type: 'vertex' | 'edge' | 'face';
  index: number;
  distance: number;
  point: Vector3;
  barycentric?: Vector3;
  parameter?: number;
} 