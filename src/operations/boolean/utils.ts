import { EditableMesh } from '../../core/EditableMesh.ts';
import { CSGOptions } from './types';

/**
 * Refine CSG result mesh
 */
export function refineCSGResult(mesh: EditableMesh, options: CSGOptions): EditableMesh {
  const tolerance = options.tolerance ?? 1e-6;
  
  // Merge close vertices
  if (options.mergeVertices !== false) {
    mergeCloseVertices(mesh, tolerance);
  }
  
  // Remove degenerate faces
  removeDegenerateFaces(mesh);
  
  // Validate mesh integrity
  if (options.validateResult !== false) {
    validateMeshIntegrity(mesh);
  }
  
  return mesh;
}

/**
 * Merge vertices that are close to each other
 */
function mergeCloseVertices(mesh: EditableMesh, tolerance: number): void {
  const verticesToMerge = new Map<number, number>();
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    for (let j = i + 1; j < mesh.vertices.length; j++) {
      const vertexA = mesh.vertices[i];
      const vertexB = mesh.vertices[j];
      
      const distance = Math.sqrt(
        Math.pow(vertexA.x - vertexB.x, 2) +
        Math.pow(vertexA.y - vertexB.y, 2) +
        Math.pow(vertexA.z - vertexB.z, 2)
      );
      
      if (distance <= tolerance) {
        verticesToMerge.set(j, i);
      }
    }
  }
  
  // Apply vertex merging
  for (const [_fromIndex, _toIndex] of verticesToMerge) {
    // Note: mergeVertices method needs to be implemented in EditableMesh
    // For now, we'll skip this step
    console.warn('Vertex merging not implemented yet');
  }
}

/**
 * Remove degenerate faces (faces with fewer than 3 vertices)
 */
function removeDegenerateFaces(mesh: EditableMesh): void {
  mesh.faces = mesh.faces.filter(face => face.vertices.length >= 3);
}

/**
 * Validate mesh integrity
 */
function validateMeshIntegrity(mesh: EditableMesh): void {
  // Check for valid vertex indices
  for (const face of mesh.faces) {
    for (const vertexIndex of face.vertices) {
      if (vertexIndex < 0 || vertexIndex >= mesh.vertices.length) {
        throw new Error(`Invalid vertex index: ${vertexIndex}`);
      }
    }
  }
  
  // Check for valid edge indices
  for (const edge of mesh.edges) {
    if (edge.v1 < 0 || edge.v1 >= mesh.vertices.length ||
        edge.v2 < 0 || edge.v2 >= mesh.vertices.length) {
      throw new Error(`Invalid edge vertex indices: ${edge.v1}, ${edge.v2}`);
    }
  }
}