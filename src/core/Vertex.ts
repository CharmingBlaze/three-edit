import { Vector3 } from 'three';
import { UVCoord } from '../uv/types';

/**
 * Vertex data structure
 */
export interface VertexData {
  /** Vertex position */
  x: number;
  y: number;
  z: number;
  /** Vertex normal */
  normal?: Vector3;
  /** UV coordinates */
  uv?: UVCoord;
  /** Vertex color */
  color?: Vector3;
  /** Custom user data */
  userData?: Record<string, any>;
}

/**
 * Vertex class representing a 3D point in space
 */
export class Vertex {
  public x: number;
  public y: number;
  public z: number;
  public normal?: Vector3;
  public uv?: UVCoord;
  public color?: Vector3;
  public userData: Record<string, any>;

  constructor(x: number, y: number, z: number, data?: Partial<VertexData>) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.normal = data?.normal;
    this.uv = data?.uv;
    this.color = data?.color;
    this.userData = data?.userData || {};
  }

  /**
   * Creates a Vertex from data object
   */
  static fromData(data: VertexData): Vertex {
    return new Vertex(data.x, data.y, data.z, data);
  }

  /**
   * Creates a copy of this vertex
   */
  clone(): Vertex {
    return new Vertex(this.x, this.y, this.z, {
      normal: this.normal?.clone(),
      uv: this.uv ? { u: this.uv.u, v: this.uv.v } : undefined,
      color: this.color?.clone(),
      userData: { ...this.userData }
    });
  }

  /**
   * Sets the position of this vertex
   */
  setPosition(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Sets the UV coordinates
   */
  setUV(u: number, v: number): void {
    this.uv = { u, v };
  }

  /**
   * Sets the normal vector
   */
  setNormal(normal: Vector3): void {
    this.normal = normal.clone();
  }

  /**
   * Sets the color
   */
  setColor(color: Vector3): void {
    this.color = color.clone();
  }

  /**
   * Gets the position as a Vector3
   */
  getPosition(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  /**
   * Calculates distance to another vertex
   */
  distanceTo(other: Vertex): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Interpolates between this vertex and another
   */
  interpolate(other: Vertex, t: number): Vertex {
    const x = this.x + (other.x - this.x) * t;
    const y = this.y + (other.y - this.y) * t;
    const z = this.z + (other.z - this.z) * t;
    
    const result = new Vertex(x, y, z);
    
    // Interpolate UVs if both have them
    if (this.uv && other.uv) {
      result.uv = {
        u: this.uv.u + (other.uv.u - this.uv.u) * t,
        v: this.uv.v + (other.uv.v - this.uv.v) * t
      };
    }
    
    // Interpolate normals if both have them
    if (this.normal && other.normal) {
      result.normal = new Vector3().lerpVectors(this.normal, other.normal, t).normalize();
    }
    
    // Interpolate colors if both have them
    if (this.color && other.color) {
      result.color = new Vector3().lerpVectors(this.color, other.color, t);
    }
    
    return result;
  }
}
