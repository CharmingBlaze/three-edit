import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { EditableMesh } from '../core/EditableMesh';
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
  mesh: EditableMesh,
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
 * Can be reused across frames for geometry diffing or merging operations
 */
export class EdgeKeyCache {
  private cache = new Map<string, number>();
  private mesh?: EditableMesh;
  
  /**
   * Set the mesh for edge creation
   */
  setMesh(mesh: EditableMesh): void {
    this.mesh = mesh;
  }
  
  /**
   * Generate or retrieve cached edge key
   */
  generateKey(v1: Vertex, v2: Vertex): string {
    const cacheKey = `${v1.x},${v1.y},${v1.z}-${v2.x},${v2.y},${v2.z}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!.toString();
    }
    
    const key = generateEdgeKey(v1, v2);
    return key;
  }
  
  /**
   * Get or create an edge, returning the edge ID
   */
  getOrCreate(v1: number, v2: number, uv1?: UVCoord, uv2?: UVCoord): number {
    if (!this.mesh) {
      throw new Error('Mesh not set in EdgeKeyCache');
    }
    
    const vertex1 = this.mesh.getVertex(v1);
    const vertex2 = this.mesh.getVertex(v2);
    
    if (!vertex1 || !vertex2) {
      throw new Error(`Invalid vertex IDs: ${v1}, ${v2}`);
    }
    
    const key = generateEdgeKey(vertex1, vertex2);
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    const edgeId = this.mesh.addEdge(new Edge(v1, v2));
    this.cache.set(key, edgeId);
    return edgeId;
  }
  
  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Could be enhanced with hit tracking
    };
  }
}

/**
 * Standardized edge creation helper that respects UV seams
 * 
 * @param mesh The mesh to add edges to
 * @param edgeMap The edge map for reuse tracking
 * @param id1 First vertex ID
 * @param id2 Second vertex ID
 * @param options Optional parameters
 * @returns The edge ID (either existing or newly created)
 */
export function getOrCreateEdge(
  mesh: EditableMesh,
  edgeMap: Record<string, number>,
  id1: number,
  id2: number,
  options: { mergeUVEdges?: boolean; cache?: EdgeKeyCache } = {}
): number {
  const { mergeUVEdges = false, cache } = options;
  
  let key: string;
  
  if (cache) {
    const v1 = mesh.vertices[id1];
    const v2 = mesh.vertices[id2];
    key = cache.generateKey(v1, v2);
  } else {
    key = generateEdgeKeyFromIds(mesh, id1, id2);
  }
  
  // If mergeUVEdges is true, create a simpler key that ignores UV differences
  if (mergeUVEdges) {
    const v1 = mesh.vertices[id1];
    const v2 = mesh.vertices[id2];
    const pos1 = `${v1.x.toFixed(6)},${v1.y.toFixed(6)},${v1.z.toFixed(6)}`;
    const pos2 = `${v2.x.toFixed(6)},${v2.y.toFixed(6)},${v2.z.toFixed(6)}`;
    key = pos1 < pos2 ? `${pos1}-${pos2}` : `${pos2}-${pos1}`;
  }
  
  if (!(key in edgeMap)) {
    edgeMap[key] = mesh.addEdge(new Edge(id1, id2));
  }
  
  return edgeMap[key];
}

/**
 * Create edges for a face using standardized logic
 * 
 * @param mesh The mesh to add edges to
 * @param edgeMap The edge map for reuse tracking
 * @param faceVertexIds Array of vertex IDs for the face
 * @param options Optional parameters
 * @returns Array of edge IDs
 */
export function createFaceEdges(
  mesh: EditableMesh,
  edgeMap: Record<string, number>,
  faceVertexIds: number[],
  options: { mergeUVEdges?: boolean; cache?: EdgeKeyCache } = {}
): number[] {
  const edgeIds: number[] = [];
  for (let i = 0; i < faceVertexIds.length; i++) {
    const id1 = faceVertexIds[i];
    const id2 = faceVertexIds[(i + 1) % faceVertexIds.length];
    edgeIds.push(getOrCreateEdge(mesh, edgeMap, id1, id2, options));
  }
  return edgeIds;
} 