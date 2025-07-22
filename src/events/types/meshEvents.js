/**
 * @fileoverview Mesh Events
 * Mesh-related event types for the 3D editor
 */

/**
 * Mesh events
 */
export const MeshEvents = {
  // Mesh lifecycle
  MESH_CREATED: 'mesh:created',
  MESH_DELETED: 'mesh:deleted',
  MESH_DUPLICATED: 'mesh:duplicated',
  MESH_RENAMED: 'mesh:renamed',

  // Mesh operations
  MESH_TRANSFORM: 'mesh:transform',
  MESH_MOVE: 'mesh:move',
  MESH_ROTATE: 'mesh:rotate',
  MESH_SCALE: 'mesh:scale',
  MESH_RESET_TRANSFORM: 'mesh:reset:transform',

  // Mesh geometry
  MESH_GEOMETRY_CHANGED: 'mesh:geometry:changed',
  MESH_VERTEX_ADDED: 'mesh:vertex:added',
  MESH_VERTEX_REMOVED: 'mesh:vertex:removed',
  MESH_VERTEX_MOVED: 'mesh:vertex:moved',
  MESH_FACE_ADDED: 'mesh:face:added',
  MESH_FACE_REMOVED: 'mesh:face:removed',
  MESH_EDGE_ADDED: 'mesh:edge:added',
  MESH_EDGE_REMOVED: 'mesh:edge:removed',
  MESH_UV_CHANGED: 'mesh:uv:changed',

  // Mesh validation
  MESH_VALIDATION_START: 'mesh:validation:start',
  MESH_VALIDATION_COMPLETE: 'mesh:validation:complete',
  MESH_VALIDATION_ERROR: 'mesh:validation:error'
};

/**
 * Get mesh event category
 * @param {string} event - Event name
 * @returns {string} Event category
 */
export function getMeshEventCategory(event) {
  if (event.startsWith('mesh:created') || event.startsWith('mesh:deleted') || 
      event.startsWith('mesh:duplicated') || event.startsWith('mesh:renamed')) {
    return 'lifecycle';
  }
  if (event.startsWith('mesh:transform') || event.startsWith('mesh:move') || 
      event.startsWith('mesh:rotate') || event.startsWith('mesh:scale') || 
      event.startsWith('mesh:reset:transform')) {
    return 'operations';
  }
  if (event.startsWith('mesh:geometry') || event.startsWith('mesh:vertex') || 
      event.startsWith('mesh:face') || event.startsWith('mesh:edge') || 
      event.startsWith('mesh:uv')) {
    return 'geometry';
  }
  if (event.startsWith('mesh:validation')) {
    return 'validation';
  }
  return 'unknown';
} 