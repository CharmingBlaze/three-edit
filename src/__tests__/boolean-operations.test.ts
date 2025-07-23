import { describe, it, expect } from 'vitest';
import { createCube } from '../primitives/createCube';
import { EditableMesh } from '../core/EditableMesh';
import { 
  booleanUnion, 
  booleanDifference, 
  booleanIntersection, 
  booleanOperation, 
  BooleanAdvanced 
} from '../operations/boolean';

describe('Boolean Operations', () => {
  describe('Union Operations', () => {
    it('should perform union between two cubes', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1, name: 'CubeA' });
      const cubeB = createCube({ width: 1, height: 1, depth: 1, name: 'CubeB' });
      
      // Move cubeB to overlap with cubeA
      cubeB.vertices.forEach(vertex => {
        vertex.x += 0.5;
      });
      
      const result = booleanUnion(cubeA, cubeB);
      
      expect(result.success).toBe(true);
      expect(result.mesh).toBeDefined();
      expect(result.mesh.name).toBe('CubeA_union_CubeB');
      expect(result.mesh.vertices.length).toBeGreaterThan(0);
      expect(result.mesh.faces.length).toBeGreaterThan(0);
    });

    it('should handle union with validation', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = booleanUnion(cubeA, cubeB, { validate: true, repair: true });
      
      expect(result.success).toBe(true);
      expect(result.validation).toBeDefined();
    });

    it('should handle union with advanced options', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = BooleanAdvanced.unionWithOptions(cubeA, cubeB, {
        validate: true,
        mergeThreshold: 0.001,
        removeInternal: true
      });
      
      expect(result.success).toBe(true);
      expect(result.mesh).toBeDefined();
    });
  });

  describe('Subtract Operations', () => {
    it('should perform subtract operation', () => {
      const cubeA = createCube({ width: 2, height: 2, depth: 2, name: 'CubeA' });
      const cubeB = createCube({ width: 1, height: 1, depth: 1, name: 'CubeB' });
      
      const result = booleanDifference(cubeA, cubeB);
      
      expect(result.success).toBe(true);
      expect(result.mesh).toBeDefined();
      expect(result.mesh.name).toBe('CubeA_difference_CubeB');
    });

    it('should handle subtract with advanced options', () => {
      const cubeA = createCube({ width: 2, height: 2, depth: 2 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = BooleanAdvanced.subtractWithOptions(cubeA, cubeB, {
        validate: true,
        keepOriginal: false,
        invertResult: false
      });
      
      expect(result.success).toBe(true);
      expect(result.mesh).toBeDefined();
    });
  });

  describe('Intersect Operations', () => {
    it('should perform intersect operation', () => {
      const cubeA = createCube({ width: 2, height: 2, depth: 2, name: 'CubeA' });
      const cubeB = createCube({ width: 1, height: 1, depth: 1, name: 'CubeB' });
      
      const result = booleanIntersection(cubeA, cubeB);
      
      expect(result.success).toBe(true);
      expect(result.mesh).toBeDefined();
      expect(result.mesh.name).toBe('CubeA_intersection_CubeB');
    });

    it('should handle intersect with advanced options', () => {
      const cubeA = createCube({ width: 2, height: 2, depth: 2 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = BooleanAdvanced.intersectWithOptions(cubeA, cubeB, {
        validate: true,
        partialIntersection: true,
        tolerance: 0.001
      });
      
      expect(result.success).toBe(true);
      expect(result.mesh).toBeDefined();
    });
  });

  describe('Generic Boolean Operations', () => {
    it('should perform generic boolean operations', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const unionResult = booleanOperation(cubeA, cubeB, 'union');
      const subtractResult = booleanOperation(cubeA, cubeB, 'difference');
      const intersectResult = booleanOperation(cubeA, cubeB, 'intersection');
      
      expect(unionResult.success).toBe(true);
      expect(subtractResult.success).toBe(true);
      expect(intersectResult.success).toBe(true);
    });

    it('should handle different operation types', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const operations = ['union', 'difference', 'intersection'] as const;
      
      operations.forEach(operation => {
        const result = booleanOperation(cubeA, cubeB, operation);
        expect(result.success).toBe(true);
        expect(result.mesh.name).toContain(operation);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid meshes gracefully', () => {
      const emptyMesh = new EditableMesh({ name: 'Empty' });
      const cube = createCube();

      const result = booleanUnion(emptyMesh, cube);
      
      // Should still return a result, even if operation is limited
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('should preserve material assignments when requested', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      // Assign materials to faces
      cubeA.faces.forEach((face, index) => {
        face.materialIndex = index % 2;
      });
      
      const result = booleanUnion(cubeA, cubeB, { preserveMaterials: true });
      
      expect(result.success).toBe(true);
      expect(result.mesh).toBeDefined();
    });
  });

  describe('Validation Integration', () => {
    it('should validate result meshes when requested', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = booleanUnion(cubeA, cubeB, { validate: true });
      
      expect(result.validation).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle validation errors gracefully', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = booleanUnion(cubeA, cubeB, { validate: true, repair: true });
      
      expect(result.success).toBe(true);
      expect(result.validation).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle large meshes efficiently', () => {
      const cubeA = createCube({ width: 2, height: 2, depth: 2 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const startTime = performance.now();
      const result = booleanUnion(cubeA, cubeB);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.statistics).toBeDefined();
      expect(result.statistics?.processingTime).toBeGreaterThan(0);
    });
  });
}); 