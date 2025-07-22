/**
 * @fileoverview Modern Transforms Index
 * Centralized exports for the modern modular transforms system
 */

// Core transform components
export { Transform } from './core/Transform.js';

// Modern transform manager
export { ModernTransformManager } from './modernTransformManager.js';

// Legacy exports for backward compatibility
export { Transform as TransformClass } from './core/Transform.js';
export { ModernTransformManager as TransformManager } from './modernTransformManager.js'; 