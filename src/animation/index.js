/**
 * @fileoverview Animation System
 * Provides keyframe animation, procedural animation, and animation management
 * for the Three.js Advanced Editing Library
 */

// Core animation modules
export * from './core/AnimationManager.js';
export * from './core/KeyframeAnimation.js';
export * from './core/ProceduralAnimation.js';

// Animation operations
export * from './operations/keyframeOperations.js';
export * from './operations/proceduralOperations.js';
export * from './operations/timelineOperations.js';

// Animation utilities
export * from './utils/animationUtils.js';
export * from './utils/easingUtils.js';
export * from './utils/interpolationUtils.js';

// Animation types and constants
export * from './types/AnimationTypes.js';
export * from './types/EasingTypes.js';

// Factory functions
export * from './factories/animationFactory.js'; 