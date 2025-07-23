// Legacy exports for backward compatibility
import { EditableMesh } from '../core/index.ts';
import { Vertex } from '../core/Vertex.ts';
import { Face } from '../core/Face.ts';
import { Vector3 } from 'three';
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
    optimizeFaces(this.mesh, this.options);
    // The optimizeFaces function returns a result object, not the faces array
    // We need to filter the faces ourselves based on the result
    this.mesh.faces = this.mesh.faces.filter(face => {
      if (face.vertices.length < 3) return false;
      
      // Check for duplicate vertices
      const uniqueVertices = new Set(face.vertices);
      if (uniqueVertices.size < 3) return false;
      
      // Check for zero area faces
      const area = this.calculateFaceArea(face);
      return area > 1e-10;
    });
  }

  /**
   * Calculate face area for optimization decisions
   */
  private calculateFaceArea(face: any): number {
    if (face.vertices.length < 3) return 0;

    const vertices = face.vertices.map((index: number) => this.mesh.vertices[index]).filter(Boolean);
    if (vertices.length < 3) return 0;

    // Calculate area using cross product
    const v0 = vertices[0];
    const v1 = vertices[1];
    const v2 = vertices[2];

    const edge1 = {
      x: v1.x - v0.x,
      y: v1.y - v0.y,
      z: v1.z - v0.z
    };

    const edge2 = {
      x: v2.x - v0.x,
      y: v2.y - v0.y,
      z: v2.z - v0.z
    };

    // Cross product
    const cross = {
      x: edge1.y * edge2.z - edge1.z * edge2.y,
      y: edge1.z * edge2.x - edge1.x * edge2.z,
      z: edge1.x * edge2.y - edge1.y * edge2.x
    };

    // Area is half the magnitude of the cross product
    const magnitude = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
    return magnitude / 2;
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
    if (!this.mesh.vertices || this.mesh.vertices.length === 0) {
      return [];
    }
    
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
    const mesh = new EditableMesh();
    
    // Convert compressed vertices to EditableMesh vertices
    mesh.vertices = vertices.map(v => {
      const vertex = new Vertex(v.x, v.y, v.z);
      if (v.normal) {
        vertex.normal = new Vector3(v.normal[0], v.normal[1], v.normal[2]);
      }
      if (v.uv) {
        vertex.uv = { u: v.uv[0], v: v.uv[1] };
      }
      return vertex;
    });
    
    // Convert faces
    mesh.faces = faces.map(f => {
      const face = new Face(f.vertices, [], { materialIndex: f.materialIndex });
      return face;
    });
    
    return mesh;
  }
} 