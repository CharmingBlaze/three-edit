/**
 * Represents a selection of elements in a mesh
 */
export class Selection {
  /** Selected vertex indices */
  vertices: Set<number>;
  
  /** Selected edge indices */
  edges: Set<number>;
  
  /** Selected face indices */
  faces: Set<number>;
  
  /**
   * Creates a new Selection
   */
  constructor() {
    this.vertices = new Set<number>();
    this.edges = new Set<number>();
    this.faces = new Set<number>();
  }
  
  /**
   * Clears all selections
   */
  clear(): void {
    this.vertices.clear();
    this.edges.clear();
    this.faces.clear();
  }
  
  /**
   * Clears vertex selections
   */
  clearVertices(): void {
    this.vertices.clear();
  }
  
  /**
   * Clears edge selections
   */
  clearEdges(): void {
    this.edges.clear();
  }
  
  /**
   * Clears face selections
   */
  clearFaces(): void {
    this.faces.clear();
  }
  
  /**
   * Adds a vertex to the selection
   * @param index The index of the vertex to select
   * @returns This selection for chaining
   */
  addVertex(index: number): Selection {
    this.vertices.add(index);
    return this;
  }
  
  /**
   * Adds multiple vertices to the selection
   * @param indices The indices of the vertices to select
   * @returns This selection for chaining
   */
  addVertices(indices: number[]): Selection {
    indices.forEach(index => this.vertices.add(index));
    return this;
  }
  
  /**
   * Removes a vertex from the selection
   * @param index The index of the vertex to deselect
   * @returns This selection for chaining
   */
  removeVertex(index: number): Selection {
    this.vertices.delete(index);
    return this;
  }
  
  /**
   * Toggles the selection state of a vertex
   * @param index The index of the vertex to toggle
   * @returns This selection for chaining
   */
  toggleVertex(index: number): Selection {
    if (this.vertices.has(index)) {
      this.vertices.delete(index);
    } else {
      this.vertices.add(index);
    }
    return this;
  }
  
  /**
   * Adds an edge to the selection
   * @param index The index of the edge to select
   * @returns This selection for chaining
   */
  addEdge(index: number): Selection {
    this.edges.add(index);
    return this;
  }
  
  /**
   * Adds multiple edges to the selection
   * @param indices The indices of the edges to select
   * @returns This selection for chaining
   */
  addEdges(indices: number[]): Selection {
    indices.forEach(index => this.edges.add(index));
    return this;
  }
  
  /**
   * Removes an edge from the selection
   * @param index The index of the edge to deselect
   * @returns This selection for chaining
   */
  removeEdge(index: number): Selection {
    this.edges.delete(index);
    return this;
  }
  
  /**
   * Toggles the selection state of an edge
   * @param index The index of the edge to toggle
   * @returns This selection for chaining
   */
  toggleEdge(index: number): Selection {
    if (this.edges.has(index)) {
      this.edges.delete(index);
    } else {
      this.edges.add(index);
    }
    return this;
  }
  
  /**
   * Adds a face to the selection
   * @param index The index of the face to select
   * @returns This selection for chaining
   */
  addFace(index: number): Selection {
    this.faces.add(index);
    return this;
  }
  
  /**
   * Adds multiple faces to the selection
   * @param indices The indices of the faces to select
   * @returns This selection for chaining
   */
  addFaces(indices: number[]): Selection {
    indices.forEach(index => this.faces.add(index));
    return this;
  }
  
  /**
   * Removes a face from the selection
   * @param index The index of the face to deselect
   * @returns This selection for chaining
   */
  removeFace(index: number): Selection {
    this.faces.delete(index);
    return this;
  }
  
  /**
   * Toggles the selection state of a face
   * @param index The index of the face to toggle
   * @returns This selection for chaining
   */
  toggleFace(index: number): Selection {
    if (this.faces.has(index)) {
      this.faces.delete(index);
    } else {
      this.faces.add(index);
    }
    return this;
  }
  
  /**
   * Checks if a vertex is selected
   * @param index The index of the vertex to check
   * @returns True if the vertex is selected, false otherwise
   */
  hasVertex(index: number): boolean {
    return this.vertices.has(index);
  }
  
  /**
   * Checks if an edge is selected
   * @param index The index of the edge to check
   * @returns True if the edge is selected, false otherwise
   */
  hasEdge(index: number): boolean {
    return this.edges.has(index);
  }
  
  /**
   * Checks if a face is selected
   * @param index The index of the face to check
   * @returns True if the face is selected, false otherwise
   */
  hasFace(index: number): boolean {
    return this.faces.has(index);
  }
  
  /**
   * Gets the number of selected vertices
   * @returns The number of selected vertices
   */
  get vertexCount(): number {
    return this.vertices.size;
  }
  
  /**
   * Gets the number of selected edges
   * @returns The number of selected edges
   */
  get edgeCount(): number {
    return this.edges.size;
  }
  
  /**
   * Gets the number of selected faces
   * @returns The number of selected faces
   */
  get faceCount(): number {
    return this.faces.size;
  }
  
  /**
   * Checks if the selection is empty
   * @returns True if no elements are selected, false otherwise
   */
  get isEmpty(): boolean {
    return this.vertexCount === 0 && this.edgeCount === 0 && this.faceCount === 0;
  }
  
  /**
   * Creates a deep clone of the selection
   * @returns A new Selection instance with the same selected elements
   */
  clone(): Selection {
    const selection = new Selection();
    this.vertices.forEach(index => selection.vertices.add(index));
    this.edges.forEach(index => selection.edges.add(index));
    this.faces.forEach(index => selection.faces.add(index));
    return selection;
  }
}
