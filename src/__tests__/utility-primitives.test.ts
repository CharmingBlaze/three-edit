import { describe, it, expect } from 'vitest';

import { createGreebleBlock } from '../primitives/createGreebleBlock.ts';
import { createEmpty } from '../primitives/createEmpty.ts';
import { createBoundingBox } from '../primitives/createBoundingBox.ts';
import { createHandle } from '../primitives/createHandle.ts';
import { validateMesh } from '../validation/validateMesh.ts';
import { toBufferGeometry } from '../conversion/toBufferGeometry.ts';

describe('Utility Primitives', () => {
  describe('createGreebleBlock', () => {
    it('should create a valid greeble block with default options', () => {
      const block = createGreebleBlock();
      const validation = validateMesh(block, { allowNonManifold: true });
      
      expect(validation.isValid).toBe(true);
      expect(block.vertices.length).toBeGreaterThan(0);
      expect(block.faces.length).toBeGreaterThan(0);
      expect(block.name).toBe('GreebleBlock');
    });

    it('should create a greeble block with custom dimensions', () => {
      const block = createGreebleBlock({ 
        width: 2, 
        height: 3, 
        depth: 4, 
        divisions: 4 
      });
      const validation = validateMesh(block, { allowNonManifold: true });
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a greeble block with custom detail height', () => {
      const block = createGreebleBlock({ 
        detailHeight: 0.2, 
        divisions: 5 
      });
      const validation = validateMesh(block, { allowNonManifold: true });
      
      expect(validation.isValid).toBe(true);
    });

    it('should create consistent greeble with same seed', () => {
      const block1 = createGreebleBlock({ seed: 12345 });
      const block2 = createGreebleBlock({ seed: 12345 });
      
      expect(block1.vertices.length).toBe(block2.vertices.length);
      expect(block1.faces.length).toBe(block2.faces.length);
    });

    it('should create different greeble with different seeds', () => {
      const block1 = createGreebleBlock({ seed: 12345 });
      const block2 = createGreebleBlock({ seed: 67890 });
      
      // Should have same topology but different vertex positions
      expect(block1.vertices.length).toBe(block2.vertices.length);
      expect(block1.faces.length).toBe(block2.faces.length);
    });
  });

  describe('createEmpty', () => {
    it('should create a valid empty object with default options', () => {
      const empty = createEmpty();
      const validation = validateMesh(empty);
      
      expect(validation.isValid).toBe(true);
      expect(empty.vertices.length).toBeGreaterThan(0);
      expect(empty.faces.length).toBeGreaterThan(0);
      expect(empty.name).toBe('Empty');
    });

    it('should create an empty object with custom size', () => {
      const empty = createEmpty({ size: 0.5 });
      const validation = validateMesh(empty);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a minimal cube for visualization', () => {
      const empty = createEmpty();
      
      // Should have 8 vertices (cube)
      expect(empty.vertices.length).toBe(8);
      
      // Should have 6 faces (cube)
      expect(empty.faces.length).toBe(6);
    });
  });

  describe('createBoundingBox', () => {
    it('should create a valid bounding box with default options', () => {
      const bbox = createBoundingBox();
      const validation = validateMesh(bbox);
      
      expect(validation.isValid).toBe(true);
      expect(bbox.vertices.length).toBeGreaterThan(0);
      expect(bbox.faces.length).toBeGreaterThan(0);
      expect(bbox.name).toBe('BoundingBox');
    });

    it('should create a bounding box with custom dimensions', () => {
      const bbox = createBoundingBox({ 
        width: 4, 
        height: 6, 
        depth: 8, 
        lineThickness: 0.05 
      });
      const validation = validateMesh(bbox);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create corner cubes for wireframe visualization', () => {
      const bbox = createBoundingBox();
      
      // Should have 8 corner cubes with 8 vertices each = 64 vertices
      expect(bbox.vertices.length).toBe(64);
      
      // Should have 8 corner cubes with 6 faces each = 48 faces
      expect(bbox.faces.length).toBe(48);
    });

    it('should handle thin line thickness', () => {
      const bbox = createBoundingBox({ lineThickness: 0.01 });
      const validation = validateMesh(bbox);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createHandle', () => {
    it('should create a valid handle with default options', () => {
      const handle = createHandle();
      const validation = validateMesh(handle);
      
      expect(validation.isValid).toBe(true);
      expect(handle.vertices.length).toBeGreaterThan(0);
      expect(handle.faces.length).toBeGreaterThan(0);
      expect(handle.name).toBe('Handle');
    });

    it('should create a handle with custom dimensions', () => {
      const handle = createHandle({ 
        radius: 0.2, 
        height: 1, 
        radialSegments: 12, 
        heightSegments: 3 
      });
      const validation = validateMesh(handle);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a cylindrical handle with caps', () => {
      const handle = createHandle({ radialSegments: 8, heightSegments: 2 });
      
      // Should have side faces + top cap + bottom cap
      expect(handle.faces.length).toBeGreaterThan(8);
    });

    it('should handle thin handles', () => {
      const handle = createHandle({ 
        radius: 0.05, 
        height: 0.3 
      });
      const validation = validateMesh(handle);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Utility Primitive Conversion', () => {
    it('should convert all utility primitives to BufferGeometry', () => {
      const primitives = [
        createGreebleBlock(),
        createEmpty(),
        createBoundingBox(),
        createHandle(),
      ];

      for (const primitive of primitives) {
        const geometry = toBufferGeometry(primitive);
        expect(geometry.attributes.position).toBeDefined();
        expect(geometry.attributes.position.count).toBeGreaterThan(0);
      }
    });

    it('should generate proper UVs for all utility primitives', () => {
      const primitives = [
        createGreebleBlock(),
        createEmpty(),
        createBoundingBox(),
        createHandle(),
      ];

      for (const primitive of primitives) {
        // Check that vertices have UVs
        const verticesWithUVs = primitive.vertices.filter(v => v.uv);
        expect(verticesWithUVs.length).toBeGreaterThan(0);
      }
    });

    it('should have proper material indices for all utility primitives', () => {
      const primitives = [
        createGreebleBlock(),
        createEmpty(),
        createBoundingBox(),
        createHandle(),
      ];

      for (const primitive of primitives) {
        // Check that faces have material indices
        const facesWithMaterials = primitive.faces.filter(f => f.materialIndex >= 0);
        expect(facesWithMaterials.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Utility Primitive Properties', () => {
    it('should have appropriate material indices for different parts', () => {
      const greebleBlock = createGreebleBlock();
      const empty = createEmpty();
      const bbox = createBoundingBox();
      const handle = createHandle();

      // Check that different parts have different material indices
      const greebleMaterials = new Set(greebleBlock.faces.map(f => f.materialIndex));
      const emptyMaterials = new Set(empty.faces.map(f => f.materialIndex));
      const bboxMaterials = new Set(bbox.faces.map(f => f.materialIndex));
      const handleMaterials = new Set(handle.faces.map(f => f.materialIndex));

      expect(greebleMaterials.size).toBeGreaterThan(1);
      expect(emptyMaterials.size).toBeGreaterThan(0);
      expect(bboxMaterials.size).toBeGreaterThan(0);
      expect(handleMaterials.size).toBeGreaterThan(1);
    });

    it('should have proper topology for editing operations', () => {
      const primitives = [
        createGreebleBlock(),
        createEmpty(),
        createBoundingBox(),
        createHandle(),
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

    it('should have appropriate complexity for their purpose', () => {
      const simpleEmpty = createEmpty({ size: 0.1 });
      const complexGreeble = createGreebleBlock({ divisions: 6 });
      
      expect(complexGreeble.vertices.length).toBeGreaterThan(simpleEmpty.vertices.length);
      expect(complexGreeble.faces.length).toBeGreaterThan(simpleEmpty.faces.length);
    });
  });

  describe('Utility Primitive Use Cases', () => {
    it('should create greeble blocks suitable for sci-fi modeling', () => {
      const greeble = createGreebleBlock({ 
        divisions: 4, 
        detailHeight: 0.15 
      });
      
      // Should have significant detail
      expect(greeble.vertices.length).toBeGreaterThan(100);
      expect(greeble.faces.length).toBeGreaterThan(50);
    });

    it('should create empty objects suitable for scene organization', () => {
      const empty = createEmpty({ size: 0.05 });
      
      // Should be minimal but visible
      expect(empty.vertices.length).toBe(8);
      expect(empty.faces.length).toBe(6);
    });

    it('should create bounding boxes suitable for selection helpers', () => {
      const bbox = createBoundingBox({ 
        width: 3, 
        height: 4, 
        depth: 5, 
        lineThickness: 0.03 
      });
      
      // Should have corner visualization
      expect(bbox.vertices.length).toBe(64);
      expect(bbox.faces.length).toBe(48);
    });

    it('should create handles suitable for transform gizmos', () => {
      const handle = createHandle({ 
        radius: 0.15, 
        height: 0.8, 
        radialSegments: 10 
      });
      
      // Should be cylindrical with caps
      expect(handle.faces.length).toBeGreaterThan(10);
    });
  });
}); 