/**
 * @fileoverview Core EditableMesh class for threejs-edit library
 * Represents a mesh with vertices, edges, faces, and UVs in a format
 * independent of Three.js for easy editing operations.
 * All properties are optional with safe defaults for maximum flexibility.
 */

/**
 * Represents a 3D vertex with position and optional attributes
 */
export class Vertex {
  /**
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate  
   * @param {number} z - Z coordinate
   * @param {string} [id] - Unique identifier (auto-generated if not provided)
   */
  constructor(x, y, z, id = null) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.id = id || generateId();
    this.normal = { x: 0, y: 0, z: 1 }; // Default normal
    this.tangent = { x: 1, y: 0, z: 0 }; // Default tangent
    this.attributes = new Map(); // For custom attributes
  }

  /**
   * Clone this vertex
   * @returns {Vertex} New vertex instance
   */
  clone() {
    const cloned = new Vertex(this.x, this.y, this.z, this.id);
    cloned.normal = { ...this.normal };
    cloned.tangent = { ...this.tangent };
    this.attributes.forEach((value, key) => {
      cloned.attributes.set(key, value);
    });
    return cloned;
  }

  /**
   * Get position as array
   * @returns {number[]} [x, y, z]
   */
  toArray() {
    return [this.x, this.y, this.z];
  }

  /**
   * Set position from array
   * @param {number[]} array - [x, y, z]
   */
  fromArray(array) {
    this.x = array[0];
    this.y = array[1];
    this.z = array[2];
  }

  /**
   * Set normal vector
   * @param {number} x - X component
   * @param {number} y - Y component
   * @param {number} z - Z component
   */
  setNormal(x, y, z) {
    this.normal = { x, y, z };
  }

  /**
   * Set tangent vector
   * @param {number} x - X component
   * @param {number} y - Y component
   * @param {number} z - Z component
   */
  setTangent(x, y, z) {
    this.tangent = { x, y, z };
  }
}

/**
 * Represents an edge between two vertices
 */
export class Edge {
  /**
   * @param {string} vertexId1 - First vertex ID
   * @param {string} vertexId2 - Second vertex ID
   * @param {string} [id] - Unique identifier (auto-generated if not provided)
   */
  constructor(vertexId1, vertexId2, id = null) {
    this.vertexIds = [vertexId1, vertexId2];
    this.id = id || generateId();
    this.attributes = new Map();
  }

  /**
   * Clone this edge
   * @returns {Edge} New edge instance
   */
  clone() {
    const cloned = new Edge(this.vertexIds[0], this.vertexIds[1], this.id);
    this.attributes.forEach((value, key) => {
      cloned.attributes.set(key, value);
    });
    return cloned;
  }

  /**
   * Check if edge contains a vertex
   * @param {string} vertexId - Vertex ID to check
   * @returns {boolean} True if edge contains vertex
   */
  containsVertex(vertexId) {
    return this.vertexIds.includes(vertexId);
  }
}

/**
 * Represents a face with vertices and optional attributes
 */
export class Face {
  /**
   * @param {string[]} vertexIds - Array of vertex IDs
   * @param {string} [id] - Unique identifier (auto-generated if not provided)
   */
  constructor(vertexIds, id = null) {
    this.vertexIds = [...vertexIds];
    this.id = id || generateId();
    this.normal = { x: 0, y: 0, z: 1 }; // Default normal
    this.attributes = new Map();
  }

  /**
   * Clone this face
   * @returns {Face} New face instance
   */
  clone() {
    const cloned = new Face([...this.vertexIds], this.id);
    cloned.normal = { ...this.normal };
    this.attributes.forEach((value, key) => {
      cloned.attributes.set(key, value);
    });
    return cloned;
  }

  /**
   * Get number of vertices in face
   * @returns {number} Vertex count
   */
  getVertexCount() {
    return this.vertexIds.length;
  }

  /**
   * Check if face contains a vertex
   * @param {string} vertexId - Vertex ID to check
   * @returns {boolean} True if face contains vertex
   */
  containsVertex(vertexId) {
    return this.vertexIds.includes(vertexId);
  }

  /**
   * Set face normal
   * @param {number} x - X component
   * @param {number} y - Y component
   * @param {number} z - Z component
   */
  setNormal(x, y, z) {
    this.normal = { x, y, z };
  }

  /**
   * Calculate face normal from vertices
   * @param {Map} vertices - Map of vertex ID to Vertex objects
   */
  calculateNormal(vertices) {
    if (this.vertexIds.length < 3) {return;}

    const v0 = vertices.get(this.vertexIds[0]);
    const v1 = vertices.get(this.vertexIds[1]);
    const v2 = vertices.get(this.vertexIds[2]);

    if (!v0 || !v1 || !v2) {return;}

    // Calculate two edge vectors
    const edge1 = {
      x: v1.x - v0.x,
      y: v1.y - v0.y,
      z: v1.z - v0.z
    };

    const edge2 = {
      x: v2.x - v0.x,
      y: v2.y - v0.y,
      z: v2.z - v0.z
    };

    // Calculate cross product for normal
    const normal = {
      x: edge1.y * edge2.z - edge1.z * edge2.y,
      y: edge1.z * edge2.x - edge1.x * edge2.z,
      z: edge1.x * edge2.y - edge1.y * edge2.x
    };

    // Normalize
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    if (length > 0) {
      this.normal = {
        x: normal.x / length,
        y: normal.y / length,
        z: normal.z / length
      };
    }
  }

  /**
   * Calculate tangent and bitangent for normal mapping
   * @param {Map} vertices - Map of vertex ID to Vertex objects
   * @param {Map} uvs - Map of vertex ID to UV objects
   */
  calculateTangents(vertices, uvs) {
    if (this.vertexIds.length < 3) {return;}

    const v0 = vertices.get(this.vertexIds[0]);
    const v1 = vertices.get(this.vertexIds[1]);
    const v2 = vertices.get(this.vertexIds[2]);

    const uv0 = uvs.get(this.vertexIds[0]);
    const uv1 = uvs.get(this.vertexIds[1]);
    const uv2 = uvs.get(this.vertexIds[2]);

    if (!v0 || !v1 || !v2 || !uv0 || !uv1 || !uv2) {return;}

    // Calculate edge vectors
    const edge1 = {
      x: v1.x - v0.x,
      y: v1.y - v0.y,
      z: v1.z - v0.z
    };

    const edge2 = {
      x: v2.x - v0.x,
      y: v2.y - v0.y,
      z: v2.z - v0.z
    };

    // Calculate UV edge vectors
    const deltaUV1 = {
      u: uv1.u - uv0.u,
      v: uv1.v - uv0.v
    };

    const deltaUV2 = {
      u: uv2.u - uv0.u,
      v: uv2.v - uv0.v
    };

    // Calculate tangent and bitangent
    const f = 1.0 / (deltaUV1.u * deltaUV2.v - deltaUV2.u * deltaUV1.v);

    const tangent = {
      x: f * (deltaUV2.v * edge1.x - deltaUV1.v * edge2.x),
      y: f * (deltaUV2.v * edge1.y - deltaUV1.v * edge2.y),
      z: f * (deltaUV2.v * edge1.z - deltaUV1.v * edge2.z)
    };

    const bitangent = {
      x: f * (-deltaUV2.u * edge1.x + deltaUV1.u * edge2.x),
      y: f * (-deltaUV2.u * edge1.y + deltaUV1.u * edge2.y),
      z: f * (-deltaUV2.u * edge1.z + deltaUV1.u * edge2.z)
    };

    // Normalize
    const tangentLength = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y + tangent.z * tangent.z);
    const bitangentLength = Math.sqrt(bitangent.x * bitangent.x + bitangent.y * bitangent.y + bitangent.z * bitangent.z);

    if (tangentLength > 0) {
      this.tangent = {
        x: tangent.x / tangentLength,
        y: tangent.y / tangentLength,
        z: tangent.z / tangentLength
      };
    }

    if (bitangentLength > 0) {
      this.bitangent = {
        x: bitangent.x / bitangentLength,
        y: bitangent.y / bitangentLength,
        z: bitangent.z / bitangentLength
      };
    }
  }
}

/**
 * Represents UV coordinates for a vertex
 */
export class UV {
  /**
   * @param {number} u - U coordinate
   * @param {number} v - V coordinate
   * @param {string} vertexId - Associated vertex ID
   */
  constructor(u, v, vertexId) {
    this.u = u;
    this.v = v;
    this.vertexId = vertexId;
  }

  /**
   * Clone this UV
   * @returns {UV} New UV instance
   */
  clone() {
    return new UV(this.u, this.v, this.vertexId);
  }
}

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
   * Add UV coordinates to the mesh
   * @param {UV} uv - UV coordinates to add
   */
  addUV(uv) {
    if (!uv || !uv.vertexId) {return;}
    this.uvs.set(uv.vertexId, uv);
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
   * Remove a vertex and all associated data
   * @param {string} id - Vertex ID to remove
   */
  removeVertex(id) {
    if (!this.vertices.has(id)) {return;}

    // Remove vertex
    this.vertices.delete(id);

    // Remove associated UVs
    this.uvs.delete(id);

    // Remove edges that reference this vertex
    for (const [edgeId, edge] of this.edges) {
      if (edge.vertexIds.includes(id)) {
        this.edges.delete(edgeId);
      }
    }

    // Remove faces that reference this vertex
    for (const [faceId, face] of this.faces) {
      if (face.vertexIds.includes(id)) {
        this.faces.delete(faceId);
      }
    }
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
   * Get all vertices as array
   * @returns {Vertex[]} Array of vertices
   */
  getVertices() {
    return Array.from(this.vertices.values());
  }

  /**
   * Get all edges as array
   * @returns {Edge[]} Array of edges
   */
  getEdges() {
    return Array.from(this.edges.values());
  }

  /**
   * Get all faces as array
   * @returns {Face[]} Array of faces
   */
  getFaces() {
    return Array.from(this.faces.values());
  }

  /**
   * Get all UVs as array
   * @returns {UV[]} Array of UV coordinates
   */
  getUVs() {
    return Array.from(this.uvs.values());
  }

  /**
   * Clone the entire mesh
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
      clonedAttributes.set(key, value);
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
   * Calculate and cache bounding box
   * @returns {Object} Bounding box {min: {x,y,z}, max: {x,y,z}, center: {x,y,z}, size: {x,y,z}}
   */
  calculateBoundingBox() {
    if (this.vertices.size === 0) {
      this.boundingBox = { 
        min: { x: 0, y: 0, z: 0 }, 
        max: { x: 0, y: 0, z: 0 }, 
        center: { x: 0, y: 0, z: 0 }, 
        size: { x: 0, y: 0, z: 0 } 
      };
      return this.boundingBox;
    }

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const [vertexId, vertex] of this.vertices) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      minZ = Math.min(minZ, vertex.z);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
      maxZ = Math.max(maxZ, vertex.z);
    }

    this.boundingBox = {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
      center: {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        z: (minZ + maxZ) / 2
      },
      size: {
        x: maxX - minX,
        y: maxY - minY,
        z: maxZ - minZ
      }
    };

    return this.boundingBox;
  }

  /**
   * Get mesh center point
   * @returns {Object} Center point {x, y, z}
   */
  getCenter() {
    const bounds = this.calculateBoundingBox();
    return bounds.center;
  }

  /**
   * Calculate smooth vertex normals by averaging face normals
   * @param {boolean} recalculateFaceNormals - Whether to recalculate face normals first
   */
  calculateSmoothNormals(recalculateFaceNormals = true) {
    // First calculate all face normals
    if (recalculateFaceNormals) {
      for (const [faceId, face] of this.faces) {
        face.calculateNormal(this.vertices);
      }
    }

    // Initialize vertex normal accumulators
    const vertexNormals = new Map();
    const vertexCounts = new Map();

    // Initialize all vertices
    for (const [vertexId, vertex] of this.vertices) {
      vertexNormals.set(vertexId, { x: 0, y: 0, z: 0 });
      vertexCounts.set(vertexId, 0);
    }

    // Accumulate face normals for each vertex
    for (const [faceId, face] of this.faces) {
      for (const vertexId of face.vertexIds) {
        const normal = vertexNormals.get(vertexId);
        const count = vertexCounts.get(vertexId);
        
        normal.x += face.normal.x;
        normal.y += face.normal.y;
        normal.z += face.normal.z;
        
        vertexCounts.set(vertexId, count + 1);
      }
    }

    // Average and normalize vertex normals
    for (const [vertexId, vertex] of this.vertices) {
      const normal = vertexNormals.get(vertexId);
      const count = vertexCounts.get(vertexId);
      
      if (count > 0) {
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        if (length > 0) {
          vertex.setNormal(normal.x / length, normal.y / length, normal.z / length);
        }
      }
    }
  }

  /**
   * Validate mesh integrity
   * @returns {Object} Validation results
   */
  validate() {
    const results = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check for orphaned vertices
    const usedVertices = new Set();
    for (const [faceId, face] of this.faces) {
      for (const vertexId of face.vertexIds) {
        usedVertices.add(vertexId);
      }
    }

    for (const [vertexId, vertex] of this.vertices) {
      if (!usedVertices.has(vertexId)) {
        results.warnings.push(`Orphaned vertex: ${vertexId}`);
      }
    }

    // Check for degenerate faces
    for (const [faceId, face] of this.faces) {
      if (face.vertexIds.length < 3) {
        results.errors.push(`Degenerate face: ${faceId} has ${face.vertexIds.length} vertices`);
        results.isValid = false;
      }

      // Check for duplicate vertices in face
      const uniqueVertices = new Set(face.vertexIds);
      if (uniqueVertices.size !== face.vertexIds.length) {
        results.errors.push(`Face ${faceId} has duplicate vertices`);
        results.isValid = false;
      }
    }

    // Check for missing vertices referenced by faces
    for (const [faceId, face] of this.faces) {
      for (const vertexId of face.vertexIds) {
        if (!this.vertices.has(vertexId)) {
          results.errors.push(`Face ${faceId} references missing vertex: ${vertexId}`);
          results.isValid = false;
        }
      }
    }

    return results;
  }

  /**
   * Fix common mesh issues
   * @returns {Object} Fix results
   */
  fixIssues() {
    const results = {
      fixed: [],
      errors: []
    };

    // Remove orphaned vertices
    const usedVertices = new Set();
    for (const [faceId, face] of this.faces) {
      for (const vertexId of face.vertexIds) {
        usedVertices.add(vertexId);
      }
    }

    const orphanedVertices = [];
    for (const [vertexId, vertex] of this.vertices) {
      if (!usedVertices.has(vertexId)) {
        orphanedVertices.push(vertexId);
      }
    }

    for (const vertexId of orphanedVertices) {
      this.removeVertex(vertexId);
      results.fixed.push(`Removed orphaned vertex: ${vertexId}`);
    }

    // Remove degenerate faces
    const degenerateFaces = [];
    for (const [faceId, face] of this.faces) {
      if (face.vertexIds.length < 3) {
        degenerateFaces.push(faceId);
      }
    }

    for (const faceId of degenerateFaces) {
      this.removeFace(faceId);
      results.fixed.push(`Removed degenerate face: ${faceId}`);
    }

    // Recalculate normals
    this.calculateSmoothNormals(true);
    results.fixed.push('Recalculated normals');

    return results;
  }
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return Math.random().toString(36).substr(2, 9);
} 