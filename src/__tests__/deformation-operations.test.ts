import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { createCube } from '../primitives/createCube';
import { bend, twist, taper, deform, bendAdvanced, twistAdvanced, taperAdvanced } from '../transform/deform';

describe('Deformation Operations', () => {
  let mesh: EditableMesh;

  beforeEach(() => {
    mesh = createCube();
  });

  describe('Bend Operations', () => {
    it('should bend a mesh with default options', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));

      const result = bend(mesh);

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should bend a mesh with custom options', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const options = {
        angle: Math.PI / 2, // 90 degrees
        axis: new Vector3(0, 1, 0),
        center: new Vector3(0, 0, 0),
        direction: new Vector3(1, 0, 0),
        startPoint: new Vector3(-0.5, 0, 0),
        endPoint: new Vector3(0.5, 0, 0)
      };

      const result = bend(mesh, options);

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should handle bend with different axes', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const options = {
        angle: Math.PI / 4,
        axis: new Vector3(1, 0, 0), // X-axis
        startPoint: new Vector3(0, -0.5, 0),
        endPoint: new Vector3(0, 0.5, 0)
      };

      const result = bend(mesh, options);

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });
  });

  describe('Twist Operations', () => {
    it('should twist a mesh with default options', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));

      const result = twist(mesh);

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should twist a mesh with custom options', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const options = {
        angle: Math.PI, // 180 degrees
        axis: new Vector3(0, 1, 0),
        center: new Vector3(0, 0, 0),
        startPoint: new Vector3(0, -0.5, 0),
        endPoint: new Vector3(0, 0.5, 0)
      };

      const result = twist(mesh, options);

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should handle twist with different axes', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const options = {
        angle: Math.PI / 2,
        axis: new Vector3(1, 0, 0), // X-axis
        startPoint: new Vector3(-0.5, 0, 0),
        endPoint: new Vector3(0.5, 0, 0)
      };

      const result = twist(mesh, options);

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });
  });

  describe('Taper Operations', () => {
    it('should taper a mesh with default options', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));

      const result = taper(mesh);

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should taper a mesh with custom options', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const options = {
        factor: 0.8,
        axis: new Vector3(0, 1, 0),
        center: new Vector3(0, 0, 0),
        startPoint: new Vector3(0, -0.5, 0),
        endPoint: new Vector3(0, 0.5, 0),
        uniform: true
      };

      const result = taper(mesh, options);

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should handle non-uniform taper', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const options = {
        factor: 0.5,
        axis: new Vector3(0, 1, 0),
        uniform: false
      };

      const result = taper(mesh, options);

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });
  });

  describe('Generic Deform Function', () => {
    it('should bend using generic function', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      const result = deform(mesh, 'bend', { angle: Math.PI / 4 });
      
      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should twist using generic function', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      const result = deform(mesh, 'twist', { angle: Math.PI / 2 });
      
      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should taper using generic function', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      const result = deform(mesh, 'taper', { factor: 0.3 });
      
      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should throw error for invalid deform type', () => {
      expect(() => {
        deform(mesh, 'invalid' as any, {});
      }).toThrow('Unknown deformation type: invalid');
    });
  });

  describe('Advanced Deformation Operations', () => {
    it('should perform advanced bend with control points', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const controlPoints = [
        new Vector3(-1, 0, 0),
        new Vector3(0, 0, 0),
        new Vector3(1, 0, 0)
      ];

      const result = bendAdvanced(mesh, controlPoints, { angle: Math.PI / 3 });

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should perform advanced twist with custom twist rate', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const twistRate = (position: Vector3) => {
        return position.y * Math.PI / 2; // Twist based on Y position
      };

      const result = twistAdvanced(mesh, twistRate, { axis: new Vector3(0, 1, 0) });

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should perform advanced taper with custom taper profile', () => {
      const originalVertices = mesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
      
      const taperProfile = (position: Vector3) => {
        const factor = Math.abs(position.y);
        return new Vector3(1 - factor, 1 - factor, 1 - factor);
      };

      const result = taperAdvanced(mesh, taperProfile);

      expect(result).toBe(mesh);
      
      // Check that vertices have been modified
      let hasChanges = false;
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const original = originalVertices[i];
        const current = mesh.getVertex(i);
        if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
          hasChanges = true;
          break;
        }
      }
      expect(hasChanges).toBe(true);
    });

    it('should throw error for advanced bend with insufficient control points', () => {
      const controlPoints = [new Vector3(0, 0, 0)];
      
      expect(() => {
        bendAdvanced(mesh, controlPoints);
      }).toThrow('At least 2 control points are required for advanced bending');
    });
  });

  describe('Integration Tests', () => {
    it('should work with different deformation parameters', () => {
      const testCases = [
        { type: 'bend', options: { angle: Math.PI / 6 } },
        { type: 'bend', options: { angle: Math.PI / 3 } },
        { type: 'twist', options: { angle: Math.PI / 4 } },
        { type: 'twist', options: { angle: Math.PI / 2 } },
        { type: 'taper', options: { factor: 0.2 } },
        { type: 'taper', options: { factor: 0.8 } }
      ];

      for (const testCase of testCases) {
        const testMesh = createCube();
        const originalVertices = testMesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
        
        const result = deform(testMesh, testCase.type as any, testCase.options);
        
        // Check that vertices have been modified
        let hasChanges = false;
        for (let i = 0; i < result.getVertexCount(); i++) {
          const original = originalVertices[i];
          const current = result.getVertex(i);
          if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
            hasChanges = true;
            break;
          }
        }
        expect(hasChanges).toBe(true);
      }
    });

    it('should preserve vertex properties in deformation operations', () => {
      const result = bend(mesh, { angle: Math.PI / 4 });
      
      // Check that all vertices have valid coordinates
      for (let i = 0; i < result.getVertexCount(); i++) {
        const vertex = result.getVertex(i);
        expect(vertex).toBeDefined();
        expect(Number.isFinite(vertex!.x)).toBe(true);
        expect(Number.isFinite(vertex!.y)).toBe(true);
        expect(Number.isFinite(vertex!.z)).toBe(true);
      }
    });

    it('should handle deformation with different centers', () => {
      const centers = [
        new Vector3(0, 0, 0),
        new Vector3(1, 0, 0),
        new Vector3(0, 1, 0),
        new Vector3(0, 0, 1)
      ];

      for (const center of centers) {
        const testMesh = createCube();
        const originalVertices = testMesh.vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
        
        const result = bend(testMesh, { center });
        
        // Check that vertices have been modified
        let hasChanges = false;
        for (let i = 0; i < result.getVertexCount(); i++) {
          const original = originalVertices[i];
          const current = result.getVertex(i);
          if (current && (original.x !== current.x || original.y !== current.y || original.z !== current.z)) {
            hasChanges = true;
            break;
          }
        }
        expect(hasChanges).toBe(true);
      }
    });
  });
}); 