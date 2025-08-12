// Legacy exports for backward compatibility
import { EditableMesh } from '../core/index';
import { LODLevel, LODOptions, LODSelectionOptions, LODStatistics } from './lod/types';
import { simplifyMeshForLOD } from './lod/meshSimplification';
import { selectLODLevel, calculateOptimalDistance, calculateErrorMetric } from './lod/selection';
import { calculateLODStatistics } from './lod/statistics';

export type {
  LODLevel,
  LODOptions,
  LODSelectionOptions,
  LODStatistics
};

/**
 * Level-of-Detail system for efficient mesh rendering
 */
export class LODSystem {
  private levels: LODLevel[] = [];
  private originalMesh: EditableMesh;
  private options: LODOptions;

  constructor(mesh: EditableMesh, options: LODOptions = {}) {
    this.originalMesh = mesh;
    this.options = {
      levels: 4,
      reductionFactor: 0.5,
      ...options
    };

    this.generateLODLevels();
  }

  /**
   * Generate LOD levels for the mesh
   */
  private generateLODLevels(): void {
    // Level 0 is the original mesh
    this.levels.push({
      level: 0,
      mesh: this.originalMesh.clone(),
      vertexCount: this.originalMesh.vertices.length,
      faceCount: this.originalMesh.faces.length,
      errorMetric: 0,
      distance: 0
    });

    // Generate simplified levels
    for (let i = 1; i < this.options.levels!; i++) {
      const previousLevel = this.levels[i - 1];
      const simplifiedMesh = simplifyMeshForLOD(previousLevel.mesh, i, this.options);
      
      this.levels.push({
        level: i,
        mesh: simplifiedMesh,
        vertexCount: simplifiedMesh.vertices.length,
        faceCount: simplifiedMesh.faces.length,
        errorMetric: calculateErrorMetric(previousLevel.mesh, simplifiedMesh),
        distance: calculateOptimalDistance(i)
      });
    }
  }

  /**
   * Select appropriate LOD level based on distance and quality preferences
   */
  selectLODLevel(options: LODSelectionOptions = {}): LODLevel {
    return selectLODLevel(this.levels, options);
  }

  /**
   * Get all LOD levels
   */
  getLODLevels(): LODLevel[] {
    return this.levels;
  }

  /**
   * Get LOD statistics
   */
  getStatistics(): LODStatistics {
    return calculateLODStatistics(this.levels);
  }
} 