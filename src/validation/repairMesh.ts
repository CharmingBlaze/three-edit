import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { calculateFaceNormal } from '../utils/mathUtils';
import { validateMesh, ValidationResult } from './validateMesh';

/**
 * Options for mesh repair operations
 */
export interface RepairOptions {
  /** Whether to fix flipped faces */
  fixFlippedFaces?: boolean;
  /** Whether to merge duplicate vertices */
  mergeDuplicateVertices?: boolean;
  /** Whether to remove duplicate edges */
  removeDuplicateEdges?: boolean;
  /** Whether to recalculate normals */
  recalculateNormals?: boolean;
  /** Whether to generate default UVs */
  generateDefaultUVs?: boolean;
  /** Distance threshold for merging vertices */
  mergeThreshold?: number;
}

/**
 * Result of mesh repair operations
 */
export interface RepairResult {
  /** Whether the repair was successful */
  success: boolean;
  /** Number of vertices merged */
  verticesMerged: number;
  /** Number of edges removed */
  edgesRemoved: number;
  /** Number of faces fixed */
  facesFixed: number;
  /** Number of normals recalculated */
  normalsRecalculated: number;
  /** Validation result after repair */
  validation: ValidationResult;
}

/**
 * Repairs common issues in a mesh
 * @param mesh The mesh to repair
 * @param options Repair options
 * @returns Repair result with statistics
 */
export function repairMesh(
  mesh: EditableMesh,
  options: RepairOptions = {}
): RepairResult {
  const opts: Required<RepairOptions> = {
    fixFlippedFaces: options.fixFlippedFaces ?? true,
    mergeDuplicateVertices: options.mergeDuplicateVertices ?? true,
    removeDuplicateEdges: options.removeDuplicateEdges ?? true,
    recalculateNormals: options.recalculateNormals ?? true,
    generateDefaultUVs: options.generateDefaultUVs ?? true,
    mergeThreshold: options.mergeThreshold ?? 1e-6,
  };

  const result: RepairResult = {
    success: true,
    verticesMerged: 0,
    edgesRemoved: 0,
    facesFixed: 0,
    normalsRecalculated: 0,
    validation: { isValid: false, errors: [], warnings: [], flippedFaces: [], duplicateVertices: [], duplicateEdges: [], invalidFaces: [] },
  };

  // Validate the mesh first
  result.validation = validateMesh(mesh);

  // Merge duplicate vertices
  if (opts.mergeDuplicateVertices) {
    result.verticesMerged = mergeDuplicateVertices(mesh, opts.mergeThreshold);
  }

  // Remove duplicate edges
  if (opts.removeDuplicateEdges) {
    result.edgesRemoved = removeDuplicateEdges(mesh);
  }

  // Fix flipped faces
  if (opts.fixFlippedFaces) {
    result.facesFixed = fixFlippedFaces(mesh);
  }

  // Recalculate normals
  if (opts.recalculateNormals) {
    result.normalsRecalculated = recalculateNormals(mesh);
  }

  // Generate default UVs
  if (opts.generateDefaultUVs) {
    generateDefaultUVs(mesh);
  }

  // Validate again after repair
  result.validation = validateMesh(mesh);
  result.success = result.validation.isValid;

  return result;
}

/**
 * Merges duplicate vertices in the mesh
 * @param mesh The mesh to process
 * @param threshold Distance threshold for merging
 * @returns Number of vertices merged
 */
function mergeDuplicateVertices(mesh: EditableMesh, threshold: number): number {
  const vertexMap = new Map<string, number[]>();
  let mergedCount = 0;

  // Group vertices by position
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const key = `${Math.round(vertex.x / threshold)},${Math.round(vertex.y / threshold)},${Math.round(vertex.z / threshold)}`;
    
    if (!vertexMap.has(key)) {
      vertexMap.set(key, []);
    }
    vertexMap.get(key)!.push(i);
  }

  // Create a mapping from old vertex indices to new ones
  const vertexMapping = new Map<number, number>();
  const verticesToRemove: number[] = [];

  for (const [, indices] of vertexMap) {
    if (indices.length > 1) {
      // Keep the first vertex, map others to it
      const keepIndex = indices[0];
      for (let i = 1; i < indices.length; i++) {
        vertexMapping.set(indices[i], keepIndex);
        verticesToRemove.push(indices[i]);
        mergedCount++;
      }
    }
  }

  // Update all references to use the new vertex indices
  updateVertexReferences(mesh, vertexMapping);

  // Remove duplicate vertices (in reverse order to maintain indices)
  verticesToRemove.sort((a, b) => b - a);
  for (const index of verticesToRemove) {
    mesh.vertices.splice(index, 1);
  }

  return mergedCount;
}

/**
 * Updates vertex references in edges and faces
 * @param mesh The mesh to update
 * @param vertexMapping Mapping from old to new vertex indices
 */
function updateVertexReferences(mesh: EditableMesh, vertexMapping: Map<number, number>): void {
  // Update edge vertex references
  for (const edge of mesh.edges) {
    if (vertexMapping.has(edge.v1)) {
      edge.v1 = vertexMapping.get(edge.v1)!;
    }
    if (vertexMapping.has(edge.v2)) {
      edge.v2 = vertexMapping.get(edge.v2)!;
    }
  }

  // Update face vertex references
  for (const face of mesh.faces) {
    for (let i = 0; i < face.vertices.length; i++) {
      if (vertexMapping.has(face.vertices[i])) {
        face.vertices[i] = vertexMapping.get(face.vertices[i])!;
      }
    }
  }
}

/**
 * Removes duplicate edges from the mesh
 * @param mesh The mesh to process
 * @returns Number of edges removed
 */
function removeDuplicateEdges(mesh: EditableMesh): number {
  const edgeMap = new Map<string, number>();
  const edgesToRemove: number[] = [];

  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    const key = `${Math.min(edge.v1, edge.v2)},${Math.max(edge.v1, edge.v2)}`;

    if (edgeMap.has(key)) {
      edgesToRemove.push(i);
    } else {
      edgeMap.set(key, i);
    }
  }

  // Remove duplicate edges (in reverse order)
  edgesToRemove.sort((a, b) => b - a);
  for (const index of edgesToRemove) {
    mesh.edges.splice(index, 1);
  }

  return edgesToRemove.length;
}

/**
 * Fixes faces with incorrect winding order
 * @param mesh The mesh to process
 * @returns Number of faces fixed
 */
function fixFlippedFaces(mesh: EditableMesh): number {
  let fixedCount = 0;

  for (const face of mesh.faces) {
    if (face.vertices.length < 3) continue;

    const computedNormal = calculateFaceNormal(mesh, face);
    if (!computedNormal) continue;

    // If the face has a stored normal, check if it's flipped
    if (face.normal) {
      const dotProduct = face.normal.dot(computedNormal);
      if (dotProduct < 0) {
        // Reverse the winding order
        face.vertices.reverse();
        face.edges.reverse();
        face.normal = computedNormal;
        fixedCount++;
      }
    } else {
      // Store the computed normal
      face.normal = computedNormal;
    }
  }

  return fixedCount;
}

/**
 * Recalculates normals for all faces and vertices
 * @param mesh The mesh to process
 * @returns Number of normals recalculated
 */
function recalculateNormals(mesh: EditableMesh): number {
  let count = 0;

  // Recalculate face normals
  for (const face of mesh.faces) {
    const normal = calculateFaceNormal(mesh, face);
    if (normal) {
      face.normal = normal;
      count++;
    }
  }

  // Recalculate vertex normals (average of connected face normals)
  for (let i = 0; i < mesh.vertices.length; i++) {
    const connectedFaces = getConnectedFaces(mesh, i);
    if (connectedFaces.length > 0) {
      const averageNormal = new Vector3();
      
      for (const faceIndex of connectedFaces) {
        const face = mesh.faces[faceIndex];
        if (face.normal) {
          averageNormal.add(face.normal);
        }
      }
      
      if (averageNormal.lengthSq() > 0) {
        averageNormal.normalize();
        mesh.vertices[i].normal = averageNormal;
        count++;
      }
    }
  }

  return count;
}

/**
 * Gets faces connected to a vertex
 * @param mesh The mesh
 * @param vertexIndex The vertex index
 * @returns Array of face indices
 */
function getConnectedFaces(mesh: EditableMesh, vertexIndex: number): number[] {
  const connectedFaces: number[] = [];

  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    if (face.vertices.includes(vertexIndex)) {
      connectedFaces.push(i);
    }
  }

  return connectedFaces;
}

/**
 * Generates default UV coordinates for the mesh
 * @param mesh The mesh to process
 */
function generateDefaultUVs(mesh: EditableMesh): void {
  for (const vertex of mesh.vertices) {
    if (!vertex.uv) {
      // Generate simple planar UVs based on position
      vertex.uv = {
        u: (vertex.x + 1) * 0.5,
        v: (vertex.y + 1) * 0.5,
      };
    }
  }
}
