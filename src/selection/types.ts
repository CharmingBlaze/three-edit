/**
 * Ray selection options
 */
export interface RaySelectionOptions {
  /** Maximum distance for selection */
  maxDistance?: number;
  /** Whether to select faces */
  selectFaces?: boolean;
  /** Whether to select vertices */
  selectVertices?: boolean;
  /** Whether to select edges */
  selectEdges?: boolean;
  /** Tolerance for intersection tests */
  tolerance?: number;
}

/**
 * Box selection options
 */
export interface BoxSelectionOptions {
  /** Whether to select faces */
  selectFaces?: boolean;
  /** Whether to select vertices */
  selectVertices?: boolean;
  /** Whether to select edges */
  selectEdges?: boolean;
  /** Whether to select elements that are partially inside the box */
  partialSelection?: boolean;
}

/**
 * Lasso selection options
 */
export interface LassoSelectionOptions {
  /** Whether to select faces */
  selectFaces?: boolean;
  /** Whether to select vertices */
  selectVertices?: boolean;
  /** Whether to select edges */
  selectEdges?: boolean;
  /** Tolerance for point-in-polygon tests */
  tolerance?: number;
}

/**
 * Connected selection options
 */
export interface ConnectedSelectionOptions {
  /** Whether to select faces */
  selectFaces?: boolean;
  /** Whether to select vertices */
  selectVertices?: boolean;
  /** Whether to select edges */
  selectEdges?: boolean;
  /** Maximum depth for connected selection */
  maxDepth?: number;
}

/**
 * Similar selection options
 */
export interface SimilarSelectionOptions {
  /** Whether to select faces */
  selectFaces?: boolean;
  /** Whether to select vertices */
  selectVertices?: boolean;
  /** Whether to select edges */
  selectEdges?: boolean;
  /** Similarity threshold */
  similarityThreshold?: number;
} 