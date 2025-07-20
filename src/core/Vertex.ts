import { Vector3 } from 'three';

/**
 * @class Vertex
 * @description Represents a single point in 3D space. It stores its position (x, y, z)
 * and can optionally hold attributes like normals and UV coordinates.
 */
export class Vertex {
  /** 
   * @property {number} x - The x-coordinate of the vertex.
   */
  x: number;
  
  /** 
   * @property {number} y - The y-coordinate of the vertex.
   */
  y: number;
  
  /** 
   * @property {number} z - The z-coordinate of the vertex.
   */
  z: number;
  
  /** 
   * @property {Vector3} [normal] - The normal vector of the vertex, used for lighting calculations.
   */
  normal?: Vector3;
  
  /** 
   * @property {{u: number, v: number}} [uv] - The UV coordinates for texture mapping.
   */
  uv?: { u: number; v: number };
  
  /** 
   * @property {Record<string, any>} userData - A flexible object for storing custom data.
   */
  userData: Record<string, any>;
  
  /**
   * Creates a new Vertex instance.
   * @param {number} [x=0] - The x-coordinate.
   * @param {number} [y=0] - The y-coordinate.
   * @param {number} [z=0] - The z-coordinate.
   * @param {object} [options={}] - Optional attributes for the vertex.
   * @param {Vector3} [options.normal] - The normal vector.
   * @param {{u: number, v: number}} [options.uv] - The UV coordinates.
   * @param {Record<string, any>} [options.userData] - Custom data.
   */
  constructor(
    x = 0,
    y = 0,
    z = 0,
    options: {
      normal?: Vector3;
      uv?: { u: number; v: number };
      userData?: Record<string, any>;
    } = {}
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.normal = options.normal;
    this.uv = options.uv;
    this.userData = options.userData || {};
  }
  
  /**
   * Creates a deep clone of this vertex.
   * @returns {Vertex} A new Vertex instance with the same properties.
   */
  clone(): Vertex {
    return new Vertex(this.x, this.y, this.z, {
      normal: this.normal ? this.normal.clone() : undefined,
      uv: this.uv ? { ...this.uv } : undefined,
      userData: { ...this.userData },
    });
  }
  
  /**
   * Sets the position of the vertex.
   * @param {number} x - The new x-coordinate.
   * @param {number} y - The new y-coordinate.
   * @param {number} z - The new z-coordinate.
   * @returns {Vertex} The vertex instance for method chaining.
   */
  setPosition(x: number, y: number, z: number): Vertex {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  
  /**
   * Sets the normal of the vertex.
   * @param {number} x - The x-component of the normal.
   * @param {number} y - The y-component of the normal.
   * @param {number} z - The z-component of the normal.
   * @returns {Vertex} The vertex instance for method chaining.
   */
  setNormal(x: number, y: number, z: number): Vertex {
    if (!this.normal) {
      this.normal = new Vector3(x, y, z);
    } else {
      this.normal.set(x, y, z);
    }
    return this;
  }
  
  /**
   * Sets the UV coordinates of the vertex.
   * @param {number} u - The u-coordinate.
   * @param {number} v - The v-coordinate.
   * @returns {Vertex} The vertex instance for method chaining.
   */
  setUV(u: number, v: number): Vertex {
    this.uv = { u, v };
    return this;
  }
  
  /**
   * Converts the vertex's position to a `Vector3`.
   * @returns {Vector3} A new `Vector3` instance with the vertex's position.
   */
  toVector3(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }
  
  /**
   * Creates a `Vertex` from a `Vector3`.
   * @param {Vector3} vector - The `Vector3` to create the vertex from.
   * @param {object} [options={}] - Optional attributes for the new vertex.
   * @returns {Vertex} A new `Vertex` instance.
   */
  static fromVector3(
    vector: Vector3,
    options: {
      normal?: Vector3;
      uv?: { u: number; v: number };
      userData?: Record<string, any>;
    } = {}
  ): Vertex {
    return new Vertex(vector.x, vector.y, vector.z, options);
  }
}
