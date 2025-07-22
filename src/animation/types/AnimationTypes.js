/**
 * @fileoverview Animation Types and Constants
 * Defines types, constants, and enums for the animation system
 */

/**
 * Animation playback states
 */
export const AnimationState = {
  STOPPED: 'stopped',
  PLAYING: 'playing',
  PAUSED: 'paused',
  REVERSED: 'reversed'
};

/**
 * Animation loop modes
 */
export const LoopMode = {
  NONE: 'none',
  LOOP: 'loop',
  PING_PONG: 'ping_pong',
  CLAMP: 'clamp'
};

/**
 * Keyframe interpolation types
 */
export const InterpolationType = {
  LINEAR: 'linear',
  STEP: 'step',
  CUBIC: 'cubic',
  BEZIER: 'bezier'
};

/**
 * Animation property types
 */
export const PropertyType = {
  POSITION: 'position',
  ROTATION: 'rotation',
  SCALE: 'scale',
  OPACITY: 'opacity',
  COLOR: 'color',
  CUSTOM: 'custom'
};

/**
 * Timeline event types
 */
export const TimelineEventType = {
  KEYFRAME: 'keyframe',
  MARKER: 'marker',
  TRIGGER: 'trigger',
  CALLBACK: 'callback'
};

/**
 * Animation result structure
 */
export class AnimationResult {
  constructor(success = true, data = null, error = null) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.timestamp = Date.now();
  }

  static success(data) {
    return new AnimationResult(true, data);
  }

  static error(error) {
    return new AnimationResult(false, null, error);
  }
}

/**
 * Keyframe data structure
 */
export class Keyframe {
  constructor(time, value, interpolation = InterpolationType.LINEAR, easing = null) {
    this.time = time;
    this.value = value;
    this.interpolation = interpolation;
    this.easing = easing;
  }
}

/**
 * Animation track structure
 */
export class AnimationTrack {
  constructor(property, keyframes = []) {
    this.property = property;
    this.keyframes = keyframes;
    this.loopMode = LoopMode.NONE;
  }

  addKeyframe(keyframe) {
    this.keyframes.push(keyframe);
    this.keyframes.sort((a, b) => a.time - b.time);
  }

  removeKeyframe(index) {
    if (index >= 0 && index < this.keyframes.length) {
      this.keyframes.splice(index, 1);
    }
  }
}

/**
 * Animation clip structure
 */
export class AnimationClip {
  constructor(name, duration = 0, tracks = []) {
    this.name = name;
    this.duration = duration;
    this.tracks = tracks;
    this.loopMode = LoopMode.NONE;
  }

  addTrack(track) {
    this.tracks.push(track);
    this.updateDuration();
  }

  removeTrack(index) {
    if (index >= 0 && index < this.tracks.length) {
      this.tracks.splice(index, 1);
      this.updateDuration();
    }
  }

  updateDuration() {
    this.duration = Math.max(...this.tracks.map(track => 
      Math.max(...track.keyframes.map(kf => kf.time))
    ), 0);
  }
} 