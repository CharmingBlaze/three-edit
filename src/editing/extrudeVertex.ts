import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

/**
 * Options for extruding a vertex
 */
export interface ExtrudeVertexOptions {
  /** Distance to extrude */
  distance?: number;
  /** Direction to extrude (if not specified, uses average normal) */
  direction?: Vector3;
  /** Whether to keep the original vertex */
  keepOriginal?: boolean;
  /** Whether to create edges to connected vertices */
  createEdges?: boolean;
}

/**
 * Extrudes a vertex of the mesh to create a new vertex and edges
 * @param mesh The mesh to modify
 * @param vertexIndex Index of the vertex to extrude
 * @param options Options for the extrusion
 * @returns The index of the newly created vertex, or -1 if the operation failed
 */
export function extrudeVertex(
  mesh: EditableMesh,
  vertexIndex: number,
  options: ExtrudeVertexOptions = {}
): number {
  // Default options
  const distance = options.distance ?? 1;
  const keepOriginal = options.keepOriginal ?? false;
  const createEdges = options.createEdges ?? true;
  
  // Get the vertex to extrude
  const vertex = mesh.getVertex(vertexIndex);
  if (!vertex) return -1;
  
  // Calculate extrusion direction
  let extrudeDirection: Vector3;
  if (options.direction) {
    extrudeDirection = options.direction.normalize();
  } else {
    // Calculate average normal of connected faces
    const connectedFaces = mesh.getFacesConnectedToVertex(vertexIndex);
    if (connectedFaces.length === 0) {
      // If no connected faces, use up direction
      extrudeDirection = new Vector3(0, 1, 0);
    } else {
      // Calculate average normal
      const averageNormal = new Vector3();
      for (const face of connectedFaces) {
        if (face.normal) {
          averageNormal.add(face.normal);
        }
      }
      extrudeDirection = averageNormal.normalize();
    }
  }
  
  // Create new vertex
  const newVertex = vertex.clone();
  newVertex.x += extrudeDirection.x * distance;
  newVertex.y += extrudeDirection.y * distance;
  newVertex.z += extrudeDirection.z * distance;
  
  // Add the new vertex to the mesh
  const newVertexIndex = mesh.addVertex(newVertex);
  
  // Create edge between original and new vertex
  if (createEdges) {
    mesh.addEdge(new Edge(vertexIndex, newVertexIndex));
  }
  
  // Remove the original vertex if not keeping it
  if (!keepOriginal) {
    mesh.removeVertex(vertexIndex);
    // Return the index of the new vertex (which may have shifted)
    return newVertexIndex - 1; // Since we removed the original vertex, indices shifted
  }
  
  return newVertexIndex;
}

/**
 * Extrudes multiple vertices at once
 * @param mesh The mesh to modify
 * @param vertexIndices Array of vertex indices to extrude
 * @param options Options for the extrusion
 * @returns Array of newly created vertex indices
 */
export function extrudeVertices(
  mesh: EditableMesh,
  vertexIndices: number[],
  options: ExtrudeVertexOptions = {}
): number[] {
  const newVertexIndices: number[] = [];
  
  for (const vertexIndex of vertexIndices) {
    const newVertexIndex = extrudeVertex(mesh, vertexIndex, options);
    if (newVertexIndex !== -1) {
      newVertexIndices.push(newVertexIndex);
    }
  }
  
  return newVertexIndices;
}

/**
 * Extrudes a vertex and creates a face with connected vertices
 * @param mesh The mesh to modify
 * @param vertexIndex Index of the vertex to extrude
 * @param options Options for the extrusion
 * @returns Object containing new vertex index and new face indices
 */
export function extrudeVertexWithFace(
  mesh: EditableMesh,
  vertexIndex: number,
  options: ExtrudeVertexOptions = {}
): { newVertexIndex: number; newFaceIndices: number[] } {
  // First extrude the vertex
  const newVertexIndex = extrudeVertex(mesh, vertexIndex, {
    ...options,
    createEdges: false // We'll create edges manually
  });
  
  if (newVertexIndex === -1) {
    return { newVertexIndex: -1, newFaceIndices: [] };
  }
  
  // Get connected vertices
  const connectedVertices = mesh.getVerticesConnectedToVertex(vertexIndex);
  const newFaceIndices: number[] = [];
  
  // Create faces between the original vertex, new vertex, and connected vertices
  for (let i = 0; i < connectedVertices.length; i++) {
    const nextVertex = connectedVertices[(i + 1) % connectedVertices.length];
    
    // Create edges for the face
    const edge1 = mesh.addEdge(new Edge(vertexIndex, newVertexIndex));
    const edge2 = mesh.addEdge(new Edge(newVertexIndex, nextVertex));
    const edge3 = mesh.addEdge(new Edge(nextVertex, connectedVertices[i]));
    const edge4 = mesh.addEdge(new Edge(connectedVertices[i], vertexIndex));
    
    // Create the face
    const newFaceIndex = mesh.addFace(
      new Face(
        [vertexIndex, newVertexIndex, nextVertex, connectedVertices[i]],
        [edge1, edge2, edge3, edge4]
      )
    );
    
    newFaceIndices.push(newFaceIndex);
  }
  
  return { newVertexIndex, newFaceIndices };
} 