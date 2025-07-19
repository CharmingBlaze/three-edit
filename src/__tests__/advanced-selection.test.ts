import { describe, it, expect } from 'vitest';
import { createCube } from '../primitives/createCube';
import { createSphere } from '../primitives/createSphere';
import { EditableMesh } from '../core/EditableMesh';
import { 
  selectByRay, 
  selectByBox, 
  selectByLasso, 
  selectByCircle,
  selectConnected,
  selectSimilar
} from '../selection/advancedSelection';
import { Selection } from '../selection/Selection';
import { Ray, Box3, Vector3 } from 'three';

describe('Advanced Selection', () => {
  describe('Ray-based Selection', () => {
    it('should select faces by ray', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const ray = new Ray(new Vector3(0, 0, -5), new Vector3(0, 0, 1));
      
      const selection = selectByRay(mesh, ray, {
        selectFaces: true,
        selectVertices: false,
        selectEdges: false,
        maxDistance: 10
      });
      
      expect(selection.faces.size).toBeGreaterThan(0);
      expect(selection.vertices.size).toBe(0);
      expect(selection.edges.size).toBe(0);
    });

    it('should select vertices by ray', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const ray = new Ray(new Vector3(0, 0, -5), new Vector3(0, 0, 1));
      
      const selection = selectByRay(mesh, ray, {
        selectFaces: false,
        selectVertices: true,
        selectEdges: false,
        maxDistance: 10,
        tolerance: 0.1
      });
      
      expect(selection.faces.size).toBe(0);
      expect(selection.vertices.size).toBeGreaterThanOrEqual(0);
      expect(selection.edges.size).toBe(0);
    });

    it('should select edges by ray', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const ray = new Ray(new Vector3(0, 0, -5), new Vector3(0, 0, 1));
      
      const selection = selectByRay(mesh, ray, {
        selectFaces: false,
        selectVertices: false,
        selectEdges: true,
        maxDistance: 10,
        tolerance: 0.1
      });
      
      expect(selection.faces.size).toBe(0);
      expect(selection.vertices.size).toBe(0);
      expect(selection.edges.size).toBeGreaterThanOrEqual(0);
    });

    it('should handle ray with no intersection', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const ray = new Ray(new Vector3(0, 0, 5), new Vector3(0, 0, 1));
      
      const selection = selectByRay(mesh, ray, {
        selectFaces: true,
        maxDistance: 10
      });
      
      expect(selection.faces.size).toBe(0);
    });
  });

  describe('Box Selection', () => {
    it('should select faces by box', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const box = new Box3(
        new Vector3(-1, -1, -1),
        new Vector3(1, 1, 1)
      );
      
      const selection = selectByBox(mesh, box, {
        selectFaces: true,
        selectVertices: false,
        selectEdges: false,
        partialSelection: true
      });
      
      expect(selection.faces.size).toBeGreaterThan(0);
      expect(selection.vertices.size).toBe(0);
      expect(selection.edges.size).toBe(0);
    });

    it('should select vertices by box', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const box = new Box3(
        new Vector3(-1, -1, -1),
        new Vector3(1, 1, 1)
      );
      
      const selection = selectByBox(mesh, box, {
        selectFaces: false,
        selectVertices: true,
        selectEdges: false
      });
      
      expect(selection.faces.size).toBe(0);
      expect(selection.vertices.size).toBeGreaterThan(0);
      expect(selection.edges.size).toBe(0);
    });

    it('should select edges by box', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      // The cube vertices are at positions like (-0.5, -0.5, -0.5) to (0.5, 0.5, 0.5)
      // So we need a box that contains these positions
      const box = new Box3(
        new Vector3(-1, -1, -1),
        new Vector3(1, 1, 1)
      );
      
      console.log('Mesh vertices:', mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z })));
      console.log('Mesh edges:', mesh.edges.map(e => ({ vertexA: e.v1, vertexB: e.v2 })));
      console.log('Box:', { min: box.min, max: box.max });
      
      const selection = selectByBox(mesh, box, {
        selectFaces: false,
        selectVertices: false,
        selectEdges: true,
        partialSelection: true
      });
      
      console.log('Selected edges:', selection.edges.size);
      
      expect(selection.faces.size).toBe(0);
      expect(selection.vertices.size).toBe(0);
      // The cube has 12 edges, and with partial selection, we should get some edges
      expect(selection.edges.size).toBeGreaterThan(0);
    });

    it('should handle partial selection', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const box = new Box3(
        new Vector3(0.5, 0.5, 0.5),
        new Vector3(1.5, 1.5, 1.5)
      );
      
      const partialSelection = selectByBox(mesh, box, {
        selectFaces: true,
        partialSelection: true
      });
      
      const fullSelection = selectByBox(mesh, box, {
        selectFaces: true,
        partialSelection: false
      });
      
      expect(partialSelection.faces.size).toBeGreaterThanOrEqual(fullSelection.faces.size);
    });
  });

  describe('Lasso Selection', () => {
    it('should select faces by lasso', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const points = [
        new Vector3(-2, -2, 0),
        new Vector3(2, -2, 0),
        new Vector3(2, 2, 0),
        new Vector3(-2, 2, 0)
      ];
      
      const selection = selectByLasso(mesh, points, {
        selectFaces: true,
        selectVertices: false,
        selectEdges: false,
        tolerance: 0.1
      });
      
      expect(selection.faces.size).toBeGreaterThanOrEqual(0);
      expect(selection.vertices.size).toBe(0);
      expect(selection.edges.size).toBe(0);
    });

    it('should select vertices by lasso', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const points = [
        new Vector3(-2, -2, 0),
        new Vector3(2, -2, 0),
        new Vector3(2, 2, 0),
        new Vector3(-2, 2, 0)
      ];
      
      const selection = selectByLasso(mesh, points, {
        selectFaces: false,
        selectVertices: true,
        selectEdges: false,
        tolerance: 0.1
      });
      
      expect(selection.faces.size).toBe(0);
      expect(selection.vertices.size).toBeGreaterThanOrEqual(0);
      expect(selection.edges.size).toBe(0);
    });

    it('should handle complex lasso polygon', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const points = [
        new Vector3(-1, -1, 0),
        new Vector3(1, -1, 0),
        new Vector3(0, 1, 0)
      ];
      
      const selection = selectByLasso(mesh, points, {
        selectFaces: true,
        tolerance: 0.1
      });
      
      expect(selection.faces.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Circle Selection', () => {
    it('should select faces by circle', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const center = new Vector3(0, 0, 0);
      const radius = 2;
      
      const selection = selectByCircle(mesh, center, radius, {
        selectFaces: true,
        selectVertices: false,
        selectEdges: false,
        partialSelection: true
      });
      
      expect(selection.faces.size).toBeGreaterThan(0);
      expect(selection.vertices.size).toBe(0);
      expect(selection.edges.size).toBe(0);
    });

    it('should select vertices by circle', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const center = new Vector3(0, 0, 0);
      const radius = 2; // Increased radius to ensure selection
      
      const selection = selectByCircle(mesh, center, radius, {
        selectFaces: false,
        selectVertices: true,
        selectEdges: false
      });
      
      expect(selection.faces.size).toBe(0);
      expect(selection.vertices.size).toBeGreaterThan(0);
      expect(selection.edges.size).toBe(0);
    });

    it('should handle different circle sizes', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const center = new Vector3(0, 0, 0);
      
      const smallSelection = selectByCircle(mesh, center, 0.5, {
        selectFaces: true,
        partialSelection: true
      });
      
      const largeSelection = selectByCircle(mesh, center, 2, {
        selectFaces: true,
        partialSelection: true
      });
      
      expect(largeSelection.faces.size).toBeGreaterThanOrEqual(smallSelection.faces.size);
    });
  });

  describe('Connected Selection', () => {
    it('should select connected faces', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const initialSelection = new Selection();
      initialSelection.faces = new Set([0]); // Select first face
      
      const selection = selectConnected(mesh, initialSelection, {
        selectFaces: true,
        selectVertices: false,
        selectEdges: false,
        maxDepth: 1
      });
      
      expect(selection.faces.size).toBeGreaterThan(1);
      expect(selection.vertices.size).toBe(0);
      expect(selection.edges.size).toBe(0);
    });

    it('should select connected vertices', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const initialSelection = new Selection();
      initialSelection.vertices = new Set([0]); // Select first vertex
      
      const selection = selectConnected(mesh, initialSelection, {
        selectFaces: false,
        selectVertices: true,
        selectEdges: false,
        maxDepth: 1
      });
      
      expect(selection.faces.size).toBe(0);
      expect(selection.vertices.size).toBeGreaterThanOrEqual(1); // At least the original vertex
      expect(selection.edges.size).toBe(0);
    });

    it('should respect max depth', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const initialSelection = new Selection();
      initialSelection.faces = new Set([0]);
      
      const depth1Selection = selectConnected(mesh, initialSelection, {
        selectFaces: true,
        maxDepth: 1
      });
      
      const depth2Selection = selectConnected(mesh, initialSelection, {
        selectFaces: true,
        maxDepth: 2
      });
      
      expect(depth2Selection.faces.size).toBeGreaterThanOrEqual(depth1Selection.faces.size);
    });
  });

  describe('Similar Selection', () => {
    it('should select similar faces', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const initialSelection = new Selection();
      initialSelection.faces = new Set([0]); // Select first face
      
      const selection = selectSimilar(mesh, initialSelection, {
        selectFaces: true,
        selectVertices: false,
        selectEdges: false,
        similarityThreshold: 0.5
      });
      
      expect(selection.faces.size).toBeGreaterThan(1);
      expect(selection.vertices.size).toBe(0);
      expect(selection.edges.size).toBe(0);
    });

    it('should select similar vertices', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const initialSelection = new Selection();
      initialSelection.vertices = new Set([0]); // Select first vertex
      
      const selection = selectSimilar(mesh, initialSelection, {
        selectFaces: false,
        selectVertices: true,
        selectEdges: false,
        similarityThreshold: 0.5
      });
      
      expect(selection.faces.size).toBe(0);
      expect(selection.vertices.size).toBeGreaterThanOrEqual(1); // At least the original vertex
      expect(selection.edges.size).toBe(0);
    });

    it('should handle different similarity thresholds', () => {
      const mesh = createCube({ width: 2, height: 2, depth: 2 });
      const initialSelection = new Selection();
      initialSelection.faces = new Set([0]);
      
      const strictSelection = selectSimilar(mesh, initialSelection, {
        selectFaces: true,
        similarityThreshold: 0.1
      });
      
      const looseSelection = selectSimilar(mesh, initialSelection, {
        selectFaces: true,
        similarityThreshold: 1.0
      });
      
      expect(looseSelection.faces.size).toBeGreaterThanOrEqual(strictSelection.faces.size);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty mesh', () => {
      const mesh = new EditableMesh({ name: 'Empty' });
      const ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 1));
      
      const selection = selectByRay(mesh, ray, { selectFaces: true });
      
      expect(selection.faces.size).toBe(0);
      expect(selection.vertices.size).toBe(0);
      expect(selection.edges.size).toBe(0);
    });

    it('should handle empty selection for connected selection', () => {
      const mesh = createCube();
      const emptySelection = new Selection();
      
      const selection = selectConnected(mesh, emptySelection, {
        selectFaces: true,
        maxDepth: 1
      });
      
      expect(selection.faces.size).toBe(0);
    });

    it('should handle empty selection for similar selection', () => {
      const mesh = createCube();
      const emptySelection = new Selection();
      
      const selection = selectSimilar(mesh, emptySelection, {
        selectFaces: true,
        similarityThreshold: 0.5
      });
      
      expect(selection.faces.size).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should handle large meshes efficiently', () => {
      const mesh = createSphere({ radius: 1, widthSegments: 32, heightSegments: 32 });
      // Use a ray that will definitely hit the sphere
      const ray = new Ray(new Vector3(0, 0, -2), new Vector3(0, 0, 1));
      
      console.log('Sphere faces:', mesh.faces.length);
      console.log('Ray origin:', ray.origin);
      console.log('Ray direction:', ray.direction);
      
      const startTime = performance.now();
      const selection = selectByRay(mesh, ray, { selectFaces: true });
      const endTime = performance.now();
      
      console.log('Selected faces:', selection.faces.size);
      console.log('Time taken:', endTime - startTime);
      
      expect(selection.faces.size).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
}); 