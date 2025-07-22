/**
 * @fileoverview Scene Events
 * Scene management event types for the 3D editor
 */

/**
 * Scene management events
 */
export const SceneEvents = {
  // Scene lifecycle
  SCENE_CREATED: 'scene:created',
  SCENE_LOADED: 'scene:loaded',
  SCENE_SAVED: 'scene:saved',
  SCENE_DELETED: 'scene:deleted',
  SCENE_CLEARED: 'scene:cleared',
  SCENE_CHANGED: 'scene:changed',

  // Scene operations
  SCENE_ADD_MESH: 'scene:add:mesh',
  SCENE_REMOVE_MESH: 'scene:remove:mesh',
  SCENE_UPDATE_MESH: 'scene:update:mesh',
  SCENE_DUPLICATE_MESH: 'scene:duplicate:mesh',
  SCENE_GROUP_MESHES: 'scene:group:meshes',
  SCENE_UNGROUP_MESHES: 'scene:ungroup:meshes',
  SCENE_ALIGN_MESHES: 'scene:align:meshes',
  SCENE_DISTRIBUTE_MESHES: 'scene:distribute:meshes',

  // Scene hierarchy
  SCENE_ADD_CHILD: 'scene:add:child',
  SCENE_REMOVE_CHILD: 'scene:remove:child',
  SCENE_MOVE_CHILD: 'scene:move:child',
  SCENE_COLLAPSE_CHILD: 'scene:collapse:child',
  SCENE_EXPAND_CHILD: 'scene:expand:child'
};

/**
 * Get scene event category
 * @param {string} event - Event name
 * @returns {string} Event category
 */
export function getSceneEventCategory(event) {
  if (event.startsWith('scene:created') || event.startsWith('scene:loaded') || 
      event.startsWith('scene:saved') || event.startsWith('scene:deleted') || 
      event.startsWith('scene:cleared') || event.startsWith('scene:changed')) {
    return 'lifecycle';
  }
  if (event.startsWith('scene:add') || event.startsWith('scene:remove') || 
      event.startsWith('scene:update') || event.startsWith('scene:duplicate') || 
      event.startsWith('scene:group') || event.startsWith('scene:ungroup') || 
      event.startsWith('scene:align') || event.startsWith('scene:distribute')) {
    return 'operations';
  }
  if (event.startsWith('scene:move') || event.startsWith('scene:collapse') || 
      event.startsWith('scene:expand')) {
    return 'hierarchy';
  }
  return 'unknown';
} 