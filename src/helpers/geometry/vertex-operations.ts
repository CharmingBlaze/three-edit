/**
 * Vertex Operations - Pure functions for vertex manipulation
 * Extracted from geometry.ts for better modularity
 */

import { Vertex } from '../../core/Vertex';
import { Vector3, Matrix4 } from 'three';
import { distanceSquared3D } from '../math/vector-math';

/**
 * Merge vertices that are close to each other
 */
export function mergeVertices(
  vertices: Vertex[],
  threshold: number = 1e-6
): {
  newVertices: Vertex[];
  vertexMap: number[];
} {
  const vertexMap: number[] = [];
  const newVertices: Vertex[] = [];
  const thresholdSquared = threshold * threshold;
  
  // Create vertex map
  for (let i = 0; i < vertices.length; i++) {
    let found = false;
    
    for (let j = 0; j < newVertices.length; j++) {
      const distance = distanceSquared3D(
        new Vector3(vertices[i].x, vertices[i].y, vertices[i].z),
        new Vector3(newVertices[j].x, newVertices[j].y, newVertices[j].z)
      );
      
      if (distance <= thresholdSquared) {
        vertexMap[i] = j;
        found = true;
        break;
      }
    }
    
    if (!found) {
      vertexMap[i] = newVertices.length;
      newVertices.push(vertices[i].clone());
    }
  }
  
  return { newVertices, vertexMap };
}

/**
 * Center vertices around a point
 */
export function centerVertices(vertices: Vertex[], center: Vector3): void {
  vertices.forEach(vertex => {
    vertex.x -= center.x;
    vertex.y -= center.y;
    vertex.z -= center.z;
  });
}

/**
 * Scale vertices
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
export function rotateVertices(
  vertices: Vertex[],
  axis: Vector3,
  angle: number
): void {
  vertices.forEach(vertex => {
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    position.applyAxisAngle(axis, angle);
    vertex.x = position.x;
    vertex.y = position.y;
    vertex.z = position.z;
  });
}

/**
 * Transform vertices using a matrix
 */
export function transformVertices(vertices: Vertex[], matrix: Matrix4): void {
  vertices.forEach(vertex => {
    const vec = new Vector3(vertex.x, vertex.y, vertex.z);
    vec.applyMatrix4(matrix);
    vertex.x = vec.x;
    vertex.y = vec.y;
    vertex.z = vec.z;
  });
}

/**
 * Find vertices within a radius of a center point
 */
export function findVerticesInRadius(
  vertices: Vertex[],
  center: Vector3,
  radius: number
): number[] {
  const radiusSquared = radius * radius;
  const result: number[] = [];
  
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const distance = distanceSquared3D(
      new Vector3(vertex.x, vertex.y, vertex.z),
      center
    );
    
    if (distance <= radiusSquared) {
      result.push(i);
    }
  }
  
  return result;
}

/**
 * Create a grid of vertices
 */
export function createVertexGrid(
  width: number,
  height: number,
  generator: (x: number, y: number) => { x: number; y: number; z: number }
): Vertex[][] {
  const grid: Vertex[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Vertex[] = [];
    for (let x = 0; x < width; x++) {
      const position = generator(x, y);
      const vertex = new Vertex(position.x, position.y, position.z);
      row.push(vertex);
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Calculate bounding box for vertices
 */
export function calculateBoundingBox(vertices: Vertex[]): {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  size: Vector3;
} {
  if (vertices.length === 0) {
    return {
      min: new Vector3(0, 0, 0),
      max: new Vector3(0, 0, 0),
      center: new Vector3(0, 0, 0),
      size: new Vector3(0, 0, 0)
    };
  }
  
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
  
  const center = new Vector3().addVectors(min, max).multiplyScalar(0.5);
  const size = new Vector3().subVectors(max, min);
  
  return { min, max, center, size };
} 