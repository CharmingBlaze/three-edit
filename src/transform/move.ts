import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from '../selection/Selection.ts';
import { getAffectedVertices, calculatePivotPoint, TransformOptions } from './transform';

/**
 * Moves selected elements of a mesh
 * @param mesh The mesh to modify
 * @param selection The selection to move
 * @param translation The translation vector
 * @param options Transform options
 */
export function move(
  mesh: EditableMesh,
  selection: Selection,
  translation: Vector3,
  options: TransformOptions = {}
): void {
  if (selection.isEmpty) return;
  
  const local = options.local ?? false;
  const relativeToPivot = options.relativeToPivot ?? false;
  
  // Get all affected vertices
  const vertexIndices = getAffectedVertices(mesh, selection);
  if (vertexIndices.length === 0) return;
  
  // Calculate pivot point if needed
  let pivotPoint: Vector3 | null = null;
  if (relativeToPivot) {
    pivotPoint = options.pivotPoint ?? calculatePivotPoint(mesh, selection);
  }
  
  // Apply translation to each vertex
  vertexIndices.forEach(index => {
    const vertex = mesh.getVertex(index);
    if (!vertex) return;
    
    if (local) {
      // In local space, we need to transform the translation vector
      // based on the local orientation of the selection
      // This is a simplified implementation
      // In a real implementation, you would need to calculate the local axes
      
      // For now, we just apply the translation directly
      vertex.x += translation.x;
      vertex.y += translation.y;
      vertex.z += translation.z;
    } else if (relativeToPivot && pivotPoint) {
      // Move relative to pivot point
      // This involves:
      // 1. Translating to origin (subtracting pivot)
      // 2. Applying the translation
      // 3. Translating back (adding pivot)
      
      // In this case, the translation is applied directly
      // because we're just moving, not rotating or scaling
      vertex.x += translation.x;
      vertex.y += translation.y;
      vertex.z += translation.z;
    } else {
      // Global space, direct translation
      vertex.x += translation.x;
      vertex.y += translation.y;
      vertex.z += translation.z;
    }
  });
}

/**
 * Moves vertices along a normal direction
 * @param mesh The mesh to modify
 * @param selection The selection containing vertices to move
 * @param distance The distance to move along the normal
 */
export function moveAlongNormal(
  mesh: EditableMesh,
  selection: Selection,
  distance: number
): void {
  if (selection.vertexCount === 0) return;
  
  // Move each selected vertex along its normal
  selection.vertices.forEach(index => {
    const vertex = mesh.getVertex(index);
    if (!vertex || !vertex.normal) return;
    
    // Calculate the translation vector
    const translation = new Vector3(
      vertex.normal.x * distance,
      vertex.normal.y * distance,
      vertex.normal.z * distance
    );
    
    // Apply the translation
    vertex.x += translation.x;
    vertex.y += translation.y;
    vertex.z += translation.z;
  });
}
