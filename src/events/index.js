/**
 * @fileoverview Events System Index
 * Centralized exports for all events functionality
 */

// Core event manager
export { EventManager } from './EventManager.js';

// Event types
export * from './types/index.js';

// Legacy export for backward compatibility
export * from './EventTypes.js';

/**
 * Standard event priorities
 */
export const EventPriorities = {
  CRITICAL: 100,
  HIGH: 75,
  NORMAL: 50,
  LOW: 25,
  BACKGROUND: 0
};

/**
 * Event context types
 */
export const EventContexts = {
  APPLICATION: 'application',
  SCENE: 'scene',
  MESH: 'mesh',
  SELECTION: 'selection',
  TRANSFORM: 'transform',
  MATERIAL: 'material',
  CAMERA: 'camera',
  RENDERER: 'renderer',
  UI: 'ui',
  PLUGIN: 'plugin'
};

/**
 * Create a typed event emitter
 * @param {EventManager} eventManager - Event manager instance
 * @param {string} context - Event context
 * @returns {Object} Typed event emitter
 */
export function createTypedEventEmitter(eventManager, context) {
  return {
    emit: (event, ...args) => eventManager.emit(event, ...args),
    on: (event, callback, options = {}) => eventManager.on(event, callback, { ...options, context }),
    once: (event, callback, options = {}) => eventManager.once(event, callback, { ...options, context }),
    off: (event, callback) => eventManager.off(event, callback)
  };
}

/**
 * Create a scoped event manager
 * @param {EventManager} parentManager - Parent event manager
 * @param {string} scope - Event scope
 * @returns {Object} Scoped event manager
 */
export function createScopedEventManager(parentManager, scope) {
  return {
    emit: (event, ...args) => parentManager.emit(`${scope}:${event}`, ...args),
    on: (event, callback, options = {}) => parentManager.on(`${scope}:${event}`, callback, options),
    once: (event, callback, options = {}) => parentManager.once(`${scope}:${event}`, callback, options),
    off: (event, callback) => parentManager.off(`${scope}:${event}`, callback)
  };
} 