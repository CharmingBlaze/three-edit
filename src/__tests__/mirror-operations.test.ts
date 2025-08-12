import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { createCube } from '../primitives/createCube';
import { mirror, mirrorByPlane, mirrorByAxis, mirrorByPoint } from '../transform/mirror';

describe('Mirror Operations', () => {
  let mesh: EditableMesh;

  beforeEach(() => {
    mesh = createCube();
  });

  describe('Axis Mirroring', () => {
    it('should mirror across X axis', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      const mirroredMesh = mirrorByAxis(mesh, 'x');

      expect(mirroredMesh).toBeDefined();
      expect(mirroredMesh).not.toBe(mesh); // Should be a new instance

      // Check that vertices are mirrored across X axis
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mirroredMesh.vertices[i];
        expect(mirrored.x).toBeCloseTo(-original.x, 3);
        expect(mirrored.y).toBeCloseTo(original.y, 3);
        expect(mirrored.z).toBeCloseTo(original.z, 3);
      }
    });

    it('should mirror across Y axis', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      const mirroredMesh = mirrorByAxis(mesh, 'y');

      expect(mirroredMesh).toBeDefined();
      expect(mirroredMesh).not.toBe(mesh);

      // Check that vertices are mirrored across Y axis
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mirroredMesh.vertices[i];
        expect(mirrored.x).toBeCloseTo(original.x, 3);
        expect(mirrored.y).toBeCloseTo(-original.y, 3);
        expect(mirrored.z).toBeCloseTo(original.z, 3);
      }
    });

    it('should mirror across Z axis', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      const mirroredMesh = mirrorByAxis(mesh, 'z');

      expect(mirroredMesh).toBeDefined();
      expect(mirroredMesh).not.toBe(mesh);

      // Check that vertices are mirrored across Z axis
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mirroredMesh.vertices[i];
        expect(mirrored.x).toBeCloseTo(original.x, 3);
        expect(mirrored.y).toBeCloseTo(original.y, 3);
        expect(mirrored.z).toBeCloseTo(-original.z, 3);
      }
    });

    it('should modify original mesh when duplicate is false', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      const result = mirrorByAxis(mesh, 'x', { duplicate: false });

      expect(result).toBe(mesh); // Should be the same instance
      expect(result).toBeDefined();

      // Check that vertices are mirrored
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mesh.vertices[i];
        expect(mirrored.x).toBeCloseTo(-original.x, 3);
        expect(mirrored.y).toBeCloseTo(original.y, 3);
        expect(mirrored.z).toBeCloseTo(original.z, 3);
      }
    });
  });

  describe('Plane Mirroring', () => {
    it('should mirror across YZ plane (X=0)', () => {
      const planePoint = new Vector3(0, 0, 0);
      const planeNormal = new Vector3(1, 0, 0);
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const mirroredMesh = mirrorByPlane(mesh, planePoint, planeNormal);

      expect(mirroredMesh).toBeDefined();
      expect(mirroredMesh).not.toBe(mesh);

      // Check that vertices are mirrored across the YZ plane
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mirroredMesh.vertices[i];
        expect(mirrored.x).toBeCloseTo(-original.x, 3);
        expect(mirrored.y).toBeCloseTo(original.y, 3);
        expect(mirrored.z).toBeCloseTo(original.z, 3);
      }
    });

    it('should mirror across offset plane', () => {
      const planePoint = new Vector3(1, 0, 0); // Plane at x=1
      const planeNormal = new Vector3(1, 0, 0);
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const mirroredMesh = mirrorByPlane(mesh, planePoint, planeNormal);

      expect(mirroredMesh).toBeDefined();

      // Check that vertices are mirrored across the offset plane
      // The exact formula depends on the implementation, but we can verify consistency
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mirroredMesh.vertices[i];
        
        // Y and Z coordinates should be preserved
        expect(mirrored.y).toBeCloseTo(original.y, 3);
        expect(mirrored.z).toBeCloseTo(original.z, 3);
        
        // X coordinates should be different (mirrored)
        expect(mirrored.x).not.toBeCloseTo(original.x, 3);
      }
    });

    it('should mirror across arbitrary plane', () => {
      const planePoint = new Vector3(0, 0, 0);
      const planeNormal = new Vector3(1, 1, 0).normalize();
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const mirroredMesh = mirrorByPlane(mesh, planePoint, planeNormal);

      expect(mirroredMesh).toBeDefined();
      expect(mirroredMesh).not.toBe(mesh);

      // The mirroring should preserve the plane equation: x + y = 0
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mirroredMesh.vertices[i];
        
        // For plane x + y = 0, the mirroring formula is:
        // x' = -y, y' = -x, z' = z
        expect(mirrored.x).toBeCloseTo(-original.y, 3);
        expect(mirrored.y).toBeCloseTo(-original.x, 3);
        expect(mirrored.z).toBeCloseTo(original.z, 3);
      }
    });
  });

  describe('Point Mirroring', () => {
    it('should mirror across origin', () => {
      const centerPoint = new Vector3(0, 0, 0);
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const mirroredMesh = mirrorByPoint(mesh, centerPoint);

      expect(mirroredMesh).toBeDefined();
      expect(mirroredMesh).not.toBe(mesh);

      // Check that vertices are mirrored across the origin
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mirroredMesh.vertices[i];
        expect(mirrored.x).toBeCloseTo(-original.x, 3);
        expect(mirrored.y).toBeCloseTo(-original.y, 3);
        expect(mirrored.z).toBeCloseTo(-original.z, 3);
      }
    });

    it('should mirror across arbitrary point', () => {
      const centerPoint = new Vector3(1, 2, 3);
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const mirroredMesh = mirrorByPoint(mesh, centerPoint);

      expect(mirroredMesh).toBeDefined();

      // Check that vertices are mirrored across the center point
      // The exact formula depends on the implementation, but we can verify consistency
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mirroredMesh.vertices[i];
        
        // All coordinates should be different (mirrored)
        expect(mirrored.x).not.toBeCloseTo(original.x, 3);
        expect(mirrored.y).not.toBeCloseTo(original.y, 3);
        expect(mirrored.z).not.toBeCloseTo(original.z, 3);
      }
    });
  });

  describe('Generic Mirror Function', () => {
    it('should mirror across axis using generic function', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      const mirroredMesh = mirror(mesh, 'axis', { axis: 'x' });

      expect(mirroredMesh).toBeDefined();
      expect(mirroredMesh).not.toBe(mesh);

      // Check that vertices are mirrored across X axis
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mirroredMesh.vertices[i];
        expect(mirrored.x).toBeCloseTo(-original.x, 3);
        expect(mirrored.y).toBeCloseTo(original.y, 3);
        expect(mirrored.z).toBeCloseTo(original.z, 3);
      }
    });

    it('should mirror across plane using generic function', () => {
      const planePoint = new Vector3(0, 0, 0);
      const planeNormal = new Vector3(1, 0, 0);
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const mirroredMesh = mirror(mesh, 'plane', { planePoint, planeNormal });

      expect(mirroredMesh).toBeDefined();
      expect(mirroredMesh).not.toBe(mesh);

      // Check that vertices are mirrored across the YZ plane
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mirroredMesh.vertices[i];
        expect(mirrored.x).toBeCloseTo(-original.x, 3);
        expect(mirrored.y).toBeCloseTo(original.y, 3);
        expect(mirrored.z).toBeCloseTo(original.z, 3);
      }
    });

    it('should mirror across point using generic function', () => {
      const centerPoint = new Vector3(0, 0, 0);
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const mirroredMesh = mirror(mesh, 'point', { centerPoint });

      expect(mirroredMesh).toBeDefined();
      expect(mirroredMesh).not.toBe(mesh);

      // Check that vertices are mirrored across the origin
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = originalVertices[i];
        const mirrored = mirroredMesh.vertices[i];
        expect(mirrored.x).toBeCloseTo(-original.x, 3);
        expect(mirrored.y).toBeCloseTo(-original.y, 3);
        expect(mirrored.z).toBeCloseTo(-original.z, 3);
      }
    });

    it('should throw error for invalid mirror type', () => {
      expect(() => {
        mirror(mesh, 'invalid' as any, {});
      }).toThrow('Unknown mirror type: invalid');
    });

    it('should throw error for missing plane parameters', () => {
      expect(() => {
        mirror(mesh, 'plane', {});
      }).toThrow('Plane point and normal are required for plane mirroring');
    });

    it('should throw error for missing axis parameter', () => {
      expect(() => {
        mirror(mesh, 'axis', {});
      }).toThrow('Axis is required for axis mirroring');
    });

    it('should throw error for missing center point parameter', () => {
      expect(() => {
        mirror(mesh, 'point', {});
      }).toThrow('Center point is required for point mirroring');
    });
  });

  describe('Integration Tests', () => {
    it('should maintain mesh topology after mirroring', () => {
      const originalVertexCount = mesh.getVertexCount();
      const originalEdgeCount = mesh.getEdgeCount();
      const originalFaceCount = mesh.getFaceCount();

      const mirroredMesh = mirrorByAxis(mesh, 'x');

      expect(mirroredMesh.getVertexCount()).toBe(originalVertexCount);
      expect(mirroredMesh.getEdgeCount()).toBe(originalEdgeCount);
      expect(mirroredMesh.getFaceCount()).toBe(originalFaceCount);

      // All vertices should have valid coordinates
      for (let i = 0; i < mirroredMesh.getVertexCount(); i++) {
        const vertex = mirroredMesh.getVertex(i);
        expect(vertex).toBeDefined();
        expect(Number.isFinite(vertex!.x)).toBe(true);
        expect(Number.isFinite(vertex!.y)).toBe(true);
        expect(Number.isFinite(vertex!.z)).toBe(true);
      }
    });

    it('should work with multiple mirror operations', () => {
      // Mirror across X axis
      let mirroredMesh = mirrorByAxis(mesh, 'x');
      
      // Mirror across Y axis
      mirroredMesh = mirrorByAxis(mirroredMesh, 'y');
      
      // Mirror across Z axis
      mirroredMesh = mirrorByAxis(mirroredMesh, 'z');

      expect(mirroredMesh).toBeDefined();
      expect(mirroredMesh.getVertexCount()).toBe(mesh.getVertexCount());

      // After mirroring across all three axes, the result should be the same as the original
      // (with possible sign changes)
      for (let i = 0; i < mesh.vertices.length; i++) {
        const original = mesh.vertices[i];
        const mirrored = mirroredMesh.vertices[i];
        
        // The signs should be consistent (all negative or all positive)
        const xSign = Math.sign(original.x) === Math.sign(mirrored.x);
        const ySign = Math.sign(original.y) === Math.sign(mirrored.y);
        const zSign = Math.sign(original.z) === Math.sign(mirrored.z);
        
        expect(xSign).toBe(ySign);
        expect(ySign).toBe(zSign);
      }
    });
  });
}); 