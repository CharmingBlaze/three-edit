// Legacy exports for backward compatibility
import { EditableMesh } from '../core/EditableMesh.ts';
import { GPUOptions, GPUOperationResult, TransformOperation, NoiseType, NoiseOptions, GPUCapabilities } from './gpu/types';
import { GPUInitializer } from './gpu/initialization';
import { GPUOperations } from './gpu/operations';


export type {
  GPUOptions,
  GPUOperationResult,
  TransformOperation,
  NoiseType,
  NoiseOptions,
  GPUCapabilities
};

/**
 * GPU Accelerator for mesh operations
 */
export class GPUAccelerator {
  private initializer: GPUInitializer;
  private operations: GPUOperations;

  constructor(options: GPUOptions = {}) {
    this.initializer = new GPUInitializer(options);
    this.operations = new GPUOperations();
  }

  /**
   * Initialize GPU acceleration
   */
  async initialize(): Promise<boolean> {
    return this.initializer.initialize();
  }

  /**
   * Parallel vertex transformation using compute shaders
   */
  async transformVertices(
    mesh: EditableMesh,
    transformMatrix: Float32Array,
    operation: TransformOperation
  ): Promise<GPUOperationResult> {
    return this.operations.transformVertices(mesh, transformMatrix, operation);
  }

  /**
   * Parallel face normal calculation using compute shaders
   */
  async calculateFaceNormals(mesh: EditableMesh): Promise<GPUOperationResult> {
    return this.operations.calculateFaceNormals(mesh);
  }

  /**
   * Parallel vertex noise application using compute shaders
   */
  async applyVertexNoise(
    mesh: EditableMesh,
    noiseType: NoiseType,
    options: NoiseOptions
  ): Promise<GPUOperationResult> {
    return this.operations.applyVertexNoise(mesh, noiseType, options);
  }

  /**
   * Get GPU capabilities
   */
  getGPUCapabilities(): GPUCapabilities {
    return this.initializer.getGPUCapabilities();
  }

  /**
   * Dispose GPU resources
   */
  dispose(): void {
    this.initializer.dispose();
  }
} 