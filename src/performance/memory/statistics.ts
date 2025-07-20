import { EditableMesh } from '../../core/index.ts';
import { MemoryStatistics } from './types';

/**
 * Estimate memory usage of a mesh in bytes
 */
export function estimateMemoryUsage(mesh: EditableMesh): number {
  let totalBytes = 0;

  // Vertex memory (position, normal, uv, userData)
  mesh.vertices.forEach(vertex => {
    totalBytes += 3 * 8; // x, y, z (64-bit doubles)
    if (vertex.normal) totalBytes += 3 * 8; // normal
    if (vertex.uv) totalBytes += 2 * 8; // uv
    if (vertex.userData) totalBytes += 100; // estimated userData size
  });

  // Edge memory
  mesh.edges.forEach(edge => {
    totalBytes += 2 * 4; // v1, v2 (32-bit integers)
    if (edge.userData) totalBytes += 50; // estimated userData size
  });

  // Face memory
  mesh.faces.forEach(face => {
    totalBytes += face.vertices.length * 4; // vertex indices
    totalBytes += face.edges.length * 4; // edge indices
    if (face.materialIndex !== undefined) totalBytes += 4; // material index
    if (face.normal) totalBytes += 3 * 8; // normal
    if (face.userData) totalBytes += 50; // estimated userData size
  });

  // Matrix memory
  totalBytes += 16 * 8; // 4x4 matrix (64-bit doubles)

  return totalBytes;
}

/**
 * Calculate memory reduction percentage
 */
export function calculateMemoryReduction(
  originalMemory: number,
  optimizedMemory: number
): number {
  if (originalMemory === 0) return 0;
  return ((originalMemory - optimizedMemory) / originalMemory) * 100;
}

/**
 * Calculate vertex sharing ratio
 */
export function calculateVertexSharingRatio(
  originalVertexCount: number,
  optimizedVertexCount: number
): number {
  if (originalVertexCount === 0) return 0;
  return (originalVertexCount - optimizedVertexCount) / originalVertexCount;
}

/**
 * Calculate compression ratio for UVs and normals
 */
export function calculateCompressionRatio(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize === 0) return 0;
  return (originalSize - compressedSize) / originalSize;
}

/**
 * Generate comprehensive memory statistics
 */
export function generateMemoryStatistics(
  originalMesh: EditableMesh,
  optimizedMesh: EditableMesh
): MemoryStatistics {
  const originalMemory = estimateMemoryUsage(originalMesh);
  const optimizedMemory = estimateMemoryUsage(optimizedMesh);
  const memoryReduction = calculateMemoryReduction(originalMemory, optimizedMemory);
  
  const vertexSharingRatio = calculateVertexSharingRatio(
    originalMesh.vertices.length,
    optimizedMesh.vertices.length
  );
  
  const faceOptimizationRatio = calculateFaceOptimizationRatio(
    originalMesh.faces.length,
    optimizedMesh.faces.length
  );
  
  const compressionRatio = calculateCompressionRatio(originalMemory, optimizedMemory);

  return {
    totalMemory: originalMemory,
    vertexMemory: originalMemory * 0.4, // Estimate
    faceMemory: originalMemory * 0.3, // Estimate
    edgeMemory: originalMemory * 0.2, // Estimate
    materialMemory: originalMemory * 0.1, // Estimate
    optimizedMemory: optimizedMemory,
    reductionPercentage: memoryReduction,
    originalMemoryUsage: originalMemory,
    optimizedMemoryUsage: optimizedMemory,
    memoryReduction: memoryReduction,
    vertexSharingRatio: vertexSharingRatio,
    faceOptimizationRatio: faceOptimizationRatio,
    compressionRatio: compressionRatio
  };
}

/**
 * Calculate face optimization ratio for statistics
 */
export function calculateFaceOptimizationRatio(
  originalFaceCount: number,
  optimizedFaceCount: number
): number {
  if (originalFaceCount === 0) return 0;
  return (originalFaceCount - optimizedFaceCount) / originalFaceCount;
} 