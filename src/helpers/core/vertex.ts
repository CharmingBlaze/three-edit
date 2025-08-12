/**
 * Core vertex manipulation helpers
 * Pure, composable functions for vertex operations
 */

import { Vector3 } from 'three';
import { Vertex } from '../../core/Vertex';
import { UVCoord } from '../../uv/types';
import { UserData } from '../../types/core';

/**
 * Create a new vertex with optional attributes
 */
export function createVertex(
  x: number,
  y: number,
  z: number,
  options: {
    normal?: Vector3;
    uv?: UVCoord;
    color?: Vector3;
    userData?: UserData;
  } = {}
): Vertex {
  return new Vertex(x, y, z, options);
}

/**
 * Clone a vertex with optional modifications
 */
export function cloneVertex(
  vertex: Vertex,
  modifications: Partial<{
    position: Vector3;
    normal: Vector3;
    uv: UVCoord;
    color: Vector3;
    userData: UserData;
  }> = {}
): Vertex {
  const newVertex = new Vertex(
    modifications.position?.x ?? vertex.x,
    modifications.position?.y ?? vertex.y,
    modifications.position?.z ?? vertex.z,
    {
      normal: modifications.normal ?? vertex.normal,
      uv: modifications.uv ?? vertex.uv,
      color: modifications.color ?? vertex.color,
      userData: modifications.userData ?? { ...vertex.userData }
    }
  );
  return newVertex;
}

/**
 * Get vertex position as Vector3
 */
export function getVertexPosition(vertex: Vertex): Vector3 {
  return new Vector3(vertex.x, vertex.y, vertex.z);
}

/**
 * Set vertex position from Vector3
 */
export function setVertexPosition(vertex: Vertex, position: Vector3): void {
  vertex.x = position.x;
  vertex.y = position.y;
  vertex.z = position.z;
}

/**
 * Calculate distance between two vertices
 */
export function distanceBetweenVertices(v1: Vertex, v2: Vertex): number {
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  const dz = v2.z - v1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate squared distance between two vertices (faster for comparisons)
 */
export function distanceSquaredBetweenVertices(v1: Vertex, v2: Vertex): number {
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  const dz = v2.z - v1.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Find vertices within a radius of a target vertex
 */
export function findVerticesInRadius(
  targetVertex: Vertex,
  vertices: Vertex[],
  radius: number
): { vertex: Vertex; distance: number; index: number }[] {
  const result: { vertex: Vertex; distance: number; index: number }[] = [];
  const radiusSquared = radius * radius;

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const distanceSquared = distanceSquaredBetweenVertices(targetVertex, vertex);
    
    if (distanceSquared <= radiusSquared) {
      result.push({
        vertex,
        distance: Math.sqrt(distanceSquared),
        index: i
      });
    }
  }

  return result.sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate centroid of multiple vertices
 */
export function calculateVertexCentroid(vertices: Vertex[]): Vector3 {
  if (vertices.length === 0) {
    return new Vector3(0, 0, 0);
  }

  const centroid = new Vector3(0, 0, 0);
  for (const vertex of vertices) {
    centroid.add(getVertexPosition(vertex));
  }
  centroid.divideScalar(vertices.length);

  return centroid;
}

/**
 * Check if two vertices are at the same position (within tolerance)
 */
export function verticesEqual(
  v1: Vertex,
  v2: Vertex,
  tolerance: number = 0.001
): boolean {
  return distanceSquaredBetweenVertices(v1, v2) <= tolerance * tolerance;
}

/**
 * Merge vertices that are at the same position
 */
export function mergeDuplicateVertices(
  vertices: Vertex[],
  tolerance: number = 0.001
): { vertices: Vertex[]; mapping: number[] } {
  const newVertices: Vertex[] = [];
  const mapping: number[] = new Array(vertices.length);

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    let found = false;

    for (let j = 0; j < newVertices.length; j++) {
      if (verticesEqual(vertex, newVertices[j], tolerance)) {
        mapping[i] = j;
        found = true;
        break;
      }
    }

    if (!found) {
      mapping[i] = newVertices.length;
      newVertices.push(cloneVertex(vertex));
    }
  }

  return { vertices: newVertices, mapping };
}

/**
 * Transform vertex position by matrix
 */
export function transformVertex(vertex: Vertex, matrix: THREE.Matrix4): void {
  const position = getVertexPosition(vertex);
  position.applyMatrix4(matrix);
  setVertexPosition(vertex, position);

  // Transform normal if present
  if (vertex.normal) {
    vertex.normal.applyMatrix4(matrix).normalize();
  }
}

/**
 * Scale vertex position
 */
export function scaleVertex(vertex: Vertex, scale: Vector3): void {
  vertex.x *= scale.x;
  vertex.y *= scale.y;
  vertex.z *= scale.z;
}

/**
 * Translate vertex position
 */
export function translateVertex(vertex: Vertex, offset: Vector3): void {
  vertex.x += offset.x;
  vertex.y += offset.y;
  vertex.z += offset.z;
}

/**
 * Rotate vertex around a center point
 */
export function rotateVertex(
  vertex: Vertex,
  center: Vector3,
  rotation: Vector3
): void {
  const position = getVertexPosition(vertex);
  position.sub(center);
  
  // Apply rotation (simplified - in practice you'd use quaternions or rotation matrices)
  // This is a basic implementation - for production use, implement proper rotation
  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  const cosZ = Math.cos(rotation.z);
  const sinZ = Math.sin(rotation.z);

  const x = position.x;
  const y = position.y;
  const z = position.z;

  // Apply rotations in order: X, Y, Z
  const newX = x * cosY * cosZ - y * cosY * sinZ + z * sinY;
  const newY = x * (sinX * sinY * cosZ + cosX * sinZ) + 
               y * (sinX * sinY * sinZ - cosX * cosZ) - 
               z * sinX * cosY;
  const newZ = x * (cosX * sinY * cosZ - sinX * sinZ) + 
               y * (cosX * sinY * sinZ + sinX * cosZ) + 
               z * cosX * cosY;

  position.set(newX, newY, newZ);
  position.add(center);
  setVertexPosition(vertex, position);
} 