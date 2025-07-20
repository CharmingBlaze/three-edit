import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';
import { calculateFaceNormal } from '../utils/mathUtils.ts';

/**
 * Options for creating a cube
 */
export interface CreateCubeOptions {
  /** Width of the cube */
  width?: number;
  /** Height of the cube */
  height?: number;
  /** Depth of the cube */
  depth?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a cube as an EditableMesh
 * @param options Options for creating the cube
 * @returns A new EditableMesh instance representing a cube
 */
export function createCube(options: CreateCubeOptions = {}): EditableMesh {
  const width = options.width ?? 1;
  const height = options.height ?? 1;
  const depth = options.depth ?? 1;
  const name = options.name ?? 'Cube';
  
  const mesh = new EditableMesh({ name });
  
  // Half dimensions for vertex positioning
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;
  
  // Create 8 unique vertices for a cube (no duplicates)
  const vertices = [
    // Front face (z = halfDepth)
    new Vertex(-halfWidth, -halfHeight, halfDepth),   // 0: front-bottom-left
    new Vertex(halfWidth, -halfHeight, halfDepth),    // 1: front-bottom-right
    new Vertex(-halfWidth, halfHeight, halfDepth),    // 2: front-top-left
    new Vertex(halfWidth, halfHeight, halfDepth),     // 3: front-top-right
    
    // Back face (z = -halfDepth)
    new Vertex(-halfWidth, -halfHeight, -halfDepth),  // 4: back-bottom-left
    new Vertex(halfWidth, -halfHeight, -halfDepth),   // 5: back-bottom-right
    new Vertex(-halfWidth, halfHeight, -halfDepth),   // 6: back-top-left
    new Vertex(halfWidth, halfHeight, -halfDepth),    // 7: back-top-right
  ];
  
  // Add vertices to mesh
  const vertexIndices = vertices.map(vertex => {
    // Generate UVs for each vertex
    vertex.uv = { u: 0, v: 0 }; // Will be set properly per face
    return mesh.addVertex(vertex);
  });
  
  // Create faces with proper winding order (CCW)
  const faces: Face[] = [];

  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      const newEdge = new Edge(v1, v2);
      edgeMap[key] = mesh.addEdge(newEdge);
    }
    return edgeMap[key];
  };

  const addFace = (verts: number[], materialIndex: number) => {
    const edgeIndices: number[] = [];
    for (let i = 0; i < verts.length; i++) {
      const v1 = verts[i];
      const v2 = verts[(i + 1) % verts.length];
      edgeIndices.push(addEdge(v1, v2));
    }
    const face = new Face(verts, edgeIndices, { materialIndex });
    faces.push(face);
  };

  // Add faces
  addFace([vertexIndices[0], vertexIndices[1], vertexIndices[3], vertexIndices[2]], 0); // Front
  addFace([vertexIndices[5], vertexIndices[4], vertexIndices[6], vertexIndices[7]], 1); // Back
  addFace([vertexIndices[2], vertexIndices[3], vertexIndices[7], vertexIndices[6]], 2); // Top
  addFace([vertexIndices[4], vertexIndices[5], vertexIndices[1], vertexIndices[0]], 3); // Bottom
  addFace([vertexIndices[1], vertexIndices[5], vertexIndices[7], vertexIndices[3]], 4); // Right
  addFace([vertexIndices[4], vertexIndices[0], vertexIndices[2], vertexIndices[6]], 5); // Left
  
  // Add faces to mesh
  faces.forEach(face => mesh.addFace(face));
  
  // Calculate normals for all faces
  faces.forEach(face => {
    face.normal = calculateFaceNormal(mesh, face);
  });
  
  // Set proper UVs for each face
  const faceUVs = [
    // Front face UVs
    [
      { u: 0, v: 0 }, { u: 1, v: 0 },
      { u: 1, v: 1 }, { u: 0, v: 1 }
    ],
    // Back face UVs
    [
      { u: 1, v: 0 }, { u: 0, v: 0 },
      { u: 0, v: 1 }, { u: 1, v: 1 }
    ],
    // Top face UVs
    [
      { u: 0, v: 1 }, { u: 1, v: 1 },
      { u: 1, v: 0 }, { u: 0, v: 0 }
    ],
    // Bottom face UVs
    [
      { u: 0, v: 0 }, { u: 1, v: 0 },
      { u: 1, v: 1 }, { u: 0, v: 1 }
    ],
    // Right face UVs
    [
      { u: 0, v: 0 }, { u: 1, v: 0 },
      { u: 1, v: 1 }, { u: 0, v: 1 }
    ],
    // Left face UVs
    [
      { u: 1, v: 0 }, { u: 0, v: 0 },
      { u: 0, v: 1 }, { u: 1, v: 1 }
    ],
  ];
  
  // Apply UVs to vertices based on face
  for (let faceIndex = 0; faceIndex < faces.length; faceIndex++) {
    const face = faces[faceIndex];
    const faceUV = faceUVs[faceIndex];
    
    for (let i = 0; i < face.vertices.length; i++) {
      const vertexIndex = face.vertices[i];
      const vertex = mesh.getVertex(vertexIndex);
      if (vertex) {
        vertex.uv = faceUV[i];
      }
    }
  }
  
  return mesh;
}
