/**
 * @fileoverview TransformManager Tests
 * Comprehensive tests for the TransformManager class
 */

import { TransformManager, Transform } from '../transforms/TransformManager.js';

describe('TransformManager', () => {
  let transformManager;

  beforeEach(() => {
    transformManager = new TransformManager({
      autoUpdate: true,
      cacheMatrices: true,
      maxTransforms: 10
    });
  });

  afterEach(() => {
    transformManager = null;
  });

  describe('Constructor', () => {
    test('should create TransformManager with default options', () => {
      const manager = new TransformManager();
      expect(manager.autoUpdate).toBe(true);
      expect(manager.cacheMatrices).toBe(true);
      expect(manager.maxTransforms).toBe(1000);
    });

    test('should create TransformManager with custom options', () => {
      const manager = new TransformManager({
        autoUpdate: false,
        cacheMatrices: false,
        maxTransforms: 50
      });
      expect(manager.autoUpdate).toBe(false);
      expect(manager.cacheMatrices).toBe(false);
      expect(manager.maxTransforms).toBe(50);
    });
  });

  describe('Transform Creation', () => {
    test('should create transform successfully', () => {
      const transform = transformManager.createTransform('test-transform', {
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale: { x: 2, y: 2, z: 2 },
        pivot: { x: 0, y: 0, z: 0 },
        space: 'world'
      });

      expect(transform).toBeInstanceOf(Transform);
      expect(transform.getPosition()).toEqual({ x: 1, y: 2, z: 3 });
      expect(transform.getRotation()).toEqual({ x: 0, y: Math.PI / 2, z: 0 });
      expect(transform.getScale()).toEqual({ x: 2, y: 2, z: 2 });
    });

    test('should not create transform when limit reached', () => {
      // Create transforms up to limit
      for (let i = 0; i < 10; i++) {
        transformManager.createTransform(`transform-${i}`);
      }

      const extraTransform = transformManager.createTransform('extra-transform');
      expect(extraTransform).toBeNull();
    });

    test('should create transform with minimal options', () => {
      const transform = transformManager.createTransform('minimal-transform');
      expect(transform).toBeInstanceOf(Transform);
      expect(transform.getPosition()).toEqual({ x: 0, y: 0, z: 0 });
      expect(transform.getScale()).toEqual({ x: 1, y: 1, z: 1 });
    });
  });

  describe('Transform Management', () => {
    test('should get transform by ID', () => {
      const createdTransform = transformManager.createTransform('test-transform');
      const retrievedTransform = transformManager.getTransform('test-transform');

      expect(retrievedTransform).toBe(createdTransform);
    });

    test('should return null for non-existent transform', () => {
      const transform = transformManager.getTransform('non-existent');
      expect(transform).toBeNull();
    });

    test('should update transform successfully', () => {
      const transform = transformManager.createTransform('test-transform');
      
      const updated = transformManager.updateTransform('test-transform', {
        position: { x: 5, y: 5, z: 5 },
        rotation: { x: Math.PI, y: 0, z: 0 },
        scale: { x: 3, y: 3, z: 3 }
      });

      expect(updated).toBe(true);
      expect(transform.getPosition()).toEqual({ x: 5, y: 5, z: 5 });
      expect(transform.getRotation()).toEqual({ x: Math.PI, y: 0, z: 0 });
      expect(transform.getScale()).toEqual({ x: 3, y: 3, z: 3 });
    });

    test('should return false when updating non-existent transform', () => {
      const updated = transformManager.updateTransform('non-existent', {
        position: { x: 1, y: 1, z: 1 }
      });
      expect(updated).toBe(false);
    });

    test('should remove transform successfully', () => {
      const transform = transformManager.createTransform('test-transform');
      
      const removed = transformManager.removeTransform('test-transform');
      expect(removed).toBe(true);
      expect(transformManager.getTransform('test-transform')).toBeNull();
    });

    test('should return false when removing non-existent transform', () => {
      const removed = transformManager.removeTransform('non-existent');
      expect(removed).toBe(false);
    });

    test('should get all transforms', () => {
      transformManager.createTransform('transform-1');
      transformManager.createTransform('transform-2');
      transformManager.createTransform('transform-3');

      const allTransforms = transformManager.getAllTransforms();
      expect(allTransforms).toHaveLength(3);
    });

    test('should get transform IDs', () => {
      transformManager.createTransform('transform-1');
      transformManager.createTransform('transform-2');

      const ids = transformManager.getTransformIds();
      expect(ids).toContain('transform-1');
      expect(ids).toContain('transform-2');
    });

    test('should clear all transforms', () => {
      transformManager.createTransform('transform-1');
      transformManager.createTransform('transform-2');

      transformManager.clearTransforms();
      expect(transformManager.getAllTransforms()).toHaveLength(0);
    });
  });

  describe('Transform Operations', () => {
    test('should apply transform to objects', () => {
      const transform = transformManager.createTransform('test-transform', {
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale: { x: 2, y: 2, z: 2 }
      });

      const objects = [
        { id: 'obj1', position: { x: 0, y: 0, z: 0 } },
        { id: 'obj2', position: { x: 1, y: 1, z: 1 } }
      ];

      const transformedObjects = transformManager.applyTransform('test-transform', objects, {
        space: 'world',
        relative: false
      });

      expect(transformedObjects).toHaveLength(2);
      expect(transformedObjects[0].position.x).toBe(1);
      expect(transformedObjects[0].position.y).toBe(2);
      expect(transformedObjects[0].position.z).toBe(3);
    });

    test('should create transform from matrix', () => {
      const matrix = [
        2, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 2, 0,
        1, 2, 3, 1
      ];

      const transform = transformManager.createTransformFromMatrix(matrix);
      expect(transform).toBeInstanceOf(Transform);
      expect(transform.getPosition()).toEqual({ x: 1, y: 2, z: 3 });
      expect(transform.getScale()).toEqual({ x: 2, y: 2, z: 2 });
    });

    test('should interpolate between transforms', () => {
      const transform1 = transformManager.createTransform('transform-1', {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      });

      const transform2 = transformManager.createTransform('transform-2', {
        position: { x: 10, y: 10, z: 10 },
        rotation: { x: Math.PI, y: Math.PI, z: Math.PI },
        scale: { x: 2, y: 2, z: 2 }
      });

      const interpolated = transformManager.interpolateTransforms(transform1, transform2, 0.5);
      expect(interpolated).toBeInstanceOf(Transform);
      expect(interpolated.getPosition()).toEqual({ x: 5, y: 5, z: 5 });
    });
  });

  describe('Transform Properties', () => {
    let transform;

    beforeEach(() => {
      transform = transformManager.createTransform('test-transform');
    });

    test('should set and get position', () => {
      transform.setPosition(1, 2, 3);
      expect(transform.getPosition()).toEqual({ x: 1, y: 2, z: 3 });
    });

    test('should set and get rotation in radians', () => {
      transform.setRotation(Math.PI / 2, Math.PI, 0);
      expect(transform.getRotation()).toEqual({ x: Math.PI / 2, y: Math.PI, z: 0 });
    });

    test('should set and get rotation in degrees', () => {
      transform.setRotationDegrees(90, 180, 0);
      expect(transform.getRotationDegrees()).toEqual({ x: 90, y: 180, z: 0 });
    });

    test('should set and get scale', () => {
      transform.setScale(2, 3, 4);
      expect(transform.getScale()).toEqual({ x: 2, y: 3, z: 4 });
    });

    test('should set uniform scale', () => {
      transform.setUniformScale(2.5);
      expect(transform.getScale()).toEqual({ x: 2.5, y: 2.5, z: 2.5 });
    });

    test('should set and get pivot', () => {
      transform.setPivot(0.5, 0.5, 0.5);
      expect(transform.getPivot()).toEqual({ x: 0.5, y: 0.5, z: 0.5 });
    });
  });

  describe('Transform Matrix Operations', () => {
    let transform;

    beforeEach(() => {
      transform = transformManager.createTransform('test-transform', {
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale: { x: 2, y: 2, z: 2 }
      });
    });

    test('should get transformation matrix', () => {
      const matrix = transform.getMatrix();
      expect(matrix).toBeInstanceOf(Array);
      expect(matrix).toHaveLength(16);
    });

    test('should get inverse transformation matrix', () => {
      const inverseMatrix = transform.getInverseMatrix();
      expect(inverseMatrix).toBeInstanceOf(Array);
      expect(inverseMatrix).toHaveLength(16);
    });

    test('should transform point', () => {
      const point = { x: 1, y: 1, z: 1 };
      const transformedPoint = transform.transformPoint(point);
      
      expect(transformedPoint).toHaveProperty('x');
      expect(transformedPoint).toHaveProperty('y');
      expect(transformedPoint).toHaveProperty('z');
    });

    test('should inverse transform point', () => {
      const point = { x: 1, y: 1, z: 1 };
      const inverseTransformedPoint = transform.inverseTransformPoint(point);
      
      expect(inverseTransformedPoint).toHaveProperty('x');
      expect(inverseTransformedPoint).toHaveProperty('y');
      expect(inverseTransformedPoint).toHaveProperty('z');
    });

    test('should transform vector', () => {
      const vector = { x: 1, y: 0, z: 0 };
      const transformedVector = transform.transformVector(vector);
      
      expect(transformedVector).toHaveProperty('x');
      expect(transformedVector).toHaveProperty('y');
      expect(transformedVector).toHaveProperty('z');
    });
  });

  describe('Transform Validation', () => {
    test('should validate valid transform', () => {
      const transform = transformManager.createTransform('test-transform', {
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        pivot: { x: 0, y: 0, z: 0 },
        space: 'world'
      });

      const validation = transform.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect invalid position', () => {
      const transform = transformManager.createTransform('test-transform');
      transform.position.x = NaN;

      const validation = transform.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid position values');
    });

    test('should detect invalid rotation', () => {
      const transform = transformManager.createTransform('test-transform');
      transform.rotation.y = Infinity;

      const validation = transform.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid rotation values');
    });

    test('should detect invalid scale', () => {
      const transform = transformManager.createTransform('test-transform');
      transform.scale.x = -1;

      const validation = transform.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid scale values (must be positive)');
    });

    test('should detect invalid space', () => {
      const transform = transformManager.createTransform('test-transform');
      transform.space = 'invalid';

      const validation = transform.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid transform space');
    });
  });

  describe('Transform Statistics', () => {
    test('should get statistics for empty manager', () => {
      const stats = transformManager.getStatistics();
      expect(stats.totalTransforms).toBe(0);
      expect(stats.autoUpdate).toBe(true);
      expect(stats.cacheMatrices).toBe(true);
    });

    test('should get statistics for manager with transforms', () => {
      transformManager.createTransform('transform-1', {
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 2, y: 2, z: 2 }
      });

      transformManager.createTransform('transform-2', {
        position: { x: 4, y: 5, z: 6 },
        rotation: { x: Math.PI, y: Math.PI, z: Math.PI },
        scale: { x: 1, y: 1, z: 1 }
      });

      const stats = transformManager.getStatistics();
      expect(stats.totalTransforms).toBe(2);
      expect(stats.averagePosition).toBeDefined();
      expect(stats.averageRotation).toBeDefined();
      expect(stats.averageScale).toBeDefined();
    });
  });

  describe('Transform History', () => {
    test('should add to history', () => {
      transformManager.createTransform('test-transform');
      
      const history = transformManager.getHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].action).toBe('create');
    });

    test('should limit history size', () => {
      const manager = new TransformManager({ maxHistorySize: 2 });
      
      manager.createTransform('transform-1');
      manager.createTransform('transform-2');
      manager.createTransform('transform-3');
      
      const history = manager.getHistory();
      expect(history.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Event Handling', () => {
    test('should emit transform created event', () => {
      const eventListener = jest.fn();
      transformManager.addEventListener('transformCreated', eventListener);

      transformManager.createTransform('test-transform');
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-transform',
          transform: expect.any(Transform)
        })
      );
    });

    test('should emit transform updated event', () => {
      const transform = transformManager.createTransform('test-transform');
      const eventListener = jest.fn();
      transformManager.addEventListener('transformUpdated', eventListener);

      transformManager.updateTransform('test-transform', {
        position: { x: 5, y: 5, z: 5 }
      });

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-transform',
          transform,
          updates: expect.any(Object)
        })
      );
    });

    test('should emit transform removed event', () => {
      const transform = transformManager.createTransform('test-transform');
      const eventListener = jest.fn();
      transformManager.addEventListener('transformRemoved', eventListener);

      transformManager.removeTransform('test-transform');
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-transform',
          transform
        })
      );
    });

    test('should emit transform applied event', () => {
      const transform = transformManager.createTransform('test-transform');
      const objects = [{ id: 'obj1', position: { x: 0, y: 0, z: 0 } }];
      const eventListener = jest.fn();
      transformManager.addEventListener('transformApplied', eventListener);

      transformManager.applyTransform('test-transform', objects);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          transformId: 'test-transform',
          objects: expect.any(Array)
        })
      );
    });

    test('should remove event listener', () => {
      const eventListener = jest.fn();
      transformManager.addEventListener('transformCreated', eventListener);
      transformManager.removeEventListener('transformCreated', eventListener);

      transformManager.createTransform('test-transform');
      expect(eventListener).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined parameters', () => {
      expect(() => transformManager.createTransform(null)).not.toThrow();
      expect(() => transformManager.createTransform(undefined)).not.toThrow();
    });

    test('should handle empty transform IDs', () => {
      const transform = transformManager.createTransform('');
      expect(transform).toBeInstanceOf(Transform);
    });

    test('should handle special characters in transform IDs', () => {
      const specialId = 'transform with spaces and special chars: !@#$%^&*()';
      const transform = transformManager.createTransform(specialId);
      expect(transform).toBeInstanceOf(Transform);
    });

    test('should handle very long transform IDs', () => {
      const longId = 'A'.repeat(1000);
      const transform = transformManager.createTransform(longId);
      expect(transform).toBeInstanceOf(Transform);
    });

    test('should handle concurrent transform operations', () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(Promise.resolve(transformManager.createTransform(`transform-${i}`)));
      }

      return Promise.all(promises).then(() => {
        expect(transformManager.getAllTransforms()).toHaveLength(10);
      });
    });

    test('should handle transform with extreme values', () => {
      const transform = transformManager.createTransform('extreme-transform', {
        position: { x: 1e6, y: -1e6, z: 1e-6 },
        rotation: { x: 2 * Math.PI, y: -2 * Math.PI, z: 0 },
        scale: { x: 1e3, y: 1e-3, z: 1 }
      });

      expect(transform).toBeInstanceOf(Transform);
      const validation = transform.validate();
      expect(validation.isValid).toBe(true);
    });
  });
}); 