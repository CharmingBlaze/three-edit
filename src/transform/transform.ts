import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from '../selection/Selection.ts';

/**
 * Options for transform operations
 */
export interface TransformOptions {
  /** Whether to transform in local space */
  local?: boolean;
  /** Whether to transform relative to the selection's pivot point */
  relativeToPivot?: boolean;
  /** Custom pivot point to use if relativeToPivot is true */
  pivotPoint?: Vector3;
}

/**
 * Calculates the pivot point (center) of a selection
 * @param mesh The mesh containing the selection
 * @param selection The selection to calculate the pivot point for
 * @returns The pivot point as a Vector3
 */
export function calculatePivotPoint(mesh: EditableMesh, selection: Selection): Vector3 {
  const pivot = new Vector3();
  let count = 0;
  
  // Add all selected vertices
  selection.vertices.forEach(index => {
    const vertex = mesh.getVertex(index);
    if (vertex) {
      pivot.x += vertex.x;
      pivot.y += vertex.y;
      pivot.z += vertex.z;
      count++;
    }
  });
  
  // Add vertices from selected edges
  selection.edges.forEach(index => {
    const edge = mesh.getEdge(index);
    if (edge) {
      const v1 = mesh.getVertex(edge.v1);
      const v2 = mesh.getVertex(edge.v2);
      
      if (v1 && !selection.hasVertex(edge.v1)) {
        pivot.x += v1.x;
        pivot.y += v1.y;
        pivot.z += v1.z;
        count++;
      }
      
      if (v2 && !selection.hasVertex(edge.v2)) {
        pivot.x += v2.x;
        pivot.y += v2.y;
        pivot.z += v2.z;
        count++;
      }
    }
  });
  
  // Add vertices from selected faces
  selection.faces.forEach(index => {
    const face = mesh.getFace(index);
    if (face) {
      face.vertices.forEach(vertexIndex => {
        if (!selection.hasVertex(vertexIndex)) {
          const vertex = mesh.getVertex(vertexIndex);
          if (vertex) {
            pivot.x += vertex.x;
            pivot.y += vertex.y;
            pivot.z += vertex.z;
            count++;
          }
        }
      });
    }
  });
  
  // Calculate the average position
  if (count > 0) {
    pivot.divideScalar(count);
  }
  
  return pivot;
}

/**
 * Gets all vertex indices affected by a selection
 * @param mesh The mesh containing the selection
 * @param selection The selection to get vertices from
 * @returns An array of vertex indices
 */
export function getAffectedVertices(mesh: EditableMesh, selection: Selection): number[] {
  const vertexSet = new Set<number>();
  
  // Add directly selected vertices
  selection.vertices.forEach(index => vertexSet.add(index));
  
  // Add vertices from selected edges
  selection.edges.forEach(index => {
    const edge = mesh.getEdge(index);
    if (edge) {
      vertexSet.add(edge.v1);
      vertexSet.add(edge.v2);
    }
  });
  
  // Add vertices from selected faces
  selection.faces.forEach(index => {
    const face = mesh.getFace(index);
    if (face) {
      face.vertices.forEach(vertexIndex => vertexSet.add(vertexIndex));
    }
  });
  
  return Array.from(vertexSet);
}
