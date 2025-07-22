/**
 * @fileoverview Rendering Factory Functions
 * Provides factory functions for creating rendering system components
 */

import { RenderManager } from '../core/RenderManager.js';
import { PostProcessingOperations } from '../operations/postProcessingOperations.js';

/**
 * Create a render manager instance
 */
export function createRenderManager(renderer = null) {
  return new RenderManager(renderer);
}

/**
 * Create post-processing operations
 */
export function createPostProcessingOperations() {
  return PostProcessingOperations;
}

/**
 * Create a complete rendering system
 */
export function createRenderingSystem(renderer = null) {
  return {
    manager: createRenderManager(renderer),
    postProcessing: createPostProcessingOperations()
  };
} 