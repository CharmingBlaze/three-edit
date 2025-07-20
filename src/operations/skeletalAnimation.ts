import { Bone } from '../core/Bone';
import { Skeleton } from '../core/Skeleton';
import { Skin } from '../core/Skin';
import { EditableMesh } from '../core/EditableMesh';
import { Vector3, Quaternion } from '../utils/math';

/**
 * Keyframe data structure
 */
export interface Keyframe {
  time: number;
  position?: Vector3;
  rotation?: Quaternion;
  scale?: Vector3;
}

/**
 * Bone animation track
 */
export interface BoneTrack {
  boneName: string;
  keyframes: Keyframe[];
}

/**
 * Animation clip
 */
export interface AnimationClip {
  name: string;
  duration: number;
  tracks: BoneTrack[];
  loop?: boolean;
}

/**
 * Animation state
 */
export interface AnimationState {
  currentTime: number;
  isPlaying: boolean;
  speed: number;
  loop: boolean;
}

/**
 * Skeletal animation system
 */
export class SkeletalAnimation {
  private clips: Map<string, AnimationClip>;
  private currentClip: AnimationClip | null;
  private state: AnimationState;

  constructor() {
    this.clips = new Map();
    this.currentClip = null;
    this.state = {
      currentTime: 0,
      isPlaying: false,
      speed: 1.0,
      loop: true
    };
  }

  /**
   * Add an animation clip
   */
  addClip(clip: AnimationClip): void {
    this.clips.set(clip.name, clip);
  }

  /**
   * Remove an animation clip
   */
  removeClip(name: string): void {
    this.clips.delete(name);
  }

  /**
   * Get an animation clip
   */
  getClip(name: string): AnimationClip | undefined {
    return this.clips.get(name);
  }

  /**
   * Get all clip names
   */
  getClipNames(): string[] {
    return Array.from(this.clips.keys());
  }

  /**
   * Play an animation clip
   */
  playClip(name: string, options: {
    loop?: boolean;
    speed?: number;
    startTime?: number;
  } = {}): void {
    const clip = this.clips.get(name);
    if (!clip) {
      throw new Error(`Animation clip '${name}' not found`);
    }

    this.currentClip = clip;
    this.state.currentTime = options.startTime || 0;
    this.state.isPlaying = true;
    this.state.speed = options.speed || 1.0;
    this.state.loop = options.loop !== undefined ? options.loop : clip.loop || true;
  }

  /**
   * Stop the current animation
   */
  stop(): void {
    this.state.isPlaying = false;
  }

  /**
   * Pause the current animation
   */
  pause(): void {
    this.state.isPlaying = false;
  }

  /**
   * Resume the current animation
   */
  resume(): void {
    this.state.isPlaying = true;
  }

  /**
   * Set the current time
   */
  setTime(time: number): void {
    if (this.currentClip) {
      this.state.currentTime = Math.max(0, Math.min(time, this.currentClip.duration));
    }
  }

  /**
   * Update the animation
   */
  update(deltaTime: number, skeleton: Skeleton): void {
    if (!this.currentClip || !this.state.isPlaying) {
      return;
    }

    // Update time
    this.state.currentTime += deltaTime * this.state.speed;

    // Handle looping
    if (this.state.loop && this.state.currentTime >= this.currentClip.duration) {
      this.state.currentTime = this.state.currentTime % this.currentClip.duration;
    } else if (!this.state.loop && this.state.currentTime >= this.currentClip.duration) {
      this.state.currentTime = this.currentClip.duration;
      this.state.isPlaying = false;
    }

    // Apply animation to skeleton
    this.applyAnimationToSkeleton(skeleton);
  }

  /**
   * Apply animation to skeleton
   */
  private applyAnimationToSkeleton(skeleton: Skeleton): void {
    if (!this.currentClip) return;

    for (const track of this.currentClip.tracks) {
      const bone = skeleton.findBone(track.boneName);
      if (!bone) continue;

      // Find the keyframes to interpolate between
      const keyframes = this.findKeyframes(track.keyframes, this.state.currentTime);
      if (keyframes.length === 0) continue;

      if (keyframes.length === 1) {
        // Single keyframe - apply directly
        this.applyKeyframe(bone, keyframes[0]);
      } else {
        // Interpolate between keyframes
        const t = this.calculateInterpolationFactor(keyframes[0], keyframes[1], this.state.currentTime);
        this.interpolateKeyframes(bone, keyframes[0], keyframes[1], t);
      }
    }

    // Update skeleton matrices
    skeleton.calculateBindMatrices();
  }

  /**
   * Find keyframes to interpolate between
   */
  private findKeyframes(keyframes: Keyframe[], time: number): Keyframe[] {
    if (keyframes.length === 0) return [];

    // Sort keyframes by time
    const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);

    // Find the keyframes around the current time
    let prevKeyframe: Keyframe | null = null;
    let nextKeyframe: Keyframe | null = null;

    for (let i = 0; i < sortedKeyframes.length; i++) {
      const keyframe = sortedKeyframes[i];
      if (keyframe.time <= time) {
        prevKeyframe = keyframe;
      } else {
        nextKeyframe = keyframe;
        break;
      }
    }

    // If we're past the last keyframe, use the last one
    if (!nextKeyframe && prevKeyframe) {
      return [prevKeyframe];
    }

    // If we're before the first keyframe, use the first one
    if (!prevKeyframe && nextKeyframe) {
      return [nextKeyframe];
    }

    // Return both keyframes for interpolation
    if (prevKeyframe && nextKeyframe) {
      return [prevKeyframe, nextKeyframe];
    }

    return [];
  }

  /**
   * Calculate interpolation factor between keyframes
   */
  private calculateInterpolationFactor(keyframe1: Keyframe, keyframe2: Keyframe, time: number): number {
    const timeDiff = keyframe2.time - keyframe1.time;
    if (timeDiff === 0) return 0;

    return (time - keyframe1.time) / timeDiff;
  }

  /**
   * Apply a single keyframe to a bone
   */
  private applyKeyframe(bone: Bone, keyframe: Keyframe): void {
    if (keyframe.position) {
      bone.setPosition(keyframe.position.x, keyframe.position.y, keyframe.position.z);
    }
    if (keyframe.rotation) {
      bone.setRotation(keyframe.rotation.x, keyframe.rotation.y, keyframe.rotation.z, keyframe.rotation.w);
    }
    if (keyframe.scale) {
      bone.setScale(keyframe.scale.x, keyframe.scale.y, keyframe.scale.z);
    }
  }

  /**
   * Interpolate between two keyframes
   */
  private interpolateKeyframes(bone: Bone, keyframe1: Keyframe, keyframe2: Keyframe, t: number): void {
    // Interpolate position
    if (keyframe1.position && keyframe2.position) {
      const interpolatedPosition = this.interpolateVector3(keyframe1.position, keyframe2.position, t);
      bone.setPosition(interpolatedPosition.x, interpolatedPosition.y, interpolatedPosition.z);
    }

    // Interpolate rotation
    if (keyframe1.rotation && keyframe2.rotation) {
      const interpolatedRotation = this.interpolateQuaternion(keyframe1.rotation, keyframe2.rotation, t);
      bone.setRotation(interpolatedRotation.x, interpolatedRotation.y, interpolatedRotation.z, interpolatedRotation.w);
    }

    // Interpolate scale
    if (keyframe1.scale && keyframe2.scale) {
      const interpolatedScale = this.interpolateVector3(keyframe1.scale, keyframe2.scale, t);
      bone.setScale(interpolatedScale.x, interpolatedScale.y, interpolatedScale.z);
    }
  }

  /**
   * Interpolate between two Vector3 values
   */
  private interpolateVector3(v1: Vector3, v2: Vector3, t: number): Vector3 {
    return new Vector3(
      v1.x + (v2.x - v1.x) * t,
      v1.y + (v2.y - v1.y) * t,
      v1.z + (v2.z - v1.z) * t
    );
  }

  /**
   * Interpolate between two Quaternion values (SLERP)
   */
  private interpolateQuaternion(q1: Quaternion, q2: Quaternion, t: number): Quaternion {
    // Spherical linear interpolation (SLERP)
    let dot = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;

    // If dot product is negative, negate one quaternion to ensure shortest path
    if (dot < 0) {
      q2 = new Quaternion(-q2.x, -q2.y, -q2.z, -q2.w);
      dot = -dot;
    }

    let s1, s2;
    if (dot > 0.9995) {
      // Quaternions are very close, use linear interpolation
      s1 = 1 - t;
      s2 = t;
    } else {
      // Use spherical interpolation
      const theta = Math.acos(dot);
      const sinTheta = Math.sin(theta);
      s1 = Math.sin((1 - t) * theta) / sinTheta;
      s2 = Math.sin(t * theta) / sinTheta;
    }

    return new Quaternion(
      s1 * q1.x + s2 * q2.x,
      s1 * q1.y + s2 * q2.y,
      s1 * q1.z + s2 * q2.z,
      s1 * q1.w + s2 * q2.w
    );
  }

  /**
   * Create a simple idle animation
   */
  static createIdleAnimation(duration = 2.0): AnimationClip {
    return {
      name: 'Idle',
      duration,
      loop: true,
      tracks: [
        {
          boneName: 'Head',
          keyframes: [
            { time: 0, rotation: new Quaternion(0, 0, 0, 1) },
            { time: duration * 0.5, rotation: new Quaternion(0, 0, 0.1, 0.995) },
            { time: duration, rotation: new Quaternion(0, 0, 0, 1) }
          ]
        }
      ]
    };
  }

  /**
   * Create a simple walk animation
   */
  static createWalkAnimation(duration = 1.0): AnimationClip {
    return {
      name: 'Walk',
      duration,
      loop: true,
      tracks: [
        {
          boneName: 'LeftThigh',
          keyframes: [
            { time: 0, rotation: new Quaternion(0.3, 0, 0, 0.954) },
            { time: duration * 0.5, rotation: new Quaternion(-0.3, 0, 0, 0.954) },
            { time: duration, rotation: new Quaternion(0.3, 0, 0, 0.954) }
          ]
        },
        {
          boneName: 'RightThigh',
          keyframes: [
            { time: 0, rotation: new Quaternion(-0.3, 0, 0, 0.954) },
            { time: duration * 0.5, rotation: new Quaternion(0.3, 0, 0, 0.954) },
            { time: duration, rotation: new Quaternion(-0.3, 0, 0, 0.954) }
          ]
        },
        {
          boneName: 'LeftShin',
          keyframes: [
            { time: 0, rotation: new Quaternion(-0.5, 0, 0, 0.866) },
            { time: duration * 0.5, rotation: new Quaternion(0.5, 0, 0, 0.866) },
            { time: duration, rotation: new Quaternion(-0.5, 0, 0, 0.866) }
          ]
        },
        {
          boneName: 'RightShin',
          keyframes: [
            { time: 0, rotation: new Quaternion(0.5, 0, 0, 0.866) },
            { time: duration * 0.5, rotation: new Quaternion(-0.5, 0, 0, 0.866) },
            { time: duration, rotation: new Quaternion(0.5, 0, 0, 0.866) }
          ]
        }
      ]
    };
  }

  /**
   * Create a simple run animation
   */
  static createRunAnimation(duration = 0.5): AnimationClip {
    return {
      name: 'Run',
      duration,
      loop: true,
      tracks: [
        {
          boneName: 'LeftThigh',
          keyframes: [
            { time: 0, rotation: new Quaternion(0.5, 0, 0, 0.866) },
            { time: duration * 0.5, rotation: new Quaternion(-0.5, 0, 0, 0.866) },
            { time: duration, rotation: new Quaternion(0.5, 0, 0, 0.866) }
          ]
        },
        {
          boneName: 'RightThigh',
          keyframes: [
            { time: 0, rotation: new Quaternion(-0.5, 0, 0, 0.866) },
            { time: duration * 0.5, rotation: new Quaternion(0.5, 0, 0, 0.866) },
            { time: duration, rotation: new Quaternion(-0.5, 0, 0, 0.866) }
          ]
        },
        {
          boneName: 'LeftShin',
          keyframes: [
            { time: 0, rotation: new Quaternion(-0.7, 0, 0, 0.707) },
            { time: duration * 0.5, rotation: new Quaternion(0.7, 0, 0, 0.707) },
            { time: duration, rotation: new Quaternion(-0.7, 0, 0, 0.707) }
          ]
        },
        {
          boneName: 'RightShin',
          keyframes: [
            { time: 0, rotation: new Quaternion(0.7, 0, 0, 0.707) },
            { time: duration * 0.5, rotation: new Quaternion(-0.7, 0, 0, 0.707) },
            { time: duration, rotation: new Quaternion(0.7, 0, 0, 0.707) }
          ]
        }
      ]
    };
  }
}

/**
 * Skinned mesh operations
 */
export class SkinnedMeshOperations {
  /**
   * Apply skinning to a mesh
   */
  static applySkinning(mesh: EditableMesh, skin: Skin): void {
    // Store original positions
    const originalPositions: Vector3[] = [];
    for (let i = 0; i < mesh.vertices.length; i++) {
      const vertex = mesh.getVertex(i);
      if (vertex) {
        originalPositions[i] = new Vector3(vertex.x, vertex.y, vertex.z);
      }
    }

    // Apply skinning to each vertex
    for (let i = 0; i < mesh.vertices.length; i++) {
      const vertex = mesh.getVertex(i);
      if (!vertex || !originalPositions[i]) continue;

      const skinnedPosition = skin.applySkinning(i, originalPositions[i]);
      vertex.x = skinnedPosition.x;
      vertex.y = skinnedPosition.y;
      vertex.z = skinnedPosition.z;
    }
  }

  /**
   * Reset mesh to bind pose
   */
  static resetToBindPose(mesh: EditableMesh, skin: Skin): void {
    // This would restore the original vertex positions
    // In a real implementation, you would store the bind pose positions
    // For now, we'll just leave the mesh as is
    // TODO: Implement proper bind pose restoration
  }

  /**
   * Create a skinned mesh from a regular mesh and skeleton
   */
  static createSkinnedMesh(
    mesh: EditableMesh,
    skeleton: Skeleton,
    autoWeight = true
  ): { mesh: EditableMesh; skin: Skin } {
    // Create skin
    const skin = new Skin('Skin', skeleton);

    // Auto-weight if requested
    if (autoWeight) {
      // For now, we'll skip auto-weighting to avoid circular dependencies
      // In a real implementation, this would be handled differently
      console.log('Auto-weighting disabled to avoid circular dependencies');
    }

    return { mesh, skin };
  }
} 