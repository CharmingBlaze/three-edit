/**
 * @fileoverview Animation Manager
 * Manages animation playback, timing, and state for the animation system
 */

import { AnimationState, LoopMode, AnimationResult } from '../types/AnimationTypes.js';
import { calculateAnimationValue, applyLoopMode, validateAnimationData } from '../utils/animationUtils.js';

/**
 * Animation Manager class
 * Handles animation playback, timing, and state management
 */
export class AnimationManager {
  constructor() {
    this.animations = new Map();
    this.activeAnimations = new Map();
    this.globalTime = 0;
    this.isPlaying = false;
    this.speed = 1.0;
    this.lastUpdateTime = 0;
  }

  /**
   * Add an animation clip
   */
  addAnimation(name, animationClip) {
    const validationErrors = validateAnimationData(animationClip);
    if (validationErrors.length > 0) {
      return AnimationResult.error(validationErrors.join(', '));
    }

    this.animations.set(name, animationClip);
    return AnimationResult.success({ name, added: true });
  }

  /**
   * Remove an animation clip
   */
  removeAnimation(name) {
    if (this.animations.has(name)) {
      this.animations.delete(name);
      this.stopAnimation(name);
      return AnimationResult.success({ name, removed: true });
    }
    return AnimationResult.error(`Animation '${name}' not found`);
  }

  /**
   * Play an animation
   */
  playAnimation(name, options = {}) {
    const animation = this.animations.get(name);
    if (!animation) {
      return AnimationResult.error(`Animation '${name}' not found`);
    }

    const {
      startTime = 0,
      loopMode = animation.loopMode || LoopMode.NONE,
      speed = 1.0,
      onComplete = null
    } = options;

    const animationInstance = {
      name,
      animation,
      currentTime: startTime,
      loopMode,
      speed,
      onComplete,
      state: AnimationState.PLAYING
    };

    this.activeAnimations.set(name, animationInstance);
    return AnimationResult.success({ name, started: true });
  }

  /**
   * Stop an animation
   */
  stopAnimation(name) {
    const animationInstance = this.activeAnimations.get(name);
    if (animationInstance) {
      animationInstance.state = AnimationState.STOPPED;
      this.activeAnimations.delete(name);
      return AnimationResult.success({ name, stopped: true });
    }
    return AnimationResult.error(`Animation '${name}' not found or not playing`);
  }

  /**
   * Pause an animation
   */
  pauseAnimation(name) {
    const animationInstance = this.activeAnimations.get(name);
    if (animationInstance) {
      animationInstance.state = AnimationState.PAUSED;
      return AnimationResult.success({ name, paused: true });
    }
    return AnimationResult.error(`Animation '${name}' not found or not playing`);
  }

  /**
   * Resume an animation
   */
  resumeAnimation(name) {
    const animationInstance = this.activeAnimations.get(name);
    if (animationInstance && animationInstance.state === AnimationState.PAUSED) {
      animationInstance.state = AnimationState.PLAYING;
      return AnimationResult.success({ name, resumed: true });
    }
    return AnimationResult.error(`Animation '${name}' not found or not paused`);
  }

  /**
   * Update animation manager
   */
  update(deltaTime = 0) {
    if (!this.isPlaying) return;

    const currentTime = Date.now();
    const actualDeltaTime = this.lastUpdateTime ? currentTime - this.lastUpdateTime : 0;
    this.lastUpdateTime = currentTime;

    const scaledDeltaTime = actualDeltaTime * this.speed * 0.001; // Convert to seconds

    for (const [name, instance] of this.activeAnimations) {
      if (instance.state !== AnimationState.PLAYING) continue;

      instance.currentTime += scaledDeltaTime * instance.speed;
      
      // Apply loop mode
      const loopedTime = applyLoopMode(
        instance.currentTime, 
        instance.animation.duration, 
        instance.loopMode
      );

      // Check if animation is complete
      if (instance.currentTime >= instance.animation.duration) {
        if (instance.onComplete) {
          instance.onComplete(name);
        }
        
        if (instance.loopMode === LoopMode.NONE) {
          this.stopAnimation(name);
        }
      }
    }
  }

  /**
   * Get current animation values for an object
   */
  getAnimationValues(name) {
    const instance = this.activeAnimations.get(name);
    if (!instance) {
      return AnimationResult.error(`Animation '${name}' not found or not playing`);
    }

    const values = {};
    const currentTime = applyLoopMode(
      instance.currentTime, 
      instance.animation.duration, 
      instance.loopMode
    );

    for (const track of instance.animation.tracks) {
      values[track.property] = calculateAnimationValue(track, currentTime);
    }

    return AnimationResult.success(values);
  }

  /**
   * Set global playback state
   */
  setPlaybackState(playing) {
    this.isPlaying = playing;
    if (!playing) {
      this.lastUpdateTime = 0;
    }
  }

  /**
   * Set global playback speed
   */
  setSpeed(speed) {
    this.speed = Math.max(0, speed);
  }

  /**
   * Get all active animations
   */
  getActiveAnimations() {
    return Array.from(this.activeAnimations.keys());
  }

  /**
   * Get animation information
   */
  getAnimationInfo(name) {
    const animation = this.animations.get(name);
    const instance = this.activeAnimations.get(name);
    
    if (!animation) {
      return AnimationResult.error(`Animation '${name}' not found`);
    }

    return AnimationResult.success({
      name,
      duration: animation.duration,
      tracks: animation.tracks.length,
      isPlaying: instance ? instance.state === AnimationState.PLAYING : false,
      currentTime: instance ? instance.currentTime : 0
    });
  }
} 