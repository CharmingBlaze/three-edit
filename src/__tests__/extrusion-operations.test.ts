import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { createCube } from '../primitives/createCube.ts';
import { extrudeEdge, extrudeEdges } from '../editing/extrudeEdge.ts';
import { extrudeVertex, extrudeVertices, extrudeVertexWithFace } from '../editing/extrudeVertex.ts';

describe('Extrusion Operations', () => {
  let mesh: EditableMesh;

  beforeEach(() => {
    mesh = createCube();
  });

  describe('Edge Extrusion', () => {
    it('should extrude a single edge', () => {
      const initialFaceCount = mesh.getFaceCount();
      const initialEdgeCount = mesh.getEdgeCount();
      const initialVertexCount = mesh.getVertexCount();

      const newFaceIndex = extrudeEdge(mesh, 0, { distance: 1 });

      expect(newFaceIndex).toBeGreaterThan(-1);
      expect(mesh.getFaceCount()).toBe(initialFaceCount + 1);
      expect(mesh.getEdgeCount()).toBe(initialEdgeCount + 3); // +4 new edges, -1 original edge
      expect(mesh.getVertexCount()).toBe(initialVertexCount + 2);
    });

    it('should extrude an edge with custom direction', () => {
      const direction = new Vector3(1, 0, 0);
      const newFaceIndex = extrudeEdge(mesh, 0, { 
        distance: 2, 
        direction 
      });

      expect(newFaceIndex).toBeGreaterThan(-1);
      
      // Check that the new vertices are in the expected direction
      // The edge indices may have changed, so we need to find the new vertices
      const newVertices = mesh.vertices.slice(-2); // Get the last 2 vertices (the new ones)
      expect(newVertices[0].x).toBeCloseTo(-0.5 + 2, 3);
      expect(newVertices[1].x).toBeCloseTo(0.5 + 2, 3);
    });

    it('should extrude multiple edges', () => {
      const edgeIndices = [0, 1, 2];
      const newFaceIndices = extrudeEdges(mesh, edgeIndices, { distance: 1 });

      expect(newFaceIndices).toHaveLength(3);
      expect(newFaceIndices.every(index => index > -1)).toBe(true);
    });

    it('should handle invalid edge index', () => {
      const newFaceIndex = extrudeEdge(mesh, 999, { distance: 1 });
      expect(newFaceIndex).toBe(-1);
    });

    it('should keep original edge when keepOriginal is true', () => {
      const initialEdgeCount = mesh.getEdgeCount();
      extrudeEdge(mesh, 0, { distance: 1, keepOriginal: true });
      
      expect(mesh.getEdgeCount()).toBe(initialEdgeCount + 4);
    });

    it('should remove original edge when keepOriginal is false', () => {
      const initialEdgeCount = mesh.getEdgeCount();
      extrudeEdge(mesh, 0, { distance: 1, keepOriginal: false });
      
      expect(mesh.getEdgeCount()).toBe(initialEdgeCount + 3); // +4 new edges, -1 original edge
    });
  });

  describe('Vertex Extrusion', () => {
    it('should extrude a single vertex', () => {
      const initialVertexCount = mesh.getVertexCount();
      const initialEdgeCount = mesh.getEdgeCount();

      const newVertexIndex = extrudeVertex(mesh, 0, { distance: 1 });

      expect(newVertexIndex).toBeGreaterThan(-1);
      expect(mesh.getVertexCount()).toBe(initialVertexCount); // +1 new vertex, -1 original vertex
      expect(mesh.getEdgeCount()).toBe(initialEdgeCount + 1);
    });

    it('should extrude a vertex with custom direction', () => {
      const direction = new Vector3(0, 1, 0);
      const newVertexIndex = extrudeVertex(mesh, 0, { 
        distance: 2, 
        direction 
      });

      expect(newVertexIndex).toBeGreaterThan(-1);
      
      // Check that the new vertex is in the expected direction
      const newVertex = mesh.getVertex(newVertexIndex);
      const originalVertex = mesh.getVertex(0);
      
      expect(newVertex!.y).toBeCloseTo(originalVertex!.y + 2, 3);
    });

    it('should extrude multiple vertices', () => {
      const vertexIndices = [0, 1, 2];
      const newVertexIndices = extrudeVertices(mesh, vertexIndices, { distance: 1 });

      expect(newVertexIndices).toHaveLength(3);
      expect(newVertexIndices.every(index => index > -1)).toBe(true);
    });

    it('should handle invalid vertex index', () => {
      const newVertexIndex = extrudeVertex(mesh, 999, { distance: 1 });
      expect(newVertexIndex).toBe(-1);
    });

    it('should not create edges when createEdges is false', () => {
      const initialEdgeCount = mesh.getEdgeCount();
      extrudeVertex(mesh, 0, { distance: 1, createEdges: false });
      
      expect(mesh.getEdgeCount()).toBe(initialEdgeCount);
    });

    it('should keep original vertex when keepOriginal is true', () => {
      const initialVertexCount = mesh.getVertexCount();
      extrudeVertex(mesh, 0, { distance: 1, keepOriginal: true });
      
      expect(mesh.getVertexCount()).toBe(initialVertexCount + 1);
    });

    it('should remove original vertex when keepOriginal is false', () => {
      const initialVertexCount = mesh.getVertexCount();
      extrudeVertex(mesh, 0, { distance: 1, keepOriginal: false });
      
      expect(mesh.getVertexCount()).toBe(initialVertexCount); // +1 new vertex, -1 original vertex
    });
  });

  describe('Vertex Extrusion with Face Creation', () => {
    it('should extrude vertex and create faces', () => {
      const initialFaceCount = mesh.getFaceCount();
      const initialEdgeCount = mesh.getEdgeCount();
      const initialVertexCount = mesh.getVertexCount();

      const result = extrudeVertexWithFace(mesh, 0, { distance: 1 });

      expect(result.newVertexIndex).toBeGreaterThan(-1);
      expect(result.newFaceIndices.length).toBeGreaterThan(0);
      expect(mesh.getFaceCount()).toBe(initialFaceCount + result.newFaceIndices.length);
      expect(mesh.getEdgeCount()).toBeGreaterThan(initialEdgeCount);
      expect(mesh.getVertexCount()).toBe(initialVertexCount); // +1 new vertex, -1 original vertex
    });

    it('should handle invalid vertex for face creation', () => {
      const result = extrudeVertexWithFace(mesh, 999, { distance: 1 });
      
      expect(result.newVertexIndex).toBe(-1);
      expect(result.newFaceIndices).toHaveLength(0);
    });
  });

  describe('Integration Tests', () => {
    it('should work with complex mesh operations', () => {
      // Create a more complex mesh by extruding multiple elements
      const edgeResult = extrudeEdge(mesh, 0, { distance: 1 });
      expect(edgeResult).toBeGreaterThan(-1);

      const vertexResult = extrudeVertex(mesh, 0, { distance: 0.5 });
      expect(vertexResult).toBeGreaterThan(-1);

      // Verify mesh integrity
      expect(mesh.getVertexCount()).toBeGreaterThan(8); // More than original cube
      expect(mesh.getEdgeCount()).toBeGreaterThan(12);
      expect(mesh.getFaceCount()).toBeGreaterThan(6);
    });

    it('should maintain mesh topology after extrusion', () => {
      const initialVertices = mesh.getVertexCount();
      const initialEdges = mesh.getEdgeCount();
      const initialFaces = mesh.getFaceCount();

      // Perform multiple extrusions
      extrudeEdge(mesh, 0, { distance: 1 });
      extrudeVertex(mesh, 0, { distance: 0.5 });
      extrudeEdge(mesh, 1, { distance: 0.5 });

      // Verify that the mesh still has valid topology
      expect(mesh.getVertexCount()).toBeGreaterThan(initialVertices);
      expect(mesh.getEdgeCount()).toBeGreaterThan(initialEdges);
      expect(mesh.getFaceCount()).toBeGreaterThan(initialFaces);

      // All vertices should have valid coordinates
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const vertex = mesh.getVertex(i);
        expect(vertex).toBeDefined();
        expect(Number.isFinite(vertex!.x)).toBe(true);
        expect(Number.isFinite(vertex!.y)).toBe(true);
        expect(Number.isFinite(vertex!.z)).toBe(true);
      }
    });
  });
}); 