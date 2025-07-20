import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Face } from '../core/Face.ts';

/**
 * 3DS import/export options
 */
export interface ThreeDSOptions {
  preserveMaterials?: boolean;
  preserveAnimations?: boolean;
  preserveHierarchy?: boolean;
  includeNormals?: boolean;
  includeUVs?: boolean;
}

/**
 * 3DS chunk structure
 */
export interface ThreeDSChunk {
  id: number;
  length: number;
  data: ArrayBuffer;
  children: ThreeDSChunk[];
}

/**
 * 3DS material structure
 */
export interface ThreeDSMaterial {
  name: string;
  ambient: { r: number; g: number; b: number };
  diffuse: { r: number; g: number; b: number };
  specular: { r: number; g: number; b: number };
  shininess: number;
  transparency: number;
  textureMap?: string;
}

/**
 * 3DS mesh structure
 */
export interface ThreeDSMesh {
  name: string;
  vertices: { x: number; y: number; z: number }[];
  faces: { a: number; b: number; c: number }[];
  normals?: { x: number; y: number; z: number }[];
  uvs?: { u: number; v: number }[];
  material?: string;
}

/**
 * 3DS chunk IDs
 */
const CHUNK_IDS = {
  MAIN: 0x4D4D,
  EDITOR: 0x3D3D,
  OBJECT: 0x4000,
  MESH: 0x4100,
  VERTICES: 0x4110,
  FACES: 0x4120,
  FACE_MATERIAL: 0x4130,
  MAPPING_COORDS: 0x4140,
  SMOOTHING_GROUPS: 0x4150,
  LOCAL_AXIS: 0x4160,
  VISIBLE_EDGE: 0x4165,
  FACE_NORMALS: 0x4170,
  VERTEX_NORMALS: 0x4171,
  MATERIAL: 0xAFFF,
  MATERIAL_NAME: 0xA000,
  MATERIAL_AMBIENT: 0xA010,
  MATERIAL_DIFFUSE: 0xA020,
  MATERIAL_SPECULAR: 0xA030,
  MATERIAL_SHININESS: 0xA040,
  MATERIAL_TRANSPARENCY: 0xA050,
  MATERIAL_TEXTURE: 0xA200,
  MATERIAL_MAPNAME: 0xA300
};

/**
 * Import 3DS file to EditableMesh
 */
export function import3DS(
  data: ArrayBuffer,
  options: ThreeDSOptions = {}
): EditableMesh[] {
  const {
    preserveMaterials = true,
    preserveAnimations = false,
    preserveHierarchy = true,
    includeNormals = true,
    includeUVs = true
  } = options;

  const meshes: EditableMesh[] = [];

  try {
    const chunks = parse3DSChunks(data);
    const materials = parse3DSMaterials(chunks);
    const meshData = parse3DSMeshes(chunks);
    
    // Convert mesh data to EditableMesh
    meshData.forEach(meshInfo => {
      const mesh = new EditableMesh();
      
      // Add vertices
      meshInfo.vertices.forEach(vertexData => {
        const vertex = new Vertex(vertexData.x, vertexData.y, vertexData.z);
        mesh.addVertex(vertex);
      });
      
      // Add faces
      meshInfo.faces.forEach(faceData => {
        const face = new Face([faceData.a, faceData.b, faceData.c], []);
        mesh.addFace(face);
      });
      
      // Add normals if available
      if (includeNormals && meshInfo.normals) {
        meshInfo.normals.forEach((normal, index) => {
          if (index < mesh.vertices.length) {
            mesh.vertices[index].normal = normal as any;
          }
        });
      }
      
      // Add UVs if available
      if (includeUVs && meshInfo.uvs) {
        meshInfo.uvs.forEach((uv, index) => {
          if (index < mesh.vertices.length) {
            mesh.vertices[index].uv = uv;
          }
        });
      }
      
      meshes.push(mesh);
    });

    return meshes;
  } catch (error) {
    console.error('3DS import error:', error);
    throw new Error(`Failed to import 3DS: ${error}`);
  }
}

/**
 * Parse 3DS chunks from binary data
 */
function parse3DSChunks(data: ArrayBuffer): ThreeDSChunk[] {
  const chunks: ThreeDSChunk[] = [];
  const view = new DataView(data);
  let offset = 0;

  while (offset < data.byteLength - 6) {
    const id = view.getUint16(offset, true);
    const length = view.getUint32(offset + 2, true);
    
    if (length === 0 || offset + length > data.byteLength) {
      break;
    }

    const chunkData = data.slice(offset + 6, offset + length);
    const chunk: ThreeDSChunk = {
      id,
      length: length - 6,
      data: chunkData,
      children: []
    };

    // Parse child chunks if this is a container chunk
    if (isContainerChunk(id)) {
      chunk.children = parse3DSChunks(chunkData);
    }

    chunks.push(chunk);
    offset += length;
  }

  return chunks;
}

/**
 * Check if a chunk is a container chunk
 */
function isContainerChunk(id: number): boolean {
  return id === CHUNK_IDS.MAIN || 
         id === CHUNK_IDS.EDITOR || 
         id === CHUNK_IDS.OBJECT || 
         id === CHUNK_IDS.MESH ||
         id === CHUNK_IDS.MATERIAL;
}

/**
 * Parse 3DS materials from chunks
 */
function parse3DSMaterials(chunks: ThreeDSChunk[]): Map<string, ThreeDSMaterial> {
  const materials = new Map<string, ThreeDSMaterial>();

  for (const chunk of chunks) {
    if (chunk.id === CHUNK_IDS.MATERIAL) {
      const material = parse3DSMaterial(chunk);
      if (material) {
        materials.set(material.name, material);
      }
    }
  }

  return materials;
}

/**
 * Parse a single 3DS material
 */
function parse3DSMaterial(chunk: ThreeDSChunk): ThreeDSMaterial | null {
  const material: ThreeDSMaterial = {
    name: '',
    ambient: { r: 0.2, g: 0.2, b: 0.2 },
    diffuse: { r: 0.8, g: 0.8, b: 0.8 },
    specular: { r: 1.0, g: 1.0, b: 1.0 },
    shininess: 0.0,
    transparency: 1.0
  };

  for (const child of chunk.children) {
    switch (child.id) {
      case CHUNK_IDS.MATERIAL_NAME:
        material.name = parse3DSString(child.data);
        break;
      case CHUNK_IDS.MATERIAL_AMBIENT:
        material.ambient = parse3DSColor(child.data);
        break;
      case CHUNK_IDS.MATERIAL_DIFFUSE:
        material.diffuse = parse3DSColor(child.data);
        break;
      case CHUNK_IDS.MATERIAL_SPECULAR:
        material.specular = parse3DSColor(child.data);
        break;
      case CHUNK_IDS.MATERIAL_SHININESS:
        material.shininess = parse3DSFloat(child.data);
        break;
      case CHUNK_IDS.MATERIAL_TRANSPARENCY:
        material.transparency = parse3DSFloat(child.data);
        break;
      case CHUNK_IDS.MATERIAL_TEXTURE:
        for (const textureChild of child.children) {
          if (textureChild.id === CHUNK_IDS.MATERIAL_MAPNAME) {
            material.textureMap = parse3DSString(textureChild.data);
          }
        }
        break;
    }
  }

  return material.name ? material : null;
}

/**
 * Parse 3DS meshes from chunks
 */
function parse3DSMeshes(chunks: ThreeDSChunk[]): ThreeDSMesh[] {
  const meshes: ThreeDSMesh[] = [];

  for (const chunk of chunks) {
    if (chunk.id === CHUNK_IDS.OBJECT) {
      const objectName = parse3DSString(chunk.data);
      
      for (const child of chunk.children) {
        if (child.id === CHUNK_IDS.MESH) {
          const mesh = parse3DSMeshData(child, objectName);
          if (mesh) {
            meshes.push(mesh);
          }
        }
      }
    }
  }

  return meshes;
}

/**
 * Parse a single 3DS mesh
 */
function parse3DSMeshData(chunk: ThreeDSChunk, objectName: string): ThreeDSMesh | null {
  const mesh: ThreeDSMesh = {
    name: objectName,
    vertices: [],
    faces: [],
    normals: [],
    uvs: []
  };

  for (const child of chunk.children) {
    switch (child.id) {
      case CHUNK_IDS.VERTICES:
        mesh.vertices = parse3DSVertices(child.data);
        break;
      case CHUNK_IDS.FACES:
        mesh.faces = parse3DSFaces(child.data);
        break;
      case CHUNK_IDS.FACE_NORMALS:
        mesh.normals = parse3DSNormals(child.data);
        break;
      case CHUNK_IDS.MAPPING_COORDS:
        mesh.uvs = parse3DSUVs(child.data);
        break;
    }
  }

  return mesh.vertices.length > 0 ? mesh : null;
}

/**
 * Parse 3DS vertices
 */
function parse3DSVertices(data: ArrayBuffer): { x: number; y: number; z: number }[] {
  const view = new DataView(data);
  const count = view.getUint16(0, true);
  const vertices: { x: number; y: number; z: number }[] = [];

  for (let i = 0; i < count; i++) {
    const offset = 2 + i * 12;
    vertices.push({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true)
    });
  }

  return vertices;
}

/**
 * Parse 3DS faces
 */
function parse3DSFaces(data: ArrayBuffer): { a: number; b: number; c: number }[] {
  const view = new DataView(data);
  const count = view.getUint16(0, true);
  const faces: { a: number; b: number; c: number }[] = [];

  for (let i = 0; i < count; i++) {
    const offset = 2 + i * 8;
    faces.push({
      a: view.getUint16(offset, true),
      b: view.getUint16(offset + 2, true),
      c: view.getUint16(offset + 4, true)
    });
  }

  return faces;
}

/**
 * Parse 3DS normals
 */
function parse3DSNormals(data: ArrayBuffer): { x: number; y: number; z: number }[] {
  const view = new DataView(data);
  const count = view.getUint16(0, true);
  const normals: { x: number; y: number; z: number }[] = [];

  for (let i = 0; i < count; i++) {
    const offset = 2 + i * 12;
    normals.push({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true)
    });
  }

  return normals;
}

/**
 * Parse 3DS UV coordinates
 */
function parse3DSUVs(data: ArrayBuffer): { u: number; v: number }[] {
  const view = new DataView(data);
  const count = view.getUint16(0, true);
  const uvs: { u: number; v: number }[] = [];

  for (let i = 0; i < count; i++) {
    const offset = 2 + i * 8;
    uvs.push({
      u: view.getFloat32(offset, true),
      v: view.getFloat32(offset + 4, true)
    });
  }

  return uvs;
}

/**
 * Parse 3DS string
 */
function parse3DSString(data: ArrayBuffer): string {
  const view = new Uint8Array(data);
  let length = 0;
  
  while (length < view.length && view[length] !== 0) {
    length++;
  }
  
  return new TextDecoder().decode(view.slice(0, length));
}

/**
 * Parse 3DS color
 */
function parse3DSColor(data: ArrayBuffer): { r: number; g: number; b: number } {
  const view = new DataView(data);
  return {
    r: view.getUint8(0) / 255,
    g: view.getUint8(1) / 255,
    b: view.getUint8(2) / 255
  };
}

/**
 * Parse 3DS float
 */
function parse3DSFloat(data: ArrayBuffer): number {
  const view = new DataView(data);
  return view.getFloat32(0, true);
}

/**
 * Export EditableMesh to 3DS format
 */
export function export3DS(
  meshes: EditableMesh[],
  options: ThreeDSOptions = {}
): ArrayBuffer {
  const {
    preserveMaterials = true,
    preserveAnimations = false,
    preserveHierarchy = true,
    includeNormals = true,
    includeUVs = true
  } = options;

  // Calculate total size needed
  let totalSize = 6; // Main chunk header
  totalSize += 6; // Editor chunk header
  
  meshes.forEach(mesh => {
    totalSize += 6; // Object chunk header
    totalSize += mesh.name.length + 1; // Object name
    
    totalSize += 6; // Mesh chunk header
    
    // Vertices chunk
    totalSize += 6 + 2 + (mesh.vertices.length * 12); // Header + count + vertices
    
    // Faces chunk
    totalSize += 6 + 2 + (mesh.faces.length * 8); // Header + count + faces
    
    // Normals chunk (if available)
    if (includeNormals) {
      totalSize += 6 + 2 + (mesh.vertices.length * 12); // Header + count + normals
    }
    
    // UVs chunk (if available)
    if (includeUVs) {
      totalSize += 6 + 2 + (mesh.vertices.length * 8); // Header + count + UVs
    }
  });

  // Create buffer
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  let offset = 0;

  // Write main chunk
  view.setUint16(offset, CHUNK_IDS.MAIN, true);
  view.setUint32(offset + 2, totalSize, true);
  offset += 6;

  // Write editor chunk
  view.setUint16(offset, CHUNK_IDS.EDITOR, true);
  view.setUint32(offset + 2, totalSize - 6, true);
  offset += 6;

  // Write each mesh
  meshes.forEach(mesh => {
    // Object chunk
    const objectStart = offset;
    view.setUint16(offset, CHUNK_IDS.OBJECT, true);
    offset += 6;

    // Object name
    const nameBytes = new TextEncoder().encode(mesh.name);
    new Uint8Array(buffer, offset, nameBytes.length).set(nameBytes);
    offset += nameBytes.length;
    new Uint8Array(buffer, offset, 1)[0] = 0; // Null terminator
    offset += 1;

    // Mesh chunk
    const meshStart = offset;
    view.setUint16(offset, CHUNK_IDS.MESH, true);
    offset += 6;

    // Vertices chunk
    view.setUint16(offset, CHUNK_IDS.VERTICES, true);
    view.setUint32(offset + 2, 2 + mesh.vertices.length * 12, true);
    view.setUint16(offset + 6, mesh.vertices.length, true);
    offset += 8;

    mesh.vertices.forEach(vertex => {
      view.setFloat32(offset, vertex.x, true);
      view.setFloat32(offset + 4, vertex.y, true);
      view.setFloat32(offset + 8, vertex.z, true);
      offset += 12;
    });

    // Faces chunk
    view.setUint16(offset, CHUNK_IDS.FACES, true);
    view.setUint32(offset + 2, 2 + mesh.faces.length * 8, true);
    view.setUint16(offset + 6, mesh.faces.length, true);
    offset += 8;

    mesh.faces.forEach(face => {
      face.vertices.forEach((vertexIndex, i) => {
        view.setUint16(offset + i * 2, vertexIndex, true);
      });
      view.setUint16(offset + 6, 0); // Face flags
      offset += 8;
    });

    // Update mesh chunk length
    const meshLength = offset - meshStart;
    view.setUint32(meshStart + 2, meshLength, true);

    // Update object chunk length
    const objectLength = offset - objectStart;
    view.setUint32(objectStart + 2, objectLength, true);
  });

  return buffer;
}

/**
 * Validate 3DS data
 */
export function validate3DS(data: ArrayBuffer): boolean {
  try {
    if (data.byteLength < 6) {
      return false;
    }

    const view = new DataView(data);
    const mainChunkId = view.getUint16(0, true);
    
    return mainChunkId === CHUNK_IDS.MAIN;
  } catch (error) {
    return false;
  }
}

/**
 * Get 3DS file information
 */
export function get3DSInfo(data: ArrayBuffer): {
  meshCount: number;
  vertexCount: number;
  faceCount: number;
  materialCount: number;
} {
  const info = {
    meshCount: 0,
    vertexCount: 0,
    faceCount: 0,
    materialCount: 0
  };

  try {
    const chunks = parse3DSChunks(data);
    
    // Count materials
    for (const chunk of chunks) {
      if (chunk.id === CHUNK_IDS.MATERIAL) {
        info.materialCount++;
      }
    }

    // Count meshes and geometry
    for (const chunk of chunks) {
      if (chunk.id === CHUNK_IDS.OBJECT) {
        for (const child of chunk.children) {
          if (child.id === CHUNK_IDS.MESH) {
            info.meshCount++;
            
            // Parse vertices and faces
            for (const meshChild of child.children) {
              if (meshChild.id === CHUNK_IDS.VERTICES) {
                const view = new DataView(meshChild.data);
                info.vertexCount += view.getUint16(0, true);
              } else if (meshChild.id === CHUNK_IDS.FACES) {
                const view = new DataView(meshChild.data);
                info.faceCount += view.getUint16(0, true);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('3DS info parsing failed:', error);
  }

  return info;
} 