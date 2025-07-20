import { EditableMesh } from '../../core/index.ts';
import { LODLevel, LODStatistics } from './types';

/**
 * Calculate LOD statistics
 */
export function calculateLODStatistics(levels: LODLevel[]): LODStatistics {
  const totalLevels = levels.length;
  const originalVertexCount = levels[0]?.vertexCount ?? 0;
  const originalFaceCount = levels[0]?.faceCount ?? 0;
  
  const reductionRatios = levels.map(level => {
    if (originalVertexCount === 0) return 0;
    return (originalVertexCount - level.vertexCount) / originalVertexCount;
  });
  
  return {
    totalLevels,
    originalVertexCount,
    originalFaceCount,
    reductionRatios
  };
}

/**
 * Calculate average reduction ratio across all levels
 */
export function calculateAverageReductionRatio(levels: LODLevel[]): number {
  if (levels.length === 0) return 0;
  
  const totalReduction = levels.reduce((sum, level) => {
    const originalCount = levels[0].vertexCount;
    return sum + ((originalCount - level.vertexCount) / originalCount);
  }, 0);
  
  return totalReduction / levels.length;
}

/**
 * Calculate memory savings from LOD system
 */
export function calculateMemorySavings(levels: LODLevel[]): number {
  if (levels.length === 0) return 0;
  
  const originalMemory = estimateMeshMemory(levels[0].mesh);
  const simplifiedMemory = levels[levels.length - 1].mesh.vertices.length * 24; // Rough estimate
  
  return originalMemory - simplifiedMemory;
}

/**
 * Estimate mesh memory usage in bytes
 */
export function estimateMeshMemory(mesh: EditableMesh): number {
  let memoryUsage = 0;
  
  // Vertex memory (position, normal, uv, userData)
  mesh.vertices.forEach(vertex => {
    memoryUsage += 3 * 8; // x, y, z (64-bit doubles)
    if (vertex.normal) memoryUsage += 3 * 8; // normal
    if (vertex.uv) memoryUsage += 2 * 8; // uv
    memoryUsage += 32; // userData object overhead
  });
  
  // Face memory
  mesh.faces.forEach(face => {
    memoryUsage += face.vertices.length * 4; // vertex indices
    memoryUsage += 8; // materialIndex
  });
  
  return memoryUsage;
}

/**
 * Calculate performance improvement ratio
 */
export function calculatePerformanceImprovement(levels: LODLevel[]): number {
  if (levels.length === 0) return 0;
  
  const originalVertexCount = levels[0].vertexCount;
  const simplifiedVertexCount = levels[levels.length - 1].vertexCount;
  
  if (originalVertexCount === 0) return 0;
  
  return (originalVertexCount - simplifiedVertexCount) / originalVertexCount;
}

/**
 * Get LOD level recommendations based on distance
 */
export function getLODRecommendations(levels: LODLevel[], distance: number): {
  recommendedLevel: number;
  quality: 'high' | 'medium' | 'low';
  performanceGain: number;
} {
  let recommendedLevel = 0;
  
  // Find appropriate level based on distance
  for (let i = levels.length - 1; i >= 0; i--) {
    if (distance >= levels[i].distance) {
      recommendedLevel = i;
      break;
    }
  }
  
  // Determine quality level
  let quality: 'high' | 'medium' | 'low';
  if (recommendedLevel === 0) {
    quality = 'high';
  } else if (recommendedLevel < levels.length / 2) {
    quality = 'medium';
  } else {
    quality = 'low';
  }
  
  // Calculate performance gain
  const originalVertexCount = levels[0].vertexCount;
  const currentVertexCount = levels[recommendedLevel].vertexCount;
  const performanceGain = originalVertexCount > 0 
    ? (originalVertexCount - currentVertexCount) / originalVertexCount 
    : 0;
  
  return {
    recommendedLevel,
    quality,
    performanceGain
  };
} 