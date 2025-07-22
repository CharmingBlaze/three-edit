/**
 * @fileoverview Vertex Class
 * Represents a 3D vertex with position and optional attributes
 */

import { generateId } from '../utils/idUtils.js';

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

  /**
   * Get distance to another vertex
   * @param {Vertex} other - Other vertex
   * @returns {number} Distance
   */
  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get squared distance to another vertex (faster than distanceTo)
   * @param {Vertex} other - Other vertex
   * @returns {number} Squared distance
   */
  distanceToSquared(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Add another vertex to this one
   * @param {Vertex} other - Vertex to add
   * @returns {Vertex} This vertex (for chaining)
   */
  add(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    return this;
  }

  /**
   * Subtract another vertex from this one
   * @param {Vertex} other - Vertex to subtract
   * @returns {Vertex} This vertex (for chaining)
   */
  subtract(other) {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
    return this;
  }

  /**
   * Multiply this vertex by a scalar
   * @param {number} scalar - Scalar value
   * @returns {Vertex} This vertex (for chaining)
   */
  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
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
   * Check if this vertex has a specific attribute
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
} 