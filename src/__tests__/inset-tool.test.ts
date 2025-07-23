import { describe, it, expect, beforeEach } from 'vitest';
import { EditableMesh } from '../core/EditableMesh';
import { createCube, createSphere } from '../primitives/index';
import { 
  insetFaces, 
  insetAllFaces, 
  insetIndividualFaces,
  InsetOptions,
  InsetResult 
} from '../editing/inset';

describe('Inset Tool', () => {
  let cube: EditableMesh;
  let sphere: EditableMesh;

  beforeEach(() => {
    cube = createCube({ width: 2, height: 2, depth: 2 });
    sphere = createSphere({ radius: 1, widthSegments: 8, heightSegments: 8 });
  });

  describe('insetFaces', () => {
    it('should perform basic inset on cube face', () => {
      const faceIndices = [0]; // First face of cube
      const result = insetFaces(cube, faceIndices, { distance: 0.2 });

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
      expect(result.facesCreated).toBeGreaterThan(0);
      expect(result.statistics).toBeDefined();
      expect(result.statistics!.outputVertices).toBeGreaterThan(result.statistics!.inputVertices);
    });

    it('should handle multiple faces', () => {
      const faceIndices = [0, 1, 2]; // Multiple faces
      const result = insetFaces(cube, faceIndices, { distance: 0.1 });

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
      expect(result.facesCreated).toBeGreaterThan(0);
    });

    it('should handle empty face selection', () => {
      const result = insetFaces(cube, []);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No faces selected for inset operation');
    });

    it('should handle invalid mesh', () => {
      const result = insetFaces(null as any, [0]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid mesh: mesh is null or has no vertices');
    });

    it('should respect createFaces option', () => {
      const faceIndices = [0];
      const result = insetFaces(cube, faceIndices, { 
        distance: 0.2, 
        createFaces: false 
      });

      expect(result.success).toBe(true);
      expect(result.facesCreated).toBe(0);
    });

    it('should respect keepOriginal option', () => {
      const originalFaceCount = cube.faces.length;
      const faceIndices = [0];
      const result = insetFaces(cube, faceIndices, { 
        distance: 0.2, 
        keepOriginal: false 
      });

      expect(result.success).toBe(true);
      // Should have fewer faces than original since we removed one
      expect(cube.faces.length).toBeLessThan(originalFaceCount + result.facesCreated);
    });

    it('should preserve material assignments when requested', () => {
      const faceIndices = [0];
      const originalMaterialIndex = cube.faces[0].materialIndex;
      const result = insetFaces(cube, faceIndices, { 
        distance: 0.2, 
        preserveMaterials: true 
      });

      expect(result.success).toBe(true);
      // Check that new faces have the same material index
      const newFaces = cube.faces.slice(-result.facesCreated);
      for (const face of newFaces) {
        expect(face.materialIndex).toBe(originalMaterialIndex);
      }
    });

    it('should validate geometry when requested', () => {
      const faceIndices = [0];
      const result = insetFaces(cube, faceIndices, { 
        distance: 0.2, 
        validate: true 
      });

      expect(result.success).toBe(true);
      expect(result.validation).toBeDefined();
    });
  });

  describe('insetAllFaces', () => {
    it('should inset all faces in the mesh', () => {
      const originalFaceCount = cube.faces.length;
      const result = insetAllFaces(cube, { distance: 0.1 });

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
      expect(result.facesCreated).toBeGreaterThan(0);
      expect(cube.faces.length).toBeGreaterThan(originalFaceCount);
    });

    it('should handle different distances', () => {
      const result1 = insetAllFaces(cube, { distance: 0.1 });
      const result2 = insetAllFaces(sphere, { distance: 0.2 });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.verticesCreated).toBeGreaterThan(0);
      expect(result2.verticesCreated).toBeGreaterThan(0);
    });
  });

  describe('insetIndividualFaces', () => {
    it('should inset faces individually', () => {
      const faceIndices = [0, 1];
      const result = insetIndividualFaces(cube, faceIndices, { distance: 0.1 });

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
      expect(result.facesCreated).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small distance', () => {
      const faceIndices = [0];
      const result = insetFaces(cube, faceIndices, { distance: 0.001 });

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
    });

    it('should handle very large distance', () => {
      const faceIndices = [0];
      const result = insetFaces(cube, faceIndices, { distance: 1.0 });

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
    });

    it('should handle invalid face indices', () => {
      const faceIndices = [999]; // Invalid index
      const result = insetFaces(cube, faceIndices, { distance: 0.1 });

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBe(0);
      expect(result.facesCreated).toBe(0);
    });

    it('should handle mixed valid and invalid face indices', () => {
      const faceIndices = [0, 999, 1]; // Mix of valid and invalid
      const result = insetFaces(cube, faceIndices, { distance: 0.1 });

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
      expect(result.facesCreated).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle large meshes efficiently', () => {
      const largeCube = createCube({ width: 10, height: 10, depth: 10 });
      const faceIndices = Array.from({ length: largeCube.faces.length }, (_, i) => i);
      
      const startTime = performance.now();
      const result = insetFaces(largeCube, faceIndices, { distance: 0.1 });
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle complex meshes efficiently', () => {
      const faceIndices = Array.from({ length: sphere.faces.length }, (_, i) => i);
      
      const startTime = performance.now();
      const result = insetFaces(sphere, faceIndices, { distance: 0.1 });
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(500); // Should complete in under 500ms
    });
  });

  describe('Geometry Integrity', () => {
    it('should maintain mesh topology after inset', () => {
      const faceIndices = [0];
      const result = insetFaces(cube, faceIndices, { 
        distance: 0.2, 
        validate: true 
      });

      expect(result.success).toBe(true);
      expect(result.validation).toBeDefined();
      expect(result.validation.valid).toBe(true);
    });

    it('should handle mergeVertices option', () => {
      const faceIndices = [0];
      const result = insetFaces(cube, faceIndices, { 
        distance: 0.2, 
        mergeVertices: true 
      });

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
    });
  });

  describe('Material Assignment', () => {
    it('should assign custom material index', () => {
      const faceIndices = [0];
      const customMaterialIndex = 5;
      const result = insetFaces(cube, faceIndices, { 
        distance: 0.2, 
        materialIndex: customMaterialIndex,
        preserveMaterials: false 
      });

      expect(result.success).toBe(true);
      // Check that new faces have the custom material index
      const newFaces = cube.faces.slice(-result.facesCreated);
      for (const face of newFaces) {
        expect(face.materialIndex).toBe(customMaterialIndex);
      }
    });
  });
}); 