import { Vector3, Vector2 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for OBJ import/export operations
 */
export interface OBJOptions {
  /** Whether to include vertex normals */
  includeNormals?: boolean;
  /** Whether to include texture coordinates */
  includeUVs?: boolean;
  /** Whether to include material information */
  includeMaterials?: boolean;
  /** Scale factor for coordinates */
  scale?: number;
  /** Whether to flip Y coordinates */
  flipY?: boolean;
  /** Whether to flip Z coordinates */
  flipZ?: boolean;
}

/**
 * Parses OBJ file content and creates an EditableMesh
 * @param content The OBJ file content as a string
 * @param options Options for parsing
 * @returns The created EditableMesh
 */
export function parseOBJ(content: string, options: OBJOptions = {}): EditableMesh {
  const includeNormals = options.includeNormals ?? true;
  const includeUVs = options.includeUVs ?? true;
  const includeMaterials = options.includeMaterials ?? true;
  const scale = options.scale ?? 1.0;
  const flipY = options.flipY ?? false;
  const flipZ = options.flipZ ?? false;

  const mesh = new EditableMesh();
  const vertices: Vector3[] = [];
  const normals: Vector3[] = [];
  const uvs: Vector2[] = [];
  const materials: Map<string, any> = new Map();
  let currentMaterial = 'default';

  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const parts = trimmedLine.split(/\s+/);
    const command = parts[0];

    switch (command) {
      case 'v': // Vertex
        if (parts.length >= 4) {
          const x = parseFloat(parts[1]) * scale;
          const y = parseFloat(parts[2]) * scale * (flipY ? -1 : 1);
          const z = parseFloat(parts[3]) * scale * (flipZ ? -1 : 1);
          vertices.push(new Vector3(x, y, z));
        }
        break;

      case 'vn': // Vertex normal
        if (parts.length >= 4 && includeNormals) {
          const x = parseFloat(parts[1]);
          const y = parseFloat(parts[2]) * (flipY ? -1 : 1);
          const z = parseFloat(parts[3]) * (flipZ ? -1 : 1);
          normals.push(new Vector3(x, y, z).normalize());
        }
        break;

      case 'vt': // Texture coordinate
        if (parts.length >= 3 && includeUVs) {
          const u = parseFloat(parts[1]);
          const v = parseFloat(parts[2]);
          uvs.push(new Vector2(u, v));
        }
        break;

      case 'f': // Face
        if (parts.length >= 4) {
          const faceVertices: number[] = [];
          const faceNormals: number[] = [];
          const faceUVs: number[] = [];

          for (let i = 1; i < parts.length; i++) {
            const vertexData = parts[i].split('/');
            const vertexIndex = parseInt(vertexData[0]) - 1;
            
            if (vertexIndex >= 0 && vertexIndex < vertices.length) {
              faceVertices.push(vertexIndex);
            }

            if (vertexData.length > 1 && vertexData[1] && includeUVs) {
              const uvIndex = parseInt(vertexData[1]) - 1;
              if (uvIndex >= 0 && uvIndex < uvs.length) {
                faceUVs.push(uvIndex);
              }
            }

            if (vertexData.length > 2 && vertexData[2] && includeNormals) {
              const normalIndex = parseInt(vertexData[2]) - 1;
              if (normalIndex >= 0 && normalIndex < normals.length) {
                faceNormals.push(normalIndex);
              }
            }
          }

          if (faceVertices.length >= 3) {
            // Create vertices for the face
            const meshVertices: number[] = [];
            for (let i = 0; i < faceVertices.length; i++) {
              const vertex = vertices[faceVertices[i]];
              const uv = faceUVs[i] !== undefined ? uvs[faceUVs[i]] : undefined;
              const normal = faceNormals[i] !== undefined ? normals[faceNormals[i]] : undefined;
              
              const vertexIndex = mesh.addVertex({
                x: vertex.x,
                y: vertex.y,
                z: vertex.z,
                uv: uv,
                normal: normal
              });
              meshVertices.push(vertexIndex);
            }

            // Create edges for the face
            const meshEdges: number[] = [];
            for (let i = 0; i < meshVertices.length; i++) {
              const v1 = meshVertices[i];
              const v2 = meshVertices[(i + 1) % meshVertices.length];
              const edge = new Edge(v1, v2);
              const edgeIndex = mesh.addEdge(edge);
              meshEdges.push(edgeIndex);
            }

            // Create face
            const face = new Face(meshVertices, meshEdges, {
              materialIndex: 0, // Default material
              normal: faceNormals.length > 0 ? normals[faceNormals[0]] : undefined
            });
            mesh.addFace(face);
          }
        }
        break;

      case 'usemtl': // Use material
        if (parts.length >= 2 && includeMaterials) {
          currentMaterial = parts[1];
        }
        break;

      case 'mtllib': // Material library
        // Material library loading would be implemented separately
        break;
    }
  }

  return mesh;
}

/**
 * Exports an EditableMesh to OBJ format
 * @param mesh The mesh to export
 * @param options Options for export
 * @returns The OBJ file content as a string
 */
export function exportOBJ(mesh: EditableMesh, options: OBJOptions = {}): string {
  const includeNormals = options.includeNormals ?? true;
  const includeUVs = options.includeUVs ?? true;
  const includeMaterials = options.includeMaterials ?? true;
  const scale = options.scale ?? 1.0;
  const flipY = options.flipY ?? false;
  const flipZ = options.flipZ ?? false;

  let content = '# Exported by three-edit\n';
  content += `# Vertices: ${mesh.getVertexCount()}\n`;
  content += `# Edges: ${mesh.getEdgeCount()}\n`;
  content += `# Faces: ${mesh.getFaceCount()}\n\n`;

  // Export vertices
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (vertex) {
      const x = vertex.x / scale;
      const y = vertex.y / scale * (flipY ? -1 : 1);
      const z = vertex.z / scale * (flipZ ? -1 : 1);
      content += `v ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
    }
  }

  // Export texture coordinates
  if (includeUVs) {
    for (let i = 0; i < mesh.getVertexCount(); i++) {
      const vertex = mesh.getVertex(i);
      if (vertex && vertex.uv) {
        content += `vt ${vertex.uv.u.toFixed(6)} ${vertex.uv.v.toFixed(6)}\n`;
      } else {
        content += `vt 0.000000 0.000000\n`;
      }
    }
  }

  // Export normals
  if (includeNormals) {
    for (let i = 0; i < mesh.getVertexCount(); i++) {
      const vertex = mesh.getVertex(i);
      if (vertex && vertex.normal) {
        const x = vertex.normal.x;
        const y = vertex.normal.y * (flipY ? -1 : 1);
        const z = vertex.normal.z * (flipZ ? -1 : 1);
        content += `vn ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
      } else {
        content += `vn 0.000000 1.000000 0.000000\n`;
      }
    }
  }

  // Export faces
  for (let i = 0; i < mesh.getFaceCount(); i++) {
    const face = mesh.getFace(i);
    if (face) {
      content += 'f';
      for (let j = 0; j < face.vertices.length; j++) {
        const vertexIndex = face.vertices[j] + 1; // OBJ uses 1-based indexing
        const uvIndex = includeUVs ? vertexIndex : '';
        const normalIndex = includeNormals ? vertexIndex : '';
        
        if (includeUVs && includeNormals) {
          content += ` ${vertexIndex}/${uvIndex}/${normalIndex}`;
        } else if (includeUVs) {
          content += ` ${vertexIndex}/${uvIndex}`;
        } else if (includeNormals) {
          content += ` ${vertexIndex}//${normalIndex}`;
        } else {
          content += ` ${vertexIndex}`;
        }
      }
      content += '\n';
    }
  }

  return content;
}

/**
 * Loads an OBJ file from a URL or file path
 * @param url The URL or file path to load from
 * @param options Options for loading
 * @returns Promise that resolves to the created EditableMesh
 */
export async function loadOBJ(url: string, options: OBJOptions = {}): Promise<EditableMesh> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load OBJ file: ${response.statusText}`);
    }
    const content = await response.text();
    return parseOBJ(content, options);
  } catch (error) {
    throw new Error(`Error loading OBJ file: ${error}`);
  }
}

/**
 * Saves an EditableMesh to an OBJ file
 * @param mesh The mesh to save
 * @param filename The filename to save to
 * @param options Options for saving
 * @returns Promise that resolves when the file is saved
 */
export async function saveOBJ(mesh: EditableMesh, filename: string, options: OBJOptions = {}): Promise<void> {
  try {
    const content = exportOBJ(mesh, options);
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
    throw new Error(`Error saving OBJ file: ${error}`);
  }
} 