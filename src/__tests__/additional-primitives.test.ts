import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { EditableMesh } from '../core/index.ts';
import { 
  createTetrahedron,
  createOctahedron,
  createDodecahedron,
  createIcosahedron,
  createTorusKnot,
  createMobiusStrip
} from '../primitives/index.ts';

describe('Additional Primitives', () => {
  describe('Regular Polyhedra', () => {
    describe('Tetrahedron', () => {
      it('should create a tetrahedron with default options', () => {
        const mesh = createTetrahedron();
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBe(4);
        expect(mesh.getFaceCount()).toBe(4);
        expect(mesh.getEdgeCount()).toBeGreaterThan(0);
      });

      it('should create a tetrahedron with custom options', () => {
        const options = {
          size: 2.0,
          materialIndex: 1,
          generateUVs: true,
          generateNormals: true,
          center: new Vector3(1, 2, 3)
        };
        
        const mesh = createTetrahedron(options);
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBe(4);
        expect(mesh.getFaceCount()).toBe(4);
        expect(mesh.getEdgeCount()).toBeGreaterThan(0);
        
        // Check that vertices are properly positioned
        for (let i = 0; i < mesh.getVertexCount(); i++) {
          const vertex = mesh.getVertex(i);
          expect(vertex).toBeDefined();
          expect(Number.isFinite(vertex!.x)).toBe(true);
          expect(Number.isFinite(vertex!.y)).toBe(true);
          expect(Number.isFinite(vertex!.z)).toBe(true);
        }
      });

      it('should create tetrahedron with different sizes', () => {
        const sizes = [0.5, 1.0, 2.0, 5.0];
        
        for (const size of sizes) {
          const mesh = createTetrahedron({ size });
          expect(mesh).toBeInstanceOf(EditableMesh);
          expect(mesh.getVertexCount()).toBe(4);
          expect(mesh.getFaceCount()).toBe(4);
        }
      });
    });

    describe('Octahedron', () => {
      it('should create an octahedron with default options', () => {
        const mesh = createOctahedron();
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBe(6);
        expect(mesh.getFaceCount()).toBe(8);
        expect(mesh.getEdgeCount()).toBeGreaterThan(0);
      });

      it('should create an octahedron with custom options', () => {
        const options = {
          size: 1.5,
          materialIndex: 2,
          generateUVs: true,
          generateNormals: true,
          center: new Vector3(-1, 0, 1)
        };
        
        const mesh = createOctahedron(options);
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBe(6);
        expect(mesh.getFaceCount()).toBe(8);
        expect(mesh.getEdgeCount()).toBeGreaterThan(0);
      });

      it('should create octahedron with different sizes', () => {
        const sizes = [0.5, 1.0, 2.0, 5.0];
        
        for (const size of sizes) {
          const mesh = createOctahedron({ size });
          expect(mesh).toBeInstanceOf(EditableMesh);
          expect(mesh.getVertexCount()).toBe(6);
          expect(mesh.getFaceCount()).toBe(8);
        }
      });
    });

    describe('Dodecahedron', () => {
      it('should create a dodecahedron with default options', () => {
        const mesh = createDodecahedron();
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBe(20);
        expect(mesh.getFaceCount()).toBe(12);
        expect(mesh.getEdgeCount()).toBeGreaterThan(0);
      });

      it('should create a dodecahedron with custom options', () => {
        const options = {
          size: 1.2,
          materialIndex: 3,
          generateUVs: true,
          generateNormals: true,
          center: new Vector3(0, 1, -1)
        };
        
        const mesh = createDodecahedron(options);
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBe(20);
        expect(mesh.getFaceCount()).toBe(12);
      });

      it('should create dodecahedron with different sizes', () => {
        const sizes = [0.5, 1.0, 2.0, 5.0];
        
        for (const size of sizes) {
          const mesh = createDodecahedron({ size });
          expect(mesh).toBeInstanceOf(EditableMesh);
          expect(mesh.getVertexCount()).toBe(20);
          expect(mesh.getFaceCount()).toBe(12);
        }
      });
    });

    describe('Icosahedron', () => {
      it('should create an icosahedron with default options', () => {
        const mesh = createIcosahedron();
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBe(12);
        expect(mesh.getFaceCount()).toBe(20);
        expect(mesh.getEdgeCount()).toBeGreaterThan(0);
      });

      it('should create an icosahedron with custom options', () => {
        const options = {
          size: 1.8,
          materialIndex: 4,
          generateUVs: true,
          generateNormals: true,
          center: new Vector3(2, -1, 0)
        };
        
        const mesh = createIcosahedron(options);
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBe(12);
        expect(mesh.getFaceCount()).toBe(20);
      });

      it('should create icosahedron with different sizes', () => {
        const sizes = [0.5, 1.0, 2.0, 5.0];
        
        for (const size of sizes) {
          const mesh = createIcosahedron({ size });
          expect(mesh).toBeInstanceOf(EditableMesh);
          expect(mesh.getVertexCount()).toBe(12);
          expect(mesh.getFaceCount()).toBe(20);
        }
      });
    });
  });

  describe('Complex Shapes', () => {
    describe('Torus Knot', () => {
      it('should create a torus knot with default options', () => {
        const mesh = createTorusKnot();
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBeGreaterThan(0);
        expect(mesh.getFaceCount()).toBeGreaterThan(0);
        expect(mesh.getEdgeCount()).toBeGreaterThan(0);
      });

      it('should create a torus knot with custom options', () => {
        const options = {
          radius: 1.5,
          tubeRadius: 0.4,
          tubularSegments: 32,
          radialSegments: 6,
          p: 3,
          q: 2,
          materialIndex: 5,
          generateUVs: true,
          generateNormals: true,
          center: new Vector3(0, 0, 2)
        };
        
        const mesh = createTorusKnot(options);
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBeGreaterThan(0);
        expect(mesh.getFaceCount()).toBeGreaterThan(0);
      });

      it('should create torus knot with different parameters', () => {
        const testCases = [
          { p: 2, q: 3 },
          { p: 3, q: 2 },
          { p: 5, q: 2 },
          { p: 2, q: 5 }
        ];
        
        for (const params of testCases) {
          const mesh = createTorusKnot(params);
          expect(mesh).toBeInstanceOf(EditableMesh);
          expect(mesh.getVertexCount()).toBeGreaterThan(0);
          expect(mesh.getFaceCount()).toBeGreaterThan(0);
        }
      });

      it('should create torus knot with different segment counts', () => {
        const tubularSegments = [16, 32, 64];
        const radialSegments = [4, 8, 12];
        
        for (const tubular of tubularSegments) {
          for (const radial of radialSegments) {
            const mesh = createTorusKnot({ tubularSegments: tubular, radialSegments: radial });
            expect(mesh).toBeInstanceOf(EditableMesh);
            expect(mesh.getVertexCount()).toBeGreaterThan(0);
            expect(mesh.getFaceCount()).toBeGreaterThan(0);
          }
        }
      });
    });

    describe('Möbius Strip', () => {
      it('should create a Möbius strip with default options', () => {
        const mesh = createMobiusStrip();
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBeGreaterThan(0);
        expect(mesh.getFaceCount()).toBeGreaterThan(0);
        expect(mesh.getEdgeCount()).toBeGreaterThan(0);
      });

      it('should create a Möbius strip with custom options', () => {
        const options = {
          radius: 1.2,
          width: 0.4,
          segments: 48,
          widthSegments: 6,
          twists: 2,
          materialIndex: 6,
          generateUVs: true,
          generateNormals: true,
          center: new Vector3(1, -1, 1)
        };
        
        const mesh = createMobiusStrip(options);
        
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBeGreaterThan(0);
        expect(mesh.getFaceCount()).toBeGreaterThan(0);
      });

      it('should create Möbius strip with different twist counts', () => {
        const twists = [1, 2, 3, 5];
        
        for (const twist of twists) {
          const mesh = createMobiusStrip({ twists });
          expect(mesh).toBeInstanceOf(EditableMesh);
          expect(mesh.getVertexCount()).toBeGreaterThan(0);
          expect(mesh.getFaceCount()).toBeGreaterThan(0);
        }
      });

      it('should create Möbius strip with different segment counts', () => {
        const segments = [32, 48, 64];
        const widthSegments = [4, 6, 8];
        
        for (const seg of segments) {
          for (const widthSeg of widthSegments) {
            const mesh = createMobiusStrip({ segments: seg, widthSegments: widthSeg });
            expect(mesh).toBeInstanceOf(EditableMesh);
            expect(mesh.getVertexCount()).toBeGreaterThan(0);
            expect(mesh.getFaceCount()).toBeGreaterThan(0);
          }
        }
      });
    });
  });

  describe('Integration Tests', () => {
    it('should create all regular polyhedra with consistent properties', () => {
      const polyhedra = [
        { name: 'Tetrahedron', create: createTetrahedron, vertexCount: 4, faceCount: 4 },
        { name: 'Octahedron', create: createOctahedron, vertexCount: 6, faceCount: 8 },
        { name: 'Dodecahedron', create: createDodecahedron, vertexCount: 20, faceCount: 12 },
        { name: 'Icosahedron', create: createIcosahedron, vertexCount: 12, faceCount: 20 }
      ];
      
      for (const polyhedron of polyhedra) {
        const mesh = polyhedron.create();
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBe(polyhedron.vertexCount);
        expect(mesh.getFaceCount()).toBe(polyhedron.faceCount);
        
        // Check that all vertices have valid coordinates
        for (let i = 0; i < mesh.getVertexCount(); i++) {
          const vertex = mesh.getVertex(i);
          expect(vertex).toBeDefined();
          expect(Number.isFinite(vertex!.x)).toBe(true);
          expect(Number.isFinite(vertex!.y)).toBe(true);
          expect(Number.isFinite(vertex!.z)).toBe(true);
        }
      }
    });

    it('should create complex shapes with different parameters', () => {
      const complexShapes = [
        { name: 'Torus Knot', create: createTorusKnot, params: { p: 2, q: 3 } },
        { name: 'Torus Knot', create: createTorusKnot, params: { p: 3, q: 2 } },
        { name: 'Möbius Strip', create: createMobiusStrip, params: { twists: 1 } },
        { name: 'Möbius Strip', create: createMobiusStrip, params: { twists: 2 } }
      ];
      
      for (const shape of complexShapes) {
        const mesh = shape.create(shape.params);
        expect(mesh).toBeInstanceOf(EditableMesh);
        expect(mesh.getVertexCount()).toBeGreaterThan(0);
        expect(mesh.getFaceCount()).toBeGreaterThan(0);
        
        // Check that all vertices have valid coordinates
        for (let i = 0; i < mesh.getVertexCount(); i++) {
          const vertex = mesh.getVertex(i);
          expect(vertex).toBeDefined();
          expect(Number.isFinite(vertex!.x)).toBe(true);
          expect(Number.isFinite(vertex!.y)).toBe(true);
          expect(Number.isFinite(vertex!.z)).toBe(true);
        }
      }
    });

    it('should handle different material indices', () => {
      const materialIndices = [0, 1, 2, 5, 10];
      
      for (const materialIndex of materialIndices) {
        const tetrahedron = createTetrahedron({ materialIndex });
        const octahedron = createOctahedron({ materialIndex });
        const dodecahedron = createDodecahedron({ materialIndex });
        const icosahedron = createIcosahedron({ materialIndex });
        
        expect(tetrahedron).toBeInstanceOf(EditableMesh);
        expect(octahedron).toBeInstanceOf(EditableMesh);
        expect(dodecahedron).toBeInstanceOf(EditableMesh);
        expect(icosahedron).toBeInstanceOf(EditableMesh);
      }
    });

    it('should handle different center positions', () => {
      const centers = [
        new Vector3(0, 0, 0),
        new Vector3(1, 0, 0),
        new Vector3(0, 1, 0),
        new Vector3(0, 0, 1),
        new Vector3(1, 1, 1),
        new Vector3(-1, -1, -1)
      ];
      
      for (const center of centers) {
        const tetrahedron = createTetrahedron({ center });
        const octahedron = createOctahedron({ center });
        const dodecahedron = createDodecahedron({ center });
        const icosahedron = createIcosahedron({ center });
        
        expect(tetrahedron).toBeInstanceOf(EditableMesh);
        expect(octahedron).toBeInstanceOf(EditableMesh);
        expect(dodecahedron).toBeInstanceOf(EditableMesh);
        expect(icosahedron).toBeInstanceOf(EditableMesh);
      }
    });

    it('should handle UV and normal generation options', () => {
      const options = [
        { generateUVs: true, generateNormals: true },
        { generateUVs: true, generateNormals: false },
        { generateUVs: false, generateNormals: true },
        { generateUVs: false, generateNormals: false }
      ];
      
      for (const option of options) {
        const tetrahedron = createTetrahedron(option);
        const octahedron = createOctahedron(option);
        const dodecahedron = createDodecahedron(option);
        const icosahedron = createIcosahedron(option);
        
        expect(tetrahedron).toBeInstanceOf(EditableMesh);
        expect(octahedron).toBeInstanceOf(EditableMesh);
        expect(dodecahedron).toBeInstanceOf(EditableMesh);
        expect(icosahedron).toBeInstanceOf(EditableMesh);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid parameters gracefully', () => {
      // Test with negative sizes
      expect(() => createTetrahedron({ size: -1 })).not.toThrow();
      expect(() => createOctahedron({ size: -2 })).not.toThrow();
      
      // Test with zero sizes
      expect(() => createTetrahedron({ size: 0 })).not.toThrow();
      expect(() => createOctahedron({ size: 0 })).not.toThrow();
      
      // Test with very large sizes
      expect(() => createTetrahedron({ size: 1000 })).not.toThrow();
      expect(() => createOctahedron({ size: 1000 })).not.toThrow();
    });

    it('should handle complex shape parameters gracefully', () => {
      // Test with zero segments
      expect(() => createTorusKnot({ tubularSegments: 0, radialSegments: 0 })).not.toThrow();
      expect(() => createMobiusStrip({ segments: 0, widthSegments: 0 })).not.toThrow();
      
      // Test with negative parameters
      expect(() => createTorusKnot({ radius: -1, tubeRadius: -1 })).not.toThrow();
      expect(() => createMobiusStrip({ radius: -1, width: -1 })).not.toThrow();
    });
  });
}); 