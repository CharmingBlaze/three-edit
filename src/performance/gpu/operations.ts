import { EditableMesh } from '../../core/index';
import { GPUOperationResult, TransformOperation, NoiseType, NoiseOptions } from './types';

/**
 * GPU operations with fallback implementations
 */
export class GPUOperations {
  /**
   * Parallel vertex transformation using compute shaders
   */
  async transformVertices(
    mesh: EditableMesh,
    transformMatrix: Float32Array,
    operation: TransformOperation
  ): Promise<GPUOperationResult> {
    const startTime = performance.now();

    try {
      // Always use fallback since compute shaders aren't supported
      return this.fallbackTransformVertices(mesh, transformMatrix, operation);
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        memoryUsage: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Parallel face normal calculation using compute shaders
   */
  async calculateFaceNormals(mesh: EditableMesh): Promise<GPUOperationResult> {
    const startTime = performance.now();

    try {
      // Always use fallback since compute shaders aren't supported
      return this.fallbackCalculateFaceNormals(mesh);
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        memoryUsage: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Parallel vertex noise application using compute shaders
   */
  async applyVertexNoise(
    mesh: EditableMesh,
    noiseType: NoiseType,
    options: NoiseOptions
  ): Promise<GPUOperationResult> {
    const startTime = performance.now();

    try {
      // Always use fallback since compute shaders aren't supported
      return this.fallbackApplyVertexNoise(mesh, noiseType, options);
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        memoryUsage: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fallback vertex transformation using CPU
   */
  private fallbackTransformVertices(
    mesh: EditableMesh,
    transformMatrix: Float32Array,
    _operation: string // Used for logging and debugging
  ): GPUOperationResult {
    const startTime = performance.now();
    let memoryUsage = 0;

    try {
      // Convert transform matrix to 4x4 matrix
      const matrix = new Float32Array(16);
      for (let i = 0; i < Math.min(transformMatrix.length, 16); i++) {
        matrix[i] = transformMatrix[i];
      }

      // Apply transformation to each vertex
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const vertex = mesh.getVertex(i);
        if (!vertex) continue;

        // Apply matrix transformation (simplified)
        const x = vertex.x * matrix[0] + vertex.y * matrix[4] + vertex.z * matrix[8] + matrix[12];
        const y = vertex.x * matrix[1] + vertex.y * matrix[5] + vertex.z * matrix[9] + matrix[13];
        const z = vertex.x * matrix[2] + vertex.y * matrix[6] + vertex.z * matrix[10] + matrix[14];

        vertex.x = x;
        vertex.y = y;
        vertex.z = z;
      }

      memoryUsage = this.estimateMemoryUsage(mesh);

      return {
        success: true,
        executionTime: performance.now() - startTime,
        memoryUsage
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        memoryUsage,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fallback face normal calculation using CPU
   */
  private fallbackCalculateFaceNormals(mesh: EditableMesh): GPUOperationResult {
    const startTime = performance.now();
    let memoryUsage = 0;

    try {
      // Calculate face normals for each face
      for (let i = 0; i < mesh.getFaceCount(); i++) {
        const face = mesh.getFace(i);
        if (!face || face.vertices.length < 3) continue;

        // Get first three vertices to calculate normal
        const v1 = mesh.getVertex(face.vertices[0]);
        const v2 = mesh.getVertex(face.vertices[1]);
        const v3 = mesh.getVertex(face.vertices[2]);

        if (!v1 || !v2 || !v3) continue;

        // Calculate face normal using cross product
        const edge1 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
        const edge2 = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };

        const normal = {
          x: edge1.y * edge2.z - edge1.z * edge2.y,
          y: edge1.z * edge2.x - edge1.x * edge2.z,
          z: edge1.x * edge2.y - edge1.y * edge2.x
        };

        // Normalize the normal vector
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        if (length > 0) {
          normal.x /= length;
          normal.y /= length;
          normal.z /= length;
        }

        // Store normal in face (if face has normal property)
        if (face.normal) {
          face.normal.x = normal.x;
          face.normal.y = normal.y;
          face.normal.z = normal.z;
        }
      }

      memoryUsage = this.estimateMemoryUsage(mesh);

      return {
        success: true,
        executionTime: performance.now() - startTime,
        memoryUsage
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        memoryUsage,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fallback vertex noise application using CPU
   */
  private fallbackApplyVertexNoise(
    mesh: EditableMesh,
    _noiseType: string, // Used for shader selection
    options: { scale: number; intensity: number; seed: number }
  ): GPUOperationResult {
    const startTime = performance.now();
    let memoryUsage = 0;

    try {
      const { scale, intensity, seed } = options;

      // Simple noise function (placeholder)
      const noise = (x: number, y: number, z: number): number => {
        return Math.sin(x * scale + seed) * Math.cos(y * scale + seed) * Math.sin(z * scale + seed);
      };

      // Apply noise to each vertex
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const vertex = mesh.getVertex(i);
        if (!vertex) continue;

        const noiseValue = noise(vertex.x, vertex.y, vertex.z);
        
        vertex.x += noiseValue * intensity;
        vertex.y += noiseValue * intensity;
        vertex.z += noiseValue * intensity;
      }

      memoryUsage = this.estimateMemoryUsage(mesh);

      return {
        success: true,
        executionTime: performance.now() - startTime,
        memoryUsage
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        memoryUsage,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Estimate memory usage of mesh
   */
  private estimateMemoryUsage(mesh: EditableMesh): number {
    const vertexCount = mesh.getVertexCount();
    const faceCount = mesh.getFaceCount();
    
    // Rough estimate: 3 floats per vertex + 3 floats per face normal
    return vertexCount * 12 + faceCount * 12; // bytes
  }
} 