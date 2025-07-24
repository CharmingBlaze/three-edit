import { Vector3 } from 'three';

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

/**
 * UV generation parameters
 */
export interface UVGenerationParams {
  /** Scale factor for UV coordinates */
  scale?: number;
  /** UV offset */
  offset?: UVCoord;
  /** Whether to normalize UV coordinates */
  normalize?: boolean;
  /** Whether to flip U coordinates */
  flipU?: boolean;
  /** Whether to flip V coordinates */
  flipV?: boolean;
  /** Rotation in degrees */
  rotation?: number;
}

/**
 * UV projection type
 */
export type UVProjectionType = 'planar' | 'cylindrical' | 'spherical' | 'box' | 'unwrap';

/**
 * Generate UVs options
 */
export interface GenerateUVsOptions {
  /** Whether to generate UVs */
  generateUVs?: boolean;
  /** UV mapping method */
  method?: UVProjectionType;
  /** UV scale factors */
  scale?: { u: number; v: number };
  /** UV offset */
  offset?: { u: number; v: number };
  /** UV rotation in radians */
  rotation?: number;
} 