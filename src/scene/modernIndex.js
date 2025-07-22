/**
 * @fileoverview Modern Scene Index
 * Centralized exports for the modern modular scene system
 */

// Core scene components
export { Scene } from './core/Scene.js';

// Modern scene manager
export { ModernSceneManager } from './modernSceneManager.js';

// Legacy exports for backward compatibility
export { Scene as SceneClass } from './core/Scene.js';
export { ModernSceneManager as SceneManager } from './modernSceneManager.js'; 