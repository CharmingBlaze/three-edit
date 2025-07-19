import { Vector3 } from 'three';

/**
 * Represents a face in the mesh, defined by vertices and edges
 */
export class Face {
  /** Indices of vertices that form the face */
  vertices: number[];
  
  /** Indices of edges that form the face */
  edges: number[];
  
  /** Material index for the face */
  materialIndex: number;
  
  /** Normal vector for the face */
  normal?: Vector3;
  
  /** Custom user data for storing additional information */
  userData: Record<string, any>;
  
  /**
   * Creates a new Face
   * @param vertices Indices of vertices that form the face
   * @param edges Indices of edges that form the face
   * @param options Optional parameters
   */
  constructor(
    vertices: number[] = [],
    edges: number[] = [],
    options: {
      materialIndex?: number;
      normal?: Vector3;
      userData?: Record<string, any>;
    } = {}
  ) {
    this.vertices = vertices;
    this.edges = edges;
    this.materialIndex = options.materialIndex ?? 0;
    this.normal = options.normal;
    this.userData = options.userData || {};
  }
  
  /**
   * Creates a deep clone of the face
   * @returns A new Face instance with the same properties
   */
  clone(): Face {
    return new Face(
      [...this.vertices],
      [...this.edges],
      {
        materialIndex: this.materialIndex,
        normal: this.normal ? this.normal.clone() : undefined,
        userData: { ...this.userData },
      }
    );
  }
  
  /**
   * Checks if the face contains a specific vertex
   * @param vertexIndex The index of the vertex to check
   * @returns True if the face contains the vertex, false otherwise
   */
  hasVertex(vertexIndex: number): boolean {
    return this.vertices.includes(vertexIndex);
  }
  
  /**
   * Checks if the face contains a specific edge
   * @param edgeIndex The index of the edge to check
   * @returns True if the face contains the edge, false otherwise
   */
  hasEdge(edgeIndex: number): boolean {
    return this.edges.includes(edgeIndex);
  }
  
  /**
   * Gets the adjacent vertices to a vertex in the face
   * @param vertexIndex The index of the vertex
   * @returns An array of vertex indices adjacent to the specified vertex in this face
   */
  getAdjacentVertices(vertexIndex: number): number[] {
    const index = this.vertices.indexOf(vertexIndex);
    if (index === -1) return [];
    
    const result: number[] = [];
    const vertexCount = this.vertices.length;
    
    // Get previous vertex (wrap around if needed)
    const prevIndex = (index - 1 + vertexCount) % vertexCount;
    result.push(this.vertices[prevIndex]);
    
    // Get next vertex (wrap around if needed)
    const nextIndex = (index + 1) % vertexCount;
    result.push(this.vertices[nextIndex]);
    
    return result;
  }
  
  /**
   * Sets the normal vector for the face
   * @param x X component of the normal
   * @param y Y component of the normal
   * @param z Z component of the normal
   * @returns This face for chaining
   */
  setNormal(x: number, y: number, z: number): Face {
    if (!this.normal) {
      this.normal = new Vector3(x, y, z);
    } else {
      this.normal.set(x, y, z);
    }
    return this;
  }
}
