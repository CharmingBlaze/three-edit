import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { calculateFaceNormal } from '../utils/mathUtils';

/**
 * Geometry integrity validation result
 */
export interface GeometryIntegrityResult {
  /** Whether the mesh is valid */
  valid: boolean;
  /** List of validation issues found */
  issues: string[];
  /** Faces with incorrect winding order */
  incorrectWindingFaces: number[];
  /** Faces with missing or invalid normals */
  invalidNormalFaces: number[];
  /** Vertices with missing UVs */
  missingUVVertices: number[];
  /** Faces with invalid material indices */
  invalidMaterialFaces: number[];
  /** Duplicate vertices */
  duplicateVertices: number[][];
  /** Orphaned vertices (not used by any face) */
  orphanedVertices: number[];
  /** Orphaned edges (not used by any face) */
  orphanedEdges: number[];
  /** Faces with invalid vertex indices */
  invalidVertexFaces: number[];
  /** Faces with invalid edge indices */
  invalidEdgeFaces: number[];
}

/**
 * Validates the geometry integrity of a mesh
 * @param mesh The mesh to validate
 * @returns Validation result
 */
export function validateGeometryIntegrity(mesh: EditableMesh): GeometryIntegrityResult {
  const result: GeometryIntegrityResult = {
    valid: true,
    issues: [],
    incorrectWindingFaces: [],
    invalidNormalFaces: [],
    missingUVVertices: [],
    invalidMaterialFaces: [],
    duplicateVertices: [],
    orphanedVertices: [],
    orphanedEdges: [],
    invalidVertexFaces: [],
    invalidEdgeFaces: []
  };

  // Check for valid vertex indices
  const validVertexIndices = new Set<number>();
  for (let i = 0; i < mesh.vertices.length; i++) {
    validVertexIndices.add(i);
  }

  // Check for valid edge indices
  const validEdgeIndices = new Set<number>();
  for (let i = 0; i < mesh.edges.length; i++) {
    validEdgeIndices.add(i);
  }

  // Check faces for invalid indices and other issues
  for (let faceIndex = 0; faceIndex < mesh.faces.length; faceIndex++) {
    const face = mesh.faces[faceIndex];
    
    // Check for invalid vertex indices
    for (const vertexIndex of face.vertices) {
      if (!validVertexIndices.has(vertexIndex)) {
        result.invalidVertexFaces.push(faceIndex);
        result.issues.push(`Face ${faceIndex} has invalid vertex index ${vertexIndex}`);
        result.valid = false;
      }
    }
    
    // Check for invalid edge indices
    for (const edgeIndex of face.edges) {
      if (!validEdgeIndices.has(edgeIndex)) {
        result.invalidEdgeFaces.push(faceIndex);
        result.issues.push(`Face ${faceIndex} has invalid edge index ${edgeIndex}`);
        result.valid = false;
      }
    }
    
    // Check for minimum vertex count
    if (face.vertices.length < 3) {
      result.issues.push(`Face ${faceIndex} has less than 3 vertices`);
      result.valid = false;
    }
    
    // Check winding order
    if (face.vertices.length >= 3 && face.normal) {
      const v1 = mesh.getVertex(face.vertices[0]);
      const v2 = mesh.getVertex(face.vertices[1]);
      const v3 = mesh.getVertex(face.vertices[2]);
      
      if (v1 && v2 && v3) {
        // Calculate the normal that would result from CCW winding
        // For CCW winding, we need to ensure the cross product points in the same direction as the face normal
        const edge1 = new Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
        const edge2 = new Vector3(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
        const crossProduct = new Vector3().crossVectors(edge1, edge2);
        
        // Compare the face's stored normal with the cross product
        // If the dot product is negative, the winding order is incorrect
        const dotProduct = face.normal.dot(crossProduct);
        console.log(`Face ${faceIndex} winding check:`, {
          vertices: face.vertices,
          v1: v1,
          v2: v2,
          v3: v3,
          edge1,
          edge2,
          crossProduct,
          faceNormal: face.normal,
          dotProduct
        });
        
        // The issue is that we need to check if the face normal is opposite to what it should be
        // If the face normal is opposite to the cross product, then the winding is incorrect
        if (dotProduct < 0) {
          result.incorrectWindingFaces.push(faceIndex);
          result.issues.push(`Face ${faceIndex} has incorrect winding order (should be CCW)`);
          result.valid = false;
        }
      }
    }
    
    // Check face normal
    if (!face.normal) {
      result.invalidNormalFaces.push(faceIndex);
      result.issues.push(`Face ${faceIndex} has no normal`);
      result.valid = false;
    }
    
    // Check material index
    if (face.materialIndex < 0) {
      result.invalidMaterialFaces.push(faceIndex);
      result.issues.push(`Face ${faceIndex} has negative material index`);
      result.valid = false;
    }
  }

  // Check for missing UVs
  for (let vertexIndex = 0; vertexIndex < mesh.vertices.length; vertexIndex++) {
    const vertex = mesh.vertices[vertexIndex];
    if (!vertex.uv) {
      result.missingUVVertices.push(vertexIndex);
      result.issues.push(`Vertex ${vertexIndex} has no UV coordinates`);
      result.valid = false;
    }
  }

  // Check for duplicate vertices
  const vertexPositions = new Map<string, number[]>();
  for (let vertexIndex = 0; vertexIndex < mesh.vertices.length; vertexIndex++) {
    const vertex = mesh.vertices[vertexIndex];
    const key = `${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}`;
    
    if (!vertexPositions.has(key)) {
      vertexPositions.set(key, []);
    }
    vertexPositions.get(key)!.push(vertexIndex);
  }
  
  for (const [key, indices] of vertexPositions.entries()) {
    if (indices.length > 1) {
      result.duplicateVertices.push(indices);
      result.issues.push(`Duplicate vertices found at position ${key}: ${indices.join(', ')}`);
      result.valid = false;
    }
  }

  // Check for orphaned vertices
  const usedVertices = new Set<number>();
  for (const face of mesh.faces) {
    for (const vertexIndex of face.vertices) {
      usedVertices.add(vertexIndex);
    }
  }
  
  for (let vertexIndex = 0; vertexIndex < mesh.vertices.length; vertexIndex++) {
    if (!usedVertices.has(vertexIndex)) {
      result.orphanedVertices.push(vertexIndex);
      result.issues.push(`Vertex ${vertexIndex} is not used by any face`);
      result.valid = false;
    }
  }

  // Check for orphaned edges
  const usedEdges = new Set<number>();
  for (const face of mesh.faces) {
    for (const edgeIndex of face.edges) {
      usedEdges.add(edgeIndex);
    }
  }
  
  for (let edgeIndex = 0; edgeIndex < mesh.edges.length; edgeIndex++) {
    if (!usedEdges.has(edgeIndex)) {
      result.orphanedEdges.push(edgeIndex);
      result.issues.push(`Edge ${edgeIndex} is not used by any face`);
      result.valid = false;
    }
  }

  return result;
}

/**
 * Checks if a mesh has flipped faces (inside-out geometry)
 * @param mesh The mesh to check
 * @returns Array of face indices that appear to be flipped
 */
export function checkFlippedFaces(mesh: EditableMesh): number[] {
  const flippedFaces: number[] = [];
  
  for (let faceIndex = 0; faceIndex < mesh.faces.length; faceIndex++) {
    const face = mesh.faces[faceIndex];
    
    if (face.vertices.length < 3) continue;
    
    const normal = calculateFaceNormal(mesh, face);
    if (!normal) continue;
    
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
    const dotProduct = normal.dot(crossProduct);
    
    if (dotProduct < 0) {
      flippedFaces.push(faceIndex);
    }
  }
  
  return flippedFaces;
}

/**
 * Validates that all faces have valid material indices
 * @param mesh The mesh to validate
 * @returns Validation result
 */
export function validateMaterialIndices(mesh: EditableMesh): {
  valid: boolean;
  issues: string[];
  invalidFaces: number[];
} {
  const issues: string[] = [];
  const invalidFaces: number[] = [];
  
  for (let faceIndex = 0; faceIndex < mesh.faces.length; faceIndex++) {
    const face = mesh.faces[faceIndex];
    
    if (face.materialIndex < 0) {
      issues.push(`Face ${faceIndex} has negative material index ${face.materialIndex}`);
      invalidFaces.push(faceIndex);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    invalidFaces
  };
}

/**
 * Validates that all vertices have UV coordinates
 * @param mesh The mesh to validate
 * @returns Validation result
 */
export function validateUVCoordinates(mesh: EditableMesh): {
  valid: boolean;
  issues: string[];
  missingUVVertices: number[];
} {
  const issues: string[] = [];
  const missingUVVertices: number[] = [];
  
  for (let vertexIndex = 0; vertexIndex < mesh.vertices.length; vertexIndex++) {
    const vertex = mesh.vertices[vertexIndex];
    
    if (!vertex.uv) {
      issues.push(`Vertex ${vertexIndex} has no UV coordinates`);
      missingUVVertices.push(vertexIndex);
    } else {
      // Check for valid UV range (optional)
      if (vertex.uv.u < 0 || vertex.uv.u > 1 || vertex.uv.v < 0 || vertex.uv.v > 1) {
        issues.push(`Vertex ${vertexIndex} has UV coordinates outside [0,1] range: (${vertex.uv.u}, ${vertex.uv.v})`);
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    missingUVVertices
  };
}

/**
 * Comprehensive validation that checks all critical rendering issues
 * @param mesh The mesh to validate
 * @returns Complete validation report
 */
export function validateMeshForRendering(mesh: EditableMesh): {
  valid: boolean;
  geometryIntegrity: GeometryIntegrityResult;
  flippedFaces: number[];
  materialValidation: { valid: boolean; issues: string[]; invalidFaces: number[] };
  uvValidation: { valid: boolean; issues: string[]; missingUVVertices: number[] };
  summary: string[];
} {
  const geometryIntegrity = validateGeometryIntegrity(mesh);
  const flippedFaces = checkFlippedFaces(mesh);
  const materialValidation = validateMaterialIndices(mesh);
  const uvValidation = validateUVCoordinates(mesh);
  
  const valid = geometryIntegrity.valid && 
                flippedFaces.length === 0 && 
                materialValidation.valid && 
                uvValidation.valid;
  
  const summary: string[] = [];
  if (!valid) {
    summary.push(`Mesh validation failed with ${geometryIntegrity.issues.length + flippedFaces.length + materialValidation.issues.length + uvValidation.issues.length} issues`);
  } else {
    summary.push('Mesh is valid for rendering');
  }
  
  return {
    valid,
    geometryIntegrity,
    flippedFaces,
    materialValidation,
    uvValidation,
    summary
  };
} 