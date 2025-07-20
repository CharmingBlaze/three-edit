import { Vector3 } from 'three';
import { Vertex, Face } from '../../core/index.ts';

/**
 * Octree node structure
 */
export interface OctreeNode {
  center: Vector3;
  size: number;
  children: OctreeNode[];
  vertices: Vertex[];
  faces: Face[];
  isLeaf: boolean;
  maxDepth: number;
  currentDepth: number;
}

/**
 * Octree construction options
 */
export interface OctreeOptions {
  maxDepth?: number;
  maxObjectsPerNode?: number;
  minNodeSize?: number;
  enableFaceIndexing?: boolean;
}

/**
 * Spatial query options
 */
export interface SpatialQueryOptions {
  radius?: number;
  maxResults?: number;
  includeFaces?: boolean;
  sortByDistance?: boolean;
}

/**
 * Octree statistics
 */
export interface OctreeStatistics {
  totalNodes: number;
  leafNodes: number;
  maxDepth: number;
  averageObjectsPerLeaf: number;
}

/**
 * Bounding box structure
 */
export interface BoundingBox {
  min: Vector3;
  max: Vector3;
} 