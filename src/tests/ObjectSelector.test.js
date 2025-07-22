/**
 * @fileoverview ObjectSelector Tests
 * Comprehensive tests for the ObjectSelector class
 */

import { describe, beforeEach, test, expect } from 'vitest';
import { ObjectSelector } from '../selection/ObjectSelector.js';

describe('ObjectSelector', () => {
  let mockObjects;
  let mockRay;

  beforeEach(() => {
    mockObjects = [
      {
        id: 'obj1',
        name: 'Cube',
        type: 'mesh',
        bounds: {
          min: { x: -1, y: -1, z: -1 },
          max: { x: 1, y: 1, z: 1 }
        },
        visible: true
      },
      {
        id: 'obj2',
        name: 'Sphere',
        type: 'mesh',
        bounds: {
          min: { x: 2, y: 2, z: 2 },
          max: { x: 4, y: 4, z: 4 }
        },
        visible: true
      },
      {
        id: 'obj3',
        name: 'Cylinder',
        type: 'mesh',
        bounds: {
          min: { x: -2, y: -2, z: -2 },
          max: { x: 0, y: 0, z: 0 }
        },
        visible: false
      }
    ];

    mockRay = {
      origin: { x: 0, y: 0, z: 0 },
      direction: { x: 0, y: 0, z: -1 }
    };
  });

  describe('selectByRay', () => {
    test('should select object by raycasting', () => {
      const selectedObject = ObjectSelector.selectByRay(mockRay, mockObjects);
      
      expect(selectedObject).toBeTruthy();
      expect(selectedObject.id).toBe('obj1'); // Cube should be selected
    });

    test('should return null when no objects are hit', () => {
      const ray = {
        origin: { x: 0, y: 0, z: 0 },
        direction: { x: 0, y: 0, z: 1 } // Ray pointing away from objects
      };
      
      const selectedObject = ObjectSelector.selectByRay(ray, mockObjects);
      expect(selectedObject).toBeNull();
    });

    test('should respect maxDistance option', () => {
      const ray = {
        origin: { x: 0, y: 0, z: 0 },
        direction: { x: 0, y: 0, z: -1 }
      };
      
      const selectedObject = ObjectSelector.selectByRay(ray, mockObjects, {
        maxDistance: 0.5
      });
      
      expect(selectedObject).toBeNull(); // Objects are too far
    });

    test('should include children when specified', () => {
      const objectsWithChildren = [
        {
          id: 'parent',
          name: 'Parent',
          bounds: { min: { x: -1, y: -1, z: -1 }, max: { x: 1, y: 1, z: 1 } },
          children: [
            {
              id: 'child',
              name: 'Child',
              bounds: { min: { x: -0.5, y: -0.5, z: -0.5 }, max: { x: 0.5, y: 0.5, z: 0.5 } }
            }
          ]
        }
      ];
      
      const selectedObject = ObjectSelector.selectByRay(mockRay, objectsWithChildren, {
        includeChildren: true
      });
      
      expect(selectedObject).toBeTruthy();
    });

    test('should exclude children when specified', () => {
      const objectsWithChildren = [
        {
          id: 'parent',
          name: 'Parent',
          bounds: { min: { x: -1, y: -1, z: -1 }, max: { x: 1, y: 1, z: 1 } },
          children: [
            {
              id: 'child',
              name: 'Child',
              bounds: { min: { x: -0.5, y: -0.5, z: -0.5 }, max: { x: 0.5, y: 0.5, z: 0.5 } }
            }
          ]
        }
      ];
      
      const selectedObject = ObjectSelector.selectByRay(mockRay, objectsWithChildren, {
        includeChildren: false
      });
      
      expect(selectedObject.id).toBe('parent');
    });
  });

  describe('selectByRectangle', () => {
    test('should select objects in rectangle', () => {
      const bounds = {
        min: { x: -2, y: -2 },
        max: { x: 2, y: 2 }
      };
      
      const selectedObjects = ObjectSelector.selectByRectangle(bounds, mockObjects);
      
      expect(selectedObjects).toHaveLength(2); // obj1 and obj2
      expect(selectedObjects.map(obj => obj.id)).toContain('obj1');
      expect(selectedObjects.map(obj => obj.id)).toContain('obj2');
    });

    test('should respect partial overlap option', () => {
      const bounds = {
        min: { x: 0.5, y: 0.5 },
        max: { x: 1.5, y: 1.5 }
      };
      
      const selectedObjects = ObjectSelector.selectByRectangle(bounds, mockObjects, {
        partial: true
      });
      
      expect(selectedObjects).toHaveLength(1); // Only obj1 overlaps
      expect(selectedObjects[0].id).toBe('obj1');
    });

    test('should require full containment when partial is false', () => {
      const bounds = {
        min: { x: -0.5, y: -0.5 },
        max: { x: 0.5, y: 0.5 }
      };
      
      const selectedObjects = ObjectSelector.selectByRectangle(bounds, mockObjects, {
        partial: false
      });
      
      expect(selectedObjects).toHaveLength(1); // Only obj1 is fully contained
      expect(selectedObjects[0].id).toBe('obj1');
    });

    test('should return empty array for no overlap', () => {
      const bounds = {
        min: { x: 10, y: 10 },
        max: { x: 12, y: 12 }
      };
      
      const selectedObjects = ObjectSelector.selectByRectangle(bounds, mockObjects);
      expect(selectedObjects).toHaveLength(0);
    });
  });

  describe('selectByLasso', () => {
    test('should select objects in lasso', () => {
      const points = [
        { x: -2, y: -2 },
        { x: 2, y: -2 },
        { x: 2, y: 2 },
        { x: -2, y: 2 }
      ];
      
      const selectedObjects = ObjectSelector.selectByLasso(points, mockObjects);
      
      expect(selectedObjects).toHaveLength(2);
      expect(selectedObjects.map(obj => obj.id)).toContain('obj1');
      expect(selectedObjects.map(obj => obj.id)).toContain('obj2');
    });

    test('should handle partial overlap in lasso', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 }
      ];
      
      const selectedObjects = ObjectSelector.selectByLasso(points, mockObjects, {
        partial: true
      });
      
      expect(selectedObjects).toHaveLength(1);
      expect(selectedObjects[0].id).toBe('obj1');
    });

    test('should require full containment when partial is false', () => {
      const points = [
        { x: -0.5, y: -0.5 },
        { x: 0.5, y: -0.5 },
        { x: 0.5, y: 0.5 },
        { x: -0.5, y: 0.5 }
      ];
      
      const selectedObjects = ObjectSelector.selectByLasso(points, mockObjects, {
        partial: false
      });
      
      expect(selectedObjects).toHaveLength(1);
      expect(selectedObjects[0].id).toBe('obj1');
    });

    test('should handle invalid lasso points', () => {
      const points = [{ x: 0, y: 0 }]; // Not enough points for polygon
      
      const selectedObjects = ObjectSelector.selectByLasso(points, mockObjects);
      expect(selectedObjects).toHaveLength(0);
    });
  });

  describe('selectByName', () => {
    test('should select objects by exact name', () => {
      const selectedObjects = ObjectSelector.selectByName('Cube', mockObjects);
      
      expect(selectedObjects).toHaveLength(1);
      expect(selectedObjects[0].name).toBe('Cube');
    });

    test('should select objects by wildcard pattern', () => {
      const selectedObjects = ObjectSelector.selectByName('C*', mockObjects);
      
      expect(selectedObjects).toHaveLength(2);
      expect(selectedObjects.map(obj => obj.name)).toContain('Cube');
      expect(selectedObjects.map(obj => obj.name)).toContain('Cylinder');
    });

    test('should handle case-sensitive patterns', () => {
      const selectedObjects = ObjectSelector.selectByName('cube', mockObjects);
      expect(selectedObjects).toHaveLength(0); // Case sensitive
    });

    test('should handle special regex characters', () => {
      const objectsWithSpecialNames = [
        { id: 'obj1', name: 'Test[Object]' },
        { id: 'obj2', name: 'Test.Object' }
      ];
      
      const selectedObjects = ObjectSelector.selectByName('Test.*', objectsWithSpecialNames);
      expect(selectedObjects).toHaveLength(1);
    });
  });

  describe('selectByType', () => {
    test('should select objects by type', () => {
      const selectedObjects = ObjectSelector.selectByType('mesh', mockObjects);
      
      expect(selectedObjects).toHaveLength(3);
      expect(selectedObjects.every(obj => obj.type === 'mesh')).toBe(true);
    });

    test('should return empty array for non-existent type', () => {
      const selectedObjects = ObjectSelector.selectByType('non-existent', mockObjects);
      expect(selectedObjects).toHaveLength(0);
    });
  });

  describe('selectByMaterial', () => {
    test('should select objects by material ID', () => {
      const objectsWithMaterials = [
        { id: 'obj1', material: { id: 'mat1' } },
        { id: 'obj2', material: { id: 'mat2' } },
        { id: 'obj3', material: { id: 'mat1' } }
      ];
      
      const selectedObjects = ObjectSelector.selectByMaterial('mat1', objectsWithMaterials);
      
      expect(selectedObjects).toHaveLength(2);
      expect(selectedObjects.map(obj => obj.id)).toContain('obj1');
      expect(selectedObjects.map(obj => obj.id)).toContain('obj3');
    });

    test('should handle objects without materials', () => {
      const objectsWithoutMaterials = [
        { id: 'obj1' },
        { id: 'obj2', material: { id: 'mat1' } }
      ];
      
      const selectedObjects = ObjectSelector.selectByMaterial('mat1', objectsWithoutMaterials);
      expect(selectedObjects).toHaveLength(1);
    });
  });

  describe('selectByLayer', () => {
    test('should select objects by layer', () => {
      const objectsWithLayers = [
        { id: 'obj1', layer: 'default' },
        { id: 'obj2', layer: 'background' },
        { id: 'obj3', layer: 'default' }
      ];
      
      const selectedObjects = ObjectSelector.selectByLayer('default', objectsWithLayers);
      
      expect(selectedObjects).toHaveLength(2);
      expect(selectedObjects.map(obj => obj.id)).toContain('obj1');
      expect(selectedObjects.map(obj => obj.id)).toContain('obj3');
    });

    test('should handle objects without layers', () => {
      const objectsWithoutLayers = [
        { id: 'obj1' },
        { id: 'obj2', layer: 'default' }
      ];
      
      const selectedObjects = ObjectSelector.selectByLayer('default', objectsWithoutLayers);
      expect(selectedObjects).toHaveLength(1);
    });
  });

  describe('selectByVisibility', () => {
    test('should select visible objects', () => {
      const selectedObjects = ObjectSelector.selectByVisibility(true, mockObjects);
      
      expect(selectedObjects).toHaveLength(2);
      expect(selectedObjects.every(obj => obj.visible === true)).toBe(true);
    });

    test('should select invisible objects', () => {
      const selectedObjects = ObjectSelector.selectByVisibility(false, mockObjects);
      
      expect(selectedObjects).toHaveLength(1);
      expect(selectedObjects[0].visible).toBe(false);
    });
  });

  describe('selectInFrustum', () => {
    test('should select objects in camera frustum', () => {
      const camera = {
        position: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 }
      };
      
      const selectedObjects = ObjectSelector.selectInFrustum(camera, mockObjects);
      
      expect(selectedObjects).toHaveLength(2); // obj1 and obj2 are in front of camera
    });

    test('should handle objects behind camera', () => {
      const camera = {
        position: { x: 0, y: 0, z: -5 },
        direction: { x: 0, y: 0, z: 1 }
      };
      
      const selectedObjects = ObjectSelector.selectInFrustum(camera, mockObjects);
      expect(selectedObjects).toHaveLength(0);
    });
  });

  describe('getObjectBounds', () => {
    test('should return object bounds', () => {
      const object = {
        bounds: {
          min: { x: -1, y: -1, z: -1 },
          max: { x: 1, y: 1, z: 1 }
        }
      };
      
      const bounds = ObjectSelector.getObjectBounds(object);
      expect(bounds).toEqual(object.bounds);
    });

    test('should calculate bounds from mesh vertices', () => {
      const object = {
        mesh: {
          vertices: new Map([
            ['v1', { x: -1, y: -1, z: -1 }],
            ['v2', { x: 1, y: 1, z: 1 }],
            ['v3', { x: 0, y: 0, z: 0 }]
          ])
        }
      };
      
      const bounds = ObjectSelector.getObjectBounds(object);
      expect(bounds.min).toEqual({ x: -1, y: -1, z: -1 });
      expect(bounds.max).toEqual({ x: 1, y: 1, z: 1 });
    });

    test('should return default bounds for object without bounds', () => {
      const object = {};
      const bounds = ObjectSelector.getObjectBounds(object);
      expect(bounds).toEqual({ min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } });
    });
  });

  describe('calculateBounds', () => {
    test('should calculate bounds from vertices', () => {
      const vertices = [
        { x: -1, y: -1, z: -1 },
        { x: 1, y: 1, z: 1 },
        { x: 0, y: 0, z: 0 }
      ];
      
      const bounds = ObjectSelector.calculateBounds(vertices);
      
      expect(bounds.min).toEqual({ x: -1, y: -1, z: -1 });
      expect(bounds.max).toEqual({ x: 1, y: 1, z: 1 });
    });

    test('should handle empty vertices array', () => {
      const bounds = ObjectSelector.calculateBounds([]);
      expect(bounds).toEqual({ min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } });
    });

    test('should handle single vertex', () => {
      const vertices = [{ x: 1, y: 2, z: 3 }];
      const bounds = ObjectSelector.calculateBounds(vertices);
      
      expect(bounds.min).toEqual({ x: 1, y: 2, z: 3 });
      expect(bounds.max).toEqual({ x: 1, y: 2, z: 3 });
    });
  });

  describe('getDominantFace', () => {
    test('should return dominant face for vertex', () => {
      const vertex = { x: 2, y: 1, z: 1 };
      const bounds = {
        min: { x: -1, y: -1, z: -1 },
        max: { x: 1, y: 1, z: 1 }
      };
      
      const face = ObjectSelector.getDominantFace(vertex, bounds);
      expect(face).toBe('right');
    });

    test('should handle vertex at center', () => {
      const vertex = { x: 0, y: 0, z: 0 };
      const bounds = {
        min: { x: -1, y: -1, z: -1 },
        max: { x: 1, y: 1, z: 1 }
      };
      
      const face = ObjectSelector.getDominantFace(vertex, bounds);
      expect(['front', 'back', 'left', 'right', 'top', 'bottom']).toContain(face);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined objects', () => {
      expect(() => ObjectSelector.selectByRay(mockRay, null)).not.toThrow();
      expect(() => ObjectSelector.selectByRectangle({ min: { x: 0, y: 0 }, max: { x: 1, y: 1 } }, undefined)).not.toThrow();
    });

    test('should handle empty objects array', () => {
      const result = ObjectSelector.selectByRay(mockRay, []);
      expect(result).toBeNull();
    });

    test('should handle objects without bounds', () => {
      const objectsWithoutBounds = [
        { id: 'obj1', name: 'Object 1' },
        { id: 'obj2', name: 'Object 2' }
      ];
      
      const result = ObjectSelector.selectByRay(mockRay, objectsWithoutBounds);
      expect(result).toBeNull();
    });

    test('should handle invalid ray data', () => {
      const invalidRay = {
        origin: { x: 0, y: 0, z: 0 },
        direction: { x: 0, y: 0, z: 0 } // Zero direction
      };
      
      const result = ObjectSelector.selectByRay(invalidRay, mockObjects);
      expect(result).toBeNull();
    });
  });
}); 