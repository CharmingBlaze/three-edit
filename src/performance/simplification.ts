// Legacy exports for backward compatibility
import { EditableMesh } from '../core/index.ts';
import { SimplificationOptions, SimplificationResult, SimplificationStatistics } from './simplification/types';
import { findBestEdgeCollapse } from './simplification/edgeCollapse';
import { collapseEdge, calculateErrorMetric } from './simplification/meshOperations';
import { calculateSimplificationStatistics } from './simplification/statistics';

export type {
  SimplificationOptions,
  SimplificationResult,
  SimplificationStatistics
};

/**
 * Mesh simplification using edge collapse algorithm
 */
export class MeshSimplifier {
  private mesh: EditableMesh;
  private options: SimplificationOptions;

  constructor(mesh: EditableMesh, options: SimplificationOptions = {}) {
    this.mesh = mesh.clone();
    this.options = {
      targetRatio: 0.5,
      preserveBoundaries: true,
      preserveUVs: true,
      preserveNormals: true,
      errorThreshold: 0.1,
      maxIterations: 1000,
      ...options
    };
  }

  /**
   * Simplify mesh to target ratio
   */
  simplify(): SimplificationResult {
    const originalVertexCount = this.mesh.vertices.length;
    const originalFaceCount = this.mesh.faces.length;
    const targetVertexCount = Math.floor(originalVertexCount * this.options.targetRatio!);
    
    let iterations = 0;
    let currentError = 0;

    while (
      this.mesh.vertices.length > targetVertexCount &&
      iterations < this.options.maxIterations! &&
      currentError < this.options.errorThreshold!
    ) {
      const edgeCollapse = findBestEdgeCollapse(this.mesh, this.options);
      
      if (!edgeCollapse) break;
      
      collapseEdge(this.mesh, edgeCollapse);
      currentError = calculateErrorMetric(this.mesh);
      iterations++;
    }

    return {
      mesh: this.mesh,
      originalVertexCount,
      originalFaceCount,
      finalVertexCount: this.mesh.vertices.length,
      finalFaceCount: this.mesh.faces.length,
      reductionRatio: this.mesh.vertices.length / originalVertexCount,
      errorMetric: currentError,
      iterations
    };
  }

  /**
   * Get simplification statistics
   */
  getStatistics(): SimplificationStatistics {
    return calculateSimplificationStatistics(this.mesh);
  }
} 