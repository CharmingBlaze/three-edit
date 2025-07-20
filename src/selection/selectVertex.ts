import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from './Selection';

/**
 * Options for vertex selection
 */
export interface SelectVertexOptions {
  /** Whether to add to the existing selection */
  add?: boolean;
  /** Whether to toggle the selection state */
  toggle?: boolean;
  /** Maximum distance for vertex selection */
  maxDistance?: number;
}

/**
 * Selects the closest vertex to a point in 3D space
 * @param mesh The mesh to select from
 * @param point The point in 3D space
 * @param selection The current selection to modify
 * @param options Selection options
 * @returns The updated selection
 */
export function selectVertex(
  mesh: EditableMesh,
  point: Vector3,
  selection: Selection,
  options: SelectVertexOptions = {}
): Selection {
  const add = options.add ?? false;
  const toggle = options.toggle ?? false;
  const maxDistance = options.maxDistance ?? Infinity;
  
  // Create a new selection if not adding to the existing one
  if (!add && !toggle) {
    selection.clear();
  }
  
  // Find the closest vertex
  let closestIndex = -1;
  let closestDistance = Infinity;
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const distance = new Vector3(vertex.x, vertex.y, vertex.z).distanceTo(point);
    
    if (distance < closestDistance && distance <= maxDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  }
  
  // Update the selection if a vertex was found
  if (closestIndex !== -1) {
    if (toggle) {
      selection.toggleVertex(closestIndex);
    } else {
      selection.addVertex(closestIndex);
    }
  }
  
  return selection;
}

/**
 * Selects vertices within a certain distance of a point
 * @param mesh The mesh to select from
 * @param point The point in 3D space
 * @param radius The selection radius
 * @param selection The current selection to modify
 * @param options Selection options
 * @returns The updated selection
 */
export function selectVerticesInRadius(
  mesh: EditableMesh,
  point: Vector3,
  radius: number,
  selection: Selection,
  options: SelectVertexOptions = {}
): Selection {
  const add = options.add ?? false;
  const toggle = options.toggle ?? false;
  
  // Create a new selection if not adding to the existing one
  if (!add && !toggle) {
    selection.clear();
  }
  
  // Find all vertices within the radius
  const verticesInRadius: number[] = [];
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const distance = new Vector3(vertex.x, vertex.y, vertex.z).distanceTo(point);
    
    if (distance <= radius) {
      verticesInRadius.push(i);
    }
  }
  
  // Update the selection
  if (toggle) {
    verticesInRadius.forEach(index => selection.toggleVertex(index));
  } else {
    selection.addVertices(verticesInRadius);
  }
  
  return selection;
}
