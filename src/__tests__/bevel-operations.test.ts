import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { createCube } from '../primitives/createCube.ts';
import { bevel, bevelEdge, bevelVertex, bevelFace } from '../editing/bevel.ts';
import { Face } from '../core/Face.ts';
import { Vertex } from '../core/Vertex.ts';

describe('Bevel Operations', () => {
  let mesh: EditableMesh;

  beforeEach(() => {
    mesh = createCube();
  });

  describe('Edge Beveling', () => {
    it('should bevel an edge with default options', () => {
      const originalVertexCount = mesh.getVertexCount();
      const originalEdgeCount = mesh.getEdgeCount();
      const originalFaceCount = mesh.getFaceCount();

      const result = bevelEdge(mesh, 0);

      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
      expect(result.getEdgeCount()).toBeGreaterThan(originalEdgeCount);
      expect(result.getFaceCount()).toBeGreaterThan(originalFaceCount);
    });

    it('should bevel an edge with custom options', () => {
      const originalVertexCount = mesh.getVertexCount();
      const options = {
        distance: 0.2,
        segments: 3,
        profile: 0.5,
        materialIndex: 1,
        keepOriginal: false,
        bothSides: true
      };

      const result = bevelEdge(mesh, 0, options);

      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
      
      // Check that new vertices were created
      const newVertices = result.vertices.slice(originalVertexCount);
      expect(newVertices.length).toBeGreaterThan(0);
      
      // Check that vertices are positioned correctly
      for (const vertex of newVertices) {
        expect(Number.isFinite(vertex.x)).toBe(true);
        expect(Number.isFinite(vertex.y)).toBe(true);
        expect(Number.isFinite(vertex.z)).toBe(true);
      }
    });

    it('should handle beveling with custom direction', () => {
      const originalVertexCount = mesh.getVertexCount();
      const options = {
        distance: 0.1,
        direction: new Vector3(1, 0, 0)
      };

      const result = bevelEdge(mesh, 0, options);

      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
    });

    it('should throw error for invalid edge index', () => {
      expect(() => {
        bevelEdge(mesh, 999);
      }).toThrow('Edge 999 not found');
    });
  });

  describe('Vertex Beveling', () => {
    it('should bevel a vertex with default options', () => {
      const originalVertexCount = mesh.getVertexCount();
      const originalEdgeCount = mesh.getEdgeCount();
      const originalFaceCount = mesh.getFaceCount();

      const result = bevelVertex(mesh, 0);

      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
      expect(result.getEdgeCount()).toBeGreaterThan(originalEdgeCount);
      expect(result.getFaceCount()).toBeGreaterThan(originalFaceCount);
    });

    it('should bevel a vertex with custom options', () => {
      const originalVertexCount = mesh.getVertexCount();
      const options = {
        distance: 0.2,
        segments: 3,
        profile: 0.5,
        materialIndex: 1,
        keepOriginal: false,
        allEdges: true
      };

      const result = bevelVertex(mesh, 0, options);

      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
      
      // Check that new vertices were created
      const newVertices = result.vertices.slice(originalVertexCount);
      expect(newVertices.length).toBeGreaterThan(0);
      
      // Check that vertices are positioned correctly
      for (const vertex of newVertices) {
        expect(Number.isFinite(vertex.x)).toBe(true);
        expect(Number.isFinite(vertex.y)).toBe(true);
        expect(Number.isFinite(vertex.z)).toBe(true);
      }
    });

    it('should handle beveling with custom direction', () => {
      const originalVertexCount = mesh.getVertexCount();
      const options = {
        distance: 0.1,
        direction: new Vector3(0, 1, 0)
      };

      const result = bevelVertex(mesh, 0, options);

      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
    });

    it('should throw error for invalid vertex index', () => {
      expect(() => {
        bevelVertex(mesh, 999);
      }).toThrow('Vertex 999 not found');
    });

    it('should throw error for vertex with no connected edges', () => {
      // Create a mesh with isolated vertex
      const isolatedMesh = new EditableMesh();
      isolatedMesh.addVertex(new Vertex(0, 0, 0));
      
      expect(() => {
        bevelVertex(isolatedMesh, 0);
      }).toThrow('No edges connected to vertex 0');
    });
  });

  describe('Face Beveling', () => {
    it('should bevel a face with default options', () => {
      const originalVertexCount = mesh.getVertexCount();
      const originalEdgeCount = mesh.getEdgeCount();
      const originalFaceCount = mesh.getFaceCount();

      const result = bevelFace(mesh, 0);

      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
      expect(result.getEdgeCount()).toBeGreaterThan(originalEdgeCount);
      expect(result.getFaceCount()).toBeGreaterThan(originalFaceCount);
    });

    it('should bevel a face with custom options', () => {
      const originalVertexCount = mesh.getVertexCount();
      const options = {
        distance: 0.2,
        segments: 3,
        profile: 0.5,
        materialIndex: 1,
        keepOriginal: false,
        allEdges: true
      };

      const result = bevelFace(mesh, 0, options);

      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
      
      // Check that new vertices were created
      const newVertices = result.vertices.slice(originalVertexCount);
      expect(newVertices.length).toBeGreaterThan(0);
      
      // Check that vertices are positioned correctly
      for (const vertex of newVertices) {
        expect(Number.isFinite(vertex.x)).toBe(true);
        expect(Number.isFinite(vertex.y)).toBe(true);
        expect(Number.isFinite(vertex.z)).toBe(true);
      }
    });

    it('should handle beveling with custom direction', () => {
      const originalVertexCount = mesh.getVertexCount();
      const options = {
        distance: 0.1,
        direction: new Vector3(0, 0, 1)
      };

      const result = bevelFace(mesh, 0, options);

      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
    });

    it('should throw error for invalid face index', () => {
      expect(() => {
        bevelFace(mesh, 999);
      }).toThrow('Face 999 not found');
    });

    it('should handle face with no edges', () => {
      // Create a mesh with face but no edges
      const emptyMesh = new EditableMesh();
      emptyMesh.addFace(new Face([], []));
      
      expect(() => {
        bevelFace(emptyMesh, 0);
      }).toThrow('No edges found for face 0');
    });
  });

  describe('Generic Bevel Function', () => {
    it('should bevel edge using generic function', () => {
      const originalVertexCount = mesh.getVertexCount();
      const result = bevel(mesh, 'edge', 0, { distance: 0.1 });
      
      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
    });

    it('should bevel vertex using generic function', () => {
      const originalVertexCount = mesh.getVertexCount();
      const result = bevel(mesh, 'vertex', 0, { distance: 0.1 });
      
      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
    });

    it('should bevel face using generic function', () => {
      const originalVertexCount = mesh.getVertexCount();
      const result = bevel(mesh, 'face', 0, { distance: 0.1 });
      
      expect(result).toBe(mesh);
      expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
    });

    it('should throw error for invalid bevel type', () => {
      expect(() => {
        bevel(mesh, 'invalid' as any, 0, {});
      }).toThrow('Unknown bevel type: invalid');
    });
  });

  describe('Integration Tests', () => {
    it('should maintain mesh topology after bevel operations', () => {
      const originalVertexCount = mesh.getVertexCount();
      const originalEdgeCount = mesh.getEdgeCount();
      const originalFaceCount = mesh.getFaceCount();

      // Bevel an edge
      const edgeBevelResult = bevelEdge(mesh, 0, { distance: 0.1 });
      expect(edgeBevelResult.getVertexCount()).toBeGreaterThan(originalVertexCount);
      expect(edgeBevelResult.getEdgeCount()).toBeGreaterThan(originalEdgeCount);
      expect(edgeBevelResult.getFaceCount()).toBeGreaterThan(originalFaceCount);

      // Test vertex beveling on a fresh mesh
      const vertexMesh = createCube();
      const vertexBevelResult = bevelVertex(vertexMesh, 1, { distance: 0.1 });
      expect(vertexBevelResult.getVertexCount()).toBeGreaterThan(originalVertexCount);
      expect(vertexBevelResult.getEdgeCount()).toBeGreaterThan(originalEdgeCount);
      expect(vertexBevelResult.getFaceCount()).toBeGreaterThan(originalFaceCount);

      // Test face beveling on a fresh mesh
      const faceMesh = createCube();
      const faceBevelResult = bevelFace(faceMesh, 0, { distance: 0.1 });
      expect(faceBevelResult.getVertexCount()).toBeGreaterThan(originalVertexCount);
      expect(faceBevelResult.getEdgeCount()).toBeGreaterThan(originalEdgeCount);
      expect(faceBevelResult.getFaceCount()).toBeGreaterThan(originalFaceCount);
    });

    it('should work with different bevel parameters', () => {
      const testCases = [
        { distance: 0.05, segments: 1, profile: 0 },
        { distance: 0.1, segments: 2, profile: 0.5 },
        { distance: 0.2, segments: 3, profile: 1.0 }
      ];

      for (const testCase of testCases) {
        const testMesh = createCube();
        const originalVertexCount = testMesh.getVertexCount();
        
        const result = bevelEdge(testMesh, 0, testCase);
        
        expect(result.getVertexCount()).toBeGreaterThan(originalVertexCount);
        
        // Check that all new vertices have valid coordinates
        for (let i = originalVertexCount; i < result.getVertexCount(); i++) {
          const vertex = result.getVertex(i);
          expect(vertex).toBeDefined();
          expect(Number.isFinite(vertex!.x)).toBe(true);
          expect(Number.isFinite(vertex!.y)).toBe(true);
          expect(Number.isFinite(vertex!.z)).toBe(true);
        }
      }
    });

    it('should preserve vertex properties in bevel operations', () => {
      const result = bevelEdge(mesh, 0, { distance: 0.1 });
      
      // Check that all vertices have valid coordinates
      for (let i = 0; i < result.getVertexCount(); i++) {
        const vertex = result.getVertex(i);
        expect(vertex).toBeDefined();
        expect(Number.isFinite(vertex!.x)).toBe(true);
        expect(Number.isFinite(vertex!.y)).toBe(true);
        expect(Number.isFinite(vertex!.z)).toBe(true);
      }
    });

    it('should handle beveling with keepOriginal option', () => {
      const originalEdgeCount = mesh.getEdgeCount();
      
      // Test with keepOriginal: true (default)
      const result1 = bevelEdge(mesh, 0, { keepOriginal: true });
      expect(result1.getEdgeCount()).toBeGreaterThan(originalEdgeCount);
      
      // Test with keepOriginal: false
      const result2 = bevelEdge(mesh, 1, { keepOriginal: false });
      expect(result2.getEdgeCount()).toBeGreaterThan(originalEdgeCount);
    });
  });
}); 