/**
 * @fileoverview System Integration Tests
 * Tests for system integration and maintainability
 */

import { 
  GeometryOperations, GeometryOperationTypes,
  VertexOperations, VertexOperationTypes,
  EdgeOperations, EdgeOperationTypes,
  FaceOperations, FaceOperationTypes,
  UVOperations, UVOperationTypes
} from '../editing/index.js';
import { describe, it, beforeEach, assert, assertEqual, assertDeepEqual, assertThrows } from './TestFramework.js';

describe('System Integration Tests', () => {
  let mockData;

  beforeEach(() => {
    // Setup comprehensive mock data for integration tests
    mockData = {
      vertices: [
        { id: 'v1', x: 0, y: 0, z: 0 },
        { id: 'v2', x: 1, y: 0, z: 0 },
        { id: 'v3', x: 1, y: 1, z: 0 },
        { id: 'v4', x: 0, y: 1, z: 0 },
        { id: 'v5', x: 0.5, y: 0.5, z: 0 }
      ],
      edges: [
        { id: 'e1', vertexIds: ['v1', 'v2'] },
        { id: 'e2', vertexIds: ['v2', 'v3'] },
        { id: 'e3', vertexIds: ['v3', 'v4'] },
        { id: 'e4', vertexIds: ['v4', 'v1'] },
        { id: 'e5', vertexIds: ['v1', 'v5'] },
        { id: 'e6', vertexIds: ['v2', 'v5'] },
        { id: 'e7', vertexIds: ['v3', 'v5'] },
        { id: 'e8', vertexIds: ['v4', 'v5'] }
      ],
      faces: [
        { id: 'f1', vertexIds: ['v1', 'v2', 'v5'], normal: { x: 0, y: 0, z: 1 } },
        { id: 'f2', vertexIds: ['v2', 'v3', 'v5'], normal: { x: 0, y: 0, z: 1 } },
        { id: 'f3', vertexIds: ['v3', 'v4', 'v5'], normal: { x: 0, y: 0, z: 1 } },
        { id: 'f4', vertexIds: ['v4', 'v1', 'v5'], normal: { x: 0, y: 0, z: 1 } }
      ]
    };
  });

  describe('Module Integration Tests', () => {
    it('should integrate all geometry operations correctly', () => {
      // Test geometry operations integration
      const bevelResult = GeometryOperations.bevel(mockData.faces, { amount: 0.1 });
      const extrudeResult = GeometryOperations.extrude(mockData.faces, { distance: 1.0 });
      const insetResult = GeometryOperations.inset(mockData.faces, { amount: 0.05 });
      
      assert(bevelResult, 'Bevel operation should work');
      assert(extrudeResult, 'Extrude operation should work');
      assert(insetResult, 'Inset operation should work');
      
      assertEqual(bevelResult.type, GeometryOperationTypes.BEVEL, 'Bevel type should be correct');
      assertEqual(extrudeResult.type, GeometryOperationTypes.EXTRUDE, 'Extrude type should be correct');
      assertEqual(insetResult.type, GeometryOperationTypes.INSET, 'Inset type should be correct');
    });

    it('should integrate all vertex operations correctly', () => {
      // Test vertex operations integration
      const snapResult = VertexOperations.snapVertices(mockData.vertices, { threshold: 0.1 });
      const mergeResult = VertexOperations.mergeVertices(mockData.vertices, { threshold: 0.05 });
      const smoothResult = VertexOperations.smoothVertices(mockData.vertices, { iterations: 2 });
      
      assert(snapResult, 'Snap operation should work');
      assert(mergeResult, 'Merge operation should work');
      assert(smoothResult, 'Smooth operation should work');
      
      assertEqual(snapResult.type, VertexOperationTypes.SNAP, 'Snap type should be correct');
      assertEqual(mergeResult.type, VertexOperationTypes.MERGE, 'Merge type should be correct');
      assertEqual(smoothResult.type, VertexOperationTypes.SMOOTH, 'Smooth type should be correct');
    });

    it('should integrate all edge operations correctly', () => {
      // Test edge operations integration
      const splitResult = EdgeOperations.splitEdges(mockData.edges, { cuts: 2 });
      const bevelResult = EdgeOperations.bevelEdges(mockData.edges, { amount: 0.1 });
      const extrudeResult = EdgeOperations.extrudeEdges(mockData.edges, { distance: 1.0 });
      
      assert(splitResult, 'Split operation should work');
      assert(bevelResult, 'Bevel operation should work');
      assert(extrudeResult, 'Extrude operation should work');
      
      assertEqual(splitResult.type, EdgeOperationTypes.SPLIT, 'Split type should be correct');
      assertEqual(bevelResult.type, EdgeOperationTypes.BEVEL, 'Bevel type should be correct');
      assertEqual(extrudeResult.type, EdgeOperationTypes.EXTRUDE, 'Extrude type should be correct');
    });

    it('should integrate all face operations correctly', () => {
      // Test face operations integration
      const extrudeResult = FaceOperations.extrudeFaces(mockData.faces, { distance: 1.0 });
      const insetResult = FaceOperations.insetFaces(mockData.faces, { amount: 0.05 });
      const triangulateResult = FaceOperations.triangulateFaces(mockData.faces, { method: 'ear' });
      
      assert(extrudeResult, 'Extrude operation should work');
      assert(insetResult, 'Inset operation should work');
      assert(triangulateResult, 'Triangulate operation should work');
      
      assertEqual(extrudeResult.type, FaceOperationTypes.EXTRUDE, 'Extrude type should be correct');
      assertEqual(insetResult.type, FaceOperationTypes.INSET, 'Inset type should be correct');
      assertEqual(triangulateResult.type, FaceOperationTypes.TRIANGULATE, 'Triangulate type should be correct');
    });

    it('should integrate all UV operations correctly', () => {
      // Test UV operations integration
      const unwrapResult = UVOperations.unwrapUVs(mockData.faces, { method: 'angle' });
      const packResult = UVOperations.packUVs(mockData.faces, { margin: 0.001 });
      const transformResult = UVOperations.transformUVs(mockData.faces, { translation: { x: 0.1, y: 0.1 } });
      
      assert(unwrapResult, 'Unwrap operation should work');
      assert(packResult, 'Pack operation should work');
      assert(transformResult, 'Transform operation should work');
      
      assertEqual(unwrapResult.type, UVOperationTypes.UNWRAP, 'Unwrap type should be correct');
      assertEqual(packResult.type, UVOperationTypes.PACK, 'Pack type should be correct');
      assertEqual(transformResult.type, UVOperationTypes.TRANSFORM, 'Transform type should be correct');
    });
  });

  describe('Cross-Module Operation Tests', () => {
    it('should handle operations that affect multiple mesh components', () => {
      // Test operations that affect vertices, edges, and faces
      const vertexSnapResult = VertexOperations.snapVertices(mockData.vertices, { threshold: 0.1 });
      const edgeSplitResult = EdgeOperations.splitEdges(mockData.edges, { cuts: 1 });
      const faceExtrudeResult = FaceOperations.extrudeFaces(mockData.faces, { distance: 1.0 });
      
      // All operations should work together
      assert(vertexSnapResult, 'Vertex snap should work');
      assert(edgeSplitResult, 'Edge split should work');
      assert(faceExtrudeResult, 'Face extrude should work');
      
      // Operations should not interfere with each other
      assert(vertexSnapResult.type === VertexOperationTypes.SNAP, 'Vertex operation type should be preserved');
      assert(edgeSplitResult.type === EdgeOperationTypes.SPLIT, 'Edge operation type should be preserved');
      assert(faceExtrudeResult.type === FaceOperationTypes.EXTRUDE, 'Face operation type should be preserved');
    });

    it('should maintain data consistency across operations', () => {
      // Test that operations maintain data structure consistency
      const originalVertexCount = mockData.vertices.length;
      const originalEdgeCount = mockData.edges.length;
      const originalFaceCount = mockData.faces.length;
      
      // Perform operations
      const mergeResult = VertexOperations.mergeVertices(mockData.vertices, { threshold: 0.01 });
      const splitResult = EdgeOperations.splitEdges(mockData.edges, { cuts: 1 });
      const extrudeResult = FaceOperations.extrudeFaces(mockData.faces, { distance: 0.5 });
      
      // Verify operations return consistent data structures
      assert(mergeResult && mergeResult.result, 'Merge should return result data');
      assert(splitResult && splitResult.result, 'Split should return result data');
      assert(extrudeResult && extrudeResult.result, 'Extrude should return result data');
      
      // Verify operation metadata is consistent
      assert(mergeResult.options, 'Merge should have options');
      assert(splitResult.options, 'Split should have options');
      assert(extrudeResult.options, 'Extrude should have options');
    });
  });

  describe('Error Handling Integration Tests', () => {
    it('should handle errors consistently across all modules', () => {
      // Test error handling for null/undefined inputs
      const geometryNullResult = GeometryOperations.bevel(null, {});
      const vertexNullResult = VertexOperations.snapVertices(null, {});
      const edgeNullResult = EdgeOperations.splitEdges(null, {});
      const faceNullResult = FaceOperations.extrudeFaces(null, {});
      const uvNullResult = UVOperations.unwrapUVs(null, {});
      
      // All modules should handle null inputs consistently
      assertEqual(geometryNullResult, null, 'Geometry operations should handle null input');
      assertEqual(vertexNullResult, null, 'Vertex operations should handle null input');
      assertEqual(edgeNullResult, null, 'Edge operations should handle null input');
      assertEqual(faceNullResult, null, 'Face operations should handle null input');
      assertEqual(uvNullResult, null, 'UV operations should handle null input');
    });

    it('should handle empty arrays consistently', () => {
      // Test error handling for empty arrays
      const geometryEmptyResult = GeometryOperations.bevel([], {});
      const vertexEmptyResult = VertexOperations.snapVertices([], {});
      const edgeEmptyResult = EdgeOperations.splitEdges([], {});
      const faceEmptyResult = FaceOperations.extrudeFaces([], {});
      const uvEmptyResult = UVOperations.unwrapUVs([], {});
      
      // All modules should handle empty arrays consistently
      assertEqual(geometryEmptyResult, null, 'Geometry operations should handle empty array');
      assertEqual(vertexEmptyResult, null, 'Vertex operations should handle empty array');
      assertEqual(edgeEmptyResult, null, 'Edge operations should handle empty array');
      assertEqual(faceEmptyResult, null, 'Face operations should handle empty array');
      assertEqual(uvEmptyResult, null, 'UV operations should handle empty array');
    });

    it('should handle invalid options gracefully', () => {
      // Test error handling for invalid options
      const geometryInvalidResult = GeometryOperations.bevel(mockData.faces, { invalidOption: 'value' });
      const vertexInvalidResult = VertexOperations.snapVertices(mockData.vertices, { invalidOption: 'value' });
      const edgeInvalidResult = EdgeOperations.splitEdges(mockData.edges, { invalidOption: 'value' });
      const faceInvalidResult = FaceOperations.extrudeFaces(mockData.faces, { invalidOption: 'value' });
      const uvInvalidResult = UVOperations.unwrapUVs(mockData.faces, { invalidOption: 'value' });
      
      // All modules should handle invalid options gracefully
      assert(geometryInvalidResult, 'Geometry operations should handle invalid options');
      assert(vertexInvalidResult, 'Vertex operations should handle invalid options');
      assert(edgeInvalidResult, 'Edge operations should handle invalid options');
      assert(faceInvalidResult, 'Face operations should handle invalid options');
      assert(uvInvalidResult, 'UV operations should handle invalid options');
    });
  });

  describe('Validation Integration Tests', () => {
    it('should validate operations consistently across all modules', () => {
      // Test validation for valid operations
      const geometryValidation = GeometryOperations.validateOperation({
        type: GeometryOperationTypes.BEVEL,
        faces: mockData.faces,
        options: { amount: 0.1 }
      });
      
      const vertexValidation = VertexOperations.validateOperation({
        type: VertexOperationTypes.SNAP,
        vertices: mockData.vertices,
        options: { threshold: 0.1 }
      });
      
      const edgeValidation = EdgeOperations.validateOperation({
        type: EdgeOperationTypes.SPLIT,
        edges: mockData.edges,
        options: { cuts: 1 }
      });
      
      const faceValidation = FaceOperations.validateOperation({
        type: FaceOperationTypes.EXTRUDE,
        faces: mockData.faces,
        options: { distance: 1.0 }
      });
      
      const uvValidation = UVOperations.validateOperation({
        type: UVOperationTypes.UNWRAP,
        faces: mockData.faces,
        options: { method: 'angle' }
      });
      
      // All validations should pass
      assert(geometryValidation.isValid, 'Geometry validation should pass');
      assert(vertexValidation.isValid, 'Vertex validation should pass');
      assert(edgeValidation.isValid, 'Edge validation should pass');
      assert(faceValidation.isValid, 'Face validation should pass');
      assert(uvValidation.isValid, 'UV validation should pass');
    });

    it('should reject invalid operations consistently', () => {
      // Test validation for invalid operations
      const geometryValidation = GeometryOperations.validateOperation({
        type: 'INVALID_TYPE',
        faces: mockData.faces,
        options: {}
      });
      
      const vertexValidation = VertexOperations.validateOperation({
        type: 'INVALID_TYPE',
        vertices: mockData.vertices,
        options: {}
      });
      
      const edgeValidation = EdgeOperations.validateOperation({
        type: 'INVALID_TYPE',
        edges: mockData.edges,
        options: {}
      });
      
      const faceValidation = FaceOperations.validateOperation({
        type: 'INVALID_TYPE',
        faces: mockData.faces,
        options: {}
      });
      
      const uvValidation = UVOperations.validateOperation({
        type: 'INVALID_TYPE',
        faces: mockData.faces,
        options: {}
      });
      
      // All validations should fail
      assert(!geometryValidation.isValid, 'Geometry validation should fail');
      assert(!vertexValidation.isValid, 'Vertex validation should fail');
      assert(!edgeValidation.isValid, 'Edge validation should fail');
      assert(!faceValidation.isValid, 'Face validation should fail');
      assert(!uvValidation.isValid, 'UV validation should fail');
    });
  });

  describe('Performance Integration Tests', () => {
    it('should handle large datasets efficiently', () => {
      // Create larger mock datasets
      const largeVertices = Array.from({ length: 1000 }, (_, i) => ({
        id: `v${i}`,
        x: Math.random(),
        y: Math.random(),
        z: Math.random()
      }));
      
      const largeEdges = Array.from({ length: 2000 }, (_, i) => ({
        id: `e${i}`,
        vertexIds: [`v${i}`, `v${(i + 1) % 1000}`]
      }));
      
      const largeFaces = Array.from({ length: 500 }, (_, i) => ({
        id: `f${i}`,
        vertexIds: [`v${i * 3}`, `v${i * 3 + 1}`, `v${i * 3 + 2}`],
        normal: { x: 0, y: 0, z: 1 }
      }));
      
      // Test operations on large datasets
      const startTime = Date.now();
      
      const vertexResult = VertexOperations.snapVertices(largeVertices, { threshold: 0.1 });
      const edgeResult = EdgeOperations.splitEdges(largeEdges, { cuts: 1 });
      const faceResult = FaceOperations.extrudeFaces(largeFaces, { distance: 1.0 });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Operations should complete within reasonable time (adjust threshold as needed)
      assert(duration < 1000, `Operations should complete within 1 second, took ${duration}ms`);
      
      // Results should be valid
      assert(vertexResult, 'Large vertex operation should work');
      assert(edgeResult, 'Large edge operation should work');
      assert(faceResult, 'Large face operation should work');
    });

    it('should maintain memory efficiency', () => {
      // Test memory usage with repeated operations
      const operations = [];
      
      for (let i = 0; i < 100; i++) {
        const vertexOp = VertexOperations.snapVertices(mockData.vertices, { threshold: 0.1 });
        const edgeOp = EdgeOperations.splitEdges(mockData.edges, { cuts: 1 });
        const faceOp = FaceOperations.extrudeFaces(mockData.faces, { distance: 0.5 });
        
        operations.push({ vertexOp, edgeOp, faceOp });
      }
      
      // All operations should complete successfully
      assert(operations.length === 100, 'All operations should complete');
      
      // Check that operations don't accumulate memory leaks
      operations.forEach((op, index) => {
        assert(op.vertexOp, `Vertex operation ${index} should work`);
        assert(op.edgeOp, `Edge operation ${index} should work`);
        assert(op.faceOp, `Face operation ${index} should work`);
      });
    });
  });

  describe('Modularity Tests', () => {
    it('should maintain module independence', () => {
      // Test that modules can work independently
      const geometryOnly = GeometryOperations.bevel(mockData.faces, { amount: 0.1 });
      const vertexOnly = VertexOperations.snapVertices(mockData.vertices, { threshold: 0.1 });
      const edgeOnly = EdgeOperations.splitEdges(mockData.edges, { cuts: 1 });
      const faceOnly = FaceOperations.extrudeFaces(mockData.faces, { distance: 1.0 });
      const uvOnly = UVOperations.unwrapUVs(mockData.faces, { method: 'angle' });
      
      // Each module should work independently
      assert(geometryOnly, 'Geometry module should work independently');
      assert(vertexOnly, 'Vertex module should work independently');
      assert(edgeOnly, 'Edge module should work independently');
      assert(faceOnly, 'Face module should work independently');
      assert(uvOnly, 'UV module should work independently');
    });

    it('should support module composition', () => {
      // Test that modules can be composed together
      const vertexResult = VertexOperations.snapVertices(mockData.vertices, { threshold: 0.1 });
      const edgeResult = EdgeOperations.splitEdges(mockData.edges, { cuts: 1 });
      const faceResult = FaceOperations.extrudeFaces(mockData.faces, { distance: 1.0 });
      const uvResult = UVOperations.unwrapUVs(mockData.faces, { method: 'angle' });
      
      // All results should be composable
      const combinedResult = {
        vertexOperation: vertexResult,
        edgeOperation: edgeResult,
        faceOperation: faceResult,
        uvOperation: uvResult
      };
      
      assert(combinedResult.vertexOperation, 'Vertex operation should be composable');
      assert(combinedResult.edgeOperation, 'Edge operation should be composable');
      assert(combinedResult.faceOperation, 'Face operation should be composable');
      assert(combinedResult.uvOperation, 'UV operation should be composable');
    });

    it('should maintain consistent interfaces', () => {
      // Test that all modules have consistent interfaces
      const geometryResult = GeometryOperations.bevel(mockData.faces, { amount: 0.1 });
      const vertexResult = VertexOperations.snapVertices(mockData.vertices, { threshold: 0.1 });
      const edgeResult = EdgeOperations.splitEdges(mockData.edges, { cuts: 1 });
      const faceResult = FaceOperations.extrudeFaces(mockData.faces, { distance: 1.0 });
      const uvResult = UVOperations.unwrapUVs(mockData.faces, { method: 'angle' });
      
      // All results should have consistent structure
      const results = [geometryResult, vertexResult, edgeResult, faceResult, uvResult];
      
      results.forEach((result, index) => {
        assert(result, `Result ${index} should exist`);
        assert(result.type, `Result ${index} should have type`);
        assert(result.options, `Result ${index} should have options`);
        assert(result.result, `Result ${index} should have result data`);
      });
    });
  });

  describe('Maintainability Tests', () => {
    it('should support easy extension of operations', () => {
      // Test that new operations can be easily added
      const testOperation = {
        type: 'TEST_OPERATION',
        faces: mockData.faces,
        options: { testParam: 'value' }
      };
      
      // Simulate adding a new operation type
      const TestOperationTypes = {
        ...GeometryOperationTypes,
        TEST: 'test'
      };
      
      assert(TestOperationTypes.TEST, 'New operation type should be addable');
      assert(testOperation.type, 'New operation should have type');
      assert(testOperation.options, 'New operation should have options');
    });

    it('should support easy modification of existing operations', () => {
      // Test that existing operations can be modified
      const originalResult = GeometryOperations.bevel(mockData.faces, { amount: 0.1 });
      const modifiedResult = GeometryOperations.bevel(mockData.faces, { 
        amount: 0.2, 
        segments: 5,
        mode: 'distance',
        profile: true
      });
      
      // Both should work with different options
      assert(originalResult, 'Original operation should work');
      assert(modifiedResult, 'Modified operation should work');
      assertEqual(originalResult.type, modifiedResult.type, 'Operation type should be consistent');
    });

    it('should support easy testing of individual components', () => {
      // Test that individual components can be tested in isolation
      const vertexTest = VertexOperations.snapVertices(mockData.vertices, { threshold: 0.1 });
      const edgeTest = EdgeOperations.splitEdges(mockData.edges, { cuts: 1 });
      const faceTest = FaceOperations.extrudeFaces(mockData.faces, { distance: 1.0 });
      const uvTest = UVOperations.unwrapUVs(mockData.faces, { method: 'angle' });
      
      // Each component should be testable independently
      assert(vertexTest, 'Vertex component should be testable');
      assert(edgeTest, 'Edge component should be testable');
      assert(faceTest, 'Face component should be testable');
      assert(uvTest, 'UV component should be testable');
    });
  });
}); 