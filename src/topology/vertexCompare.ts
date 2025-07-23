import { Vertex } from '../core/Vertex';
import { UVCoord } from '../uv/types';

/**
 * Options for vertex comparison operations
 */
export interface VertexCompareOptions {
  /** Tolerance for position comparison */
  positionTolerance?: number;
  /** Tolerance for UV comparison */
  uvTolerance?: number;
  /** Whether to ignore UV differences */
  ignoreUVs?: boolean;
  /** Whether to ignore normal differences */
  ignoreNormals?: boolean;
  /** Whether to ignore color differences */
  ignoreColors?: boolean;
}

/**
 * Default comparison options
 */
const DEFAULT_COMPARE_OPTIONS: Required<VertexCompareOptions> = {
  positionTolerance: 1e-6,
  uvTolerance: 1e-6,
  ignoreUVs: false,
  ignoreNormals: false,
  ignoreColors: false
};

/**
 * Compare two vertices for equality
 * 
 * @param v1 First vertex
 * @param v2 Second vertex
 * @param options Comparison options
 * @returns True if vertices are considered equal
 */
export function compareVertices(
  v1: Vertex,
  v2: Vertex,
  options: VertexCompareOptions = {}
): boolean {
  const opts = { ...DEFAULT_COMPARE_OPTIONS, ...options };
  
  // Compare positions
  const posDiff = Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y) + Math.abs(v1.z - v2.z);
  if (posDiff > opts.positionTolerance) {
    return false;
  }
  
  // Compare UVs (unless ignored)
  if (!opts.ignoreUVs) {
    if (!v1.uv && !v2.uv) {
      // Both have no UVs - this is equal
    } else if (!v1.uv || !v2.uv) {
      // One has UVs, the other doesn't - not equal
      return false;
    } else {
      // Both have UVs - compare them
      const uvDiff = Math.abs(v1.uv.u - v2.uv.u) + Math.abs(v1.uv.v - v2.uv.v);
      if (uvDiff > opts.uvTolerance) {
        return false;
      }
    }
  }
  
  // Compare normals (unless ignored)
  if (!opts.ignoreNormals) {
    if (!v1.normal && !v2.normal) {
      // Both have no normals - this is equal
    } else if (!v1.normal || !v2.normal) {
      // One has normal, the other doesn't - not equal
      return false;
    } else {
      // Both have normals - compare them
      const normalDiff = Math.abs(v1.normal.x - v2.normal.x) + 
                        Math.abs(v1.normal.y - v2.normal.y) + 
                        Math.abs(v1.normal.z - v2.normal.z);
      if (normalDiff > opts.positionTolerance) {
        return false;
      }
    }
  }
  
  // Compare colors (unless ignored)
  if (!opts.ignoreColors) {
    if (!v1.color && !v2.color) {
      // Both have no colors - this is equal
    } else if (!v1.color || !v2.color) {
      // One has color, the other doesn't - not equal
      return false;
    } else {
      // Both have colors - compare them
      const colorDiff = Math.abs(v1.color.x - v2.color.x) + 
                       Math.abs(v1.color.y - v2.color.y) + 
                       Math.abs(v1.color.z - v2.color.z);
      if (colorDiff > opts.positionTolerance) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Check if two vertices can share an edge (same position and UV)
 * This is a simplified version for edge sharing specifically
 * 
 * @param v1 First vertex
 * @param v2 Second vertex
 * @returns True if vertices can share an edge
 */
export function canShareEdge(v1: Vertex, v2: Vertex): boolean {
  return compareVertices(v1, v2, { ignoreNormals: true, ignoreColors: true });
}

/**
 * Check if two vertices can be welded together
 * 
 * @param v1 First vertex
 * @param v2 Second vertex
 * @param options Welding options
 * @returns True if vertices can be welded
 */
export function canWeldVertices(
  v1: Vertex,
  v2: Vertex,
  options: VertexCompareOptions & { weldUVs?: boolean; weldNormals?: boolean } = {}
): boolean {
  const weldOptions: VertexCompareOptions = {
    ...options,
    ignoreUVs: !options.weldUVs,
    ignoreNormals: !options.weldNormals
  };
  
  return compareVertices(v1, v2, weldOptions);
}

/**
 * Find duplicate vertices in a mesh
 * 
 * @param vertices Array of vertices to check
 * @param options Comparison options
 * @returns Array of duplicate vertex groups
 */
export function findDuplicateVertices(
  vertices: Vertex[],
  options: VertexCompareOptions = {}
): number[][] {
  const duplicates: number[][] = [];
  const processed = new Set<number>();
  
  for (let i = 0; i < vertices.length; i++) {
    if (processed.has(i)) continue;
    
    const group = [i];
    processed.add(i);
    
    for (let j = i + 1; j < vertices.length; j++) {
      if (processed.has(j)) continue;
      
      if (compareVertices(vertices[i], vertices[j], options)) {
        group.push(j);
        processed.add(j);
      }
    }
    
    if (group.length > 1) {
      duplicates.push(group);
    }
  }
  
  return duplicates;
}

/**
 * Create a vertex hash for efficient lookup
 * 
 * @param vertex The vertex to hash
 * @param options Hashing options
 * @returns Hash string
 */
export function hashVertex(
  vertex: Vertex,
  options: VertexCompareOptions = {}
): string {
  const opts = { ...DEFAULT_COMPARE_OPTIONS, ...options };
  
  // Position hash
  const posHash = `${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}`;
  
  // UV hash (if not ignored)
  let uvHash = '';
  if (!opts.ignoreUVs && vertex.uv) {
    uvHash = `-uv:${vertex.uv.u.toFixed(6)},${vertex.uv.v.toFixed(6)}`;
  }
  
  // Normal hash (if not ignored)
  let normalHash = '';
  if (!opts.ignoreNormals && vertex.normal) {
    normalHash = `-n:${vertex.normal.x.toFixed(6)},${vertex.normal.y.toFixed(6)},${vertex.normal.z.toFixed(6)}`;
  }
  
  // Color hash (if not ignored)
  let colorHash = '';
  if (!opts.ignoreColors && vertex.color) {
    colorHash = `-c:${vertex.color.x.toFixed(6)},${vertex.color.y.toFixed(6)},${vertex.color.z.toFixed(6)}`;
  }
  
  return `${posHash}${uvHash}${normalHash}${colorHash}`;
}

/**
 * Find duplicate vertices using hash-based approach (more efficient for large meshes)
 * 
 * @param vertices Array of vertices to check
 * @param options Comparison options
 * @returns Array of duplicate vertex groups
 */
export function findDuplicateVerticesByHash(
  vertices: Vertex[],
  options: VertexCompareOptions = {}
): number[][] {
  const hashMap = new Map<string, number[]>();
  
  for (let i = 0; i < vertices.length; i++) {
    const hash = hashVertex(vertices[i], options);
    
    if (!hashMap.has(hash)) {
      hashMap.set(hash, []);
    }
    
    hashMap.get(hash)!.push(i);
  }
  
  return Array.from(hashMap.values()).filter(group => group.length > 1);
}

/**
 * Merge two vertices, creating a new vertex with combined properties
 * 
 * @param v1 First vertex
 * @param v2 Second vertex
 * @param options Merge options
 * @returns Merged vertex
 */
export function mergeVertices(
  v1: Vertex,
  v2: Vertex,
  options: {
    mergeUVs?: 'average' | 'first' | 'second';
    mergeNormals?: 'average' | 'first' | 'second';
    mergeColors?: 'average' | 'first' | 'second';
  } = {}
): Vertex {
  const {
    mergeUVs = 'average',
    mergeNormals = 'average',
    mergeColors = 'average'
  } = options;
  
  // Position is always averaged
  const x = (v1.x + v2.x) / 2;
  const y = (v1.y + v2.y) / 2;
  const z = (v1.z + v2.z) / 2;
  
  // Merge UVs
  let uv: UVCoord | undefined;
  if (v1.uv && v2.uv) {
    switch (mergeUVs) {
      case 'average':
        uv = { u: (v1.uv.u + v2.uv.u) / 2, v: (v1.uv.v + v2.uv.v) / 2 };
        break;
      case 'first':
        uv = v1.uv;
        break;
      case 'second':
        uv = v2.uv;
        break;
    }
  } else if (v1.uv) {
    uv = v1.uv;
  } else if (v2.uv) {
    uv = v2.uv;
  }
  
  // Merge normals
  let normal: any | undefined;
  if (v1.normal && v2.normal) {
    switch (mergeNormals) {
      case 'average':
        normal = {
          x: (v1.normal.x + v2.normal.x) / 2,
          y: (v1.normal.y + v2.normal.y) / 2,
          z: (v1.normal.z + v2.normal.z) / 2
        };
        // Normalize
        const length = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
        if (length > 0) {
          normal.x /= length;
          normal.y /= length;
          normal.z /= length;
        }
        break;
      case 'first':
        normal = v1.normal;
        break;
      case 'second':
        normal = v2.normal;
        break;
    }
  } else if (v1.normal) {
    normal = v1.normal;
  } else if (v2.normal) {
    normal = v2.normal;
  }
  
  // Merge colors
  let color: any | undefined;
  if (v1.color && v2.color) {
    switch (mergeColors) {
      case 'average':
        color = {
          x: (v1.color.x + v2.color.x) / 2,
          y: (v1.color.y + v2.color.y) / 2,
          z: (v1.color.z + v2.color.z) / 2
        };
        break;
      case 'first':
        color = v1.color;
        break;
      case 'second':
        color = v2.color;
        break;
    }
  } else if (v1.color) {
    color = v1.color;
  } else if (v2.color) {
    color = v2.color;
  }
  
  return new Vertex(x, y, z, { uv, normal, color });
} 