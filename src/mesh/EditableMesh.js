/**
 * @fileoverview EditableMesh Class
 * Core mesh class with vertices, edges, faces, and UVs for easy editing operations
 */

import { Vertex, Edge, Face, UV } from '../core/index.js';
import { generateId } from '../utils/idUtils.js';

/**
 * Represents a mesh with vertices, edges, faces, and UVs in a format
 * independent of Three.js for easy editing operations.
 * All properties are optional with safe defaults for maximum flexibility.
 */
export class EditableMesh {
  /**
   * @param {Object} [meshData={}] - Initial mesh data
   * @param {Array<Vertex>} [meshData.vertices] - Array of vertices
   * @param {Array<Edge>} [meshData.edges] - Array of edges
   * @param {Array<Face>} [meshData.faces] - Array of faces
   * @param {Array<UV>} [meshData.uvs] - Array of UV coordinates
   * @param {string} [meshData.id] - Unique mesh identifier
   * @param {string} [meshData.name] - Mesh name
   */
  constructor(meshData = {}) {
    this.id = meshData.id || generateId();
    this.name = meshData.name || 'EditableMesh';
    
    // Store elements in Maps for efficient lookup
    this.vertices = new Map();
    this.edges = new Map();
    this.faces = new Map();
    this.uvs = new Map();
    
    // Add initial data if provided
    if (meshData.vertices) {
      meshData.vertices.forEach(vertex => this.addVertex(vertex));
    }
    
    if (meshData.edges) {
      meshData.edges.forEach(edge => this.addEdge(edge));
    }
    
    if (meshData.faces) {
      meshData.faces.forEach(face => this.addFace(face));
    }
    
    if (meshData.uvs) {
      meshData.uvs.forEach(uv => this.addUV(uv));
    }
  }

  /**
   * Add a vertex to the mesh
   * @param {Vertex} vertex - Vertex to add
   * @returns {boolean} True if vertex was added successfully
   */
  addVertex(vertex) {
    if (!vertex || !vertex.id) {
      return false;
    }
    
    this.vertices.set(vertex.id, vertex);
    return true;
  }

  /**
   * Add an edge to the mesh
   * @param {Edge} edge - Edge to add
   * @returns {boolean} True if edge was added successfully
   */
  addEdge(edge) {
    if (!edge || !edge.id || !edge.vertexIds || edge.vertexIds.length !== 2) {
      return false;
    }
    
    // Verify that both vertices exist
    if (!this.vertices.has(edge.vertexIds[0]) || !this.vertices.has(edge.vertexIds[1])) {
      return false;
    }
    
    this.edges.set(edge.id, edge);
    return true;
  }

  /**
   * Add a face to the mesh
   * @param {Face} face - Face to add
   * @returns {boolean} True if face was added successfully
   */
  addFace(face) {
    if (!face || !face.id || !face.vertexIds || face.vertexIds.length < 3) {
      return false;
    }
    
    // Verify that all vertices exist
    for (const vertexId of face.vertexIds) {
      if (!this.vertices.has(vertexId)) {
        return false;
      }
    }
    
    this.faces.set(face.id, face);
    return true;
  }

  /**
   * Add UV coordinates to the mesh
   * @param {UV} uv - UV coordinates to add
   * @returns {boolean} True if UV was added successfully
   */
  addUV(uv) {
    if (!uv || !uv.vertexId) {
      return false;
    }
    
    // Verify that the associated vertex exists
    if (!this.vertices.has(uv.vertexId)) {
      return false;
    }
    
    this.uvs.set(uv.vertexId, uv);
    return true;
  }

  /**
   * Get a vertex by ID
   * @param {string} id - Vertex ID
   * @returns {Vertex|undefined} Vertex or undefined if not found
   */
  getVertex(id) {
    return this.vertices.get(id);
  }

  /**
   * Get an edge by ID
   * @param {string} id - Edge ID
   * @returns {Edge|undefined} Edge or undefined if not found
   */
  getEdge(id) {
    return this.edges.get(id);
  }

  /**
   * Get a face by ID
   * @param {string} id - Face ID
   * @returns {Face|undefined} Face or undefined if not found
   */
  getFace(id) {
    return this.faces.get(id);
  }

  /**
   * Get UV coordinates for a vertex
   * @param {string} vertexId - Vertex ID
   * @returns {UV|undefined} UV coordinates or undefined if not found
   */
  getUV(vertexId) {
    return this.uvs.get(vertexId);
  }

  /**
   * Remove a vertex from the mesh
   * @param {string} id - Vertex ID to remove
   * @returns {boolean} True if vertex was removed successfully
   */
  removeVertex(id) {
    if (!this.vertices.has(id)) {
      return false;
    }
    
    // Remove associated edges
    const edgesToRemove = [];
    for (const [edgeId, edge] of this.edges) {
      if (edge.containsVertex(id)) {
        edgesToRemove.push(edgeId);
      }
    }
    edgesToRemove.forEach(edgeId => this.edges.delete(edgeId));
    
    // Remove associated faces
    const facesToRemove = [];
    for (const [faceId, face] of this.faces) {
      if (face.containsVertex(id)) {
        facesToRemove.push(faceId);
      }
    }
    facesToRemove.forEach(faceId => this.faces.delete(faceId));
    
    // Remove associated UV coordinates
    this.uvs.delete(id);
    
    // Remove the vertex
    this.vertices.delete(id);
    
    return true;
  }

  /**
   * Remove an edge from the mesh
   * @param {string} id - Edge ID to remove
   * @returns {boolean} True if edge was removed successfully
   */
  removeEdge(id) {
    return this.edges.delete(id);
  }

  /**
   * Remove a face from the mesh
   * @param {string} id - Face ID to remove
   * @returns {boolean} True if face was removed successfully
   */
  removeFace(id) {
    return this.faces.delete(id);
  }

  /**
   * Get all vertices as an array
   * @returns {Array<Vertex>} Array of all vertices
   */
  getVertices() {
    return Array.from(this.vertices.values());
  }

  /**
   * Get all edges as an array
   * @returns {Array<Edge>} Array of all edges
   */
  getEdges() {
    return Array.from(this.edges.values());
  }

  /**
   * Get all faces as an array
   * @returns {Array<Face>} Array of all faces
   */
  getFaces() {
    return Array.from(this.faces.values());
  }

  /**
   * Get all UV coordinates as an array
   * @returns {Array<UV>} Array of all UV coordinates
   */
  getUVs() {
    return Array.from(this.uvs.values());
  }

  /**
   * Clone this mesh
   * @returns {EditableMesh} New mesh instance with copied data
   */
  clone() {
    const cloned = new EditableMesh({
      id: this.id,
      name: this.name
    });
    
    // Clone vertices
    for (const vertex of this.vertices.values()) {
      cloned.addVertex(vertex.clone());
    }
    
    // Clone edges
    for (const edge of this.edges.values()) {
      cloned.addEdge(edge.clone());
    }
    
    // Clone faces
    for (const face of this.faces.values()) {
      cloned.addFace(face.clone());
    }
    
    // Clone UV coordinates
    for (const uv of this.uvs.values()) {
      cloned.addUV(uv.clone());
    }
    
    return cloned;
  }

  /**
   * Calculate the bounding box of the mesh
   * @returns {Object|null} Bounding box {min: {x,y,z}, max: {x,y,z}} or null if no vertices
   */
  calculateBoundingBox() {
    if (this.vertices.size === 0) {
      return null;
    }
    
    const vertices = Array.from(this.vertices.values());
    let minX = vertices[0].x, minY = vertices[0].y, minZ = vertices[0].z;
    let maxX = vertices[0].x, maxY = vertices[0].y, maxZ = vertices[0].z;
    
    for (let i = 1; i < vertices.length; i++) {
      const vertex = vertices[i];
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      minZ = Math.min(minZ, vertex.z);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
      maxZ = Math.max(maxZ, vertex.z);
    }
    
    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ }
    };
  }

  /**
   * Get the center point of the mesh
   * @returns {Object|null} Center point {x, y, z} or null if no vertices
   */
  getCenter() {
    const bbox = this.calculateBoundingBox();
    if (!bbox) {
      return null;
    }
    
    return {
      x: (bbox.min.x + bbox.max.x) / 2,
      y: (bbox.min.y + bbox.max.y) / 2,
      z: (bbox.min.z + bbox.max.z) / 2
    };
  }

  /**
   * Calculate smooth normals for all vertices
   * @param {boolean} [recalculateFaceNormals=true] - Whether to recalculate face normals first
   */
  calculateSmoothNormals(recalculateFaceNormals = true) {
    if (recalculateFaceNormals) {
      // Recalculate face normals first
      for (const face of this.faces.values()) {
        face.calculateNormal(this.vertices);
      }
    }
    
    // Initialize vertex normal accumulators
    const normalAccumulators = new Map();
    for (const vertexId of this.vertices.keys()) {
      normalAccumulators.set(vertexId, { x: 0, y: 0, z: 0, count: 0 });
    }
    
    // Accumulate face normals for each vertex
    for (const face of this.faces.values()) {
      const faceNormal = face.normal;
      for (const vertexId of face.vertexIds) {
        const accumulator = normalAccumulators.get(vertexId);
        if (accumulator) {
          accumulator.x += faceNormal.x;
          accumulator.y += faceNormal.y;
          accumulator.z += faceNormal.z;
          accumulator.count++;
        }
      }
    }
    
    // Normalize and set vertex normals
    for (const [vertexId, accumulator] of normalAccumulators) {
      if (accumulator.count > 0) {
        const vertex = this.vertices.get(vertexId);
        if (vertex) {
          const length = Math.sqrt(
            accumulator.x * accumulator.x +
            accumulator.y * accumulator.y +
            accumulator.z * accumulator.z
          );
          
          if (length > 0) {
            vertex.normal = {
              x: accumulator.x / length,
              y: accumulator.y / length,
              z: accumulator.z / length
            };
          }
        }
      }
    }
  }

  /**
   * Validate the mesh structure
   * @returns {Object} Validation result with errors and warnings
   */
  validate() {
    const errors = [];
    const warnings = [];
    
    // Check for orphaned vertices (not used in any face)
    for (const [vertexId, vertex] of this.vertices) {
      let usedInFace = false;
      for (const face of this.faces.values()) {
        if (face.containsVertex(vertexId)) {
          usedInFace = true;
          break;
        }
      }
      
      if (!usedInFace) {
        warnings.push(`Vertex ${vertexId} is not used in any face`);
      }
    }
    
    // Check for orphaned edges (not used in any face)
    for (const [edgeId, edge] of this.edges) {
      let usedInFace = false;
      for (const face of this.faces.values()) {
        if (face.containsEdge(edge.vertexIds[0], edge.vertexIds[1])) {
          usedInFace = true;
          break;
        }
      }
      
      if (!usedInFace) {
        warnings.push(`Edge ${edgeId} is not used in any face`);
      }
    }
    
    // Check for faces with invalid vertices
    for (const [faceId, face] of this.faces) {
      for (const vertexId of face.vertexIds) {
        if (!this.vertices.has(vertexId)) {
          errors.push(`Face ${faceId} references non-existent vertex ${vertexId}`);
        }
      }
    }
    
    // Check for edges with invalid vertices
    for (const [edgeId, edge] of this.edges) {
      for (const vertexId of edge.vertexIds) {
        if (!this.vertices.has(vertexId)) {
          errors.push(`Edge ${edgeId} references non-existent vertex ${vertexId}`);
        }
      }
    }
    
    // Check for UV coordinates with invalid vertices
    for (const [vertexId, uv] of this.uvs) {
      if (!this.vertices.has(vertexId)) {
        errors.push(`UV coordinates reference non-existent vertex ${vertexId}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Fix common mesh issues
   * @returns {Object} Fix result with information about what was fixed
   */
  fixIssues() {
    const fixed = [];
    const validation = this.validate();
    
    // Remove orphaned vertices
    const orphanedVertices = [];
    for (const [vertexId, vertex] of this.vertices) {
      let usedInFace = false;
      for (const face of this.faces.values()) {
        if (face.containsVertex(vertexId)) {
          usedInFace = true;
          break;
        }
      }
      
      if (!usedInFace) {
        orphanedVertices.push(vertexId);
      }
    }
    
    orphanedVertices.forEach(vertexId => {
      this.removeVertex(vertexId);
      fixed.push(`Removed orphaned vertex ${vertexId}`);
    });
    
    // Remove orphaned edges
    const orphanedEdges = [];
    for (const [edgeId, edge] of this.edges) {
      let usedInFace = false;
      for (const face of this.faces.values()) {
        if (face.containsEdge(edge.vertexIds[0], edge.vertexIds[1])) {
          usedInFace = true;
          break;
        }
      }
      
      if (!usedInFace) {
        orphanedEdges.push(edgeId);
      }
    }
    
    orphanedEdges.forEach(edgeId => {
      this.edges.delete(edgeId);
      fixed.push(`Removed orphaned edge ${edgeId}`);
    });
    
    // Remove UV coordinates for non-existent vertices
    const orphanedUVs = [];
    for (const [vertexId, uv] of this.uvs) {
      if (!this.vertices.has(vertexId)) {
        orphanedUVs.push(vertexId);
      }
    }
    
    orphanedUVs.forEach(vertexId => {
      this.uvs.delete(vertexId);
      fixed.push(`Removed UV coordinates for non-existent vertex ${vertexId}`);
    });
    
    return {
      fixed,
      remainingErrors: validation.errors,
      remainingWarnings: validation.warnings
    };
  }
} 