/**
 * Selection module exports
 */

// Export from modular selection system
export * from './types';
export * from './raySelection';
export * from './boxSelection';
export * from './lassoSelection';
export * from './connectedSelection';
export * from './similarSelection';

// Core selection classes
export * from './Selection';
export * from './selectFace';
export * from './selectVertex';

// Main selection functions
export { selectByRay } from './raySelection';
export { selectByBox, selectByCircle } from './boxSelection';
export { selectByLasso } from './lassoSelection';
export { selectConnected } from './connectedSelection';
export { selectSimilar } from './similarSelection'; 