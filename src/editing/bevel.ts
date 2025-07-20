import { EditableMesh } from '../core/EditableMesh.ts';

// Re-export from modular structure
export * from './bevel/types';
export * from './bevel/edgeBevel';
export * from './bevel/faceBevel';
export * from './bevel/vertexBevel';

// Legacy exports for backward compatibility
import { bevelEdge } from './bevel/edgeBevel';
import { bevelFace } from './bevel/faceBevel';
import { bevelVertex } from './bevel/vertexBevel';
import { BevelOptions } from './bevel/types';

export {
  bevelEdge,
  bevelFace,
  bevelVertex
};

/**
 * Generic bevel function that delegates to specific bevel types
 */
export function bevel(
  mesh: EditableMesh,
  bevelType: 'edge' | 'vertex' | 'face',
  targetIndex: number,
  options: BevelOptions = {}
): EditableMesh {
  switch (bevelType) {
    case 'edge':
      return bevelEdge(mesh, targetIndex, options);
    case 'vertex':
      return bevelVertex(mesh, targetIndex, options);
    case 'face':
      return bevelFace(mesh, targetIndex, options);
    default:
      throw new Error(`Unknown bevel type: ${bevelType}`);
  }
} 