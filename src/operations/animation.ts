import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { MorphTarget } from './morphing.ts';

/**
 * Keyframe definition for animation
 */
export interface Keyframe {
  time: number;
  value: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

/**
 * Animation track for morphing
 */
export interface MorphAnimationTrack {
  morphTargetName: string;
  keyframes: Keyframe[];
  loop?: boolean;
  duration: number;
}

/**
 * Animation options
 */
export interface AnimationOptions {
  fps?: number;
  loop?: boolean;
  preserveNormals?: boolean;
  materialIndex?: number;
}

/**
 * Animation result
 */
export interface AnimationResult {
  frames: EditableMesh[];
  duration: number;
  frameCount: number;
}

/**
 * Create keyframe animation for morphing
 */
export function createMorphAnimation(
  baseMesh: EditableMesh,
  morphTargets: MorphTarget[],
  tracks: MorphAnimationTrack[],
  options: AnimationOptions = {}
): AnimationResult {
  const {
    fps = 30,
    loop = false,
    preserveNormals = true,
    materialIndex
  } = options;

  // Calculate total duration
  const totalDuration = Math.max(...tracks.map(track => track.duration));
  const frameCount = Math.ceil(totalDuration * fps);
  const frames: EditableMesh[] = [];

  // Create frames
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    const time = (frameIndex / fps) % totalDuration;
    const frameMesh = baseMesh.clone();

    // Apply each track
    for (const track of tracks) {
      const morphTarget = morphTargets.find(mt => mt.name === track.morphTargetName);
      if (!morphTarget) continue;

      // Calculate weight at current time
      const weight = evaluateTrack(track, time);
      
      // Apply morph target with calculated weight
      applyMorphTargetToMesh(frameMesh, morphTarget, weight, preserveNormals);
    }

    // Assign material if specified
    if (materialIndex !== undefined) {
      frameMesh.faces.forEach(face => {
        face.materialIndex = materialIndex;
      });
    }

    frames.push(frameMesh);
  }

  return {
    frames,
    duration: totalDuration,
    frameCount
  };
}

/**
 * Evaluate animation track at given time
 */
function evaluateTrack(track: MorphAnimationTrack, time: number): number {
  const { keyframes, loop, duration } = track;
  
  if (keyframes.length === 0) return 0;
  if (keyframes.length === 1) return keyframes[0].value;

  // Handle looping
  let adjustedTime = time;
  if (loop) {
    adjustedTime = time % duration;
  } else {
    adjustedTime = Math.min(time, duration);
  }

  // Find keyframes to interpolate between
  let startKeyframe: Keyframe | null = null;
  let endKeyframe: Keyframe | null = null;

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (adjustedTime >= keyframes[i].time && adjustedTime <= keyframes[i + 1].time) {
      startKeyframe = keyframes[i];
      endKeyframe = keyframes[i + 1];
      break;
    }
  }

  // Handle edge cases
  if (!startKeyframe || !endKeyframe) {
    if (adjustedTime <= keyframes[0].time) {
      return keyframes[0].value;
    }
    if (adjustedTime >= keyframes[keyframes.length - 1].time) {
      return keyframes[keyframes.length - 1].value;
    }
    return 0;
  }

  // Interpolate between keyframes
  const t = (adjustedTime - startKeyframe.time) / (endKeyframe.time - startKeyframe.time);
  const easedT = applyEasing(t, endKeyframe.easing || 'linear');
  
  return startKeyframe.value + (endKeyframe.value - startKeyframe.value) * easedT;
}

/**
 * Apply morph target to mesh with weight
 */
function applyMorphTargetToMesh(
  mesh: EditableMesh,
  morphTarget: MorphTarget,
  weight: number,
  preserveNormals: boolean
): void {
  if (morphTarget.vertices.length !== mesh.vertices.length) {
    throw new Error(`Morph target "${morphTarget.name}" vertex count must match mesh vertex count`);
  }

  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const targetVertex = morphTarget.vertices[i];
    
    // Interpolate position
    const originalPos = new Vector3(vertex.x, vertex.y, vertex.z);
    const newPos = new Vector3();
    newPos.lerpVectors(originalPos, targetVertex, weight * morphTarget.weight);
    vertex.setPosition(newPos.x, newPos.y, newPos.z);
  }

  // Note: Normal update would go here if implemented
}

/**
 * Apply easing function
 */
function applyEasing(t: number, easing: string): number {
  switch (easing) {
    case 'linear':
      return t;
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return t * (2 - t);
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    default:
      return t;
  }
}

/**
 * Create simple morph animation between two meshes
 */
export function createSimpleMorphAnimation(
  sourceMesh: EditableMesh,
  targetMesh: EditableMesh,
  duration: number = 1.0,
  options: AnimationOptions = {}
): AnimationResult {
  const { fps = 30 } = options;
  
  // Check if meshes have the same vertex count
  if (sourceMesh.vertices.length !== targetMesh.vertices.length) {
    throw new Error(`Source and target meshes must have the same vertex count. Source: ${sourceMesh.vertices.length}, Target: ${targetMesh.vertices.length}`);
  }
  
  // Create morph target from target mesh
  const morphTarget: MorphTarget = {
    name: 'target',
    vertices: targetMesh.vertices.map(v => new Vector3(v.x, v.y, v.z)),
    weight: 1.0
  };

  // Create animation track
  const track: MorphAnimationTrack = {
    morphTargetName: 'target',
    keyframes: [
      { time: 0, value: 0, easing: 'easeInOut' },
      { time: duration, value: 1, easing: 'easeInOut' }
    ],
    duration
  };

  return createMorphAnimation(sourceMesh, [morphTarget], [track], options);
}

/**
 * Export animation as keyframe data
 */
export function exportAnimationKeyframes(
  animation: AnimationResult,
  morphTargets: MorphTarget[]
): any {
  return {
    duration: animation.duration,
    frameCount: animation.frameCount,
    morphTargets: morphTargets.map(mt => ({
      name: mt.name,
      weight: mt.weight
    })),
    frames: animation.frames.map((frame, index) => ({
      frame: index,
      time: index / animation.frameCount * animation.duration,
      vertexCount: frame.vertices.length
    }))
  };
} 