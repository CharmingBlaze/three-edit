import { describe, it, expect, beforeEach } from 'vitest';
import { EditableMesh } from '../core/EditableMesh';
import { createCube, createSphere } from '../primitives/index';
import { 
  knifeCut, 
  knifeCutLine, 
  knifeCutPath, 
  knifeCutCircle,
  KnifeOptions,
  CutLine 
} from '../editing/knife';
import { Vector3 } from 'three';

describe('Knife Tool', () => {
  let cube: EditableMesh;
  let sphere: EditableMesh;

  beforeEach(() => {
    cube = createCube({ width: 2, height: 2, depth: 2 });
    sphere = createSphere({ radius: 1, widthSegments: 8, heightSegments: 8 });
  });

  describe('knifeCut', () => {
    it('should perform basic knife cut on cube', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(-1, -1, 0),
          end: new Vector3(1, -1, 0)
        }
      ];

      const result = knifeCut(cube, cutLines);

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
      expect(result.facesSplit).toBeGreaterThan(0);
      expect(result.statistics).toBeDefined();
      expect(result.statistics!.outputVertices).toBeGreaterThan(result.statistics!.inputVertices);
    });

    it('should handle multiple cut lines', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(-1, -1, 0),
          end: new Vector3(1, -1, 0)
        },
        {
          start: new Vector3(-1, 1, 0),
          end: new Vector3(1, 1, 0)
        }
      ];

      const result = knifeCut(cube, cutLines);

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
      expect(result.facesSplit).toBeGreaterThan(0);
    });

    it('should handle empty cut lines', () => {
      const result = knifeCut(cube, []);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No cut lines provided');
    });

    it('should handle invalid mesh', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(0, 0, 0),
          end: new Vector3(1, 0, 0)
        }
      ];

      const result = knifeCut(new EditableMesh(), cutLines);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid mesh: mesh is null or has no vertices');
    });

    it('should respect createVertices option', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(-1, 0, 0),
          end: new Vector3(1, 0, 0)
        }
      ];

      const options: KnifeOptions = {
        createVertices: false
      };

      const result = knifeCut(cube, cutLines, options);

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBe(0);
    });

    it('should respect splitFaces option', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(-1, 0, 0),
          end: new Vector3(1, 0, 0)
        }
      ];

      const options: KnifeOptions = {
        splitFaces: false
      };

      const result = knifeCut(cube, cutLines, options);

      expect(result.success).toBe(true);
      expect(result.facesSplit).toBe(0);
    });

    it('should preserve material assignments when requested', () => {
      // Assign different materials to faces
      cube.faces.forEach((face, index) => {
        face.materialIndex = index % 2;
      });

      const cutLines: CutLine[] = [
        {
          start: new Vector3(-1, 0, 0),
          end: new Vector3(1, 0, 0)
        }
      ];

      const options: KnifeOptions = {
        preserveMaterials: true
      };

      const result = knifeCut(cube, cutLines, options);

      expect(result.success).toBe(true);
      
      // Check that new faces have material indices
      const hasMaterial0 = cube.faces.some(face => face.materialIndex === 0);
      const hasMaterial1 = cube.faces.some(face => face.materialIndex === 1);
      expect(hasMaterial0).toBe(true);
      expect(hasMaterial1).toBe(true);
    });

    it('should validate geometry when requested', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(-1, 0, 0),
          end: new Vector3(1, 0, 0)
        }
      ];

      const options: KnifeOptions = {
        validate: true
      };

      const result = knifeCut(cube, cutLines, options);

      expect(result.success).toBe(true);
      expect(result.validation).toBeDefined();
    });
  });

  describe('knifeCutLine', () => {
    it('should perform single line cut', () => {
      const result = knifeCutLine(cube, 
        new Vector3(-1, -1, 0), 
        new Vector3(1, -1, 0)
      );

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
      expect(result.facesSplit).toBeGreaterThan(0);
    });

    it('should handle vertical cut', () => {
      const result = knifeCutLine(cube, 
        new Vector3(0, -1, -1), 
        new Vector3(0, -1, 1)
      );

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
    });

    it('should handle diagonal cut', () => {
      const result = knifeCutLine(cube, 
        new Vector3(-1, -1, -1), 
        new Vector3(1, 1, 1)
      );

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
    });
  });

  describe('knifeCutPath', () => {
    it('should perform path cut with multiple points', () => {
      const points = [
        new Vector3(-1, -1, 0),
        new Vector3(0, -1, 0),
        new Vector3(1, -1, 0)
      ];

      const result = knifeCutPath(cube, points);

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
      expect(result.edgesCreated).toBeGreaterThan(0);
    });

    it('should handle insufficient points', () => {
      const points = [new Vector3(0, 0, 0)];

      const result = knifeCutPath(cube, points);

      expect(result.success).toBe(false);
      expect(result.error).toBe('At least 2 points required for a path cut');
    });

    it('should handle complex path', () => {
      const points = [
        new Vector3(-1, -1, 0),
        new Vector3(0, 0, 0),
        new Vector3(1, -1, 0),
        new Vector3(0, 1, 0),
        new Vector3(-1, -1, 0)
      ];

      const result = knifeCutPath(cube, points);

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
    });
  });

  describe('knifeCutCircle', () => {
    it('should perform circular cut', () => {
      console.log('=== CIRCULAR CUT TEST STARTING ===');
      
      const center = new Vector3(0, 0, 0); // Place at center of cube
      const radius = 0.4; // Use radius that intersects with cube bounds

      // Print all cube vertices
      console.log('Cube vertices:', cube.vertices.map(v => ({ x: v.x, y: v.y, z: v.z })));

      // Generate circle points
      const segments = 32;
      const points = [];
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        points.push({ x, y, z: center.z });
      }
      points.push(points[0]);
      console.log('Circle points:', points);

      const result = knifeCutCircle(cube, center, radius, new Vector3(0, 0, 1));

      console.log('Circular cut result:', result);
      console.log('Result details:', {
        success: result.success,
        verticesCreated: result.verticesCreated,
        edgesCreated: result.edgesCreated,
        facesSplit: result.facesSplit,
        error: result.error
      });

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
      expect(result.facesSplit).toBeGreaterThan(0);
    });

    it('should handle different segment counts', () => {
      const center = new Vector3(0, 0, 0); // Place at center of cube
      const radius = 0.4; // Use radius that intersects with cube bounds

      const result8 = knifeCutCircle(cube, center, radius, new Vector3(0, 0, 1), 8);
      const result16 = knifeCutCircle(cube, center, radius, new Vector3(0, 0, 1), 16);

      console.log('Segment count test results:', { result8, result16 });

      expect(result8.success).toBe(true);
      expect(result16.success).toBe(true);
      expect(result16.verticesCreated).toBeGreaterThan(result8.verticesCreated);
    });

    it('should handle off-center circular cut', () => {
      const center = new Vector3(0.2, 0.2, 0); // Place off-center but still intersecting
      const radius = 0.3; // Use radius that intersects with cube bounds

      const result = knifeCutCircle(cube, center, radius, new Vector3(0, 0, 1));

      console.log('Off-center circular cut result:', result);

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
    });

    it('should perform circular cut on a different plane', () => {
      const center = new Vector3(0, 0, 0);
      const radius = 0.4;
      const normal = new Vector3(1, 0, 0); // Cut on the YZ plane

      const result = knifeCutCircle(cube, center, radius, normal);

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBeGreaterThan(0);
      expect(result.facesSplit).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle cut line outside mesh bounds', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(10, 10, 10),
          end: new Vector3(20, 20, 20)
        }
      ];

      const result = knifeCut(cube, cutLines);

      expect(result.success).toBe(true);
      expect(result.verticesCreated).toBe(0);
      expect(result.facesSplit).toBe(0);
    });

    it('should handle cut line parallel to face', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(-1, 1, 0),
          end: new Vector3(1, 1, 0)
        }
      ];

      const result = knifeCut(cube, cutLines);

      expect(result.success).toBe(true);
    });

    it('should handle very small tolerance', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(-1, 0, 0),
          end: new Vector3(1, 0, 0)
        }
      ];

      const options: KnifeOptions = {
        tolerance: 1e-10
      };

      const result = knifeCut(cube, cutLines, options);

      expect(result.success).toBe(true);
    });

    it('should handle very large tolerance', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(-1, 0, 0),
          end: new Vector3(1, 0, 0)
        }
      ];

      const options: KnifeOptions = {
        tolerance: 1.0
      };

      const result = knifeCut(cube, cutLines, options);

      expect(result.success).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large meshes efficiently', () => {
      const largeCube = createCube({ width: 10, height: 10, depth: 10 });
      
      const cutLines: CutLine[] = [
        {
          start: new Vector3(-5, 0, 0),
          end: new Vector3(5, 0, 0)
        }
      ];

      const startTime = performance.now();
      const result = knifeCut(largeCube, cutLines);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle complex cuts efficiently', () => {
      const cutLines: CutLine[] = [];
      
      // Create a grid of cuts
      for (let i = -1; i <= 1; i += 0.2) {
        cutLines.push({
          start: new Vector3(i, -1, 0),
          end: new Vector3(i, 1, 0)
        });
        cutLines.push({
          start: new Vector3(-1, i, 0),
          end: new Vector3(1, i, 0)
        });
      }

      const startTime = performance.now();
      const result = knifeCut(cube, cutLines);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Geometry Integrity', () => {
    it('should maintain mesh topology after cuts', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(-1, 0, 0),
          end: new Vector3(1, 0, 0)
        }
      ];

      const result = knifeCut(cube, cutLines);

      expect(result.success).toBe(true);
      
      // Check that all faces have valid vertex indices
      for (const face of cube.faces) {
        for (const vertexIndex of face.vertices) {
          expect(vertexIndex).toBeGreaterThanOrEqual(0);
          expect(vertexIndex).toBeLessThan(cube.vertices.length);
        }
      }

      // Check that all edges have valid vertex indices
      for (const edge of cube.edges) {
        expect(edge.v1).toBeGreaterThanOrEqual(0);
        expect(edge.v1).toBeLessThan(cube.vertices.length);
        expect(edge.v2).toBeGreaterThanOrEqual(0);
        expect(edge.v2).toBeLessThan(cube.vertices.length);
      }
    });

    it('should handle mergeVertices option', () => {
      const cutLines: CutLine[] = [
        {
          start: new Vector3(-1, 0, 0),
          end: new Vector3(1, 0, 0)
        }
      ];

      const options: KnifeOptions = {
        mergeVertices: true
      };

      const result = knifeCut(cube, cutLines, options);

      expect(result.success).toBe(true);
      
      // Check that no duplicate vertices exist
      const vertexPositions = cube.vertices.map(v => `${v.x},${v.y},${v.z}`);
      const uniquePositions = new Set(vertexPositions);
      expect(uniquePositions.size).toBe(cube.vertices.length);
    });
  });
}); 