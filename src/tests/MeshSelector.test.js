/**
 * @fileoverview MeshSelector Tests
 * Comprehensive tests for the MeshSelector class
 */

import { describe, beforeEach, test, expect } from 'vitest';
import { EditableMesh } from '../EditableMesh.js';
import { MeshSelector } from '../selection/MeshSelector.js';

describe('MeshSelector', () => {
  let mockMesh;
  let mockRay;

  beforeEach(() => {
    // Create a simple cube mesh for testing
    mockMesh = new EditableMesh({
      name: 'TestCube',
      type: 'cube'
    });

    // Add vertices
    const vertices = [
      { x: -1, y: -1, z: -1 }, // 0
      { x: 1, y: -1, z: -1 },  // 1
      { x: 1, y: 1, z: -1 },   // 2
      { x: -1, y: 1, z: -1 },  // 3
      { x: -1, y: -1, z: 1 },  // 4
      { x: 1, y: -1, z: 1 },   // 5
      { x: 1, y: 1, z: 1 },    // 6
      { x: -1, y: 1, z: 1 }    // 7
    ];

    vertices.forEach((vertex, index) => {
      const v = mockMesh.addVertex(vertex.x, vertex.y, vertex.z);
      v.id = `vertex-${index}`;
    });

    // Add faces (cube faces)
    const faces = [
      [0, 1, 2, 3], // front
      [5, 4, 7, 6], // back
      [4, 0, 3, 7], // left
      [1, 5, 6, 2], // right
      [3, 2, 6, 7], // top
      [4, 5, 1, 0]  // bottom
    ];

    faces.forEach((vertexIds, index) => {
      const face = mockMesh.addFace(vertexIds.map(id => `vertex-${id}`));
      face.id = `face-${index}`;
    });

    // Add edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // front
      [4, 5], [5, 6], [6, 7], [7, 4], // back
      [0, 4], [1, 5], [2, 6], [3, 7]  // connecting
    ];

    edges.forEach(([v1, v2], index) => {
      const edge = mockMesh.addEdge(`vertex-${v1}`, `vertex-${v2}`);
      edge.id = `edge-${index}`;
    });

    mockRay = {
      origin: { x: 0, y: 0, z: 5 },
      direction: { x: 0, y: 0, z: -1 }
    };
  });

  describe('selectVerticesByRay', () => {
    test('should select vertices by raycasting', () => {
      const selectedVertices = MeshSelector.selectVerticesByRay(mockRay, mockMesh, {
        threshold: 0.5,
        selectNearest: true
      });

      expect(selectedVertices).toHaveLength(1);
      expect(selectedVertices[0]).toMatch(/vertex-\d+/);
    });

    test('should select multiple vertices within threshold', () => {
      const selectedVertices = MeshSelector.selectVerticesByRay(mockRay, mockMesh, {
        threshold: 2.0,
        selectNearest: false
      });

      expect(selectedVertices.length).toBeGreaterThan(1);
    });

    test('should return empty array when no vertices hit', () => {
      const ray = {
        origin: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: 1 } // Ray pointing away
      };

      const selectedVertices = MeshSelector.selectVerticesByRay(ray, mockMesh);
      expect(selectedVertices).toHaveLength(0);
    });

    test('should respect threshold parameter', () => {
      const selectedVertices = MeshSelector.selectVerticesByRay(mockRay, mockMesh, {
        threshold: 0.1
      });

      expect(selectedVertices).toHaveLength(0); // Too small threshold
    });

    test('should select nearest vertex when selectNearest is true', () => {
      const ray1 = {
        origin: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 }
      };

      const ray2 = {
        origin: { x: 2, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 }
      };

      const vertices1 = MeshSelector.selectVerticesByRay(ray1, mockMesh, { selectNearest: true });
      const vertices2 = MeshSelector.selectVerticesByRay(ray2, mockMesh, { selectNearest: true });

      expect(vertices1).toHaveLength(1);
      expect(vertices2).toHaveLength(1);
      expect(vertices1[0]).not.toBe(vertices2[0]);
    });
  });

  describe('selectEdgesByRay', () => {
    test('should select edges by raycasting', () => {
      const selectedEdges = MeshSelector.selectEdgesByRay(mockRay, mockMesh, {
        threshold: 0.5,
        selectNearest: true
      });

      expect(selectedEdges).toHaveLength(1);
      expect(selectedEdges[0]).toMatch(/edge-\d+/);
    });

    test('should select multiple edges within threshold', () => {
      const selectedEdges = MeshSelector.selectEdgesByRay(mockRay, mockMesh, {
        threshold: 2.0,
        selectNearest: false
      });

      expect(selectedEdges.length).toBeGreaterThan(1);
    });

    test('should return empty array when no edges hit', () => {
      const ray = {
        origin: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: 1 } // Ray pointing away
      };

      const selectedEdges = MeshSelector.selectEdgesByRay(ray, mockMesh);
      expect(selectedEdges).toHaveLength(0);
    });

    test('should handle edges with missing vertices', () => {
      // Remove a vertex to create an invalid edge
      mockMesh.vertices.delete('vertex-0');
      
      const selectedEdges = MeshSelector.selectEdgesByRay(mockRay, mockMesh);
      expect(selectedEdges).toHaveLength(0);
    });
  });

  describe('selectFacesByRay', () => {
    test('should select faces by raycasting', () => {
      const selectedFaces = MeshSelector.selectFacesByRay(mockRay, mockMesh, {
        selectNearest: true
      });

      expect(selectedFaces).toHaveLength(1);
      expect(selectedFaces[0]).toMatch(/face-\d+/);
    });

    test('should select multiple faces when selectNearest is false', () => {
      const selectedFaces = MeshSelector.selectFacesByRay(mockRay, mockMesh, {
        selectNearest: false
      });

      expect(selectedFaces.length).toBeGreaterThan(0);
    });

    test('should return empty array when no faces hit', () => {
      const ray = {
        origin: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: 1 } // Ray pointing away
      };

      const selectedFaces = MeshSelector.selectFacesByRay(ray, mockMesh);
      expect(selectedFaces).toHaveLength(0);
    });

    test('should handle faces with missing vertices', () => {
      // Remove a vertex to create an invalid face
      mockMesh.vertices.delete('vertex-0');
      
      const selectedFaces = MeshSelector.selectFacesByRay(mockRay, mockMesh);
      expect(selectedFaces).toHaveLength(0);
    });

    test('should handle faces with less than 3 vertices', () => {
      // Create a face with only 2 vertices
      const invalidFace = mockMesh.addFace(['vertex-1', 'vertex-2']);
      invalidFace.id = 'invalid-face';
      
      const selectedFaces = MeshSelector.selectFacesByRay(mockRay, mockMesh);
      expect(selectedFaces).not.toContain('invalid-face');
    });
  });

  describe('selectVerticesByRectangle', () => {
    test('should select vertices in rectangle', () => {
      const bounds = {
        min: { x: -2, y: -2 },
        max: { x: 2, y: 2 }
      };

      const camera = {
        position: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 },
        fov: 75
      };

      const selectedVertices = MeshSelector.selectVerticesByRectangle(bounds, mockMesh, camera);
      expect(selectedVertices.length).toBeGreaterThan(0);
    });

    test('should return empty array for no overlap', () => {
      const bounds = {
        min: { x: 10, y: 10 },
        max: { x: 12, y: 12 }
      };

      const camera = {
        position: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 },
        fov: 75
      };

      const selectedVertices = MeshSelector.selectVerticesByRectangle(bounds, mockMesh, camera);
      expect(selectedVertices).toHaveLength(0);
    });
  });

  describe('selectEdgesByRectangle', () => {
    test('should select edges in rectangle', () => {
      const bounds = {
        min: { x: -2, y: -2 },
        max: { x: 2, y: 2 }
      };

      const camera = {
        position: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 },
        fov: 75
      };

      const selectedEdges = MeshSelector.selectEdgesByRectangle(bounds, mockMesh, camera);
      expect(selectedEdges.length).toBeGreaterThan(0);
    });

    test('should handle edges with missing vertices', () => {
      const bounds = {
        min: { x: -2, y: -2 },
        max: { x: 2, y: 2 }
      };

      const camera = {
        position: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 },
        fov: 75
      };

      // Remove a vertex
      mockMesh.vertices.delete('vertex-0');

      const selectedEdges = MeshSelector.selectEdgesByRectangle(bounds, mockMesh, camera);
      expect(selectedEdges).toHaveLength(0);
    });
  });

  describe('selectFacesByRectangle', () => {
    test('should select faces in rectangle', () => {
      const bounds = {
        min: { x: -2, y: -2 },
        max: { x: 2, y: 2 }
      };

      const camera = {
        position: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 },
        fov: 75
      };

      const selectedFaces = MeshSelector.selectFacesByRectangle(bounds, mockMesh, camera);
      expect(selectedFaces.length).toBeGreaterThan(0);
    });

    test('should handle faces with missing vertices', () => {
      const bounds = {
        min: { x: -2, y: -2 },
        max: { x: 2, y: 2 }
      };

      const camera = {
        position: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 },
        fov: 75
      };

      // Remove a vertex
      mockMesh.vertices.delete('vertex-0');

      const selectedFaces = MeshSelector.selectFacesByRectangle(bounds, mockMesh, camera);
      expect(selectedFaces).toHaveLength(0);
    });
  });

  describe('worldToScreen', () => {
    test('should convert world point to screen coordinates', () => {
      const worldPoint = { x: 0, y: 0, z: 0 };
      const camera = {
        position: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 },
        fov: 75
      };

      const screenPoint = MeshSelector.worldToScreen(worldPoint, camera);
      
      expect(screenPoint).toHaveProperty('x');
      expect(screenPoint).toHaveProperty('y');
      expect(typeof screenPoint.x).toBe('number');
      expect(typeof screenPoint.y).toBe('number');
    });

    test('should handle points behind camera', () => {
      const worldPoint = { x: 0, y: 0, z: 10 };
      const camera = {
        position: { x: 0, y: 0, z: 5 },
        direction: { x: 0, y: 0, z: -1 },
        fov: 75
      };

      const screenPoint = MeshSelector.worldToScreen(worldPoint, camera);
      expect(screenPoint.x).toBe(0);
      expect(screenPoint.y).toBe(0);
    });
  });

  describe('pointInRectangle', () => {
    test('should return true for point inside rectangle', () => {
      const point = { x: 0, y: 0 };
      const bounds = {
        min: { x: -1, y: -1 },
        max: { x: 1, y: 1 }
      };

      const result = MeshSelector.pointInRectangle(point, bounds);
      expect(result).toBe(true);
    });

    test('should return false for point outside rectangle', () => {
      const point = { x: 2, y: 2 };
      const bounds = {
        min: { x: -1, y: -1 },
        max: { x: 1, y: 1 }
      };

      const result = MeshSelector.pointInRectangle(point, bounds);
      expect(result).toBe(false);
    });

    test('should return true for point on rectangle boundary', () => {
      const point = { x: 1, y: 1 };
      const bounds = {
        min: { x: -1, y: -1 },
        max: { x: 1, y: 1 }
      };

      const result = MeshSelector.pointInRectangle(point, bounds);
      expect(result).toBe(true);
    });
  });

  describe('linesIntersect', () => {
    test('should return true for intersecting lines', () => {
      const a1 = { x: 0, y: 0 };
      const a2 = { x: 2, y: 2 };
      const b1 = { x: 0, y: 2 };
      const b2 = { x: 2, y: 0 };

      const result = MeshSelector.linesIntersect(a1, a2, b1, b2);
      expect(result).toBe(true);
    });

    test('should return false for parallel lines', () => {
      const a1 = { x: 0, y: 0 };
      const a2 = { x: 2, y: 0 };
      const b1 = { x: 0, y: 1 };
      const b2 = { x: 2, y: 1 };

      const result = MeshSelector.linesIntersect(a1, a2, b1, b2);
      expect(result).toBe(false);
    });

    test('should return false for non-intersecting lines', () => {
      const a1 = { x: 0, y: 0 };
      const a2 = { x: 1, y: 1 };
      const b1 = { x: 3, y: 3 };
      const b2 = { x: 4, y: 4 };

      const result = MeshSelector.linesIntersect(a1, a2, b1, b2);
      expect(result).toBe(false);
    });

    test('should handle collinear lines', () => {
      const a1 = { x: 0, y: 0 };
      const a2 = { x: 1, y: 1 };
      const b1 = { x: 2, y: 2 };
      const b2 = { x: 3, y: 3 };

      const result = MeshSelector.linesIntersect(a1, a2, b1, b2);
      expect(result).toBe(false);
    });
  });

  describe('polygonIntersectsRectangle', () => {
    test('should return true for polygon inside rectangle', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 }
      ];
      const bounds = {
        min: { x: -1, y: -1 },
        max: { x: 2, y: 2 }
      };

      const result = MeshSelector.polygonIntersectsRectangle(polygon, bounds);
      expect(result).toBe(true);
    });

    test('should return true for polygon intersecting rectangle', () => {
      const polygon = [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 }
      ];
      const bounds = {
        min: { x: 0, y: 0 },
        max: { x: 1, y: 1 }
      };

      const result = MeshSelector.polygonIntersectsRectangle(polygon, bounds);
      expect(result).toBe(true);
    });

    test('should return false for polygon outside rectangle', () => {
      const polygon = [
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 4, y: 4 },
        { x: 3, y: 4 }
      ];
      const bounds = {
        min: { x: 0, y: 0 },
        max: { x: 1, y: 1 }
      };

      const result = MeshSelector.polygonIntersectsRectangle(polygon, bounds);
      expect(result).toBe(false);
    });

    test('should handle polygon with less than 3 points', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 1, y: 1 }
      ];
      const bounds = {
        min: { x: 0, y: 0 },
        max: { x: 1, y: 1 }
      };

      const result = MeshSelector.polygonIntersectsRectangle(polygon, bounds);
      expect(result).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    test('should calculate cross product', () => {
      const a = { x: 1, y: 0, z: 0 };
      const b = { x: 0, y: 1, z: 0 };

      const result = MeshSelector.cross(a, b);
      expect(result).toEqual({ x: 0, y: 0, z: 1 });
    });

    test('should calculate dot product', () => {
      const a = { x: 1, y: 2, z: 3 };
      const b = { x: 4, y: 5, z: 6 };

      const result = MeshSelector.dot(a, b);
      expect(result).toBe(32);
    });

    test('should calculate distance between points', () => {
      const a = { x: 0, y: 0, z: 0 };
      const b = { x: 3, y: 4, z: 0 };

      const result = MeshSelector.distance(a, b);
      expect(result).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty mesh', () => {
      const emptyMesh = new EditableMesh();
      const selectedVertices = MeshSelector.selectVerticesByRay(mockRay, emptyMesh);
      expect(selectedVertices).toHaveLength(0);
    });

    test('should handle null/undefined parameters', () => {
      expect(() => MeshSelector.selectVerticesByRay(null, mockMesh)).not.toThrow();
      expect(() => MeshSelector.selectVerticesByRay(mockRay, null)).not.toThrow();
    });

    test('should handle invalid ray data', () => {
      const invalidRay = {
        origin: { x: 0, y: 0, z: 0 },
        direction: { x: 0, y: 0, z: 0 } // Zero direction
      };

      const selectedVertices = MeshSelector.selectVerticesByRay(invalidRay, mockMesh);
      expect(selectedVertices).toHaveLength(0);
    });

    test('should handle mesh with invalid data', () => {
      // Create mesh with invalid face data
      const invalidMesh = new EditableMesh();
      const v1 = invalidMesh.addVertex(0, 0, 0);
      const v2 = invalidMesh.addVertex(1, 0, 0);
      const v3 = invalidMesh.addVertex(0, 1, 0);
      
      v1.id = 'v1';
      v2.id = 'v2';
      v3.id = 'v3';

      const face = invalidMesh.addFace(['v1', 'v2', 'v3']);
      face.id = 'invalid-face';

      const selectedFaces = MeshSelector.selectFacesByRay(mockRay, invalidMesh);
      expect(selectedFaces).toHaveLength(0);
    });
  });
}); 