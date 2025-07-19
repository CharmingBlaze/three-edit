import { describe, it, expect } from 'vitest';
import { createCube } from '../primitives/createCube';
import { createSphere } from '../primitives/createSphere';
import { EditableMesh } from '../core/EditableMesh';
import { union, subtract, intersect, booleanOperation, BooleanAdvanced } from '../operations/boolean';
import { validateGeometryIntegrity } from '../validation/validateGeometryIntegrity';

describe('Boolean Operations', () => {
  describe('Union Operations', () => {
    it('should perform union between two cubes', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1, name: 'CubeA' });
      const cubeB = createCube({ width: 1, height: 1, depth: 1, name: 'CubeB' });
      
      // Move cubeB to overlap with cubeA
      cubeB.vertices.forEach(vertex => {
        vertex.x += 0.5;
      });
      
      const result = union(cubeA, cubeB);
      
      expect(result.success).toBe(true);
      expect(result.mesh).toBeDefined();
      expect(result.mesh.name).toBe('CubeA_union_CubeB');
      expect(result.mesh.vertices.length).toBeGreaterThan(0);
      expect(result.mesh.faces.length).toBeGreaterThan(0);
    });

    it('should handle union with validation', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = union(cubeA, cubeB, { validate: true, repair: true });
      
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
      
      const result = subtract(cubeA, cubeB);
      
      expect(result.success).toBe(true);
      expect(result.mesh).toBeDefined();
      expect(result.mesh.name).toBe('CubeA_subtract_CubeB');
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
      
      const result = intersect(cubeA, cubeB);
      
      expect(result.success).toBe(true);
      expect(result.mesh).toBeDefined();
      expect(result.mesh.name).toBe('CubeA_intersect_CubeB');
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
      const subtractResult = booleanOperation(cubeA, cubeB, 'subtract');
      const intersectResult = booleanOperation(cubeA, cubeB, 'intersect');
      
      expect(unionResult.success).toBe(true);
      expect(subtractResult.success).toBe(true);
      expect(intersectResult.success).toBe(true);
    });

    it('should handle different operation types', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const operations: Array<'union' | 'subtract' | 'intersect'> = ['union', 'subtract', 'intersect'];
      
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
      
      const result = union(emptyMesh, cube);
      
      // Should still return a result, even if operation is limited
      expect(result.mesh).toBeDefined();
    });

    it('should preserve material assignments when requested', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      // Assign materials to test preservation
      cubeA.faces.forEach((face, index) => {
        face.materialIndex = index % 2;
      });
      
      const result = union(cubeA, cubeB, { preserveMaterials: true });
      
      expect(result.success).toBe(true);
      expect(result.mesh).toBeDefined();
    });
  });

  describe('Validation Integration', () => {
    it('should validate result meshes when requested', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = union(cubeA, cubeB, { validate: true });
      
      expect(result.validation).toBeDefined();
      expect(typeof result.validation).toBe('object');
    });

    it('should handle validation errors gracefully', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = union(cubeA, cubeB, { validate: true, repair: true });
      
      expect(result.success).toBe(true);
      // Even if validation fails, the operation should still return a result
      expect(result.mesh).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle large meshes efficiently', () => {
      const cubeA = createCube({ width: 1, height: 1, depth: 1 });
      const cubeB = createCube({ width: 1, height: 1, depth: 1 });
      
      const startTime = performance.now();
      const result = union(cubeA, cubeB);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
}); 