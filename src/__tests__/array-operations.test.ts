import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { createCube } from '../primitives/createCube';
import { array, arrayLinear, arrayRadial, arrayGrid } from '../transform/array';

describe('Array Operations', () => {
  let mesh: EditableMesh;

  beforeEach(() => {
    mesh = createCube();
  });

  describe('Linear Array', () => {
    it('should create a linear array with default options', () => {
      const result = arrayLinear(mesh);
      
      expect(Array.isArray(result)).toBe(true);
      expect((result as EditableMesh[]).length).toBe(3);
      
      // Check that all meshes are different instances
      for (let i = 0; i < (result as EditableMesh[]).length; i++) {
        expect((result as EditableMesh[])[i]).toBeInstanceOf(EditableMesh);
        expect((result as EditableMesh[])[i]).not.toBe(mesh);
        if (i > 0) {
          expect((result as EditableMesh[])[i]).not.toBe((result as EditableMesh[])[i - 1]);
        }
      }
    });

    it('should create a linear array with custom options', () => {
      const options = {
        count: 5,
        distance: 2,
        direction: new Vector3(0, 1, 0),
        offset: new Vector3(1, 0, 0)
      };
      
      const result = arrayLinear(mesh, options);
      
      expect(Array.isArray(result)).toBe(true);
      expect((result as EditableMesh[]).length).toBe(5);
      
      // Check positions of instances - account for cube geometry and transformations
      for (let i = 0; i < (result as EditableMesh[]).length; i++) {
        const instance = (result as EditableMesh[])[i];
        const expectedY = options.offset.y + i * options.distance;
        
        // Check that vertices are positioned correctly (accounting for cube bounds)
        for (const vertex of instance.vertices) {
          // Cube vertices are from -0.5 to 0.5, so check they're in the right range
          // The actual positions include the cube bounds, so we need to account for that
          expect(vertex.x).toBeGreaterThanOrEqual(options.offset.x - 0.5);
          expect(vertex.x).toBeLessThanOrEqual(options.offset.x + 0.5);
          expect(vertex.y).toBeGreaterThanOrEqual(expectedY - 0.5);
          expect(vertex.y).toBeLessThanOrEqual(expectedY + 0.5);
          // Z should be within cube bounds
          expect(vertex.z).toBeGreaterThanOrEqual(-0.5);
          expect(vertex.z).toBeLessThanOrEqual(0.5);
        }
      }
    });

    it('should merge linear array into single mesh', () => {
      const options = {
        count: 3,
        distance: 1,
        merge: true
      };
      
      const result = arrayLinear(mesh, options);
      
      expect(result).toBeInstanceOf(EditableMesh);
      expect(result).not.toBe(mesh);
      
      // Check that the merged mesh has more vertices than original
      expect((result as EditableMesh).getVertexCount()).toBe(mesh.getVertexCount() * 3);
      expect((result as EditableMesh).getFaceCount()).toBe(mesh.getFaceCount() * 3);
    });
  });

  describe('Radial Array', () => {
    it('should create a radial array with default options', () => {
      const result = arrayRadial(mesh);
      
      expect(Array.isArray(result)).toBe(true);
      expect((result as EditableMesh[]).length).toBe(8);
      
      // Check that all meshes are different instances
      for (let i = 0; i < (result as EditableMesh[]).length; i++) {
        expect((result as EditableMesh[])[i]).toBeInstanceOf(EditableMesh);
        expect((result as EditableMesh[])[i]).not.toBe(mesh);
      }
    });

    it('should create a radial array with custom options', () => {
      const options = {
        count: 4,
        radius: 2,
        center: new Vector3(1, 1, 0),
        axis: new Vector3(0, 0, 1),
        startAngle: 0,
        endAngle: Math.PI
      };
      
      const result = arrayRadial(mesh, options);
      
      expect(Array.isArray(result)).toBe(true);
      expect((result as EditableMesh[]).length).toBe(4);
      
      // Check that instances are positioned in a circle
      for (let i = 0; i < (result as EditableMesh[]).length; i++) {
        const instance = (result as EditableMesh[])[i];
        const angle = (options.endAngle - options.startAngle) / options.count * i;
        const expectedX = options.center.x + options.radius * Math.cos(angle);
        const expectedY = options.center.y + options.radius * Math.sin(angle);
        
        // Check that vertices are positioned correctly (accounting for cube bounds)
        for (const vertex of instance.vertices) {
          // Use a more flexible range check since vertices can be slightly outside due to transformations
          expect(vertex.x).toBeGreaterThanOrEqual(expectedX - 1);
          expect(vertex.x).toBeLessThanOrEqual(expectedX + 1);
          expect(vertex.y).toBeGreaterThanOrEqual(expectedY - 1);
          expect(vertex.y).toBeLessThanOrEqual(expectedY + 1);
          // Z should be within cube bounds
          expect(vertex.z).toBeGreaterThanOrEqual(-0.5);
          expect(vertex.z).toBeLessThanOrEqual(0.5);
        }
      }
    });

    it('should merge radial array into single mesh', () => {
      const options = {
        count: 4,
        radius: 1,
        merge: true
      };
      
      const result = arrayRadial(mesh, options);
      
      expect(result).toBeInstanceOf(EditableMesh);
      expect(result).not.toBe(mesh);
      
      // Check that the merged mesh has more vertices than original
      expect((result as EditableMesh).getVertexCount()).toBe(mesh.getVertexCount() * 4);
      expect((result as EditableMesh).getFaceCount()).toBe(mesh.getFaceCount() * 4);
    });
  });

  describe('Grid Array', () => {
    it('should create a grid array with default options', () => {
      const result = arrayGrid(mesh);
      
      expect(Array.isArray(result)).toBe(true);
      expect((result as EditableMesh[]).length).toBe(9); // 3x3x1
      
      // Check that all meshes are different instances
      for (let i = 0; i < (result as EditableMesh[]).length; i++) {
        expect((result as EditableMesh[])[i]).toBeInstanceOf(EditableMesh);
        expect((result as EditableMesh[])[i]).not.toBe(mesh);
      }
    });

    it('should create a grid array with custom options', () => {
      const options = {
        countX: 2,
        countY: 3,
        countZ: 2,
        distanceX: 2,
        distanceY: 1.5,
        distanceZ: 1,
        offset: new Vector3(0, 0, 0)
      };
      
      const result = arrayGrid(mesh, options);
      
      expect(Array.isArray(result)).toBe(true);
      expect((result as EditableMesh[]).length).toBe(12); // 2x3x2
      
      // Check that instances are positioned in a grid
      let index = 0;
      for (let x = 0; x < options.countX; x++) {
        for (let y = 0; y < options.countY; y++) {
          for (let z = 0; z < options.countZ; z++) {
            const instance = (result as EditableMesh[])[index];
            const expectedX = options.offset.x + x * options.distanceX;
            const expectedY = options.offset.y + y * options.distanceY;
            const expectedZ = options.offset.z + z * options.distanceZ;
            
            // Check that vertices are positioned correctly (accounting for cube bounds)
            for (const vertex of instance.vertices) {
              expect(vertex.x).toBeGreaterThanOrEqual(expectedX - 0.5);
              expect(vertex.x).toBeLessThanOrEqual(expectedX + 0.5);
              expect(vertex.y).toBeGreaterThanOrEqual(expectedY - 0.5);
              expect(vertex.y).toBeLessThanOrEqual(expectedY + 0.5);
              expect(vertex.z).toBeGreaterThanOrEqual(expectedZ - 0.5);
              expect(vertex.z).toBeLessThanOrEqual(expectedZ + 0.5);
            }
            index++;
          }
        }
      }
    });

    it('should merge grid array into single mesh', () => {
      const options = {
        countX: 2,
        countY: 2,
        countZ: 2,
        merge: true
      };
      
      const result = arrayGrid(mesh, options);
      
      expect(result).toBeInstanceOf(EditableMesh);
      expect(result).not.toBe(mesh);
      
      // Check that the merged mesh has more vertices than original
      expect((result as EditableMesh).getVertexCount()).toBe(mesh.getVertexCount() * 8);
      expect((result as EditableMesh).getFaceCount()).toBe(mesh.getFaceCount() * 8);
    });
  });

  describe('Generic Array', () => {
    it('should create linear array using generic array function', () => {
      const result = array(mesh, 'linear', { count: 3 });
      
      expect(Array.isArray(result)).toBe(true);
      expect((result as EditableMesh[]).length).toBe(3);
      
      for (let i = 0; i < (result as EditableMesh[]).length; i++) {
        expect((result as EditableMesh[])[i]).toBeInstanceOf(EditableMesh);
      }
    });

    it('should create radial array using generic array function', () => {
      const result = array(mesh, 'radial', { count: 4 });
      
      expect(Array.isArray(result)).toBe(true);
      expect((result as EditableMesh[]).length).toBe(4);
      
      for (let i = 0; i < (result as EditableMesh[]).length; i++) {
        expect((result as EditableMesh[])[i]).toBeInstanceOf(EditableMesh);
      }
    });

    it('should create grid array using generic array function', () => {
      const result = array(mesh, 'grid', { countX: 2, countY: 2 });
      
      expect(Array.isArray(result)).toBe(true);
      expect((result as EditableMesh[]).length).toBe(4);
      
      for (let i = 0; i < (result as EditableMesh[]).length; i++) {
        expect((result as EditableMesh[])[i]).toBeInstanceOf(EditableMesh);
      }
    });

    it('should handle merged results correctly', () => {
      const result = array(mesh, 'linear', { count: 2, merge: true });
      
      expect(result).toBeInstanceOf(EditableMesh);
      expect((result as EditableMesh).getVertexCount()).toBe(mesh.getVertexCount() * 2);
      expect((result as EditableMesh).getEdgeCount()).toBe(mesh.getEdgeCount() * 2);
      expect((result as EditableMesh).getFaceCount()).toBe(mesh.getFaceCount() * 2);
    });

    it('should handle array of merged meshes', () => {
      const result = array(mesh, 'linear', { count: 2, merge: true });
      
      expect(result).toBeInstanceOf(EditableMesh);
      const mergedMesh = result as EditableMesh;
      
      // Check that the merged mesh has the expected structure
      expect(mergedMesh.getVertexCount()).toBe(mesh.getVertexCount() * 2);
      expect(mergedMesh.getEdgeCount()).toBe(mesh.getEdgeCount() * 2);
      expect(mergedMesh.getFaceCount()).toBe(mesh.getFaceCount() * 2);
      
      // Check that vertices are properly positioned
      const vertices = Array.from(mergedMesh.vertices);
      expect(vertices.length).toBe(mesh.getVertexCount() * 2);
      
      // Check that faces are properly constructed
      const faces = Array.from(mergedMesh.faces);
      expect(faces.length).toBe(mesh.getFaceCount() * 2);
    });
  });
}); 