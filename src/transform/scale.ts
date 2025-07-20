import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from '../selection/Selection.ts';
import { getAffectedVertices, calculatePivotPoint, TransformOptions } from './transform';

/**
 * Scales selected elements of a mesh
 * @param mesh The mesh to modify
 * @param selection The selection to scale
 * @param scale The scale factor (can be a single number or a Vector3)
 * @param options Transform options
 */
export function scale(
  mesh: EditableMesh,
  selection: Selection,
  scale: number | Vector3,
  options: TransformOptions = {}
): void {
  if (selection.isEmpty) return;
  
  const local = options.local ?? false;
  const relativeToPivot = options.relativeToPivot ?? true; // Default to true for scaling
  
  // Get all affected vertices
  const vertexIndices = getAffectedVertices(mesh, selection);
  if (vertexIndices.length === 0) return;
  
  // Calculate pivot point
  const pivotPoint = options.pivotPoint ?? calculatePivotPoint(mesh, selection);
  
  // Convert scale to Vector3 if it's a number
  const scaleVector = typeof scale === 'number'
    ? new Vector3(scale, scale, scale)
    : scale.clone();
  
  // Apply scaling to each vertex
  vertexIndices.forEach(index => {
    const vertex = mesh.getVertex(index);
    if (!vertex) return;
    
    // Create a vector for the current vertex position
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    
    if (local) {
      // In local space, we need to transform the scaling
      // based on the local orientation of the selection
      // This is a simplified implementation
      
      // For now, we just apply the scaling directly
      if (relativeToPivot) {
        position.sub(pivotPoint);
        position.x *= scaleVector.x;
        position.y *= scaleVector.y;
        position.z *= scaleVector.z;
        position.add(pivotPoint);
      } else {
        position.x *= scaleVector.x;
        position.y *= scaleVector.y;
        position.z *= scaleVector.z;
      }
    } else if (relativeToPivot) {
      // Scale relative to pivot point
      // 1. Translate to origin (subtract pivot)
      position.sub(pivotPoint);
      // 2. Apply scaling
      position.x *= scaleVector.x;
      position.y *= scaleVector.y;
      position.z *= scaleVector.z;
      // 3. Translate back (add pivot)
      position.add(pivotPoint);
    } else {
      // Global space, scale relative to origin
      position.x *= scaleVector.x;
      position.y *= scaleVector.y;
      position.z *= scaleVector.z;
    }
    
    // Update vertex position
    vertex.x = position.x;
    vertex.y = position.y;
    vertex.z = position.z;
  });
}

/**
 * Scales selected elements of a mesh uniformly
 * @param mesh The mesh to modify
 * @param selection The selection to scale
 * @param factor The uniform scale factor
 * @param options Transform options
 */
export function scaleUniform(
  mesh: EditableMesh,
  selection: Selection,
  factor: number,
  options: TransformOptions = {}
): void {
  scale(mesh, selection, factor, options);
}

/**
 * Scales selected elements of a mesh non-uniformly
 * @param mesh The mesh to modify
 * @param selection The selection to scale
 * @param x Scale factor along X axis
 * @param y Scale factor along Y axis
 * @param z Scale factor along Z axis
 * @param options Transform options
 */
export function scaleNonUniform(
  mesh: EditableMesh,
  selection: Selection,
  x: number,
  y: number,
  z: number,
  options: TransformOptions = {}
): void {
  scale(mesh, selection, new Vector3(x, y, z), options);
}
