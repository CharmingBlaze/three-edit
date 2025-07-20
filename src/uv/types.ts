import { UVCoord } from './UVCoord';

/**
 * UV mapping projection types
 */
export enum UVProjectionType {
  /** Projects UVs based on planar projection along an axis */
  PLANAR = 'planar',
  /** Projects UVs based on cubic projection (6 faces) */
  CUBIC = 'cubic',
  /** Projects UVs based on spherical coordinates */
  SPHERICAL = 'spherical',
  /** Projects UVs based on cylindrical coordinates */
  CYLINDRICAL = 'cylindrical'
}

/**
 * Options for UV generation
 */
export interface GenerateUVsOptions {
  /** Projection type */
  projectionType?: UVProjectionType;
  /** Projection axis for planar projection */
  projectionAxis?: 'x' | 'y' | 'z';
  /** Scale factor for UV coordinates */
  scale?: number;
  /** Offset for UV coordinates */
  offset?: UVCoord;
  /** Whether to normalize UVs to [0,1] range */
  normalize?: boolean;
  /** Whether to flip U coordinates */
  flipU?: boolean;
  /** Whether to flip V coordinates */
  flipV?: boolean;
  /** Whether to rotate UVs (in degrees) */
  rotation?: number;
}

/**
 * Internal UV generation parameters
 */
export interface UVGenerationParams {
  scale: number;
  offset: UVCoord;
  normalize: boolean;
  flipU: boolean;
  flipV: boolean;
  rotation: number;
} 