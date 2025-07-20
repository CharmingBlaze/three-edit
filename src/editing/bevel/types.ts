import { Vector3 } from 'three';

/**
 * Options for beveling operations
 */
export interface BevelOptions {
  /** Distance of the bevel */
  distance?: number;
  /** Number of segments in the bevel */
  segments?: number;
  /** Profile of the bevel (0 = linear, 1 = curved) */
  profile?: number;
  /** Material index for new faces */
  materialIndex?: number;
  /** Whether to keep original geometry */
  keepOriginal?: boolean;
  /** Tolerance for vertex welding */
  weldTolerance?: number;
}

/**
 * Options for edge beveling
 */
export interface EdgeBevelOptions extends BevelOptions {
  /** Direction of the bevel (optional, auto-calculated if not provided) */
  direction?: Vector3;
  /** Whether to bevel both sides of the edge */
  bothSides?: boolean;
}

/**
 * Options for vertex beveling
 */
export interface VertexBevelOptions extends BevelOptions {
  /** Direction of the bevel (optional, auto-calculated if not provided) */
  direction?: Vector3;
  /** Whether to bevel all connected edges */
  allEdges?: boolean;
}

/**
 * Options for face beveling
 */
export interface FaceBevelOptions extends BevelOptions {
  /** Direction of the bevel (optional, auto-calculated if not provided) */
  direction?: Vector3;
  /** Whether to bevel all edges of the face */
  allEdges?: boolean;
} 