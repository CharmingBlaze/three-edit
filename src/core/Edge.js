/**
 * @fileoverview Edge Class
 * Represents an edge between two vertices
 */

import { generateId } from '../utils/idUtils.js';

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
   * Check if this edge contains a specific vertex
   * @param {string} vertexId - Vertex ID to check
   * @returns {boolean} True if edge contains the vertex
   */
  containsVertex(vertexId) {
    return this.vertexIds.includes(vertexId);
  }

  /**
   * Get the other vertex ID in this edge
   * @param {string} vertexId - One vertex ID
   * @returns {string|null} The other vertex ID or null if not found
   */
  getOtherVertex(vertexId) {
    if (this.vertexIds[0] === vertexId) {
      return this.vertexIds[1];
    } else if (this.vertexIds[1] === vertexId) {
      return this.vertexIds[0];
    }
    return null;
  }

  /**
   * Check if this edge connects the same vertices as another edge
   * @param {Edge} other - Other edge to compare
   * @returns {boolean} True if edges connect the same vertices
   */
  equals(other) {
    return (this.vertexIds[0] === other.vertexIds[0] && this.vertexIds[1] === other.vertexIds[1]) ||
           (this.vertexIds[0] === other.vertexIds[1] && this.vertexIds[1] === other.vertexIds[0]);
  }

  /**
   * Get the length of this edge (requires vertex positions)
   * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
   * @returns {number} Edge length
   */
  getLength(vertices) {
    const v1 = vertices.get(this.vertexIds[0]);
    const v2 = vertices.get(this.vertexIds[1]);
    
    if (!v1 || !v2) {
      return 0;
    }
    
    return v1.distanceTo(v2);
  }

  /**
   * Get the center point of this edge
   * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
   * @returns {Object|null} Center point {x, y, z} or null if vertices not found
   */
  getCenter(vertices) {
    const v1 = vertices.get(this.vertexIds[0]);
    const v2 = vertices.get(this.vertexIds[1]);
    
    if (!v1 || !v2) {
      return null;
    }
    
    return {
      x: (v1.x + v2.x) / 2,
      y: (v1.y + v2.y) / 2,
      z: (v1.z + v2.z) / 2
    };
  }

  /**
   * Get the direction vector of this edge
   * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
   * @returns {Object|null} Direction vector {x, y, z} or null if vertices not found
   */
  getDirection(vertices) {
    const v1 = vertices.get(this.vertexIds[0]);
    const v2 = vertices.get(this.vertexIds[1]);
    
    if (!v1 || !v2) {
      return null;
    }
    
    const length = this.getLength(vertices);
    if (length === 0) {
      return { x: 0, y: 0, z: 0 };
    }
    
    return {
      x: (v2.x - v1.x) / length,
      y: (v2.y - v1.y) / length,
      z: (v2.z - v1.z) / length
    };
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
   * Check if this edge has a specific attribute
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
   * Check if this edge is a boundary edge (only belongs to one face)
   * @param {Map<string, Face>} faces - Map of face ID to Face objects
   * @returns {boolean} True if edge is a boundary edge
   */
  isBoundary(faces) {
    let count = 0;
    for (const face of faces.values()) {
      if (face.containsEdge(this.vertexIds[0], this.vertexIds[1])) {
        count++;
        if (count > 1) {
          return false;
        }
      }
    }
    return count === 1;
  }

  /**
   * Get all faces that contain this edge
   * @param {Map<string, Face>} faces - Map of face ID to Face objects
   * @returns {Face[]} Array of faces containing this edge
   */
  getAdjacentFaces(faces) {
    const adjacentFaces = [];
    for (const face of faces.values()) {
      if (face.containsEdge(this.vertexIds[0], this.vertexIds[1])) {
        adjacentFaces.push(face);
      }
    }
    return adjacentFaces;
  }
} 