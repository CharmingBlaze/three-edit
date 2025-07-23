/**
 * UV mapping utility functions for three-edit
 * Pure functions for generating and manipulating UV coordinates
 */

import { Vector3 } from 'three';
import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { UVCoord } from '../uv/types';
import { clamp, normalize, wrap } from './math';

export interface UVGenerationParams {
  layout: 'planar' | 'spherical' | 'cylindrical' | 'box' | 'default';
  scale?: { x: number; y: number };
  offset?: { x: number; y: number };
  rotation?: number;
  seamThreshold?: number;
}

/**
 * Generate UV coordinates for vertices based on specified layout
 */
export function generateUVs(
  vertices: Vertex[],
  faces: Face[],
  params: UVGenerationParams
): void {
  switch (params.layout) {
    case 'planar':
      generatePlanarUVs(vertices, faces, params);
      break;
    case 'spherical':
      generateSphericalUVs(vertices, faces, params);
      break;
    case 'cylindrical':
      generateCylindricalUVs(vertices, faces, params);
      break;
    case 'box':
      generateBoxUVs(vertices, faces, params);
      break;
    case 'default':
    default:
      generateDefaultUVs(vertices, faces);
      break;
  }
}

/**
 * Generate planar UV coordinates (projection onto a plane)
 */
export function generatePlanarUVs(
  vertices: Vertex[],
  faces: Face[],
  params: UVGenerationParams
): void {
  const scale = params.scale || { x: 1, y: 1 };
  const offset = params.offset || { x: 0, y: 0 };
  const rotation = params.rotation || 0;

  // Calculate bounding box for normalization
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const vertex of vertices) {
    minX = Math.min(minX, vertex.x);
    maxX = Math.max(maxX, vertex.x);
    minY = Math.min(minY, vertex.y);
    maxY = Math.max(maxY, vertex.y);
    minZ = Math.min(minZ, vertex.z);
    maxZ = Math.max(maxZ, vertex.z);
  }

  const sizeX = maxX - minX;
  const sizeY = maxY - minY;
  const sizeZ = maxZ - minZ;

  // Choose projection plane based on largest dimension
  let uAxis: 'x' | 'y' | 'z';
  let vAxis: 'x' | 'y' | 'z';

  if (sizeX >= sizeY && sizeX >= sizeZ) {
    uAxis = 'y';
    vAxis = 'z';
  } else if (sizeY >= sizeX && sizeY >= sizeZ) {
    uAxis = 'x';
    vAxis = 'z';
  } else {
    uAxis = 'x';
    vAxis = 'y';
  }

  // Generate UVs
  for (const vertex of vertices) {
    const u = normalize(vertex[uAxis], minX, maxX) * scale.x + offset.x;
    const v = normalize(vertex[vAxis], minX, maxX) * scale.y + offset.y;
    
    // Apply rotation if specified
    if (rotation !== 0) {
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const rotatedU = u * cos - v * sin;
      const rotatedV = u * sin + v * cos;
      vertex.uv = { u: rotatedU, v: rotatedV };
    } else {
      vertex.uv = { u, v };
    }
  }
}

/**
 * Generate spherical UV coordinates
 */
export function generateSphericalUVs(
  vertices: Vertex[],
  faces: Face[],
  params: UVGenerationParams
): void {
  const scale = params.scale || { x: 1, y: 1 };
  const offset = params.offset || { x: 0, y: 0 };

  for (const vertex of vertices) {
    const { x, y, z } = vertex;
    
    // Convert to spherical coordinates
    const radius = Math.sqrt(x * x + y * y + z * z);
    
    if (radius === 0) {
      vertex.uv = { u: 0.5, v: 0.5 };
      continue;
    }

    // Calculate spherical coordinates
    const theta = Math.atan2(y, x); // Azimuthal angle
    const phi = Math.acos(clamp(z / radius, -1, 1)); // Polar angle

    // Convert to UV coordinates
    const u = normalize(theta, -Math.PI, Math.PI) * scale.x + offset.x;
    const v = normalize(phi, 0, Math.PI) * scale.y + offset.y;

    vertex.uv = { u, v };
  }
}

/**
 * Generate cylindrical UV coordinates
 */
export function generateCylindricalUVs(
  vertices: Vertex[],
  faces: Face[],
  params: UVGenerationParams
): void {
  const scale = params.scale || { x: 1, y: 1 };
  const offset = params.offset || { x: 0, y: 0 };

  for (const vertex of vertices) {
    const { x, y, z } = vertex;
    
    // Calculate cylindrical coordinates
    const radius = Math.sqrt(x * x + y * y);
    const theta = Math.atan2(y, x);
    const height = z;

    // Convert to UV coordinates
    const u = normalize(theta, -Math.PI, Math.PI) * scale.x + offset.x;
    const v = height * scale.y + offset.y;

    vertex.uv = { u, v };
  }
}

/**
 * Generate box UV coordinates (cubic mapping)
 */
export function generateBoxUVs(
  vertices: Vertex[],
  faces: Face[],
  params: UVGenerationParams
): void {
  const scale = params.scale || { x: 1, y: 1 };
  const offset = params.offset || { x: 0, y: 0 };

  for (const vertex of vertices) {
    const { x, y, z } = vertex;
    
    // Determine which face of the cube this vertex belongs to
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    const absZ = Math.abs(z);
    
    let u: number, v: number;
    
    if (absX >= absY && absX >= absZ) {
      // X face
      u = y * scale.x + offset.x;
      v = z * scale.y + offset.y;
    } else if (absY >= absX && absY >= absZ) {
      // Y face
      u = x * scale.x + offset.x;
      v = z * scale.y + offset.y;
    } else {
      // Z face
      u = x * scale.x + offset.x;
      v = y * scale.y + offset.y;
    }

    vertex.uv = { u, v };
  }
}

/**
 * Generate default UV coordinates (simple planar projection)
 */
export function generateDefaultUVs(vertices: Vertex[], faces: Face[]): void {
  generatePlanarUVs(vertices, faces, { layout: 'planar' });
}

/**
 * Rotate UV coordinates around a center point
 */
export function rotateUVs(
  vertices: Vertex[],
  center: UVCoord,
  angle: number
): void {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  for (const vertex of vertices) {
    if (!vertex.uv) continue;

    const dx = vertex.uv.u - center.u;
    const dy = vertex.uv.v - center.v;

    const rotatedU = dx * cos - dy * sin + center.u;
    const rotatedV = dx * sin + dy * cos + center.v;

    vertex.uv = { u: rotatedU, v: rotatedV };
  }
}

/**
 * Scale UV coordinates around a center point
 */
export function scaleUVs(
  vertices: Vertex[],
  center: UVCoord,
  scale: { x: number; y: number }
): void {
  for (const vertex of vertices) {
    if (!vertex.uv) continue;

    const dx = vertex.uv.u - center.u;
    const dy = vertex.uv.v - center.v;

    const scaledU = dx * scale.x + center.u;
    const scaledV = dy * scale.y + center.v;

    vertex.uv = { u: scaledU, v: scaledV };
  }
}

/**
 * Offset UV coordinates
 */
export function offsetUVs(
  vertices: Vertex[],
  offset: { x: number; y: number }
): void {
  for (const vertex of vertices) {
    if (!vertex.uv) continue;

    const newU = vertex.uv.u + offset.x;
    const newV = vertex.uv.v + offset.y;

    vertex.uv = { u: newU, v: newV };
  }
}

/**
 * Wrap UV coordinates to ensure they're within [0, 1] range
 */
export function wrapUVs(vertices: Vertex[]): void {
  for (const vertex of vertices) {
    if (!vertex.uv) continue;

    const wrappedU = wrap(vertex.uv.u, 0, 1);
    const wrappedV = wrap(vertex.uv.v, 0, 1);

    vertex.uv = { u: wrappedU, v: wrappedV };
  }
}

/**
 * Check if two UV coordinates are close to each other (for seam detection)
 */
export function areUVsClose(
  uv1: UVCoord,
  uv2: UVCoord,
  threshold: number = 0.01
): boolean {
  const du = Math.abs(uv1.u - uv2.u);
  const dv = Math.abs(uv1.v - uv2.v);
  
  // Handle UV wrapping
  const wrappedDu = Math.min(du, Math.abs(du - 1));
  const wrappedDv = Math.min(dv, Math.abs(dv - 1));
  
  return wrappedDu < threshold && wrappedDv < threshold;
}

/**
 * Calculate UV seam between two vertices
 */
export function isUVSeam(
  vertex1: Vertex,
  vertex2: Vertex,
  threshold: number = 0.01
): boolean {
  if (!vertex1.uv || !vertex2.uv) return false;
  
  return !areUVsClose(vertex1.uv, vertex2.uv, threshold);
}

/**
 * Generate UV coordinates for a specific face
 */
export function generateFaceUVs(
  face: Face,
  vertices: Vertex[],
  layout: 'planar' | 'spherical' | 'cylindrical' | 'box' = 'planar'
): void {
  const faceVertices = face.vertices.map(id => vertices[id]);
  
  // Calculate face center for projection
  const center = new Vector3();
  for (const vertex of faceVertices) {
    center.add(new Vector3(vertex.x, vertex.y, vertex.z));
  }
  center.divideScalar(faceVertices.length);

  // Generate UVs based on layout
  switch (layout) {
    case 'planar':
      generatePlanarUVsForFace(faceVertices, center);
      break;
    case 'spherical':
      generateSphericalUVsForFace(faceVertices, center);
      break;
    case 'cylindrical':
      generateCylindricalUVsForFace(faceVertices, center);
      break;
    case 'box':
      generateBoxUVsForFace(faceVertices, center);
      break;
  }
}

/**
 * Generate planar UVs for a specific face
 */
function generatePlanarUVsForFace(faceVertices: Vertex[], center: Vector3): void {
  // Calculate face normal for projection plane
  if (faceVertices.length < 3) return;
  
  const v0 = new Vector3(faceVertices[0].x, faceVertices[0].y, faceVertices[0].z);
  const v1 = new Vector3(faceVertices[1].x, faceVertices[1].y, faceVertices[1].z);
  const v2 = new Vector3(faceVertices[2].x, faceVertices[2].y, faceVertices[2].z);
  
  const edge1 = new Vector3().subVectors(v1, v0);
  const edge2 = new Vector3().subVectors(v2, v0);
  const normal = new Vector3().crossVectors(edge1, edge2).normalize();
  
  // Project vertices onto the plane perpendicular to the normal
  for (const vertex of faceVertices) {
    const toVertex = new Vector3().subVectors(new Vector3(vertex.x, vertex.y, vertex.z), center);
    const projected = new Vector3().subVectors(toVertex, normal.clone().multiplyScalar(toVertex.dot(normal)));
    
    // Convert to UV coordinates
    const u = projected.x * 0.5 + 0.5;
    const v = projected.y * 0.5 + 0.5;
    
    vertex.uv = { u, v };
  }
}

/**
 * Generate spherical UVs for a specific face
 */
function generateSphericalUVsForFace(faceVertices: Vertex[], center: Vector3): void {
  for (const vertex of faceVertices) {
    const toVertex = new Vector3().subVectors(new Vector3(vertex.x, vertex.y, vertex.z), center);
    const radius = toVertex.length();
    
    if (radius === 0) {
      vertex.uv = { u: 0.5, v: 0.5 };
      continue;
    }
    
    const theta = Math.atan2(toVertex.y, toVertex.x);
    const phi = Math.acos(clamp(toVertex.z / radius, -1, 1));
    
    const u = normalize(theta, -Math.PI, Math.PI);
    const v = normalize(phi, 0, Math.PI);
    
    vertex.uv = { u, v };
  }
}

/**
 * Generate cylindrical UVs for a specific face
 */
function generateCylindricalUVsForFace(faceVertices: Vertex[], center: Vector3): void {
  for (const vertex of faceVertices) {
    const toVertex = new Vector3().subVectors(new Vector3(vertex.x, vertex.y, vertex.z), center);
    const radius = Math.sqrt(toVertex.x * toVertex.x + toVertex.y * toVertex.y);
    const theta = Math.atan2(toVertex.y, toVertex.x);
    const height = toVertex.z;
    
    const u = normalize(theta, -Math.PI, Math.PI);
    const v = height;
    
    vertex.uv = { u, v };
  }
}

/**
 * Generate box UVs for a specific face
 */
function generateBoxUVsForFace(faceVertices: Vertex[], center: Vector3): void {
  for (const vertex of faceVertices) {
    const toVertex = new Vector3().subVectors(new Vector3(vertex.x, vertex.y, vertex.z), center);
    const { x, y, z } = toVertex;
    
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    const absZ = Math.abs(z);
    
    let u: number, v: number;
    
    if (absX >= absY && absX >= absZ) {
      u = y;
      v = z;
    } else if (absY >= absX && absY >= absZ) {
      u = x;
      v = z;
    } else {
      u = x;
      v = y;
    }
    
    vertex.uv = { u, v };
  }
} 