// Legacy exports for backward compatibility
import { EditableMesh } from '../core/index.ts';
import { MemoryOptimizationOptions, MemoryStatistics, CompressedVertex } from './memory/types';
import { optimizeVertexSharing } from './memory/vertexOptimization';
import { optimizeFaces } from './memory/faceOptimization';
import { optimizeMaterials } from './memory/materialOptimization';
import { estimateMemoryUsage, generateMemoryStatistics } from './memory/statistics';

export type {
  MemoryOptimizationOptions,
  MemoryStatistics,
  CompressedVertex
};

/**
 * Memory optimization system for large meshes
 */
export class MemoryOptimizer {
  private mesh: EditableMesh;
  private options: MemoryOptimizationOptions;
  private originalMesh: EditableMesh;

  constructor(mesh: EditableMesh, options: MemoryOptimizationOptions = {}) {
    this.originalMesh = mesh;
    this.mesh = mesh.clone();
    this.options = {
      enableVertexSharing: true,
      enableFaceOptimization: true,
      enableUVCompression: true,

      enableMaterialOptimization: true,
      precision: 6,
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      ...options
    };
  }

  /**
   * Optimize mesh memory usage
   */
  optimize(): EditableMesh {
    if (this.options.enableVertexSharing) {
      this.optimizeVertexSharing();
    }

    if (this.options.enableFaceOptimization) {
      this.optimizeFaces();
    }

    if (this.options.enableMaterialOptimization) {
      optimizeMaterials(this.mesh, this.options);
    }

    const optimizedMemory = estimateMemoryUsage(this.mesh);
    
    // If still over memory limit, apply aggressive optimization
    if (optimizedMemory > this.options.maxMemoryUsage!) {
      this.applyAggressiveOptimization();
    }

    return this.mesh;
  }

  /**
   * Optimize vertex sharing by merging duplicate vertices
   */
  private optimizeVertexSharing(): void {
    const result = optimizeVertexSharing(this.mesh, this.options);
    
    // Update vertices array
    this.mesh.vertices = result.newVertices;

    // Update face vertex indices
    this.mesh.faces.forEach(face => {
      face.vertices = face.vertices.map(vertexIndex => {
        const vertex = this.mesh.vertices[vertexIndex];
        const newIndex = result.vertexIndexMap.get(vertex);
        return newIndex !== undefined ? newIndex : vertexIndex;
      });
    });
  }

  /**
   * Optimize faces by removing degenerate faces and optimizing indices
   */
  private optimizeFaces(): void {
    const result = optimizeFaces(this.mesh, this.options);
    this.mesh.faces = result.optimizedFaces;
  }

  /**
   * Apply aggressive optimization when memory limit is exceeded
   */
  private applyAggressiveOptimization(): void {
    // Reduce precision further
    this.options.precision = Math.max(2, (this.options.precision ?? 6) - 2);
    
    // Re-optimize with more aggressive settings
    this.optimizeVertexSharing();
    this.optimizeFaces();
    optimizeMaterials(this.mesh, this.options);
    
    // If still over limit, simplify mesh
    if (estimateMemoryUsage(this.mesh) > this.options.maxMemoryUsage!) {
      this.simplifyMesh();
    }
  }

  /**
   * Simplify mesh by removing less important vertices
   */
  private simplifyMesh(): void {
    // Simple simplification: remove vertices with lowest connectivity
    const connectivity = new Map<number, number>();
    
    this.mesh.faces.forEach(face => {
      face.vertices.forEach(vertexIndex => {
        connectivity.set(vertexIndex, (connectivity.get(vertexIndex) ?? 0) + 1);
      });
    });
    
    // Sort vertices by connectivity (ascending)
    const sortedVertices = Array.from(connectivity.entries())
      .sort((a, b) => a[1] - b[1]);
    
    // Remove vertices with lowest connectivity until memory usage is acceptable
    let removedCount = 0;
    for (const [vertexIndex] of sortedVertices) {
      if (estimateMemoryUsage(this.mesh) <= this.options.maxMemoryUsage!) {
        break;
      }
      
      // Remove faces that use this vertex
      this.mesh.faces = this.mesh.faces.filter(face => 
        !face.vertices.includes(vertexIndex)
      );
      
      removedCount++;
    }
  }

  /**
   * Get optimization statistics
   */
  getStatistics(): MemoryStatistics {
    return generateMemoryStatistics(this.originalMesh, this.mesh);
  }

  /**
   * Get compressed vertex data for external processing
   */
  getCompressedVertexData(): CompressedVertex[] {
    const compressedVertices: CompressedVertex[] = this.mesh.vertices.map((vertex, index) => ({
      x: vertex.x,
      y: vertex.y,
      z: vertex.z,
      normal: vertex.normal ? [vertex.normal.x, vertex.normal.y, vertex.normal.z] : [0, 1, 0],
      uv: vertex.uv ? [vertex.uv.u, vertex.uv.v] : [0, 0],
      index
    }));
    return compressedVertices;
  }

  /**
   * Create mesh from compressed vertex data
   */
  static createMeshFromCompressedData(
    vertices: CompressedVertex[],
    faces: Array<{ vertices: number[]; materialIndex: number }>
  ): EditableMesh {
    // This would need to be implemented based on the actual EditableMesh constructor
    // For now, return a basic mesh structure
    const mesh = new EditableMesh();
    
    // Convert compressed vertices to EditableMesh vertices
    mesh.vertices = vertices.map(_v => {
      // This is a simplified conversion - actual implementation would need proper Vertex creation
      return {} as any; // Placeholder
    });
    
    // Convert faces
    mesh.faces = faces.map(_f => {
      // This is a simplified conversion - actual implementation would need proper Face creation
      return {} as any; // Placeholder
    });
    
    return mesh;
  }
} 