/**
 * Transform Helpers - Utilities for transforming primitive geometries
 * These provide common transformation operations for primitives
 */

import { Vector3, Matrix4, Quaternion } from 'three';
import { Vertex } from '../../core';

/**
 * Translate vertices by a vector
 */
export function translateVertices(vertices: Vertex[], translation: Vector3): void {
  vertices.forEach(vertex => {
    vertex.x += translation.x;
    vertex.y += translation.y;
    vertex.z += translation.z;
  });
}

/**
 * Scale vertices by a vector
 */
export function scaleVertices(vertices: Vertex[], scale: Vector3): void {
  vertices.forEach(vertex => {
    vertex.x *= scale.x;
    vertex.y *= scale.y;
    vertex.z *= scale.z;
  });
}

/**
 * Rotate vertices around an axis
 */
export function rotateVertices(vertices: Vertex[], axis: Vector3, angle: number): void {
  const quaternion = new Quaternion().setFromAxisAngle(axis, angle);
  const matrix = new Matrix4().makeRotationFromQuaternion(quaternion);
  
  vertices.forEach(vertex => {
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    position.applyMatrix4(matrix);
    vertex.x = position.x;
    vertex.y = position.y;
    vertex.z = position.z;
  });
}

/**
 * Apply a transformation matrix to vertices
 */
export function transformVertices(vertices: Vertex[], matrix: Matrix4): void {
  vertices.forEach(vertex => {
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    position.applyMatrix4(matrix);
    vertex.x = position.x;
    vertex.y = position.y;
    vertex.z = position.z;
  });
}

/**
 * Center vertices around origin
 */
export function centerVertices(vertices: Vertex[]): void {
  if (vertices.length === 0) return;
  
  const center = new Vector3();
  vertices.forEach(vertex => {
    center.add(new Vector3(vertex.x, vertex.y, vertex.z));
  });
  center.divideScalar(vertices.length);
  
  translateVertices(vertices, center.clone().multiplyScalar(-1));
}

/**
 * Normalize vertices to fit in a unit cube
 */
export function normalizeVertices(vertices: Vertex[]): void {
  if (vertices.length === 0) return;
  
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  
  vertices.forEach(vertex => {
    min.x = Math.min(min.x, vertex.x);
    min.y = Math.min(min.y, vertex.y);
    min.z = Math.min(min.z, vertex.z);
    
    max.x = Math.max(max.x, vertex.x);
    max.y = Math.max(max.y, vertex.y);
    max.z = Math.max(max.z, vertex.z);
  });
  
  const size = new Vector3().subVectors(max, min);
  const maxSize = Math.max(size.x, size.y, size.z);
  
  if (maxSize > 0) {
    const scale = 1 / maxSize;
    scaleVertices(vertices, new Vector3(scale, scale, scale));
    centerVertices(vertices);
  }
}

/**
 * Mirror vertices across a plane
 */
export function mirrorVertices(vertices: Vertex[], normal: Vector3, point: Vector3 = new Vector3()): void {
  const matrix = new Matrix4().makeBasis(
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    normal
  );
  
  const inverse = matrix.clone().invert();
  const reflection = new Matrix4().makeScale(-1, 1, 1);
  
  const transform = matrix.clone()
    .multiply(reflection)
    .multiply(inverse);
  
  transformVertices(vertices, transform);
}

/**
 * Extrude vertices along a direction
 */
export function extrudeVertices(
  vertices: Vertex[], 
  direction: Vector3, 
  distance: number
): Vertex[] {
  return vertices.map(vertex => {
    const newVertex = vertex.clone();
    newVertex.x += direction.x * distance;
    newVertex.y += direction.y * distance;
    newVertex.z += direction.z * distance;
    return newVertex;
  });
}

/**
 * Create a copy of vertices with transformation applied
 */
export function transformVerticesCopy(
  vertices: Vertex[], 
  matrix: Matrix4
): Vertex[] {
  return vertices.map(vertex => {
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    position.applyMatrix4(matrix);
    
    const newVertex = vertex.clone();
    newVertex.x = position.x;
    newVertex.y = position.y;
    newVertex.z = position.z;
    
    return newVertex;
  });
}

/**
 * Create vertices for a rounded corner
 */
export function createRoundedCornerVertices(
  radius: number,
  segments: number,
  startAngle: number = 0,
  endAngle: number = Math.PI / 2,
  center: Vector3 = new Vector3(0, 0, 0)
): Vertex[] {
  const vertices: Vertex[] = [];
  const angleStep = (endAngle - startAngle) / segments;
  
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + i * angleStep;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    
    vertices.push(new Vertex(x, y, center.z));
  }
  
  return vertices;
}

/**
 * Create vertices for a chamfered corner
 */
export function createChamferedCornerVertices(
  size: number,
  chamfer: number,
  center: Vector3 = new Vector3(0, 0, 0)
): Vertex[] {
  const vertices: Vertex[] = [];
  
  // Outer corner
  vertices.push(new Vertex(center.x + size, center.y + size, center.z));
  
  // Chamfer points
  vertices.push(new Vertex(center.x + size - chamfer, center.y + size, center.z));
  vertices.push(new Vertex(center.x + size, center.y + size - chamfer, center.z));
  
  return vertices;
}

/**
 * Create vertices for a beveled corner
 */
export function createBeveledCornerVertices(
  size: number,
  bevel: number,
  segments: number,
  center: Vector3 = new Vector3(0, 0, 0)
): Vertex[] {
  return createRoundedCornerVertices(
    bevel,
    segments,
    0,
    Math.PI / 2,
    new Vector3(center.x + size - bevel, center.y + size - bevel, center.z)
  );
} 