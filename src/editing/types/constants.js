/**
 * @fileoverview Editing System Constants
 * Centralized constants used throughout the editing system
 */

/**
 * Edit states for tracking system state
 */
export const EditStates = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  EDITING: 'editing',
  SELECTING: 'selecting',
  TRANSFORMING: 'transforming'
};

/**
 * Coordinate spaces for transformations
 */
export const EditSpaces = {
  WORLD: 'world',
  LOCAL: 'local',
  VIEW: 'view'
};

/**
 * Snapping modes for precise editing
 */
export const EditSnapModes = {
  NONE: 'none',
  GRID: 'grid',
  VERTEX: 'vertex',
  EDGE: 'edge',
  FACE: 'face',
  OBJECT: 'object'
};

/**
 * Boolean operations for mesh combination
 */
export const EditBooleanOperations = {
  UNION: 'union',
  INTERSECTION: 'intersection',
  DIFFERENCE: 'difference'
};

/**
 * Array modes for object duplication
 */
export const EditArrayModes = {
  LINEAR: 'linear',
  RADIAL: 'radial',
  RANDOM: 'random'
};

/**
 * Default values for common operations
 */
export const DefaultValues = {
  BEVEL_AMOUNT: 0.1,
  EXTRUDE_DISTANCE: 0.5,
  SMOOTH_FACTOR: 0.5,
  SUBDIVISION_CUTS: 1,
  GRID_SIZE: 1.0,
  SNAP_THRESHOLD: 0.1
};

/**
 * Validation limits for parameters
 */
export const ValidationLimits = {
  MAX_VERTICES: 1000000,
  MAX_FACES: 500000,
  MAX_EDGES: 1500000,
  MIN_BEVEL_AMOUNT: 0.001,
  MAX_BEVEL_AMOUNT: 10.0,
  MIN_EXTRUDE_DISTANCE: 0.001,
  MAX_EXTRUDE_DISTANCE: 100.0
}; 