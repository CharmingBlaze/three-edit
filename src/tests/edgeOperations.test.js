/**
 * @fileoverview Edge Operations Tests
 * Tests for edge operations module
 */

import { EdgeOperations, EdgeOperationTypes } from '../editing/edgeOperations.js';
import { describe, it, beforeEach, assert, assertEqual, assertDeepEqual, assertThrows } from './TestFramework.js';

describe('Edge Operations Tests', () => {
  let mockEdges, mockEdgePairs;

  beforeEach(() => {
    // Setup mock data for each test
    mockEdges = [
      { id: 'edge1', vertexIds: ['v1', 'v2'] },
      { id: 'edge2', vertexIds: ['v2', 'v3'] },
      { id: 'edge3', vertexIds: ['v3', 'v4'] },
      { id: 'edge4', vertexIds: ['v4', 'v1'] }
    ];

    mockEdgePairs = [
      [{ id: 'edge1', vertexIds: ['v1', 'v2'] }, { id: 'edge2', vertexIds: ['v2', 'v3'] }],
      [{ id: 'edge3', vertexIds: ['v3', 'v4'] }, { id: 'edge4', vertexIds: ['v4', 'v1'] }]
    ];
  });

  describe('Split Operations', () => {
    it('should split edges with default options', () => {
      const result = EdgeOperations.splitEdges(mockEdges, {});
      
      assert(result, 'Split operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.SPLIT, 'Operation type should be SPLIT');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should split edges with custom options', () => {
      const options = {
        cuts: 3,
        smooth: true,
        ratio: 0.5
      };

      const result = EdgeOperations.splitEdges(mockEdges, options);
      
      assert(result, 'Split operation should return a result');
      assertEqual(result.options.cuts, 3, 'Cuts should be set correctly');
      assertEqual(result.options.smooth, true, 'Smooth should be set correctly');
      assertEqual(result.options.ratio, 0.5, 'Ratio should be set correctly');
    });

    it('should handle empty edges array', () => {
      const result = EdgeOperations.splitEdges([], {});
      
      assertEqual(result, null, 'Should return null for empty edges array');
    });
  });

  describe('Collapse Operations', () => {
    it('should collapse edges with default options', () => {
      const result = EdgeOperations.collapseEdges(mockEdges, {});
      
      assert(result, 'Collapse operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.COLLAPSE, 'Operation type should be COLLAPSE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should collapse edges with custom options', () => {
      const options = {
        target: 'center',
        customTarget: { x: 0.5, y: 0.5, z: 0 },
        preserveFaces: true
      };

      const result = EdgeOperations.collapseEdges(mockEdges, options);
      
      assert(result, 'Collapse operation should return a result');
      assertEqual(result.options.target, 'center', 'Target should be set correctly');
      assertDeepEqual(result.options.customTarget, { x: 0.5, y: 0.5, z: 0 }, 'CustomTarget should be set correctly');
      assertEqual(result.options.preserveFaces, true, 'PreserveFaces should be set correctly');
    });
  });

  describe('Dissolve Operations', () => {
    it('should dissolve edges with default options', () => {
      const result = EdgeOperations.dissolveEdges(mockEdges, {});
      
      assert(result, 'Dissolve operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.DISSOLVE, 'Operation type should be DISSOLVE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should dissolve edges with custom options', () => {
      const options = {
        preserveFaces: true,
        preserveVertices: true
      };

      const result = EdgeOperations.dissolveEdges(mockEdges, options);
      
      assert(result, 'Dissolve operation should return a result');
      assertEqual(result.options.preserveFaces, true, 'PreserveFaces should be set correctly');
      assertEqual(result.options.preserveVertices, true, 'PreserveVertices should be set correctly');
    });
  });

  describe('Bevel Operations', () => {
    it('should bevel edges with default options', () => {
      const result = EdgeOperations.bevelEdges(mockEdges, {});
      
      assert(result, 'Bevel operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.BEVEL, 'Operation type should be BEVEL');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should bevel edges with custom options', () => {
      const options = {
        amount: 0.2,
        segments: 5,
        mode: 'distance',
        profile: true
      };

      const result = EdgeOperations.bevelEdges(mockEdges, options);
      
      assert(result, 'Bevel operation should return a result');
      assertEqual(result.options.amount, 0.2, 'Amount should be set correctly');
      assertEqual(result.options.segments, 5, 'Segments should be set correctly');
      assertEqual(result.options.mode, 'distance', 'Mode should be set correctly');
      assertEqual(result.options.profile, true, 'Profile should be set correctly');
    });
  });

  describe('Extrude Operations', () => {
    it('should extrude edges with default options', () => {
      const result = EdgeOperations.extrudeEdges(mockEdges, {});
      
      assert(result, 'Extrude operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.EXTRUDE, 'Operation type should be EXTRUDE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should extrude edges with custom options', () => {
      const options = {
        distance: 1.5,
        direction: { x: 0, y: 1, z: 0 },
        individual: true
      };

      const result = EdgeOperations.extrudeEdges(mockEdges, options);
      
      assert(result, 'Extrude operation should return a result');
      assertEqual(result.options.distance, 1.5, 'Distance should be set correctly');
      assertDeepEqual(result.options.direction, { x: 0, y: 1, z: 0 }, 'Direction should be set correctly');
      assertEqual(result.options.individual, true, 'Individual should be set correctly');
    });
  });

  describe('Bridge Operations', () => {
    it('should bridge edges with default options', () => {
      const result = EdgeOperations.bridgeEdges(mockEdgePairs, {});
      
      assert(result, 'Bridge operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.BRIDGE, 'Operation type should be BRIDGE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should bridge edges with custom options', () => {
      const options = {
        segments: 3,
        smooth: true,
        tension: 0.7
      };

      const result = EdgeOperations.bridgeEdges(mockEdgePairs, options);
      
      assert(result, 'Bridge operation should return a result');
      assertEqual(result.options.segments, 3, 'Segments should be set correctly');
      assertEqual(result.options.smooth, true, 'Smooth should be set correctly');
      assertEqual(result.options.tension, 0.7, 'Tension should be set correctly');
    });
  });

  describe('Loop Cut Operations', () => {
    it('should loop cut edges with default options', () => {
      const result = EdgeOperations.loopCutEdges(mockEdges, {});
      
      assert(result, 'Loop cut operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.LOOP_CUT, 'Operation type should be LOOP_CUT');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should loop cut edges with custom options', () => {
      const options = {
        cuts: 2,
        smooth: true,
        ratio: 0.5
      };

      const result = EdgeOperations.loopCutEdges(mockEdges, options);
      
      assert(result, 'Loop cut operation should return a result');
      assertEqual(result.options.cuts, 2, 'Cuts should be set correctly');
      assertEqual(result.options.smooth, true, 'Smooth should be set correctly');
      assertEqual(result.options.ratio, 0.5, 'Ratio should be set correctly');
    });
  });

  describe('Ring Cut Operations', () => {
    it('should ring cut edges with default options', () => {
      const result = EdgeOperations.ringCutEdges(mockEdges, {});
      
      assert(result, 'Ring cut operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.RING_CUT, 'Operation type should be RING_CUT');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should ring cut edges with custom options', () => {
      const options = {
        cuts: 3,
        smooth: false
      };

      const result = EdgeOperations.ringCutEdges(mockEdges, options);
      
      assert(result, 'Ring cut operation should return a result');
      assertEqual(result.options.cuts, 3, 'Cuts should be set correctly');
      assertEqual(result.options.smooth, false, 'Smooth should be set correctly');
    });
  });

  describe('Connect Operations', () => {
    it('should connect edges with default options', () => {
      const result = EdgeOperations.connectEdges(mockEdges, {});
      
      assert(result, 'Connect operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.CONNECT, 'Operation type should be CONNECT');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should connect edges with custom options', () => {
      const options = {
        createFaces: true,
        mergeDoubles: true
      };

      const result = EdgeOperations.connectEdges(mockEdges, options);
      
      assert(result, 'Connect operation should return a result');
      assertEqual(result.options.createFaces, true, 'CreateFaces should be set correctly');
      assertEqual(result.options.mergeDoubles, true, 'MergeDoubles should be set correctly');
    });
  });

  describe('Merge Operations', () => {
    it('should merge edges with default options', () => {
      const result = EdgeOperations.mergeEdges(mockEdges, {});
      
      assert(result, 'Merge operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.MERGE, 'Operation type should be MERGE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should merge edges with custom options', () => {
      const options = {
        threshold: 0.05,
        method: 'distance'
      };

      const result = EdgeOperations.mergeEdges(mockEdges, options);
      
      assert(result, 'Merge operation should return a result');
      assertEqual(result.options.threshold, 0.05, 'Threshold should be set correctly');
      assertEqual(result.options.method, 'distance', 'Method should be set correctly');
    });
  });

  describe('Remove Doubles Operations', () => {
    it('should remove double edges with default options', () => {
      const result = EdgeOperations.removeDoubleEdges(mockEdges, {});
      
      assert(result, 'Remove doubles operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.REMOVE_DOUBLES, 'Operation type should be REMOVE_DOUBLES');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should remove double edges with custom options', () => {
      const options = {
        threshold: 0.01,
        method: 'distance'
      };

      const result = EdgeOperations.removeDoubleEdges(mockEdges, options);
      
      assert(result, 'Remove doubles operation should return a result');
      assertEqual(result.options.threshold, 0.01, 'Threshold should be set correctly');
      assertEqual(result.options.method, 'distance', 'Method should be set correctly');
    });
  });

  describe('Smooth Operations', () => {
    it('should smooth edges with default options', () => {
      const result = EdgeOperations.smoothEdges(mockEdges, {});
      
      assert(result, 'Smooth operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.SMOOTH, 'Operation type should be SMOOTH');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should smooth edges with custom options', () => {
      const options = {
        iterations: 3,
        factor: 0.7,
        preserveSharp: true
      };

      const result = EdgeOperations.smoothEdges(mockEdges, options);
      
      assert(result, 'Smooth operation should return a result');
      assertEqual(result.options.iterations, 3, 'Iterations should be set correctly');
      assertEqual(result.options.factor, 0.7, 'Factor should be set correctly');
      assertEqual(result.options.preserveSharp, true, 'PreserveSharp should be set correctly');
    });
  });

  describe('Relax Operations', () => {
    it('should relax edges with default options', () => {
      const result = EdgeOperations.relaxEdges(mockEdges, {});
      
      assert(result, 'Relax operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.RELAX, 'Operation type should be RELAX');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should relax edges with custom options', () => {
      const options = {
        iterations: 2,
        factor: 0.5,
        preserveBoundary: true
      };

      const result = EdgeOperations.relaxEdges(mockEdges, options);
      
      assert(result, 'Relax operation should return a result');
      assertEqual(result.options.iterations, 2, 'Iterations should be set correctly');
      assertEqual(result.options.factor, 0.5, 'Factor should be set correctly');
      assertEqual(result.options.preserveBoundary, true, 'PreserveBoundary should be set correctly');
    });
  });

  describe('Fill Operations', () => {
    it('should fill edges with default options', () => {
      const result = EdgeOperations.fillEdges(mockEdges, {});
      
      assert(result, 'Fill operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.FILL, 'Operation type should be FILL');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should fill edges with custom options', () => {
      const options = {
        method: 'triangulate',
        beauty: true
      };

      const result = EdgeOperations.fillEdges(mockEdges, options);
      
      assert(result, 'Fill operation should return a result');
      assertEqual(result.options.method, 'triangulate', 'Method should be set correctly');
      assertEqual(result.options.beauty, true, 'Beauty should be set correctly');
    });
  });

  describe('Knife Operations', () => {
    it('should knife cut edges with default options', () => {
      const cutLine = [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }];
      const result = EdgeOperations.knifeEdges(mockEdges, { cutLine });
      
      assert(result, 'Knife operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.KNIFE, 'Operation type should be KNIFE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should knife cut edges with custom options', () => {
      const cutLine = [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }];
      const options = {
        cutLine,
        individual: true
      };

      const result = EdgeOperations.knifeEdges(mockEdges, options);
      
      assert(result, 'Knife operation should return a result');
      assertDeepEqual(result.options.cutLine, cutLine, 'CutLine should be set correctly');
      assertEqual(result.options.individual, true, 'Individual should be set correctly');
    });
  });

  describe('Slice Operations', () => {
    it('should slice edges with default options', () => {
      const result = EdgeOperations.sliceEdges(mockEdges, {});
      
      assert(result, 'Slice operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.SLICE, 'Operation type should be SLICE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should slice edges with custom options', () => {
      const plane = { normal: { x: 0, y: 1, z: 0 }, point: { x: 0, y: 0, z: 0 } };
      const options = {
        plane,
        fill: true
      };

      const result = EdgeOperations.sliceEdges(mockEdges, options);
      
      assert(result, 'Slice operation should return a result');
      assertDeepEqual(result.options.plane, plane, 'Plane should be set correctly');
      assertEqual(result.options.fill, true, 'Fill should be set correctly');
    });
  });

  describe('Subdivide Operations', () => {
    it('should subdivide edges with default options', () => {
      const result = EdgeOperations.subdivideEdges(mockEdges, {});
      
      assert(result, 'Subdivide operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.SUBDIVIDE, 'Operation type should be SUBDIVIDE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should subdivide edges with custom options', () => {
      const options = {
        cuts: 2,
        method: 'linear'
      };

      const result = EdgeOperations.subdivideEdges(mockEdges, options);
      
      assert(result, 'Subdivide operation should return a result');
      assertEqual(result.options.cuts, 2, 'Cuts should be set correctly');
      assertEqual(result.options.method, 'linear', 'Method should be set correctly');
    });
  });

  describe('Mark Operations', () => {
    it('should mark edges as crease', () => {
      const result = EdgeOperations.creaseEdges(mockEdges, {});
      
      assert(result, 'Crease operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.CREASE, 'Operation type should be CREASE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should mark edges as seam', () => {
      const result = EdgeOperations.markSeamEdges(mockEdges, {});
      
      assert(result, 'Mark seam operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.MARK_SEAM, 'Operation type should be MARK_SEAM');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should mark edges as sharp', () => {
      const result = EdgeOperations.markSharpEdges(mockEdges, {});
      
      assert(result, 'Mark sharp operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.MARK_SHARP, 'Operation type should be MARK_SHARP');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should mark edges as boundary', () => {
      const result = EdgeOperations.markBoundaryEdges(mockEdges, {});
      
      assert(result, 'Mark boundary operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.MARK_BOUNDARY, 'Operation type should be MARK_BOUNDARY');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });

    it('should mark edges as freestyle', () => {
      const result = EdgeOperations.markFreestyleEdges(mockEdges, {});
      
      assert(result, 'Mark freestyle operation should return a result');
      assertEqual(result.type, EdgeOperationTypes.MARK_FREESTYLE, 'Operation type should be MARK_FREESTYLE');
      assert(result.options, 'Result should have options');
      assert(result.result, 'Result should have result data');
    });
  });

  describe('Validation Tests', () => {
    it('should validate valid operations', () => {
      const operation = {
        type: EdgeOperationTypes.SPLIT,
        edges: mockEdges,
        options: { cuts: 1 }
      };

      const validation = EdgeOperations.validateOperation(operation);
      
      assert(validation.isValid, 'Valid operation should pass validation');
      assertEqual(validation.errors.length, 0, 'Should have no validation errors');
    });

    it('should reject invalid operation types', () => {
      const operation = {
        type: 'INVALID_TYPE',
        edges: mockEdges,
        options: {}
      };

      const validation = EdgeOperations.validateOperation(operation);
      
      assert(!validation.isValid, 'Invalid operation should fail validation');
      assert(validation.errors.length > 0, 'Should have validation errors');
    });

    it('should reject operations without edges', () => {
      const operation = {
        type: EdgeOperationTypes.SPLIT,
        options: { cuts: 1 }
      };

      const validation = EdgeOperations.validateOperation(operation);
      
      assert(!validation.isValid, 'Operation without edges should fail validation');
      assert(validation.errors.length > 0, 'Should have validation errors');
    });

    it('should reject operations with empty edges array', () => {
      const operation = {
        type: EdgeOperationTypes.SPLIT,
        edges: [],
        options: { cuts: 1 }
      };

      const validation = EdgeOperations.validateOperation(operation);
      
      assert(!validation.isValid, 'Operation with empty edges should fail validation');
      assert(validation.errors.length > 0, 'Should have validation errors');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle null input gracefully', () => {
      const result = EdgeOperations.splitEdges(null, {});
      
      assertEqual(result, null, 'Should return null for null input');
    });

    it('should handle undefined input gracefully', () => {
      const result = EdgeOperations.collapseEdges(undefined, {});
      
      assertEqual(result, null, 'Should return null for undefined input');
    });

    it('should handle invalid options gracefully', () => {
      const result = EdgeOperations.bevelEdges(mockEdges, { invalidOption: 'value' });
      
      assert(result, 'Should handle invalid options gracefully');
      assertEqual(result.type, EdgeOperationTypes.BEVEL, 'Should still return correct operation type');
    });
  });
});
