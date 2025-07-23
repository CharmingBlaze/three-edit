import { Vector3 } from 'three';
import { EditableMesh, Face } from '../core/index.ts';
import { calculateFaceNormal } from '../utils/mathUtils.ts';

/**
 * Validation result for mesh integrity checks
 */
export interface ValidationResult {
  /** Whether the mesh is valid */
  isValid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
  /** Array of face indices with flipped normals */
  flippedFaces: number[];
  /** Array of vertex indices that are duplicated */
  duplicateVertices: number[];
  /** Array of edge indices that are duplicated */
  duplicateEdges: number[];
  /** Array of face indices that are invalid */
  invalidFaces: number[];
}

/**
 * Validates the integrity of a mesh
 * @param mesh The mesh to validate
 * @param options Optional validation options
 * @returns Validation result with detailed information
 */
export function validateMesh(mesh: EditableMesh, options: {
  allowNonManifold?: boolean;
  allowBoundaryEdges?: boolean;
} = {}): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    flippedFaces: [],
    duplicateVertices: [],
    duplicateEdges: [],
    invalidFaces: [],
  };

  // Check for empty mesh
  if (mesh.vertices.length === 0) {
    result.errors.push('Mesh has no vertices');
    result.isValid = false;
    return result;
  }

  if (mesh.faces.length === 0) {
    result.errors.push('Mesh has no faces');
    result.isValid = false;
    return result;
  }

  // Validate vertices
  validateVertices(mesh, result);

  // Validate edges
  validateEdges(mesh, result);

  // Validate faces
  validateFaces(mesh, result);

  // Check for duplicate vertices
  findDuplicateVertices(mesh, result);

  // Check for duplicate edges
  findDuplicateEdges(mesh, result);

  // Check for flipped faces
  findFlippedFaces(mesh, result);

  // Check for non-manifold geometry
  checkNonManifoldGeometry(mesh, result, options);

  return result;
}

/**
 * Validates vertices in the mesh
 */
function validateVertices(mesh: EditableMesh, result: ValidationResult): void {
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    
    // Check for NaN or infinite values
    if (isNaN(vertex.x) || isNaN(vertex.y) || isNaN(vertex.z)) {
      result.errors.push(`Vertex ${i} has NaN coordinates`);
      result.isValid = false;
    }
    
    if (!isFinite(vertex.x) || !isFinite(vertex.y) || !isFinite(vertex.z)) {
      result.errors.push(`Vertex ${i} has infinite coordinates`);
      result.isValid = false;
    }
  }
}

/**
 * Validates edges in the mesh
 */
function validateEdges(mesh: EditableMesh, result: ValidationResult): void {
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    
    // Check if edge vertices exist
    if (edge.v1 < 0 || edge.v1 >= mesh.vertices.length) {
      result.errors.push(`Edge ${i} references invalid vertex ${edge.v1}`);
      result.isValid = false;
    }
    
    if (edge.v2 < 0 || edge.v2 >= mesh.vertices.length) {
      result.errors.push(`Edge ${i} references invalid vertex ${edge.v2}`);
      result.isValid = false;
    }
    
    // Check for self-loops
    if (edge.v1 === edge.v2) {
      result.errors.push(`Edge ${i} is a self-loop`);
      result.isValid = false;
    }
  }
}

/**
 * Validates faces in the mesh
 */
function validateFaces(mesh: EditableMesh, result: ValidationResult): void {
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    
    // Check if face has enough vertices
    if (face.vertices.length < 3) {
      result.errors.push(`Face ${i} has less than 3 vertices`);
      result.isValid = false;
      result.invalidFaces.push(i);
      continue;
    }
    
    // Check if face vertices exist
    for (const vertexIndex of face.vertices) {
      if (vertexIndex < 0 || vertexIndex >= mesh.vertices.length) {
        result.errors.push(`Face ${i} references invalid vertex ${vertexIndex}`);
        result.isValid = false;
        result.invalidFaces.push(i);
        break;
      }
    }
    
    // Check if face edges exist
    for (const edgeIndex of face.edges) {
      if (edgeIndex < 0 || edgeIndex >= mesh.edges.length) {
        result.errors.push(`Face ${i} references invalid edge ${edgeIndex}`);
        result.isValid = false;
        result.invalidFaces.push(i);
        break;
      }
    }
    
    // Check for degenerate faces (zero area)
    if (face.vertices.length >= 3) {
      const area = calculateFaceArea(mesh, face);
      if (area < 1e-10) {
        result.warnings.push(`Face ${i} has zero area`);
      }
    }
  }
}

/**
 * Finds duplicate vertices in the mesh
 */
function findDuplicateVertices(mesh: EditableMesh, result: ValidationResult): void {
  const vertexMap = new Map<string, number[]>();
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const key = `${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}`;
    
    if (!vertexMap.has(key)) {
      vertexMap.set(key, []);
    }
    vertexMap.get(key)!.push(i);
  }
  
  for (const [_key, indices] of vertexMap) {
    if (indices.length > 1) {
      result.warnings.push(`Duplicate vertices found: ${indices.join(', ')}`);
      result.duplicateVertices.push(...indices);
    }
  }
}

/**
 * Finds duplicate edges in the mesh
 */
function findDuplicateEdges(mesh: EditableMesh, result: ValidationResult): void {
  const edgeMap = new Map<string, number[]>();
  
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    const key = `${Math.min(edge.v1, edge.v2)},${Math.max(edge.v1, edge.v2)}`;
    
    if (!edgeMap.has(key)) {
      edgeMap.set(key, []);
    }
    edgeMap.get(key)!.push(i);
  }
  
  for (const [_key, indices] of edgeMap) {
    if (indices.length > 1) {
      result.warnings.push(`Duplicate edges found: ${indices.join(', ')}`);
      result.duplicateEdges.push(...indices);
    }
  }
}

/**
 * Finds faces with incorrect winding order
 */
function findFlippedFaces(mesh: EditableMesh, result: ValidationResult): void {
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    
    if (face.vertices.length < 3) continue;
    
    // Calculate the face normal
    const computedNormal = calculateFaceNormal(mesh, face);
    if (!computedNormal) continue;
    
    // If the face has a stored normal, compare it
    if (face.normal) {
      const dotProduct = face.normal.dot(computedNormal);
      if (dotProduct < 0) {
        result.warnings.push(`Face ${i} has incorrect winding order`);
        result.flippedFaces.push(i);
      }
    } else {
      // Store the computed normal
      face.normal = computedNormal;
    }
  }
}

/**
 * Checks for non-manifold geometry
 */
function checkNonManifoldGeometry(
  mesh: EditableMesh, 
  result: ValidationResult, 
  options: { allowNonManifold?: boolean; allowBoundaryEdges?: boolean } = {}
): void {
  // Count edge usage
  const edgeUsage = new Map<number, number>();
  
  for (const face of mesh.faces) {
    for (const edgeIndex of face.edges) {
      edgeUsage.set(edgeIndex, (edgeUsage.get(edgeIndex) || 0) + 1);
    }
  }
  
  // Check for edges used by more than 2 faces (non-manifold)
  for (const [edgeIndex, usage] of edgeUsage) {
    if (usage > 2 && !options.allowNonManifold) {
      result.errors.push(`Edge ${edgeIndex} is used by ${usage} faces (non-manifold)`);
      result.isValid = false;
    } else if (usage > 2 && options.allowNonManifold) {
      result.warnings.push(`Edge ${edgeIndex} is used by ${usage} faces (non-manifold)`);
    }
  }
  
  // Check for boundary edges (used by only 1 face)
  const boundaryEdges: number[] = [];
  for (const [edgeIndex, usage] of edgeUsage) {
    if (usage === 1) {
      boundaryEdges.push(edgeIndex);
    }
  }
  
  if (boundaryEdges.length > 0 && !options.allowBoundaryEdges) {
    result.warnings.push(`Mesh has ${boundaryEdges.length} boundary edges`);
  }
}

/**
 * Calculates the area of a face
 */
function calculateFaceArea(mesh: EditableMesh, face: Face): number {
  if (face.vertices.length < 3) return 0;
  
  let area = 0;
  
  // Calculate area using triangulation
  for (let i = 1; i < face.vertices.length - 1; i++) {
    const v0 = mesh.getVertex(face.vertices[0]);
    const v1 = mesh.getVertex(face.vertices[i]);
    const v2 = mesh.getVertex(face.vertices[i + 1]);
    
    if (v0 && v1 && v2) {
      const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
      const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
      const cross = new Vector3().crossVectors(edge1, edge2);
      area += cross.length() * 0.5;
    }
  }
  
  return area;
}
