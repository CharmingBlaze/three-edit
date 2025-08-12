/**
 * Geometry validation functions for three-edit
 * Pure functions for validating geometric properties and integrity
 */

import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { ValidationResult } from './types';

/**
 * Validate geometric properties of vertices and faces
 */
export function validateGeometry(
  vertices: Vertex[],
  faces: Face[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check for degenerate faces (zero area)
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    
    if (face.vertices.length < 3) {
      result.isValid = false;
      result.errors.push(`Face ${i} has less than 3 vertices`);
      continue;
    }

    // Check if face has zero area (degenerate)
    const area = calculateFaceArea(vertices, face);
    if (area < 1e-10) {
      result.warnings.push(`Face ${i} has very small area: ${area}`);
    }

    // Check for collinear vertices in triangular faces
    if (face.vertices.length === 3) {
      const v1 = vertices[face.vertices[0]];
      const v2 = vertices[face.vertices[1]];
      const v3 = vertices[face.vertices[2]];
      
      if (v1 && v2 && v3) {
        const isCollinear = checkCollinear(v1, v2, v3);
        if (isCollinear) {
          result.warnings.push(`Face ${i} has collinear vertices`);
        }
      }
    }
  }

  // Check for overlapping vertices
  const overlappingVertices = findOverlappingVertices(vertices, 0.001);
  if (overlappingVertices.length > 0) {
    result.warnings.push(`Found ${overlappingVertices.length} pairs of overlapping vertices`);
  }

  return result;
}

/**
 * Calculate the area of a face
 */
function calculateFaceArea(vertices: Vertex[], face: Face): number {
  if (face.vertices.length < 3) return 0;

  // For triangular faces, use cross product
  if (face.vertices.length === 3) {
    const v1 = vertices[face.vertices[0]];
    const v2 = vertices[face.vertices[1]];
    const v3 = vertices[face.vertices[2]];
    
    if (!v1 || !v2 || !v3) return 0;
    
    const edge1 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
    const edge2 = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };
    
    // Cross product
    const crossX = edge1.y * edge2.z - edge1.z * edge2.y;
    const crossY = edge1.z * edge2.x - edge1.x * edge2.z;
    const crossZ = edge1.x * edge2.y - edge1.y * edge2.x;
    
    return Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) * 0.5;
  }

  // For non-triangular faces, triangulate and sum areas
  // This is a simplified approach - in practice, you might want more sophisticated triangulation
  let totalArea = 0;
  const center = calculateFaceCenter(vertices, face);
  
  for (let i = 0; i < face.vertices.length; i++) {
    const v1 = vertices[face.vertices[i]];
    const v2 = vertices[face.vertices[(i + 1) % face.vertices.length]];
    
    if (v1 && v2) {
      const edge1 = { x: v1.x - center.x, y: v1.y - center.y, z: v1.z - center.z };
      const edge2 = { x: v2.x - center.x, y: v2.y - center.y, z: v2.z - center.z };
      
      const crossX = edge1.y * edge2.z - edge1.z * edge2.y;
      const crossY = edge1.z * edge2.x - edge1.x * edge2.z;
      const crossZ = edge1.x * edge2.y - edge1.y * edge2.x;
      
      totalArea += Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) * 0.5;
    }
  }
  
  return totalArea;
}

/**
 * Calculate the center point of a face
 */
function calculateFaceCenter(vertices: Vertex[], face: Face): { x: number; y: number; z: number } {
  let centerX = 0, centerY = 0, centerZ = 0;
  let validVertices = 0;
  
  for (const vertexIndex of face.vertices) {
    const vertex = vertices[vertexIndex];
    if (vertex) {
      centerX += vertex.x;
      centerY += vertex.y;
      centerZ += vertex.z;
      validVertices++;
    }
  }
  
  if (validVertices === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  
  return {
    x: centerX / validVertices,
    y: centerY / validVertices,
    z: centerZ / validVertices
  };
}

/**
 * Check if three vertices are collinear
 */
function checkCollinear(v1: Vertex, v2: Vertex, v3: Vertex): boolean {
  const edge1 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
  const edge2 = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };
  
  // Cross product
  const crossX = edge1.y * edge2.z - edge1.z * edge2.y;
  const crossY = edge1.z * edge2.x - edge1.x * edge2.z;
  const crossZ = edge1.x * edge2.y - edge1.y * edge2.x;
  
  // If cross product is zero, vertices are collinear
  const magnitude = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
  return magnitude < 1e-10;
}

/**
 * Find vertices that are very close to each other (overlapping)
 */
function findOverlappingVertices(vertices: Vertex[], tolerance: number): Array<[number, number]> {
  const overlapping: Array<[number, number]> = [];
  
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const v1 = vertices[i];
      const v2 = vertices[j];
      
      const distance = Math.sqrt(
        Math.pow(v1.x - v2.x, 2) +
        Math.pow(v1.y - v2.y, 2) +
        Math.pow(v1.z - v2.z, 2)
      );
      
      if (distance <= tolerance) {
        overlapping.push([i, j]);
      }
    }
  }
  
  return overlapping;
} 