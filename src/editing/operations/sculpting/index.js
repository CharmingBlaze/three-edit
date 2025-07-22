/**
 * @fileoverview Sculpting Operations Index
 * Centralized exports for all sculpting operations
 */

export { smoothVertices } from './smoothVertices.js';
export { pushPullVertices } from './pushPullVertices.js';
export { inflateVertices } from './inflateVertices.js';
export { addNoiseDisplacement } from './addNoiseDisplacement.js';
export { createCrease } from './createCrease.js';
export { subdivideFaces } from './subdivideFaces.js';

// Export noise utilities for advanced usage
export { simpleNoise3D, perlinNoise3D } from './noiseUtils.js'; 