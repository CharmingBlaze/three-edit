import { EditableMesh } from '../core/EditableMesh';
import { validateGeometryIntegrity } from '../validation/validateGeometryIntegrity';
import { 
  performCSGOperation, 
  csgUnion as performCSGUnion, 
  csgSubtract as performCSGSubtract, 
  csgIntersect as performCSGIntersect,
  CSGResult
} from './boolean/csgOperations';
import { CSGOptions } from './boolean/types';

/**
 * Boolean operation options
 */
export interface BooleanOptions {
  /** Whether to validate the result mesh */
  validate?: boolean;
  /** Whether to repair geometry issues automatically */
  repair?: boolean;
  /** Tolerance for floating point comparisons */
  tolerance?: number;
  /** Whether to preserve material assignments */
  preserveMaterials?: boolean;
  /** Whether to merge coincident vertices */
  mergeVertices?: boolean;
}

/**
 * Boolean operation result
 */
export interface BooleanResult {
  /** The resulting mesh */
  mesh: EditableMesh;
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
  /** Validation results if validation was performed */
  validation?: any;
  /** Statistics about the operation */
  statistics?: {
    inputVertices: number;
    inputFaces: number;
    outputVertices: number;
    outputFaces: number;
    processingTime: number;
  };
}

/**
 * Perform union operation between two meshes
 * @param meshA First mesh
 * @param meshB Second mesh
 * @param options Boolean operation options
 * @returns Boolean operation result
 */
export function booleanUnion(meshA: EditableMesh, meshB: EditableMesh, options: BooleanOptions = {}): BooleanResult {
  return performCSGUnion(meshA, meshB, options);
}

/**
 * Perform intersection operation between two meshes
 * @param meshA First mesh
 * @param meshB Second mesh
 * @param options Boolean operation options
 * @returns Boolean operation result
 */
export function booleanIntersection(meshA: EditableMesh, meshB: EditableMesh, options: BooleanOptions = {}): BooleanResult {
  return performCSGIntersect(meshA, meshB, options);
}

/**
 * Perform difference operation between two meshes
 * @param meshA First mesh
 * @param meshB Second mesh
 * @param options Boolean operation options
 * @returns Boolean operation result
 */
export function booleanDifference(meshA: EditableMesh, meshB: EditableMesh, options: BooleanOptions = {}): BooleanResult {
  return performCSGSubtract(meshA, meshB, options);
}

/**
 * Generic boolean operation function
 * @param meshA First mesh
 * @param meshB Second mesh
 * @param operation Type of boolean operation
 * @param options Boolean operation options
 * @returns Boolean operation result
 */
export function booleanOperation(
  meshA: EditableMesh, 
  meshB: EditableMesh, 
  operation: 'union' | 'intersection' | 'difference',
  options: BooleanOptions = {}
): BooleanResult {
  switch (operation) {
    case 'union':
      return booleanUnion(meshA, meshB, options);
    case 'intersection':
      return booleanIntersection(meshA, meshB, options);
    case 'difference':
      return booleanDifference(meshA, meshB, options);
    default:
      return {
        mesh: new EditableMesh(),
        success: false,
        error: `Unknown boolean operation: ${operation}`
      };
  }
}

/**
 * Advanced boolean operations with additional options
 */
export const BooleanAdvanced = {
  /**
   * Union operation with advanced options
   */
  unionWithOptions(
    meshA: EditableMesh,
    meshB: EditableMesh,
    options: BooleanOptions & {
      mergeThreshold?: number;
      removeInternal?: boolean;
    } = {}
  ): BooleanResult {
    return booleanUnion(meshA, meshB, options);
  },

  /**
   * Subtract operation with advanced options
   */
  subtractWithOptions(
    meshA: EditableMesh,
    meshB: EditableMesh,
    options: BooleanOptions & {
      keepOriginal?: boolean;
      invertResult?: boolean;
    } = {}
  ): BooleanResult {
    return booleanDifference(meshA, meshB, options);
  },

  /**
   * Intersect operation with advanced options
   */
  intersectWithOptions(
    meshA: EditableMesh,
    meshB: EditableMesh,
    options: BooleanOptions & {
      partialIntersection?: boolean;
      tolerance?: number;
    } = {}
  ): BooleanResult {
    return booleanIntersection(meshA, meshB, options);
  }
};