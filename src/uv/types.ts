/**
 * UV Coordinate type for texture mapping
 */
export interface UVCoord {
  u: number;
  v: number;
}

/**
 * UV mapping options
 */
export interface UVMappingOptions {
  /** Whether to generate UVs */
  generateUVs?: boolean;
  /** UV mapping method */
  method?: 'planar' | 'cylindrical' | 'spherical' | 'cubic';
  /** UV scale factors */
  scale?: { u: number; v: number };
  /** UV offset */
  offset?: { u: number; v: number };
  /** UV rotation in radians */
  rotation?: number;
}

/**
 * Face-vertex UV data
 */
export interface FaceVertexUVs {
  [faceIndex: number]: UVCoord[];
} 