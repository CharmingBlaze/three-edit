import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { calculateFaceNormal, calculateFaceCenter } from '../utils/mathUtils';

/**
 * Options for extruding a face
 */
export interface ExtrudeFaceOptions {
  /** Distance to extrude along the face normal */
  distance?: number;
  /** Scale factor for the extruded face */
  scale?: number | { x: number; y: number };
  /** Whether to keep the original face */
  keepOriginal?: boolean;
}

/**
 * Extrudes a face of the mesh
 * @param mesh The mesh to modify
 * @param faceIndex Index of the face to extrude
 * @param options Options for the extrusion
 * @returns The index of the newly created face, or -1 if the operation failed
 */
export function extrudeFace(
  mesh: EditableMesh,
  faceIndex: number,
  options: ExtrudeFaceOptions = {}
): number {
  // Default options
  const distance = options.distance ?? 1;
  const scale = options.scale ?? 1;
  const keepOriginal = options.keepOriginal ?? false;
  
  // Get the face to extrude
  const face = mesh.getFace(faceIndex);
  if (!face) return -1;
  
  // Calculate face normal if not already defined
  const faceNormal = face.normal ?? calculateFaceNormal(mesh, face);
  if (!faceNormal) return -1;
  
  // Create a normalized direction vector for extrusion
  const direction = faceNormal.clone().normalize();
  
  // Calculate the center of the face
  const center = calculateFaceCenter(mesh, face);
  
  // Create new vertices by duplicating the original face vertices
  const newVertexIndices: number[] = [];
  const vertexCount = face.vertices.length;
  
  for (let i = 0; i < vertexCount; i++) {
    const originalVertexIndex = face.vertices[i];
    const originalVertex = mesh.getVertex(originalVertexIndex);
    if (!originalVertex) continue;
    
    // Create a new vertex at the same position as the original
    const newVertex = originalVertex.clone();
    
    // Apply extrusion by moving the new vertex along the normal direction
    newVertex.x += direction.x * distance;
    newVertex.y += direction.y * distance;
    newVertex.z += direction.z * distance;
    
    // Apply scaling if specified
    if (scale !== 1) {
      // Convert vertex position to a vector relative to the center
      const relativePos = new Vector3(
        newVertex.x - center.x,
        newVertex.y - center.y,
        newVertex.z - center.z
      );
      
      // Apply scale
      if (typeof scale === 'number') {
        relativePos.multiplyScalar(scale);
      } else {
        relativePos.x *= scale.x;
        relativePos.y *= scale.y;
      }
      
      // Update vertex position
      newVertex.x = center.x + relativePos.x;
      newVertex.y = center.y + relativePos.y;
      newVertex.z = center.z + relativePos.z;
    }
    
    // Add the new vertex to the mesh
    const newVertexIndex = mesh.addVertex(newVertex);
    newVertexIndices.push(newVertexIndex);
  }
  
  // Create edges for the new face
  const newEdgeIndices: number[] = [];
  for (let i = 0; i < vertexCount; i++) {
    const v1 = newVertexIndices[i];
    const v2 = newVertexIndices[(i + 1) % vertexCount];
    const newEdge = new Edge(v1, v2);
    const newEdgeIndex = mesh.addEdge(newEdge);
    newEdgeIndices.push(newEdgeIndex);
  }
  
  // Create side faces connecting the original face to the new face
  for (let i = 0; i < vertexCount; i++) {
    const originalV1 = face.vertices[i];
    const originalV2 = face.vertices[(i + 1) % vertexCount];
    const newV1 = newVertexIndices[i];
    const newV2 = newVertexIndices[(i + 1) % vertexCount];
    
    // Create edges for the side face
    const edge1 = mesh.addEdge(new Edge(originalV1, newV1));
    const edge2 = mesh.addEdge(new Edge(newV1, newV2));
    const edge3 = mesh.addEdge(new Edge(newV2, originalV2));
    const edge4 = mesh.addEdge(new Edge(originalV2, originalV1));
    
    // Create the side face
    mesh.addFace(
      new Face(
        [originalV1, newV1, newV2, originalV2],
        [edge1, edge2, edge3, edge4],
        { materialIndex: face.materialIndex }
      )
    );
  }
  
  // Create the new face (the extruded face)
  const newFaceIndex = mesh.addFace(
    new Face(
      [...newVertexIndices],
      [...newEdgeIndices],
      { materialIndex: face.materialIndex }
    )
  );
  
  // Remove the original face if not keeping it
  if (!keepOriginal) {
    mesh.removeFace(faceIndex);
  }
  
  return newFaceIndex;
}


