import { EditableMesh, Face } from '../../core/index';
import { MemoryOptimizationOptions } from './types';

export interface FaceOptimizationOptions {
  faceTolerance?: number;
  mergeSimilar?: boolean;
  removeDegenerate?: boolean;
  preserveUVs?: boolean;
}

export interface FaceOptimizationResult {
  originalFaceCount: number;
  optimizedFaceCount: number;
  removedFaces: number[];
  mergedFaces: number[][];
  executionTime: number;
}

/**
 * Optimize faces by removing degenerate faces and optimizing indices
 */
export function optimizeFaces(mesh: EditableMesh, _options: MemoryOptimizationOptions = {}): FaceOptimizationResult {
  // const _tolerance = options.faceTolerance ?? 0.001;
  const originalFaceCount = mesh.faces.length;
  
  const startTime = performance.now();
  
  // Remove degenerate faces
  const optimizedFaces = mesh.faces.filter(face => {
    if (face.vertices.length < 3) return false;
    
    // Check for duplicate vertices
    const uniqueVertices = new Set(face.vertices);
    if (uniqueVertices.size < 3) return false;
    
    // Check for zero area faces
    const area = calculateFaceArea(face, mesh);
    return area > 1e-10;
  });

  // Optimize face vertex order for better cache locality
  optimizedFaces.forEach(face => {
    face.vertices = optimizeFaceVertexOrder(face.vertices);
  });

  const executionTime = performance.now() - startTime;

  return {
    originalFaceCount,
    optimizedFaceCount: optimizedFaces.length,
    removedFaces: [],
    mergedFaces: [],
    executionTime
  };
}

/**
 * Optimize face vertex order for better cache locality
 */
export function optimizeFaceVertexOrder(vertices: number[]): number[] {
  if (vertices.length <= 3) return vertices;

  // Simple optimization: ensure vertices are in ascending order where possible
  // Sort vertices for consistent face identification
  // const sorted = [...vertices].sort((a, b) => a - b);
  // const _faceKey = sorted.join(',');
  
  // Try to maintain face winding while optimizing order
  const optimized = [];
  const used = new Set<number>();
  
  for (const vertex of vertices) {
    if (!used.has(vertex)) {
      optimized.push(vertex);
      used.add(vertex);
    }
  }
  
  return optimized.length >= 3 ? optimized : vertices;
}

/**
 * Calculate face area for optimization decisions
 */
export function calculateFaceArea(face: Face, mesh: EditableMesh): number {
  if (face.vertices.length < 3) return 0;

  const vertices = face.vertices.map(index => mesh.vertices[index]).filter(Boolean);
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
 * Calculate face optimization ratio for statistics
 */
export function calculateFaceOptimizationRatio(
  originalFaces: Face[],
  optimizedFaces: Face[]
): number {
  if (originalFaces.length === 0) return 0;
  return (originalFaces.length - optimizedFaces.length) / originalFaces.length;
} 