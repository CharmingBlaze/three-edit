import { Vector3 } from 'three';

/**
 * Options for deformation operations
 */
export interface DeformOptions {
  /** Axis of deformation (default: Y-axis) */
  axis?: Vector3;
  /** Center point of deformation (default: origin) */
  center?: Vector3;
  /** Whether to keep original geometry */
  keepOriginal?: boolean;
  /** Material index for new faces */
  materialIndex?: number;
}

/**
 * Options for bend operations
 */
export interface BendOptions extends DeformOptions {
  /** Bend angle in radians */
  angle?: number;
  /** Direction of the bend */
  direction?: Vector3;
  /** Start point of the bend region */
  startPoint?: Vector3;
  /** End point of the bend region */
  endPoint?: Vector3;
}

/**
 * Options for twist operations
 */
export interface TwistOptions extends DeformOptions {
  /** Twist angle in radians */
  angle?: number;
  /** Start point of the twist region */
  startPoint?: Vector3;
  /** End point of the twist region */
  endPoint?: Vector3;
}

/**
 * Options for taper operations
 */
export interface TaperOptions extends DeformOptions {
  /** Taper factor (0 = no taper, 1 = full taper) */
  factor?: number;
  /** Start point of the taper region */
  startPoint?: Vector3;
  /** End point of the taper region */
  endPoint?: Vector3;
  /** Whether to taper uniformly or per-axis */
  uniform?: boolean;
}

/**
 * Deformation type union
 */
export type DeformType = 'bend' | 'twist' | 'taper'; 