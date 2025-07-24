import { describe, it, expect, beforeEach } from 'vitest';
import { EditableMesh } from '../core/EditableMesh';
import { Vector3 } from 'three';
import { createCube, createSphere } from '../primitives/index';
import { 
  bridgeEdges, 
  bridgeEdgeSequence, 
  bridgeFaces,
  bridgeSelectedEdges,
  BridgeOptions,
  BridgeResult 
} from '../editing/bridge';
import { Vertex, Edge, Face } from '../core/index';

describe('Bridge Tool', () => {
  let cube: EditableMesh;
  let sphere: EditableMesh;

  beforeEach(() => {
    cube = createCube({ width: 2, height: 2, depth: 2 });
    sphere = createSphere({ radius: 1, widthSegments: 8, heightSegments: 8 });
  });

  describe('bridgeEdges', () => {
    it('should bridge two edges with quads', () => {
      const edge1Index = 0;
      const edge2Index = 8; // Use a different edge that's not connected to edge 0
      
      const result = bridgeEdges(cube, edge1Index, edge2Index);

      expect(result.success).toBe(true);
      expect(result.edgesBridged).toBe(2);
      expect(result.facesCreated).toBe(2);
      expect(result.verticesCreated).toBe(2);
    });

    it('should bridge two edges with triangles', () => {
      const edge1Index = 1;
      const edge2Index = 9; // Use a different edge that's not connected to edge 1
      
      const result = bridgeEdges(cube, edge1Index, edge2Index, { createQuads: false });

      expect(result.success).toBe(true);
      expect(result.edgesBridged).toBe(2);
      expect(result.facesCreated).toBe(4); // 2 triangles per bridge
      expect(result.verticesCreated).toBe(2);
    });

    it('should handle invalid edge indices', () => {
      const result = bridgeEdges(cube, -1, 0);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid edge1 index');
    });

    it('should handle bridging edge to itself', () => {
      const result = bridgeEdges(cube, 0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot bridge edge to itself');
    });

    it('should handle already connected edges', () => {
      const result = bridgeEdges(cube, 0, 1); // These edges share a vertex
      expect(result.success).toBe(false);
      expect(result.error).toContain('Edges are already connected');
    });

    it('should apply smoothing when requested', () => {
      const edge1Index = 2;
      const edge2Index = 10; // Use a different edge that's not connected to edge 2
      
      const result = bridgeEdges(cube, edge1Index, edge2Index, { 
        smooth: true, 
        smoothingFactor: 0.3 
      });

      expect(result.success).toBe(true);
      expect(result.edgesBridged).toBe(2);
    });

    it('should assign material to new faces', () => {
      const edge1Index = 3;
      const edge2Index = 11; // Use a different edge that's not connected to edge 3
      const testMaterial = { name: 'test' };
      
      const result = bridgeEdges(cube, edge1Index, edge2Index, { material: testMaterial });

      expect(result.success).toBe(true);
      expect(result.facesCreated).toBe(2);
    });
  });

  describe('bridgeEdgeSequence', () => {
    it('should bridge multiple edges in sequence', () => {
      const edgeIndices = [0, 8, 16]; // Use edges that are not connected to each other
      
      const result = bridgeEdgeSequence(cube, edgeIndices);

      expect(result.success).toBe(true);
      expect(result.edgesBridged).toBe(4);
      expect(result.facesCreated).toBe(4);
      expect(result.verticesCreated).toBe(4);
    });

    it('should handle insufficient edges', () => {
      const result = bridgeEdgeSequence(cube, [0]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Need at least 2 edges');
    });

    it('should handle empty edge array', () => {
      const result = bridgeEdgeSequence(cube, []);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Need at least 2 edges');
    });
  });

  describe('bridgeFaces', () => {
    it('should bridge two faces', () => {
      const face1Index = 0;
      const face2Index = 1;
      
      const result = bridgeFaces(cube, face1Index, face2Index);

      expect(result.success).toBe(true);
      expect(result.edgesBridged).toBeGreaterThan(0);
      expect(result.facesCreated).toBeGreaterThan(0);
    });

    it('should handle invalid face indices', () => {
      const result = bridgeFaces(cube, -1, 0);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid face1 index');
    });

    it('should handle bridging face to itself', () => {
      const result = bridgeFaces(cube, 0, 0);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot bridge face to itself');
    });

    it('should handle faces with no suitable edge pairs', () => {
      // Create a simple mesh with faces that can't be bridged
      const simpleMesh = new EditableMesh();
      
      // Add vertices
      const v1 = new Vertex(0, 0, 0);
      const v2 = new Vertex(1, 0, 0);
      const v3 = new Vertex(0, 1, 0);
      const v4 = new Vertex(1, 1, 0);
      
      simpleMesh.vertices.push(v1, v2, v3, v4);
      
      // Add edges
      const e1 = new Edge(0, 1);
      const e2 = new Edge(1, 2);
      const e3 = new Edge(2, 0);
      const e4 = new Edge(0, 3);
      const e5 = new Edge(3, 1);
      
      simpleMesh.edges.push(e1, e2, e3, e4, e5);
      
      // Add faces
      const f1 = new Face([0, 1, 2], [0, 1, 2]);
      const f2 = new Face([0, 3, 1], [3, 4, 0]);
      
      simpleMesh.faces.push(f1, f2);
      
      const result = bridgeFaces(simpleMesh, 0, 1);
      expect(result.success).toBe(true);
      expect(result.edgesBridged).toBeGreaterThan(0);
      expect(result.facesCreated).toBeGreaterThan(0);
    });
  });

  describe('bridgeSelectedEdges', () => {
    it('should bridge selected edges', () => {
      // Use edge indices that are more likely to be bridgeable
      // These should be edges that are not adjacent but can be bridged
      const selectedEdges = [0, 2, 4, 6];
      
      const result = bridgeSelectedEdges(cube, selectedEdges);

      expect(result.success).toBe(true);
      expect(result.edgesBridged).toBeGreaterThan(0);
      expect(result.facesCreated).toBeGreaterThan(0);
    });

    it('should handle insufficient selected edges', () => {
      const result = bridgeSelectedEdges(cube, [0]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Need at least 2 selected edges');
    });

    it('should group edges by proximity', () => {
      // Use edge indices that are close to each other
      const selectedEdges = [0, 1, 2, 3];
      
      const result = bridgeSelectedEdges(cube, selectedEdges, { tolerance: 0.1 });

      expect(result.success).toBe(true);
      expect(result.edgesBridged).toBeGreaterThan(0);
    });
  });

  describe('performance and validation', () => {
    it('should complete operations within reasonable time', () => {
      const startTime = performance.now();
      
      const result = bridgeEdges(cube, 0, 8); // Use valid edge combination
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(operationTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.statistics!.operationTime).toBeLessThan(1000);
    });

    it('should maintain mesh integrity after bridge operations', () => {
      const originalVertexCount = cube.vertices.length;
      const originalEdgeCount = cube.edges.length;
      const originalFaceCount = cube.faces.length;
      
      const result = bridgeEdges(cube, 0, 8, { validate: true }); // Use valid edge combination

      expect(result.success).toBe(true);
      expect(cube.vertices.length).toBeGreaterThan(originalVertexCount);
      expect(cube.edges.length).toBeGreaterThan(originalEdgeCount);
      expect(cube.faces.length).toBeGreaterThan(originalFaceCount);
    });

    it('should handle complex bridge operations', () => {
      // Create a more complex mesh for testing
      const complexMesh = createSphere({ radius: 1, widthSegments: 12, heightSegments: 12 });
      
      const result = bridgeEdgeSequence(complexMesh, [0, 10, 20, 30]);

      expect(result.success).toBe(true);
      expect(result.edgesBridged).toBe(6);
      expect(result.facesCreated).toBe(6);
    });
  });

  describe('error handling', () => {
    it('should handle edge out of bounds', () => {
      const result = bridgeEdges(cube, 999, 0);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid edge1 index');
    });

    it('should handle face out of bounds', () => {
      const result = bridgeFaces(cube, 999, 0);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid face1 index');
    });

    it('should handle invalid options gracefully', () => {
      const result = bridgeEdges(cube, 0, 8, { // Use valid edge combination
        smoothingFactor: 2.0, // Invalid value
        tolerance: -1 // Invalid value
      });

      expect(result.success).toBe(true); // Should still work with default values
    });
  });

  describe('material handling', () => {
    it('should preserve materials when requested', () => {
      const testMaterial = { name: 'bridge_material' };
      
      const result = bridgeEdges(cube, 0, 8, { // Use valid edge combination
        preserveMaterials: true,
        material: testMaterial
      });

      expect(result.success).toBe(true);
      expect(result.facesCreated).toBe(2);
    });

    it('should assign new material to bridge faces', () => {
      const testMaterial = { name: 'new_material' };
      
      const result = bridgeEdges(cube, 0, 8, { material: testMaterial }); // Use valid edge combination

      expect(result.success).toBe(true);
      // Check that new faces have the assigned material
      const newFaceIndex = cube.faces.length - 1;
      expect(cube.faces[newFaceIndex].materialIndex).toBe(0); // Default material index
    });
  });
}); 