import { Vertex } from '../core/Vertex';
import { UVCoord } from '../uv/types';

/**
 * Generate a unique edge key that considers both vertex position and UV coordinates
 * This ensures edges are only shared when vertices have identical position AND UV coordinates
 * 
 * @param v1 First vertex
 * @param v2 Second vertex
 * @returns Unique edge key string
 */
export function generateEdgeKey(v1: Vertex, v2: Vertex): string {
  // Create position-based key
  const pos1 = `${v1.x.toFixed(6)},${v1.y.toFixed(6)},${v1.z.toFixed(6)}`;
  const pos2 = `${v2.x.toFixed(6)},${v2.y.toFixed(6)},${v2.z.toFixed(6)}`;
  
  // Create UV-based key
  const uv1 = v1.uv ? `${v1.uv.u.toFixed(6)},${v1.uv.v.toFixed(6)}` : 'no-uv';
  const uv2 = v2.uv ? `${v2.uv.u.toFixed(6)},${v2.uv.v.toFixed(6)}` : 'no-uv';
  
  // Ensure consistent ordering (smaller position first)
  const [firstPos, secondPos] = pos1 < pos2 ? [pos1, pos2] : [pos2, pos1];
  const [firstUV, secondUV] = pos1 < pos2 ? [uv1, uv2] : [uv2, uv1];
  
  return `${firstPos}-${secondPos}-${firstUV}-${secondUV}`;
}

/**
 * Generate edge key from vertex IDs and mesh reference
 * 
 * @param mesh The mesh containing the vertices
 * @param id1 First vertex ID
 * @param id2 Second vertex ID
 * @returns Unique edge key string
 */
export function generateEdgeKeyFromIds(
  mesh: any, // EditableMesh type
  id1: number,
  id2: number
): string {
  const v1 = mesh.vertices[id1];
  const v2 = mesh.vertices[id2];
  
  if (!v1 || !v2) {
    throw new Error(`Invalid vertex IDs: ${id1}, ${id2}`);
  }
  
  return generateEdgeKey(v1, v2);
}

/**
 * Check if two vertices can share an edge (same position and UV)
 * 
 * @param v1 First vertex
 * @param v2 Second vertex
 * @returns True if vertices can share an edge
 */
export function canShareEdge(v1: Vertex, v2: Vertex): boolean {
  // Check if positions are identical
  const samePosition = Math.abs(v1.x - v2.x) < 1e-6 &&
                      Math.abs(v1.y - v2.y) < 1e-6 &&
                      Math.abs(v1.z - v2.z) < 1e-6;
  
  if (!samePosition) return false;
  
  // Check if UVs are identical
  if (!v1.uv && !v2.uv) return true;
  if (!v1.uv || !v2.uv) return false;
  
  return Math.abs(v1.uv.u - v2.uv.u) < 1e-6 && Math.abs(v1.uv.v - v2.uv.v) < 1e-6;
}

/**
 * Edge key cache for performance optimization
 */
export class EdgeKeyCache {
  private cache = new Map<string, string>();
  
  /**
   * Generate or retrieve cached edge key
   */
  generateKey(v1: Vertex, v2: Vertex): string {
    const cacheKey = `${v1.x},${v1.y},${v1.z}-${v2.x},${v2.y},${v2.z}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const key = generateEdgeKey(v1, v2);
    this.cache.set(cacheKey, key);
    return key;
  }
  
  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }
} 