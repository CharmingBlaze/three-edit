/**
 * @fileoverview Easing Types and Functions
 * Provides easing functions for smooth animation transitions
 */

/**
 * Easing function types
 */
export const EasingType = {
  LINEAR: 'linear',
  EASE_IN: 'easeIn',
  EASE_OUT: 'easeOut',
  EASE_IN_OUT: 'easeInOut',
  BOUNCE: 'bounce',
  ELASTIC: 'elastic',
  BACK: 'back'
};

/**
 * Easing functions for smooth animations
 */
export const EasingFunctions = {
  /**
   * Linear interpolation (no easing)
   */
  linear: (t) => t,

  /**
   * Quadratic ease-in
   */
  easeInQuad: (t) => t * t,

  /**
   * Quadratic ease-out
   */
  easeOutQuad: (t) => t * (2 - t),

  /**
   * Quadratic ease-in-out
   */
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  /**
   * Cubic ease-in
   */
  easeInCubic: (t) => t * t * t,

  /**
   * Cubic ease-out
   */
  easeOutCubic: (t) => (--t) * t * t + 1,

  /**
   * Cubic ease-in-out
   */
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  /**
   * Bounce ease-out
   */
  bounce: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },

  /**
   * Elastic ease-out
   */
  elastic: (t) => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  },

  /**
   * Back ease-out
   */
  back: (t) => {
    const s = 1.70158;
    return --t * t * ((s + 1) * t + s) + 1;
  }
};

/**
 * Get easing function by name
 */
export function getEasingFunction(easingType) {
  switch (easingType) {
    case EasingType.LINEAR:
      return EasingFunctions.linear;
    case EasingType.EASE_IN:
      return EasingFunctions.easeInQuad;
    case EasingType.EASE_OUT:
      return EasingFunctions.easeOutQuad;
    case EasingType.EASE_IN_OUT:
      return EasingFunctions.easeInOutQuad;
    case EasingType.BOUNCE:
      return EasingFunctions.bounce;
    case EasingType.ELASTIC:
      return EasingFunctions.elastic;
    case EasingType.BACK:
      return EasingFunctions.back;
    default:
      return EasingFunctions.linear;
  }
}

/**
 * Apply easing to a value
 */
export function applyEasing(value, easingType) {
  const easingFunction = getEasingFunction(easingType);
  return easingFunction(value);
} 