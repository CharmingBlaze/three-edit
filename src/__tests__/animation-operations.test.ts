import { describe, it, expect, beforeEach } from 'vitest';
import { EditableMesh } from '../core/EditableMesh.ts';
import { createCube } from '../primitives/index.ts';
import {
  createMorphAnimation,
  createSimpleMorphAnimation,
  exportAnimationKeyframes,
  MorphAnimationTrack
} from '../operations/animation.ts';
import { createMorphTarget } from '../operations/morphing.ts';

describe('Animation Operations', () => {
  let cube: EditableMesh;
  let sphere: EditableMesh;

  beforeEach(() => {
    cube = createCube({ width: 2, height: 2, depth: 2 });
    // Create a sphere with compatible vertex count by using a cube as target
    sphere = createCube({ width: 1, height: 1, depth: 1 });
  });

  describe('createSimpleMorphAnimation', () => {
    it('should create simple morph animation between two meshes', () => {
      const animation = createSimpleMorphAnimation(cube, sphere, 1.0, { fps: 30 });

      expect(animation.frames.length).toBe(30);
      expect(animation.duration).toBe(1.0);
      expect(animation.frameCount).toBe(30);
      expect(animation.frames[0]).toBeInstanceOf(EditableMesh);
      expect(animation.frames[animation.frames.length - 1]).toBeInstanceOf(EditableMesh);
    });

    it('should create animation with custom duration', () => {
      const animation = createSimpleMorphAnimation(cube, sphere, 2.0, { fps: 60 });

      expect(animation.frames.length).toBe(120);
      expect(animation.duration).toBe(2.0);
      expect(animation.frameCount).toBe(120);
    });

    it('should create animation with custom FPS', () => {
      const animation = createSimpleMorphAnimation(cube, sphere, 1.0, { fps: 24 });

      expect(animation.frames.length).toBe(24);
      expect(animation.frameCount).toBe(24);
    });

    it('should preserve mesh properties in animation frames', () => {
      const animation = createSimpleMorphAnimation(cube, sphere, 1.0, { fps: 10 });

      for (const frame of animation.frames) {
        expect(frame.vertices.length).toBe(cube.vertices.length);
        expect(frame.faces.length).toBe(cube.faces.length);
        expect(frame.edges.length).toBe(cube.edges.length);
      }
    });
  });

  describe('createMorphAnimation', () => {
    it('should create keyframe animation with single track', () => {
      const morphTarget = createMorphTarget(cube, 'test', 1.0);
      
      const track: MorphAnimationTrack = {
        morphTargetName: 'test',
        keyframes: [
          { time: 0, value: 0, easing: 'linear' },
          { time: 1, value: 1, easing: 'linear' }
        ],
        duration: 1.0
      };

      const animation = createMorphAnimation(cube, [morphTarget], [track], { fps: 30 });

      expect(animation.frames.length).toBe(30);
      expect(animation.duration).toBe(1.0);
      expect(animation.frameCount).toBe(30);
    });

    it('should create animation with multiple tracks', () => {
      const morphTarget1 = createMorphTarget(cube, 'target1', 1.0);
      const morphTarget2 = createMorphTarget(cube, 'target2', 1.0);
      
      const track1: MorphAnimationTrack = {
        morphTargetName: 'target1',
        keyframes: [
          { time: 0, value: 0, easing: 'easeIn' },
          { time: 1, value: 1, easing: 'easeIn' }
        ],
        duration: 1.0
      };

      const track2: MorphAnimationTrack = {
        morphTargetName: 'target2',
        keyframes: [
          { time: 0.5, value: 0, easing: 'easeOut' },
          { time: 1.5, value: 1, easing: 'easeOut' }
        ],
        duration: 1.5
      };

      const animation = createMorphAnimation(
        cube, 
        [morphTarget1, morphTarget2], 
        [track1, track2], 
        { fps: 30 }
      );

      expect(animation.frames.length).toBe(45); // 1.5 seconds * 30 fps
      expect(animation.duration).toBe(1.5);
      expect(animation.frameCount).toBe(45);
    });

    it('should handle looping animations', () => {
      const morphTarget = createMorphTarget(cube, 'test', 1.0);
      
      const track: MorphAnimationTrack = {
        morphTargetName: 'test',
        keyframes: [
          { time: 0, value: 0, easing: 'linear' },
          { time: 0.5, value: 1, easing: 'linear' },
          { time: 1, value: 0, easing: 'linear' }
        ],
        duration: 1.0,
        loop: true
      };

      const animation = createMorphAnimation(cube, [morphTarget], [track], { fps: 10 });

      expect(animation.frames.length).toBe(10);
      expect(animation.duration).toBe(1.0);
    });

    it('should handle different easing functions', () => {
      const morphTarget = createMorphTarget(cube, 'test', 1.0);
      
      const track: MorphAnimationTrack = {
        morphTargetName: 'test',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 1, value: 1, easing: 'easeInOut' }
        ],
        duration: 1.0
      };

      const animation = createMorphAnimation(cube, [morphTarget], [track], { fps: 10 });

      expect(animation.frames.length).toBe(10);
      expect(animation.duration).toBe(1.0);
    });

    it('should handle material assignment', () => {
      const morphTarget = createMorphTarget(cube, 'test', 1.0);
      
      const track: MorphAnimationTrack = {
        morphTargetName: 'test',
        keyframes: [
          { time: 0, value: 0, easing: 'linear' },
          { time: 1, value: 1, easing: 'linear' }
        ],
        duration: 1.0
      };

      const animation = createMorphAnimation(
        cube, 
        [morphTarget], 
        [track], 
        { fps: 10, materialIndex: 2 }
      );

      // Check that all frames have the assigned material
      for (const frame of animation.frames) {
        for (const face of frame.faces) {
          expect(face.materialIndex).toBe(2);
        }
      }
    });
  });

  describe('exportAnimationKeyframes', () => {
    it('should export animation keyframe data', () => {
      const morphTarget = createMorphTarget(cube, 'test', 1.0);
      
      const track: MorphAnimationTrack = {
        morphTargetName: 'test',
        keyframes: [
          { time: 0, value: 0, easing: 'linear' },
          { time: 1, value: 1, easing: 'linear' }
        ],
        duration: 1.0
      };

      const animation = createMorphAnimation(cube, [morphTarget], [track], { fps: 10 });
      const keyframeData = exportAnimationKeyframes(animation, [morphTarget]);

      expect(keyframeData.duration).toBe(1.0);
      expect(keyframeData.frameCount).toBe(10);
      expect(keyframeData.morphTargets).toHaveLength(1);
      expect(keyframeData.frames).toHaveLength(10);
      expect(keyframeData.morphTargets[0].name).toBe('test');
      expect(keyframeData.morphTargets[0].weight).toBe(1.0);
    });

    it('should export frame information correctly', () => {
      const morphTarget = createMorphTarget(cube, 'test', 1.0);
      
      const track: MorphAnimationTrack = {
        morphTargetName: 'test',
        keyframes: [
          { time: 0, value: 0, easing: 'linear' },
          { time: 1, value: 1, easing: 'linear' }
        ],
        duration: 1.0
      };

      const animation = createMorphAnimation(cube, [morphTarget], [track], { fps: 5 });
      const keyframeData = exportAnimationKeyframes(animation, [morphTarget]);

      expect(keyframeData.frames).toHaveLength(5);
      
      for (let i = 0; i < keyframeData.frames.length; i++) {
        const frame = keyframeData.frames[i];
        expect(frame.frame).toBe(i);
        expect(frame.time).toBeCloseTo(i * 0.2, 2); // 1.0 / 5 fps
        expect(frame.vertexCount).toBe(cube.vertices.length);
      }
    });
  });

  describe('Animation Edge Cases', () => {
    it('should handle empty keyframes', () => {
      const morphTarget = createMorphTarget(cube, 'test', 1.0);
      
      const track: MorphAnimationTrack = {
        morphTargetName: 'test',
        keyframes: [],
        duration: 1.0
      };

      const animation = createMorphAnimation(cube, [morphTarget], [track], { fps: 10 });

      expect(animation.frames.length).toBe(10);
      expect(animation.duration).toBe(1.0);
    });

    it('should handle single keyframe', () => {
      const morphTarget = createMorphTarget(cube, 'test', 1.0);
      
      const track: MorphAnimationTrack = {
        morphTargetName: 'test',
        keyframes: [
          { time: 0, value: 0.5, easing: 'linear' }
        ],
        duration: 1.0
      };

      const animation = createMorphAnimation(cube, [morphTarget], [track], { fps: 10 });

      expect(animation.frames.length).toBe(10);
      expect(animation.duration).toBe(1.0);
    });

    it('should handle missing morph target', () => {
      const morphTarget = createMorphTarget(cube, 'test', 1.0);
      
      const track: MorphAnimationTrack = {
        morphTargetName: 'nonexistent',
        keyframes: [
          { time: 0, value: 0, easing: 'linear' },
          { time: 1, value: 1, easing: 'linear' }
        ],
        duration: 1.0
      };

      const animation = createMorphAnimation(cube, [morphTarget], [track], { fps: 10 });

      expect(animation.frames.length).toBe(10);
      expect(animation.duration).toBe(1.0);
      // Should not throw error, just skip the missing morph target
    });

    it('should handle zero duration', () => {
      const morphTarget = createMorphTarget(cube, 'test', 1.0);
      
      const track: MorphAnimationTrack = {
        morphTargetName: 'test',
        keyframes: [
          { time: 0, value: 0, easing: 'linear' },
          { time: 0, value: 1, easing: 'linear' }
        ],
        duration: 0
      };

      const animation = createMorphAnimation(cube, [morphTarget], [track], { fps: 10 });

      expect(animation.frames.length).toBe(0);
      expect(animation.duration).toBe(0);
      expect(animation.frameCount).toBe(0);
    });
  });

  describe('Animation Performance', () => {
    it('should handle large meshes efficiently', () => {
      // Create a large cube with compatible vertex count
      const largeCube = createCube({ width: 4, height: 4, depth: 4 });
      
      const startTime = performance.now();
      const animation = createSimpleMorphAnimation(cube, largeCube, 1.0, { fps: 30 });
      const endTime = performance.now();

      expect(animation.frames.length).toBe(30);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle high frame rates', () => {
      const startTime = performance.now();
      const animation = createSimpleMorphAnimation(cube, sphere, 1.0, { fps: 60 });
      const endTime = performance.now();

      expect(animation.frames.length).toBe(60);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });
}); 