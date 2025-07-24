/**
 * Validation utility functions for three-edit
 * Pure functions for validating primitive options and geometry integrity
 */

import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Edge } from '../core/Edge';
import { clamp, isZero } from './math';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PrimitiveValidationOptions {
  allowZero?: boolean;
  allowNegative?: boolean;
  minValue?: number;
  maxValue?: number;
  required?: boolean;
}

/**
 * Validate primitive options with custom rules
 */
export function validatePrimitiveOptions(
  options: Record<string, any>,
  validators: Record<string, (value: any) => boolean>
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  for (const [key, validator] of Object.entries(validators)) {
    const value = options[key];
    if (!validator(value)) {
      result.isValid = false;
      result.errors.push(`Invalid value for ${key}: ${value}`);
    }
  }

  return result;
}

/**
 * Validate a numeric value with constraints
 */
export function validateNumericValue(
  value: any,
  name: string,
  options: PrimitiveValidationOptions = {}
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check if value is a number
  if (typeof value !== 'number' || isNaN(value)) {
    result.isValid = false;
    result.errors.push(`${name} must be a valid number, got: ${value}`);
    return result;
  }

  // Check for zero values
  if (!options.allowZero && isZero(value)) {
    result.isValid = false;
    result.errors.push(`${name} cannot be zero`);
  }

  // Check for negative values
  if (!options.allowNegative && value < 0) {
    result.isValid = false;
    result.errors.push(`${name} cannot be negative, got: ${value}`);
  }

  // Check minimum value
  if (options.minValue !== undefined && value < options.minValue) {
    result.isValid = false;
    result.errors.push(`${name} must be at least ${options.minValue}, got: ${value}`);
  }

  // Check maximum value
  if (options.maxValue !== undefined && value > options.maxValue) {
    result.isValid = false;
    result.errors.push(`${name} must be at most ${options.maxValue}, got: ${value}`);
  }

  return result;
}

/**
 * Validate cube options
 */
export function validateCubeOptions(options: any): { isValid: boolean; errors: string[] } {
  const result = { isValid: true, errors: [] as string[] };
  
  // Check required properties
  if (options.width !== undefined) {
    const widthValidation = validateNumericValue(options.width, 'width', { allowZero: false, allowNegative: false });
    if (!widthValidation.isValid) {
      result.isValid = false;
      result.errors.push(...widthValidation.errors);
    }
  }
  
  if (options.height !== undefined) {
    const heightValidation = validateNumericValue(options.height, 'height', { allowZero: false, allowNegative: false });
    if (!heightValidation.isValid) {
      result.isValid = false;
      result.errors.push(...heightValidation.errors);
    }
  }
  
  if (options.depth !== undefined) {
    const depthValidation = validateNumericValue(options.depth, 'depth', { allowZero: false, allowNegative: false });
    if (!depthValidation.isValid) {
      result.isValid = false;
      result.errors.push(...depthValidation.errors);
    }
  }
  
  // Check optional properties
  if (options.widthSegments !== undefined) {
    const widthSegmentsValidation = validateNumericValue(options.widthSegments, 'widthSegments', { minValue: 1, allowNegative: false });
    if (!widthSegmentsValidation.isValid) {
      result.isValid = false;
      result.errors.push(...widthSegmentsValidation.errors);
    }
  }
  
  if (options.heightSegments !== undefined) {
    const heightSegmentsValidation = validateNumericValue(options.heightSegments, 'heightSegments', { minValue: 1, allowNegative: false });
    if (!heightSegmentsValidation.isValid) {
      result.isValid = false;
      result.errors.push(...heightSegmentsValidation.errors);
    }
  }
  
  if (options.depthSegments !== undefined) {
    const depthSegmentsValidation = validateNumericValue(options.depthSegments, 'depthSegments', { minValue: 1, allowNegative: false });
    if (!depthSegmentsValidation.isValid) {
      result.isValid = false;
      result.errors.push(...depthSegmentsValidation.errors);
    }
  }
  
  return result;
}

/**
 * Validate sphere options
 */
export function validateSphereOptions(options: any): ValidationResult {
  const validators = {
    radius: (value: any) => validateNumericValue(value, 'radius', { allowZero: false, allowNegative: false }).isValid,
    widthSegments: (value: any) => validateNumericValue(value, 'widthSegments', { minValue: 3, allowNegative: false }).isValid,
    heightSegments: (value: any) => validateNumericValue(value, 'heightSegments', { minValue: 2, allowNegative: false }).isValid
  };

  return validatePrimitiveOptions(options, validators);
}

/**
 * Validate cylinder options
 */
export function validateCylinderOptions(options: any): ValidationResult {
  const validators = {
    radiusTop: (value: any) => validateNumericValue(value, 'radiusTop', { allowZero: false, allowNegative: false }).isValid,
    radiusBottom: (value: any) => validateNumericValue(value, 'radiusBottom', { allowZero: false, allowNegative: false }).isValid,
    height: (value: any) => validateNumericValue(value, 'height', { allowZero: false, allowNegative: false }).isValid,
    radialSegments: (value: any) => validateNumericValue(value, 'radialSegments', { minValue: 3, allowNegative: false }).isValid,
    heightSegments: (value: any) => validateNumericValue(value, 'heightSegments', { minValue: 1, allowNegative: false }).isValid
  };

  return validatePrimitiveOptions(options, validators);
}

/**
 * Validate cone options
 */
export function validateConeOptions(options: any): ValidationResult {
  const validators = {
    radius: (value: any) => validateNumericValue(value, 'radius', { allowZero: false, allowNegative: false }).isValid,
    height: (value: any) => validateNumericValue(value, 'height', { allowZero: false, allowNegative: false }).isValid,
    radialSegments: (value: any) => validateNumericValue(value, 'radialSegments', { minValue: 3, allowNegative: false }).isValid
  };

  return validatePrimitiveOptions(options, validators);
}

/**
 * Validate plane options
 */
export function validatePlaneOptions(options: any): ValidationResult {
  const validators = {
    width: (value: any) => validateNumericValue(value, 'width', { allowZero: false, allowNegative: false }).isValid,
    height: (value: any) => validateNumericValue(value, 'height', { allowZero: false, allowNegative: false }).isValid,
    widthSegments: (value: any) => validateNumericValue(value, 'widthSegments', { minValue: 1, allowNegative: false }).isValid,
    heightSegments: (value: any) => validateNumericValue(value, 'heightSegments', { minValue: 1, allowNegative: false }).isValid
  };

  return validatePrimitiveOptions(options, validators);
}

/**
 * Validate torus options
 */
export function validateTorusOptions(options: any): ValidationResult {
  const validators = {
    radius: (value: any) => validateNumericValue(value, 'radius', { allowZero: false, allowNegative: false }).isValid,
    tube: (value: any) => validateNumericValue(value, 'tube', { allowZero: false, allowNegative: false }).isValid,
    radialSegments: (value: any) => validateNumericValue(value, 'radialSegments', { minValue: 3, allowNegative: false }).isValid,
    tubularSegments: (value: any) => validateNumericValue(value, 'tubularSegments', { minValue: 3, allowNegative: false }).isValid
  };

  return validatePrimitiveOptions(options, validators);
}

/**
 * Validate topology integrity
 */
export function validateTopology(
  vertices: Vertex[],
  faces: Face[],
  edges: Edge[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check for orphaned vertices
  const usedVertices = new Set<number>();
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      usedVertices.add(vertexIndex);
    }
  }

  for (let i = 0; i < vertices.length; i++) {
    if (!usedVertices.has(i)) {
      result.warnings.push(`Orphaned vertex at index ${i}`);
    }
  }

  // Check for invalid face references
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      if (vertexIndex < 0 || vertexIndex >= vertices.length) {
        result.isValid = false;
        result.errors.push(`Face references invalid vertex index: ${vertexIndex}`);
      }
    }
  }

  // Check for invalid edge references
  for (const edge of edges) {
    if (edge.v1 < 0 || edge.v1 >= vertices.length) {
      result.isValid = false;
      result.errors.push(`Edge references invalid vertex index: ${edge.v1}`);
    }
    if (edge.v2 < 0 || edge.v2 >= vertices.length) {
      result.isValid = false;
      result.errors.push(`Edge references invalid vertex index: ${edge.v2}`);
    }
  }

  // Check for degenerate faces (less than 3 vertices)
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    if (face.vertices.length < 3) {
      result.isValid = false;
      result.errors.push(`Face ${i} has less than 3 vertices: ${face.vertices.length}`);
    }
  }

  return result;
}

/**
 * Validate geometry integrity
 */
export function validateGeometry(
  vertices: Vertex[],
  faces: Face[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check for duplicate vertices
  const vertexPositions = new Map<string, number[]>();
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const key = `${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}`;
    
    if (vertexPositions.has(key)) {
      vertexPositions.get(key)!.push(i);
    } else {
      vertexPositions.set(key, [i]);
    }
  }

  for (const [position, indices] of vertexPositions.entries()) {
    if (indices.length > 1) {
      result.warnings.push(`Duplicate vertices at position ${position}: indices ${indices.join(', ')}`);
    }
  }

  // Check for degenerate triangles
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    if (face.vertices.length >= 3) {
      const v1 = vertices[face.vertices[0]];
      const v2 = vertices[face.vertices[1]];
      const v3 = vertices[face.vertices[2]];

      if (v1 && v2 && v3) {
        const area = Math.abs(
          (v2.x - v1.x) * (v3.y - v1.y) - (v3.x - v1.x) * (v2.y - v1.y)
        ) / 2;

        if (area < 1e-10) {
          result.warnings.push(`Degenerate triangle in face ${i} with area: ${area}`);
        }
      }
    }
  }

  return result;
}

/**
 * Validate UV coordinates
 */
export function validateUVs(vertices: Vertex[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  let hasUVs = 0;
  let validUVs = 0;

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    if (vertex.uv) {
      hasUVs++;
      
      const { u, v } = vertex.uv;
      if (typeof u === 'number' && typeof v === 'number' && 
          !isNaN(u) && !isNaN(v) && 
          isFinite(u) && isFinite(v)) {
        validUVs++;
      } else {
        result.errors.push(`Invalid UV coordinates at vertex ${i}: u=${u}, v=${v}`);
      }
    }
  }

  if (hasUVs === 0) {
    result.warnings.push('No UV coordinates found');
  } else if (hasUVs !== vertices.length) {
    result.warnings.push(`Only ${hasUVs}/${vertices.length} vertices have UV coordinates`);
  }

  if (validUVs !== hasUVs) {
    result.isValid = false;
  }

  return result;
}

/**
 * Validate normals
 */
export function validateNormals(vertices: Vertex[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  let hasNormals = 0;
  let validNormals = 0;

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    if (vertex.normal) {
      hasNormals++;
      
      const { x, y, z } = vertex.normal;
      if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number' &&
          !isNaN(x) && !isNaN(y) && !isNaN(z) &&
          isFinite(x) && isFinite(y) && isFinite(z)) {
        const length = Math.sqrt(x * x + y * y + z * z);
        if (length > 1e-6) {
          validNormals++;
        } else {
          result.errors.push(`Zero-length normal at vertex ${i}`);
        }
      } else {
        result.errors.push(`Invalid normal at vertex ${i}: x=${x}, y=${y}, z=${z}`);
      }
    }
  }

  if (hasNormals === 0) {
    result.warnings.push('No normals found');
  } else if (hasNormals !== vertices.length) {
    result.warnings.push(`Only ${hasNormals}/${vertices.length} vertices have normals`);
  }

  if (validNormals !== hasNormals) {
    result.isValid = false;
  }

  return result;
}

/**
 * Comprehensive mesh validation
 */
export function validateMesh(
  vertices: Vertex[],
  faces: Face[],
  edges: Edge[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Run all validation checks
  const topologyResult = validateTopology(vertices, faces, edges);
  const geometryResult = validateGeometry(vertices, faces);
  const uvResult = validateUVs(vertices);
  const normalResult = validateNormals(vertices);

  // Combine results
  result.isValid = topologyResult.isValid && geometryResult.isValid && 
                   uvResult.isValid && normalResult.isValid;
  
  result.errors.push(...topologyResult.errors);
  result.errors.push(...geometryResult.errors);
  result.errors.push(...uvResult.errors);
  result.errors.push(...normalResult.errors);
  
  result.warnings.push(...topologyResult.warnings);
  result.warnings.push(...geometryResult.warnings);
  result.warnings.push(...uvResult.warnings);
  result.warnings.push(...normalResult.warnings);

  return result;
} 

/**
 * Find orphaned vertices (vertices not used in any face)
 */
export function findOrphanedVertices(vertices: Vertex[], faces: Face[]): number[] {
  const usedVertices = new Set<number>();
  
  // Mark all vertices used in faces
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      usedVertices.add(vertexIndex);
    }
  }
  
  // Find vertices not used in any face
  const orphaned: number[] = [];
  for (let i = 0; i < vertices.length; i++) {
    if (!usedVertices.has(i)) {
      orphaned.push(i);
    }
  }
  
  return orphaned;
}

/**
 * Merge close vertices within a tolerance (with faces)
 */
export function mergeVerticesWithFaces(
  vertices: Vertex[],
  faces: Face[],
  tolerance: number = 0.001
): { newVertices: Vertex[]; newFaces: Face[]; mergedCount: number } {
  const newVertices: Vertex[] = [];
  const vertexMap = new Map<number, number>(); // old index -> new index
  const mergedCount = 0;
  
  // Find unique vertices within tolerance
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    let found = false;
    
    for (let j = 0; j < newVertices.length; j++) {
      const existingVertex = newVertices[j];
      const distance = Math.sqrt(
        Math.pow(vertex.x - existingVertex.x, 2) +
        Math.pow(vertex.y - existingVertex.y, 2) +
        Math.pow(vertex.z - existingVertex.z, 2)
      );
      
      if (distance <= tolerance) {
        vertexMap.set(i, j);
        found = true;
        break;
      }
    }
    
    if (!found) {
      vertexMap.set(i, newVertices.length);
      newVertices.push(vertex.clone());
    }
  }
  
  // Update faces to use new vertex indices
  const newFaces: Face[] = faces.map(face => {
    const newVertexIndices = face.vertices.map(oldIndex => vertexMap.get(oldIndex) || 0);
    return new Face(newVertexIndices, face.edges);
  });
  
  return {
    newVertices,
    newFaces,
    mergedCount: vertices.length - newVertices.length
  };
} 