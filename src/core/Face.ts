import { Vector3 } from 'three';
import { UVCoord } from '../uv/types';
import { UserData, FaceOptions } from '../types/core';

/**
 * Represents a 2D UV coordinate
 * @deprecated Use UVCoord from '../uv/types' instead
 */
export interface UV {
  u: number;
  v: number;
}

/**
 * Face types for better categorization
 */
export enum FaceType {
  TRIANGLE = 'triangle',
  QUAD = 'quad',
  NGON = 'ngon'
}

/**
 * Represents a face in the mesh, defined by vertices and edges
 * Supports triangles (3 vertices), quads (4 vertices), and n-gons (5+ vertices)
 */
export class Face {
  /** Indices of vertices that form the face */
  vertices: number[];

  /** Indices of edges that form the face */
  edges: number[];

  /** UV coordinates for each vertex in the face */
  faceVertexUvs: UVCoord[];

  /** Material index for the face */
  materialIndex: number;

  /** Normal vector for the face */
  normal?: Vector3;

  /** Custom user data for storing additional information */
  userData: UserData;

  /**
   * Creates a new Face
   * @param vertices Indices of vertices that form the face
   * @param edges Indices of edges that form the face
   * @param options Optional parameters for face creation
   */
  constructor(
    vertices: number[] = [],
    edges: number[] = [],
    options: FaceOptions = {}
  ) {
    this.vertices = vertices;
    this.edges = edges;
    this.faceVertexUvs = options.faceVertexUvs ?? [];
    this.materialIndex = options.materialIndex ?? 0;
    this.normal = options.normal;
    this.userData = options.userData || {};
  }
  
  /**
   * Gets the type of face based on vertex count
   * @returns FaceType enum value
   */
  getFaceType(): FaceType {
    const vertexCount = this.vertices.length;
    if (vertexCount === 3) return FaceType.TRIANGLE;
    if (vertexCount === 4) return FaceType.QUAD;
    return FaceType.NGON;
  }

  /**
   * Gets the number of vertices in the face
   * @returns Number of vertices
   */
  getVertexCount(): number {
    return this.vertices.length;
  }

  /**
   * Checks if the face is a triangle
   * @returns True if the face has exactly 3 vertices
   */
  isTriangle(): boolean {
    return this.vertices.length === 3;
  }

  /**
   * Checks if the face is a quad
   * @returns True if the face has exactly 4 vertices
   */
  isQuad(): boolean {
    return this.vertices.length === 4;
  }

  /**
   * Checks if the face is an n-gon (5+ vertices)
   * @returns True if the face has 5 or more vertices
   */
  isNgon(): boolean {
    return this.vertices.length >= 5;
  }

  /**
   * Validates that the face has valid topology
   * @returns True if the face is valid
   */
  isValid(): boolean {
    // Must have at least 3 vertices
    if (this.vertices.length < 3) return false;
    
    // Vertices and edges arrays should have matching lengths
    if (this.vertices.length !== this.edges.length) return false;
    
    // No duplicate vertices
    const uniqueVertices = new Set(this.vertices);
    if (uniqueVertices.size !== this.vertices.length) return false;
    
    return true;
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
        faceVertexUvs: this.faceVertexUvs.map(uv => ({ ...uv })),
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
   * Gets the vertex at a specific position in the face
   * @param index The position in the face (0-based)
   * @returns The vertex index at the specified position, or -1 if out of bounds
   */
  getVertexAt(index: number): number {
    if (index >= 0 && index < this.vertices.length) {
      return this.vertices[index];
    }
    return -1;
  }

  /**
   * Gets the edge at a specific position in the face
   * @param index The position in the face (0-based)
   * @returns The edge index at the specified position, or -1 if out of bounds
   */
  getEdgeAt(index: number): number {
    if (index >= 0 && index < this.edges.length) {
      return this.edges[index];
    }
    return -1;
  }

  /**
   * Gets all edges in the face as vertex pairs
   * @returns Array of [vertex1, vertex2] pairs representing edges
   */
  getEdgesAsVertexPairs(): [number, number][] {
    const pairs: [number, number][] = [];
    const vertexCount = this.vertices.length;
    
    for (let i = 0; i < vertexCount; i++) {
      const v1 = this.vertices[i];
      const v2 = this.vertices[(i + 1) % vertexCount];
      pairs.push([v1, v2]);
    }
    
    return pairs;
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

  /**
   * Converts the face to a string representation for debugging
   * @returns String representation of the face
   */
  toString(): string {
    const type = this.getFaceType();
    return `Face(${type}, vertices: [${this.vertices.join(', ')}], edges: [${this.edges.join(', ')}])`;
  }
}
