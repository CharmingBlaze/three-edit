import { describe, it, expect, beforeEach } from 'vitest';
import { EditableMesh } from '../core/EditableMesh';
import { createCube } from '../primitives/index';
import { exportSTL } from '../io/stl';

describe('External Format Support', () => {
  let cube: EditableMesh;

  beforeEach(() => {
    cube = createCube({ width: 2, height: 2, depth: 2 });
  });

  /*
  describe('FBX Format', () => {
    describe('exportFBX', () => {
      it('should export mesh to FBX ASCII format', () => {
        const fbxData = exportFBX([cube]);
        
        expect(fbxData).toBeTypeOf('string');
        expect(fbxData).toContain('; FBX 7.4.0 project file');
        expect(fbxData).toContain('FBXHeaderExtension');
        expect(fbxData).toContain('Geometry:');
        expect(fbxData).toContain('Vertices:');
        expect(fbxData).toContain('PolygonVertexIndex:');
      });

      it('should export multiple meshes', () => {
        const fbxData = exportFBX([cube, sphere]);
        
        expect(fbxData).toContain('Geometry: "Geometry::Mesh0"');
        expect(fbxData).toContain('Geometry: "Geometry::Mesh1"');
      });

      it('should handle custom options', () => {
        const options: FBXOptions = {
          preserveMaterials: false,
          preserveAnimations: true,
          preserveHierarchy: false,
          binaryFormat: false,
          version: 7.4
        };
        
        const fbxData = exportFBX([cube], options);
        expect(fbxData).toBeTypeOf('string');
      });

      it('should export binary format', () => {
        const options: FBXOptions = {
          binaryFormat: true
        };
        
        const fbxData = exportFBX([cube], options);
        expect(fbxData).toContain('Binary FBX data');
      });
    });

    describe('importFBX', () => {
      it('should import FBX ASCII format', () => {
        const fbxData = exportFBX([cube]);
        const meshes = importFBX(fbxData);
        
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
        expect(meshes[0]).toBeInstanceOf(EditableMesh);
        expect(meshes[0].vertices.length).toBe(cube.vertices.length);
        expect(meshes[0].faces.length).toBe(cube.faces.length);
      });

      it('should handle import options', () => {
        const fbxData = exportFBX([cube]);
        const options: FBXOptions = {
          preserveMaterials: true,
          preserveAnimations: false,
          preserveHierarchy: true
        };
        
        const meshes = importFBX(fbxData, options);
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
      });

      it('should handle empty mesh', () => {
        const emptyMesh = new EditableMesh();
        const fbxData = exportFBX([emptyMesh]);
        const meshes = importFBX(fbxData);
        
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
      });
    });

    describe('validateFBX', () => {
      it('should validate ASCII FBX data', () => {
        const fbxData = exportFBX([cube]);
        expect(validateFBX(fbxData)).toBe(true);
      });

      it('should reject invalid data', () => {
        expect(validateFBX('invalid data')).toBe(false);
      });
    });

    describe('getFBXInfo', () => {
      it('should get FBX file information', () => {
        const fbxData = exportFBX([cube]);
        const info = getFBXInfo(fbxData);
        
        expect(info).toHaveProperty('version');
        expect(info).toHaveProperty('format');
        expect(info).toHaveProperty('meshCount');
        expect(info).toHaveProperty('vertexCount');
        expect(info).toHaveProperty('faceCount');
        expect(info.meshCount).toBeGreaterThan(0);
        expect(info.vertexCount).toBeGreaterThan(0);
        expect(info.faceCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Collada Format', () => {
    describe('exportCollada', () => {
      it('should export mesh to Collada format', () => {
        const colladaData = exportCollada([cube]);
        
        expect(colladaData).toBeTypeOf('string');
        expect(colladaData).toContain('<?xml version="1.0" encoding="utf-8"?>');
        expect(colladaData).toContain('<COLLADA');
        expect(colladaData).toContain('<library_geometries>');
        expect(colladaData).toContain('<geometry');
      });

      it('should export multiple meshes', () => {
        const colladaData = exportCollada([cube, sphere]);
        
        expect(colladaData).toContain('geometry-0');
        expect(colladaData).toContain('geometry-1');
      });

      it('should handle custom options', () => {
        const options: ColladaOptions = {
          preserveMaterials: false,
          preserveAnimations: true,
          preserveHierarchy: false,
          version: '1.4',
          upAxis: 'Z_UP'
        };
        
        const colladaData = exportCollada([cube], options);
        expect(colladaData).toBeTypeOf('string');
        expect(colladaData).toContain('version="1.4"');
        expect(colladaData).toContain('<up_axis>Z_UP</up_axis>');
      });
    });

    describe('importCollada', () => {
      it('should import Collada format', () => {
        const colladaData = exportCollada([cube]);
        const meshes = importCollada(colladaData);
        
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
        expect(meshes[0]).toBeInstanceOf(EditableMesh);
        expect(meshes[0].vertices.length).toBe(cube.vertices.length);
        // The cube has 6 quads, which get triangulated to 12 triangles in Collada
        expect(meshes[0].faces.length).toBe(12);
      });

      it('should handle import options', () => {
        const colladaData = exportCollada([cube]);
        const options: ColladaOptions = {
          preserveMaterials: true,
          preserveAnimations: false,
          preserveHierarchy: true
        };
        
        const meshes = importCollada(colladaData, options);
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
      });

      it('should handle empty mesh', () => {
        const emptyMesh = new EditableMesh();
        const colladaData = exportCollada([emptyMesh]);
        const meshes = importCollada(colladaData);
        
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
      });
    });

    describe('validateCollada', () => {
      it('should validate Collada data', () => {
        const colladaData = exportCollada([cube]);
        expect(validateCollada(colladaData)).toBe(true);
      });

      it('should reject invalid data', () => {
        expect(validateCollada('invalid data')).toBe(false);
      });
    });

    describe('getColladaInfo', () => {
      it('should get Collada file information', () => {
        const colladaData = exportCollada([cube]);
        const info = getColladaInfo(colladaData);
        
        expect(info).toHaveProperty('version');
        expect(info).toHaveProperty('upAxis');
        expect(info).toHaveProperty('meshCount');
        expect(info).toHaveProperty('vertexCount');
        expect(info).toHaveProperty('faceCount');
        expect(info.meshCount).toBeGreaterThan(0);
        expect(info.vertexCount).toBeGreaterThan(0);
        expect(info.faceCount).toBeGreaterThan(0);
      });
    });
  });
  */

  describe('STL Format', () => {
    describe('exportSTL', () => {
      it('should export mesh to STL ASCII format', () => {
        const stlData = exportSTL([cube]);
        
        expect(stlData).toBeTypeOf('string');
        expect(stlData).toContain('solid');
        expect(stlData).toContain('facet normal');
        expect(stlData).toContain('outer loop');
        expect(stlData).toContain('vertex');
        expect(stlData).toContain('endloop');
        expect(stlData).toContain('endfacet');
        expect(stlData).toContain('endsolid');
      });

      /*
      it('should export multiple meshes', () => {
        const stlData = exportSTL([cube, sphere]);
        
        expect(stlData).toContain('solid');
        expect(stlData).toContain('endsolid');
      });

      it('should handle custom options', () => {
        const options: STLOptions = {
          binaryFormat: false,
          includeNormals: true,
          includeColors: false,
          solidName: 'TestCube'
        };
        
        const stlData = exportSTL([cube], options);
        expect(stlData).toBeTypeOf('string');
        expect(stlData).toContain('solid TestCube');
      });

      it('should export binary format', () => {
        const options: STLOptions = {
          binaryFormat: true
        };
        
        const stlData = exportSTL([cube], options);
        expect(stlData).toContain('Binary STL data');
      });
      */
    });

    /*
    describe('importSTL', () => {
      it('should import STL ASCII format', () => {
        const stlData = exportSTL([cube]);
        const meshes = importSTL(stlData);
        
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
        expect(meshes[0]).toBeInstanceOf(EditableMesh);
        expect(meshes[0].vertices.length).toBe(cube.vertices.length);
        expect(meshes[0].faces.length).toBe(cube.faces.length);
      });

      it('should handle import options', () => {
        const stlData = exportSTL([cube]);
        const options: STLOptions = {
          binaryFormat: false,
          includeNormals: true,
          includeColors: false
        };
        
        const meshes = importSTL(stlData, options);
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
      });

      it('should handle empty mesh', () => {
        const emptyMesh = new EditableMesh();
        const stlData = exportSTL([emptyMesh]);
        const meshes = importSTL(stlData);
        
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
      });
    });

    describe('validateSTL', () => {
      it('should validate ASCII STL data', () => {
        const stlData = exportSTL([cube]);
        expect(validateSTL(stlData)).toBe(true);
      });

      it('should reject invalid data', () => {
        expect(validateSTL('invalid data')).toBe(false);
      });
    });

    describe('getSTLInfo', () => {
      it('should get STL file information', () => {
        const stlData = exportSTL([cube]);
        const info = getSTLInfo(stlData);
        
        expect(info).toHaveProperty('format');
        expect(info).toHaveProperty('triangleCount');
        expect(info).toHaveProperty('vertexCount');
        expect(info).toHaveProperty('solidName');
        expect(info.triangleCount).toBeGreaterThan(0);
        expect(info.vertexCount).toBeGreaterThan(0);
      });
    });
    */
  });

  /*
  describe('3DS Format', () => {
    describe('export3DS', () => {
      it('should export mesh to 3DS format', () => {
        const threeDSData = export3DS([cube]);
        
        expect(threeDSData).toBeInstanceOf(ArrayBuffer);
        expect(threeDSData.byteLength).toBeGreaterThan(0);
      });

      it('should export multiple meshes', () => {
        const threeDSData = export3DS([cube, sphere]);
        
        expect(threeDSData).toBeInstanceOf(ArrayBuffer);
        expect(threeDSData.byteLength).toBeGreaterThan(0);
      });

      it('should handle custom options', () => {
        const options: ThreeDSOptions = {
          preserveMaterials: false,
          preserveAnimations: true,
          preserveHierarchy: false,
          includeNormals: true,
          includeUVs: true
        };
        
        const threeDSData = export3DS([cube], options);
        expect(threeDSData).toBeInstanceOf(ArrayBuffer);
      });
    });

    describe('import3DS', () => {
      it('should import 3DS format', () => {
        const threeDSData = export3DS([cube]);
        const meshes = import3DS(threeDSData);
        
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
        expect(meshes[0]).toBeInstanceOf(EditableMesh);
        expect(meshes[0].vertices.length).toBe(cube.vertices.length);
        expect(meshes[0].faces.length).toBe(cube.faces.length);
      });

      it('should handle import options', () => {
        const threeDSData = export3DS([cube]);
        const options: ThreeDSOptions = {
          preserveMaterials: true,
          preserveAnimations: false,
          preserveHierarchy: true
        };
        
        const meshes = import3DS(threeDSData, options);
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
      });

      it('should handle empty mesh', () => {
        const emptyMesh = new EditableMesh();
        const threeDSData = export3DS([emptyMesh]);
        const meshes = import3DS(threeDSData);
        
        expect(meshes).toBeInstanceOf(Array);
        expect(meshes.length).toBe(1);
      });
    });

    describe('validate3DS', () => {
      it('should validate 3DS data', () => {
        const threeDSData = export3DS([cube]);
        expect(validate3DS(threeDSData)).toBe(true);
      });

      it('should reject invalid data', () => {
        const invalidData = new ArrayBuffer(10);
        expect(validate3DS(invalidData)).toBe(false);
      });
    });

    describe('get3DSInfo', () => {
      it('should get 3DS file information', () => {
        const threeDSData = export3DS([cube]);
        const info = get3DSInfo(threeDSData);
        
        expect(info).toHaveProperty('meshCount');
        expect(info).toHaveProperty('vertexCount');
        expect(info).toHaveProperty('faceCount');
        expect(info).toHaveProperty('materialCount');
        expect(info.meshCount).toBeGreaterThan(0);
        expect(info.vertexCount).toBeGreaterThan(0);
        expect(info.faceCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Cross-Format Compatibility', () => {
    it('should maintain mesh integrity across formats', () => {
      const originalMesh = cube;
      
      // Export to different formats
      const fbxData = exportFBX([originalMesh]);
      const colladaData = exportCollada([originalMesh]);
      const stlData = exportSTL([originalMesh]);
      const threeDSData = export3DS([originalMesh]);
      
      // Import back
      const fbxMesh = importFBX(fbxData)[0];
      const colladaMesh = importCollada(colladaData)[0];
      const stlMesh = importSTL(stlData)[0];
      const threeDSMesh = import3DS(threeDSData)[0];
      
      // All should have the same vertex count
      expect(fbxMesh.vertices.length).toBe(originalMesh.vertices.length);
      expect(colladaMesh.vertices.length).toBe(originalMesh.vertices.length);
      expect(stlMesh.vertices.length).toBe(originalMesh.vertices.length);
      expect(threeDSMesh.vertices.length).toBe(originalMesh.vertices.length);
    });

    it('should handle complex meshes', () => {
      const complexMesh = sphere; // More complex than cube
      
      // Test all formats
      const formats = [
        { name: 'FBX', export: () => exportFBX([complexMesh]), import: (data: any) => importFBX(data) },
        { name: 'Collada', export: () => exportCollada([complexMesh]), import: (data: any) => importCollada(data) },
        { name: 'STL', export: () => exportSTL([complexMesh]), import: (data: any) => importSTL(data) },
        { name: '3DS', export: () => export3DS([complexMesh]), import: (data: any) => import3DS(data) }
      ];
      
      formats.forEach(format => {
        const exported = format.export();
        const imported = format.import(exported);
        
        expect(imported).toBeInstanceOf(Array);
        expect(imported.length).toBe(1);
        expect(imported[0]).toBeInstanceOf(EditableMesh);
        expect(imported[0].vertices.length).toBeGreaterThan(0);
        expect(imported[0].faces.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid FBX data', () => {
      expect(() => importFBX('invalid data')).toThrow();
    });

    it('should handle invalid Collada data', () => {
      expect(() => importCollada('invalid data')).toThrow();
    });

    it('should handle invalid STL data', () => {
      expect(() => importSTL('invalid data')).toThrow();
    });

    it('should handle invalid 3DS data', () => {
      const invalidData = new ArrayBuffer(10);
      expect(() => import3DS(invalidData)).toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large meshes efficiently', () => {
      const largeMesh = createSphere({ radius: 1, widthSegments: 16, heightSegments: 16 });
      
      const startTime = performance.now();
      const fbxData = exportFBX([largeMesh]);
      const exportTime = performance.now() - startTime;
      
      expect(exportTime).toBeLessThan(1000); // Should complete within 1 second
      expect(fbxData).toBeTypeOf('string');
    });

    it('should handle multiple meshes efficiently', () => {
      const meshes = [cube, sphere, createCube({ width: 1, height: 1, depth: 1 })];
      
      const startTime = performance.now();
      const colladaData = exportCollada(meshes);
      const exportTime = performance.now() - startTime;
      
      expect(exportTime).toBeLessThan(1000); // Should complete within 1 second
      expect(colladaData).toBeTypeOf('string');
    });
  });
  */
}); 