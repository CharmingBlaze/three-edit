import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';


/**
 * Options for extruding an edge
 */
export interface ExtrudeEdgeOptions {
  /** Distance to extrude along the edge direction */
  distance?: number;
  /** Direction to extrude (if not specified, uses edge direction) */
  direction?: Vector3;
  /** Whether to keep the original edge */
  keepOriginal?: boolean;
  /** Width of the extruded face */
  width?: number;
}

/**
 * Extrudes an edge of the mesh to create a new face
 * @param mesh The mesh to modify
 * @param edgeIndex Index of the edge to extrude
 * @param options Options for the extrusion
 * @returns The index of the newly created face, or -1 if the operation failed
 */
export function extrudeEdge(
  mesh: EditableMesh,
  edgeIndex: number,
  options: ExtrudeEdgeOptions = {}
): number {
  // Default options
  const distance = options.distance ?? 1;
  const keepOriginal = options.keepOriginal ?? false;

  
  // Get the edge to extrude
  const edge = mesh.getEdge(edgeIndex);
  if (!edge) return -1;
  
  // Get the vertices of the edge
  const v1 = mesh.getVertex(edge.v1);
  const v2 = mesh.getVertex(edge.v2);
  if (!v1 || !v2) return -1;
  
  // Calculate edge direction
  const edgeDirection = new Vector3(
    v2.x - v1.x,
    v2.y - v1.y,
    v2.z - v1.z
  ).normalize();
  
  // Use provided direction or calculate perpendicular direction
  let extrudeDirection: Vector3;
  if (options.direction) {
    extrudeDirection = options.direction.normalize();
  } else {
    // Find a perpendicular direction by using the edge direction and up vector
    const up = new Vector3(0, 1, 0);
    if (Math.abs(edgeDirection.dot(up)) > 0.9) {
      up.set(0, 0, 1);
    }
    extrudeDirection = new Vector3()
      .crossVectors(edgeDirection, up)
      .normalize();
  }
  
  // Create new vertices for the extruded edge
  const newV1 = v1.clone();
  const newV2 = v2.clone();
  
  // Move the new vertices along the extrude direction
  newV1.x += extrudeDirection.x * distance;
  newV1.y += extrudeDirection.y * distance;
  newV1.z += extrudeDirection.z * distance;
  
  newV2.x += extrudeDirection.x * distance;
  newV2.y += extrudeDirection.y * distance;
  newV2.z += extrudeDirection.z * distance;
  
  // Add the new vertices to the mesh
  const newV1Index = mesh.addVertex(newV1);
  const newV2Index = mesh.addVertex(newV2);
  
  // Create edges for the new face
  const edge1 = mesh.addEdge(new Edge(edge.v1, newV1Index));
  const edge2 = mesh.addEdge(new Edge(newV1Index, newV2Index));
  const edge3 = mesh.addEdge(new Edge(newV2Index, edge.v2));
  const edge4 = mesh.addEdge(new Edge(edge.v2, edge.v1));
  
  // Create the new face
  const newFaceIndex = mesh.addFace(
    new Face(
      [edge.v1, newV1Index, newV2Index, edge.v2],
      [edge1, edge2, edge3, edge4]
    )
  );
  
  // Remove the original edge if not keeping it
  if (!keepOriginal) {
    mesh.removeEdge(edgeIndex);
  }
  
  return newFaceIndex;
}

/**
 * Extrudes multiple edges at once
 * @param mesh The mesh to modify
 * @param edgeIndices Array of edge indices to extrude
 * @param options Options for the extrusion
 * @returns Array of newly created face indices
 */
export function extrudeEdges(
  mesh: EditableMesh,
  edgeIndices: number[],
  options: ExtrudeEdgeOptions = {}
): number[] {
  const newFaceIndices: number[] = [];
  
  for (const edgeIndex of edgeIndices) {
    const newFaceIndex = extrudeEdge(mesh, edgeIndex, options);
    if (newFaceIndex !== -1) {
      newFaceIndices.push(newFaceIndex);
    }
  }
  
  return newFaceIndices;
} 