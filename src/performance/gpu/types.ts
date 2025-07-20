// EditableMesh is used in the interface definitions
import { EditableMesh } from '../../core/index.ts';

/**
 * GPU acceleration options
 */
export interface GPUOptions {
  enableComputeShaders?: boolean;
  enableParallelProcessing?: boolean;
  batchSize?: number;
  maxWorkGroupSize?: number;
  enableMemoryMapping?: boolean;
}

/**
 * Result of a GPU operation
 */
export interface GPUOperationResult {
  success: boolean;
  executionTime: number;
  memoryUsage: number;
  error?: string;
}

/**
 * Compute shader information
 */
export interface ComputeShaderInfo {
  name: string;
  source: string;
  workGroupSize: [number, number, number];
  uniforms: Record<string, any>;
}

/**
 * GPU capabilities information
 */
export interface GPUCapabilities {
  webgl2Supported: boolean;
  computeShadersSupported: boolean;
  maxWorkGroupSize: number;
  maxComputeWorkGroups: [number, number, number];
}

/**
 * Noise application options
 */
export interface NoiseOptions {
  scale: number;
  intensity: number;
  seed: number;
}

/**
 * Transform operation types
 */
export type TransformOperation = 'translate' | 'rotate' | 'scale' | 'custom';

/**
 * Noise types
 */
export type NoiseType = 'perlin' | 'fractal' | 'cellular' | 'turbulence'; 