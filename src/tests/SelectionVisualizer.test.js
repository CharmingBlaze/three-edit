/**
 * @fileoverview SelectionVisualizer Tests
 * Comprehensive tests for the SelectionVisualizer class
 */

import { SelectionVisualizer } from '../selection/SelectionVisualizer.js';

describe('SelectionVisualizer', () => {
  describe('createHighlightMaterial', () => {
    test('should create highlight material with default options', () => {
      const material = SelectionVisualizer.createHighlightMaterial();
      
      expect(material.type).toBe('highlight');
      expect(material.color).toEqual({ r: 1, g: 1, b: 0 });
      expect(material.opacity).toBe(0.8);
      expect(material.wireframe).toBe(false);
      expect(material.transparent).toBe(true);
      expect(material.side).toBe('double');
    });

    test('should create highlight material with custom options', () => {
      const material = SelectionVisualizer.createHighlightMaterial({
        color: { r: 1, g: 0, b: 0 },
        opacity: 0.5,
        wireframe: true
      });
      
      expect(material.color).toEqual({ r: 1, g: 0, b: 0 });
      expect(material.opacity).toBe(0.5);
      expect(material.wireframe).toBe(true);
    });

    test('should handle different color formats', () => {
      const material1 = SelectionVisualizer.createHighlightMaterial({
        color: { r: 0.5, g: 0.5, b: 0.5 }
      });
      
      expect(material1.color).toEqual({ r: 0.5, g: 0.5, b: 0.5 });
    });
  });

  describe('createVertexHighlightGeometry', () => {
    test('should create vertex highlight geometry', () => {
      const vertices = [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1 },
        { x: -1, y: -1, z: -1 }
      ];
      
      const geometry = SelectionVisualizer.createVertexHighlightGeometry(vertices, {
        size: 0.1
      });
      
      expect(geometry.type).toBe('instanced');
      expect(geometry.positions).toHaveLength(3);
      expect(geometry.attributes.size).toHaveLength(3);
      expect(geometry.attributes.size.every(size => size === 0.1)).toBe(true);
    });

    test('should use default size when not specified', () => {
      const vertices = [{ x: 0, y: 0, z: 0 }];
      const geometry = SelectionVisualizer.createVertexHighlightGeometry(vertices);
      
      expect(geometry.attributes.size[0]).toBe(0.05);
    });

    test('should handle empty vertices array', () => {
      const geometry = SelectionVisualizer.createVertexHighlightGeometry([]);
      
      expect(geometry.positions).toHaveLength(0);
      expect(geometry.attributes.size).toHaveLength(0);
    });
  });

  describe('createEdgeHighlightGeometry', () => {
    test('should create edge highlight geometry', () => {
      const edges = [
        { vertexId1: 'v1', vertexId2: 'v2' },
        { vertexId1: 'v2', vertexId2: 'v3' }
      ];
      
      const vertices = new Map([
        ['v1', { x: 0, y: 0, z: 0 }],
        ['v2', { x: 1, y: 0, z: 0 }],
        ['v3', { x: 1, y: 1, z: 0 }]
      ]);
      
      const geometry = SelectionVisualizer.createEdgeHighlightGeometry(edges, vertices, {
        width: 0.02
      });
      
      expect(geometry.type).toBe('line');
      expect(geometry.positions).toHaveLength(6); // 2 edges * 3 coordinates
      expect(geometry.indices).toHaveLength(2); // 2 edges
      expect(geometry.attributes.width).toHaveLength(2);
      expect(geometry.attributes.width.every(width => width === 0.02)).toBe(true);
    });

    test('should handle edges with missing vertices', () => {
      const edges = [
        { vertexId1: 'v1', vertexId2: 'v2' },
        { vertexId1: 'v2', vertexId2: 'v3' }
      ];
      
      const vertices = new Map([
        ['v1', { x: 0, y: 0, z: 0 }],
        ['v2', { x: 1, y: 0, z: 0 }]
        // v3 is missing
      ]);
      
      const geometry = SelectionVisualizer.createEdgeHighlightGeometry(edges, vertices);
      
      expect(geometry.positions).toHaveLength(3); // Only one valid edge
      expect(geometry.indices).toHaveLength(1);
    });

    test('should use default width when not specified', () => {
      const edges = [{ vertexId1: 'v1', vertexId2: 'v2' }];
      const vertices = new Map([
        ['v1', { x: 0, y: 0, z: 0 }],
        ['v2', { x: 1, y: 0, z: 0 }]
      ]);
      
      const geometry = SelectionVisualizer.createEdgeHighlightGeometry(edges, vertices);
      expect(geometry.attributes.width[0]).toBe(0.02);
    });
  });

  describe('createFaceHighlightGeometry', () => {
    test('should create face highlight geometry', () => {
      const faces = [
        { vertexIds: ['v1', 'v2', 'v3'] },
        { vertexIds: ['v2', 'v3', 'v4'] }
      ];
      
      const vertices = new Map([
        ['v1', { x: 0, y: 0, z: 0 }],
        ['v2', { x: 1, y: 0, z: 0 }],
        ['v3', { x: 0, y: 1, z: 0 }],
        ['v4', { x: 1, y: 1, z: 0 }]
      ]);
      
      const geometry = SelectionVisualizer.createFaceHighlightGeometry(faces, vertices);
      
      expect(geometry.type).toBe('mesh');
      expect(geometry.positions).toHaveLength(12); // 4 vertices * 3 coordinates
      expect(geometry.indices).toHaveLength(2); // 2 triangles
      expect(geometry.normals).toHaveLength(12);
    });

    test('should handle faces with missing vertices', () => {
      const faces = [{ vertexIds: ['v1', 'v2', 'v3'] }];
      const vertices = new Map([
        ['v1', { x: 0, y: 0, z: 0 }],
        ['v2', { x: 1, y: 0, z: 0 }]
        // v3 is missing
      ]);
      
      const geometry = SelectionVisualizer.createFaceHighlightGeometry(faces, vertices);
      
      expect(geometry.positions).toHaveLength(0); // No valid faces
      expect(geometry.indices).toHaveLength(0);
    });

    test('should handle faces with less than 3 vertices', () => {
      const faces = [{ vertexIds: ['v1', 'v2'] }];
      const vertices = new Map([
        ['v1', { x: 0, y: 0, z: 0 }],
        ['v2', { x: 1, y: 0, z: 0 }]
      ]);
      
      const geometry = SelectionVisualizer.createFaceHighlightGeometry(faces, vertices);
      
      expect(geometry.positions).toHaveLength(0);
      expect(geometry.indices).toHaveLength(0);
    });
  });

  describe('createSelectionBoxGeometry', () => {
    test('should create selection box geometry', () => {
      const bounds = {
        min: { x: -1, y: -1, z: -1 },
        max: { x: 1, y: 1, z: 1 }
      };
      
      const geometry = SelectionVisualizer.createSelectionBoxGeometry(bounds, {
        thickness: 0.01
      });
      
      expect(geometry.type).toBe('line');
      expect(geometry.positions).toHaveLength(24); // 12 edges * 2 points
      expect(geometry.attributes.width).toHaveLength(12);
      expect(geometry.attributes.width.every(width => width === 0.01)).toBe(true);
    });

    test('should use default thickness when not specified', () => {
      const bounds = {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 1, y: 1, z: 1 }
      };
      
      const geometry = SelectionVisualizer.createSelectionBoxGeometry(bounds);
      expect(geometry.attributes.width[0]).toBe(0.01);
    });

    test('should handle zero-size bounds', () => {
      const bounds = {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 0, y: 0, z: 0 }
      };
      
      const geometry = SelectionVisualizer.createSelectionBoxGeometry(bounds);
      expect(geometry.positions).toHaveLength(24); // Still creates box
    });
  });

  describe('createSelectionRectangleGeometry', () => {
    test('should create selection rectangle geometry', () => {
      const bounds = {
        min: { x: 0, y: 0 },
        max: { x: 100, y: 100 }
      };
      
      const camera = {
        position: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 },
        fov: 75
      };
      
      const geometry = SelectionVisualizer.createSelectionRectangleGeometry(bounds, camera, {
        thickness: 0.01
      });
      
      expect(geometry.type).toBe('line');
      expect(geometry.positions).toHaveLength(16); // 4 edges * 2 points * 2 coordinates
      expect(geometry.attributes.width).toHaveLength(4);
      expect(geometry.attributes.width.every(width => width === 0.01)).toBe(true);
    });

    test('should use default thickness when not specified', () => {
      const bounds = {
        min: { x: 0, y: 0 },
        max: { x: 1, y: 1 }
      };
      
      const camera = {
        position: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 },
        fov: 75
      };
      
      const geometry = SelectionVisualizer.createSelectionRectangleGeometry(bounds, camera);
      expect(geometry.attributes.width[0]).toBe(0.01);
    });
  });

  describe('createSelectionLassoGeometry', () => {
    test('should create selection lasso geometry', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 }
      ];
      
      const geometry = SelectionVisualizer.createSelectionLassoGeometry(points, {
        thickness: 0.01
      });
      
      expect(geometry.type).toBe('line');
      expect(geometry.positions).toHaveLength(8); // 4 points * 2 coordinates
      expect(geometry.attributes.width).toHaveLength(4);
      expect(geometry.attributes.width.every(width => width === 0.01)).toBe(true);
    });

    test('should handle single point', () => {
      const points = [{ x: 0, y: 0 }];
      const geometry = SelectionVisualizer.createSelectionLassoGeometry(points);
      
      expect(geometry.type).toBe('line');
      expect(geometry.positions).toHaveLength(0);
      expect(geometry.indices).toHaveLength(0);
    });

    test('should handle two points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 1 }
      ];
      
      const geometry = SelectionVisualizer.createSelectionLassoGeometry(points);
      
      expect(geometry.positions).toHaveLength(4);
      expect(geometry.attributes.width).toHaveLength(2);
    });

    test('should use default thickness when not specified', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 }
      ];
      
      const geometry = SelectionVisualizer.createSelectionLassoGeometry(points);
      expect(geometry.attributes.width[0]).toBe(0.01);
    });
  });

  describe('createSelectionIndicatorGeometry', () => {
    test('should create vertex indicator geometry', () => {
      const position = { x: 0, y: 0, z: 0 };
      const geometry = SelectionVisualizer.createSelectionIndicatorGeometry(position, {
        type: 'vertex',
        size: 0.1
      });
      
      expect(geometry.type).toBe('sphere');
      expect(geometry.radius).toBe(0.1);
      expect(geometry.position).toEqual([0, 0, 0]);
    });

    test('should create edge indicator geometry', () => {
      const position = { x: 0, y: 0, z: 0 };
      const geometry = SelectionVisualizer.createSelectionIndicatorGeometry(position, {
        type: 'edge',
        size: 0.1
      });
      
      expect(geometry.type).toBe('cylinder');
      expect(geometry.radius).toBe(0.05);
      expect(geometry.height).toBe(0.1);
      expect(geometry.position).toEqual([0, 0, 0]);
    });

    test('should create face indicator geometry', () => {
      const position = { x: 0, y: 0, z: 0 };
      const geometry = SelectionVisualizer.createSelectionIndicatorGeometry(position, {
        type: 'face',
        size: 0.1
      });
      
      expect(geometry.type).toBe('box');
      expect(geometry.size).toEqual([0.1, 0.1, 0.01]);
      expect(geometry.position).toEqual([0, 0, 0]);
    });

    test('should default to vertex type', () => {
      const position = { x: 0, y: 0, z: 0 };
      const geometry = SelectionVisualizer.createSelectionIndicatorGeometry(position);
      
      expect(geometry.type).toBe('sphere');
    });

    test('should use default size when not specified', () => {
      const position = { x: 0, y: 0, z: 0 };
      const geometry = SelectionVisualizer.createSelectionIndicatorGeometry(position, {
        type: 'vertex'
      });
      
      expect(geometry.radius).toBe(0.1);
    });
  });

  describe('createTransformGizmoGeometry', () => {
    test('should create translate gizmo geometry', () => {
      const position = { x: 0, y: 0, z: 0 };
      const gizmo = SelectionVisualizer.createTransformGizmoGeometry(position, {
        mode: 'translate',
        size: 1.0
      });
      
      expect(gizmo.type).toBe('group');
      expect(gizmo.children).toHaveLength(3);
      
      gizmo.children.forEach(child => {
        expect(child.type).toBe('arrow');
        expect(child.length).toBe(0.8);
        expect(child.width).toBe(0.1);
        expect(child.position).toEqual([0, 0, 0]);
      });
      
      expect(gizmo.children[0].color).toEqual({ r: 1, g: 0, b: 0 }); // X axis
      expect(gizmo.children[1].color).toEqual({ r: 0, g: 1, b: 0 }); // Y axis
      expect(gizmo.children[2].color).toEqual({ r: 0, g: 0, b: 1 }); // Z axis
    });

    test('should create rotate gizmo geometry', () => {
      const position = { x: 0, y: 0, z: 0 };
      const gizmo = SelectionVisualizer.createTransformGizmoGeometry(position, {
        mode: 'rotate',
        size: 1.0
      });
      
      expect(gizmo.type).toBe('group');
      expect(gizmo.children).toHaveLength(3);
      
      gizmo.children.forEach(child => {
        expect(child.type).toBe('ring');
        expect(child.radius).toBe(0.5);
        expect(child.position).toEqual([0, 0, 0]);
      });
    });

    test('should create scale gizmo geometry', () => {
      const position = { x: 0, y: 0, z: 0 };
      const gizmo = SelectionVisualizer.createTransformGizmoGeometry(position, {
        mode: 'scale',
        size: 1.0
      });
      
      expect(gizmo.type).toBe('group');
      expect(gizmo.children).toHaveLength(3);
      
      gizmo.children.forEach(child => {
        expect(child.type).toBe('cube');
        expect(child.size).toEqual([0.1, 0.1, 0.1]);
        expect(child.position).toEqual([0, 0, 0]);
      });
    });

    test('should default to translate mode', () => {
      const position = { x: 0, y: 0, z: 0 };
      const gizmo = SelectionVisualizer.createTransformGizmoGeometry(position);
      
      expect(gizmo.type).toBe('group');
      expect(gizmo.children).toHaveLength(3);
      expect(gizmo.children[0].type).toBe('arrow');
    });

    test('should use default size when not specified', () => {
      const position = { x: 0, y: 0, z: 0 };
      const gizmo = SelectionVisualizer.createTransformGizmoGeometry(position, {
        mode: 'translate'
      });
      
      expect(gizmo.children[0].length).toBe(0.8);
      expect(gizmo.children[0].width).toBe(0.1);
    });
  });

  describe('calculateFaceNormal', () => {
    test('should calculate face normal for triangle', () => {
      const vertices = [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }
      ];
      
      const normal = SelectionVisualizer.calculateFaceNormal(vertices);
      
      expect(normal.x).toBeCloseTo(0, 5);
      expect(normal.y).toBeCloseTo(0, 5);
      expect(normal.z).toBeCloseTo(1, 5);
    });

    test('should calculate face normal for quad', () => {
      const vertices = [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 0, y: 1, z: 0 }
      ];
      
      const normal = SelectionVisualizer.calculateFaceNormal(vertices);
      
      expect(normal.x).toBeCloseTo(0, 5);
      expect(normal.y).toBeCloseTo(0, 5);
      expect(normal.z).toBeCloseTo(1, 5);
    });

    test('should handle degenerate face', () => {
      const vertices = [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 }
      ];
      
      const normal = SelectionVisualizer.calculateFaceNormal(vertices);
      
      expect(normal.x).toBe(0);
      expect(normal.y).toBe(1);
      expect(normal.z).toBe(0);
    });

    test('should handle less than 3 vertices', () => {
      const vertices = [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 }
      ];
      
      const normal = SelectionVisualizer.calculateFaceNormal(vertices);
      
      expect(normal.x).toBe(0);
      expect(normal.y).toBe(1);
      expect(normal.z).toBe(0);
    });
  });

  describe('cross', () => {
    test('should calculate cross product', () => {
      const a = { x: 1, y: 0, z: 0 };
      const b = { x: 0, y: 1, z: 0 };
      
      const result = SelectionVisualizer.cross(a, b);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(1);
    });

    test('should handle zero vectors', () => {
      const a = { x: 0, y: 0, z: 0 };
      const b = { x: 1, y: 1, z: 1 };
      
      const result = SelectionVisualizer.cross(a, b);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });

    test('should handle parallel vectors', () => {
      const a = { x: 1, y: 0, z: 0 };
      const b = { x: 2, y: 0, z: 0 };
      
      const result = SelectionVisualizer.cross(a, b);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined parameters', () => {
      expect(() => SelectionVisualizer.createHighlightMaterial(null)).not.toThrow();
      expect(() => SelectionVisualizer.createVertexHighlightGeometry(null)).not.toThrow();
      expect(() => SelectionVisualizer.createEdgeHighlightGeometry(null, null)).not.toThrow();
    });

    test('should handle empty arrays', () => {
      const geometry = SelectionVisualizer.createVertexHighlightGeometry([]);
      expect(geometry.positions).toHaveLength(0);
      
      const edgeGeometry = SelectionVisualizer.createEdgeHighlightGeometry([], new Map());
      expect(edgeGeometry.positions).toHaveLength(0);
      
      const faceGeometry = SelectionVisualizer.createFaceHighlightGeometry([], new Map());
      expect(faceGeometry.positions).toHaveLength(0);
    });

    test('should handle invalid bounds', () => {
      const bounds = {
        min: { x: 1, y: 1, z: 1 },
        max: { x: 0, y: 0, z: 0 } // Invalid: min > max
      };
      
      const geometry = SelectionVisualizer.createSelectionBoxGeometry(bounds);
      expect(geometry.positions).toHaveLength(24); // Still creates box
    });

    test('should handle invalid camera data', () => {
      const bounds = { min: { x: 0, y: 0 }, max: { x: 1, y: 1 } };
      const invalidCamera = {
        position: { x: 0, y: 0, z: 0 },
        direction: { x: 0, y: 0, z: 0 }, // Zero direction
        fov: 0
      };
      
      const geometry = SelectionVisualizer.createSelectionRectangleGeometry(bounds, invalidCamera);
      expect(geometry.positions).toHaveLength(16);
    });
  });
}); 