/**
 * Normal calculation utility functions for three-edit
 * Pure functions for calculating face normals and smooth vertex normals
 */

import { Vector3 } from 'three';
import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { EditableMesh } from '../core/EditableMesh';
import { isValidTriangle, triangleArea } from './math';

export interface NormalGenerationParams {
  smooth: boolean;
  angleThreshold?: number;
  areaWeighted?: boolean;
}

/**
 * Calculate face normal from three vertices
 */
export function calculateFaceNormal(v1: Vertex, v2: Vertex, v3: Vertex): Vector3 {
  const edge1 = new Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
  const edge2 = new Vector3(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
  
  const normal = new Vector3().crossVectors(edge1, edge2);
  normal.normalize();
  
  return normal;
}

/**
 * Calculate face normal from vertex positions
 */
export function calculateFaceNormalFromPositions(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number },
  pos3: { x: number; y: number; z: number }
): Vector3 {
  const edge1 = new Vector3(pos2.x - pos1.x, pos2.y - pos1.y, pos2.z - pos1.z);
  const edge2 = new Vector3(pos3.x - pos1.x, pos3.y - pos1.y, pos3.z - pos1.z);
  
  const normal = new Vector3().crossVectors(edge1, edge2);
  normal.normalize();
  
  return normal;
}

/**
 * Calculate face normal for a face with any number of vertices
 */
export function calculateFaceNormalForFace(face: Face, vertices: Vertex[]): Vector3 {
  if (face.vertices.length < 3) {
    return new Vector3(0, 0, 1); // Default normal
  }
  
  // For faces with more than 3 vertices, use the first three vertices
  const v1 = vertices[face.vertices[0]];
  const v2 = vertices[face.vertices[1]];
  const v3 = vertices[face.vertices[2]];
  
  if (!v1 || !v2 || !v3) {
    return new Vector3(0, 0, 1); // Default normal
  }
  
  return calculateFaceNormal(v1, v2, v3);
}

/**
 * Calculate smooth vertex normals by averaging face normals
 */
function calculateSmoothVertexNormals(
  mesh: EditableMesh,
  params: NormalGenerationParams
): void {
  const { vertices, faces } = mesh;
  // Initialize normal accumulators for each vertex
  const normalAccumulators: Vector3[] = vertices.map(() => new Vector3(0, 0, 0));
  const weights: number[] = vertices.map(() => 0);

  // Calculate face normals and accumulate them
  for (const face of faces) {
    if (face.vertices.length < 3) continue;

    const faceNormal = calculateFaceNormalForFace(face, vertices);
    let faceWeight = 1.0;

    // Use area-weighted normals if requested
    if (params.areaWeighted && face.vertices.length >= 3) {
      const v1 = vertices[face.vertices[0]];
      const v2 = vertices[face.vertices[1]];
      const v3 = vertices[face.vertices[2]];

      if (v1 && v2 && v3) {
        faceWeight = triangleArea(
          new Vector3(v1.x, v1.y, v1.z),
          new Vector3(v2.x, v2.y, v2.z),
          new Vector3(v3.x, v3.y, v3.z)
        );
      }
    }

    // Accumulate face normal to each vertex
    for (const vertexIndex of face.vertices) {
      if (vertexIndex >= 0 && vertexIndex < vertices.length) {
        normalAccumulators[vertexIndex].add(
          faceNormal.clone().multiplyScalar(faceWeight)
        );
        weights[vertexIndex] += faceWeight;
      }
    }
  }

  // Normalize accumulated normals
  for (let i = 0; i < vertices.length; i++) {
    if (weights[i] > 0) {
      normalAccumulators[i].normalize();
      vertices[i].normal = normalAccumulators[i];
    } else {
      vertices[i].normal = new Vector3(0, 0, 1); // Default normal
    }
  }
}

/**
 * Calculate flat vertex normals (each vertex gets the face normal)
 */
function calculateFlatVertexNormals(mesh: EditableMesh): void {
  const { vertices, faces } = mesh;
  for (const face of faces) {
    if (face.vertices.length < 3) continue;

    const faceNormal = calculateFaceNormalForFace(face, vertices);

    // Assign face normal to each vertex of the face
    for (const vertexIndex of face.vertices) {
      if (vertexIndex >= 0 && vertexIndex < vertices.length) {
        vertices[vertexIndex].normal = faceNormal.clone();
      }
    }
  }
}

/**
 * Calculate angle-weighted vertex normals (better for sharp edges)
 */
function calculateAngleWeightedNormals(vertices: Vertex[], faces: Face[]): void {
  // Initialize normal accumulators for each vertex
  const normalAccumulators: Vector3[] = vertices.map(() => new Vector3(0, 0, 0));
  
  // Calculate face normals and accumulate them with angle weights
  for (const face of faces) {
    if (face.vertices.length < 3) continue;
    
    const faceNormal = calculateFaceNormalForFace(face, vertices);
    
    // For each vertex in the face, calculate the angle at that vertex
    for (let i = 0; i < face.vertices.length; i++) {
      const vertexIndex = face.vertices[i];
      if (vertexIndex < 0 || vertexIndex >= vertices.length) continue;
      
      const v1 = vertices[face.vertices[i]];
      const v2 = vertices[face.vertices[(i + 1) % face.vertices.length]];
      const v3 = vertices[face.vertices[(i + 2) % face.vertices.length]];
      
      if (v1 && v2 && v3) {
        const angle = calculateVertexAngle(v1, v2, v3);
        normalAccumulators[vertexIndex].add(faceNormal.clone().multiplyScalar(angle));
      }
    }
  }
  
  // Normalize accumulated normals
  for (let i = 0; i < vertices.length; i++) {
    if (normalAccumulators[i].lengthSq() > 0) {
      normalAccumulators[i].normalize();
      vertices[i].normal = normalAccumulators[i];
    } else {
      vertices[i].normal = new Vector3(0, 0, 1); // Default normal
    }
  }
}

/**
 * Calculate the angle at a vertex between two edges
 */
function calculateVertexAngle(v1: Vertex, v2: Vertex, v3: Vertex): number {
  const edge1 = new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  const edge2 = new Vector3(v3.x - v2.x, v3.y - v2.y, v3.z - v2.z);
  
  edge1.normalize();
  edge2.normalize();
  
  const dot = edge1.dot(edge2);
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
  
  return angle;
}

/**
 * Main function to calculate normals based on parameters
 */
export function calculateNormals(
  mesh: EditableMesh,
  params: NormalGenerationParams
): void {
  if (params.smooth) {
    calculateSmoothVertexNormals(mesh, params);
  } else {
    calculateFlatVertexNormals(mesh);
  }
}

/**
 * Calculate normals for a specific face
 */
export function calculateFaceNormals(faces: Face[], vertices: Vertex[]): void {
  for (const face of faces) {
    if (face.vertices.length >= 3) {
      const normal = calculateFaceNormalForFace(face, vertices);
      face.normal = normal;
    }
  }
}

/**
 * Check if a normal is valid (not zero length)
 */
export function isValidNormal(normal: Vector3, tolerance: number = 1e-6): boolean {
  return normal.lengthSq() > tolerance * tolerance;
}

/**
 * Get normal statistics for a mesh
 */
export function getNormalStatistics(vertices: Vertex[]): {
  total: number;
  valid: number;
  invalid: number;
  averageLength: number;
} {
  const total = vertices.length;
  let valid = 0;
  let totalLength = 0;
  
  for (const vertex of vertices) {
    if (vertex.normal && isValidNormal(vertex.normal)) {
      valid++;
      totalLength += vertex.normal.length();
    }
  }
  
  const invalid = total - valid;
  const averageLength = valid > 0 ? totalLength / valid : 0;
  
  return {
    total,
    valid,
    invalid,
    averageLength
  };
}

/**
 * Fix invalid normals by setting them to a default value
 */
export function fixInvalidNormals(vertices: Vertex[], defaultNormal: Vector3 = new Vector3(0, 0, 1)): number {
  let fixed = 0;
  
  for (const vertex of vertices) {
    if (!vertex.normal || !isValidNormal(vertex.normal)) {
      vertex.normal = defaultNormal.clone();
      fixed++;
    }
  }
  
  return fixed;
}

/**
 * Calculate normals for a triangle
 */
export function calculateTriangleNormals(
  v1: Vertex,
  v2: Vertex,
  v3: Vertex,
  smooth: boolean = false
): { v1Normal: Vector3; v2Normal: Vector3; v3Normal: Vector3 } {
  const faceNormal = calculateFaceNormal(v1, v2, v3);
  
  if (smooth) {
    // For smooth normals, each vertex gets the face normal
    return {
      v1Normal: faceNormal.clone(),
      v2Normal: faceNormal.clone(),
      v3Normal: faceNormal.clone()
    };
  } else {
    // For flat normals, each vertex gets the face normal
    return {
      v1Normal: faceNormal.clone(),
      v2Normal: faceNormal.clone(),
      v3Normal: faceNormal.clone()
    };
  }
} 

/**
 * Calculate smooth normals for vertices and faces
 * This is the main function that tests are looking for
 */
export function calculateSmoothNormals(
  vertices: Vertex[],
  faces: Face[],
  options: NormalGenerationParams = { smooth: true }
): void {
  // Create a temporary mesh for the calculation
  const tempMesh = new EditableMesh();
  tempMesh.vertices = vertices;
  tempMesh.faces = faces;
  
  // Use the existing calculateNormals function
  calculateNormals(tempMesh, options);
} 