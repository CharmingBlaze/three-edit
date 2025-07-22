/**
 * @fileoverview Animation Factory Functions
 * Provides factory functions for creating animation system components
 */

import { AnimationManager } from '../core/AnimationManager.js';
import { KeyframeOperations } from '../operations/keyframeOperations.js';

/**
 * Create an animation manager instance
 */
export function createAnimationManager() {
  return new AnimationManager();
}

/**
 * Create keyframe operations
 */
export function createKeyframeOperations() {
  return KeyframeOperations;
}

/**
 * Create a complete animation system
 */
export function createAnimationSystem() {
  return {
    manager: createAnimationManager(),
    keyframeOperations: createKeyframeOperations()
  };
} 