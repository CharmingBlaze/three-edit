/**
 * Triangulation Operations
 * Pure functions for triangulating polygons and complex geometry
 */

import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Vector3 } from 'three';
import { 
  distanceSquared3D, 
  isValidTriangle, 
  pointInTriangle,
  calculateTriangleArea 
} from '../math';

/**
 * Triangulation result with success status
 */
export interface TriangulationResult {
  success: boolean;
  triangles?: Face[];
  error?: string;
}

/**
 * Triangulate a polygon (face with more than 3 vertices)
 * Uses ear clipping algorithm for simple polygons
 * @param vertices Array of all vertices in the mesh
 * @param face Face to triangulate
 * @returns Array of triangular faces
 */
export function triangulatePolygon(vertices: Vertex[], face: Face): Face[] {
  if (face.vertices.length <= 3) {
    return [face.clone()];
  }
  
  const triangles: Face[] = [];
  const faceVertices = face.vertices.map(index => vertices[index]).filter(Boolean);
  
  if (faceVertices.length < 3) {
    return [];
  }
  
  // Simple ear clipping triangulation
  const remainingVertices = [...faceVertices];
  
  while (remainingVertices.length > 3) {
    let earFound = false;
    
    for (let i = 0; i < remainingVertices.length; i++) {
      const prev = remainingVertices[(i - 1 + remainingVertices.length) % remainingVertices.length];
      const current = remainingVertices[i];
      const next = remainingVertices[(i + 1) % remainingVertices.length];
      
      // Check if this is an ear (no other vertices inside the triangle)
      const isEar = !hasVerticesInsideTriangle(remainingVertices, prev, current, next, i);
      
      if (isEar) {
        // Create triangle from these three vertices
        const triangleVertices = [prev, current, next];
        const triangleIndices = triangleVertices.map(v => 
          face.vertices.find((_, index) => vertices[index] === v) ?? 0
        );
        
        const triangle = new Face(
          triangleIndices,
          [], // Edges will be updated by the mesh
          {
            materialIndex: face.materialIndex,
            normal: face.normal?.clone(),
            userData: { ...face.userData }
          }
        );
        
        triangles.push(triangle);
        
        // Remove the current vertex (ear)
        remainingVertices.splice(i, 1);
        earFound = true;
        break;
      }
    }
    
    if (!earFound) {
      // Fallback: create triangles from remaining vertices
      break;
    }
  }
  
  // Add the final triangle
  if (remainingVertices.length === 3) {
    const triangleVertices = remainingVertices;
    const triangleIndices = triangleVertices.map(v => 
      face.vertices.find((_, index) => vertices[index] === v) ?? 0
    );
    
    const triangle = new Face(
      triangleIndices,
      [], // Edges will be updated by the mesh
      {
        materialIndex: face.materialIndex,
        normal: face.normal?.clone(),
        userData: { ...face.userData }
      }
    );
    
    triangles.push(triangle);
  }
  
  return triangles;
}

/**
 * Check if any vertices are inside a triangle
 * @param vertices All vertices to check
 * @param a First triangle vertex
 * @param b Second triangle vertex
 * @param c Third triangle vertex
 * @param excludeIndex Index to exclude from checking
 * @returns True if any vertex is inside the triangle
 */
function hasVerticesInsideTriangle(
  vertices: Vertex[],
  a: Vertex,
  b: Vertex,
  c: Vertex,
  excludeIndex: number
): boolean {
  const va = new Vector3(a.x, a.y, a.z);
  const vb = new Vector3(b.x, b.y, b.z);
  const vc = new Vector3(c.x, c.y, c.z);
  
  for (let i = 0; i < vertices.length; i++) {
    if (i === excludeIndex) continue;
    
    const vertex = vertices[i];
    const point = new Vector3(vertex.x, vertex.y, vertex.z);
    
    if (pointInTriangle(point, va, vb, vc)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Triangulate a polygon using fan triangulation (simpler but less optimal)
 * @param vertices Array of all vertices in the mesh
 * @param face Face to triangulate
 * @returns Array of triangular faces
 */
export function triangulatePolygonFan(vertices: Vertex[], face: Face): Face[] {
  if (face.vertices.length <= 3) {
    return [face.clone()];
  }
  
  const triangles: Face[] = [];
  const faceVertices = face.vertices.map(index => vertices[index]).filter(Boolean);
  
  if (faceVertices.length < 3) {
    return [];
  }
  
  // Use the first vertex as the center of the fan
  const centerVertex = faceVertices[0];
  const centerIndex = face.vertices[0];
  
  // Create triangles from the center to each pair of adjacent vertices
  for (let i = 1; i < faceVertices.length - 1; i++) {
    const v1 = faceVertices[i];
    const v2 = faceVertices[i + 1];
    
    const v1Index = face.vertices[i];
    const v2Index = face.vertices[i + 1];
    
    const triangle = new Face(
      [centerIndex, v1Index, v2Index],
      [], // Edges will be updated by the mesh
      {
        materialIndex: face.materialIndex,
        normal: face.normal?.clone(),
        userData: { ...face.userData }
      }
    );
    
    triangles.push(triangle);
  }
  
  return triangles;
}

/**
 * Triangulate a polygon using strip triangulation
 * @param vertices Array of all vertices in the mesh
 * @param face Face to triangulate
 * @returns Array of triangular faces
 */
export function triangulatePolygonStrip(vertices: Vertex[], face: Face): Face[] {
  if (face.vertices.length <= 3) {
    return [face.clone()];
  }
  
  const triangles: Face[] = [];
  const faceVertices = face.vertices.map(index => vertices[index]).filter(Boolean);
  
  if (faceVertices.length < 3) {
    return [];
  }
  
  // Create triangles in a strip pattern
  for (let i = 0; i < faceVertices.length - 2; i++) {
    const v1 = faceVertices[i];
    const v2 = faceVertices[i + 1];
    const v3 = faceVertices[i + 2];
    
    const v1Index = face.vertices[i];
    const v2Index = face.vertices[i + 1];
    const v3Index = face.vertices[i + 2];
    
    const triangle = new Face(
      [v1Index, v2Index, v3Index],
      [], // Edges will be updated by the mesh
      {
        materialIndex: face.materialIndex,
        normal: face.normal?.clone(),
        userData: { ...face.userData }
      }
    );
    
    triangles.push(triangle);
  }
  
  return triangles;
}

/**
 * Triangulate a quad into two triangles
 * @param vertices Array of all vertices in the mesh
 * @param face Quad face to triangulate
 * @returns Array of two triangular faces
 */
export function triangulateQuad(vertices: Vertex[], face: Face): Face[] {
  if (face.vertices.length !== 4) {
    return triangulatePolygon(vertices, face);
  }
  
  const faceVertices = face.vertices.map(index => vertices[index]).filter(Boolean);
  
  if (faceVertices.length !== 4) {
    return [];
  }
  
  // Create two triangles from the quad
  const v0 = faceVertices[0];
  const v1 = faceVertices[1];
  const v2 = faceVertices[2];
  const v3 = faceVertices[3];
  
  const v0Index = face.vertices[0];
  const v1Index = face.vertices[1];
  const v2Index = face.vertices[2];
  const v3Index = face.vertices[3];
  
  // First triangle: v0, v1, v2
  const triangle1 = new Face(
    [v0Index, v1Index, v2Index],
    [], // Edges will be updated by the mesh
    {
      materialIndex: face.materialIndex,
      normal: face.normal?.clone(),
      userData: { ...face.userData }
    }
  );
  
  // Second triangle: v0, v2, v3
  const triangle2 = new Face(
    [v0Index, v2Index, v3Index],
    [], // Edges will be updated by the mesh
    {
      materialIndex: face.materialIndex,
      normal: face.normal?.clone(),
      userData: { ...face.userData }
    }
  );
  
  return [triangle1, triangle2];
}

/**
 * Triangulate all faces in a mesh
 * @param mesh Mesh to triangulate
 * @returns New mesh with all faces triangulated
 */
export function triangulateMesh(mesh: any): any {
  const newFaces: Face[] = [];
  
  for (const face of mesh.faces) {
    const triangles = triangulatePolygon(mesh.vertices, face);
    newFaces.push(...triangles);
  }
  
  return {
    ...mesh,
    faces: newFaces
  };
}

/**
 * Check if a face needs triangulation
 * @param face Face to check
 * @returns True if face has more than 3 vertices
 */
export function needsTriangulation(face: Face): boolean {
  return face.vertices.length > 3;
}

/**
 * Get the number of triangles needed to triangulate a face
 * @param face Face to check
 * @returns Number of triangles needed
 */
export function getTriangulationCount(face: Face): number {
  if (face.vertices.length <= 3) return 1;
  return face.vertices.length - 2;
} 