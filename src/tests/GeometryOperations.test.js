/**
 * @fileoverview Geometry Operations Tests
 * Tests for geometry operations module
 */

import { GeometryOperations, GeometryOperationTypes } from '../editing/GeometryOperations.js';
import { describe, it, beforeEach, assert, assertEqual, assertDeepEqual, assertThrows } from './TestFramework.js';

describe('Geometry Operations Tests', () => {
  let mockFaces, mockEdges, mockVertices;

  beforeEach(() => {
    // Setup mock data for each test
    mockFaces = [
      { id: 'face1', vertexIds: ['v1', 'v2', 'v3'], normal: { x: 0, y: 1, z: 0 } },
      { id: 'face2', vertexIds: ['v2', 'v3', 'v4'], normal: { x: 0, y: 1, z: 0 } }
    ];

    mockEdges = [
      { id: 'edge1', vertexIds: ['v1', 'v2'] },
      { id: 'edge2', vertexIds: ['v2', 'v3'] },
      { id: 'edge3', vertexIds: ['v3', 'v4'] }
    ];

    mockVertices = [
      { id: 'v1', x: 0, y: 0, z: 0 },
      { id: 'v2', x: 1, y: 0, z: 0 },
      { id: 'v3', x: 1, y: 1, z: 0 },
      { id: 'v4', x: 0, y: 1, z: 0 }
    ];
  });

  describe('Bevel Operations', () => {
    it('should bevel faces with default options', () => {
      const result = GeometryOperations.bevel(mockFaces, {});
      
      assert(result, 'Bevel operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.BEVEL, 'Operation type should be BEVEL');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should bevel faces with custom options', () => {
      const options = {
        amount: 0.5,
        segments: 5,
        mode: 'distance',
        profile: true
      };

      const result = GeometryOperations.bevel(mockFaces, options);
      
      assert(result, 'Bevel operation should return a result');
      assertEqual(result.options.amount, 0.5, 'Amount should be set correctly');
      assertEqual(result.options.segments, 5, 'Segments should be set correctly');
      assertEqual(result.options.mode, 'distance', 'Mode should be set correctly');
      assertEqual(result.options.profile, true, 'Profile should be set correctly');
    });

    it('should handle empty faces array', () => {
      const result = GeometryOperations.bevel([], {});
      
      assertEqual(result, null, 'Should return null for empty faces array');
    });

    it('should validate bevel operation', () => {
      const operation = {
        type: GeometryOperationTypes.BEVEL,
        faces: mockFaces,
        options: { amount: 0.1 }
      };

      const validation = GeometryOperations.validateOperation(operation);
      
      assert(validation.isValid, 'Operation should be valid');
      assertEqual(validation.errors.length, 0, 'Should have no validation errors');
    });
  });

  describe('Extrude Operations', () => {
    it('should extrude faces with default options', () => {
      const result = GeometryOperations.extrude(mockFaces, {});
      
      assert(result, 'Extrude operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.EXTRUDE, 'Operation type should be EXTRUDE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should extrude faces with custom options', () => {
      const options = {
        distance: 2.0,
        direction: { x: 0, y: 1, z: 0 },
        individual: true,
        cap: true
      };

      const result = GeometryOperations.extrude(mockFaces, options);
      
      assert(result, 'Extrude operation should return a result');
      assertEqual(result.options.distance, 2.0, 'Distance should be set correctly');
      assertDeepEqual(result.options.direction, { x: 0, y: 1, z: 0 }, 'Direction should be set correctly');
      assertEqual(result.options.individual, true, 'Individual should be set correctly');
      assertEqual(result.options.cap, true, 'Cap should be set correctly');
    });

    it('should handle empty faces array', () => {
      const result = GeometryOperations.extrude([], {});
      
      assertEqual(result, null, 'Should return null for empty faces array');
    });
  });

  describe('Inset Operations', () => {
    it('should inset faces with default options', () => {
      const result = GeometryOperations.inset(mockFaces, {});
      
      assert(result, 'Inset operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.INSET, 'Operation type should be INSET');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should inset faces with custom options', () => {
      const options = {
        amount: 0.3,
        depth: 0.1,
        individual: false,
        outset: false
      };

      const result = GeometryOperations.inset(mockFaces, options);
      
      assert(result, 'Inset operation should return a result');
      assertEqual(result.options.amount, 0.3, 'Amount should be set correctly');
      assertEqual(result.options.depth, 0.1, 'Depth should be set correctly');
      assertEqual(result.options.individual, false, 'Individual should be set correctly');
      assertEqual(result.options.outset, false, 'Outset should be set correctly');
    });
  });

  describe('Extrude Region Operations', () => {
    it('should extrude region with default options', () => {
      const result = GeometryOperations.extrudeRegion(mockFaces, {});
      
      assert(result, 'Extrude region operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.EXTRUDE_REGION, 'Operation type should be EXTRUDE_REGION');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should extrude region with custom options', () => {
      const options = {
        distance: 1.5,
        direction: { x: 0, y: 1, z: 0 },
        cap: true,
        individual: false
      };

      const result = GeometryOperations.extrudeRegion(mockFaces, options);
      
      assert(result, 'Extrude region operation should return a result');
      assertEqual(result.options.distance, 1.5, 'Distance should be set correctly');
      assertDeepEqual(result.options.direction, { x: 0, y: 1, z: 0 }, 'Direction should be set correctly');
      assertEqual(result.options.cap, true, 'Cap should be set correctly');
      assertEqual(result.options.individual, false, 'Individual should be set correctly');
    });
  });

  describe('Bevel Region Operations', () => {
    it('should bevel region with default options', () => {
      const result = GeometryOperations.bevelRegion(mockFaces, {});
      
      assert(result, 'Bevel region operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.BEVEL_REGION, 'Operation type should be BEVEL_REGION');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should bevel region with custom options', () => {
      const options = {
        amount: 0.2,
        segments: 4,
        mode: 'percentage',
        profile: false
      };

      const result = GeometryOperations.bevelRegion(mockFaces, options);
      
      assert(result, 'Bevel region operation should return a result');
      assertEqual(result.options.amount, 0.2, 'Amount should be set correctly');
      assertEqual(result.options.segments, 4, 'Segments should be set correctly');
      assertEqual(result.options.mode, 'percentage', 'Mode should be set correctly');
      assertEqual(result.options.profile, false, 'Profile should be set correctly');
    });
  });

  describe('Inset Region Operations', () => {
    it('should inset region with default options', () => {
      const result = GeometryOperations.insetRegion(mockFaces, {});
      
      assert(result, 'Inset region operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.INSET_REGION, 'Operation type should be INSET_REGION');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should inset region with custom options', () => {
      const options = {
        amount: 0.4,
        depth: 0.2,
        individual: true,
        outset: false
      };

      const result = GeometryOperations.insetRegion(mockFaces, options);
      
      assert(result, 'Inset region operation should return a result');
      assertEqual(result.options.amount, 0.4, 'Amount should be set correctly');
      assertEqual(result.options.depth, 0.2, 'Depth should be set correctly');
      assertEqual(result.options.individual, true, 'Individual should be set correctly');
      assertEqual(result.options.outset, false, 'Outset should be set correctly');
    });
  });

  describe('Bridge Operations', () => {
    it('should bridge edges with default options', () => {
      const result = GeometryOperations.bridge(mockEdges, {});
      
      assert(result, 'Bridge operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.BRIDGE, 'Operation type should be BRIDGE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should bridge edges with custom options', () => {
      const options = {
        segments: 3,
        smooth: true,
        tension: 0.7
      };

      const result = GeometryOperations.bridge(mockEdges, options);
      
      assert(result, 'Bridge operation should return a result');
      assertEqual(result.options.segments, 3, 'Segments should be set correctly');
      assertEqual(result.options.smooth, true, 'Smooth should be set correctly');
      assertEqual(result.options.tension, 0.7, 'Tension should be set correctly');
    });
  });

  describe('Loft Operations', () => {
    it('should loft profiles with default options', () => {
      const profiles = [mockVertices, mockVertices];
      const result = GeometryOperations.loft(profiles, {});
      
      assert(result, 'Loft operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.LOFT, 'Operation type should be LOFT');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should loft profiles with custom options', () => {
      const profiles = [mockVertices, mockVertices];
      const options = {
        segments: 10,
        smooth: true,
        cap: true
      };

      const result = GeometryOperations.loft(profiles, options);
      
      assert(result, 'Loft operation should return a result');
      assertEqual(result.options.segments, 10, 'Segments should be set correctly');
      assertEqual(result.options.smooth, true, 'Smooth should be set correctly');
      assertEqual(result.options.cap, true, 'Cap should be set correctly');
    });
  });

  describe('Revolve Operations', () => {
    it('should revolve profile with default options', () => {
      const result = GeometryOperations.revolve(mockVertices, {});
      
      assert(result, 'Revolve operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.REVOLVE, 'Operation type should be REVOLVE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should revolve profile with custom options', () => {
      const options = {
        axis: { x: 0, y: 1, z: 0 },
        center: { x: 0, y: 0, z: 0 },
        angle: Math.PI * 2,
        segments: 16
      };

      const result = GeometryOperations.revolve(mockVertices, options);
      
      assert(result, 'Revolve operation should return a result');
      assertDeepEqual(result.options.axis, { x: 0, y: 1, z: 0 }, 'Axis should be set correctly');
      assertDeepEqual(result.options.center, { x: 0, y: 0, z: 0 }, 'Center should be set correctly');
      assertEqual(result.options.angle, Math.PI * 2, 'Angle should be set correctly');
      assertEqual(result.options.segments, 16, 'Segments should be set correctly');
    });
  });

  describe('Sweep Operations', () => {
    it('should sweep profile with default options', () => {
      const path = mockVertices;
      const profile = mockVertices;
      const result = GeometryOperations.sweep(profile, path, {});
      
      assert(result, 'Sweep operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.SWEEP, 'Operation type should be SWEEP');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should sweep profile with custom options', () => {
      const path = mockVertices;
      const profile = mockVertices;
      const options = {
        segments: 20,
        smooth: true,
        cap: true
      };

      const result = GeometryOperations.sweep(profile, path, options);
      
      assert(result, 'Sweep operation should return a result');
      assertEqual(result.options.segments, 20, 'Segments should be set correctly');
      assertEqual(result.options.smooth, true, 'Smooth should be set correctly');
      assertEqual(result.options.cap, true, 'Cap should be set correctly');
    });
  });

  describe('Thicken Operations', () => {
    it('should thicken faces with default options', () => {
      const result = GeometryOperations.thicken(mockFaces, {});
      
      assert(result, 'Thicken operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.THICKEN, 'Operation type should be THICKEN');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should thicken faces with custom options', () => {
      const options = {
        thickness: 0.5,
        direction: { x: 0, y: 1, z: 0 },
        cap: true
      };

      const result = GeometryOperations.thicken(mockFaces, options);
      
      assert(result, 'Thicken operation should return a result');
      assertEqual(result.options.thickness, 0.5, 'Thickness should be set correctly');
      assertDeepEqual(result.options.direction, { x: 0, y: 1, z: 0 }, 'Direction should be set correctly');
      assertEqual(result.options.cap, true, 'Cap should be set correctly');
    });
  });

  describe('Shell Operations', () => {
    it('should shell faces with default options', () => {
      const result = GeometryOperations.shell(mockFaces, {});
      
      assert(result, 'Shell operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.SHELL, 'Operation type should be SHELL');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should shell faces with custom options', () => {
      const options = {
        thickness: 0.3,
        direction: { x: 0, y: 1, z: 0 },
        cap: true
      };

      const result = GeometryOperations.shell(mockFaces, options);
      
      assert(result, 'Shell operation should return a result');
      assertEqual(result.options.thickness, 0.3, 'Thickness should be set correctly');
      assertDeepEqual(result.options.direction, { x: 0, y: 1, z: 0 }, 'Direction should be set correctly');
      assertEqual(result.options.cap, true, 'Cap should be set correctly');
    });
  });

  describe('Subdivide Operations', () => {
    it('should subdivide faces with default options', () => {
      const result = GeometryOperations.subdivide(mockFaces, {});
      
      assert(result, 'Subdivide operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.SUBDIVIDE, 'Operation type should be SUBDIVIDE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should subdivide faces with custom options', () => {
      const options = {
        iterations: 2,
        method: 'catmull-clark',
        smooth: true
      };

      const result = GeometryOperations.subdivide(mockFaces, options);
      
      assert(result, 'Subdivide operation should return a result');
      assertEqual(result.options.iterations, 2, 'Iterations should be set correctly');
      assertEqual(result.options.method, 'catmull-clark', 'Method should be set correctly');
      assertEqual(result.options.smooth, true, 'Smooth should be set correctly');
    });
  });

  describe('Smooth Operations', () => {
    it('should smooth vertices with default options', () => {
      const result = GeometryOperations.smooth(mockVertices, {});
      
      assert(result, 'Smooth operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.SMOOTH, 'Operation type should be SMOOTH');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should smooth vertices with custom options', () => {
      const options = {
        iterations: 3,
        factor: 0.7,
        preserveSharp: true
      };

      const result = GeometryOperations.smooth(mockVertices, options);
      
      assert(result, 'Smooth operation should return a result');
      assertEqual(result.options.iterations, 3, 'Iterations should be set correctly');
      assertEqual(result.options.factor, 0.7, 'Factor should be set correctly');
      assertEqual(result.options.preserveSharp, true, 'PreserveSharp should be set correctly');
    });
  });

  describe('Decimate Operations', () => {
    it('should decimate faces with default options', () => {
      const result = GeometryOperations.decimate(mockFaces, {});
      
      assert(result, 'Decimate operation should return a result');
      assertEqual(result.type, GeometryOperationTypes.DECIMATE, 'Operation type should be DECIMATE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should decimate faces with custom options', () => {
      const options = {
        ratio: 0.5,
        method: 'quadric',
        preserveBoundary: true
      };

      const result = GeometryOperations.decimate(mockFaces, options);
      
      assert(result, 'Decimate operation should return a result');
      assertEqual(result.options.ratio, 0.5, 'Ratio should be set correctly');
      assertEqual(result.options.method, 'quadric', 'Method should be set correctly');
      assertEqual(result.options.preserveBoundary, true, 'PreserveBoundary should be set correctly');
    });
  });

  describe('Validation Tests', () => {
    it('should validate valid operations', () => {
      const operation = {
        type: GeometryOperationTypes.BEVEL,
        faces: mockFaces,
        options: { amount: 0.1 }
      };

      const validation = GeometryOperations.validateOperation(operation);
      
      assert(validation.isValid, 'Valid operation should pass validation');
      assertEqual(validation.errors.length, 0, 'Should have no validation errors');
    });

    it('should reject invalid operation types', () => {
      const operation = {
        type: 'INVALID_TYPE',
        faces: mockFaces,
        options: {}
      };

      const validation = GeometryOperations.validateOperation(operation);
      
      assert(!validation.isValid, 'Invalid operation should fail validation');
      assert(validation.errors.length > 0, 'Should have validation errors');
    });

    it('should reject operations without faces', () => {
      const operation = {
        type: GeometryOperationTypes.BEVEL,
        options: { amount: 0.1 }
      };

      const validation = GeometryOperations.validateOperation(operation);
      
      assert(!validation.isValid, 'Operation without faces should fail validation');
      assert(validation.errors.length > 0, 'Should have validation errors');
    });

    it('should reject operations with empty faces array', () => {
      const operation = {
        type: GeometryOperationTypes.BEVEL,
        faces: [],
        options: { amount: 0.1 }
      };

      const validation = GeometryOperations.validateOperation(operation);
      
      assert(!validation.isValid, 'Operation with empty faces should fail validation');
      assert(validation.errors.length > 0, 'Should have validation errors');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle null input gracefully', () => {
      const result = GeometryOperations.bevel(null, {});
      
      assertEqual(result, null, 'Should return null for null input');
    });

    it('should handle undefined input gracefully', () => {
      const result = GeometryOperations.extrude(undefined, {});
      
      assertEqual(result, null, 'Should return null for undefined input');
    });

    it('should handle invalid options gracefully', () => {
      const result = GeometryOperations.inset(mockFaces, { invalidOption: 'value' });
      
      assert(result, 'Should handle invalid options gracefully');
      assertEqual(result.type, GeometryOperationTypes.INSET, 'Should still return correct operation type');
    });
  });
}); 