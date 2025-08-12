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
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  const addFace = (v: number[]) => {
    const edges = [
      addEdge(v[0], v[1]),
      addEdge(v[1], v[2]),
      addEdge(v[2], v[3]),
      addEdge(v[3], v[0]),
    ];
    mesh.addFace(new Face(v, edges, { materialIndex: 0 }));
  };

  // Bottom
  addFace([vertices[0], vertices[1], vertices[2], vertices[3]]);
  // Top
  addFace([vertices[4], vertices[5], vertices[6], vertices[7]]);
  // Left
  addFace([vertices[0], vertices[4], vertices[7], vertices[3]]);
  // Right
  addFace([vertices[1], vertices[2], vertices[6], vertices[5]]);
  // Front
  addFace([vertices[0], vertices[1], vertices[5], vertices[4]]);
  // Back
  addFace([vertices[3], vertices[7], vertices[6], vertices[2]]);
  
  return mesh;
} 