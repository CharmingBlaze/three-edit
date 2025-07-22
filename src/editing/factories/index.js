/**
 * @fileoverview Factories Index
 * Centralized exports for all factory modules in the editing system.
 */

// Factory modules
export * from './editManagerFactory.js';
export * from './editHistoryFactory.js';
export * from './toolFactories.js';

// Legacy exports for backward compatibility
export { createEditManager } from './editManagerFactory.js';
export { createEditHistory } from './editHistoryFactory.js';
export { createSelectTool, createTransformTool } from './toolFactories.js'; 