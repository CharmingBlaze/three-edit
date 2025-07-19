import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for creating an empty object
 */
export interface CreateEmptyOptions {
  /** Size of the empty object (for visualization) */
  size?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates an empty object as an EditableMesh
 * @param options Options for creating the empty object
 * @returns A new EditableMesh instance representing an empty object
 */
export function createEmpty(options: CreateEmptyOptions = {}): EditableMesh {
  const size = options.size ?? 0.1;
  const name = options.name ?? 'Empty';
  
  const mesh = new EditableMesh({ name });
  
  // Create a minimal cube for visualization
  const halfSize = size / 2;
  
  // Create 8 vertices for a cube
  const vertices: number[] = [];
  
  // Bottom face vertices
  const bottomVertices = [
    new Vertex(-halfSize, -halfSize, -halfSize),
    new Vertex(halfSize, -halfSize, -halfSize),
    new Vertex(halfSize, -halfSize, halfSize),
    new Vertex(-halfSize, -halfSize, halfSize)
  ];
  
  // Top face vertices
  const topVertices = [
    new Vertex(-halfSize, halfSize, -halfSize),
    new Vertex(halfSize, halfSize, -halfSize),
    new Vertex(halfSize, halfSize, halfSize),
    new Vertex(-halfSize, halfSize, halfSize)
  ];
  
  // Add UVs to all vertices
  const allVertices = [...bottomVertices, ...topVertices];
  for (let i = 0; i < allVertices.length; i++) {
    const vertex = allVertices[i];
    vertex.uv = { u: i % 2, v: Math.floor(i / 2) };
    vertices.push(mesh.addVertex(vertex));
  }
  
  // Create faces with their own edges (material index 0 for all faces)
  // Bottom face
  const bottomEdges = [
    mesh.addEdge(new Edge(vertices[0], vertices[1])),
    mesh.addEdge(new Edge(vertices[1], vertices[2])),
    mesh.addEdge(new Edge(vertices[2], vertices[3])),
    mesh.addEdge(new Edge(vertices[3], vertices[0]))
  ];
  mesh.addFace(
    new Face(
      [vertices[0], vertices[1], vertices[2], vertices[3]],
      bottomEdges,
      { materialIndex: 0 }
    )
  );
  
  // Top face
  const topEdges = [
    mesh.addEdge(new Edge(vertices[4], vertices[5])),
    mesh.addEdge(new Edge(vertices[5], vertices[6])),
    mesh.addEdge(new Edge(vertices[6], vertices[7])),
    mesh.addEdge(new Edge(vertices[7], vertices[4]))
  ];
  mesh.addFace(
    new Face(
      [vertices[4], vertices[5], vertices[6], vertices[7]],
      topEdges,
      { materialIndex: 0 }
    )
  );
  
  // Left face
  const leftEdges = [
    mesh.addEdge(new Edge(vertices[0], vertices[3])),
    mesh.addEdge(new Edge(vertices[3], vertices[7])),
    mesh.addEdge(new Edge(vertices[7], vertices[4])),
    mesh.addEdge(new Edge(vertices[4], vertices[0]))
  ];
  mesh.addFace(
    new Face(
      [vertices[0], vertices[3], vertices[7], vertices[4]],
      leftEdges,
      { materialIndex: 0 }
    )
  );
  
  // Right face
  const rightEdges = [
    mesh.addEdge(new Edge(vertices[1], vertices[2])),
    mesh.addEdge(new Edge(vertices[2], vertices[6])),
    mesh.addEdge(new Edge(vertices[6], vertices[5])),
    mesh.addEdge(new Edge(vertices[5], vertices[1]))
  ];
  mesh.addFace(
    new Face(
      [vertices[1], vertices[2], vertices[6], vertices[5]],
      rightEdges,
      { materialIndex: 0 }
    )
  );
  
  // Front face
  const frontEdges = [
    mesh.addEdge(new Edge(vertices[0], vertices[1])),
    mesh.addEdge(new Edge(vertices[1], vertices[5])),
    mesh.addEdge(new Edge(vertices[5], vertices[4])),
    mesh.addEdge(new Edge(vertices[4], vertices[0]))
  ];
  mesh.addFace(
    new Face(
      [vertices[0], vertices[1], vertices[5], vertices[4]],
      frontEdges,
      { materialIndex: 0 }
    )
  );
  
  // Back face
  const backEdges = [
    mesh.addEdge(new Edge(vertices[3], vertices[2])),
    mesh.addEdge(new Edge(vertices[2], vertices[6])),
    mesh.addEdge(new Edge(vertices[6], vertices[7])),
    mesh.addEdge(new Edge(vertices[7], vertices[3]))
  ];
  mesh.addFace(
    new Face(
      [vertices[3], vertices[2], vertices[6], vertices[7]],
      backEdges,
      { materialIndex: 0 }
    )
  );
  
  return mesh;
} 