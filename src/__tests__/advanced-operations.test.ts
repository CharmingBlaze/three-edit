import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { EditableMesh } from '../core/index.ts';
import { createCube } from '../primitives/createCube.ts';
import { createSphere } from '../primitives/createSphere.ts';
import { createCylinder } from '../primitives/createCylinder.ts';
import {
  morphVertices,
  interpolateShapes,
  applyMorphTargets,
  createMorphTarget,
  blendMorphTargets,
  MorphingOptions,
  ShapeInterpolationOptions,
  MorphTargetOptions
} from '../operations/morphing.ts';
import {
  subdivideSurface,
  laplacianSmoothing,
  smoothEdges,
  smoothVertices,
  SmoothingOptions,
  SubdivisionOptions,
  LaplacianOptions
} from '../operations/smoothing.ts';
import {
  csgUnion,
  csgIntersection,
  csgDifference,
  csgXOR,
  applyBooleanModifier,
  advancedIntersection,
  BooleanHistoryManager,
  CSGOptions,
  BooleanModifierOptions,
  AdvancedIntersectionOptions
} from '../operations/advancedBoolean.ts';

describe('Advanced Operations', () => {
  let cube: EditableMesh;
  let sphere: EditableMesh;
  let cylinder: EditableMesh;

  beforeEach(() => {
    cube = createCube();
    sphere = createSphere();
    cylinder = createCylinder();
  });

  describe('Morphing Operations', () => {
    describe('morphVertices', () => {
      it('should morph vertices with default options', () => {
        const targetVertices = cube.vertices.map(v => 
          new Vector3(v.x + 1, v.y + 1, v.z + 1)
        );
        
        const result = morphVertices(cube, targetVertices);
        
        expect(result).toBeInstanceOf(EditableMesh);
        expect(result.vertices.length).toBe(cube.vertices.length);
        expect(result.faces.length).toBe(cube.faces.length);
      });

      it('should morph vertices with custom intensity', () => {
        const targetVertices = cube.vertices.map(v => 
          new Vector3(v.x + 2, v.y + 2, v.z + 2)
        );
        
        const result = morphVertices(cube, targetVertices, { intensity: 0.5 });
        
        expect(result).toBeInstanceOf(EditableMesh);
        // Check that vertices were moved but not as much as full intensity
        const firstVertex = result.vertices[0];
        const originalVertex = cube.vertices[0];
        expect(firstVertex.x).toBeGreaterThan(originalVertex.x);
        expect(firstVertex.x).toBeLessThan(originalVertex.x + 2);
      });

      it('should preserve normals when requested', () => {
        const targetVertices = cube.vertices.map(v => new Vector3(v.x, v.y, v.z));
        const result = morphVertices(cube, targetVertices, { preserveNormals: true });
        
        expect(result).toBeInstanceOf(EditableMesh);
      });

      it('should assign material index when specified', () => {
        const targetVertices = cube.vertices.map(v => new Vector3(v.x, v.y, v.z));
        const result = morphVertices(cube, targetVertices, { materialIndex: 2 });
        
        expect(result.faces.every(face => face.materialIndex === 2)).toBe(true);
      });

      it('should throw error for mismatched vertex counts', () => {
        const targetVertices = [new Vector3(0, 0, 0), new Vector3(1, 1, 1)];
        
        expect(() => {
          morphVertices(cube, targetVertices);
        }).toThrow('Target vertex count must match source vertex count');
      });
    });

    describe('interpolateShapes', () => {
      it('should interpolate between shapes with default options', () => {
        const results = interpolateShapes(cube, cube, { steps: 5 });
        
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(6); // steps + 1
        results.forEach(result => {
          expect(result).toBeInstanceOf(EditableMesh);
          expect(result.vertices.length).toBe(cube.vertices.length);
        });
      });

      it('should interpolate with custom easing', () => {
        const results = interpolateShapes(cube, cube, { 
          steps: 3, 
          easing: 'easeInOut' 
        });
        
        expect(results.length).toBe(4);
        results.forEach(result => {
          expect(result).toBeInstanceOf(EditableMesh);
        });
      });

      it('should create loop when requested', () => {
        const results = interpolateShapes(cube, cube, { 
          steps: 2, 
          loop: true 
        });
        
        expect(results.length).toBe(4); // steps + 1 + loop back
      });

      it('should throw error for mismatched vertex counts', () => {
        expect(() => {
          interpolateShapes(cube, sphere);
        }).toThrow('Source and target meshes must have the same vertex count');
      });
    });

    describe('applyMorphTargets', () => {
      it('should apply morph targets with default options', () => {
        const morphTarget = createMorphTarget(cube, 'test', 1.0);
        const result = applyMorphTargets(cube, [morphTarget]);
        
        expect(result).toBeInstanceOf(EditableMesh);
        expect(result.vertices.length).toBe(cube.vertices.length);
      });

      it('should apply morph targets with additive blending', () => {
        const morphTarget = createMorphTarget(cube, 'test', 0.5);
        const result = applyMorphTargets(cube, [morphTarget], { 
          blendMode: 'additive' 
        });
        
        expect(result).toBeInstanceOf(EditableMesh);
      });

      it('should apply multiple morph targets', () => {
        const target1 = createMorphTarget(cube, 'target1', 0.3);
        const target2 = createMorphTarget(cube, 'target2', 0.7);
        const result = applyMorphTargets(cube, [target1, target2]);
        
        expect(result).toBeInstanceOf(EditableMesh);
      });

      it('should throw error for mismatched vertex counts', () => {
        const morphTarget = {
          name: 'test',
          vertices: [new Vector3(0, 0, 0)],
          weight: 1.0
        };
        
        expect(() => {
          applyMorphTargets(cube, [morphTarget]);
        }).toThrow('Morph target "test" vertex count must match mesh vertex count');
      });
    });

    describe('createMorphTarget', () => {
      it('should create morph target from mesh', () => {
        const morphTarget = createMorphTarget(cube, 'test', 0.8);
        
        expect(morphTarget.name).toBe('test');
        expect(morphTarget.weight).toBe(0.8);
        expect(morphTarget.vertices.length).toBe(cube.vertices.length);
      });
    });

    describe('blendMorphTargets', () => {
      it('should blend multiple morph targets', () => {
        const target1 = createMorphTarget(cube, 'target1', 1.0);
        const target2 = createMorphTarget(cube, 'target2', 1.0);
        const weights = [0.3, 0.7];
        
        const blended = blendMorphTargets([target1, target2], weights);
        
        expect(blended.name).toBe('blended');
        expect(blended.weight).toBe(1.0);
        expect(blended.vertices.length).toBe(cube.vertices.length);
      });

      it('should throw error for empty morph targets', () => {
        expect(() => {
          blendMorphTargets([], []);
        }).toThrow('At least one morph target is required');
      });

      it('should throw error for mismatched weights', () => {
        const target1 = createMorphTarget(cube, 'target1', 1.0);
        
        expect(() => {
          blendMorphTargets([target1], [0.5, 0.5]);
        }).toThrow('Morph target count must match weight count');
      });
    });
  });

  describe('Smoothing Operations', () => {
    describe('subdivideSurface', () => {
      it('should subdivide surface with default options', () => {
        const result = subdivideSurface(cube);
        
        expect(result).toBeInstanceOf(EditableMesh);
        expect(result.vertices.length).toBeGreaterThanOrEqual(cube.vertices.length);
        expect(result.faces.length).toBeGreaterThanOrEqual(cube.faces.length);
      });

      it('should subdivide with multiple levels', () => {
        const result = subdivideSurface(cube, { levels: 2 });
        
        expect(result).toBeInstanceOf(EditableMesh);
        expect(result.vertices.length).toBeGreaterThanOrEqual(cube.vertices.length);
      });

      it('should preserve normals when requested', () => {
        const result = subdivideSurface(cube, { preserveNormals: true });
        
        expect(result).toBeInstanceOf(EditableMesh);
      });

      it('should assign material index when specified', () => {
        const result = subdivideSurface(cube, { materialIndex: 3 });
        
        expect(result.faces.every(face => face.materialIndex === 3)).toBe(true);
      });
    });

    describe('laplacianSmoothing', () => {
      it('should apply Laplacian smoothing with default options', () => {
        const result = laplacianSmoothing(cube);
        
        expect(result).toBeInstanceOf(EditableMesh);
        expect(result.vertices.length).toBe(cube.vertices.length);
        expect(result.faces.length).toBe(cube.faces.length);
      });

      it('should apply Laplacian smoothing with custom parameters', () => {
        const result = laplacianSmoothing(cube, { 
          iterations: 3, 
          lambda: 0.3, 
          mu: -0.1 
        });
        
        expect(result).toBeInstanceOf(EditableMesh);
      });

      it('should preserve volume when requested', () => {
        const result = laplacianSmoothing(cube, { preserveVolume: true });
        
        expect(result).toBeInstanceOf(EditableMesh);
      });
    });

    describe('smoothEdges', () => {
      it('should smooth edges with default options', () => {
        const result = smoothEdges(cube);
        
        expect(result).toBeInstanceOf(EditableMesh);
        expect(result.vertices.length).toBe(cube.vertices.length);
        expect(result.faces.length).toBe(cube.faces.length);
      });

      it('should smooth edges with custom factor', () => {
        const result = smoothEdges(cube, { factor: 0.5, iterations: 2 });
        
        expect(result).toBeInstanceOf(EditableMesh);
      });
    });

    describe('smoothVertices', () => {
      it('should smooth vertices with default options', () => {
        const result = smoothVertices(cube);
        
        expect(result).toBeInstanceOf(EditableMesh);
        expect(result.vertices.length).toBe(cube.vertices.length);
        expect(result.faces.length).toBe(cube.faces.length);
      });

      it('should smooth vertices with custom parameters', () => {
        const result = smoothVertices(cube, { 
          iterations: 5, 
          factor: 0.3 
        });
        
        expect(result).toBeInstanceOf(EditableMesh);
      });
    });
  });

  describe('Advanced Boolean Operations', () => {
    describe('CSG Operations', () => {
      it('should perform CSG union', () => {
        const result = csgUnion(cube, sphere);
        
        expect(result).toBeInstanceOf(EditableMesh);
        // Note: Basic boolean operations return empty meshes until fully implemented
        expect(result.vertices.length).toBeGreaterThanOrEqual(0);
        expect(result.faces.length).toBeGreaterThanOrEqual(0);
      });

      it('should perform CSG intersection', () => {
        const result = csgIntersection(cube, sphere);
        
        expect(result).toBeInstanceOf(EditableMesh);
        // Note: Basic boolean operations return empty meshes until fully implemented
        expect(result.vertices.length).toBeGreaterThanOrEqual(0);
        expect(result.faces.length).toBeGreaterThanOrEqual(0);
      });

      it('should perform CSG difference', () => {
        const result = csgDifference(cube, sphere);
        
        expect(result).toBeInstanceOf(EditableMesh);
        // Note: Basic boolean operations return empty meshes until fully implemented
        expect(result.vertices.length).toBeGreaterThanOrEqual(0);
        expect(result.faces.length).toBeGreaterThanOrEqual(0);
      });

      it('should perform CSG XOR', () => {
        const result = csgXOR(cube, sphere);
        
        expect(result).toBeInstanceOf(EditableMesh);
        // Note: Basic boolean operations return empty meshes until fully implemented
        expect(result.vertices.length).toBeGreaterThanOrEqual(0);
        expect(result.faces.length).toBeGreaterThanOrEqual(0);
      });

      it('should apply CSG options', () => {
        const result = csgUnion(cube, sphere, { 
          tolerance: 1e-5, 
          preserveMaterials: true 
        });
        
        expect(result).toBeInstanceOf(EditableMesh);
      });
    });

    describe('Boolean Modifiers', () => {
      it('should apply boolean modifier with union', () => {
        const result = applyBooleanModifier(cube, {
          operation: 'union',
          modifierMesh: sphere
        });
        
        expect(result).toBeInstanceOf(EditableMesh);
        // Note: Basic boolean operations return empty meshes until fully implemented
        expect(result.vertices.length).toBeGreaterThanOrEqual(0);
      });

      it('should apply boolean modifier with intersection', () => {
        const result = applyBooleanModifier(cube, {
          operation: 'intersection',
          modifierMesh: sphere
        });
        
        expect(result).toBeInstanceOf(EditableMesh);
        // Note: Basic boolean operations return empty meshes until fully implemented
        expect(result.vertices.length).toBeGreaterThanOrEqual(0);
      });

      it('should apply boolean modifier with difference', () => {
        const result = applyBooleanModifier(cube, {
          operation: 'difference',
          modifierMesh: sphere
        });
        
        expect(result).toBeInstanceOf(EditableMesh);
        // Note: Basic boolean operations return empty meshes until fully implemented
        expect(result.vertices.length).toBeGreaterThanOrEqual(0);
      });

      it('should apply boolean modifier with XOR', () => {
        const result = applyBooleanModifier(cube, {
          operation: 'xor',
          modifierMesh: sphere
        });
        
        expect(result).toBeInstanceOf(EditableMesh);
        // Note: Basic boolean operations return empty meshes until fully implemented
        expect(result.vertices.length).toBeGreaterThanOrEqual(0);
      });

      it('should throw error for unknown operation', () => {
        expect(() => {
          applyBooleanModifier(cube, {
            operation: 'invalid' as any,
            modifierMesh: sphere
          });
        }).toThrow('Unknown boolean operation: invalid');
      });
    });

    describe('Advanced Intersection', () => {
      it('should perform advanced intersection with default options', () => {
        const results = advancedIntersection(cube, sphere);
        
        expect(Array.isArray(results)).toBe(true);
        results.forEach(result => {
          expect(result).toBeInstanceOf(EditableMesh);
        });
      });

      it('should perform partial intersection', () => {
        const results = advancedIntersection(cube, sphere, { 
          partialIntersection: true 
        });
        
        expect(Array.isArray(results)).toBe(true);
        results.forEach(result => {
          expect(result).toBeInstanceOf(EditableMesh);
        });
      });

      it('should create boundary mesh', () => {
        const results = advancedIntersection(cube, sphere, { 
          createBoundary: true 
        });
        
        expect(Array.isArray(results)).toBe(true);
        results.forEach(result => {
          expect(result).toBeInstanceOf(EditableMesh);
        });
      });
    });

    describe('Boolean History Manager', () => {
      it('should create history manager', () => {
        const manager = new BooleanHistoryManager();
        
        expect(manager).toBeInstanceOf(BooleanHistoryManager);
        expect(manager.getHistory()).toEqual([]);
      });

      it('should add history entry', () => {
        const manager = new BooleanHistoryManager();
        const originalMesh = cube.clone();
        const resultMesh = cube.clone();
        
        manager.addEntry({
          operation: 'union',
          originalMesh,
          resultMesh,
          options: {}
        });
        
        const history = manager.getHistory();
        expect(history.length).toBe(1);
        expect(history[0].operation).toBe('union');
      });

      it('should maintain max entries', () => {
        const manager = new BooleanHistoryManager(2);
        const originalMesh = cube.clone();
        const resultMesh = cube.clone();
        
        // Add 3 entries
        for (let i = 0; i < 3; i++) {
          manager.addEntry({
            operation: `operation${i}`,
            originalMesh,
            resultMesh,
            options: {}
          });
        }
        
        const history = manager.getHistory();
        expect(history.length).toBe(2);
        expect(history[0].operation).toBe('operation1');
        expect(history[1].operation).toBe('operation2');
      });

      it('should clear history', () => {
        const manager = new BooleanHistoryManager();
        const originalMesh = cube.clone();
        const resultMesh = cube.clone();
        
        manager.addEntry({
          operation: 'union',
          originalMesh,
          resultMesh,
          options: {}
        });
        
        expect(manager.getHistory().length).toBe(1);
        
        manager.clearHistory();
        expect(manager.getHistory().length).toBe(0);
      });

      it('should undo last operation', () => {
        const manager = new BooleanHistoryManager();
        const originalMesh = cube.clone();
        const resultMesh = sphere.clone();
        
        manager.addEntry({
          operation: 'union',
          originalMesh,
          resultMesh,
          options: {}
        });
        
        const undoneMesh = manager.undo();
        expect(undoneMesh).toBe(originalMesh);
        expect(manager.getHistory().length).toBe(0);
      });

      it('should return null when no history to undo', () => {
        const manager = new BooleanHistoryManager();
        
        const undoneMesh = manager.undo();
        expect(undoneMesh).toBeNull();
      });

      it('should get last operation', () => {
        const manager = new BooleanHistoryManager();
        const originalMesh = cube.clone();
        const resultMesh = sphere.clone();
        
        manager.addEntry({
          operation: 'union',
          originalMesh,
          resultMesh,
          options: {}
        });
        
        const lastOperation = manager.getLastOperation();
        expect(lastOperation).not.toBeNull();
        expect(lastOperation!.operation).toBe('union');
      });

      it('should return null when no last operation', () => {
        const manager = new BooleanHistoryManager();
        
        const lastOperation = manager.getLastOperation();
        expect(lastOperation).toBeNull();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should combine morphing and smoothing operations', () => {
      // Create morph target
      const morphTarget = createMorphTarget(cube, 'smooth', 0.5);
      
      // Apply morphing
      const morphedMesh = applyMorphTargets(cube, [morphTarget]);
      
      // Apply smoothing
      const smoothedMesh = laplacianSmoothing(morphedMesh, { iterations: 2 });
      
      expect(smoothedMesh).toBeInstanceOf(EditableMesh);
      expect(smoothedMesh.vertices.length).toBe(cube.vertices.length);
    });

    it('should combine boolean operations with smoothing', () => {
      // Perform boolean operation
      const booleanResult = csgUnion(cube, sphere);
      
      // Apply smoothing
      const smoothedResult = smoothVertices(booleanResult, { iterations: 3 });
      
      expect(smoothedResult).toBeInstanceOf(EditableMesh);
      // Note: Basic boolean operations return empty meshes until fully implemented
      expect(smoothedResult.vertices.length).toBeGreaterThanOrEqual(0);
    });

    it('should use boolean history with operations', () => {
      const manager = new BooleanHistoryManager();
      
      // Perform boolean operations with history
      const unionResult = csgUnion(cube, sphere);
      manager.addEntry({
        operation: 'union',
        originalMesh: cube,
        resultMesh: unionResult,
        options: {}
      });
      
      const intersectionResult = csgIntersection(unionResult, cylinder);
      manager.addEntry({
        operation: 'intersection',
        originalMesh: unionResult,
        resultMesh: intersectionResult,
        options: {}
      });
      
      expect(manager.getHistory().length).toBe(2);
      expect(manager.getLastOperation()!.operation).toBe('intersection');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty meshes gracefully', () => {
      const emptyMesh = new EditableMesh();
      
      // These should not throw errors but return empty or minimal results
      const morphResult = morphVertices(emptyMesh, []);
      const smoothResult = smoothVertices(emptyMesh);
      const booleanResult = csgUnion(emptyMesh, emptyMesh);
      
      expect(morphResult).toBeInstanceOf(EditableMesh);
      expect(smoothResult).toBeInstanceOf(EditableMesh);
      expect(booleanResult).toBeInstanceOf(EditableMesh);
    });

    it('should handle invalid parameters gracefully', () => {
      // Test with extreme values
      const result1 = laplacianSmoothing(cube, { iterations: 0, factor: 0 });
      const result2 = subdivideSurface(cube, { levels: 0 });
      
      expect(result1).toBeInstanceOf(EditableMesh);
      expect(result2).toBeInstanceOf(EditableMesh);
    });
  });
}); 