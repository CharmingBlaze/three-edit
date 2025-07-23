/**
 * Additional UV functions with exact signatures as requested
 */

import { Face } from '../core/Face';
import { Vertex } from '../core/Vertex';
import { EditableMesh } from '../core/EditableMesh';
import { Vector3 } from 'three';

export interface UVCoord {
  u: number;
  v: number;
}

/**
 * Generate box UV coordinates for a face (exact signature match)
 */
export function generateBoxUV(face: Face, vertices: Vertex[]): UVCoord[] {
  const faceVertices = face.vertices.map(index => vertices[index]).filter(Boolean);
  const uvs: UVCoord[] = [];
  
  for (let i = 0; i < faceVertices.length; i++) {
    const vertex = faceVertices[i];
    const u = (i % 2) === 0 ? 0 : 1;
    const v = Math.floor(i / 2) === 0 ? 0 : 1;
    uvs.push({ u, v });
  }
  
  return uvs;
}

/**
 * Generate planar UV coordinates for a face (exact signature match)
 */
export function generatePlanarUV(face: Face, vertices: Vertex[], axis: 'x' | 'y' | 'z'): UVCoord[] {
  const faceVertices = face.vertices.map(index => vertices[index]).filter(Boolean);
  const uvs: UVCoord[] = [];
  
  for (const vertex of faceVertices) {
    let u: number, v: number;
    
    switch (axis) {
      case 'x':
        u = vertex.y;
        v = vertex.z;
        break;
      case 'y':
        u = vertex.x;
        v = vertex.z;
        break;
      case 'z':
        u = vertex.x;
        v = vertex.y;
        break;
    }
    
    uvs.push({ u, v });
  }
  
  return uvs;
}

/**
 * Generate spherical UV coordinates for a vertex (exact signature match)
 */
export function generateSphericalUV(vertex: Vector3): UVCoord {
  const u = 0.5 + Math.atan2(vertex.z, vertex.x) / (2 * Math.PI);
  const v = 0.5 + Math.asin(vertex.y) / Math.PI;
  return { u, v };
}

/**
 * Scale UVs for a mesh (exact signature match)
 */
export function scaleUVsForMesh(mesh: EditableMesh, scale: number): void {
  for (const vertex of mesh.vertices) {
    if (vertex.uv) {
      vertex.uv.u *= scale;
      vertex.uv.v *= scale;
    }
  }
}

/**
 * Rotate UVs for a mesh (exact signature match)
 */
export function rotateUVsForMesh(mesh: EditableMesh, angle: number): void {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  for (const vertex of mesh.vertices) {
    if (vertex.uv) {
      const u = vertex.uv.u - 0.5;
      const v = vertex.uv.v - 0.5;
      
      vertex.uv.u = u * cos - v * sin + 0.5;
      vertex.uv.v = u * sin + v * cos + 0.5;
    }
  }
}

/**
 * Validate UV mapping for a mesh (exact signature match)
 */
export function validateUVMapping(mesh: EditableMesh): string[] {
  const errors: string[] = [];
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    if (!mesh.vertices[i].uv) {
      errors.push(`Vertex ${i} has no UV coordinates`);
    }
  }
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    const uv = mesh.vertices[i].uv;
    if (uv && (uv.u < 0 || uv.u > 1 || uv.v < 0 || uv.v > 1)) {
      errors.push(`Vertex ${i} has UV coordinates outside valid range: (${uv.u}, ${uv.v})`);
    }
  }
  
  return errors;
} 