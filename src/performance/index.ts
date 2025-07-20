// Performance optimization modules
export { Octree } from './octree';
export { LODSystem } from './lod';
export { MeshSimplifier } from './simplification';
export { MemoryOptimizer } from './memory';
export { GPUAccelerator } from './gpu';

// Re-export types
export type {
  OctreeNode,
  OctreeOptions,
  SpatialQueryOptions
} from './octree';

export type {
  LODLevel,
  LODOptions,
  LODSelectionOptions
} from './lod';

export type {
  SimplificationOptions,
  SimplificationResult
} from './simplification/types';

export type {
  MemoryOptimizationOptions,
  MemoryStatistics,
  CompressedVertex
} from './memory/types';

export type {
  GPUOptions,
  GPUOperationResult
} from './gpu/types'; 