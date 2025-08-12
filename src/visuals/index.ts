/**
 * Visuals - Blender-style modular visual system
 * Provides camera grids, selection highlights, edit mode handles, gizmos, overlays, and more
 * 
 * All helpers are small, stateless, and never modify core mesh/selection data.
 */

// Grid helpers
export * from './grids';

// Highlight helpers
export * from './highlights';

// Overlay helpers
export { 
  BoundingBoxHelper, 
  createMeshBoundingBoxHelper, 
  createMultiObjectBoundingBoxHelper,
  updateBoundingBoxHelper,
  disposeBoundingBoxHelper 
} from './overlays/BoundingBoxHelper';

export type { BoundingBoxHelperOptions } from './overlays/BoundingBoxHelper';

// Placeholder exports for future modules
// These will be implemented as we continue the refactor

// Handles
// export * from './handles';

// Gizmos  
// export * from './gizmos';

// UV helpers
// export * from './uvs';

// Animation helpers
// export * from './animation'; 