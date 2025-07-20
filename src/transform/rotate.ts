import { Quaternion, Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from '../selection/Selection.ts';
import { getAffectedVertices, calculatePivotPoint, TransformOptions } from './transform';

/**
 * Rotates selected elements of a mesh
 * @param mesh The mesh to modify
 * @param selection The selection to rotate
 * @param axis The rotation axis
 * @param angle The rotation angle in radians
 * @param options Transform options
 */
export function rotate(
  mesh: EditableMesh,
  selection: Selection,
  axis: Vector3,
  angle: number,
  options: TransformOptions = {}
): void {
  if (selection.isEmpty) return;
  
  const local = options.local ?? false;
  const relativeToPivot = options.relativeToPivot ?? true; // Default to true for rotation
  
  // Get all affected vertices
  const vertexIndices = getAffectedVertices(mesh, selection);
  if (vertexIndices.length === 0) return;
  
  // Calculate pivot point
  const pivotPoint = options.pivotPoint ?? calculatePivotPoint(mesh, selection);
  
  // Create rotation quaternion
  const normalizedAxis = axis.clone().normalize();
  const quaternion = new Quaternion().setFromAxisAngle(normalizedAxis, angle);
  
  // Apply rotation to each vertex
  vertexIndices.forEach(index => {
    const vertex = mesh.getVertex(index);
    if (!vertex) return;
    
    // Create a vector for the current vertex position
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    
    if (local) {
      // In local space, we need to transform the rotation axis
      // based on the local orientation of the selection
      // This is a simplified implementation
      
      // For now, we just apply the rotation directly
      position.applyQuaternion(quaternion);
    } else if (relativeToPivot) {
      // Rotate around pivot point
      // 1. Translate to origin (subtract pivot)
      position.sub(pivotPoint);
      // 2. Apply rotation
      position.applyQuaternion(quaternion);
      // 3. Translate back (add pivot)
      position.add(pivotPoint);
    } else {
      // Global space, rotate around origin
      position.applyQuaternion(quaternion);
    }
    
    // Update vertex position
    vertex.x = position.x;
    vertex.y = position.y;
    vertex.z = position.z;
    
    // Rotate normal if present
    if (vertex.normal) {
      vertex.normal.applyQuaternion(quaternion);
    }
  });
}

/**
 * Rotates selected elements of a mesh using Euler angles
 * @param mesh The mesh to modify
 * @param selection The selection to rotate
 * @param x Rotation around X axis in radians
 * @param y Rotation around Y axis in radians
 * @param z Rotation around Z axis in radians
 * @param options Transform options
 */
export function rotateEuler(
  mesh: EditableMesh,
  selection: Selection,
  x: number,
  y: number,
  z: number,
  options: TransformOptions = {}
): void {
  if (selection.isEmpty) return;
  
  // Apply rotations in XYZ order
  if (x !== 0) {
    rotate(mesh, selection, new Vector3(1, 0, 0), x, options);
  }
  
  if (y !== 0) {
    rotate(mesh, selection, new Vector3(0, 1, 0), y, options);
  }
  
  if (z !== 0) {
    rotate(mesh, selection, new Vector3(0, 0, 1), z, options);
  }
}
