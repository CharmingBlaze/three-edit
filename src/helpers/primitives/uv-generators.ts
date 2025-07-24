/**
 * UV Generators - Utilities for generating UV coordinates for primitives
 * These provide common UV mapping patterns for different primitive types
 */

import { Vector2 } from 'three';
import { UVCoord } from '../../uv/types';
import { EditableMesh } from '../../core/EditableMesh';
import { Vertex } from '../../core/Vertex';

/**
 * Generate planar UV coordinates for vertices
 */
export function generatePlanarUVs(
  vertices: Vertex[],
  axis: 'x' | 'y' | 'z' = 'z',
  scale: Vector2 = new Vector2(1, 1)
): void {
  vertices.forEach(vertex => {
    let u: number, v: number;
    
    switch (axis) {
      case 'x':
        u = vertex.y * scale.x;
        v = vertex.z * scale.y;
        break;
      case 'y':
        u = vertex.x * scale.x;
        v = vertex.z * scale.y;
        break;
      case 'z':
      default:
        u = vertex.x * scale.x;
        v = vertex.y * scale.y;
        break;
    }
    
    vertex.uv = { u, v };
  });
}

/**
 * Generate cylindrical UV coordinates for vertices
 */
export function generateCylindricalUVs(
  vertices: Vertex[],
  radius: number = 1,
  height: number = 1
): void {
  vertices.forEach(vertex => {
    const angle = Math.atan2(vertex.z, vertex.x);
    const u = (angle + Math.PI) / (2 * Math.PI);
    const v = (vertex.y + height / 2) / height;
    
    vertex.uv = { u, v };
  });
}

/**
 * Generate spherical UV coordinates for vertices
 */
export function generateSphericalUVs(
  vertices: Vertex[],
  radius: number = 1
): void {
  vertices.forEach(vertex => {
    const phi = Math.acos(vertex.y / radius);
    const theta = Math.atan2(vertex.z, vertex.x);
    
    const u = (theta + Math.PI) / (2 * Math.PI);
    const v = phi / Math.PI;
    
    vertex.uv = { u, v };
  });
}

/**
 * Generate cubic UV coordinates for vertices
 */
export function generateCubicUVs(
  vertices: Vertex[],
  size: number = 1
): void {
  vertices.forEach(vertex => {
    const absX = Math.abs(vertex.x);
    const absY = Math.abs(vertex.y);
    const absZ = Math.abs(vertex.z);
    
    let u: number, v: number;
    
    if (absX >= absY && absX >= absZ) {
      // X face
      u = vertex.z / size + 0.5;
      v = vertex.y / size + 0.5;
    } else if (absY >= absZ) {
      // Y face
      u = vertex.x / size + 0.5;
      v = vertex.z / size + 0.5;
    } else {
      // Z face
      u = vertex.x / size + 0.5;
      v = vertex.y / size + 0.5;
    }
    
    vertex.uv = { u, v };
  });
}

/**
 * Generate torus UV coordinates for vertices
 */
export function generateTorusUVs(
  vertices: Vertex[],
  majorRadius: number = 1,
  minorRadius: number = 0.3
): void {
  vertices.forEach(vertex => {
    const majorAngle = Math.atan2(vertex.y, vertex.x);
    const minorAngle = Math.atan2(
      Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y) - majorRadius,
      vertex.z
    );
    
    const u = (majorAngle + Math.PI) / (2 * Math.PI);
    const v = (minorAngle + Math.PI) / (2 * Math.PI);
    
    vertex.uv = { u, v };
  });
}

/**
 * Generate grid UV coordinates for vertices
 */
export function generateGridUVs(
  vertices: Vertex[],
  width: number = 1,
  height: number = 1
): void {
  vertices.forEach(vertex => {
    const u = (vertex.x + width / 2) / width;
    const v = (vertex.z + height / 2) / height;
    
    vertex.uv = { u, v };
  });
}

/**
 * Generate circle UV coordinates for vertices
 */
export function generateCircleUVs(
  vertices: Vertex[],
  radius: number = 1
): void {
  vertices.forEach(vertex => {
    const distance = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
    const angle = Math.atan2(vertex.z, vertex.x);
    
    const u = (angle + Math.PI) / (2 * Math.PI);
    const v = distance / radius;
    
    vertex.uv = { u, v };
  });
}

/**
 * Generate triplanar UV coordinates for vertices
 */
export function generateTriplanarUVs(
  vertices: Vertex[],
  scale: Vector2 = new Vector2(1, 1)
): void {
  vertices.forEach(vertex => {
    const absX = Math.abs(vertex.x);
    const absY = Math.abs(vertex.y);
    const absZ = Math.abs(vertex.z);
    
    let u: number, v: number;
    
    if (absX >= absY && absX >= absZ) {
      // X face
      u = vertex.z * scale.x;
      v = vertex.y * scale.y;
    } else if (absY >= absZ) {
      // Y face
      u = vertex.x * scale.x;
      v = vertex.z * scale.y;
    } else {
      // Z face
      u = vertex.x * scale.x;
      v = vertex.y * scale.y;
    }
    
    vertex.uv = { u, v };
  });
}

/**
 * Generate box UV coordinates for vertices
 */
export function generateBoxUVs(
  vertices: Vertex[],
  width: number = 1,
  height: number = 1,
  depth: number = 1
): void {
  vertices.forEach(vertex => {
    const absX = Math.abs(vertex.x);
    const absY = Math.abs(vertex.y);
    const absZ = Math.abs(vertex.z);
    
    let u: number, v: number;
    
    if (absX >= absY && absX >= absZ) {
      // X face
      u = (vertex.z + depth / 2) / depth;
      v = (vertex.y + height / 2) / height;
    } else if (absY >= absZ) {
      // Y face
      u = (vertex.x + width / 2) / width;
      v = (vertex.z + depth / 2) / depth;
    } else {
      // Z face
      u = (vertex.x + width / 2) / width;
      v = (vertex.y + height / 2) / height;
    }
    
    vertex.uv = { u, v };
  });
}

/**
 * Generate seamless UV coordinates for vertices
 */
export function generateSeamlessUVs(
  vertices: Vertex[],
  scale: Vector2 = new Vector2(1, 1),
  offset: Vector2 = new Vector2(0, 0)
): void {
  vertices.forEach(vertex => {
    const u = (vertex.x * scale.x + offset.x) % 1;
    const v = (vertex.z * scale.y + offset.y) % 1;
    
    vertex.uv = { u, v };
  });
}

/**
 * Generate checkerboard UV coordinates for vertices
 */
export function generateCheckerboardUVs(
  vertices: Vertex[],
  scale: Vector2 = new Vector2(1, 1),
  tiles: Vector2 = new Vector2(4, 4)
): void {
  vertices.forEach(vertex => {
    const u = ((vertex.x * scale.x) % tiles.x) / tiles.x;
    const v = ((vertex.z * scale.y) % tiles.y) / tiles.y;
    
    vertex.uv = { u, v };
  });
}

/**
 * Generate polar UV coordinates for vertices
 */
export function generatePolarUVs(
  vertices: Vertex[],
  center: Vector2 = new Vector2(0, 0)
): void {
  vertices.forEach(vertex => {
    const dx = vertex.x - center.x;
    const dy = vertex.z - center.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    const u = (angle + Math.PI) / (2 * Math.PI);
    const v = distance;
    
    vertex.uv = { u, v };
  });
} 