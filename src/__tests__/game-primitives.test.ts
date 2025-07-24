import { describe, it, expect } from 'vitest';

import { createLowPolySphere } from '../primitives/createLowPolySphere.ts';
import { createRoundedBox } from '../primitives/createRoundedBox.ts';
import { createStairs } from '../primitives/createStairs.ts';
import { createRamp } from '../primitives/createRamp.ts';
import { createArrow } from '../primitives/createArrow.ts';
import { validateMesh } from '../validation/validateMesh.ts';
import { toBufferGeometry } from '../conversion/toBufferGeometry.ts';

describe('Game Development Primitives', () => {
  describe('createLowPolySphere', () => {
    it('should create a valid low-poly sphere with default options', () => {
      const sphere = createLowPolySphere();
      const validation = validateMesh(sphere);
      
      expect(validation.isValid).toBe(true);
      expect(sphere.vertices.length).toBeGreaterThan(0);
      expect(sphere.faces.length).toBeGreaterThan(0);
      expect(sphere.name).toBe('LowPolySphere');
    });

    it('should create a low-poly sphere with custom radius', () => {
      const sphere = createLowPolySphere({ radius: 2 });
      const validation = validateMesh(sphere);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a high-segment low-poly sphere', () => {
      const sphere = createLowPolySphere({ segments: 12 });
      const validation = validateMesh(sphere);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createRoundedBox', () => {
    it('should create a valid rounded box with default options', () => {
      const box = createRoundedBox();
      const validation = validateMesh(box);
      
      expect(validation.isValid).toBe(true);
      expect(box.vertices.length).toBeGreaterThan(0);
      expect(box.faces.length).toBeGreaterThan(0);
      expect(box.name).toBe('RoundedBox');
    });

    it('should create a rounded box with custom corner radius', () => {
      const box = createRoundedBox({ 
        cornerRadius: 0.2, 
        cornerSegments: 6 
      });
      const validation = validateMesh(box);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a segmented rounded box', () => {
      const box = createRoundedBox({ 
        widthSegments: 2, 
        heightSegments: 3, 
        depthSegments: 4 
      });
      const validation = validateMesh(box, { allowNonManifold: true });
      
      expect(validation.isValid).toBe(true);
    });

    it('should handle small corner radius', () => {
      const box = createRoundedBox({ cornerRadius: 0.01 });
      const validation = validateMesh(box);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createStairs', () => {
    it('should create valid stairs with default options', () => {
      const stairs = createStairs();
      const validation = validateMesh(stairs);
      
      expect(validation.isValid).toBe(true);
      expect(stairs.vertices.length).toBeGreaterThan(0);
      expect(stairs.faces.length).toBeGreaterThan(0);
      expect(stairs.name).toBe('Stairs');
    });

    it('should create stairs with custom dimensions', () => {
      const stairs = createStairs({ 
        width: 3, 
        height: 4, 
        depth: 6, 
        steps: 8 
      });
      const validation = validateMesh(stairs);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create segmented stairs', () => {
      const stairs = createStairs({ 
        widthSegments: 2, 
        heightSegments: 2, 
        depthSegments: 2 
      });
      const validation = validateMesh(stairs);
      
      expect(validation.isValid).toBe(true);
    });

    it('should handle many steps', () => {
      const stairs = createStairs({ steps: 20 });
      const validation = validateMesh(stairs);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createRamp', () => {
    it('should create a valid ramp with default options', () => {
      const ramp = createRamp();
      const validation = validateMesh(ramp);
      
      expect(validation.isValid).toBe(true);
      expect(ramp.vertices.length).toBeGreaterThan(0);
      expect(ramp.faces.length).toBeGreaterThan(0);
      expect(ramp.name).toBe('Ramp');
    });

    it('should create a ramp with custom dimensions', () => {
      const ramp = createRamp({ 
        width: 3, 
        height: 2, 
        length: 8 
      });
      const validation = validateMesh(ramp);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a segmented ramp', () => {
      const ramp = createRamp({ 
        widthSegments: 2, 
        heightSegments: 3, 
        lengthSegments: 4 
      });
      const validation = validateMesh(ramp, { allowNonManifold: true });
      
      expect(validation.isValid).toBe(true);
    });

    it('should handle steep ramps', () => {
      const ramp = createRamp({ height: 5, length: 2 });
      const validation = validateMesh(ramp);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createArrow', () => {
    it('should create a valid arrow with default options', () => {
      const arrow = createArrow();
      const validation = validateMesh(arrow);
      
      expect(validation.isValid).toBe(true);
      expect(arrow.vertices.length).toBeGreaterThan(0);
      expect(arrow.faces.length).toBeGreaterThan(0);
      expect(arrow.name).toBe('Arrow');
    });

    it('should create an arrow with custom dimensions', () => {
      const arrow = createArrow({ 
        shaftLength: 3, 
        shaftRadius: 0.2, 
        headLength: 1, 
        headRadius: 0.5 
      });
      const validation = validateMesh(arrow);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a segmented arrow', () => {
      const arrow = createArrow({ 
        radialSegments: 4, 
        heightSegments: 2 
      });
      const validation = validateMesh(arrow);
      
      expect(validation.isValid).toBe(true);
    });

    it('should handle thin arrows', () => {
      const arrow = createArrow({ 
        shaftRadius: 0.05, 
        headRadius: 0.05 
      });
      const validation = validateMesh(arrow);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Game Primitive Conversion', () => {
    it('should convert all game primitives to BufferGeometry', () => {
      const primitives = [
        createLowPolySphere(),
        createRoundedBox(),
        createStairs(),
        createRamp(),
        createArrow(),
      ];

      for (const primitive of primitives) {
        const geometry = toBufferGeometry(primitive);
        expect(geometry.attributes.position).toBeDefined();
        expect(geometry.attributes.position.count).toBeGreaterThan(0);
      }
    });

    it('should generate proper UVs for all game primitives', () => {
      const primitives = [
        createLowPolySphere(),
        createRoundedBox(),
        createStairs(),
        createRamp(),
        createArrow(),
      ];

      for (const primitive of primitives) {
        // Check that vertices have UVs
        const verticesWithUVs = primitive.vertices.filter(v => v.uv);
        expect(verticesWithUVs.length).toBeGreaterThan(0);
      }
    });

    it('should have proper material indices for all game primitives', () => {
      const primitives = [
        createLowPolySphere(),
        createRoundedBox(),
        createStairs(),
        createRamp(),
        createArrow(),
      ];

      for (const primitive of primitives) {
        // Check that faces have material indices
        const facesWithMaterials = primitive.faces.filter(f => f.materialIndex >= 0);
        expect(facesWithMaterials.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Game Primitive Properties', () => {
    it('should have appropriate material indices for different parts', () => {
      const lowPolySphere = createLowPolySphere();
      const roundedBox = createRoundedBox();
      const stairs = createStairs();
      const ramp = createRamp();
      const arrow = createArrow();

      // Check that different parts have different material indices
      const lowPolySphereMaterials = new Set(lowPolySphere.faces.map(f => f.materialIndex));
      const roundedBoxMaterials = new Set(roundedBox.faces.map(f => f.materialIndex));
      const stairsMaterials = new Set(stairs.faces.map(f => f.materialIndex));
      const rampMaterials = new Set(ramp.faces.map(f => f.materialIndex));
      const arrowMaterials = new Set(arrow.faces.map(f => f.materialIndex));

      expect(lowPolySphereMaterials.size).toBeGreaterThan(0);
      expect(roundedBoxMaterials.size).toBeGreaterThan(1);
      expect(stairsMaterials.size).toBeGreaterThan(1);
      expect(rampMaterials.size).toBeGreaterThan(1);
      expect(arrowMaterials.size).toBeGreaterThan(1);
    });

    it('should have proper topology for editing operations', () => {
      const primitives = [
        createLowPolySphere(),
        createRoundedBox(),
        createStairs(),
        createRamp(),
        createArrow(),
      ];

      for (const primitive of primitives) {
        // Check that edges are properly connected
        expect(primitive.edges.length).toBeGreaterThan(0);
        
        // Check that faces reference valid vertices
        for (const face of primitive.faces) {
          expect(face.vertices.length).toBeGreaterThan(2);
          for (const vertexIndex of face.vertices) {
            expect(vertexIndex).toBeGreaterThanOrEqual(0);
            expect(vertexIndex).toBeLessThan(primitive.vertices.length);
          }
        }
      }
    });

    it('should have appropriate vertex counts for complexity', () => {
      const simpleSphere = createLowPolySphere({ segments: 6 });
      const complexSphere = createLowPolySphere({ segments: 12 });
      
      expect(complexSphere.vertices.length).toBeGreaterThan(simpleSphere.vertices.length);
      expect(complexSphere.faces.length).toBeGreaterThan(simpleSphere.faces.length);
    });
  });
}); 