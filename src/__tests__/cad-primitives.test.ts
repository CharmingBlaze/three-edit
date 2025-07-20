import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { createWedge } from '../primitives/createWedge.ts';
import { createNGon } from '../primitives/createNGon.ts';
import { createPipe } from '../primitives/createPipe.ts';
import { createRoundedBox } from '../primitives/createRoundedBox.ts';
import { validateMesh } from '../validation/validateMesh.ts';
import { toBufferGeometry } from '../conversion/toBufferGeometry.ts';

describe('CAD Primitives', () => {
  describe('createWedge', () => {
    it('should create a valid wedge with default options', () => {
      const wedge = createWedge();
      const validation = validateMesh(wedge);
      
      expect(validation.isValid).toBe(true);
      expect(wedge.vertices.length).toBeGreaterThan(0);
      expect(wedge.faces.length).toBeGreaterThan(0);
      expect(wedge.name).toBe('Wedge');
    });

    it('should create a wedge with custom dimensions', () => {
      const wedge = createWedge({ width: 2, height: 3, depth: 4 });
      const validation = validateMesh(wedge);
      
      expect(validation.isValid).toBe(true);
      expect(wedge.name).toBe('Wedge');
    });

    it('should create a segmented wedge', () => {
      const wedge = createWedge({ 
        widthSegments: 2, 
        heightSegments: 3, 
        depthSegments: 4 
      });
      const validation = validateMesh(wedge);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createNGon', () => {
    it('should create a valid NGon with default options', () => {
      const ngon = createNGon();
      const validation = validateMesh(ngon);
      
      expect(validation.isValid).toBe(true);
      expect(ngon.vertices.length).toBeGreaterThan(0);
      expect(ngon.faces.length).toBeGreaterThan(0);
      expect(ngon.name).toBe('NGon');
    });

    it('should create an NGon with custom sides', () => {
      const ngon = createNGon({ sides: 8, radius: 2 });
      const validation = validateMesh(ngon);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create an open-ended NGon', () => {
      const ngon = createNGon({ openEnded: true, height: 3 });
      const validation = validateMesh(ngon);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a partial NGon', () => {
      const ngon = createNGon({ 
        thetaStart: 0, 
        thetaLength: Math.PI 
      });
      const validation = validateMesh(ngon);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createPipe', () => {
    it('should create a valid pipe with default options', () => {
      const pipe = createPipe();
      const validation = validateMesh(pipe);
      
      expect(validation.isValid).toBe(true);
      expect(pipe.vertices.length).toBeGreaterThan(0);
      expect(pipe.faces.length).toBeGreaterThan(0);
      expect(pipe.name).toBe('Pipe');
    });

    it('should create a pipe with custom radii', () => {
      const pipe = createPipe({ 
        outerRadius: 2, 
        innerRadius: 1.5, 
        height: 3 
      });
      const validation = validateMesh(pipe);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create an open-ended pipe', () => {
      const pipe = createPipe({ openEnded: true });
      const validation = validateMesh(pipe);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a partial pipe', () => {
      const pipe = createPipe({ 
        thetaStart: 0, 
        thetaLength: Math.PI 
      });
      const validation = validateMesh(pipe);
      
      expect(validation.isValid).toBe(true);
    });

    it('should handle thin-walled pipes', () => {
      const pipe = createPipe({ 
        outerRadius: 1, 
        innerRadius: 0.9 
      });
      const validation = validateMesh(pipe);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createRoundedBox', () => {
    it('should create a valid rounded box with default options', () => {
      const roundedBox = createRoundedBox();
      const validation = validateMesh(roundedBox);
      
      expect(validation.isValid).toBe(true);
      expect(roundedBox.vertices.length).toBeGreaterThan(0);
      expect(roundedBox.faces.length).toBeGreaterThan(0);
      expect(roundedBox.name).toBe('RoundedBox');
    });

    it('should create a rounded box with custom corner radius', () => {
      const roundedBox = createRoundedBox({ 
        cornerRadius: 0.2, 
        cornerSegments: 6 
      });
      const validation = validateMesh(roundedBox);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a segmented rounded box', () => {
      const roundedBox = createRoundedBox({ 
        widthSegments: 2, 
        heightSegments: 3, 
        depthSegments: 4 
      });
      const validation = validateMesh(roundedBox, { allowNonManifold: true });
      
      expect(validation.isValid).toBe(true);
    });

    it('should handle small corner radius', () => {
      const roundedBox = createRoundedBox({ 
        cornerRadius: 0.01 
      });
      const validation = validateMesh(roundedBox);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('CAD Primitive Conversion', () => {
    it('should convert all CAD primitives to BufferGeometry', () => {
      const primitives = [
        createWedge(),
        createNGon(),
        createPipe(),
        createRoundedBox(),
      ];

      for (const primitive of primitives) {
        const geometry = toBufferGeometry(primitive);
        expect(geometry.attributes.position).toBeDefined();
        expect(geometry.attributes.position.count).toBeGreaterThan(0);
      }
    });

    it('should generate proper UVs for all CAD primitives', () => {
      const primitives = [
        createWedge(),
        createNGon(),
        createPipe(),
        createRoundedBox(),
      ];

      for (const primitive of primitives) {
        // Check that vertices have UVs
        const verticesWithUVs = primitive.vertices.filter(v => v.uv);
        expect(verticesWithUVs.length).toBeGreaterThan(0);
      }
    });

    it('should have proper material indices for all CAD primitives', () => {
      const primitives = [
        createWedge(),
        createNGon(),
        createPipe(),
        createRoundedBox(),
      ];

      for (const primitive of primitives) {
        // Check that faces have material indices
        const facesWithMaterials = primitive.faces.filter(f => f.materialIndex >= 0);
        expect(facesWithMaterials.length).toBeGreaterThan(0);
      }
    });
  });

  describe('CAD Primitive Properties', () => {
    it('should have appropriate material indices for different parts', () => {
      const wedge = createWedge();
      const ngon = createNGon();
      const pipe = createPipe();
      const roundedBox = createRoundedBox();

      // Check that different parts have different material indices
      const wedgeMaterials = new Set(wedge.faces.map(f => f.materialIndex));
      const ngonMaterials = new Set(ngon.faces.map(f => f.materialIndex));
      const pipeMaterials = new Set(pipe.faces.map(f => f.materialIndex));
      const roundedBoxMaterials = new Set(roundedBox.faces.map(f => f.materialIndex));

      expect(wedgeMaterials.size).toBeGreaterThan(1);
      expect(ngonMaterials.size).toBeGreaterThan(1);
      expect(pipeMaterials.size).toBeGreaterThan(1);
      expect(roundedBoxMaterials.size).toBeGreaterThan(1);
    });

    it('should have proper topology for editing operations', () => {
      const primitives = [
        createWedge(),
        createNGon(),
        createPipe(),
        createRoundedBox(),
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
  });
}); 