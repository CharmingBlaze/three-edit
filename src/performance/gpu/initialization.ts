import { GPUOptions, GPUCapabilities } from './types';

/**
 * GPU initialization and capability detection
 */
export class GPUInitializer {
  private gl: WebGL2RenderingContext | null = null;
  private options: GPUOptions;

  constructor(options: GPUOptions = {}) {
    this.options = {
      enableComputeShaders: false, // Disabled by default since WebGL2 compute shaders aren't widely supported
      enableParallelProcessing: true,
      batchSize: 1000,
      maxWorkGroupSize: 256,
      enableMemoryMapping: false,
      ...options
    };
  }

  /**
   * Initialize GPU acceleration
   */
  async initialize(): Promise<boolean> {
    try {
      // Try to get WebGL2 context
      const canvas = document.createElement('canvas');
      this.gl = canvas.getContext('webgl2');
      
      if (!this.gl) {
        console.warn('WebGL2 not supported, falling back to CPU operations');
        return false;
      }

      // Check for compute shader support (this will fail in most browsers)
      const computeShaderSupported = this.checkComputeShaderSupport();
      
      if (!computeShaderSupported) {
        console.warn('Compute shaders not supported, falling back to CPU operations');
        this.options.enableComputeShaders = false;
      }

      return true;
    } catch (error) {
      console.warn('GPU initialization failed:', error);
      return false;
    }
  }

  /**
   * Check if compute shaders are supported
   */
  checkComputeShaderSupport(): boolean {
    if (!this.gl) return false;
    
    try {
      // These constants don't exist in WebGL2, so we'll return false
      // In a real implementation, you'd check for WebGL compute shader extensions
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get GPU capabilities
   */
  getGPUCapabilities(): GPUCapabilities {
    const webgl2Supported = this.gl !== null;
    const computeShadersSupported = this.checkComputeShaderSupport();
    
    return {
      webgl2Supported,
      computeShadersSupported,
      maxWorkGroupSize: this.options.maxWorkGroupSize ?? 256,
      maxComputeWorkGroups: [65535, 65535, 65535] // Default WebGL2 limits
    };
  }

  /**
   * Get WebGL context
   */
  getGL(): WebGL2RenderingContext | null {
    return this.gl;
  }

  /**
   * Get GPU options
   */
  getOptions(): GPUOptions {
    return this.options;
  }

  /**
   * Dispose GPU resources
   */
  dispose(): void {
    if (this.gl) {
      // Clean up WebGL resources if needed
      this.gl = null;
    }
  }
} 