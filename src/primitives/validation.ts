import { EditableMesh } from '../core/EditableMesh';
import { PrimitiveValidationResult } from './types';
import { Vector3 } from 'three';

/**
 * Validate a primitive mesh according to the standard
 * @param mesh The mesh to validate
 * @param primitiveType Type of primitive for error messages
 * @returns Validation result
 */
export function validatePrimitive(mesh: EditableMesh, primitiveType: string): PrimitiveValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic validation
  if (!mesh.vertices || mesh.vertices.length === 0) {
    errors.push(`${primitiveType} has no vertices`);
  }
  
  if (!mesh.faces || mesh.faces.length === 0) {
    errors.push(`${primitiveType} has no faces`);
  }
  
  if (!mesh.edges || mesh.edges.length === 0) {
    errors.push(`${primitiveType} has no edges`);
  }
  
  // Check for vertices with UVs
  const verticesWithUVs = mesh.vertices.filter(v => v.uv);
  if (verticesWithUVs.length === 0) {
    warnings.push(`${primitiveType} has no UV coordinates`);
  }
  
  // Check for valid face winding and topology
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    
    // Check minimum vertex count
    if (face.vertices.length < 3) {
      errors.push(`Face ${i} has less than 3 vertices`);
      continue;
    }
    
    // Check for valid vertex references
    for (const vertexId of face.vertices) {
      if (!mesh.vertices[vertexId]) {
        errors.push(`Face ${i} references invalid vertex ${vertexId}`);
      }
    }
    
    // Check for valid edge references
    for (const edgeId of face.edges) {
      if (!mesh.edges[edgeId]) {
        errors.push(`Face ${i} references invalid edge ${edgeId}`);
      }
    }
    
    // Check face normal
    if (!face.normal) {
      warnings.push(`Face ${i} has no normal`);
    } else {
      // Validate normal is unit vector
      const length = Math.sqrt(face.normal.x ** 2 + face.normal.y ** 2 + face.normal.z ** 2);
      if (Math.abs(length - 1) > 0.001) {
        warnings.push(`Face ${i} normal is not unit length (${length.toFixed(3)})`);
      }
    }
    
    // Check winding order (basic check)
    if (face.vertices.length >= 3) {
      const v1 = mesh.vertices[face.vertices[0]];
      const v2 = mesh.vertices[face.vertices[1]];
      const v3 = mesh.vertices[face.vertices[2]];
      
      if (v1 && v2 && v3) {
        const edge1 = new Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
        const edge2 = new Vector3(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
        const crossProduct = new Vector3().crossVectors(edge1, edge2);
        
        if (face.normal && crossProduct.dot(face.normal) < 0) {
          warnings.push(`Face ${i} may have incorrect winding order`);
        }
      }
    }
  }
  
  // Check edge topology
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    
    // Check vertex references
    if (!mesh.vertices[edge.v1]) {
      errors.push(`Edge ${i} references invalid vertex ${edge.v1}`);
    }
    if (!mesh.vertices[edge.v2]) {
      errors.push(`Edge ${i} references invalid vertex ${edge.v2}`);
    }
    
    // Check for degenerate edges
    if (edge.v1 === edge.v2) {
      errors.push(`Edge ${i} is degenerate (same vertex at both ends)`);
    }
  }
  
  // Check for orphaned vertices
  const usedVertices = new Set<number>();
  for (const face of mesh.faces) {
    for (const vertexId of face.vertices) {
      usedVertices.add(vertexId);
    }
  }
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    if (!usedVertices.has(i)) {
      warnings.push(`Vertex ${i} is not used by any face`);
    }
  }
  
  // Check for orphaned edges
  const usedEdges = new Set<number>();
  for (const face of mesh.faces) {
    for (const edgeId of face.edges) {
      usedEdges.add(edgeId);
    }
  }
  
  for (let i = 0; i < mesh.edges.length; i++) {
    if (!usedEdges.has(i)) {
      warnings.push(`Edge ${i} is not used by any face`);
    }
  }
  
  // Count unique materials
  const materialIds = new Set(mesh.faces.map(f => f.materialIndex));
  
  // Check for material consistency
  if (materialIds.size === 0) {
    warnings.push(`${primitiveType} has no material assignments`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      vertexCount: mesh.vertices.length,
      edgeCount: mesh.edges.length,
      faceCount: mesh.faces.length,
      materialCount: materialIds.size
    }
  };
}

/**
 * Validate UV mapping consistency
 * @param mesh The mesh to validate
 * @returns Array of UV-related warnings
 */
export function validateUVMapping(mesh: EditableMesh): string[] {
  const warnings: string[] = [];
  
  // Check if all vertices have UVs
  const verticesWithoutUVs = mesh.vertices.filter(v => !v.uv);
  if (verticesWithoutUVs.length > 0) {
    warnings.push(`${verticesWithoutUVs.length} vertices have no UV coordinates`);
  }
  
  // Check for UV seams (vertices at same position with different UVs)
  const positionMap = new Map<string, Set<string>>();
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const posKey = `${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}`;
    
    if (!positionMap.has(posKey)) {
      positionMap.set(posKey, new Set());
    }
    
    const uvKey = vertex.uv ? `${vertex.uv.u.toFixed(6)},${vertex.uv.v.toFixed(6)}` : 'no-uv';
    positionMap.get(posKey)!.add(uvKey);
  }
  
  let seamCount = 0;
  for (const [posKey, uvSet] of positionMap.entries()) {
    if (uvSet.size > 1) {
      seamCount++;
    }
  }
  
  if (seamCount > 0) {
    warnings.push(`${seamCount} UV seams detected (vertices at same position with different UVs)`);
  }
  
  return warnings;
}

/**
 * Validate material assignments
 * @param mesh The mesh to validate
 * @returns Array of material-related warnings
 */
export function validateMaterials(mesh: EditableMesh): string[] {
  const warnings: string[] = [];
  
  // Check for consistent material assignments
  const materialCounts = new Map<number, number>();
  
  for (const face of mesh.faces) {
    const materialId = face.materialIndex;
    materialCounts.set(materialId, (materialCounts.get(materialId) || 0) + 1);
  }
  
  if (materialCounts.size === 0) {
    warnings.push('No material assignments found');
  } else if (materialCounts.size === 1) {
    warnings.push('All faces use the same material (consider using a single material)');
  }
  
  // Check for faces with invalid material indices
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    if (face.materialIndex < 0) {
      warnings.push(`Face ${i} has negative material index`);
    }
  }
  
  return warnings;
} 