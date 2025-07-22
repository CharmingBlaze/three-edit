/**
 * @fileoverview Event Types Index
 * Centralized exports for all event types
 */

// Application events
export * from './appEvents.js';

// Scene events
export * from './sceneEvents.js';

// Mesh events
export * from './meshEvents.js';

// Selection events
export * from './selectionEvents.js';

// Utility functions
export function getEventCategory(event) {
  if (event.startsWith('app:') || event.startsWith('ui:')) {
    return 'application';
  }
  if (event.startsWith('scene:')) {
    return 'scene';
  }
  if (event.startsWith('mesh:')) {
    return 'mesh';
  }
  if (event.startsWith('selection:')) {
    return 'selection';
  }
  return 'unknown';
}

export function getEventsByCategory() {
  return {
    application: ['app:init', 'app:ready', 'app:shutdown', 'app:error'],
    ui: ['ui:resize', 'ui:theme:change', 'ui:language:change', 'ui:shortcut'],
    scene: ['scene:created', 'scene:loaded', 'scene:saved', 'scene:deleted'],
    mesh: ['mesh:created', 'mesh:deleted', 'mesh:duplicated', 'mesh:renamed'],
    selection: ['selection:changed', 'selection:cleared', 'selection:added', 'selection:removed']
  };
} 