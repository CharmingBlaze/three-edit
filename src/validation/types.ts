/**
 * Validation types for three-edit
 * Common type definitions used across validation modules
 */

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of error messages */
  errors: string[];
  /** Array of warning messages */
  warnings: string[];
}

/**
 * Options for primitive validation
 */
export interface PrimitiveValidationOptions {
  /** Whether to allow zero values */
  allowZero?: boolean;
  /** Whether to allow negative values */
  allowNegative?: boolean;
  /** Minimum allowed value */
  minValue?: number;
  /** Maximum allowed value */
  maxValue?: number;
  /** Whether the value is required */
  required?: boolean;
}

/**
 * Options for mesh validation
 */
export interface MeshValidationOptions {
  /** Whether to check for orphaned vertices */
  checkOrphanedVertices?: boolean;
  /** Whether to check for non-manifold edges */
  checkNonManifoldEdges?: boolean;
  /** Whether to check for boundary edges */
  checkBoundaryEdges?: boolean;
  /** Whether to check for disconnected components */
  checkConnectedComponents?: boolean;
  /** Whether to check for degenerate faces */
  checkDegenerateFaces?: boolean;
  /** Whether to check for overlapping vertices */
  checkOverlappingVertices?: boolean;
  /** Tolerance for overlapping vertex detection */
  overlapTolerance?: number;
  /** Whether to check UV coordinates */
  checkUVs?: boolean;
  /** Whether to check normals */
  checkNormals?: boolean;
}

/**
 * Options for geometry validation
 */
export interface GeometryValidationOptions {
  /** Minimum face area threshold */
  minFaceArea?: number;
  /** Whether to check for collinear vertices */
  checkCollinearVertices?: boolean;
  /** Whether to check for overlapping vertices */
  checkOverlappingVertices?: boolean;
  /** Tolerance for overlapping vertex detection */
  overlapTolerance?: number;
}

/**
 * Options for topology validation
 */
export interface TopologyValidationOptions {
  /** Whether to check for orphaned vertices */
  checkOrphanedVertices?: boolean;
  /** Whether to check for non-manifold edges */
  checkNonManifoldEdges?: boolean;
  /** Whether to check for boundary edges */
  checkBoundaryEdges?: boolean;
  /** Whether to check for disconnected components */
  checkConnectedComponents?: boolean;
  /** Whether to check for duplicate vertices in faces */
  checkDuplicateVertices?: boolean;
}

/**
 * Options for UV validation
 */
export interface UVValidationOptions {
  /** Whether to check for missing UV coordinates */
  checkMissingUVs?: boolean;
  /** Whether to check for invalid UV ranges */
  checkUVRange?: boolean;
  /** Whether to check for overlapping UVs */
  checkOverlappingUVs?: boolean;
  /** Tolerance for overlapping UV detection */
  overlapTolerance?: number;
}

/**
 * Options for normal validation
 */
export interface NormalValidationOptions {
  /** Whether to check for missing normals */
  checkMissingNormals?: boolean;
  /** Whether to check for zero-length normals */
  checkZeroNormals?: boolean;
  /** Whether to check for unit-length normals */
  checkUnitNormals?: boolean;
  /** Tolerance for normal length validation */
  lengthTolerance?: number;
}

/**
 * Comprehensive validation result with detailed statistics
 */
export interface DetailedValidationResult extends ValidationResult {
  /** Statistics about the validated mesh */
  statistics: {
    /** Number of vertices */
    vertexCount: number;
    /** Number of faces */
    faceCount: number;
    /** Number of edges */
    edgeCount: number;
    /** Number of orphaned vertices */
    orphanedVertices: number;
    /** Number of non-manifold edges */
    nonManifoldEdges: number;
    /** Number of boundary edges */
    boundaryEdges: number;
    /** Number of connected components */
    connectedComponents: number;
    /** Number of degenerate faces */
    degenerateFaces: number;
    /** Number of overlapping vertex pairs */
    overlappingVertices: number;
    /** Number of vertices with UVs */
    verticesWithUVs: number;
    /** Number of vertices with normals */
    verticesWithNormals: number;
    /** Mesh genus (number of holes) */
    genus: number;
    /** Whether mesh is watertight */
    isWatertight: boolean;
    /** Whether mesh is manifold */
    isManifold: boolean;
  };
} 