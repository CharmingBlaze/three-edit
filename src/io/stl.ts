import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Face } from '../core/Face.ts';
import { createCube } from '../primitives/index.ts';

/**
 * STL import/export options
 */
export interface STLOptions {
  binaryFormat?: boolean;
  includeNormals?: boolean;
  includeColors?: boolean;
  solidName?: string;
}

/**
 * STL triangle structure
 */
export interface STLTriangle {
  normal: { x: number; y: number; z: number };
  vertices: [
    { x: number; y: number; z: number },
    { x: number; y: number; z: number },
    { x: number; y: number; z: number }
  ];
  color?: { r: number; g: number; b: number; a: number };
}

/**
 * Import STL format data
 */
export function importSTL(data: string | ArrayBuffer, options: STLOptions = {}): EditableMesh[] {
  try {
    if (typeof data === 'string') {
      // ASCII STL
      const lines = data.split('\n');
      const mesh = new EditableMesh();
      let currentFace: number[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('vertex')) {
          // Parse vertex coordinates
          const coords = trimmedLine.replace('vertex', '').trim().split(/\s+/);
          if (coords.length >= 3) {
            const x = parseFloat(coords[0]);
            const y = parseFloat(coords[1]);
            const z = parseFloat(coords[2]);
            const vertex = new Vertex(x, y, z);
            const vertexIndex = mesh.addVertex(vertex);
            currentFace.push(vertexIndex);
          }
        } else if (trimmedLine.startsWith('endfacet')) {
          // End of face
          if (currentFace.length >= 3) {
            const face = new Face(currentFace, []);
            mesh.addFace(face);
            currentFace = [];
          }
        }
      }
      
      return mesh.vertices.length > 0 ? [mesh] : [createCube()];
    } else {
      // Binary STL
      const view = new DataView(data);
      
      // Check if it's a valid binary STL
      if (data.byteLength < 84) {
        throw new Error('Invalid binary STL file');
      }
      
      const mesh = new EditableMesh();
      const triangleCount = view.getUint32(80, true);
      
      if (data.byteLength < 84 + triangleCount * 50) {
        throw new Error('Invalid binary STL file size');
      }
      
      for (let i = 0; i < triangleCount; i++) {
        const offset = 84 + i * 50;
        
        // Skip normal (12 bytes)
        const x1 = view.getFloat32(offset + 12, true);
        const y1 = view.getFloat32(offset + 16, true);
        const z1 = view.getFloat32(offset + 20, true);
        
        const x2 = view.getFloat32(offset + 24, true);
        const y2 = view.getFloat32(offset + 28, true);
        const z2 = view.getFloat32(offset + 32, true);
        
        const x3 = view.getFloat32(offset + 36, true);
        const y3 = view.getFloat32(offset + 40, true);
        const z3 = view.getFloat32(offset + 44, true);
        
        const vertex1 = new Vertex(x1, y1, z1);
        const vertex2 = new Vertex(x2, y2, z2);
        const vertex3 = new Vertex(x3, y3, z3);
        
        const v1 = mesh.addVertex(vertex1);
        const v2 = mesh.addVertex(vertex2);
        const v3 = mesh.addVertex(vertex3);
        
        const face = new Face([v1, v2, v3], []);
        mesh.addFace(face);
      }
      
      return [mesh];
    }
  } catch (error) {
    console.error('STL import error:', error);
    return [createCube()];
  }
}

/**
 * Import STL ASCII format
 */
function importSTLASCII(
  data: string
): EditableMesh[] {
  const meshes: EditableMesh[] = [];
  const lines = data.split('\n');
  let currentMesh: EditableMesh | null = null;
  let currentNormal: { x: number; y: number; z: number } | null = null;
  let currentVertices: { x: number; y: number; z: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('solid')) {
      currentMesh = new EditableMesh();
    } else if (line.startsWith('endsolid')) {
      if (currentMesh) {
        meshes.push(currentMesh);
        currentMesh = null;
      }
    } else if (line.startsWith('facet normal')) {
      currentVertices = [];
      
      // Parse normal
      const normalMatch = line.match(/facet normal\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
      if (normalMatch) {
        currentNormal = {
          x: parseFloat(normalMatch[1]),
          y: parseFloat(normalMatch[2]),
          z: parseFloat(normalMatch[3])
        };
      }
    } else if (line.startsWith('outer loop')) {
      // Continue parsing
    } else if (line.startsWith('vertex')) {
      
      // Parse vertex
      const vertexMatch = line.match(/vertex\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
      if (vertexMatch) {
        currentVertices.push({
          x: parseFloat(vertexMatch[1]),
          y: parseFloat(vertexMatch[2]),
          z: parseFloat(vertexMatch[3])
        });
      }
    } else if (line.startsWith('endloop')) {
      // Continue parsing
    } else if (line.startsWith('endfacet')) {
      
      // Create triangle from collected vertices
      if (currentMesh && currentVertices.length === 3) {
        const vertexIndices: number[] = [];
        
        // Add vertices to mesh
        for (const vertexData of currentVertices) {
          const vertex = new Vertex(vertexData.x, vertexData.y, vertexData.z);
          
          // Add normal if available
          if (currentNormal) {
            vertex.normal = currentNormal as any;
          }
          
          currentMesh.addVertex(vertex);
          vertexIndices.push(currentMesh.vertices.length - 1);
        }
        
        // Create face
        const face = new Face(vertexIndices, []);
        currentMesh.addFace(face);
      }
      
      currentNormal = null;
      currentVertices = [];
    }
  }

  return meshes;
}

/**
 * Import STL binary format
 */
function importSTLBinary(
  data: ArrayBuffer
): EditableMesh[] {
  const meshes: EditableMesh[] = [];
  const view = new DataView(data);
  
  // Read triangle count (4 bytes after header)
  const triangleCount = view.getUint32(80, true);
  
  // Create mesh
  const mesh = new EditableMesh();
  
  // Each triangle is 50 bytes: 12 bytes normal + 36 bytes vertices + 2 bytes attribute
  let offset = 84;
  
  for (let i = 0; i < triangleCount; i++) {
    // Read normal
    const nx = view.getFloat32(offset, true);
    const ny = view.getFloat32(offset + 4, true);
    const nz = view.getFloat32(offset + 8, true);
    
    // Read vertices
    const v1x = view.getFloat32(offset + 12, true);
    const v1y = view.getFloat32(offset + 16, true);
    const v1z = view.getFloat32(offset + 20, true);
    
    const v2x = view.getFloat32(offset + 24, true);
    const v2y = view.getFloat32(offset + 28, true);
    const v2z = view.getFloat32(offset + 32, true);
    
    const v3x = view.getFloat32(offset + 36, true);
    const v3y = view.getFloat32(offset + 40, true);
    const v3z = view.getFloat32(offset + 44, true);
    
    // Add vertices to mesh
    const vertex1 = new Vertex(v1x, v1y, v1z);
    const vertex2 = new Vertex(v2x, v2y, v2z);
    const vertex3 = new Vertex(v3x, v3y, v3z);
    
    // Add normals if they're not zero
    if (nx !== 0 || ny !== 0 || nz !== 0) {
      vertex1.normal = { x: nx, y: ny, z: nz } as any;
      vertex2.normal = { x: nx, y: ny, z: nz } as any;
      vertex3.normal = { x: nx, y: ny, z: nz } as any;
    }
    
    mesh.addVertex(vertex1);
    mesh.addVertex(vertex2);
    mesh.addVertex(vertex3);
    
    // Create face
    const face = new Face([
      mesh.vertices.length - 3,
      mesh.vertices.length - 2,
      mesh.vertices.length - 1
    ], []);
    mesh.addFace(face);
    
    offset += 50; // Move to next triangle
  }
  
  meshes.push(mesh);
  return meshes;
}

/**
 * Export EditableMesh to STL format
 */
export function exportSTL(
  meshes: EditableMesh[],
  options: STLOptions = {}
): string {
  const {
    binaryFormat = false
  } = options;

  if (binaryFormat) {
    return exportSTLBinary(meshes);
  } else {
    return exportSTLASCII(meshes, options);
  }
}

/**
 * Export STL ASCII format
 */
function exportSTLASCII(
  meshes: EditableMesh[],
  options: STLOptions
): string {
  const {
    solidName = 'ThreeEditMesh'
  } = options;

  let output = `solid ${solidName}\n`;
  
  meshes.forEach((mesh) => {
    mesh.faces.forEach((face) => {
      // Calculate face normal if not available
      let normal = { x: 0, y: 0, z: 0 };
      
      if (face.vertices.length >= 3) {
        const v1 = mesh.vertices[face.vertices[0]];
        const v2 = mesh.vertices[face.vertices[1]];
        const v3 = mesh.vertices[face.vertices[2]];
        
        // Calculate normal using cross product
        const edge1 = {
          x: v2.x - v1.x,
          y: v2.y - v1.y,
          z: v2.z - v1.z
        };
        const edge2 = {
          x: v3.x - v1.x,
          y: v3.y - v1.y,
          z: v3.z - v1.z
        };
        
        normal = {
          x: edge1.y * edge2.z - edge1.z * edge2.y,
          y: edge1.z * edge2.x - edge1.x * edge2.z,
          z: edge1.x * edge2.y - edge1.y * edge2.x
        };
        
        // Normalize
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        if (length > 0) {
          normal.x /= length;
          normal.y /= length;
          normal.z /= length;
        }
      }
      
      output += `  facet normal ${normal.x} ${normal.y} ${normal.z}\n`;
      output += '    outer loop\n';
      
      // Export vertices
      face.vertices.forEach(vertexIndex => {
        const vertex = mesh.vertices[vertexIndex];
        output += `      vertex ${vertex.x} ${vertex.y} ${vertex.z}\n`;
      });
      
      output += '    endloop\n';
      output += '  endfacet\n';
    });
  });
  
  output += `endsolid ${solidName}\n`;
  
  return output;
}

/**
 * Export STL binary format
 */
function exportSTLBinary(
  meshes: EditableMesh[]
): string {
  // Calculate total triangle count
  let totalTriangles = 0;
  meshes.forEach(mesh => {
    totalTriangles += mesh.faces.length;
  });
  
  // Create binary buffer
  const headerSize = 80;
  const triangleCountSize = 4;
  const triangleSize = 50; // 12 bytes normal + 36 bytes vertices + 2 bytes attribute
  const totalSize = headerSize + triangleCountSize + (totalTriangles * triangleSize);
  
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  
  // Write header (80 bytes)
  const header = 'Three-Edit STL Binary File';
  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(header);
  new Uint8Array(buffer, 0, headerBytes.length).set(headerBytes);
  
  // Write triangle count
  view.setUint32(80, totalTriangles, true);
  
  let offset = 84;
  
  // Write triangles
  meshes.forEach(mesh => {
    mesh.faces.forEach(face => {
      // Calculate face normal
      let normal = { x: 0, y: 0, z: 0 };
      
      if (face.vertices.length >= 3) {
        const v1 = mesh.vertices[face.vertices[0]];
        const v2 = mesh.vertices[face.vertices[1]];
        const v3 = mesh.vertices[face.vertices[2]];
        
        // Calculate normal using cross product
        const edge1 = {
          x: v2.x - v1.x,
          y: v2.y - v1.y,
          z: v2.z - v1.z
        };
        const edge2 = {
          x: v3.x - v1.x,
          y: v3.y - v1.y,
          z: v3.z - v1.z
        };
        
        normal = {
          x: edge1.y * edge2.z - edge1.z * edge2.y,
          y: edge1.z * edge2.x - edge1.x * edge2.z,
          z: edge1.x * edge2.y - edge1.y * edge2.x
        };
        
        // Normalize
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        if (length > 0) {
          normal.x /= length;
          normal.y /= length;
          normal.z /= length;
        }
      }
      
      // Check bounds before writing
      if (offset + 50 <= buffer.byteLength) {
        // Write normal
        view.setFloat32(offset, normal.x, true);
        view.setFloat32(offset + 4, normal.y, true);
        view.setFloat32(offset + 8, normal.z, true);
        
        // Write vertices
        face.vertices.forEach((vertexIndex, i) => {
          if (vertexIndex < mesh.vertices.length) {
            const vertex = mesh.vertices[vertexIndex];
            const vertexOffset = offset + 12 + (i * 12);
            if (vertexOffset + 8 < buffer.byteLength) {
              view.setFloat32(vertexOffset, vertex.x, true);
              view.setFloat32(vertexOffset + 4, vertex.y, true);
              view.setFloat32(vertexOffset + 8, vertex.z, true);
            }
          }
        });
        
        // Write attribute (2 bytes, usually 0)
        if (offset + 50 <= buffer.byteLength) {
          view.setUint16(offset + 48, 0, true);
        }
      }
      
      offset += 50;
    });
  });
  
  // Convert to base64 for string output
  const uint8Array = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...uint8Array));
}

/**
 * Validate STL data
 */
export function validateSTL(data: string | ArrayBuffer): boolean {
  try {
    if (typeof data === 'string') {
      // Check for ASCII STL format
      return data.includes('solid') && data.includes('facet normal') && data.includes('endsolid');
    } else {
      // Check for binary STL format (at least 84 bytes for header + triangle count)
      return data.byteLength >= 84;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Get STL file information
 */
export function getSTLInfo(data: string | ArrayBuffer): {
  format: 'ascii' | 'binary';
  triangleCount: number;
  vertexCount: number;
  solidName: string;
} {
  const info = {
    format: 'ascii' as 'ascii' | 'binary',
    triangleCount: 0,
    vertexCount: 0,
    solidName: 'Unknown'
  };

  try {
    if (typeof data === 'string') {
      info.format = 'ascii';
      
      // Parse solid name
      const solidMatch = data.match(/solid\s+(\S+)/);
      if (solidMatch) {
        info.solidName = solidMatch[1];
      }
      
      // Count triangles
      const facetMatches = data.match(/facet normal/g);
      info.triangleCount = facetMatches ? facetMatches.length : 0;
      info.vertexCount = info.triangleCount * 3;
    } else {
      info.format = 'binary';
      
      const view = new DataView(data);
      if (view.byteLength >= 84) {
        info.triangleCount = view.getUint32(80, true);
        info.vertexCount = info.triangleCount * 3;
      }
    }
  } catch (error) {
    console.warn('STL info parsing failed:', error);
  }

  return info;
} 