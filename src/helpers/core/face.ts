/**
 * Core face manipulation helpers
 * Pure, composable functions for face operations
 */

import { Vector3 } from 'three';
import { Face } from '../../core/Face';
import { Vertex } from '../../core/Vertex';
import { Edge } from '../../core/Edge';
import { UVCoord } from '../../uv/types';
import { UserData } from '../../types/core';

/**
 * Create a new face with optional attributes
 */
export function createFace(
  vertices: number[] = [],
  edges: number[] = [],
  options: {
    faceVertexUvs?: UVCoord[];
    materialIndex?: number;
    normal?: Vector3;
    userData?: UserData;
  } = {}
): Face {
  return new Face(vertices, edges, options);
}

/**
 * Clone a face with optional modifications
 */
export function cloneFace(
  face: Face,
  modifications: Partial<{
    vertices: number[];
    edges: number[];
    faceVertexUvs: UVCoord[];
    materialIndex: number;
    normal: Vector3;
    userData: UserData;
  }> = {}
): Face {
  return new Face(
    modifications.vertices ?? [...face.vertices],
    modifications.edges ?? [...face.edges],
    {
      faceVertexUvs: modifications.faceVertexUvs ?? [...(face.faceVertexUvs || [])],
      materialIndex: modifications.materialIndex ?? face.materialIndex,
      normal: modifications.normal ? modifications.normal.clone() : face.normal?.clone(),
      userData: modifications.userData ?? { ...face.userData }
    }
  );
}

/**
 * Get face vertices as Vertex objects
 */
export function getFaceVertices(
  face: Face,
  vertices: Vertex[]
): Vertex[] {
  return face.vertices.map(index => vertices[index]).filter(Boolean);
}

/**
 * Get face vertex positions as Vector3 array
 */
export function getFaceVertexPositions(
  face: Face,
  vertices: Vertex[]
): Vector3[] {
  return getFaceVertices(face, vertices).map(vertex => 
    new Vector3(vertex.x, vertex.y, vertex.z)
  );
}

/**
 * Calculate face centroid
 */
export function calculateFaceCentroid(
  face: Face,
  vertices: Vertex[]
): Vector3 {
  const faceVertices = getFaceVertices(face, vertices);
  if (faceVertices.length === 0) {
    return new Vector3(0, 0, 0);
  }

  const centroid = new Vector3(0, 0, 0);
  for (const vertex of faceVertices) {
    centroid.add(new Vector3(vertex.x, vertex.y, vertex.z));
  }
  centroid.divideScalar(faceVertices.length);

  return centroid;
}

/**
 * Calculate face normal
 */
export function calculateFaceNormal(
  face: Face,
  vertices: Vertex[]
): Vector3 {
  const faceVertices = getFaceVertices(face, vertices);
  
  if (faceVertices.length < 3) {
    return new Vector3(0, 0, 1); // Default normal
  }

  // Use first three vertices to calculate normal
  const v0 = faceVertices[0];
  const v1 = faceVertices[1];
  const v2 = faceVertices[2];

  const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
  const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);

  const normal = new Vector3();
  normal.crossVectors(edge1, edge2);
  normal.normalize();

  return normal;
}

/**
 * Calculate face area
 */
export function calculateFaceArea(
  face: Face,
  vertices: Vertex[]
): number {
  const faceVertices = getFaceVertices(face, vertices);
  
  if (faceVertices.length < 3) {
    return 0;
  }

  // For triangles, use cross product method
  if (faceVertices.length === 3) {
    const v0 = faceVertices[0];
    const v1 = faceVertices[1];
    const v2 = faceVertices[2];

    const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
    const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);

    const cross = new Vector3();
    cross.crossVectors(edge1, edge2);
    
    return cross.length() * 0.5;
  }

  // For polygons, triangulate and sum areas
  // This is a simplified approach - for production use a proper triangulation
  let area = 0;
  const centroid = calculateFaceCentroid(face, vertices);
  
  for (let i = 0; i < faceVertices.length; i++) {
    const v1 = faceVertices[i];
    const v2 = faceVertices[(i + 1) % faceVertices.length];
    
    const edge1 = new Vector3(v1.x - centroid.x, v1.y - centroid.y, v1.z - centroid.z);
    const edge2 = new Vector3(v2.x - centroid.x, v2.y - centroid.y, v2.z - centroid.z);
    
    const cross = new Vector3();
    cross.crossVectors(edge1, edge2);
    area += cross.length() * 0.5;
  }

  return area;
}

/**
 * Check if a face contains a specific vertex
 */
export function faceContainsVertex(face: Face, vertexIndex: number): boolean {
  return face.vertices.includes(vertexIndex);
}

/**
 * Check if a face contains a specific edge
 */
export function faceContainsEdge(face: Face, edgeIndex: number): boolean {
  return face.edges.includes(edgeIndex);
}

/**
 * Get face edges as Edge objects
 */
export function getFaceEdges(
  face: Face,
  edges: Edge[]
): Edge[] {
  return face.edges.map(index => edges[index]).filter(Boolean);
}

/**
 * Create edges for a face from its vertices
 */
export function createFaceEdges(face: Face): Edge[] {
  const faceEdges: Edge[] = [];
  
  for (let i = 0; i < face.vertices.length; i++) {
    const v1 = face.vertices[i];
    const v2 = face.vertices[(i + 1) % face.vertices.length];
    faceEdges.push(new Edge(v1, v2));
  }
  
  return faceEdges;
}

/**
 * Check if two faces share an edge
 */
export function facesShareEdge(
  face1: Face,
  face2: Face,
  edges: Edge[]
): boolean {
  const face1Edges = getFaceEdges(face1, edges);
  const face2Edges = getFaceEdges(face2, edges);
  
  for (const edge1 of face1Edges) {
    for (const edge2 of face2Edges) {
      if (edge1.v1 === edge2.v1 && edge1.v2 === edge2.v2 ||
          edge1.v1 === edge2.v2 && edge1.v2 === edge2.v1) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Find faces that share an edge with a given face
 */
export function findAdjacentFaces(
  face: Face,
  allFaces: Face[],
  edges: Edge[]
): Face[] {
  return allFaces.filter(otherFace => 
    otherFace !== face && facesShareEdge(face, otherFace, edges)
  );
}

/**
 * Check if a face is a triangle
 */
export function isTriangle(face: Face): boolean {
  return face.vertices.length === 3;
}

/**
 * Check if a face is a quad
 */
export function isQuad(face: Face): boolean {
  return face.vertices.length === 4;
}

/**
 * Check if a face is a polygon (more than 4 vertices)
 */
export function isPolygon(face: Face): boolean {
  return face.vertices.length > 4;
}

/**
 * Get face perimeter
 */
export function calculateFacePerimeter(
  face: Face,
  vertices: Vertex[]
): number {
  const faceVertices = getFaceVertices(face, vertices);
  if (faceVertices.length < 2) return 0;

  let perimeter = 0;
  for (let i = 0; i < faceVertices.length; i++) {
    const v1 = faceVertices[i];
    const v2 = faceVertices[(i + 1) % faceVertices.length];
    
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    const dz = v2.z - v1.z;
    
    perimeter += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  return perimeter;
}

/**
 * Reverse face vertex order (flip normal)
 */
export function reverseFace(face: Face): Face {
  return cloneFace(face, {
    vertices: [...face.vertices].reverse(),
    edges: [...face.edges].reverse(),
    faceVertexUvs: face.faceVertexUvs ? [...face.faceVertexUvs].reverse() : undefined
  });
}

/**
 * Check if face vertices are in clockwise order (when viewed from outside)
 */
export function isFaceClockwise(
  face: Face,
  vertices: Vertex[]
): boolean {
  const faceVertices = getFaceVertices(face, vertices);
  if (faceVertices.length < 3) return false;

  // Calculate signed area using shoelace formula
  let signedArea = 0;
  for (let i = 0; i < faceVertices.length; i++) {
    const v1 = faceVertices[i];
    const v2 = faceVertices[(i + 1) % faceVertices.length];
    signedArea += (v2.x - v1.x) * (v2.y + v1.y);
  }

  return signedArea > 0;
}

/**
 * Ensure face vertices are in counter-clockwise order
 */
export function ensureCounterClockwise(
  face: Face,
  vertices: Vertex[]
): Face {
  if (isFaceClockwise(face, vertices)) {
    return reverseFace(face);
  }
  return cloneFace(face);
}

/**
 * Check if a point is inside a face (2D projection)
 */
export function isPointInFace(
  point: Vector3,
  face: Face,
  vertices: Vertex[]
): boolean {
  const faceVertices = getFaceVertices(face, vertices);
  if (faceVertices.length < 3) return false;

  // Project to 2D and use ray casting algorithm
  // This is a simplified implementation - for production use a robust point-in-polygon test
  
  const faceNormal = calculateFaceNormal(face, vertices);
  const up = new Vector3(0, 1, 0);
  
  // Choose projection plane based on normal
  let axis1: Vector3, axis2: Vector3;
  if (Math.abs(faceNormal.dot(up)) < 0.9) {
    axis1 = new Vector3(1, 0, 0);
    axis2 = new Vector3(0, 1, 0);
  } else {
    axis1 = new Vector3(1, 0, 0);
    axis2 = new Vector3(0, 0, 1);
  }

  // Project vertices to 2D
  const points2D = faceVertices.map(vertex => ({
    x: vertex.x * axis1.x + vertex.y * axis1.y + vertex.z * axis1.z,
    y: vertex.x * axis2.x + vertex.y * axis2.y + vertex.z * axis2.z
  }));

  const point2D = {
    x: point.x * axis1.x + point.y * axis1.y + point.z * axis1.z,
    y: point.x * axis2.x + point.y * axis2.y + point.z * axis2.z
  };

  // Ray casting algorithm
  let inside = false;
  for (let i = 0, j = points2D.length - 1; i < points2D.length; j = i++) {
    if (((points2D[i].y > point2D.y) !== (points2D[j].y > point2D.y)) &&
        (point2D.x < (points2D[j].x - points2D[i].x) * (point2D.y - points2D[i].y) / (points2D[j].y - points2D[i].y) + points2D[i].x)) {
      inside = !inside;
    }
  }

  return inside;
} 