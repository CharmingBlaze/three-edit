/**
 * @fileoverview Operations Index
 * Centralized exports for all modular editing operations.
 */

// New modular exports
export * from './geometry/index.js';
export * from './vertex/index.js';
export * from './edge/index.js';
export * from './face/index.js';

// Un-refactored module exports
export * from './uvOperations.js';
export * from './drawingOperations.js';
export * from './sculptingOperations.js';
export * from './objectOperations.js';
export * from './mirrorOperations.js';