import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { calculateFaceNormal } from '../utils/mathUtils';

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
  /** Number of width segments */
  widthSegments?: number;
  /** Number of height segments */
  heightSegments?: number;
  /** Number of depth segments */
  depthSegments?: number;
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
  
  // Create edges
  const edges = [
    // Front face edges
    mesh.addEdge(new Edge(vertexIndices[0], vertexIndices[1])), // bottom
    mesh.addEdge(new Edge(vertexIndices[1], vertexIndices[3])), // right
    mesh.addEdge(new Edge(vertexIndices[3], vertexIndices[2])), // top
    mesh.addEdge(new Edge(vertexIndices[2], vertexIndices[0])), // left
    
    // Back face edges
    mesh.addEdge(new Edge(vertexIndices[4], vertexIndices[5])), // bottom
    mesh.addEdge(new Edge(vertexIndices[5], vertexIndices[7])), // right
    mesh.addEdge(new Edge(vertexIndices[7], vertexIndices[6])), // top
    mesh.addEdge(new Edge(vertexIndices[6], vertexIndices[4])), // left
    
    // Connecting edges
    mesh.addEdge(new Edge(vertexIndices[0], vertexIndices[4])), // bottom-left
    mesh.addEdge(new Edge(vertexIndices[1], vertexIndices[5])), // bottom-right
    mesh.addEdge(new Edge(vertexIndices[2], vertexIndices[6])), // top-left
    mesh.addEdge(new Edge(vertexIndices[3], vertexIndices[7])), // top-right
  ];
  
  // Create faces with proper winding order (CCW)
  const faces = [
    // Front face (z = halfDepth)
    new Face(
      [vertexIndices[0], vertexIndices[1], vertexIndices[3], vertexIndices[2]],
      [edges[0], edges[1], edges[2], edges[3]],
      { materialIndex: 0 }
    ),
    
    // Back face (z = -halfDepth)
    new Face(
      [vertexIndices[5], vertexIndices[4], vertexIndices[6], vertexIndices[7]],
      [edges[4], edges[7], edges[6], edges[5]],
      { materialIndex: 1 }
    ),
    
    // Top face (y = halfHeight)
    new Face(
      [vertexIndices[2], vertexIndices[3], vertexIndices[7], vertexIndices[6]],
      [edges[2], edges[11], edges[6], edges[10]],
      { materialIndex: 2 }
    ),
    
    // Bottom face (y = -halfHeight)
    new Face(
      [vertexIndices[4], vertexIndices[5], vertexIndices[1], vertexIndices[0]],
      [edges[4], edges[9], edges[0], edges[8]],
      { materialIndex: 3 }
    ),
    
    // Right face (x = halfWidth)
    new Face(
      [vertexIndices[1], vertexIndices[5], vertexIndices[7], vertexIndices[3]],
      [edges[1], edges[9], edges[11], edges[5]],
      { materialIndex: 4 }
    ),
    
    // Left face (x = -halfWidth)
    new Face(
      [vertexIndices[4], vertexIndices[0], vertexIndices[2], vertexIndices[6]],
      [edges[8], edges[3], edges[10], edges[7]],
      { materialIndex: 5 }
    ),
  ];
  
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
