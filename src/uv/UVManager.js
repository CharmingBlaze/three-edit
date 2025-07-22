/**
 * @fileoverview UV Manager for 3D Editor
 * Manages UV coordinates, texture mapping, and advanced UV operations
 */

import { EditableMesh } from '../EditableMesh.js';

/**
 * UV coordinate class
 */
export class UV {
  /**
   * Create a UV coordinate
   * @param {number} u - U coordinate (0-1)
   * @param {number} v - V coordinate (0-1)
   * @param {string} vertexId - Associated vertex ID
   * @param {Object} options - Additional options
   * @param {string} options.id - Custom ID
   * @param {Object} options.attributes - Custom attributes
   */
  constructor(u, v, vertexId, options = {}) {
    const {
      id = this.generateId(),
      attributes = {}
    } = options;

    this.u = u;
    this.v = v;
    this.vertexId = vertexId;
    this.id = id;
    this.attributes = new Map(Object.entries(attributes));
  }

  /**
   * Generate unique UV ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `uv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clone the UV coordinate
   * @returns {UV} Cloned UV
   */
  clone() {
    return new UV(this.u, this.v, this.vertexId, {
      id: this.id,
      attributes: Object.fromEntries(this.attributes)
    });
  }

  /**
   * Set UV coordinates
   * @param {number} u - U coordinate
   * @param {number} v - V coordinate
   */
  set(u, v) {
    this.u = u;
    this.v = v;
  }

  /**
   * Get UV coordinates as array
   * @returns {number[]} [u, v] coordinates
   */
  toArray() {
    return [this.u, this.v];
  }

  /**
   * Get UV coordinates as object
   * @returns {Object} {u, v} coordinates
   */
  toObject() {
    return { u: this.u, v: this.v };
  }

  /**
   * Add custom attribute
   * @param {string} name - Attribute name
   * @param {*} value - Attribute value
   */
  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  /**
   * Get custom attribute
   * @param {string} name - Attribute name
   * @returns {*} Attribute value
   */
  getAttribute(name) {
    return this.attributes.get(name);
  }

  /**
   * Remove custom attribute
   * @param {string} name - Attribute name
   * @returns {boolean} Success status
   */
  removeAttribute(name) {
    return this.attributes.delete(name);
  }

  /**
   * Validate UV coordinates
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (this.u < 0 || this.u > 1) {
      errors.push('U coordinate must be between 0 and 1');
    }

    if (this.v < 0 || this.v > 1) {
      errors.push('V coordinate must be between 0 and 1');
    }

    if (!this.vertexId) {
      errors.push('UV must have an associated vertex ID');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * UV Manager for managing UV coordinates and operations
 */
export class UVManager {
  /**
   * Create a UV manager
   * @param {Object} options - Configuration options
   * @param {boolean} options.autoGenerate - Auto-generate UVs for new meshes
   * @param {string} options.defaultMapping - Default UV mapping type
   */
  constructor(options = {}) {
    const {
      autoGenerate = true,
      defaultMapping = 'planar'
    } = options;

    this.autoGenerate = autoGenerate;
    this.defaultMapping = defaultMapping;
    this.listeners = new Set();
  }

  /**
   * Generate UVs for a mesh
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} options - Generation options
   * @param {string} options.mapping - Mapping type ('planar', 'spherical', 'cylindrical', 'box')
   * @param {Object} options.parameters - Mapping parameters
   * @returns {boolean} Success status
   */
  generateUVs(mesh, options = {}) {
    const {
      mapping = this.defaultMapping,
      parameters = {}
    } = options;

    try {
      switch (mapping) {
        case 'planar':
          return this.generatePlanarUVs(mesh, parameters);
        case 'spherical':
          return this.generateSphericalUVs(mesh, parameters);
        case 'cylindrical':
          return this.generateCylindricalUVs(mesh, parameters);
        case 'box':
          return this.generateBoxUVs(mesh, parameters);
        case 'triplanar':
          return this.generateTriplanarUVs(mesh, parameters);
        default:
          console.warn(`Unknown UV mapping type: ${mapping}`);
          return false;
      }
    } catch (error) {
      console.error('UV generation failed:', error);
      return false;
    }
  }

  /**
   * Generate planar UV mapping
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} parameters - Mapping parameters
   * @param {string} parameters.axis - Projection axis ('x', 'y', 'z')
   * @param {Object} parameters.offset - UV offset
   * @param {Object} parameters.scale - UV scale
   * @returns {boolean} Success status
   */
  generatePlanarUVs(mesh, parameters = {}) {
    const {
      axis = 'z',
      offset = { x: 0, y: 0 },
      scale = { x: 1, y: 1 }
    } = parameters;

    const vertices = Array.from(mesh.vertices.values());
    const bounds = this.calculateBounds(vertices);

    vertices.forEach(vertex => {
      let u, v;

      switch (axis) {
        case 'x':
          u = (vertex.z - bounds.min.z) / (bounds.max.z - bounds.min.z);
          v = (vertex.y - bounds.min.y) / (bounds.max.y - bounds.min.y);
          break;
        case 'y':
          u = (vertex.x - bounds.min.x) / (bounds.max.x - bounds.min.x);
          v = (vertex.z - bounds.min.z) / (bounds.max.z - bounds.min.z);
          break;
        case 'z':
        default:
          u = (vertex.x - bounds.min.x) / (bounds.max.x - bounds.min.x);
          v = (vertex.y - bounds.min.y) / (bounds.max.y - bounds.min.y);
          break;
      }

      // Apply scale and offset
      u = (u * scale.x) + offset.x;
      v = (v * scale.y) + offset.y;

      // Clamp to 0-1 range
      u = Math.max(0, Math.min(1, u));
      v = Math.max(0, Math.min(1, v));

      const uv = new UV(u, v, vertex.id);
      mesh.addUV(uv);
    });

    return true;
  }

  /**
   * Generate spherical UV mapping
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} parameters - Mapping parameters
   * @param {Object} parameters.center - Sphere center
   * @param {number} parameters.radius - Sphere radius
   * @returns {boolean} Success status
   */
  generateSphericalUVs(mesh, parameters = {}) {
    const {
      center = { x: 0, y: 0, z: 0 },
      radius = 1
    } = parameters;

    const vertices = Array.from(mesh.vertices.values());

    vertices.forEach(vertex => {
      // Calculate spherical coordinates
      const dx = vertex.x - center.x;
      const dy = vertex.y - center.y;
      const dz = vertex.z - center.z;

      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const phi = Math.acos(dz / distance);
      const theta = Math.atan2(dy, dx);

      // Convert to UV coordinates
      const u = (theta + Math.PI) / (2 * Math.PI);
      const v = phi / Math.PI;

      const uv = new UV(u, v, vertex.id);
      mesh.addUV(uv);
    });

    return true;
  }

  /**
   * Generate cylindrical UV mapping
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} parameters - Mapping parameters
   * @param {Object} parameters.center - Cylinder center
   * @param {string} parameters.axis - Cylinder axis ('x', 'y', 'z')
   * @returns {boolean} Success status
   */
  generateCylindricalUVs(mesh, parameters = {}) {
    const {
      center = { x: 0, y: 0, z: 0 },
      axis = 'y'
    } = parameters;

    const vertices = Array.from(mesh.vertices.values());
    const bounds = this.calculateBounds(vertices);

    vertices.forEach(vertex => {
      let u, v;

      switch (axis) {
        case 'x':
          u = (vertex.z - center.z) / (bounds.max.z - bounds.min.z);
          v = (vertex.x - bounds.min.x) / (bounds.max.x - bounds.min.x);
          break;
        case 'y':
        default:
          u = (vertex.x - center.x) / (bounds.max.x - bounds.min.x);
          v = (vertex.y - bounds.min.y) / (bounds.max.y - bounds.min.y);
          break;
        case 'z':
          u = (vertex.x - center.x) / (bounds.max.x - bounds.min.x);
          v = (vertex.z - bounds.min.z) / (bounds.max.z - bounds.min.z);
          break;
      }

      // Convert to cylindrical coordinates
      u = (Math.atan2(u, v) + Math.PI) / (2 * Math.PI);
      v = Math.sqrt(u * u + v * v);

      const uv = new UV(u, v, vertex.id);
      mesh.addUV(uv);
    });

    return true;
  }

  /**
   * Generate box UV mapping
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} parameters - Mapping parameters
   * @returns {boolean} Success status
   */
  generateBoxUVs(mesh, parameters = {}) {
    const vertices = Array.from(mesh.vertices.values());
    const bounds = this.calculateBounds(vertices);

    vertices.forEach(vertex => {
      // Determine which face the vertex belongs to
      const face = this.getDominantFace(vertex, bounds);
      let u, v;

      switch (face) {
        case 'front':
          u = (vertex.x - bounds.min.x) / (bounds.max.x - bounds.min.x);
          v = (vertex.y - bounds.min.y) / (bounds.max.y - bounds.min.y);
          break;
        case 'back':
          u = (vertex.x - bounds.min.x) / (bounds.max.x - bounds.min.x);
          v = (vertex.y - bounds.min.y) / (bounds.max.y - bounds.min.y);
          break;
        case 'left':
          u = (vertex.z - bounds.min.z) / (bounds.max.z - bounds.min.z);
          v = (vertex.y - bounds.min.y) / (bounds.max.y - bounds.min.y);
          break;
        case 'right':
          u = (vertex.z - bounds.min.z) / (bounds.max.z - bounds.min.z);
          v = (vertex.y - bounds.min.y) / (bounds.max.y - bounds.min.y);
          break;
        case 'top':
          u = (vertex.x - bounds.min.x) / (bounds.max.x - bounds.min.x);
          v = (vertex.z - bounds.min.z) / (bounds.max.z - bounds.min.z);
          break;
        case 'bottom':
          u = (vertex.x - bounds.min.x) / (bounds.max.x - bounds.min.x);
          v = (vertex.z - bounds.min.z) / (bounds.max.z - bounds.min.z);
          break;
        default:
          u = 0.5;
          v = 0.5;
      }

      const uv = new UV(u, v, vertex.id);
      mesh.addUV(uv);
    });

    return true;
  }

  /**
   * Generate triplanar UV mapping
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} parameters - Mapping parameters
   * @returns {boolean} Success status
   */
  generateTriplanarUVs(mesh, parameters = {}) {
    // Triplanar mapping is more complex and typically used in shaders
    // For now, we'll use a simplified approach
    return this.generatePlanarUVs(mesh, { ...parameters, axis: 'z' });
  }

  /**
   * Calculate bounds for vertices
   * @param {Array} vertices - Array of vertices
   * @returns {Object} Bounds object
   */
  calculateBounds(vertices) {
    if (vertices.length === 0) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }

    const bounds = {
      min: { x: Infinity, y: Infinity, z: Infinity },
      max: { x: -Infinity, y: -Infinity, z: -Infinity }
    };

    vertices.forEach(vertex => {
      bounds.min.x = Math.min(bounds.min.x, vertex.x);
      bounds.min.y = Math.min(bounds.min.y, vertex.y);
      bounds.min.z = Math.min(bounds.min.z, vertex.z);
      bounds.max.x = Math.max(bounds.max.x, vertex.x);
      bounds.max.y = Math.max(bounds.max.y, vertex.y);
      bounds.max.z = Math.max(bounds.max.z, vertex.z);
    });

    return bounds;
  }

  /**
   * Get dominant face for a vertex
   * @param {Object} vertex - Vertex object
   * @param {Object} bounds - Bounds object
   * @returns {string} Face name
   */
  getDominantFace(vertex, bounds) {
    const center = {
      x: (bounds.min.x + bounds.max.x) / 2,
      y: (bounds.min.y + bounds.max.y) / 2,
      z: (bounds.min.z + bounds.max.z) / 2
    };

    const dx = Math.abs(vertex.x - center.x);
    const dy = Math.abs(vertex.y - center.y);
    const dz = Math.abs(vertex.z - center.z);

    if (dx > dy && dx > dz) {
      return vertex.x > center.x ? 'right' : 'left';
    } else if (dy > dz) {
      return vertex.y > center.y ? 'top' : 'bottom';
    } else {
      return vertex.z > center.z ? 'front' : 'back';
    }
  }

  /**
   * Transform UV coordinates
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} transform - Transform parameters
   * @param {Object} transform.translate - Translation {u, v}
   * @param {Object} transform.scale - Scale {u, v}
   * @param {number} transform.rotate - Rotation in radians
   * @returns {boolean} Success status
   */
  transformUVs(mesh, transform = {}) {
    const {
      translate = { u: 0, v: 0 },
      scale = { u: 1, v: 1 },
      rotate = 0
    } = transform;

    const uvs = Array.from(mesh.uvs.values());

    uvs.forEach(uv => {
      // Apply translation
      let u = uv.u + translate.u;
      let v = uv.v + translate.v;

      // Apply scale
      u *= scale.u;
      v *= scale.v;

      // Apply rotation
      if (rotate !== 0) {
        const cos = Math.cos(rotate);
        const sin = Math.sin(rotate);
        const centerU = 0.5;
        const centerV = 0.5;
        
        const du = u - centerU;
        const dv = v - centerV;
        
        u = centerU + du * cos - dv * sin;
        v = centerV + du * sin + dv * cos;
      }

      // Clamp to 0-1 range
      u = Math.max(0, Math.min(1, u));
      v = Math.max(0, Math.min(1, v));

      uv.set(u, v);
    });

    return true;
  }

  /**
   * Pack UV coordinates
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} options - Packing options
   * @returns {boolean} Success status
   */
  packUVs(mesh, options = {}) {
    // Simple UV packing - in a real implementation, you'd use more sophisticated algorithms
    const uvs = Array.from(mesh.uvs.values());
    const bounds = this.calculateUVBounds(uvs);

    const scale = {
      u: 1 / (bounds.max.u - bounds.min.u),
      v: 1 / (bounds.max.v - bounds.min.v)
    };

    uvs.forEach(uv => {
      const u = (uv.u - bounds.min.u) * scale.u;
      const v = (uv.v - bounds.min.v) * scale.v;
      uv.set(u, v);
    });

    return true;
  }

  /**
   * Calculate UV bounds
   * @param {Array} uvs - Array of UV coordinates
   * @returns {Object} UV bounds
   */
  calculateUVBounds(uvs) {
    if (uvs.length === 0) {
      return { min: { u: 0, v: 0 }, max: { u: 1, v: 1 } };
    }

    const bounds = {
      min: { u: Infinity, v: Infinity },
      max: { u: -Infinity, v: -Infinity }
    };

    uvs.forEach(uv => {
      bounds.min.u = Math.min(bounds.min.u, uv.u);
      bounds.min.v = Math.min(bounds.min.v, uv.v);
      bounds.max.u = Math.max(bounds.max.u, uv.u);
      bounds.max.v = Math.max(bounds.max.v, uv.v);
    });

    return bounds;
  }

  /**
   * Validate UV coordinates for a mesh
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Object} Validation result
   */
  validateUVs(mesh) {
    const errors = [];
    const warnings = [];

    const uvs = Array.from(mesh.uvs.values());

    uvs.forEach(uv => {
      const validation = uv.validate();
      if (!validation.isValid) {
        errors.push(`UV ${uv.id}: ${validation.errors.join(', ')}`);
      }

      // Check for overlapping UVs
      uvs.forEach(otherUV => {
        if (uv !== otherUV && uv.u === otherUV.u && uv.v === otherUV.v) {
          warnings.push(`Overlapping UVs: ${uv.id} and ${otherUV.id}`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    this.listeners.add({ event, callback });
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    for (const listener of this.listeners) {
      if (listener.event === event && listener.callback === callback) {
        this.listeners.delete(listener);
        break;
      }
    }
  }

  /**
   * Notify all listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    for (const listener of this.listeners) {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('UV listener error:', error);
        }
      }
    }
  }
} 