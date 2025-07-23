import { EditableMesh } from '../core/EditableMesh';
import { generatePlanarUVs } from './planarUVs';
import { generateCubicUVs } from './cubicUVs';
import { generateSphericalUVs } from './sphericalUVs';
import { generateCylindricalUVs } from './cylindricalUVs';
import { UVCoord } from './types';

export enum UVProjectionType {
  PLANAR = 'planar',
  CUBIC = 'cubic',
  SPHERICAL = 'spherical',
  CYLINDRICAL = 'cylindrical',
}

export interface UVGenerationParams {
  scale?: number;
  offset?: UVCoord;
  normalize?: boolean;
  flipU?: boolean;
  flipV?: boolean;
  rotation?: number;
}

export interface GenerateUVsOptions extends UVGenerationParams {
  projectionType?: UVProjectionType;
  projectionAxis?: 'x' | 'y' | 'z';
}

/**
 * Generates UV coordinates for a mesh using the specified projection
 * @param mesh The mesh to generate UVs for
 * @param options UV generation options
 * @returns The mesh with generated UVs
 */
export function generateUVs(
  mesh: EditableMesh,
  options: GenerateUVsOptions = {}
): EditableMesh {
  const projectionType = options.projectionType ?? UVProjectionType.PLANAR;
  const projectionAxis = options.projectionAxis ?? 'y';
  const scale = options.scale ?? 1.0;
  const offset = options.offset ?? { u: 0, v: 0 };
  const normalize = options.normalize ?? true;
  const flipU = options.flipU ?? false;
  const flipV = options.flipV ?? false;
  const rotation = options.rotation ?? 0;
  
  const params: UVGenerationParams = {
    scale,
    offset,
    normalize,
    flipU,
    flipV,
    rotation
  };
  
  // Choose the appropriate projection function
  switch (projectionType) {
    case UVProjectionType.PLANAR:
      return generatePlanarUVs(mesh, projectionAxis, params);
    case UVProjectionType.CUBIC:
      return generateCubicUVs(mesh, params);
    case UVProjectionType.SPHERICAL:
      return generateSphericalUVs(mesh, params);
    case UVProjectionType.CYLINDRICAL:
      return generateCylindricalUVs(mesh, params);
    default:
      throw new Error(`Unsupported UV projection type: ${projectionType}`);
  }
}
