import { describe, it, expect, beforeEach } from 'vitest';
import { EditableMesh } from '../core/EditableMesh';
import { createCube, createSphere } from '../primitives/index';
import { performCSGOperation } from '../operations/boolean/csgOperations';
import {
  csgUnion,
  csgIntersection,
  csgDifference,
  csgXOR
} from '../operations/advancedBoolean';
import { BooleanHistoryManager } from '../operations/boolean/history';
import { CSGOptions } from '../operations/boolean/types';

describe('CSG Operations', () => {
  let cube: EditableMesh;
  let sphere: EditableMesh;

  beforeEach(() => {
    cube = createCube({ width: 2, height: 2, depth: 2 });
    sphere = createSphere({ radius: 1, widthSegments: 8, heightSegments: 8 });
  });

  describe('performCSG', () => {
    it('should perform union operation', () => {
      const result = performCSGOperation(cube, sphere, 'union');
      
      expect(result.mesh).toBeInstanceOf(EditableMesh);
      expect(result.mesh.getFaceCount()).toBeGreaterThanOrEqual(cube.getFaceCount());
      expect(result.mesh.getVertexCount()).toBeGreaterThanOrEqual(cube.getVertexCount());
    });

    it('should perform intersection operation', () => {
      const result = performCSGOperation(cube, sphere, 'intersection');
      
      expect(result.mesh).toBeInstanceOf(EditableMesh);
      // Intersection should have fewer or equal faces than original
      expect(result.mesh.getFaceCount()).toBeLessThanOrEqual(cube.getFaceCount());
    });

    it('should perform difference operation', () => {
      const result = performCSGOperation(cube, sphere, 'difference');
      
      expect(result.mesh).toBeInstanceOf(EditableMesh);
      // Difference should have fewer or equal faces than original
      expect(result.mesh.getFaceCount()).toBeLessThanOrEqual(cube.getFaceCount());
    });

    it('should handle custom tolerance', () => {
      const options: CSGOptions = { tolerance: 0.01 };
      const result = performCSGOperation(cube, sphere, 'intersection', options);
      
      expect(result.mesh).toBeInstanceOf(EditableMesh);
    });

    it('should throw error for unknown operation', () => {
      const result = performCSGOperation(cube, sphere, 'unknown' as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown CSG operation: unknown');
    });
  });

  describe('csgUnion', () => {
    it('should perform union operation', () => {
      const result = csgUnion(cube, sphere);
      
      expect(result).toBeInstanceOf(EditableMesh);
      expect(result.getFaceCount()).toBeGreaterThanOrEqual(cube.getFaceCount());
    });

    it('should preserve mesh properties', () => {
      const result = csgUnion(cube, sphere);
      
      // Should preserve vertex properties
      for (let i = 0; i < Math.min(cube.getVertexCount(), result.getVertexCount()); i++) {
        const originalVertex = cube.getVertex(i);
        const resultVertex = result.getVertex(i);
        if (originalVertex && resultVertex) {
          expect(resultVertex.x).toBeCloseTo(originalVertex.x, 3);
          expect(resultVertex.y).toBeCloseTo(originalVertex.y, 3);
          expect(resultVertex.z).toBeCloseTo(originalVertex.z, 3);
        }
      }
    });
  });

  describe('csgIntersection', () => {
    it('should perform intersection operation', () => {
      const result = csgIntersection(cube, sphere);
      
      expect(result).toBeInstanceOf(EditableMesh);
      expect(result.getFaceCount()).toBeLessThanOrEqual(cube.getFaceCount());
    });

    it('should handle overlapping meshes', () => {
      // Create overlapping cubes
      const cube1 = createCube({ width: 2, height: 2, depth: 2 });
      const cube2 = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = csgIntersection(cube1, cube2);
      
      expect(result).toBeInstanceOf(EditableMesh);
    });
  });

  describe('csgDifference', () => {
    it('should perform difference operation', () => {
      const result = csgDifference(cube, sphere);
      
      expect(result).toBeInstanceOf(EditableMesh);
      expect(result.getFaceCount()).toBeLessThanOrEqual(cube.getFaceCount());
    });

    it('should handle non-overlapping meshes', () => {
      // Create non-overlapping cubes
      const cube1 = createCube({ width: 2, height: 2, depth: 2 });
      const cube2 = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = csgDifference(cube1, cube2);
      
      expect(result).toBeInstanceOf(EditableMesh);
    });
  });

  describe('csgXOR', () => {
    it('should perform XOR operation', () => {
      const result = csgXOR(cube, sphere);
      
      expect(result).toBeInstanceOf(EditableMesh);
    });

    it('should handle XOR with overlapping meshes', () => {
      const cube1 = createCube({ width: 2, height: 2, depth: 2 });
      const cube2 = createCube({ width: 1, height: 1, depth: 1 });
      
      const result = csgXOR(cube1, cube2);
      
      expect(result).toBeInstanceOf(EditableMesh);
    });

    it('should handle XOR operation failures gracefully', () => {
      // Create a mesh that might cause XOR to fail
      const emptyMesh = new EditableMesh();
      const result = csgXOR(emptyMesh, cube);
      
      expect(result).toBeInstanceOf(EditableMesh);
    });
  });

  describe('Boolean History', () => {
    it('should manage boolean operation history', () => {
      const history = new BooleanHistoryManager();
      
      // Add some operations
      history.addEntry({
        operation: 'union',
        originalMesh: cube.clone(),
        resultMesh: csgUnion(cube, sphere),
        options: { tolerance: 0.001 }
      });

      expect(history.getHistory()).toHaveLength(1);
      expect(history.getLastOperation()?.operation).toBe('union');
    });

    it('should support undo operations', () => {
      const history = new BooleanHistoryManager();
      const originalMesh = cube.clone();
      
      history.addEntry({
        operation: 'union',
        originalMesh: originalMesh,
        resultMesh: csgUnion(cube, sphere),
        options: { tolerance: 0.001 }
      });

      const undoneMesh = history.undo();
      expect(undoneMesh).toBeInstanceOf(EditableMesh);
      expect(history.getHistory()).toHaveLength(0);
    });

    it('should limit history size', () => {
      const history = new BooleanHistoryManager(2);
      
      // Add more operations than the limit
      for (let i = 0; i < 5; i++) {
        history.addEntry({
          operation: 'union',
          originalMesh: cube.clone(),
          resultMesh: csgUnion(cube, sphere),
          options: { tolerance: 0.001 }
        });
      }

      expect(history.getHistory()).toHaveLength(2);
    });

    it('should clear history', () => {
      const history = new BooleanHistoryManager();
      
      history.addEntry({
        operation: 'union',
        originalMesh: cube.clone(),
        resultMesh: csgUnion(cube, sphere),
        options: { tolerance: 0.001 }
      });

      history.clearHistory();
      expect(history.getHistory()).toHaveLength(0);
    });
  });

  describe('CSG Edge Cases', () => {
    it('should handle empty meshes', () => {
      const emptyMesh = new EditableMesh();
      
      const result = performCSGOperation(emptyMesh, cube, 'union');
      expect(result.mesh).toBeInstanceOf(EditableMesh);
    });

    it('should handle identical meshes', () => {
      const cube1 = cube.clone();
      const cube2 = cube.clone();
      
      const result = performCSGOperation(cube1, cube2, 'union');
      expect(result.mesh).toBeInstanceOf(EditableMesh);
    });

    it('should handle meshes with different vertex counts', () => {
      const smallCube = createCube({ width: 1, height: 1, depth: 1 });
      const largeCube = createCube({ width: 3, height: 3, depth: 3 });
      
      const result = performCSGOperation(smallCube, largeCube, 'union');
      expect(result.mesh).toBeInstanceOf(EditableMesh);
    });

    it('should preserve material indices', () => {
      // Create meshes with different material indices
      const cube1 = cube.clone();
      const cube2 = cube.clone();
      
      // Set material indices
      cube1.faces.forEach(face => face.materialIndex = 0);
      cube2.faces.forEach(face => face.materialIndex = 1);
      
      const result = performCSGOperation(cube1, cube2, 'union');
      expect(result.mesh).toBeInstanceOf(EditableMesh);
      
      // Check that material indices are preserved
      let hasMaterial0 = false;
      let hasMaterial1 = false;
      
      for (let i = 0; i < result.mesh.getFaceCount(); i++) {
        const face = result.mesh.getFace(i);
        if (face) {
          if (face.materialIndex === 0) hasMaterial0 = true;
          if (face.materialIndex === 1) hasMaterial1 = true;
        }
      }
      
      expect(hasMaterial0 || hasMaterial1).toBe(true);
    });
  });

  describe('CSG Performance', () => {
    it('should handle large meshes efficiently', () => {
      const largeCube = createCube({ width: 4, height: 4, depth: 4 });
      const largeSphere = createSphere({ 
        radius: 2, 
        widthSegments: 16, 
        heightSegments: 16 
      });
      
      const startTime = performance.now();
      const result = performCSGOperation(largeCube, largeSphere, 'union');
      const endTime = performance.now();
      
      expect(result.mesh).toBeInstanceOf(EditableMesh);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle complex operations efficiently', () => {
      const cube1 = createCube({ width: 2, height: 2, depth: 2 });
      const cube2 = createCube({ width: 1, height: 1, depth: 1 });
      const sphere = createSphere({ radius: 0.5, widthSegments: 8, heightSegments: 8 });
      
      const startTime = performance.now();
      
      // Perform multiple operations
      const unionResult = performCSGOperation(cube1, cube2, 'union');
      const intersectionResult = performCSGOperation(unionResult.mesh, sphere, 'intersection');
      const differenceResult = performCSGOperation(intersectionResult.mesh, cube2, 'difference');
      
      const endTime = performance.now();
      
      expect(differenceResult.mesh).toBeInstanceOf(EditableMesh);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });
}); 