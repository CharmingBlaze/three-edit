/**
 * @fileoverview Core Index
 * Centralized exports for all core editing components
 */

// Geometry utilities
export * from './geometryUtils.js';

// Math utilities
export * from './mathUtils.js';

// Edit state management
export * from './editState.js';

// Edit history management
export * from './editHistory.js';

// Edit operations coordination
export * from './editOperations.js';

// Modern edit manager
export * from './modernEditManager.js';

// Legacy compatibility exports
export { EditStateManager } from './editState.js';
export { EditHistoryManager } from './editHistory.js';
export { EditOperationsCoordinator } from './editOperations.js';
export { ModernEditManager } from './modernEditManager.js'; 