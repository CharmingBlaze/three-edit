/**
 * @fileoverview Face Class
 * Represents a face defined by vertex IDs
 */

import { generateId } from '../utils/idUtils.js';

/**
 * Represents a face defined by vertex IDs
 */
export class Face {
  /**
   * @param {string[]} vertexIds - Array of vertex IDs defining the face
   * @param {string} [id] - Unique identifier (auto-generated if not provided)
   */
  constructor(vertexIds, id = null) {
    this.vertexIds = [...vertexIds]; // Create a copy to avoid external modification
    this.id = id || generateId();
    this.normal = { x: 0, y: 0, z: 1 }; // Default normal
    this.attributes = new Map();
  }

  /**
   * Clone this face
   * @returns {Face} New face instance
   */
  clone() {
    const cloned = new Face(this.vertexIds, this.id);
    cloned.normal = { ...this.normal };
    this.attributes.forEach((value, key) => {
      cloned.attributes.set(key, value);
    });
    return cloned;
  }

  /**
   * Get the number of vertices in this face
   * @returns {number} Vertex count
   */
  getVertexCount() {
    return this.vertexIds.length;
  }

  /**
   * Check if this face contains a specific vertex
   * @param {string} vertexId - Vertex ID to check
   * @returns {boolean} True if face contains the vertex
   */
  containsVertex(vertexId) {
    return this.vertexIds.includes(vertexId);
  }

  /**
   * Check if this face contains a specific edge
   * @param {string} vertexId1 - First vertex ID of the edge
   * @param {string} vertexId2 - Second vertex ID of the edge
   * @returns {boolean} True if face contains the edge
   */
  containsEdge(vertexId1, vertexId2) {
    const index1 = this.vertexIds.indexOf(vertexId1);
    const index2 = this.vertexIds.indexOf(vertexId2);
    
    if (index1 === -1 || index2 === -1) {
      return false;
    }
    
    // Check if vertices are adjacent (including wrap-around)
    const count = this.vertexIds.length;
    return (index1 + 1) % count === index2 || (index2 + 1) % count === index1;
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
   * Calculate normal from vertex positions
   * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
   * @returns {Object|null} Calculated normal {x, y, z} or null if insufficient vertices
   */
  calculateNormal(vertices) {
    if (this.vertexIds.length < 3) {
      return null;
    }

    const v1 = vertices.get(this.vertexIds[0]);
    const v2 = vertices.get(this.vertexIds[1]);
    const v3 = vertices.get(this.vertexIds[2]);

    if (!v1 || !v2 || !v3) {
      return null;
    }

    // Calculate two edge vectors
    const edge1 = {
      x: v2.x - v1.x,
      y: v2.y - v1.y,
      z: v2.z - v1.z
    };

    const edge2 = {
      x: v3.x - v1.x,
      y: v3.y - v1.y,
      z: v3.z - v1.z
    };

    // Calculate cross product
    const normal = {
      x: edge1.y * edge2.z - edge1.z * edge2.y,
      y: edge1.z * edge2.x - edge1.x * edge2.z,
      z: edge1.x * edge2.y - edge1.y * edge2.x
    };

    // Normalize
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    if (length > 0) {
      normal.x /= length;
      normal.y /= length;
      normal.z /= length;
    }

    this.normal = normal;
    return normal;
  }

  /**
   * Calculate tangents for each vertex in the face
   * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
   * @param {Map<string, UV>} uvs - Map of vertex ID to UV objects
   * @returns {Object} Map of vertex ID to tangent vectors
   */
  calculateTangents(vertices, uvs) {
    const tangents = new Map();

    if (this.vertexIds.length < 3) {
      return tangents;
    }

    // For each vertex, calculate tangent based on adjacent edges
    for (let i = 0; i < this.vertexIds.length; i++) {
      const currentId = this.vertexIds[i];
      const nextId = this.vertexIds[(i + 1) % this.vertexIds.length];
      const prevId = this.vertexIds[(i - 1 + this.vertexIds.length) % this.vertexIds.length];

      const current = vertices.get(currentId);
      const next = vertices.get(nextId);
      const prev = vertices.get(prevId);

      const currentUV = uvs.get(currentId);
      const nextUV = uvs.get(nextId);
      const prevUV = uvs.get(prevId);

      if (!current || !next || !prev || !currentUV || !nextUV || !prevUV) {
        continue;
      }

      // Calculate tangent using adjacent edges
      const edge1 = {
        x: next.x - current.x,
        y: next.y - current.y,
        z: next.z - current.z
      };

      const edge2 = {
        x: prev.x - current.x,
        y: prev.y - current.y,
        z: prev.z - current.z
      };

      const uv1 = {
        u: nextUV.u - currentUV.u,
        v: nextUV.v - currentUV.v
      };

      const uv2 = {
        u: prevUV.u - currentUV.u,
        v: prevUV.v - currentUV.v
      };

      // Calculate tangent using UV coordinates
      const denominator = uv1.u * uv2.v - uv2.u * uv1.v;
      if (Math.abs(denominator) < 1e-6) {
        // Fallback to edge direction
        tangents.set(currentId, { x: edge1.x, y: edge1.y, z: edge1.z });
        continue;
      }

      const tangent = {
        x: (edge1.x * uv2.v - edge2.x * uv1.v) / denominator,
        y: (edge1.y * uv2.v - edge2.y * uv1.v) / denominator,
        z: (edge1.z * uv2.v - edge2.z * uv1.v) / denominator
      };

      // Normalize
      const length = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y + tangent.z * tangent.z);
      if (length > 0) {
        tangent.x /= length;
        tangent.y /= length;
        tangent.z /= length;
      }

      tangents.set(currentId, tangent);
    }

    return tangents;
  }

  /**
   * Get the center point of this face
   * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
   * @returns {Object|null} Center point {x, y, z} or null if vertices not found
   */
  getCenter(vertices) {
    if (this.vertexIds.length === 0) {
      return null;
    }

    let centerX = 0, centerY = 0, centerZ = 0;
    let validVertices = 0;

    for (const vertexId of this.vertexIds) {
      const vertex = vertices.get(vertexId);
      if (vertex) {
        centerX += vertex.x;
        centerY += vertex.y;
        centerZ += vertex.z;
        validVertices++;
      }
    }

    if (validVertices === 0) {
      return null;
    }

    return {
      x: centerX / validVertices,
      y: centerY / validVertices,
      z: centerZ / validVertices
    };
  }

  /**
   * Get the area of this face
   * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
   * @returns {number} Face area
   */
  getArea(vertices) {
    if (this.vertexIds.length < 3) {
      return 0;
    }

    let area = 0;
    const center = this.getCenter(vertices);
    
    if (!center) {
      return 0;
    }

    // Calculate area using triangulation from center
    for (let i = 0; i < this.vertexIds.length; i++) {
      const currentId = this.vertexIds[i];
      const nextId = this.vertexIds[(i + 1) % this.vertexIds.length];

      const current = vertices.get(currentId);
      const next = vertices.get(nextId);

      if (current && next) {
        // Calculate triangle area using cross product
        const v1 = { x: current.x - center.x, y: current.y - center.y, z: current.z - center.z };
        const v2 = { x: next.x - center.x, y: next.y - center.y, z: next.z - center.z };

        const cross = {
          x: v1.y * v2.z - v1.z * v2.y,
          y: v1.z * v2.x - v1.x * v2.z,
          z: v1.x * v2.y - v1.y * v2.x
        };

        area += Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z) / 2;
      }
    }

    return area;
  }

  /**
   * Set a custom attribute
   * @param {string} name - Attribute name
   * @param {*} value - Attribute value
   */
  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  /**
   * Get a custom attribute
   * @param {string} name - Attribute name
   * @returns {*} Attribute value or undefined
   */
  getAttribute(name) {
    return this.attributes.get(name);
  }

  /**
   * Check if this face has a specific attribute
   * @param {string} name - Attribute name
   * @returns {boolean} True if attribute exists
   */
  hasAttribute(name) {
    return this.attributes.has(name);
  }

  /**
   * Remove a custom attribute
   * @param {string} name - Attribute name
   * @returns {boolean} True if attribute was removed
   */
  removeAttribute(name) {
    return this.attributes.delete(name);
  }

  /**
   * Get all edges in this face
   * @returns {Array<{vertexId1: string, vertexId2: string}>} Array of edge definitions
   */
  getEdges() {
    const edges = [];
    for (let i = 0; i < this.vertexIds.length; i++) {
      const currentId = this.vertexIds[i];
      const nextId = this.vertexIds[(i + 1) % this.vertexIds.length];
      edges.push({ vertexId1: currentId, vertexId2: nextId });
    }
    return edges;
  }

  /**
   * Check if this face is a triangle
   * @returns {boolean} True if face has exactly 3 vertices
   */
  isTriangle() {
    return this.vertexIds.length === 3;
  }

  /**
   * Check if this face is a quad
   * @returns {boolean} True if face has exactly 4 vertices
   */
  isQuad() {
    return this.vertexIds.length === 4;
  }

  /**
   * Triangulate this face (for non-triangle faces)
   * @returns {Face[]} Array of triangular faces
   */
  triangulate() {
    if (this.vertexIds.length <= 3) {
      return [this.clone()];
    }

    const triangles = [];
    const center = this.vertexIds[0]; // Use first vertex as center

    for (let i = 1; i < this.vertexIds.length - 1; i++) {
      const triangle = new Face([center, this.vertexIds[i], this.vertexIds[i + 1]]);
      triangles.push(triangle);
    }

    return triangles;
  }
} 