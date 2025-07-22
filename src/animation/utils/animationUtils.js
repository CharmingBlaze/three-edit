/**
 * @fileoverview Animation Utilities
 * Provides utility functions for animation calculations and helpers
 */

import { InterpolationType } from '../types/AnimationTypes.js';
import { getEasingFunction } from '../types/EasingTypes.js';

/**
 * Calculate interpolated value between two keyframes
 */
export function interpolateKeyframes(keyframe1, keyframe2, time) {
  if (!keyframe1 || !keyframe2) {
    return keyframe1 ? keyframe1.value : keyframe2 ? keyframe2.value : null;
  }

  const t = (time - keyframe1.time) / (keyframe2.time - keyframe1.time);
  const easedT = keyframe1.easing ? getEasingFunction(keyframe1.easing)(t) : t;

  switch (keyframe1.interpolation) {
    case InterpolationType.LINEAR:
      return interpolateLinear(keyframe1.value, keyframe2.value, easedT);
    case InterpolationType.STEP:
      return t < 0.5 ? keyframe1.value : keyframe2.value;
    case InterpolationType.CUBIC:
      return interpolateCubic(keyframe1.value, keyframe2.value, easedT);
    default:
      return interpolateLinear(keyframe1.value, keyframe2.value, easedT);
  }
}

/**
 * Linear interpolation between two values
 */
export function interpolateLinear(value1, value2, t) {
  if (typeof value1 === 'number' && typeof value2 === 'number') {
    return value1 + (value2 - value1) * t;
  }
  
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return value1.map((v, i) => v + (value2[i] - v) * t);
  }
  
  if (typeof value1 === 'object' && typeof value2 === 'object') {
    const result = {};
    for (const key in value1) {
      if (value2.hasOwnProperty(key)) {
        result[key] = interpolateLinear(value1[key], value2[key], t);
      }
    }
    return result;
  }
  
  return t < 0.5 ? value1 : value2;
}

/**
 * Cubic interpolation between two values
 */
export function interpolateCubic(value1, value2, t) {
  // Simplified cubic interpolation
  const t2 = t * t;
  const t3 = t2 * t;
  return value1 + (value2 - value1) * (3 * t2 - 2 * t3);
}

/**
 * Find keyframes for a given time
 */
export function findKeyframes(track, time) {
  const keyframes = track.keyframes;
  let prevKeyframe = null;
  let nextKeyframe = null;

  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i].time <= time) {
      prevKeyframe = keyframes[i];
    } else {
      nextKeyframe = keyframes[i];
      break;
    }
  }

  return { prevKeyframe, nextKeyframe };
}

/**
 * Calculate animation value at a specific time
 */
export function calculateAnimationValue(track, time) {
  const { prevKeyframe, nextKeyframe } = findKeyframes(track, time);
  
  if (!prevKeyframe && !nextKeyframe) {
    return null;
  }
  
  if (!prevKeyframe) {
    return nextKeyframe.value;
  }
  
  if (!nextKeyframe) {
    return prevKeyframe.value;
  }
  
  return interpolateKeyframes(prevKeyframe, nextKeyframe, time);
}

/**
 * Apply loop mode to time
 */
export function applyLoopMode(time, duration, loopMode) {
  switch (loopMode) {
    case 'loop':
      return time % duration;
    case 'ping_pong':
      const cycle = Math.floor(time / duration);
      const cycleTime = time % duration;
      return cycle % 2 === 0 ? cycleTime : duration - cycleTime;
    case 'clamp':
      return Math.max(0, Math.min(time, duration));
    default:
      return time;
  }
}

/**
 * Validate animation data
 */
export function validateAnimationData(animationData) {
  const errors = [];
  
  if (!animationData) {
    errors.push('Animation data is required');
    return errors;
  }
  
  if (!animationData.name) {
    errors.push('Animation name is required');
  }
  
  if (typeof animationData.duration !== 'number' || animationData.duration < 0) {
    errors.push('Duration must be a positive number');
  }
  
  if (!Array.isArray(animationData.tracks)) {
    errors.push('Tracks must be an array');
  } else {
    animationData.tracks.forEach((track, index) => {
      if (!track.property) {
        errors.push(`Track ${index}: Property is required`);
      }
      if (!Array.isArray(track.keyframes)) {
        errors.push(`Track ${index}: Keyframes must be an array`);
      }
    });
  }
  
  return errors;
} 