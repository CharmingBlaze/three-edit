import { UserData, EdgeOptions } from '../types/core';

/**
 * Represents an edge between two vertices in the mesh
 * An edge connects exactly two vertices and can be part of multiple faces
 */
export class Edge {
  /** Index of the first vertex */
  v1: number;
  
  /** Index of the second vertex */
  v2: number;
  
  /** Custom user data for storing additional information */
  userData: UserData;
  
  /**
   * Creates a new Edge
   * @param v1 Index of the first vertex
   * @param v2 Index of the second vertex
   * @param options Optional parameters for edge creation
   */
  constructor(
    v1: number,
    v2: number,
    options: EdgeOptions = {}
  ) {
    this.v1 = v1;
    this.v2 = v2;
    this.userData = options.userData || {};
  }
  
  /**
   * Creates a deep clone of the edge
   * @returns A new Edge instance with the same properties
   */
  clone(): Edge {
    return new Edge(
      this.v1,
      this.v2,
      { userData: { ...this.userData } }
    );
  }
  
  /**
   * Checks if this edge connects the same vertices as another edge
   * @param other The other edge to compare with
   * @returns True if the edges connect the same vertices (in any order), false otherwise
   */
  equals(other: Edge): boolean {
    return (
      (this.v1 === other.v1 && this.v2 === other.v2) ||
      (this.v1 === other.v2 && this.v2 === other.v1)
    );
  }
  
  /**
   * Checks if this edge contains a specific vertex
   * @param vertexIndex The index of the vertex to check
   * @returns True if the edge contains the vertex, false otherwise
   */
  hasVertex(vertexIndex: number): boolean {
    return this.v1 === vertexIndex || this.v2 === vertexIndex;
  }
  
  /**
   * Gets the other vertex in the edge
   * @param vertexIndex The index of one vertex
   * @returns The index of the other vertex, or -1 if the provided vertex is not part of the edge
   */
  getOtherVertex(vertexIndex: number): number {
    if (this.v1 === vertexIndex) return this.v2;
    if (this.v2 === vertexIndex) return this.v1;
    return -1;
  }
}
