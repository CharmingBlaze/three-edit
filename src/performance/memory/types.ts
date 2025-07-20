/**
 * Memory optimization options
 */
export interface MemoryOptimizationOptions {
  /** Enable vertex sharing optimization */
  enableVertexSharing?: boolean;
  /** Enable face optimization */
  enableFaceOptimization?: boolean;
  /** Enable material optimization */
  enableMaterialOptimization?: boolean;
  /** Enable UV compression */
  enableUVCompression?: boolean;
  /** Tolerance for vertex merging */
  vertexTolerance?: number;
  /** Tolerance for face merging */
  faceTolerance?: number;
  /** Precision for floating point values */
  precision?: number;
  /** Maximum memory usage in bytes */
  maxMemoryUsage?: number;
}

/**
 * Memory statistics
 */
export interface MemoryStatistics {
  /** Total memory usage in bytes */
  totalMemory: number;
  /** Vertex memory usage in bytes */
  vertexMemory: number;
  /** Face memory usage in bytes */
  faceMemory: number;
  /** Edge memory usage in bytes */
  edgeMemory: number;
  /** Material memory usage in bytes */
  materialMemory: number;
  /** Optimized memory usage in bytes */
  optimizedMemory: number;
  /** Memory reduction percentage */
  reductionPercentage: number;
  /** Original memory usage in bytes */
  originalMemoryUsage?: number;
  /** Optimized memory usage in bytes (alias) */
  optimizedMemoryUsage?: number;
  /** Memory reduction percentage (alias) */
  memoryReduction?: number;
  /** Vertex sharing ratio */
  vertexSharingRatio?: number;
  /** Face optimization ratio */
  faceOptimizationRatio?: number;
  /** Compression ratio */
  compressionRatio?: number;
}

/**
 * Compressed vertex data
 */
export interface CompressedVertex {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
  /** Z coordinate */
  z: number;
  /** Normal data */
  normal: number[];
  /** UV coordinates */
  uv: number[];
  /** Vertex index */
  index: number;
}

export interface VertexOptimizationResult {
  newVertices: any[];
  vertexIndexMap: Map<any, number>;
}

export interface FaceOptimizationResult {
  optimizedFaces: any[];
  removedFaces: number;
} 