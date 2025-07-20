import { Vector3 } from 'three';
import { EditableMesh } from '../../core/index.ts';

/**
 * Options for noise operations
 */
export interface NoiseOptions {
  /** Scale of the noise (default: 1.0) */
  scale?: number;
  /** Intensity of the noise (default: 0.1) */
  intensity?: number;
  /** Seed for the noise generator (default: 0) */
  seed?: number;
  /** Number of octaves for fractal noise (default: 1) */
  octaves?: number;
  /** Persistence for fractal noise (default: 0.5) */
  persistence?: number;
  /** Lacunarity for fractal noise (default: 2.0) */
  lacunarity?: number;
  /** Whether to keep original geometry */
  keepOriginal?: boolean;
  /** Material index for new faces */
  materialIndex?: number;
}

/**
 * Options for vertex noise operations
 */
export interface VertexNoiseOptions extends NoiseOptions {
  /** Direction of the noise displacement */
  direction?: Vector3;
  /** Whether to apply noise to all vertices */
  allVertices?: boolean;
  /** Minimum noise threshold */
  threshold?: number;
}

/**
 * Options for face displacement operations
 */
export interface FaceDisplacementOptions extends NoiseOptions {
  /** Direction of the displacement */
  direction?: Vector3;
  /** Whether to displace all faces */
  allFaces?: boolean;
  /** Minimum displacement threshold */
  threshold?: number;
  /** Whether to preserve face normals */
  preserveNormals?: boolean;
}

/**
 * Noise generator interface
 */
export interface NoiseGenerator {
  noise(x: number, y?: number, z?: number): number;
  fractal(x: number, y?: number, z?: number, octaves?: number, persistence?: number, lacunarity?: number): number;
} 