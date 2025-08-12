/**
 * Mesh validation functions for three-edit
 * Pure functions for validating mesh integrity and topology
 */

import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Edge } from '../core/Edge';
import { ValidationResult } from './types';
import { validateGeometry } from './geometry';
import { validateUVs, validateNormals } from '../helpers/validation';

/**
 * Validate complete mesh topology and geometry
 */
export function validateMesh(
  vertices: Vertex[],
  faces: Face[],
  edges: Edge[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Validate individual components
  const topologyResult = validateTopology(vertices, faces, edges);
  const geometryResult = validateGeometry(vertices, faces);
  const uvResult = validateUVs(vertices);
  const normalResult = validateNormals(vertices);

  // Combine results
  result.isValid = topologyResult.isValid && geometryResult.isValid && 
                   uvResult.isValid && normalResult.isValid;
  result.errors.push(...topologyResult.errors, ...geometryResult.errors, 
                     ...uvResult.errors, ...normalResult.errors);
  result.warnings.push(...topologyResult.warnings, ...geometryResult.warnings, 
                       ...uvResult.warnings, ...normalResult.warnings);

  return result;
}

/**
 * Validate mesh topology (vertex-face-edge relationships)
 */
export function validateTopology(
  vertices: Vertex[],
  faces: Face[],
  edges: Edge[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check for orphaned vertices
  const orphanedVertices = findOrphanedVertices(vertices, faces);
  if (orphanedVertices.length > 0) {
    result.warnings.push(`Found ${orphanedVertices.length} orphaned vertices: ${orphanedVertices.join(', ')}`);
  }

  // Check for invalid face references
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    
    // Check if face has enough vertices
    if (face.vertices.length < 3) {
      result.isValid = false;
      result.errors.push(`Face ${i} has less than 3 vertices: ${face.vertices.length}`);
      continue;
    }

    // Check if all vertex indices are valid
    for (const vertexIndex of face.vertices) {
      if (vertexIndex < 0 || vertexIndex >= vertices.length) {
        result.isValid = false;
        result.errors.push(`Face ${i} references invalid vertex index: ${vertexIndex}`);
      }
    }

    // Check for duplicate vertices in face
    const uniqueVertices = new Set(face.vertices);
    if (uniqueVertices.size !== face.vertices.length) {
      result.isValid = false;
      result.errors.push(`Face ${i} has duplicate vertices`);
    }
  }

  // Check edge validity
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    
    if (edge.v1 < 0 || edge.v1 >= vertices.length) {
      result.isValid = false;
      result.errors.push(`Edge ${i} references invalid vertex v1: ${edge.v1}`);
    }
    
    if (edge.v2 < 0 || edge.v2 >= vertices.length) {
      result.isValid = false;
      result.errors.push(`Edge ${i} references invalid vertex v2: ${edge.v2}`);
    }
    
    if (edge.v1 === edge.v2) {
      result.isValid = false;
      result.errors.push(`Edge ${i} has identical vertices: ${edge.v1}`);
    }
  }

  return result;
}

/**
 * Find orphaned vertices (not used by any face)
 */
export function findOrphanedVertices(vertices: Vertex[], faces: Face[]): number[] {
  const usedVertices = new Set<number>();
  
  // Collect all vertex indices used by faces
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      usedVertices.add(vertexIndex);
    }
  }
  
  // Find vertices not used by any face
  const orphaned: number[] = [];
  for (let i = 0; i < vertices.length; i++) {
    if (!usedVertices.has(i)) {
      orphaned.push(i);
    }
  }
  
  return orphaned;
}

/**
 * Merge vertices that are very close to each other
 */
export function mergeVerticesWithFaces(
  vertices: Vertex[],
  faces: Face[],
  tolerance: number = 0.001
): { newVertices: Vertex[]; newFaces: Face[]; mergedCount: number } {
  const newVertices: Vertex[] = [];
  const vertexMap = new Map<number, number>(); // old index -> new index
  let mergedCount = 0;

  // Find unique vertices
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    let found = false;

    // Check if this vertex is close to any existing vertex
    for (let j = 0; j < newVertices.length; j++) {
      const existingVertex = newVertices[j];
      const distance = Math.sqrt(
        Math.pow(vertex.x - existingVertex.x, 2) +
        Math.pow(vertex.y - existingVertex.y, 2) +
        Math.pow(vertex.z - existingVertex.z, 2)
      );

      if (distance <= tolerance) {
        vertexMap.set(i, j);
        mergedCount++;
        found = true;
        break;
      }
    }

    if (!found) {
      vertexMap.set(i, newVertices.length);
      newVertices.push(vertex.clone());
    }
  }

  // Update faces with new vertex indices
  const newFaces: Face[] = [];
  for (const face of faces) {
    const newVertexIndices = face.vertices.map(oldIndex => vertexMap.get(oldIndex)!);
    const newFace = new Face(newVertexIndices, face.edges, {
      materialIndex: face.materialIndex,
      faceVertexUvs: face.faceVertexUvs,
      userData: face.userData
    });
    newFaces.push(newFace);
  }

  return { newVertices, newFaces, mergedCount };
} 