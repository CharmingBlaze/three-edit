/**
 * @fileoverview Core EditableMesh class for threejs-edit library
 * Represents a mesh with vertices, edges, faces, and UVs in a format
 * independent of Three.js for easy editing operations.
 * All properties are optional with safe defaults for maximum flexibility.
 */

import { Vertex } from './core/Vertex.js';
import { Edge } from './core/Edge.js';
import { Face } from './core/Face.js';
import { UV } from './core/UV.js';
import { generateId } from './utils/idUtils.js';

/**
 * Core EditableMesh class that represents a complete mesh
 * All properties are optional with safe defaults for maximum flexibility
 */
export class EditableMesh {
  /**
   * @param {Object} [meshData] - Optional mesh data
   * @param {string} [meshData.name='EditableMesh'] - Mesh name
   * @param {Map|Object} [meshData.vertices=new Map()] - Vertex map or object
   * @param {Map|Object} [meshData.edges=new Map()] - Edge map or object
   * @param {Map|Object} [meshData.faces=new Map()] - Face map or object
   * @param {Map|Object} [meshData.uvs=new Map()] - UV map or object
   * @param {Object} [meshData.material] - Material properties
   * @param {Map|Object} [meshData.attributes=new Map()] - Mesh-level attributes
   */
  constructor(meshData = {}) {
    const {
      name = 'EditableMesh',
      vertices = new Map(),
      edges = new Map(),
      faces = new Map(),
      uvs = new Map(),
      material = {
        name: 'Default',
        type: 'standard',
        color: { r: 0.8, g: 0.8, b: 0.8 },
        roughness: 0.5,
        metalness: 0.0,
        opacity: 1.0,
        transparent: false,
        side: 'front' // 'front', 'back', 'double'
      },
      attributes = new Map()
    } = meshData;

    this.name = name;
    
    // Convert objects to Maps if needed for maximum flexibility
    this.vertices = vertices instanceof Map ? vertices : new Map(Object.entries(vertices));
    this.edges = edges instanceof Map ? edges : new Map(Object.entries(edges));
    this.faces = faces instanceof Map ? faces : new Map(Object.entries(faces));
    this.uvs = uvs instanceof Map ? uvs : new Map(Object.entries(uvs));
    
    this.material = material;
    this.attributes = attributes instanceof Map ? attributes : new Map(Object.entries(attributes));
    
    // Initialize ID counters safely
    this.nextVertexId = this.vertices.size;
    this.nextEdgeId = this.edges.size;
    this.nextFaceId = this.faces.size;
  }

  /**
   * Add a vertex to the mesh
   * @param {Vertex} vertex - Vertex to add
   */
  addVertex(vertex) {
    if (!vertex || !vertex.id) {return;}
    this.vertices.set(vertex.id, vertex);
    this.nextVertexId = Math.max(this.nextVertexId, parseInt(vertex.id) + 1);
  }

  /**
   * Add an edge to the mesh
   * @param {Edge} edge - Edge to add
   */
  addEdge(edge) {
    if (!edge || !edge.id) {return;}
    this.edges.set(edge.id, edge);
    this.nextEdgeId = Math.max(this.nextEdgeId, parseInt(edge.id) + 1);
  }

  /**
   * Add a face to the mesh
   * @param {Face} face - Face to add
   */
  addFace(face) {
    if (!face || !face.id) {return;}
    this.faces.set(face.id, face);
    this.nextFaceId = Math.max(this.nextFaceId, parseInt(face.id) + 1);
  }

  /**
   * Add a UV coordinate to the mesh
   * @param {UV} uv - UV coordinate to add
   */
  addUV(uv) {
    if (!uv || !uv.vertexId) {return;}
    this.uvs.set(uv.vertexId, uv);
  }

  /**
   * Get a vertex by ID
   * @param {string} id - Vertex ID
   * @returns {Vertex|null} Vertex or null if not found
   */
  getVertex(id) {
    return this.vertices.get(id) || null;
  }

  /**
   * Get an edge by ID
   * @param {string} id - Edge ID
   * @returns {Edge|null} Edge or null if not found
   */
  getEdge(id) {
    return this.edges.get(id) || null;
  }

  /**
   * Get a face by ID
   * @param {string} id - Face ID
   * @returns {Face|null} Face or null if not found
   */
  getFace(id) {
    return this.faces.get(id) || null;
  }

  /**
   * Get UV coordinates for a vertex
   * @param {string} vertexId - Vertex ID
   * @returns {UV|null} UV coordinates or null if not found
   */
  getUV(vertexId) {
    return this.uvs.get(vertexId) || null;
  }

  /**
   * Remove a vertex and all associated edges and faces
   * @param {string} id - Vertex ID to remove
   */
  removeVertex(id) {
    if (!this.vertices.has(id)) {return;}
    
    // Remove all edges containing this vertex
    const edgesToRemove = [];
    for (const [edgeId, edge] of this.edges) {
      if (edge.containsVertex(id)) {
        edgesToRemove.push(edgeId);
      }
    }
    edgesToRemove.forEach(edgeId => this.edges.delete(edgeId));
    
    // Remove all faces containing this vertex
    const facesToRemove = [];
    for (const [faceId, face] of this.faces) {
      if (face.containsVertex(id)) {
        facesToRemove.push(faceId);
      }
    }
    facesToRemove.forEach(faceId => this.faces.delete(faceId));
    
    // Remove UV coordinates for this vertex
    this.uvs.delete(id);
    
    // Remove the vertex
    this.vertices.delete(id);
  }

  /**
   * Remove an edge
   * @param {string} id - Edge ID to remove
   */
  removeEdge(id) {
    this.edges.delete(id);
  }

  /**
   * Remove a face
   * @param {string} id - Face ID to remove
   */
  removeFace(id) {
    this.faces.delete(id);
  }

  /**
   * Get all vertices as an array
   * @returns {Array<Vertex>} Array of vertices
   */
  getVertices() {
    return Array.from(this.vertices.values());
  }

  /**
   * Get all edges as an array
   * @returns {Array<Edge>} Array of edges
   */
  getEdges() {
    return Array.from(this.edges.values());
  }

  /**
   * Get all faces as an array
   * @returns {Array<Face>} Array of faces
   */
  getFaces() {
    return Array.from(this.faces.values());
  }

  /**
   * Get all UV coordinates as an array
   * @returns {Array<UV>} Array of UV coordinates
   */
  getUVs() {
    return Array.from(this.uvs.values());
  }

  /**
   * Clone this mesh
   * @returns {EditableMesh} New mesh instance
   */
  clone() {
    const clonedVertices = new Map();
    const clonedEdges = new Map();
    const clonedFaces = new Map();
    const clonedUVs = new Map();
    const clonedAttributes = new Map();
    
    // Clone vertices
    for (const [id, vertex] of this.vertices) {
      clonedVertices.set(id, vertex.clone());
    }
    
    // Clone edges
    for (const [id, edge] of this.edges) {
      clonedEdges.set(id, edge.clone());
    }
    
    // Clone faces
    for (const [id, face] of this.faces) {
      clonedFaces.set(id, face.clone());
    }
    
    // Clone UVs
    for (const [id, uv] of this.uvs) {
      clonedUVs.set(id, uv.clone());
    }
    
    // Clone attributes
    for (const [key, value] of this.attributes) {
      clonedAttributes.set(key, typeof value === 'object' ? { ...value } : value);
    }
    
    return new EditableMesh({
      name: this.name,
      vertices: clonedVertices,
      edges: clonedEdges,
      faces: clonedFaces,
      uvs: clonedUVs,
      material: { ...this.material },
      attributes: clonedAttributes
    });
  }

  /**
   * Calculate bounding box of the mesh
   * @returns {Object} Bounding box with min and max points
   */
  calculateBoundingBox() {
    if (this.vertices.size === 0) {
      return {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 0, y: 0, z: 0 },
        center: { x: 0, y: 0, z: 0 },
        size: { x: 0, y: 0, z: 0 }
      };
    }
    
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (const vertex of this.vertices.values()) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      minZ = Math.min(minZ, vertex.z);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
      maxZ = Math.max(maxZ, vertex.z);
    }
    
    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: (minZ + maxZ) / 2 },
      size: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ }
    };
  }

  /**
   * Get the center point of the mesh
   * @returns {Object} Center point {x, y, z}
   */
  getCenter() {
    const bbox = this.calculateBoundingBox();
    return bbox.center;
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
    for (const [id, vertex] of this.vertices) {
      normalAccumulators.set(id, { x: 0, y: 0, z: 0, count: 0 });
    }
    
    // Accumulate face normals for each vertex
    for (const face of this.faces.values()) {
      const faceNormal = face.normal;
      for (const vertexId of face.vertexIds) {
        const acc = normalAccumulators.get(vertexId);
        if (acc) {
          acc.x += faceNormal.x;
          acc.y += faceNormal.y;
          acc.z += faceNormal.z;
          acc.count++;
        }
      }
    }
    
    // Normalize and set vertex normals
    for (const [id, acc] of normalAccumulators) {
      if (acc.count > 0) {
        const length = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        if (length > 0) {
          const vertex = this.vertices.get(id);
          if (vertex) {
            vertex.setNormal(acc.x / length, acc.y / length, acc.z / length);
          }
        }
      }
    }
  }

  /**
   * Validate the mesh for consistency
   * @returns {Object} Validation result with errors and warnings
   */
  validate() {
    const errors = [];
    const warnings = [];
    
    // Check for orphaned vertices
    const usedVertices = new Set();
    for (const edge of this.edges.values()) {
      edge.vertexIds.forEach(id => usedVertices.add(id));
    }
    for (const face of this.faces.values()) {
      face.vertexIds.forEach(id => usedVertices.add(id));
    }
    
    for (const [id, vertex] of this.vertices) {
      if (!usedVertices.has(id)) {
        warnings.push(`Orphaned vertex: ${id}`);
      }
    }
    
    // Check for invalid edges
    for (const [id, edge] of this.edges) {
      if (!this.vertices.has(edge.vertexIds[0]) || !this.vertices.has(edge.vertexIds[1])) {
        errors.push(`Invalid edge ${id}: references non-existent vertices`);
      }
    }
    
    // Check for invalid faces
    for (const [id, face] of this.faces) {
      for (const vertexId of face.vertexIds) {
        if (!this.vertices.has(vertexId)) {
          errors.push(`Invalid face ${id}: references non-existent vertex ${vertexId}`);
        }
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
    const fixes = [];
    const validation = this.validate();
    
    if (!validation.isValid) {
      // Remove invalid edges and faces
      const edgesToRemove = [];
      const facesToRemove = [];
      
      for (const [id, edge] of this.edges) {
        if (!this.vertices.has(edge.vertexIds[0]) || !this.vertices.has(edge.vertexIds[1])) {
          edgesToRemove.push(id);
        }
      }
      
      for (const [id, face] of this.faces) {
        for (const vertexId of face.vertexIds) {
          if (!this.vertices.has(vertexId)) {
            facesToRemove.push(id);
            break;
          }
        }
      }
      
      edgesToRemove.forEach(id => {
        this.edges.delete(id);
        fixes.push(`Removed invalid edge: ${id}`);
      });
      
      facesToRemove.forEach(id => {
        this.faces.delete(id);
        fixes.push(`Removed invalid face: ${id}`);
      });
    }
    
    return {
      fixed: fixes.length > 0,
      fixes,
      validation
    };
  }
}

// Re-export core classes for backward compatibility
export { Vertex } from './core/Vertex.js';
export { Edge } from './core/Edge.js';
export { Face } from './core/Face.js';
export { UV } from './core/UV.js';