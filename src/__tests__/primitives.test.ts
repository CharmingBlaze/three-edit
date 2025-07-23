import { describe, it, expect } from 'vitest';

import { createCube } from '../primitives/createCube.ts';
import { createSphere } from '../primitives/createSphere.ts';
import { createCylinder } from '../primitives/createCylinder.ts';
import { createCone } from '../primitives/createCone.ts';
import { createPlane } from '../primitives/createPlane.ts';
import { createTorus } from '../primitives/createTorus.ts';
import { createCircle } from '../primitives/createCircle.ts';
import { createPyramid } from '../primitives/createPyramid.ts';
import { createCapsule } from '../primitives/createCapsule.ts';
import { validateMesh } from '../validation/validateMesh.ts';
import { toBufferGeometry } from '../conversion/toBufferGeometry.ts';

describe('Primitives', () => {
  describe('createCube', () => {
    it('should create a valid cube with default options', () => {
      const cube = createCube();
      const validation = validateMesh(cube);
      
      expect(validation.isValid).toBe(true);
      expect(cube.vertices.length).toBeGreaterThan(0);
      expect(cube.faces.length).toBeGreaterThan(0);
      expect(cube.name).toBe('Cube');
    });

    it('should create a cube with custom dimensions', () => {
      const cube = createCube({ width: 2, height: 3, depth: 4 });
      const validation = validateMesh(cube);
      
      expect(validation.isValid).toBe(true);
      expect(cube.name).toBe('Cube');
    });

    it('should create a custom sized cube', () => {
      const cube = createCube({ 
        width: 2, 
        height: 3, 
        depth: 4 
      });
      const validation = validateMesh(cube);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createSphere', () => {
    it('should create a valid sphere with default options', () => {
      const sphere = createSphere();
      const validation = validateMesh(sphere);
      
      expect(validation.isValid).toBe(true);
      expect(sphere.vertices.length).toBeGreaterThan(0);
      expect(sphere.faces.length).toBeGreaterThan(0);
      expect(sphere.name).toBe('Sphere');
    });

    it('should create a sphere with custom radius', () => {
      const sphere = createSphere({ radius: 2 });
      const validation = validateMesh(sphere);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a high-resolution sphere', () => {
      const sphere = createSphere({ 
        widthSegments: 16, 
        heightSegments: 16 
      });
      const validation = validateMesh(sphere);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createCylinder', () => {
    it('should create a valid cylinder with default options', () => {
      const cylinder = createCylinder();
      const validation = validateMesh(cylinder);
      
      expect(validation.isValid).toBe(true);
      expect(cylinder.vertices.length).toBeGreaterThan(0);
      expect(cylinder.faces.length).toBeGreaterThan(0);
      expect(cylinder.name).toBe('Cylinder');
    });

    it('should create an open-ended cylinder', () => {
      const cylinder = createCylinder({ openEnded: true });
      const validation = validateMesh(cylinder);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a partial cylinder', () => {
      const cylinder = createCylinder({ 
        thetaStart: 0, 
        thetaLength: Math.PI 
      });
      const validation = validateMesh(cylinder);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createCone', () => {
    it('should create a valid cone with default options', () => {
      const cone = createCone();
      const validation = validateMesh(cone);
      
      expect(validation.isValid).toBe(true);
      expect(cone.vertices.length).toBeGreaterThan(0);
      expect(cone.faces.length).toBeGreaterThan(0);
      expect(cone.name).toBe('Cone');
    });

    it('should create an open-ended cone', () => {
      const cone = createCone({ openEnded: true });
      const validation = validateMesh(cone);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a partial cone', () => {
      const cone = createCone({ 
        thetaStart: 0, 
        thetaLength: Math.PI 
      });
      const validation = validateMesh(cone);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createPlane', () => {
    it('should create a valid plane with default options', () => {
      const plane = createPlane();
      const validation = validateMesh(plane);
      
      expect(validation.isValid).toBe(true);
      expect(plane.vertices.length).toBeGreaterThan(0);
      expect(plane.faces.length).toBeGreaterThan(0);
      expect(plane.name).toBe('Plane');
    });

    it('should create a segmented plane', () => {
      const plane = createPlane({ 
        widthSegments: 4, 
        heightSegments: 4 
      });
      const validation = validateMesh(plane);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createTorus', () => {
    it('should create a valid torus with default options', () => {
      const torus = createTorus();
      const validation = validateMesh(torus);
      
      expect(validation.isValid).toBe(true);
      expect(torus.vertices.length).toBeGreaterThan(0);
      expect(torus.faces.length).toBeGreaterThan(0);
      expect(torus.name).toBe('Torus');
    });

    it('should create a thin torus', () => {
      const torus = createTorus({ 
        radius: 2, 
        tubeRadius: 0.1 
      });
      const validation = validateMesh(torus);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a partial torus', () => {
      const torus = createTorus({ arc: Math.PI });
      const validation = validateMesh(torus);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createCircle', () => {
    it('should create a valid circle with default options', () => {
      const circle = createCircle();
      const validation = validateMesh(circle);
      
      expect(validation.isValid).toBe(true);
      expect(circle.vertices.length).toBeGreaterThan(0);
      expect(circle.faces.length).toBeGreaterThan(0);
      expect(circle.name).toBe('Circle');
    });

    it('should create a partial circle', () => {
      const circle = createCircle({ 
        thetaStart: 0, 
        thetaLength: Math.PI 
      });
      const validation = validateMesh(circle);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createPyramid', () => {
    it('should create a valid pyramid with default options', () => {
      const pyramid = createPyramid();
      const validation = validateMesh(pyramid);
      
      expect(validation.isValid).toBe(true);
      expect(pyramid.vertices.length).toBeGreaterThan(0);
      expect(pyramid.faces.length).toBeGreaterThan(0);
      expect(pyramid.name).toBe('Pyramid');
    });

    it('should create a segmented pyramid', () => {
      const pyramid = createPyramid({ 
        widthSegments: 2, 
        heightSegments: 2 
      });
      const validation = validateMesh(pyramid);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('createCapsule', () => {
    it('should create a valid capsule with default options', () => {
      const capsule = createCapsule();
      const validation = validateMesh(capsule);
      
      expect(validation.isValid).toBe(true);
      expect(capsule.vertices.length).toBeGreaterThan(0);
      expect(capsule.faces.length).toBeGreaterThan(0);
      expect(capsule.name).toBe('Capsule');
    });

    it('should create a tall capsule', () => {
      const capsule = createCapsule({ 
        radius: 0.5, 
        height: 4 
      });
      const validation = validateMesh(capsule);
      
      expect(validation.isValid).toBe(true);
    });

    it('should create a sphere-like capsule', () => {
      const capsule = createCapsule({ 
        radius: 1, 
        height: 2 
      });
      const validation = validateMesh(capsule);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Primitive Conversion', () => {
    it('should convert all primitives to BufferGeometry', () => {
      const primitives = [
        createCube(),
        createSphere(),
        createCylinder(),
        createCone(),
        createPlane(),
        createTorus(),
        createCircle(),
        createPyramid(),
        createCapsule(),
      ];

      for (const primitive of primitives) {
        const geometry = toBufferGeometry(primitive);
        expect(geometry.attributes.position).toBeDefined();
        expect(geometry.attributes.position.count).toBeGreaterThan(0);
      }
    });

    it('should generate proper UVs for all primitives', () => {
      const primitives = [
        createCube(),
        createSphere(),
        createCylinder(),
        createCone(),
        createPlane(),
        createTorus(),
        createCircle(),
        createPyramid(),
        createCapsule(),
      ];

      for (const primitive of primitives) {
        // Check that vertices have UVs
        const verticesWithUVs = primitive.vertices.filter(v => v.uv);
        expect(verticesWithUVs.length).toBeGreaterThan(0);
      }
    });

    it('should have proper material indices for all primitives', () => {
      const primitives = [
        createCube(),
        createSphere(),
        createCylinder(),
        createCone(),
        createPlane(),
        createTorus(),
        createCircle(),
        createPyramid(),
        createCapsule(),
      ];

      for (const primitive of primitives) {
        // Check that faces have material indices
        const facesWithMaterials = primitive.faces.filter(f => f.materialIndex >= 0);
        expect(facesWithMaterials.length).toBeGreaterThan(0);
      }
    });
  });
}); 