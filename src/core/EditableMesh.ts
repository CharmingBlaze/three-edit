import { Matrix4, Vector3 } from 'three';
import { Vertex } from './Vertex.ts';
import { Edge } from './Edge.ts';
import { Face } from './Face.ts';

/**
 * @class EditableMesh
 * @description The core data structure for 3D mesh editing. It provides a topological
 * representation of a mesh, containing vertices, edges, and faces. This class serves
 * as the central hub for all mesh data and manipulation operations.
 */
export class EditableMesh {
  /** 
   * @property {string} id - A unique identifier for the mesh, automatically generated.
   */
  id: string;
  
  /** 
   * @property {string} name - A user-friendly name for the mesh.
   */
  name: string;
  
  /** 
   * @property {Vertex[]} vertices - An array containing all vertices in the mesh.
   */
  vertices: Vertex[];
  
  /** 
   * @property {Edge[]} edges - An array containing all edges in the mesh.
   */
  edges: Edge[];
  
  /** 
   * @property {Face[]} faces - An array containing all faces in the mesh.
   */
  faces: Face[];
  
  /** 
   * @property {Matrix4} matrix - The local transformation matrix of the mesh.
   * It should be applied to vertices before rendering.
   */
  matrix: Matrix4;
  
  /** 
   * @property {Record<string, any>} userData - A flexible object for storing custom data.
   */
  userData: Record<string, any> = {};
  
  /**
   * Creates a new EditableMesh instance.
   * @param {object} [options={}] - Optional parameters for initializing the mesh.
   * @param {string} [options.id] - A unique identifier. If not provided, one will be generated.
   * @param {string} [options.name='EditableMesh'] - A name for the mesh.
   * @param {Vertex[]} [options.vertices=[]] - An initial array of vertices.
   * @param {Edge[]} [options.edges=[]] - An initial array of edges.
   * @param {Face[]} [options.faces=[]] - An initial array of faces.
   * @param {Matrix4} [options.matrix] - An initial transformation matrix.
   */
  constructor(options: {
    id?: string;
    name?: string;
    vertices?: Vertex[];
    edges?: Edge[];
    faces?: Face[];
    matrix?: Matrix4;
  } = {}) {
    this.id = options.id || crypto.randomUUID();
    this.name = options.name || 'EditableMesh';
    this.vertices = options.vertices || [];
    this.edges = options.edges || [];
    this.faces = options.faces || [];
    this.matrix = options.matrix || new Matrix4();
  }
  
  /**
   * Creates a deep, independent clone of the mesh.
   * @returns {EditableMesh} A new EditableMesh instance with identical, but separate, data.
   */
  clone(): EditableMesh {
    return new EditableMesh({
      id: crypto.randomUUID(), // Clones get a new ID
      name: this.name,
      vertices: this.vertices.map(v => v.clone()),
      edges: this.edges.map(e => e.clone()),
      faces: this.faces.map(f => f.clone()),
      matrix: this.matrix.clone(),
    });
  }
  
  /**
   * Adds a vertex to the mesh.
   * @param {Vertex} vertex - The vertex to add.
   * @returns {number} The index of the newly added vertex.
   */
  addVertex(vertex: Vertex): number {
    this.vertices.push(vertex);
    return this.vertices.length - 1;
  }

  /**
   * Inserts a vertex at a specific index, updating references.
   * @param {Vertex} vertex - The vertex to insert.
   * @param {number} index - The index at which to insert the vertex.
   * @returns {boolean} True if the vertex was inserted, false otherwise.
   */
  insertVertex(vertex: Vertex, index: number): boolean {
    if (index < 0 || index > this.vertices.length) {
      return false;
    }

    // Update indices in edges and faces before inserting
    this.edges.forEach((edge: Edge) => {
      if (edge.v1 >= index) edge.v1++;
      if (edge.v2 >= index) edge.v2++;
    });

    this.faces.forEach((face: Face) => {
      face.vertices = face.vertices.map((v: number) => v >= index ? v + 1 : v);
    });

    this.vertices.splice(index, 0, vertex);

    return true;
  }
  
  /**
   * Adds an edge to the mesh.
   * @param {Edge} edge - The edge to add.
   * @returns {number} The index of the newly added edge.
   */
  addEdge(edge: Edge): number {
    this.edges.push(edge);
    return this.edges.length - 1;
  }

  /**
   * Inserts an edge at a specific index, updating references.
   * @param {Edge} edge - The edge to insert.
   * @param {number} index - The index at which to insert the edge.
   * @returns {boolean} True if the edge was inserted, false otherwise.
   */
  insertEdge(edge: Edge, index: number): boolean {
    if (index < 0 || index > this.edges.length) {
      return false;
    }

    // Update indices in faces before inserting
    this.faces.forEach((face: Face) => {
      face.edges = face.edges.map((e: number) => e >= index ? e + 1 : e);
    });

    this.edges.splice(index, 0, edge);

    return true;
  }
  
  /**
   * Adds a face to the mesh.
   * @param {Face} face - The face to add.
   * @returns {number} The index of the newly added face.
   */
  addFace(face: Face): number {
    this.faces.push(face);
    return this.faces.length - 1;
  }

  /**
   * Inserts a face at a specific index.
   * @param {Face} face - The face to insert.
   * @param {number} index - The index at which to insert the face.
   * @returns {boolean} True if the face was inserted, false otherwise.
   */
  insertFace(face: Face, index: number): boolean {
    if (index < 0 || index > this.faces.length) {
      return false;
    }

    this.faces.splice(index, 0, face);

    return true;
  }
  
  /**
   * Retrieves a vertex by its index.
   * @param {number} index - The index of the vertex.
   * @returns {Vertex | undefined} The vertex at the specified index, or undefined if not found.
   */
  getVertex(index: number): Vertex | undefined {
    return this.vertices[index];
  }
  
  /**
   * Retrieves an edge by its index.
   * @param {number} index - The index of the edge.
   * @returns {Edge | undefined} The edge at the specified index, or undefined if not found.
   */
  getEdge(index: number): Edge | undefined {
    return this.edges[index];
  }
  
  /**
   * Retrieves a face by its index.
   * @param {number} index - The index of the face.
   * @returns {Face | undefined} The face at the specified index, or undefined if not found.
   */
  getFace(index: number): Face | undefined {
    return this.faces[index];
  }
  
  /**
   * Removes a vertex and updates the indices in connected edges and faces.
   * @warning This is a potentially slow operation and may corrupt the mesh if not handled carefully.
   * It does not automatically remove dangling edges or faces.
   * @param {number} index - The index of the vertex to remove.
   * @returns {boolean} True if the vertex was removed, false otherwise.
   */
  removeVertex(index: number): boolean {
    if (index < 0 || index >= this.vertices.length) {
      return false;
    }
    
    this.vertices.splice(index, 1);
    
    // Update indices in edges and faces
    this.edges.forEach((edge: Edge) => {
      if (edge.v1 > index) edge.v1--;
      if (edge.v2 > index) edge.v2--;
    });
    
    this.faces.forEach((face: Face) => {
      face.vertices = face.vertices.map((v: number) => v > index ? v - 1 : v);
    });
    
    return true;
  }
  
  /**
   * Removes an edge and updates the indices in connected faces.
   * @warning This is a potentially slow operation. It does not remove dangling faces.
   * @param {number} index - The index of the edge to remove.
   * @returns {boolean} True if the edge was removed, false otherwise.
   */
  removeEdge(index: number): boolean {
    if (index < 0 || index >= this.edges.length) {
      return false;
    }
    
    this.edges.splice(index, 1);
    
    // Update indices in faces
    this.faces.forEach((face: Face) => {
      face.edges = face.edges.map((e: number) => e > index ? e - 1 : e);
    });
    
    return true;
  }
  
  /**
   * Removes a face from the mesh.
   * @param {number} index - The index of the face to remove.
   * @returns {boolean} True if the face was removed, false otherwise.
   */
  removeFace(index: number): boolean {
    if (index < 0 || index >= this.faces.length) {
      return false;
    }
    
    this.faces.splice(index, 1);
    return true;
  }
  
  /**
   * Applies the mesh's transformation matrix to all its vertices.
   * After application, the matrix is reset to the identity matrix.
   */
  applyMatrix(): void {
    const tempVector = new Vector3();
    
    this.vertices.forEach(vertex => {
      tempVector.set(vertex.x, vertex.y, vertex.z);
      tempVector.applyMatrix4(this.matrix);
      vertex.x = tempVector.x;
      vertex.y = tempVector.y;
      vertex.z = tempVector.z;
    });
    
    this.matrix.identity();
  }

  /**
   * Gets the number of vertices in the mesh.
   * @returns {number} The number of vertices.
   */
  getVertexCount(): number {
    return this.vertices.length;
  }

  /**
   * Gets the number of edges in the mesh.
   * @returns {number} The number of edges.
   */
  getEdgeCount(): number {
    return this.edges.length;
  }

  /**
   * Gets the number of faces in the mesh.
   * @returns {number} The number of faces.
   */
  getFaceCount(): number {
    return this.faces.length;
  }

  /**
   * Gets all faces connected to a specific vertex.
   * @param {number} vertexIndex - The index of the vertex.
   * @returns {Face[]} Array of faces that contain the vertex.
   */
  getFacesConnectedToVertex(vertexIndex: number): Face[] {
    return this.faces.filter(face => 
      face.vertices.includes(vertexIndex)
    );
  }

  /**
   * Gets all vertices connected to a specific vertex through edges.
   * @param {number} vertexIndex - The index of the vertex.
   * @returns {number[]} Array of vertex indices connected to the specified vertex.
   */
  getVerticesConnectedToVertex(vertexIndex: number): number[] {
    const connectedVertices = new Set<number>();
    
    this.edges.forEach(edge => {
      if (edge.v1 === vertexIndex) {
        connectedVertices.add(edge.v2);
      } else if (edge.v2 === vertexIndex) {
        connectedVertices.add(edge.v1);
      }
    });
    
    return Array.from(connectedVertices);
  }
}
