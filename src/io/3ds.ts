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
    preserveMaterials: _preserveMaterials = true,
    preserveAnimations: _preserveAnimations = false,
    preserveHierarchy: _preserveHierarchy = true,
    includeNormals = true,
    includeUVs = true
  } = options;

  const meshes: EditableMesh[] = [];

  try {
    const chunks = parse3DSChunks(data);
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
    
  } catch (error) {
    console.error('Error importing 3DS file:', error);
    // Return a basic mesh if parsing fails
    const fallbackMesh = new EditableMesh();
    meshes.push(fallbackMesh);
  }

  return meshes;
}

/**
 * Parse 3DS chunks from binary data
 */
function parse3DSChunks(data: ArrayBuffer): ThreeDSChunk[] {
  const chunks: ThreeDSChunk[] = [];
  const view = new DataView(data);
  let offset = 0;

  while (offset < data.byteLength) {
    const id = view.getUint16(offset, true);
    const length = view.getUint32(offset + 2, true);
    
    const chunkData = data.slice(offset + 6, offset + length);
    const chunk: ThreeDSChunk = {
      id,
      length,
      data: chunkData,
      children: []
    };

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
         id === CHUNK_IDS.MESH;
}

/**
 * Parse mesh data from 3DS chunks
 */
function parse3DSMeshes(chunks: ThreeDSChunk[]): ThreeDSMesh[] {
  const meshes: ThreeDSMesh[] = [];

  for (const chunk of chunks) {
    if (chunk.id === CHUNK_IDS.OBJECT) {
      const objectName = parse3DSString(chunk.data);
      
      for (const childChunk of chunk.children) {
        if (childChunk.id === CHUNK_IDS.MESH) {
          const mesh = parse3DSMeshData(childChunk, objectName);
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
 * Parse individual mesh data from a chunk
 */
function parse3DSMeshData(chunk: ThreeDSChunk, objectName: string): ThreeDSMesh | null {
  const mesh: ThreeDSMesh = {
    name: objectName,
    vertices: [],
    faces: []
  };

  for (const childChunk of chunk.children) {
    switch (childChunk.id) {
      case CHUNK_IDS.VERTICES:
        mesh.vertices = parse3DSVertices(childChunk.data);
        break;
      case CHUNK_IDS.FACES:
        mesh.faces = parse3DSFaces(childChunk.data);
        break;
      case CHUNK_IDS.VERTEX_NORMALS:
        mesh.normals = parse3DSNormals(childChunk.data);
        break;
      case CHUNK_IDS.MAPPING_COORDS:
        mesh.uvs = parse3DSUVs(childChunk.data);
        break;
    }
  }

  return mesh.vertices.length > 0 && mesh.faces.length > 0 ? mesh : null;
}

/**
 * Parse vertex data from chunk
 */
function parse3DSVertices(data: ArrayBuffer): { x: number; y: number; z: number }[] {
  const view = new DataView(data);
  const vertexCount = view.getUint16(0, true);
  const vertices: { x: number; y: number; z: number }[] = [];

  for (let i = 0; i < vertexCount; i++) {
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
 * Parse face data from chunk
 */
function parse3DSFaces(data: ArrayBuffer): { a: number; b: number; c: number }[] {
  const view = new DataView(data);
  const faceCount = view.getUint16(0, true);
  const faces: { a: number; b: number; c: number }[] = [];

  for (let i = 0; i < faceCount; i++) {
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
 * Parse normal data from chunk
 */
function parse3DSNormals(data: ArrayBuffer): { x: number; y: number; z: number }[] {
  const view = new DataView(data);
  const normalCount = view.getUint16(0, true);
  const normals: { x: number; y: number; z: number }[] = [];

  for (let i = 0; i < normalCount; i++) {
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
 * Parse UV coordinate data from chunk
 */
function parse3DSUVs(data: ArrayBuffer): { u: number; v: number }[] {
  const view = new DataView(data);
  const uvCount = view.getUint16(0, true);
  const uvs: { u: number; v: number }[] = [];

  for (let i = 0; i < uvCount; i++) {
    const offset = 2 + i * 8;
    uvs.push({
      u: view.getFloat32(offset, true),
      v: view.getFloat32(offset + 4, true)
    });
  }

  return uvs;
}

/**
 * Parse string from chunk data
 */
function parse3DSString(data: ArrayBuffer): string {
  const decoder = new TextDecoder('utf-8');
  const bytes = new Uint8Array(data);
  let endIndex = 0;
  
  while (endIndex < bytes.length && bytes[endIndex] !== 0) {
    endIndex++;
  }
  
  return decoder.decode(bytes.slice(0, endIndex));
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
  
  for (const mesh of meshes) {
    totalSize += 6; // Object chunk header
    totalSize += mesh.name.length + 1; // Object name
    
    totalSize += 6; // Mesh chunk header
    
    // Vertices chunk
    totalSize += 6 + mesh.vertices.length * 12;
    
    // Faces chunk
    totalSize += 6 + mesh.faces.length * 8;
    
    // Normals chunk (if included)
    if (includeNormals) {
      totalSize += 6 + mesh.vertices.length * 12;
    }
    
    // UVs chunk (if included)
    if (includeUVs) {
      totalSize += 6 + mesh.vertices.length * 8;
    }
  }

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
  for (const mesh of meshes) {
    // Object chunk
    const objectChunkStart = offset;
    view.setUint16(offset, CHUNK_IDS.OBJECT, true);
    offset += 6;
    
    // Object name
    const nameBytes = new TextEncoder().encode(mesh.name);
    for (let i = 0; i < nameBytes.length; i++) {
      view.setUint8(offset + i, nameBytes[i]);
    }
    view.setUint8(offset + nameBytes.length, 0);
    offset += nameBytes.length + 1;
    
    // Mesh chunk
    const meshChunkStart = offset;
    view.setUint16(offset, CHUNK_IDS.MESH, true);
    offset += 6;
    
    // Vertices chunk
    const verticesChunkStart = offset;
    view.setUint16(offset, CHUNK_IDS.VERTICES, true);
    offset += 6;
    view.setUint16(offset, mesh.vertices.length, true);
    offset += 2;
    
    for (const vertex of mesh.vertices) {
      view.setFloat32(offset, vertex.x, true);
      view.setFloat32(offset + 4, vertex.y, true);
      view.setFloat32(offset + 8, vertex.z, true);
      offset += 12;
    }
    
    // Update vertices chunk length
    const verticesChunkLength = offset - verticesChunkStart;
    view.setUint32(verticesChunkStart + 2, verticesChunkLength, true);
    
    // Faces chunk
    const facesChunkStart = offset;
    view.setUint16(offset, CHUNK_IDS.FACES, true);
    offset += 6;
    view.setUint16(offset, mesh.faces.length, true);
    offset += 2;
    
    for (const face of mesh.faces) {
      view.setUint16(offset, face.vertices[0], true);
      view.setUint16(offset + 2, face.vertices[1], true);
      view.setUint16(offset + 4, face.vertices[2], true);
      view.setUint16(offset + 6, 0); // Face flags
      offset += 8;
    }
    
    // Update faces chunk length
    const facesChunkLength = offset - facesChunkStart;
    view.setUint32(facesChunkStart + 2, facesChunkLength, true);
    
    // Update mesh chunk length
    const meshChunkLength = offset - meshChunkStart;
    view.setUint32(meshChunkStart + 2, meshChunkLength, true);
    
    // Update object chunk length
    const objectChunkLength = offset - objectChunkStart;
    view.setUint32(objectChunkStart + 2, objectChunkLength, true);
  }

  return buffer;
}

/**
 * Validate 3DS file format
 */
export function validate3DS(data: ArrayBuffer): boolean {
  try {
    const view = new DataView(data);
    
    // Check minimum size
    if (data.byteLength < 6) {
      return false;
    }
    
    // Check main chunk ID
    const mainChunkId = view.getUint16(0, true);
    if (mainChunkId !== CHUNK_IDS.MAIN) {
      return false;
    }
    
    // Check chunk length
    const mainChunkLength = view.getUint32(2, true);
    if (mainChunkLength !== data.byteLength) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Get information about 3DS file
 */
export function get3DSInfo(data: ArrayBuffer): {
  meshCount: number;
  vertexCount: number;
  faceCount: number;
  materialCount: number;
} {
  try {
    const chunks = parse3DSChunks(data);
    const meshes = parse3DSMeshes(chunks);
    
    let totalVertices = 0;
    let totalFaces = 0;
    
    for (const mesh of meshes) {
      totalVertices += mesh.vertices.length;
      totalFaces += mesh.faces.length;
    }
    
    return {
      meshCount: meshes.length,
      vertexCount: totalVertices,
      faceCount: totalFaces,
      materialCount: 0 // Materials not implemented yet
    };
  } catch {
    return {
      meshCount: 0,
      vertexCount: 0,
      faceCount: 0,
      materialCount: 0
    };
  }
} 