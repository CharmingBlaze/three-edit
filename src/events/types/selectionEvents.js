/**
 * @fileoverview Selection Events
 * Selection-related event types for the 3D editor
 */

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
  VERTEX_SELECTED: 'selection:vertex:selected',
  VERTEX_DESELECTED: 'selection:vertex:deselected',
  EDGE_SELECTED: 'selection:edge:selected',
  EDGE_DESELECTED: 'selection:edge:deselected',
  FACE_SELECTED: 'selection:face:selected',
  FACE_DESELECTED: 'selection:face:deselected',
  MESH_SELECTED: 'selection:mesh:selected',
  MESH_DESELECTED: 'selection:mesh:deselected',

  // Selection modes
  SELECTION_MODE_CHANGED: 'selection:mode:changed',
  SELECTION_TOOL_CHANGED: 'selection:tool:changed',

  // Selection operations
  SELECTION_INVERT: 'selection:invert',
  SELECTION_GROW: 'selection:grow',
  SELECTION_SHRINK: 'selection:shrink',
  SELECTION_BORDER: 'selection:border',
  SELECTION_LOOP: 'selection:loop',
  SELECTION_RING: 'selection:ring'
};

/**
 * Get selection event category
 * @param {string} event - Event name
 * @returns {string} Event category
 */
export function getSelectionEventCategory(event) {
  if (event.startsWith('selection:changed') || event.startsWith('selection:cleared') || 
      event.startsWith('selection:added') || event.startsWith('selection:removed')) {
    return 'changes';
  }
  if (event.startsWith('selection:vertex') || event.startsWith('selection:edge') || 
      event.startsWith('selection:face') || event.startsWith('selection:mesh')) {
    return 'types';
  }
  if (event.startsWith('selection:mode') || event.startsWith('selection:tool')) {
    return 'modes';
  }
  if (event.startsWith('selection:invert') || event.startsWith('selection:grow') || 
      event.startsWith('selection:shrink') || event.startsWith('selection:border') || 
      event.startsWith('selection:loop') || event.startsWith('selection:ring')) {
    return 'operations';
  }
  return 'unknown';
} 