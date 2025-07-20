// Legacy exports for backward compatibility
import { EditableMesh } from '../core/EditableMesh.ts';
import { BendOptions, TwistOptions, TaperOptions, DeformType } from './deform/types';
import { bend, bendAdvanced } from './deform/bend';
import { twist, twistAdvanced } from './deform/twist';
import { taper, taperAdvanced } from './deform/taper';

export type {
  BendOptions,
  TwistOptions,
  TaperOptions,
  DeformType
};

/**
 * Applies deformation to mesh based on type
 */
export function deform(
  mesh: EditableMesh,
  deformType: DeformType,
  options: BendOptions | TwistOptions | TaperOptions = {}
): EditableMesh {
  switch (deformType) {
    case 'bend':
      return bend(mesh, options as BendOptions);
    
    case 'twist':
      return twist(mesh, options as TwistOptions);
    
    case 'taper':
      return taper(mesh, options as TaperOptions);
    
    default:
      throw new Error(`Unknown deformation type: ${deformType}`);
  }
}

// Re-export main functions for backward compatibility
export { bend, bendAdvanced } from './deform/bend';
export { twist, twistAdvanced } from './deform/twist';
export { taper, taperAdvanced } from './deform/taper'; 