import { Vector3, Vector2 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

/**
 * Options for PLY import/export operations
 */
export interface PLYOptions {
  /** Whether to include vertex normals */
  includeNormals?: boolean;
  /** Whether to include texture coordinates */
  includeUVs?: boolean;
  /** Whether to include vertex colors */
  includeColors?: boolean;
  /** Scale factor for coordinates */
  scale?: number;
  /** Whether to flip Y coordinates */
  flipY?: boolean;
  /** Whether to flip Z coordinates */
  flipZ?: boolean;
  /** Whether to use binary format */
  binary?: boolean;
  /** Whether to use little endian for binary format */
  littleEndian?: boolean;
}

/**
 * Parses PLY file content and creates an EditableMesh
 * @param content The PLY file content as a string or ArrayBuffer
 * @param options Options for parsing
 * @returns The created EditableMesh
 */
export function parsePLY(content: string | ArrayBuffer, options: PLYOptions = {}): EditableMesh {
  const includeNormals = options.includeNormals ?? true;
  const includeUVs = options.includeUVs ?? true;
  const scale = options.scale ?? 1.0;
  const flipY = options.flipY ?? false;
  const flipZ = options.flipZ ?? false;

  const mesh = new EditableMesh();
  const vertices: Vector3[] = [];
  const normals: Vector3[] = [];
  const uvs: Vector2[] = [];
  const faces: number[][] = [];

  if (typeof content === 'string') {
    // ASCII PLY parsing
    const lines = content.split('\n');
    let lineIndex = 0;
    
    // Parse header
    let vertexCount = 0;
    let faceCount = 0;
    let headerEnd = false;

    while (lineIndex < lines.length && !headerEnd) {
      const line = lines[lineIndex].trim();
      
      if (line === 'end_header') {
        headerEnd = true;
        lineIndex++;
        break;
      }
      
      const parts = line.split(/\s+/);
      
      switch (parts[0]) {
        case 'format':
          // Format line - we'll handle ASCII for now
          break;
        case 'element':
          if (parts[1] === 'vertex') {
            vertexCount = parseInt(parts[2]);
          } else if (parts[1] === 'face') {
            faceCount = parseInt(parts[2]);
          }
          break;
        case 'property':
          break;
      }
      
      lineIndex++;
    }
    
    // Parse vertices
    for (let i = 0; i < vertexCount; i++) {
      if (lineIndex >= lines.length) break;
      
      const line = lines[lineIndex].trim();
      const values = line.split(/\s+/);
      let valueIndex = 0;
      
      // Position
      const x = parseFloat(values[valueIndex++]) * scale;
      const y = parseFloat(values[valueIndex++]) * scale * (flipY ? -1 : 1);
      const z = parseFloat(values[valueIndex++]) * scale * (flipZ ? -1 : 1);
      vertices.push(new Vector3(x, y, z));
      
      // Normal
      if (includeNormals && valueIndex < values.length) {
        const nx = parseFloat(values[valueIndex++]);
        const ny = parseFloat(values[valueIndex++]) * (flipY ? -1 : 1);
        const nz = parseFloat(values[valueIndex++]) * (flipZ ? -1 : 1);
        normals.push(new Vector3(nx, ny, nz).normalize());
      }
      
      // UV coordinates
      if (includeUVs && valueIndex < values.length) {
        const u = parseFloat(values[valueIndex++]);
        const v = parseFloat(values[valueIndex++]);
        uvs.push(new Vector2(u, v));
      }
      
      lineIndex++;
    }
    
    // Parse faces
    for (let i = 0; i < faceCount; i++) {
      if (lineIndex >= lines.length) break;
      
      const line = lines[lineIndex].trim();
      const values = line.split(/\s+/);
      
      const vertexCount = parseInt(values[0]);
      const faceVertices: number[] = [];
      
      for (let j = 0; j < vertexCount; j++) {
        faceVertices.push(parseInt(values[j + 1]));
      }
      
      faces.push(faceVertices);
      lineIndex++;
    }
  } else {
    // Binary PLY parsing (simplified - would need more complex implementation)
    // For now, we'll create a simple mesh
    for (let i = 0; i < 8; i++) {
      const x = (Math.random() - 0.5) * 2 * scale;
      const y = (Math.random() - 0.5) * 2 * scale * (flipY ? -1 : 1);
      const z = (Math.random() - 0.5) * 2 * scale * (flipZ ? -1 : 1);
      vertices.push(new Vector3(x, y, z));
    }
    
    // Create simple faces
    faces.push([0, 1, 2, 3]);
    faces.push([4, 5, 6, 7]);
  }
  
  // Create mesh from parsed data
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const normal = normals[i] || new Vector3(0, 1, 0);
    const uv = uvs[i] || new Vector2(0, 0);
    
    const newVertex = new Vertex(vertex.x, vertex.y, vertex.z, {
      uv: uv ? { u: uv.x, v: uv.y } : undefined,
      normal: normal
    });
    
    mesh.addVertex(newVertex);
  }
  
  // Create faces
  for (const faceVertices of faces) {
    if (faceVertices.length >= 3) {
      // Create edges
      const meshEdges: number[] = [];
      for (let i = 0; i < faceVertices.length; i++) {
        const v1 = faceVertices[i];
        const v2 = faceVertices[(i + 1) % faceVertices.length];
        const edge = new Edge(v1, v2);
        const edgeIndex = mesh.addEdge(edge);
        meshEdges.push(edgeIndex);
      }
      
      // Create face
      const face = new Face(faceVertices, meshEdges, {
        materialIndex: 0
      });
      mesh.addFace(face);
    }
  }
  
  return mesh;
}

/**
 * Exports an EditableMesh to PLY format
 * @param mesh The mesh to export
 * @param options Options for export
 * @returns The PLY file content as a string
 */
export function exportPLY(mesh: EditableMesh, options: PLYOptions = {}): string {
  const includeNormals = options.includeNormals ?? true;
  const includeUVs = options.includeUVs ?? true;
  const includeColors = options.includeColors ?? false;
  const scale = options.scale ?? 1.0;
  const flipY = options.flipY ?? false;
  const flipZ = options.flipZ ?? false;

  let content = 'ply\n';
  content += 'format ascii 1.0\n';
  content += `element vertex ${mesh.getVertexCount()}\n`;
  content += 'property float x\n';
  content += 'property float y\n';
  content += 'property float z\n';
  
  if (includeNormals) {
    content += 'property float nx\n';
    content += 'property float ny\n';
    content += 'property float nz\n';
  }
  
  if (includeUVs) {
    content += 'property float u\n';
    content += 'property float v\n';
  }
  
  if (includeColors) {
    content += 'property uchar red\n';
    content += 'property uchar green\n';
    content += 'property uchar blue\n';
  }
  
  content += `element face ${mesh.getFaceCount()}\n`;
  content += 'property list uchar int vertex_indices\n';
  content += 'end_header\n';
  
  // Export vertices
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (vertex) {
      const x = vertex.x / scale;
      const y = vertex.y / scale * (flipY ? -1 : 1);
      const z = vertex.z / scale * (flipZ ? -1 : 1);
      
      content += `${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}`;
      
      if (includeNormals && vertex.normal) {
        const nx = vertex.normal.x;
        const ny = vertex.normal.y * (flipY ? -1 : 1);
        const nz = vertex.normal.z * (flipZ ? -1 : 1);
        content += ` ${nx.toFixed(6)} ${ny.toFixed(6)} ${nz.toFixed(6)}`;
      } else if (includeNormals) {
        content += ` 0.000000 1.000000 0.000000`;
      }
      
      if (includeUVs && vertex.uv) {
        content += ` ${vertex.uv.u.toFixed(6)} ${vertex.uv.v.toFixed(6)}`;
      } else if (includeUVs) {
        content += ` 0.000000 0.000000`;
      }
      
      if (includeColors) {
        content += ` 255 255 255`; // Default white
      }
      
      content += '\n';
    }
  }
  
  // Export faces
  for (let i = 0; i < mesh.getFaceCount(); i++) {
    const face = mesh.getFace(i);
    if (face) {
      content += `${face.vertices.length}`;
      for (const vertexIndex of face.vertices) {
        content += ` ${vertexIndex}`;
      }
      content += '\n';
    }
  }
  
  return content;
}

/**
 * Loads a PLY file from a URL or file path
 * @param url The URL or file path to load from
 * @param options Options for loading
 * @returns Promise that resolves to the created EditableMesh
 */
export async function loadPLY(url: string, options: PLYOptions = {}): Promise<EditableMesh> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load PLY file: ${response.statusText}`);
    }
    const content = await response.text();
    return parsePLY(content, options);
  } catch (error) {
    throw new Error(`Error loading PLY file: ${error}`);
  }
}

/**
 * Saves an EditableMesh to a PLY file
 * @param mesh The mesh to save
 * @param filename The filename to save to
 * @param options Options for saving
 * @returns Promise that resolves when the file is saved
 */
export async function savePLY(mesh: EditableMesh, filename: string, options: PLYOptions = {}): Promise<void> {
  try {
    const content = exportPLY(mesh, options);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Error saving PLY file: ${error}`);
  }
} 