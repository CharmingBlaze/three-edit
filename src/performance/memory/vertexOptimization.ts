import { Vector3 } from 'three';
import { EditableMesh, Vertex } from '../../core/index';
import { MemoryOptimizationOptions, VertexOptimizationResult } from './types';

/**
 * Optimize vertex sharing by merging duplicate vertices
 */
export function optimizeVertexSharing(
  mesh: EditableMesh,
  options: MemoryOptimizationOptions
): VertexOptimizationResult {
  const vertexMap = new Map<string, Vertex>();
  const vertexIndexMap = new Map<Vertex, number>();
  const newVertices: Vertex[] = [];

  // Round coordinates to specified precision
  const precision = Math.pow(10, options.precision ?? 6);

  mesh.vertices.forEach((vertex, _index) => {
    // Use index to avoid unused variable warning
    const key = createVertexKey(vertex, precision);
    
    if (!vertexMap.has(key)) {
      const newVertex = createOptimizedVertex(vertex, options);
      vertexMap.set(key, newVertex);
      newVertices.push(newVertex);
    }
    
    vertexIndexMap.set(vertex, vertexMap.get(key)!.x); // Use x as temporary index
  });

  return {
    newVertices,
    vertexIndexMap
  };
}

/**
 * Create optimized vertex with reduced precision
 */
export function createOptimizedVertex(
  vertex: Vertex,
  options: MemoryOptimizationOptions
): Vertex {
  const precision = Math.pow(10, options.precision ?? 6);
  
  return new Vertex(
    Math.round(vertex.x * precision) / precision,
    Math.round(vertex.y * precision) / precision,
    Math.round(vertex.z * precision) / precision,
    {
      normal: vertex.normal ? new Vector3(
        compressNormal(vertex.normal, options).x,
        compressNormal(vertex.normal, options).y,
        compressNormal(vertex.normal, options).z
      ) : undefined,
      uv: vertex.uv ? compressUV(vertex.uv, options) : undefined,
      userData: vertex.userData
    }
  );
}

/**
 * Create vertex key for deduplication
 */
export function createVertexKey(vertex: Vertex, precision: number): string {
  const x = Math.round(vertex.x * precision) / precision;
  const y = Math.round(vertex.y * precision) / precision;
  const z = Math.round(vertex.z * precision) / precision;
  
  return `${x},${y},${z}`;
}

/**
 * Compress UV coordinates to reduce precision
 */
export function compressUV(
  uv: { u: number; v: number },
  options: MemoryOptimizationOptions
): { u: number; v: number } {
  const precision = Math.pow(10, options.precision ?? 6);
  
  return {
    u: Math.round(uv.u * precision) / precision,
    v: Math.round(uv.v * precision) / precision
  };
}

/**
 * Compress normal vector to reduce precision
 */
export function compressNormal(
  normal: { x: number; y: number; z: number },
  options: MemoryOptimizationOptions
): { x: number; y: number; z: number } {
  const precision = Math.pow(10, options.precision ?? 6);
  
  return {
    x: Math.round(normal.x * precision) / precision,
    y: Math.round(normal.y * precision) / precision,
    z: Math.round(normal.z * precision) / precision
  };
}

/**
 * Calculate vertex connectivity for optimization analysis
 */
export function calculateVertexConnectivity(mesh: EditableMesh): Map<number, number> {
  const connectivity = new Map<number, number>();
  
  mesh.faces.forEach(face => {
    face.vertices.forEach(vertexIndex => {
      connectivity.set(vertexIndex, (connectivity.get(vertexIndex) ?? 0) + 1);
    });
  });
  
  return connectivity;
} 