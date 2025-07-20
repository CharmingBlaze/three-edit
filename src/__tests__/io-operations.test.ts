import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3, Vector2 } from 'three';
import { EditableMesh } from '../core/index.ts';
import { createCube } from '../primitives/index.ts';
import { 
  parseOBJ, 
  exportOBJ, 
  loadOBJ, 
  saveOBJ,
  parseGLTF,
  exportGLTF,
  loadGLTF,
  saveGLTF,
  parsePLY,
  exportPLY,
  loadPLY,
  savePLY
} from '../io/index.ts';

describe('IO Operations', () => {
  let mesh: EditableMesh;

  beforeEach(() => {
    mesh = createCube();
  });

  describe('OBJ Format Operations', () => {
    it('should export mesh to OBJ format', () => {
      const objContent = exportOBJ(mesh);
      
      expect(objContent).toBeDefined();
      expect(typeof objContent).toBe('string');
      expect(objContent).toContain('# Exported by three-edit');
      expect(objContent).toContain('v ');
      expect(objContent).toContain('f ');
    });

    it('should export mesh to OBJ format with custom options', () => {
      const options = {
        includeNormals: true,
        includeUVs: true,
        includeMaterials: true,
        scale: 2.0,
        flipY: true,
        flipZ: false
      };
      
      const objContent = exportOBJ(mesh, options);
      
      expect(objContent).toBeDefined();
      expect(objContent).toContain('# Exported by three-edit');
      expect(objContent).toContain('v ');
      expect(objContent).toContain('vn ');
      expect(objContent).toContain('vt ');
      expect(objContent).toContain('f ');
    });

    it('should parse OBJ content and create mesh', () => {
      const objContent = `# Simple cube
v -0.5 -0.5 0.5
v 0.5 -0.5 0.5
v -0.5 0.5 0.5
v 0.5 0.5 0.5
v -0.5 -0.5 -0.5
v 0.5 -0.5 -0.5
v -0.5 0.5 -0.5
v 0.5 0.5 -0.5
f 1 2 3 4
f 5 6 7 8
f 1 2 6 5
f 3 4 8 7
f 1 3 7 5
f 2 4 8 6`;

      const parsedMesh = parseOBJ(objContent);
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
    });

    it('should parse OBJ content with custom options', () => {
      const objContent = `# Simple cube
v -0.5 -0.5 0.5
v 0.5 -0.5 0.5
v -0.5 0.5 0.5
v 0.5 0.5 0.5
f 1 2 3 4`;

      const options = {
        includeNormals: false,
        includeUVs: false,
        includeMaterials: false,
        scale: 2.0,
        flipY: true,
        flipZ: false
      };

      const parsedMesh = parseOBJ(objContent, options);
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
    });

    it('should handle OBJ with vertex normals and UVs', () => {
      const objContent = `# Cube with normals and UVs
v -0.5 -0.5 0.5
v 0.5 -0.5 0.5
v -0.5 0.5 0.5
v 0.5 0.5 0.5
vn 0 0 1
vn 0 0 1
vn 0 0 1
vn 0 0 1
vt 0 0
vt 1 0
vt 0 1
vt 1 1
f 1/1/1 2/2/2 3/3/3 4/4/4`;

      const parsedMesh = parseOBJ(objContent);
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
    });
  });

  describe('GLTF Format Operations', () => {
    it('should export mesh to GLTF format', () => {
      const gltf = exportGLTF(mesh);
      
      expect(gltf).toBeDefined();
      expect(gltf.asset).toBeDefined();
      expect(gltf.asset.version).toBe('2.0');
      expect(gltf.asset.generator).toBe('three-edit');
      expect(gltf.meshes).toBeDefined();
      expect(gltf.meshes.length).toBeGreaterThan(0);
      expect(gltf.accessors).toBeDefined();
      expect(gltf.accessors.length).toBeGreaterThan(0);
    });

    it('should export mesh to GLTF format with custom options', () => {
      const options = {
        includeNormals: true,
        includeUVs: true,
        includeMaterials: true,
        includeAnimations: true,
        scale: 2.0,
        flipY: true,
        flipZ: false,
        embedBinary: false
      };
      
      const gltf = exportGLTF(mesh, options);
      
      expect(gltf).toBeDefined();
      expect(gltf.asset).toBeDefined();
      expect(gltf.meshes).toBeDefined();
      expect(gltf.accessors).toBeDefined();
    });

    it('should parse GLTF JSON and create mesh', () => {
      const gltfJson = {
        asset: { version: "2.0", generator: "test" },
        scene: 0,
        scenes: [{ nodes: [0] }],
        nodes: [{ mesh: 0 }],
        meshes: [{
          primitives: [{
            attributes: { POSITION: 0 },
            indices: 1,
            material: 0
          }]
        }],
        accessors: [
          {
            bufferView: 0,
            componentType: 5126,
            count: 8,
            type: "VEC3",
            max: [0.5, 0.5, 0.5],
            min: [-0.5, -0.5, -0.5]
          },
          {
            bufferView: 1,
            componentType: 5123,
            count: 36,
            type: "SCALAR"
          }
        ],
        bufferViews: [
          { buffer: 0, byteOffset: 0, byteLength: 96 },
          { buffer: 0, byteOffset: 96, byteLength: 72 }
        ],
        buffers: [{ byteLength: 168 }],
        materials: [{
          pbrMetallicRoughness: {
            baseColorFactor: [1, 1, 1, 1],
            metallicFactor: 0,
            roughnessFactor: 1
          }
        }]
      };

      const parsedMesh = parseGLTF(gltfJson);
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
    });

    it('should parse GLTF JSON with custom options', () => {
      const gltfJson = {
        asset: { version: "2.0", generator: "test" },
        scene: 0,
        scenes: [{ nodes: [0] }],
        nodes: [{ mesh: 0 }],
        meshes: [{
          primitives: [{
            attributes: { POSITION: 0 },
            indices: 1,
            material: 0
          }]
        }],
        accessors: [
          {
            bufferView: 0,
            componentType: 5126,
            count: 8,
            type: "VEC3"
          },
          {
            bufferView: 1,
            componentType: 5123,
            count: 36,
            type: "SCALAR"
          }
        ],
        bufferViews: [
          { buffer: 0, byteOffset: 0, byteLength: 96 },
          { buffer: 0, byteOffset: 96, byteLength: 72 }
        ],
        buffers: [{ byteLength: 168 }],
        materials: [{
          pbrMetallicRoughness: {
            baseColorFactor: [1, 1, 1, 1],
            metallicFactor: 0,
            roughnessFactor: 1
          }
        }]
      };

      const options = {
        includeNormals: false,
        includeUVs: false,
        includeMaterials: false,
        includeAnimations: false,
        scale: 2.0,
        flipY: true,
        flipZ: false
      };

      const parsedMesh = parseGLTF(gltfJson, options);
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
    });
  });

  describe('PLY Format Operations', () => {
    it('should export mesh to PLY format', () => {
      const plyContent = exportPLY(mesh);
      
      expect(plyContent).toBeDefined();
      expect(typeof plyContent).toBe('string');
      expect(plyContent).toContain('ply');
      expect(plyContent).toContain('format ascii 1.0');
      expect(plyContent).toContain('element vertex');
      expect(plyContent).toContain('element face');
      expect(plyContent).toContain('end_header');
    });

    it('should export mesh to PLY format with custom options', () => {
      const options = {
        includeNormals: true,
        includeUVs: true,
        includeColors: true,
        scale: 2.0,
        flipY: true,
        flipZ: false,
        binary: false,
        littleEndian: true
      };
      
      const plyContent = exportPLY(mesh, options);
      
      expect(plyContent).toBeDefined();
      expect(plyContent).toContain('ply');
      expect(plyContent).toContain('property float nx');
      expect(plyContent).toContain('property float u');
      expect(plyContent).toContain('property uchar red');
    });

    it('should parse PLY content and create mesh', () => {
      const plyContent = `ply
format ascii 1.0
element vertex 8
property float x
property float y
property float z
property float nx
property float ny
property float nz
property float u
property float v
element face 6
property list uchar int vertex_indices
end_header
-0.5 -0.5 0.5 0 0 1 0 0
0.5 -0.5 0.5 0 0 1 1 0
-0.5 0.5 0.5 0 0 1 0 1
0.5 0.5 0.5 0 0 1 1 1
-0.5 -0.5 -0.5 0 0 -1 0 0
0.5 -0.5 -0.5 0 0 -1 1 0
-0.5 0.5 -0.5 0 0 -1 0 1
0.5 0.5 -0.5 0 0 -1 1 1
4 0 1 2 3
4 4 5 6 7
4 0 1 5 4
4 2 3 7 6
4 0 2 6 4
4 1 3 7 5`;

      const parsedMesh = parsePLY(plyContent);
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
    });

    it('should parse PLY content with custom options', () => {
      const plyContent = `ply
format ascii 1.0
element vertex 4
property float x
property float y
property float z
element face 1
property list uchar int vertex_indices
end_header
-0.5 -0.5 0.5
0.5 -0.5 0.5
-0.5 0.5 0.5
0.5 0.5 0.5
4 0 1 2 3`;

      const options = {
        includeNormals: false,
        includeUVs: false,
        includeColors: false,
        scale: 2.0,
        flipY: true,
        flipZ: false,
        binary: false,
        littleEndian: true
      };

      const parsedMesh = parsePLY(plyContent, options);
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
    });

    it('should handle PLY with vertex colors', () => {
      const plyContent = `ply
format ascii 1.0
element vertex 4
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
element face 1
property list uchar int vertex_indices
end_header
-0.5 -0.5 0.5 255 0 0
0.5 -0.5 0.5 0 255 0
-0.5 0.5 0.5 0 0 255
0.5 0.5 0.5 255 255 255
4 0 1 2 3`;

      const options = {
        includeColors: true
      };

      const parsedMesh = parsePLY(plyContent, options);
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should round-trip mesh through OBJ format', () => {
      const originalVertexCount = mesh.getVertexCount();
      const originalFaceCount = mesh.getFaceCount();
      
      const objContent = exportOBJ(mesh);
      const parsedMesh = parseOBJ(objContent);
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
    });

    it('should round-trip mesh through GLTF format', () => {
      const originalVertexCount = mesh.getVertexCount();
      const originalFaceCount = mesh.getFaceCount();
      
      const gltf = exportGLTF(mesh);
      const parsedMesh = parseGLTF(gltf);
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
    });

    it('should round-trip mesh through PLY format', () => {
      const originalVertexCount = mesh.getVertexCount();
      const originalFaceCount = mesh.getFaceCount();
      
      const plyContent = exportPLY(mesh);
      const parsedMesh = parsePLY(plyContent);
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
    });

    it('should handle different scale options', () => {
      const scales = [0.5, 1.0, 2.0, 5.0];
      
      for (const scale of scales) {
        const objContent = exportOBJ(mesh, { scale });
        const parsedMesh = parseOBJ(objContent, { scale });
        
        expect(parsedMesh).toBeInstanceOf(EditableMesh);
        expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
        expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
      }
    });

    it('should handle coordinate flipping options', () => {
      const flipOptions = [
        { flipY: false, flipZ: false },
        { flipY: true, flipZ: false },
        { flipY: false, flipZ: true },
        { flipY: true, flipZ: true }
      ];
      
      for (const options of flipOptions) {
        const objContent = exportOBJ(mesh, options);
        const parsedMesh = parseOBJ(objContent, options);
        
        expect(parsedMesh).toBeInstanceOf(EditableMesh);
        expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
        expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
      }
    });

    it('should preserve vertex properties in export/import', () => {
      // Add some custom properties to vertices
      for (let i = 0; i < mesh.getVertexCount(); i++) {
        const vertex = mesh.getVertex(i);
        if (vertex) {
          vertex.uv = { u: i * 0.1, v: i * 0.1 };
          vertex.normal = new Vector3(0, 1, 0);
        }
      }
      
      const objContent = exportOBJ(mesh, { includeUVs: true, includeNormals: true });
      const parsedMesh = parseOBJ(objContent, { includeUVs: true, includeNormals: true });
      
      expect(parsedMesh).toBeInstanceOf(EditableMesh);
      expect(parsedMesh.getVertexCount()).toBeGreaterThan(0);
      expect(parsedMesh.getFaceCount()).toBeGreaterThan(0);
      
      // Check that vertices have UV and normal properties
      for (let i = 0; i < parsedMesh.getVertexCount(); i++) {
        const vertex = parsedMesh.getVertex(i);
        expect(vertex).toBeDefined();
        if (vertex) {
          expect(vertex.uv).toBeDefined();
          expect(vertex.normal).toBeDefined();
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid OBJ content gracefully', () => {
      const invalidContent = 'invalid obj content';
      
      expect(() => {
        parseOBJ(invalidContent);
      }).not.toThrow();
    });

    it('should handle invalid GLTF JSON gracefully', () => {
      const invalidJson = { invalid: 'json' };
      
      expect(() => {
        parseGLTF(invalidJson);
      }).not.toThrow();
    });

    it('should handle invalid PLY content gracefully', () => {
      const invalidContent = 'invalid ply content';
      
      expect(() => {
        parsePLY(invalidContent);
      }).not.toThrow();
    });

    it('should handle empty mesh export', () => {
      const emptyMesh = new EditableMesh();
      
      expect(() => {
        exportOBJ(emptyMesh);
      }).not.toThrow();
      
      expect(() => {
        exportGLTF(emptyMesh);
      }).not.toThrow();
      
      expect(() => {
        exportPLY(emptyMesh);
      }).not.toThrow();
    });
  });
}); 