/**
 * Geometry Merging Operations
 * Pure functions for merging vertices, faces, and geometry optimization
 */

import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Vector3 } from 'three';
import { distanceSquared3D, EPSILON } from '../math';

/**
 * Merge result with success status and mapping information
 */
export interface MergeResult {
  success: boolean;
  newVertices?: Vertex[];
  newFaces?: Face[];
  vertexMap?: number[];
  error?: string;
}

/**
 * Merge vertices that are close to each other
 * @param vertices Array of vertices to merge
 * @param faces Array of faces to update
 * @param threshold Distance threshold for merging (default: 1e-6)
 * @returns Merged vertices and faces with vertex mapping
 */
export function mergeVertices(
  vertices: Vertex[],
  faces: Face[],
  threshold: number = EPSILON
): MergeResult {
  try {
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
    
    // Update faces with new vertex indices
    const newFaces: Face[] = [];
    for (const face of faces) {
      const newVertexIndices = face.vertices.map(oldIndex => vertexMap[oldIndex]);
      
      // Remove duplicate consecutive vertices
      const uniqueVertices: number[] = [];
      for (let i = 0; i < newVertexIndices.length; i++) {
        const current = newVertexIndices[i];
        const next = newVertexIndices[(i + 1) % newVertexIndices.length];
        
        if (current !== next) {
          uniqueVertices.push(current);
        }
      }
      
      // Only create face if it has at least 3 vertices
      if (uniqueVertices.length >= 3) {
        const newFace = new Face(
          uniqueVertices,
          [], // Edges will be updated by the mesh
          {
            materialIndex: face.materialIndex,
            normal: face.normal?.clone(),
            userData: { ...face.userData }
          }
        );
        newFaces.push(newFace);
      }
    }
    
    return {
      success: true,
      newVertices,
      newFaces,
      vertexMap
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during vertex merging'
    };
  }
}

/**
 * Merge faces that share the same vertices
 * @param faces Array of faces to merge
 * @param threshold Distance threshold for vertex comparison
 * @returns Merged faces
 */
export function mergeFaces(faces: Face[], threshold: number = EPSILON): Face[] {
  const mergedFaces: Face[] = [];
  const processed = new Set<number>();
  
  for (let i = 0; i < faces.length; i++) {
    if (processed.has(i)) continue;
    
    const currentFace = faces[i];
    const similarFaces = [currentFace];
    processed.add(i);
    
    // Find faces with similar vertices
    for (let j = i + 1; j < faces.length; j++) {
      if (processed.has(j)) continue;
      
      const otherFace = faces[j];
      if (facesShareVertices(currentFace, otherFace, threshold)) {
        similarFaces.push(otherFace);
        processed.add(j);
      }
    }
    
    // Merge similar faces
    const mergedFace = mergeSimilarFaces(similarFaces);
    if (mergedFace) {
      mergedFaces.push(mergedFace);
    }
  }
  
  return mergedFaces;
}

/**
 * Check if two faces share vertices
 * @param face1 First face
 * @param face2 Second face
 * @param threshold Distance threshold for vertex comparison
 * @returns True if faces share vertices
 */
function facesShareVertices(face1: Face, face2: Face, threshold: number): boolean {
  // This is a simplified check - in a real implementation you'd need to
  // compare actual vertex positions, not just indices
  const vertices1 = new Set(face1.vertices);
  const vertices2 = new Set(face2.vertices);
  
  for (const v1 of vertices1) {
    if (vertices2.has(v1)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Merge similar faces into a single face
 * @param faces Array of similar faces to merge
 * @returns Merged face or null if merging failed
 */
function mergeSimilarFaces(faces: Face[]): Face | null {
  if (faces.length === 0) return null;
  if (faces.length === 1) return faces[0].clone();
  
  // For now, return the first face
  // In a real implementation, you'd merge the vertex sets and create a new face
  return faces[0].clone();
}

/**
 * Merge duplicate edges in a mesh
 * @param edges Array of edges to merge
 * @param threshold Distance threshold for vertex comparison
 * @returns Merged edges
 */
export function mergeEdges(edges: any[], threshold: number = EPSILON): any[] {
  const mergedEdges: any[] = [];
  const processed = new Set<number>();
  
  for (let i = 0; i < edges.length; i++) {
    if (processed.has(i)) continue;
    
    const currentEdge = edges[i];
    const similarEdges = [currentEdge];
    processed.add(i);
    
    // Find edges with similar vertices
    for (let j = i + 1; j < edges.length; j++) {
      if (processed.has(j)) continue;
      
      const otherEdge = edges[j];
      if (edgesShareVertices(currentEdge, otherEdge, threshold)) {
        similarEdges.push(otherEdge);
        processed.add(j);
      }
    }
    
    // Keep the first edge (or merge them if needed)
    mergedEdges.push(similarEdges[0]);
  }
  
  return mergedEdges;
}

/**
 * Check if two edges share vertices
 * @param edge1 First edge
 * @param edge2 Second edge
 * @param threshold Distance threshold for vertex comparison
 * @returns True if edges share vertices
 */
function edgesShareVertices(edge1: any, edge2: any, threshold: number): boolean {
  // Simplified check - in real implementation you'd compare vertex positions
  return (edge1.vertices[0] === edge2.vertices[0] && edge1.vertices[1] === edge2.vertices[1]) ||
         (edge1.vertices[0] === edge2.vertices[1] && edge1.vertices[1] === edge2.vertices[0]);
}

/**
 * Merge close vertices in a mesh while preserving topology
 * @param mesh Mesh to optimize
 * @param threshold Distance threshold for merging
 * @returns Optimized mesh
 */
export function optimizeMesh(mesh: any, threshold: number = EPSILON): any {
  const mergeResult = mergeVertices(mesh.vertices, mesh.faces, threshold);
  
  if (!mergeResult.success) {
    return mesh;
  }
  
  return {
    ...mesh,
    vertices: mergeResult.newVertices || mesh.vertices,
    faces: mergeResult.newFaces || mesh.faces
  };
}

/**
 * Remove orphaned vertices (vertices not used by any face)
 * @param vertices Array of vertices
 * @param faces Array of faces
 * @returns Cleaned vertices and vertex mapping
 */
export function removeOrphanedVertices(vertices: Vertex[], faces: Face[]): {
  newVertices: Vertex[];
  vertexMap: number[];
} {
  const usedVertices = new Set<number>();
  
  // Find all vertices used by faces
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      usedVertices.add(vertexIndex);
    }
  }
  
  // Create new vertex array and mapping
  const newVertices: Vertex[] = [];
  const vertexMap: number[] = [];
  
  for (let i = 0; i < vertices.length; i++) {
    if (usedVertices.has(i)) {
      vertexMap[i] = newVertices.length;
      newVertices.push(vertices[i].clone());
    } else {
      vertexMap[i] = -1; // Mark as removed
    }
  }
  
  return { newVertices, vertexMap };
}

/**
 * Merge vertices based on UV coordinates
 * @param vertices Array of vertices
 * @param faces Array of faces
 * @param threshold UV distance threshold
 * @returns Merged vertices and faces
 */
export function mergeVerticesByUV(
  vertices: Vertex[],
  faces: Face[],
  threshold: number = EPSILON
): MergeResult {
  try {
    const vertexMap: number[] = [];
    const newVertices: Vertex[] = [];
    const thresholdSquared = threshold * threshold;
    
    // Create vertex map based on UV coordinates
    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      if (!vertex.uv) {
        vertexMap[i] = newVertices.length;
        newVertices.push(vertex.clone());
        continue;
      }
      
      let found = false;
      
      for (let j = 0; j < newVertices.length; j++) {
        const existingVertex = newVertices[j];
        if (!existingVertex.uv) continue;
        
        const uvDistance = Math.pow(vertex.uv.u - existingVertex.uv.u, 2) +
                          Math.pow(vertex.uv.v - existingVertex.uv.v, 2);
        
        if (uvDistance <= thresholdSquared) {
          vertexMap[i] = j;
          found = true;
          break;
        }
      }
      
      if (!found) {
        vertexMap[i] = newVertices.length;
        newVertices.push(vertex.clone());
      }
    }
    
    // Update faces with new vertex indices
    const newFaces: Face[] = [];
    for (const face of faces) {
      const newVertexIndices = face.vertices.map(oldIndex => vertexMap[oldIndex]);
      
      // Remove duplicate consecutive vertices
      const uniqueVertices: number[] = [];
      for (let i = 0; i < newVertexIndices.length; i++) {
        const current = newVertexIndices[i];
        const next = newVertexIndices[(i + 1) % newVertexIndices.length];
        
        if (current !== next) {
          uniqueVertices.push(current);
        }
      }
      
      // Only create face if it has at least 3 vertices
      if (uniqueVertices.length >= 3) {
        const newFace = new Face(
          uniqueVertices,
          [], // Edges will be updated by the mesh
          {
            materialIndex: face.materialIndex,
            normal: face.normal?.clone(),
            userData: { ...face.userData }
          }
        );
        newFaces.push(newFace);
      }
    }
    
    return {
      success: true,
      newVertices,
      newFaces,
      vertexMap
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during UV-based vertex merging'
    };
  }
} 