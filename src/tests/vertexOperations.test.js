/**
 * @fileoverview Vertex Operations Tests
 * Tests for vertex operations module
 */

import { vertexOperations as VertexOperations, VertexOperationTypes } from '../editing/vertexOperations.js';
import { describe, it, beforeEach, assert, assertEqual, assertDeepEqual, assertThrows } from './TestFramework.js';

describe('Vertex Operations Tests', () => {
  let mockVertices, mockVertexPairs;

  beforeEach(() => {
    // Setup mock data for each test
    mockVertices = [
      { id: 'v1', x: 0, y: 0, z: 0 },
      { id: 'v2', x: 1, y: 0, z: 0 },
      { id: 'v3', x: 1, y: 1, z: 0 },
      { id: 'v4', x: 0, y: 1, z: 0 }
    ];

    mockVertexPairs = [
      [{ id: 'v1', x: 0, y: 0, z: 0 }, { id: 'v2', x: 1, y: 0, z: 0 }],
      [{ id: 'v3', x: 1, y: 1, z: 0 }, { id: 'v4', x: 0, y: 1, z: 0 }]
    ];
  });

  describe('Snap Operations', () => {
    it('should snap vertices with default options', () => {
      const result = VertexOperations.snapVertices(mockVertices, {});
      
      assert(result, 'Snap operation should return a result');
      assertEqual(result.type, VertexOperationTypes.SNAP, 'Operation type should be SNAP');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should snap vertices with custom options', () => {
      const options = {
        threshold: 0.1,
        target: { x: 0, y: 0, z: 0 },
        method: 'distance'
      };

      const result = VertexOperations.snapVertices(mockVertices, options);
      
      assert(result, 'Snap operation should return a result');
      assertEqual(result.options.threshold, 0.1, 'Threshold should be set correctly');
      assertDeepEqual(result.options.target, { x: 0, y: 0, z: 0 }, 'Target should be set correctly');
      assertEqual(result.options.method, 'distance', 'Method should be set correctly');
    });

    it('should handle empty vertices array', () => {
      const result = VertexOperations.snapVertices([], {});
      
      assertEqual(result, null, 'Should return null for empty vertices array');
    });
  });

  describe('Connect Operations', () => {
    it('should connect vertices with default options', () => {
      const result = VertexOperations.connectVertices(mockVertices, {});
      
      assert(result, 'Connect operation should return a result');
      assertEqual(result.type, VertexOperationTypes.CONNECT, 'Operation type should be CONNECT');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should connect vertices with custom options', () => {
      const options = {
        createEdges: true,
        mergeDoubles: true,
        method: 'distance'
      };

      const result = VertexOperations.connectVertices(mockVertices, options);
      
      assert(result, 'Connect operation should return a result');
      assertEqual(result.options.createEdges, true, 'CreateEdges should be set correctly');
      assertEqual(result.options.mergeDoubles, true, 'MergeDoubles should be set correctly');
      assertEqual(result.options.method, 'distance', 'Method should be set correctly');
    });
  });

  describe('Merge Operations', () => {
    it('should merge vertices with default options', () => {
      const result = VertexOperations.mergeVertices(mockVertices, {});
      
      assert(result, 'Merge operation should return a result');
      assertEqual(result.type, VertexOperationTypes.MERGE, 'Operation type should be MERGE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should merge vertices with custom options', () => {
      const options = {
        threshold: 0.05,
        method: 'distance',
        target: 'first'
      };

      const result = VertexOperations.mergeVertices(mockVertices, options);
      
      assert(result, 'Merge operation should return a result');
      assertEqual(result.options.threshold, 0.05, 'Threshold should be set correctly');
      assertEqual(result.options.method, 'distance', 'Method should be set correctly');
      assertEqual(result.options.target, 'first', 'Target should be set correctly');
    });
  });

  describe('Split Operations', () => {
    it('should split vertices with default options', () => {
      const result = VertexOperations.splitVertices(mockVertices, {});
      
      assert(result, 'Split operation should return a result');
      assertEqual(result.type, VertexOperationTypes.SPLIT, 'Operation type should be SPLIT');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should split vertices with custom options', () => {
      const options = {
        method: 'center',
        individual: false,
        preserveEdges: true
      };

      const result = VertexOperations.splitVertices(mockVertices, options);
      
      assert(result, 'Split operation should return a result');
      assertEqual(result.options.method, 'center', 'Method should be set correctly');
      assertEqual(result.options.individual, false, 'Individual should be set correctly');
      assertEqual(result.options.preserveEdges, true, 'PreserveEdges should be set correctly');
    });
  });

  describe('Collapse Operations', () => {
    it('should collapse vertices with default options', () => {
      const result = VertexOperations.collapseVertices(mockVertices, {});
      
      assert(result, 'Collapse operation should return a result');
      assertEqual(result.type, VertexOperationTypes.COLLAPSE, 'Operation type should be COLLAPSE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should collapse vertices with custom options', () => {
      const options = {
        target: 'center',
        customTarget: { x: 0.5, y: 0.5, z: 0 },
        preserveEdges: true
      };

      const result = VertexOperations.collapseVertices(mockVertices, options);
      
      assert(result, 'Collapse operation should return a result');
      assertEqual(result.options.target, 'center', 'Target should be set correctly');
      assertDeepEqual(result.options.customTarget, { x: 0.5, y: 0.5, z: 0 }, 'CustomTarget should be set correctly');
      assertEqual(result.options.preserveEdges, true, 'PreserveEdges should be set correctly');
    });
  });

  describe('Dissolve Operations', () => {
    it('should dissolve vertices with default options', () => {
      const result = VertexOperations.dissolveVertices(mockVertices, {});
      
      assert(result, 'Dissolve operation should return a result');
      assertEqual(result.type, VertexOperationTypes.DISSOLVE, 'Operation type should be DISSOLVE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should dissolve vertices with custom options', () => {
      const options = {
        preserveEdges: true,
        preserveFaces: true
      };

      const result = VertexOperations.dissolveVertices(mockVertices, options);
      
      assert(result, 'Dissolve operation should return a result');
      assertEqual(result.options.preserveEdges, true, 'PreserveEdges should be set correctly');
      assertEqual(result.options.preserveFaces, true, 'PreserveFaces should be set correctly');
    });
  });

  describe('Remove Doubles Operations', () => {
    it('should remove double vertices with default options', () => {
      const result = VertexOperations.removeDoubleVertices(mockVertices, {});
      
      assert(result, 'Remove doubles operation should return a result');
      assertEqual(result.type, VertexOperationTypes.REMOVE_DOUBLES, 'Operation type should be REMOVE_DOUBLES');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should remove double vertices with custom options', () => {
      const options = {
        threshold: 0.01,
        method: 'distance'
      };

      const result = VertexOperations.removeDoubleVertices(mockVertices, options);
      
      assert(result, 'Remove doubles operation should return a result');
      assertEqual(result.options.threshold, 0.01, 'Threshold should be set correctly');
      assertEqual(result.options.method, 'distance', 'Method should be set correctly');
    });
  });

  describe('Smooth Operations', () => {
    it('should smooth vertices with default options', () => {
      const result = VertexOperations.smoothVertices(mockVertices, {});
      
      assert(result, 'Smooth operation should return a result');
      assertEqual(result.type, VertexOperationTypes.SMOOTH, 'Operation type should be SMOOTH');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should smooth vertices with custom options', () => {
      const options = {
        iterations: 3,
        factor: 0.7,
        preserveSharp: true
      };

      const result = VertexOperations.smoothVertices(mockVertices, options);
      
      assert(result, 'Smooth operation should return a result');
      assertEqual(result.options.iterations, 3, 'Iterations should be set correctly');
      assertEqual(result.options.factor, 0.7, 'Factor should be set correctly');
      assertEqual(result.options.preserveSharp, true, 'PreserveSharp should be set correctly');
    });
  });

  describe('Relax Operations', () => {
    it('should relax vertices with default options', () => {
      const result = VertexOperations.relaxVertices(mockVertices, {});
      
      assert(result, 'Relax operation should return a result');
      assertEqual(result.type, VertexOperationTypes.RELAX, 'Operation type should be RELAX');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should relax vertices with custom options', () => {
      const options = {
        iterations: 2,
        factor: 0.5,
        preserveBoundary: true
      };

      const result = VertexOperations.relaxVertices(mockVertices, options);
      
      assert(result, 'Relax operation should return a result');
      assertEqual(result.options.iterations, 2, 'Iterations should be set correctly');
      assertEqual(result.options.factor, 0.5, 'Factor should be set correctly');
      assertEqual(result.options.preserveBoundary, true, 'PreserveBoundary should be set correctly');
    });
  });

  describe('Bevel Operations', () => {
    it('should bevel vertices with default options', () => {
      const result = VertexOperations.bevelVertices(mockVertices, {});
      
      assert(result, 'Bevel operation should return a result');
      assertEqual(result.type, VertexOperationTypes.BEVEL, 'Operation type should be BEVEL');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should bevel vertices with custom options', () => {
      const options = {
        amount: 0.2,
        segments: 4,
        mode: 'distance',
        profile: false
      };

      const result = VertexOperations.bevelVertices(mockVertices, options);
      
      assert(result, 'Bevel operation should return a result');
      assertEqual(result.options.amount, 0.2, 'Amount should be set correctly');
      assertEqual(result.options.segments, 4, 'Segments should be set correctly');
      assertEqual(result.options.mode, 'distance', 'Mode should be set correctly');
      assertEqual(result.options.profile, false, 'Profile should be set correctly');
    });
  });

  describe('Extrude Operations', () => {
    it('should extrude vertices with default options', () => {
      const result = VertexOperations.extrudeVertices(mockVertices, {});
      
      assert(result, 'Extrude operation should return a result');
      assertEqual(result.type, VertexOperationTypes.EXTRUDE, 'Operation type should be EXTRUDE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should extrude vertices with custom options', () => {
      const options = {
        distance: 1.5,
        direction: { x: 0, y: 1, z: 0 },
        individual: true
      };

      const result = VertexOperations.extrudeVertices(mockVertices, options);
      
      assert(result, 'Extrude operation should return a result');
      assertEqual(result.options.distance, 1.5, 'Distance should be set correctly');
      assertDeepEqual(result.options.direction, { x: 0, y: 1, z: 0 }, 'Direction should be set correctly');
      assertEqual(result.options.individual, true, 'Individual should be set correctly');
    });
  });

  describe('Fill Operations', () => {
    it('should fill vertices with default options', () => {
      const result = VertexOperations.fillVertices(mockVertices, {});
      
      assert(result, 'Fill operation should return a result');
      assertEqual(result.type, VertexOperationTypes.FILL, 'Operation type should be FILL');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should fill vertices with custom options', () => {
      const options = {
        method: 'triangulate',
        beauty: true
      };

      const result = VertexOperations.fillVertices(mockVertices, options);
      
      assert(result, 'Fill operation should return a result');
      assertEqual(result.options.method, 'triangulate', 'Method should be set correctly');
      assertEqual(result.options.beauty, true, 'Beauty should be set correctly');
    });
  });

  describe('Bridge Operations', () => {
    it('should bridge vertices with default options', () => {
      const result = VertexOperations.bridgeVertices(mockVertexPairs, {});
      
      assert(result, 'Bridge operation should return a result');
      assertEqual(result.type, VertexOperationTypes.BRIDGE, 'Operation type should be BRIDGE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should bridge vertices with custom options', () => {
      const options = {
        segments: 3,
        smooth: true,
        tension: 0.6
      };

      const result = VertexOperations.bridgeVertices(mockVertexPairs, options);
      
      assert(result, 'Bridge operation should return a result');
      assertEqual(result.options.segments, 3, 'Segments should be set correctly');
      assertEqual(result.options.smooth, true, 'Smooth should be set correctly');
      assertEqual(result.options.tension, 0.6, 'Tension should be set correctly');
    });
  });

  describe('Loop Cut Operations', () => {
    it('should loop cut vertices with default options', () => {
      const result = VertexOperations.loopCutVertices(mockVertices, {});
      
      assert(result, 'Loop cut operation should return a result');
      assertEqual(result.type, VertexOperationTypes.LOOP_CUT, 'Operation type should be LOOP_CUT');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should loop cut vertices with custom options', () => {
      const options = {
        cuts: 2,
        smooth: true,
        ratio: 0.5
      };

      const result = VertexOperations.loopCutVertices(mockVertices, options);
      
      assert(result, 'Loop cut operation should return a result');
      assertEqual(result.options.cuts, 2, 'Cuts should be set correctly');
      assertEqual(result.options.smooth, true, 'Smooth should be set correctly');
      assertEqual(result.options.ratio, 0.5, 'Ratio should be set correctly');
    });
  });

  describe('Ring Cut Operations', () => {
    it('should ring cut vertices with default options', () => {
      const result = VertexOperations.ringCutVertices(mockVertices, {});
      
      assert(result, 'Ring cut operation should return a result');
      assertEqual(result.type, VertexOperationTypes.RING_CUT, 'Operation type should be RING_CUT');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should ring cut vertices with custom options', () => {
      const options = {
        cuts: 3,
        smooth: false
      };

      const result = VertexOperations.ringCutVertices(mockVertices, options);
      
      assert(result, 'Ring cut operation should return a result');
      assertEqual(result.options.cuts, 3, 'Cuts should be set correctly');
      assertEqual(result.options.smooth, false, 'Smooth should be set correctly');
    });
  });

  describe('Validation Tests', () => {
    it('should validate valid operations', () => {
      const operation = {
        type: VertexOperationTypes.SNAP,
        vertices: mockVertices,
        options: { threshold: 0.1 }
      };

      const validation = VertexOperations.validateOperation(operation);
      
      assert(validation.isValid, 'Valid operation should pass validation');
      assertEqual(validation.errors.length, 0, 'Should have no validation errors');
    });

    it('should reject invalid operation types', () => {
      const operation = {
        type: 'INVALID_TYPE',
        vertices: mockVertices,
        options: {}
      };

      const validation = VertexOperations.validateOperation(operation);
      
      assert(!validation.isValid, 'Invalid operation should fail validation');
      assert(validation.errors.length > 0, 'Should have validation errors');
    });

    it('should reject operations without vertices', () => {
      const operation = {
        type: VertexOperationTypes.SNAP,
        options: { threshold: 0.1 }
      };

      const validation = VertexOperations.validateOperation(operation);
      
      assert(!validation.isValid, 'Operation without vertices should fail validation');
      assert(validation.errors.length > 0, 'Should have validation errors');
    });

    it('should reject operations with empty vertices array', () => {
      const operation = {
        type: VertexOperationTypes.SNAP,
        vertices: [],
        options: { threshold: 0.1 }
      };

      const validation = VertexOperations.validateOperation(operation);
      
      assert(!validation.isValid, 'Operation with empty vertices should fail validation');
      assert(validation.errors.length > 0, 'Should have validation errors');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle null input gracefully', () => {
      const result = VertexOperations.snapVertices(null, {});
      
      assertEqual(result, null, 'Should return null for null input');
    });

    it('should handle undefined input gracefully', () => {
      const result = VertexOperations.connectVertices(undefined, {});
      
      assertEqual(result, null, 'Should return null for undefined input');
    });

    it('should handle invalid options gracefully', () => {
      const result = VertexOperations.mergeVertices(mockVertices, { invalidOption: 'value' });
      
      assert(result, 'Should handle invalid options gracefully');
      assertEqual(result.type, VertexOperationTypes.MERGE, 'Should still return correct operation type');
    });
  });

  describe('Helper Method Tests', () => {
    it('should generate unique IDs', () => {
      const id1 = VertexOperations.generateUniqueId();
      const id2 = VertexOperations.generateUniqueId();
      
      assert(id1 !== id2, 'Generated IDs should be unique');
      assert(typeof id1 === 'string', 'Generated ID should be a string');
      assert(id1.length > 0, 'Generated ID should not be empty');
    });

    it('should calculate vertex distances', () => {
      const v1 = { x: 0, y: 0, z: 0 };
      const v2 = { x: 1, y: 0, z: 0 };
      
      const distance = VertexOperations.calculateDistance(v1, v2);
      
      assertEqual(distance, 1, 'Distance should be calculated correctly');
    });

    it('should calculate vertex centers', () => {
      const center = VertexOperations.calculateCenter(mockVertices);
      
      assert(center, 'Center should be calculated');
      assert(typeof center.x === 'number', 'Center x should be a number');
      assert(typeof center.y === 'number', 'Center y should be a number');
      assert(typeof center.z === 'number', 'Center z should be a number');
    });
  });
});
