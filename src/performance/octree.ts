// Legacy exports for backward compatibility
import { Vector3 } from 'three';
import { EditableMesh, Vertex, Face } from '../core/index';
import { OctreeNode, OctreeOptions, SpatialQueryOptions, OctreeStatistics } from './octree/types';
import { buildOctree } from './octree/construction';
import { findVerticesNearPoint, findFacesNearPoint } from './octree/queries';
import { calculateOctreeStatistics } from './octree/statistics';

export type {
  OctreeNode,
  OctreeOptions,
  SpatialQueryOptions,
  OctreeStatistics
};

/**
 * Octree spatial indexing for efficient spatial queries
 */
export class Octree {
  private root: OctreeNode;
  private options: OctreeOptions;
  private mesh: EditableMesh;

  constructor(mesh: EditableMesh, options: OctreeOptions = {}) {
    this.mesh = mesh;
    this.options = {
      maxDepth: 8,
      maxObjectsPerNode: 10,
      minNodeSize: 0.1,
      enableFaceIndexing: true,
      ...options
    };

    this.root = buildOctree(mesh, this.options);
  }

  /**
   * Find vertices near a point
   */
  findVerticesNearPoint(
    point: Vector3,
    options: SpatialQueryOptions = {}
  ): Vertex[] {
    return findVerticesNearPoint(this.root, point, options);
  }

  /**
   * Find faces near a point
   */
  findFacesNearPoint(
    point: Vector3,
    options: SpatialQueryOptions = {}
  ): Face[] {
    return findFacesNearPoint(this.root, point, this.mesh, options);
  }

  /**
   * Get octree statistics
   */
  getStatistics(): OctreeStatistics {
    return calculateOctreeStatistics(this.root);
  }
} 