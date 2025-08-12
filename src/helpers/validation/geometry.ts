/**
 * Geometry validation helpers
 * Pure, composable functions for geometry validation
 */

import { Vertex } from '../../core/Vertex';
import { Face } from '../../core/Face';
import { verticesEqual } from '../core/vertex';
import { calculateFaceNormal } from '../core/face';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate geometry integrity
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

  // Check for duplicate vertices
  const duplicateVertices = findDuplicateVertices(vertices);
  if (duplicateVertices.length > 0) {
    result.warnings.push(`Found ${duplicateVertices.length} duplicate vertices`);
  }

  // Check for degenerate faces
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const faceVertices = face.vertices.map((index: number) => vertices[index]).filter(Boolean);
    
    if (faceVertices.length < 3) {
      result.isValid = false;
      result.errors.push(`Face ${i} has less than 3 vertices: ${faceVertices.length}`);
      continue;
    }

    // Check for collinear vertices
    if (faceVertices.length >= 3) {
      const isCollinear = checkCollinear(faceVertices);
      if (isCollinear) {
        result.warnings.push(`Face ${i} has collinear vertices`);
      }
    }

    // Check for zero area faces
    const area = calculateFaceArea(face, vertices);
    if (area < 0.0001) {
      result.warnings.push(`Face ${i} has very small area: ${area}`);
    }
  }

  // Check for overlapping vertices
  const overlappingVertices = findOverlappingVertices(vertices);
  if (overlappingVertices.length > 0) {
    result.warnings.push(`Found ${overlappingVertices.length} overlapping vertices`);
  }

  return result;
}

/**
 * Find duplicate vertices in a mesh
 */
export function findDuplicateVertices(
  vertices: Vertex[],
  tolerance: number = 0.001
): { index1: number; index2: number; distance: number }[] {
  const duplicates: { index1: number; index2: number; distance: number }[] = [];

  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      if (verticesEqual(vertices[i], vertices[j], tolerance)) {
        const distance = Math.sqrt(
          Math.pow(vertices[i].x - vertices[j].x, 2) +
          Math.pow(vertices[i].y - vertices[j].y, 2) +
          Math.pow(vertices[i].z - vertices[j].z, 2)
        );
        duplicates.push({ index1: i, index2: j, distance });
      }
    }
  }

  return duplicates;
}

/**
 * Find overlapping vertices in a mesh
 */
export function findOverlappingVertices(
  vertices: Vertex[],
  tolerance: number = 0.001
): { index1: number; index2: number; distance: number }[] {
  return findDuplicateVertices(vertices, tolerance);
}

/**
 * Check if vertices are collinear
 */
export function checkCollinear(vertices: Vertex[]): boolean {
  if (vertices.length < 3) return false;

  const v0 = vertices[0];
  const v1 = vertices[1];
  const v2 = vertices[2];

  // Calculate vectors from v0 to v1 and v0 to v2
  const vec1 = {
    x: v1.x - v0.x,
    y: v1.y - v0.y,
    z: v1.z - v0.z
  };

  const vec2 = {
    x: v2.x - v0.x,
    y: v2.y - v0.y,
    z: v2.z - v0.z
  };

  // Calculate cross product
  const crossX = vec1.y * vec2.z - vec1.z * vec2.y;
  const crossY = vec1.z * vec2.x - vec1.x * vec2.z;
  const crossZ = vec1.x * vec2.y - vec1.y * vec2.x;

  // If cross product is zero, vectors are collinear
  const crossMagnitude = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
  return crossMagnitude < 0.0001;
}

/**
 * Calculate face area
 */
export function calculateFaceArea(face: Face, vertices: Vertex[]): number {
  const faceVertices = face.vertices.map((index: number) => vertices[index]).filter(Boolean);
  
  if (faceVertices.length < 3) {
    return 0;
  }

  // For triangles, use cross product method
  if (faceVertices.length === 3) {
    const v0 = faceVertices[0];
    const v1 = faceVertices[1];
    const v2 = faceVertices[2];

    const edge1 = {
      x: v1.x - v0.x,
      y: v1.y - v0.y,
      z: v1.z - v0.z
    };

    const edge2 = {
      x: v2.x - v0.x,
      y: v2.y - v0.y,
      z: v2.z - v0.z
    };

    const crossX = edge1.y * edge2.z - edge1.z * edge2.y;
    const crossY = edge1.z * edge2.x - edge1.x * edge2.z;
    const crossZ = edge1.x * edge2.y - edge1.y * edge2.x;
    
    return Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) * 0.5;
  }

  // For polygons, triangulate and sum areas
  let area = 0;
  const centroid = {
    x: faceVertices.reduce((sum: number, v: Vertex) => sum + v.x, 0) / faceVertices.length,
    y: faceVertices.reduce((sum: number, v: Vertex) => sum + v.y, 0) / faceVertices.length,
    z: faceVertices.reduce((sum: number, v: Vertex) => sum + v.z, 0) / faceVertices.length
  };
  
  for (let i = 0; i < faceVertices.length; i++) {
    const v1 = faceVertices[i];
    const v2 = faceVertices[(i + 1) % faceVertices.length];
    
    const edge1 = {
      x: v1.x - centroid.x,
      y: v1.y - centroid.y,
      z: v1.z - centroid.z
    };

    const edge2 = {
      x: v2.x - centroid.x,
      y: v2.y - centroid.y,
      z: v2.z - centroid.z
    };

    const crossX = edge1.y * edge2.z - edge1.z * edge2.y;
    const crossY = edge1.z * edge2.x - edge1.x * edge2.z;
    const crossZ = edge1.x * edge2.y - edge1.y * edge2.x;
    
    area += Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) * 0.5;
  }

  return area;
}

/**
 * Calculate face center
 */
export function calculateFaceCenter(face: Face, vertices: Vertex[]): { x: number; y: number; z: number } {
  const faceVertices = face.vertices.map((index: number) => vertices[index]).filter(Boolean);
  
  if (faceVertices.length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  const center = {
    x: faceVertices.reduce((sum: number, v: Vertex) => sum + v.x, 0) / faceVertices.length,
    y: faceVertices.reduce((sum: number, v) => sum + v.y, 0) / faceVertices.length,
    z: faceVertices.reduce((sum: number, v) => sum + v.z, 0) / faceVertices.length
  };

  return center;
}

/**
 * Validate face normals
 */
export function validateFaceNormals(faces: Face[], vertices: Vertex[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const faceVertices = face.vertices.map((index: number) => vertices[index]).filter(Boolean);
    
    if (faceVertices.length < 3) continue;

    const calculatedNormal = calculateFaceNormal(face, vertices);
    const faceNormal = face.normal;

    if (faceNormal) {
      // Check if normal is normalized
      const length = Math.sqrt(
        faceNormal.x * faceNormal.x +
        faceNormal.y * faceNormal.y +
        faceNormal.z * faceNormal.z
      );

      if (Math.abs(length - 1) > 0.01) {
        result.warnings.push(`Face ${i} normal is not normalized (length: ${length})`);
      }

      // Check if normal matches calculated normal
      const dotProduct = Math.abs(
        calculatedNormal.x * faceNormal.x +
        calculatedNormal.y * faceNormal.y +
        calculatedNormal.z * faceNormal.z
      );

      if (dotProduct < 0.9) {
        result.warnings.push(`Face ${i} normal doesn't match calculated normal`);
      }
    } else {
      result.warnings.push(`Face ${i} has no normal`);
    }
  }

  return result;
} 