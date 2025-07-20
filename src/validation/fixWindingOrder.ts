import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Face } from '../core/Face.ts';
import { calculateFaceNormal } from '../utils/mathUtils.ts';

/**
 * Options for fixing winding order
 */
export interface FixWindingOrderOptions {
  /** Whether to recalculate normals after fixing winding order */
  recalculateNormals?: boolean;
  /** Whether to validate the mesh after fixing */
  validateAfterFix?: boolean;
}

/**
 * Fixes the winding order of faces to ensure CCW orientation
 * @param mesh The mesh to fix
 * @param options Options for the fix operation
 * @returns The number of faces that were fixed
 */
export function fixWindingOrder(
  mesh: EditableMesh,
  options: FixWindingOrderOptions = {}
): number {
  const opts = {
    recalculateNormals: options.recalculateNormals ?? true,
    validateAfterFix: options.validateAfterFix ?? true
  };
  
  let fixedCount = 0;
  
  for (const face of mesh.faces) {
    if (face.vertices.length < 3) continue;
    
    // Get the first three vertices to determine winding order
    const v1 = mesh.getVertex(face.vertices[0]);
    const v2 = mesh.getVertex(face.vertices[1]);
    const v3 = mesh.getVertex(face.vertices[2]);
    
    if (!v1 || !v2 || !v3) continue;
    
    // Calculate the cross product to determine winding order
    const edge1 = new Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
    const edge2 = new Vector3(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
    const crossProduct = new Vector3().crossVectors(edge1, edge2);
    
    // Check if the winding order is correct (CCW)
    // Compare the stored face normal with the cross product
    if (face.normal) {
      const dotProduct = face.normal.dot(crossProduct);
      
      if (dotProduct < 0) {
        // Face is wound clockwise, need to reverse it
        face.vertices.reverse();
        face.edges.reverse();
        fixedCount++;
      }
    } else {
      // If no normal is stored, calculate one and assume it's correct
      face.normal = crossProduct.normalize();
    }
  }
  
  // Recalculate normals if requested
  if (opts.recalculateNormals) {
    recalculateNormals(mesh);
  }
  
  return fixedCount;
}

/**
 * Recalculates normals for all faces in the mesh
 * @param mesh The mesh to update
 */
export function recalculateNormals(mesh: EditableMesh): void {
  for (const face of mesh.faces) {
    face.normal = calculateFaceNormal(mesh, face);
  }
}

/**
 * Recalculates vertex normals by averaging connected face normals
 * @param mesh The mesh to update
 */
export function recalculateVertexNormals(mesh: EditableMesh): void {
  // Create a map of vertex indices to connected faces
  const vertexToFaces = new Map<number, Face[]>();
  
  for (const face of mesh.faces) {
    for (const vertexIndex of face.vertices) {
      if (!vertexToFaces.has(vertexIndex)) {
        vertexToFaces.set(vertexIndex, []);
      }
      vertexToFaces.get(vertexIndex)!.push(face);
    }
  }
  
  // Calculate average normal for each vertex
  for (const [vertexIndex, connectedFaces] of vertexToFaces.entries()) {
    const vertex = mesh.getVertex(vertexIndex);
    if (!vertex) continue;
    
    const averageNormal = new Vector3();
    let validFaces = 0;
    
    for (const face of connectedFaces) {
      if (face.normal) {
        averageNormal.add(face.normal);
        validFaces++;
      }
    }
    
    if (validFaces > 0) {
      averageNormal.divideScalar(validFaces).normalize();
      vertex.normal = averageNormal;
    }
  }
}

/**
 * Validates and fixes all geometry integrity issues
 * @param mesh The mesh to validate and fix
 * @returns A report of what was fixed
 */
export function fixGeometryIntegrity(mesh: EditableMesh): {
  windingOrderFixed: number;
  normalsRecalculated: boolean;
  vertexNormalsRecalculated: boolean;
} {
  const windingOrderFixed = fixWindingOrder(mesh, { recalculateNormals: false });
  recalculateNormals(mesh);
  recalculateVertexNormals(mesh);
  
  return {
    windingOrderFixed,
    normalsRecalculated: true,
    vertexNormalsRecalculated: true
  };
} 