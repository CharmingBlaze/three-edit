/**
 * @fileoverview Keyframe Animation Operations
 * Provides operations for creating and manipulating keyframe animations
 */

import { Keyframe, AnimationTrack, AnimationClip, InterpolationType } from '../types/AnimationTypes.js';
import { AnimationResult } from '../types/AnimationTypes.js';
import { validateAnimationData } from '../utils/animationUtils.js';

/**
 * Keyframe Animation Operations
 */
export const KeyframeOperations = {
  /**
   * Create a new keyframe
   */
  createKeyframe: (data) => {
    if (!data || !data.hasOwnProperty('time') || !data.hasOwnProperty('value')) {
      return {
        success: false,
        keyframe: null,
        metadata: { operation: 'createKeyframe', status: 'error', message: 'Missing required parameters' }
      };
    }

    const keyframe = new Keyframe(
      data.time,
      data.value,
      data.interpolation || InterpolationType.LINEAR,
      data.easing || null
    );

    return {
      success: true,
      keyframe,
      metadata: { operation: 'createKeyframe', status: 'success' }
    };
  },

  /**
   * Create a new animation track
   */
  createTrack: (data) => {
    if (!data || !data.property) {
      return {
        success: false,
        track: null,
        metadata: { operation: 'createTrack', status: 'error', message: 'Missing required parameters' }
      };
    }

    const track = new AnimationTrack(data.property, data.keyframes || []);
    if (data.loopMode) {
      track.loopMode = data.loopMode;
    }

    return {
      success: true,
      track,
      metadata: { operation: 'createTrack', status: 'success' }
    };
  },

  /**
   * Create a new animation clip
   */
  createClip: (data) => {
    if (!data || !data.name) {
      return {
        success: false,
        clip: null,
        metadata: { operation: 'createClip', status: 'error', message: 'Missing required parameters' }
      };
    }

    const clip = new AnimationClip(
      data.name,
      data.duration || 0,
      data.tracks || []
    );

    if (data.loopMode) {
      clip.loopMode = data.loopMode;
    }

    return {
      success: true,
      clip,
      metadata: { operation: 'createClip', status: 'success' }
    };
  },

  /**
   * Add keyframe to track
   */
  addKeyframe: (data) => {
    if (!data || !data.track || !data.keyframe) {
      return {
        success: false,
        track: null,
        metadata: { operation: 'addKeyframe', status: 'error', message: 'Missing required parameters' }
      };
    }

    const track = data.track;
    const keyframe = data.keyframe;

    if (!(track instanceof AnimationTrack)) {
      return {
        success: false,
        track: null,
        metadata: { operation: 'addKeyframe', status: 'error', message: 'Invalid track object' }
      };
    }

    if (!(keyframe instanceof Keyframe)) {
      return {
        success: false,
        track: null,
        metadata: { operation: 'addKeyframe', status: 'error', message: 'Invalid keyframe object' }
      };
    }

    track.addKeyframe(keyframe);

    return {
      success: true,
      track,
      metadata: { operation: 'addKeyframe', status: 'success' }
    };
  },

  /**
   * Remove keyframe from track
   */
  removeKeyframe: (data) => {
    if (!data || !data.track || typeof data.index !== 'number') {
      return {
        success: false,
        track: null,
        metadata: { operation: 'removeKeyframe', status: 'error', message: 'Missing required parameters' }
      };
    }

    const track = data.track;
    const index = data.index;

    if (!(track instanceof AnimationTrack)) {
      return {
        success: false,
        track: null,
        metadata: { operation: 'removeKeyframe', status: 'error', message: 'Invalid track object' }
      };
    }

    track.removeKeyframe(index);

    return {
      success: true,
      track,
      metadata: { operation: 'removeKeyframe', status: 'success' }
    };
  },

  /**
   * Add track to clip
   */
  addTrack: (data) => {
    if (!data || !data.clip || !data.track) {
      return {
        success: false,
        clip: null,
        metadata: { operation: 'addTrack', status: 'error', message: 'Missing required parameters' }
      };
    }

    const clip = data.clip;
    const track = data.track;

    if (!(clip instanceof AnimationClip)) {
      return {
        success: false,
        clip: null,
        metadata: { operation: 'addTrack', status: 'error', message: 'Invalid clip object' }
      };
    }

    if (!(track instanceof AnimationTrack)) {
      return {
        success: false,
        clip: null,
        metadata: { operation: 'addTrack', status: 'error', message: 'Invalid track object' }
      };
    }

    clip.addTrack(track);

    return {
      success: true,
      clip,
      metadata: { operation: 'addTrack', status: 'success' }
    };
  },

  /**
   * Remove track from clip
   */
  removeTrack: (data) => {
    if (!data || !data.clip || typeof data.index !== 'number') {
      return {
        success: false,
        clip: null,
        metadata: { operation: 'removeTrack', status: 'error', message: 'Missing required parameters' }
      };
    }

    const clip = data.clip;
    const index = data.index;

    if (!(clip instanceof AnimationClip)) {
      return {
        success: false,
        clip: null,
        metadata: { operation: 'removeTrack', status: 'error', message: 'Invalid clip object' }
      };
    }

    clip.removeTrack(index);

    return {
      success: true,
      clip,
      metadata: { operation: 'removeTrack', status: 'success' }
    };
  },

  /**
   * Validate animation data
   */
  validateParameters: (params, type) => {
    if (!params) {
      return { valid: false, errors: ['Parameters are required'] };
    }

    switch (type) {
      case 'createKeyframe':
        if (!params.hasOwnProperty('time') || !params.hasOwnProperty('value')) {
          return { valid: false, errors: ['Time and value are required for keyframes'] };
        }
        break;
      case 'createTrack':
        if (!params.property) {
          return { valid: false, errors: ['Property is required for tracks'] };
        }
        break;
      case 'createClip':
        if (!params.name) {
          return { valid: false, errors: ['Name is required for clips'] };
        }
        break;
      default:
        return { valid: false, errors: ['Unknown operation type'] };
    }

    return { valid: true, errors: [] };
  }
}; 