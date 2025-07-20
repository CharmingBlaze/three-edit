import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from './Selection';
import { Face } from '../core/Face.ts';

/**
 * Options for face selection
 */
export interface SelectFaceOptions {
  /** Whether to add to the existing selection */
  add?: boolean;
  /** Whether to toggle the selection state */
  toggle?: boolean;
}

/**
 * Selects a face by raycasting
 * @param mesh The mesh to select from
 * @param origin The origin point of the ray
 * @param direction The direction of the ray
 * @param selection The current selection to modify
 * @param options Selection options
 * @returns The updated selection
 */
export function selectFaceByRay(
  mesh: EditableMesh,
  origin: Vector3,
  direction: Vector3,
  selection: Selection,
  options: SelectFaceOptions = {}
): Selection {
  const add = options.add ?? false;
  const toggle = options.toggle ?? false;
  
  // Create a new selection if not adding to the existing one
  if (!add && !toggle) {
    selection.clear();
  }
  
  // Find the intersected face
  const intersectedFace = findFaceByRay(mesh, origin, direction);
  
  // Update the selection if a face was found
  if (intersectedFace !== -1) {
    if (toggle) {
      selection.toggleFace(intersectedFace);
    } else {
      selection.addFace(intersectedFace);
    }
  }
  
  return selection;
}

/**
 * Finds a face by raycasting
 * @param mesh The mesh to search in
 * @param origin The origin point of the ray
 * @param direction The direction of the ray
 * @returns The index of the intersected face, or -1 if no face was found
 */
function findFaceByRay(
  mesh: EditableMesh,
  origin: Vector3,
  direction: Vector3
): number {
  // This is a simplified implementation of ray-face intersection
  // In a real implementation, you would use a more efficient algorithm
  // or leverage Three.js's Raycaster
  
  let closestFaceIndex = -1;
  let closestDistance = Infinity;
  
  // Check each face for intersection
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    const intersection = rayFaceIntersection(mesh, face, origin, direction);
    
    if (intersection && intersection.distance < closestDistance) {
      closestDistance = intersection.distance;
      closestFaceIndex = i;
    }
  }
  
  return closestFaceIndex;
}

/**
 * Calculates the intersection between a ray and a face
 * @param mesh The mesh containing the face
 * @param face The face to check for intersection
 * @param origin The origin point of the ray
 * @param direction The direction of the ray
 * @returns The intersection information, or null if there is no intersection
 */
function rayFaceIntersection(
  mesh: EditableMesh,
  face: Face,
  origin: Vector3,
  direction: Vector3
): { point: Vector3; distance: number } | null {
  // This is a simplified implementation using the Möller–Trumbore algorithm
  // for triangle intersection
  
  // For non-triangular faces, we would need to triangulate the face first
  // For simplicity, we'll just use the first three vertices
  if (face.vertices.length < 3) return null;
  
  const v0 = mesh.getVertex(face.vertices[0]);
  const v1 = mesh.getVertex(face.vertices[1]);
  const v2 = mesh.getVertex(face.vertices[2]);
  
  if (!v0 || !v1 || !v2) return null;
  
  const vertex0 = new Vector3(v0.x, v0.y, v0.z);
  const vertex1 = new Vector3(v1.x, v1.y, v1.z);
  const vertex2 = new Vector3(v2.x, v2.y, v2.z);
  
  // Calculate edges
  const edge1 = new Vector3().subVectors(vertex1, vertex0);
  const edge2 = new Vector3().subVectors(vertex2, vertex0);
  
  // Calculate normal
  const normal = new Vector3().crossVectors(edge1, edge2).normalize();
  
  // Check if ray and plane are parallel
  const dotProduct = normal.dot(direction);
  if (Math.abs(dotProduct) < 0.000001) return null; // Parallel, no intersection
  
  // Calculate distance from origin to plane
  const d = -normal.dot(vertex0);
  const t = -(normal.dot(origin) + d) / dotProduct;
  
  // Check if the triangle is behind the ray
  if (t < 0) return null;
  
  // Calculate intersection point
  const intersectionPoint = new Vector3()
    .copy(origin)
    .add(direction.clone().multiplyScalar(t));
  
  // Check if the point is inside the triangle
  // This is a simplified check and may not work for all cases
  // In a real implementation, you would use barycentric coordinates
  
  // For simplicity, we'll just check if the point is on the same side of each edge
  const edge0 = new Vector3().subVectors(vertex1, vertex0);
  const vp0 = new Vector3().subVectors(intersectionPoint, vertex0);
  const c0 = new Vector3().crossVectors(edge0, vp0);
  if (normal.dot(c0) < 0) return null;
  
  const edge1_2 = new Vector3().subVectors(vertex2, vertex1);
  const vp1 = new Vector3().subVectors(intersectionPoint, vertex1);
  const c1 = new Vector3().crossVectors(edge1_2, vp1);
  if (normal.dot(c1) < 0) return null;
  
  const edge2_0 = new Vector3().subVectors(vertex0, vertex2);
  const vp2 = new Vector3().subVectors(intersectionPoint, vertex2);
  const c2 = new Vector3().crossVectors(edge2_0, vp2);
  if (normal.dot(c2) < 0) return null;
  
  // If we get here, the point is inside the triangle
  return {
    point: intersectionPoint,
    distance: t,
  };
}

/**
 * Selects all faces that have any of the specified vertices
 * @param mesh The mesh to select from
 * @param vertexIndices The indices of the vertices to check
 * @param selection The current selection to modify
 * @param options Selection options
 * @returns The updated selection
 */
export function selectFacesByVertices(
  mesh: EditableMesh,
  vertexIndices: number[],
  selection: Selection,
  options: SelectFaceOptions = {}
): Selection {
  const add = options.add ?? false;
  const toggle = options.toggle ?? false;
  
  // Create a new selection if not adding to the existing one
  if (!add && !toggle) {
    selection.clearFaces();
  }
  
  // Find faces that contain any of the specified vertices
  const facesToSelect: number[] = [];
  
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    
    // Check if any of the face's vertices are in the specified list
    const hasVertex = face.vertices.some(v => vertexIndices.includes(v));
    
    if (hasVertex) {
      facesToSelect.push(i);
    }
  }
  
  // Update the selection
  if (toggle) {
    facesToSelect.forEach(index => selection.toggleFace(index));
  } else {
    selection.addFaces(facesToSelect);
  }
  
  return selection;
}
