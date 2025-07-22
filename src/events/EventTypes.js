/**
 * @fileoverview Event Types
 * Standard event types for the 3D editor
 */

/**
 * Core application events
 */
export const AppEvents = {
  // Application lifecycle
  APP_INIT: 'app:init',
  APP_READY: 'app:ready',
  APP_SHUTDOWN: 'app:shutdown',
  APP_ERROR: 'app:error',

  // UI events
  UI_RESIZE: 'ui:resize',
  UI_THEME_CHANGE: 'ui:theme:change',
  UI_LANGUAGE_CHANGE: 'ui:language:change',
  UI_SHORTCUT: 'ui:shortcut',
  UI_MENU_ACTION: 'ui:menu:action',
  UI_TOOLBAR_ACTION: 'ui:toolbar:action',
  UI_PANEL_TOGGLE: 'ui:panel:toggle',
  UI_DIALOG_OPEN: 'ui:dialog:open',
  UI_DIALOG_CLOSE: 'ui:dialog:close',
  UI_NOTIFICATION: 'ui:notification',
  UI_PROGRESS: 'ui:progress'
};

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
 * Selection events
 */
export const SelectionEvents = {
  // Selection changes
  SELECTION_CHANGED: 'selection:changed',
  SELECTION_CLEARED: 'selection:cleared',
  SELECTION_ADDED: 'selection:added',
  SELECTION_REMOVED: 'selection:removed',

  // Selection types
  SELECT_VERTICES: 'select:vertices',
  SELECT_EDGES: 'select:edges',
  SELECT_FACES: 'select:faces',
  SELECT_MESHES: 'select:meshes',
  SELECT_OBJECTS: 'select:objects',

  // Selection modes
  SELECTION_MODE_CHANGED: 'selection:mode:changed',
  SELECTION_BOX_START: 'selection:box:start',
  SELECTION_BOX_UPDATE: 'selection:box:update',
  SELECTION_BOX_END: 'selection:box:end'
};

/**
 * Transform events
 */
export const TransformEvents = {
  // Transform operations
  TRANSFORM_START: 'transform:start',
  TRANSFORM_UPDATE: 'transform:update',
  TRANSFORM_END: 'transform:end',
  TRANSFORM_CANCEL: 'transform:cancel',

  // Transform modes
  TRANSFORM_MODE_CHANGED: 'transform:mode:changed',
  TRANSFORM_MOVE: 'transform:move',
  TRANSFORM_ROTATE: 'transform:rotate',
  TRANSFORM_SCALE: 'transform:scale',

  // Transform constraints
  TRANSFORM_CONSTRAINT_ADDED: 'transform:constraint:added',
  TRANSFORM_CONSTRAINT_REMOVED: 'transform:constraint:removed',
  TRANSFORM_CONSTRAINT_CHANGED: 'transform:constraint:changed',

  // Transform snapping
  TRANSFORM_SNAP_TOGGLE: 'transform:snap:toggle',
  TRANSFORM_SNAP_CHANGED: 'transform:snap:changed',
  TRANSFORM_SNAP_GRID_CHANGED: 'transform:snap:grid:changed'
};

/**
 * Material events
 */
export const MaterialEvents = {
  // Material lifecycle
  MATERIAL_CREATED: 'material:created',
  MATERIAL_DELETED: 'material:deleted',
  MATERIAL_DUPLICATED: 'material:duplicated',
  MATERIAL_RENAMED: 'material:renamed',

  // Material changes
  MATERIAL_CHANGED: 'material:changed',
  MATERIAL_PROPERTY_CHANGED: 'material:property:changed',
  MATERIAL_TEXTURE_CHANGED: 'material:texture:changed',
  MATERIAL_SHADER_CHANGED: 'material:shader:changed',

  // Material assignment
  MATERIAL_ASSIGNED: 'material:assigned',
  MATERIAL_UNASSIGNED: 'material:unassigned',
  MATERIAL_REPLACED: 'material:replaced'
};

/**
 * Camera events
 */
export const CameraEvents = {
  // Camera changes
  CAMERA_CHANGED: 'camera:changed',
  CAMERA_POSITION_CHANGED: 'camera:position:changed',
  CAMERA_TARGET_CHANGED: 'camera:target:changed',
  CAMERA_FOV_CHANGED: 'camera:fov:changed',

  // Camera operations
  CAMERA_RESET: 'camera:reset',
  CAMERA_FOCUS: 'camera:focus',
  CAMERA_FRAME_ALL: 'camera:frame:all',
  CAMERA_FRAME_SELECTION: 'camera:frame:selection',

  // Camera modes
  CAMERA_MODE_CHANGED: 'camera:mode:changed',
  CAMERA_ORBIT: 'camera:orbit',
  CAMERA_PAN: 'camera:pan',
  CAMERA_ZOOM: 'camera:zoom'
};

/**
 * Renderer events
 */
export const RendererEvents = {
  // Renderer lifecycle
  RENDERER_INIT: 'renderer:init',
  RENDERER_READY: 'renderer:ready',
  RENDERER_DISPOSE: 'renderer:dispose',

  // Renderer settings
  RENDERER_SETTINGS_CHANGED: 'renderer:settings:changed',
  RENDERER_QUALITY_CHANGED: 'renderer:quality:changed',
  RENDERER_ANTIALIASING_CHANGED: 'renderer:antialiasing:changed',
  RENDERER_SHADOWS_CHANGED: 'renderer:shadows:changed',

  // Renderer performance
  RENDERER_FPS_CHANGED: 'renderer:fps:changed',
  RENDERER_MEMORY_CHANGED: 'renderer:memory:changed',
  RENDERER_DRAW_CALLS_CHANGED: 'renderer:draw:calls:changed'
};

/**
 * File events
 */
export const FileEvents = {
  // File operations
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  FILE_SAVE_AS: 'file:save:as',
  FILE_EXPORT: 'file:export',
  FILE_IMPORT: 'file:import',
  FILE_NEW: 'file:new',
  FILE_CLOSE: 'file:close',

  // File progress
  FILE_LOAD_PROGRESS: 'file:load:progress',
  FILE_SAVE_PROGRESS: 'file:save:progress',
  FILE_EXPORT_PROGRESS: 'file:export:progress',

  // File errors
  FILE_LOAD_ERROR: 'file:load:error',
  FILE_SAVE_ERROR: 'file:save:error',
  FILE_EXPORT_ERROR: 'file:export:error'
};

/**
 * History events
 */
export const HistoryEvents = {
  // History operations
  HISTORY_OPERATION_ADDED: 'history:operation:added',
  HISTORY_UNDO: 'history:undo',
  HISTORY_REDO: 'history:redo',
  HISTORY_CLEAR: 'history:clear',

  // History state
  HISTORY_STATE_CHANGED: 'history:state:changed',
  HISTORY_CAN_UNDO_CHANGED: 'history:can:undo:changed',
  HISTORY_CAN_REDO_CHANGED: 'history:can:redo:changed'
};

/**
 * Plugin events
 */
export const PluginEvents = {
  // Plugin lifecycle
  PLUGIN_LOADED: 'plugin:loaded',
  PLUGIN_UNLOADED: 'plugin:unloaded',
  PLUGIN_ENABLED: 'plugin:enabled',
  PLUGIN_DISABLED: 'plugin:disabled',

  // Plugin operations
  PLUGIN_ACTION: 'plugin:action',
  PLUGIN_MENU_ADDED: 'plugin:menu:added',
  PLUGIN_TOOL_ADDED: 'plugin:tool:added'
};

/**
 * All event types combined
 */
export const EventTypes = {
  ...AppEvents,
  ...SceneEvents,
  ...MeshEvents,
  ...SelectionEvents,
  ...TransformEvents,
  ...MaterialEvents,
  ...CameraEvents,
  ...RendererEvents,
  ...FileEvents,
  ...HistoryEvents,
  ...PluginEvents
};

/**
 * Get event category
 * @param {string} event - Event name
 * @returns {string} Event category
 */
export function getEventCategory(event) {
  const category = event.split(':')[0];
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Get all events by category
 * @returns {Object} Events organized by category
 */
export function getEventsByCategory() {
  const categories = {};
  
  Object.entries(EventTypes).forEach(([key, value]) => {
    const category = getEventCategory(value);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({ key, value });
  });

  return categories;
} 