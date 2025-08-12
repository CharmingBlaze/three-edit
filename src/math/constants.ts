/**
 * Mathematical constants for three-edit
 * Centralized constants to avoid magic numbers throughout the codebase
 */

/**
 * Default tolerance for floating-point comparisons
 */
export const EPSILON = 1e-6;

/**
 * Default tolerance for geometry operations
 */
export const GEOMETRY_EPSILON = 1e-10;

/**
 * Default tolerance for UV coordinate comparisons
 */
export const UV_EPSILON = 1e-4;

/**
 * Default tolerance for normal vector comparisons
 */
export const NORMAL_EPSILON = 1e-3;

/**
 * Pi constant
 */
export const PI = Math.PI;

/**
 * Two times Pi
 */
export const TWO_PI = 2 * Math.PI;

/**
 * Half Pi
 */
export const HALF_PI = Math.PI / 2;

/**
 * Quarter Pi
 */
export const QUARTER_PI = Math.PI / 4;

/**
 * Degrees to radians conversion factor
 */
export const DEG_TO_RAD = Math.PI / 180;

/**
 * Radians to degrees conversion factor
 */
export const RAD_TO_DEG = 180 / Math.PI;

/**
 * Default decimal places for rounding
 */
export const DEFAULT_DECIMALS = 6;

/**
 * Maximum number of vertices in a face (safety limit)
 */
export const MAX_FACE_VERTICES = 1000;

/**
 * Maximum number of faces in a mesh (safety limit)
 */
export const MAX_MESH_FACES = 1000000;

/**
 * Maximum number of vertices in a mesh (safety limit)
 */
export const MAX_MESH_VERTICES = 1000000;

/**
 * Minimum valid area for a triangle
 */
export const MIN_TRIANGLE_AREA = 1e-10;

/**
 * Default winding order tolerance
 */
export const WINDING_TOLERANCE = -0.1;

/**
 * Default material index for new faces
 */
export const DEFAULT_MATERIAL_INDEX = 0; 