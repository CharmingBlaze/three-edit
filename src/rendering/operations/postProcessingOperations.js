/**
 * @fileoverview Post-Processing Operations
 * Provides operations for creating and managing post-processing effects
 */

import { PostProcessType, PostProcessEffect, RenderResult } from '../types/RenderingTypes.js';

/**
 * Post-Processing Operations
 */
export const PostProcessingOperations = {
  /**
   * Create a bloom effect
   */
  createBloom: (data) => {
    if (!data) {
      return {
        success: false,
        effect: null,
        metadata: { operation: 'createBloom', status: 'error', message: 'Missing required parameters' }
      };
    }

    const effect = new PostProcessEffect(PostProcessType.BLOOM, true, {
      threshold: data.threshold || 0.8,
      strength: data.strength || 1.0,
      radius: data.radius || 0.5
    });

    return {
      success: true,
      effect,
      metadata: { operation: 'createBloom', status: 'success' }
    };
  },

  /**
   * Create a depth of field effect
   */
  createDepthOfField: (data) => {
    if (!data) {
      return {
        success: false,
        effect: null,
        metadata: { operation: 'createDepthOfField', status: 'error', message: 'Missing required parameters' }
      };
    }

    const effect = new PostProcessEffect(PostProcessType.DEPTH_OF_FIELD, true, {
      focusDistance: data.focusDistance || 10,
      focalLength: data.focalLength || 50,
      bokehScale: data.bokehScale || 2.0
    });

    return {
      success: true,
      effect,
      metadata: { operation: 'createDepthOfField', status: 'success' }
    };
  },

  /**
   * Create a motion blur effect
   */
  createMotionBlur: (data) => {
    if (!data) {
      return {
        success: false,
        effect: null,
        metadata: { operation: 'createMotionBlur', status: 'error', message: 'Missing required parameters' }
      };
    }

    const effect = new PostProcessEffect(PostProcessType.MOTION_BLUR, true, {
      samples: data.samples || 32,
      intensity: data.intensity || 1.0
    });

    return {
      success: true,
      effect,
      metadata: { operation: 'createMotionBlur', status: 'success' }
    };
  },

  /**
   * Create a chromatic aberration effect
   */
  createChromaticAberration: (data) => {
    if (!data) {
      return {
        success: false,
        effect: null,
        metadata: { operation: 'createChromaticAberration', status: 'error', message: 'Missing required parameters' }
      };
    }

    const effect = new PostProcessEffect(PostProcessType.CHROMATIC_ABERRATION, true, {
      offset: data.offset || 0.003,
      direction: data.direction || { x: 1, y: 1 }
    });

    return {
      success: true,
      effect,
      metadata: { operation: 'createChromaticAberration', status: 'success' }
    };
  },

  /**
   * Create a vignette effect
   */
  createVignette: (data) => {
    if (!data) {
      return {
        success: false,
        effect: null,
        metadata: { operation: 'createVignette', status: 'error', message: 'Missing required parameters' }
      };
    }

    const effect = new PostProcessEffect(PostProcessType.VIGNETTE, true, {
      offset: data.offset || 1.0,
      darkness: data.darkness || 0.5
    });

    return {
      success: true,
      effect,
      metadata: { operation: 'createVignette', status: 'success' }
    };
  },

  /**
   * Create a grain effect
   */
  createGrain: (data) => {
    if (!data) {
      return {
        success: false,
        effect: null,
        metadata: { operation: 'createGrain', status: 'error', message: 'Missing required parameters' }
      };
    }

    const effect = new PostProcessEffect('grain', true, {
      intensity: data.intensity || 0.1,
      size: data.size || 1.0
    });

    return {
      success: true,
      effect,
      metadata: { operation: 'createGrain', status: 'success' }
    };
  },

  /**
   * Create a sharpness effect
   */
  createSharpness: (data) => {
    if (!data) {
      return {
        success: false,
        effect: null,
        metadata: { operation: 'createSharpness', status: 'error', message: 'Missing required parameters' }
      };
    }

    const effect = new PostProcessEffect('sharpness', true, {
      amount: data.amount || 1.0,
      radius: data.radius || 1.0
    });

    return {
      success: true,
      effect,
      metadata: { operation: 'createSharpness', status: 'success' }
    };
  },

  /**
   * Update effect parameters
   */
  updateEffect: (data) => {
    if (!data || !data.effect || !data.parameters) {
      return {
        success: false,
        effect: null,
        metadata: { operation: 'updateEffect', status: 'error', message: 'Missing required parameters' }
      };
    }

    const effect = data.effect;
    const parameters = data.parameters;

    if (!(effect instanceof PostProcessEffect)) {
      return {
        success: false,
        effect: null,
        metadata: { operation: 'updateEffect', status: 'error', message: 'Invalid effect object' }
      };
    }

    Object.assign(effect.parameters, parameters);

    return {
      success: true,
      effect,
      metadata: { operation: 'updateEffect', status: 'success' }
    };
  },

  /**
   * Enable or disable an effect
   */
  setEffectEnabled: (data) => {
    if (!data || !data.effect || typeof data.enabled !== 'boolean') {
      return {
        success: false,
        effect: null,
        metadata: { operation: 'setEffectEnabled', status: 'error', message: 'Missing required parameters' }
      };
    }

    const effect = data.effect;
    const enabled = data.enabled;

    if (!(effect instanceof PostProcessEffect)) {
      return {
        success: false,
        effect: null,
        metadata: { operation: 'setEffectEnabled', status: 'error', message: 'Invalid effect object' }
      };
    }

    effect.enabled = enabled;

    return {
      success: true,
      effect,
      metadata: { operation: 'setEffectEnabled', status: 'success' }
    };
  },

  /**
   * Validate effect parameters
   */
  validateParameters: (params, type) => {
    if (!params) {
      return { valid: false, errors: ['Parameters are required'] };
    }

    switch (type) {
      case 'createBloom':
        if (params.threshold && (params.threshold < 0 || params.threshold > 1)) {
          return { valid: false, errors: ['Bloom threshold must be between 0 and 1'] };
        }
        break;
      case 'createDepthOfField':
        if (params.focusDistance && params.focusDistance < 0) {
          return { valid: false, errors: ['Focus distance must be positive'] };
        }
        break;
      case 'createMotionBlur':
        if (params.samples && (params.samples < 1 || params.samples > 128)) {
          return { valid: false, errors: ['Motion blur samples must be between 1 and 128'] };
        }
        break;
      default:
        return { valid: true, errors: [] };
    }

    return { valid: true, errors: [] };
  }
}; 