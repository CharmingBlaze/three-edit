/**
 * @fileoverview Operation Types and Enums
 * Centralized definitions for all operation types used in the editing system
 */

/**
 * Geometry operation types
 */
export const GeometryOperationTypes = {
  BEVEL: 'bevel',
  EXTRUDE: 'extrude',
  INSET: 'inset',
  EXTRUDE_REGION: 'extrude_region',
  BRIDGE: 'bridge',
  LOFT: 'loft',
  REVOLVE: 'revolve',
  SWEEP: 'sweep',
  THICKEN: 'thicken',
  SHELL: 'shell',
  SUBDIVIDE: 'subdivide',
  SMOOTH: 'smooth',
  DECIMATE: 'decimate'
};

/**
 * Vertex operation types
 */
export const VertexOperationTypes = {
  SNAP: 'snap',
  CONNECT: 'connect',
  MERGE: 'merge',
  SPLIT: 'split',
  COLLAPSE: 'collapse',
  DISSOLVE: 'dissolve',
  REMOVE_DOUBLES: 'remove_doubles',
  SMOOTH: 'smooth',
  RELAX: 'relax',
  BEVEL: 'bevel',
  EXTRUDE: 'extrude',
  FILL: 'fill',
  BRIDGE: 'bridge',
  LOOP_CUT: 'loop_cut',
  RING_CUT: 'ring_cut'
};

/**
 * Edge operation types
 */
export const EdgeOperationTypes = {
  SPLIT: 'split',
  COLLAPSE: 'collapse',
  DISSOLVE: 'dissolve',
  BEVEL: 'bevel',
  EXTRUDE: 'extrude',
  BRIDGE: 'bridge',
  LOOP_CUT: 'loop_cut',
  RING_CUT: 'ring_cut',
  CONNECT: 'connect',
  MERGE: 'merge',
  REMOVE_DOUBLES: 'remove_doubles',
  SMOOTH: 'smooth',
  RELAX: 'relax',
  FILL: 'fill',
  KNIFE: 'knife',
  SLICE: 'slice',
  SUBDIVIDE: 'subdivide',
  CREASE: 'crease',
  MARK_SEAM: 'mark_seam',
  MARK_SHARP: 'mark_sharp',
  MARK_BOUNDARY: 'mark_boundary',
  MARK_FREESTYLE: 'mark_freestyle'
};

/**
 * Face operation types
 */
export const FaceOperationTypes = {
  SPLIT: 'split',
  COLLAPSE: 'collapse',
  DISSOLVE: 'dissolve',
  BEVEL: 'bevel',
  EXTRUDE: 'extrude',
  INSET: 'inset',
  POKE: 'poke',
  TRIANGULATE: 'triangulate',
  QUADIFY: 'quadify',
  SMOOTH: 'smooth',
  FLATTEN: 'flatten',
  FILL: 'fill',
  BRIDGE: 'bridge',
  KNIFE: 'knife',
  SLICE: 'slice',
  SUBDIVIDE: 'subdivide',
  PLANAR: 'planar',
  CONCAVE: 'concave',
  CONVEX: 'convex',
  MARK_SEAM: 'mark_seam',
  MARK_SHARP: 'mark_sharp',
  MARK_FREESTYLE: 'mark_freestyle',
  UV_UNWRAP: 'uv_unwrap',
  UV_PACK: 'uv_pack',
  UV_SMART_PROJECT: 'uv_smart_project'
};

/**
 * UV operation types
 */
export const UVOperationTypes = {
  UNWRAP: 'unwrap',
  PACK: 'pack',
  SMART_PROJECT: 'smart_project',
  PROJECT: 'project',
  TRANSFORM: 'transform',
  SCALE: 'scale',
  ROTATE: 'rotate',
  TRANSLATE: 'translate',
  FLIP: 'flip',
  MIRROR: 'mirror',
  ALIGN: 'align',
  DISTRIBUTE: 'distribute',
  SNAP: 'snap',
  STITCH: 'stitch',
  WELD: 'weld',
  SPLIT: 'split',
  MERGE: 'merge',
  OPTIMIZE: 'optimize',
  CLEANUP: 'cleanup',
  ISLAND: 'island',
  MARK_SEAM: 'mark_seam',
  MARK_SHARP: 'mark_sharp',
  MARK_FREESTYLE: 'mark_freestyle'
};

/**
 * Edit operation types
 */
export const EditTypes = {
  CREATE: 'create',
  DELETE: 'delete',
  MODIFY: 'modify',
  DUPLICATE: 'duplicate',
  GROUP: 'group',
  UNGROUP: 'ungroup',
  ALIGN: 'align',
  DISTRIBUTE: 'distribute',
  MIRROR: 'mirror',
  ARRAY: 'array',
  EXTRUDE: 'extrude',
  BEVEL: 'bevel',
  BOOLEAN: 'boolean'
};

/**
 * Edit modes
 */
export const EditModes = {
  OBJECT: 'object',
  VERTEX: 'vertex',
  EDGE: 'edge',
  FACE: 'face',
  UV: 'uv'
};

/**
 * Tool states
 */
export const EditToolStates = {
  IDLE: 'idle',
  ACTIVE: 'active',
  SELECTING: 'selecting',
  OPERATING: 'operating',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

/**
 * History entry types
 */
export const HistoryEntryTypes = {
  OPERATION: 'operation',
  SELECTION: 'selection',
  TRANSFORM: 'transform',
  UNDO: 'undo',
  REDO: 'redo'
};

/**
 * Validation result structure
 */
export const ValidationResult = {
  isValid: false,
  errors: [],
  warnings: []
};

/**
 * Operation result structure
 */
export const OperationResult = {
  success: false,
  geometry: null,
  metadata: {},
  errors: [],
  warnings: []
}; 