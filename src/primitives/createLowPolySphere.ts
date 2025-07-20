import { EditableMesh } from '../core/index.ts';
import { Vertex } from '../core/index.ts';
import { Edge } from '../core/index.ts';
import { Face } from '../core/index.ts';

/**
 * Options for creating a low-poly sphere
 */
export interface CreateLowPolySphereOptions {
  /** Radius of the sphere */
  radius?: number;
  /** Number of segments around the sphere */
  segments?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a low-poly sphere as an EditableMesh
 * @param options Options for creating the low-poly sphere
 * @returns A new EditableMesh instance representing a low-poly sphere
 */
export function createLowPolySphere(options: CreateLowPolySphereOptions = {}): EditableMesh {
  const radius = options.radius ?? 1;
  const segments = Math.max(3, Math.floor(options.segments ?? 6));
  const name = options.name ?? 'LowPolySphere';
  
  const mesh = new EditableMesh({ name });
  
  // Create vertices for the low-poly sphere
  const vertices: number[] = [];
  
  // Create center vertex
  const centerVertex = new Vertex(0, 0, 0);
  centerVertex.uv = { u: 0.5, v: 0.5 };
  const centerIndex = mesh.addVertex(centerVertex);
  
  // Create vertices around the sphere
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    
    const vertex = new Vertex(x, 0, z);
    vertex.uv = { u: (Math.cos(theta) + 1) / 2, v: (Math.sin(theta) + 1) / 2 };
    
    const vertexIndex = mesh.addVertex(vertex);
    vertices.push(vertexIndex);
  }
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create edges and faces
  for (let i = 0; i < segments; i++) {
    const v1 = vertices[i];
    const v2 = vertices[(i + 1) % segments];

    const edge1 = addEdge(centerIndex, v1);
    const edge2 = addEdge(v1, v2);
    const edge3 = addEdge(v2, centerIndex);

    // Create face (material index 0)
    mesh.addFace(new Face([centerIndex, v1, v2], [edge1, edge2, edge3], { materialIndex: 0 }));
  }
  
  return mesh;
} 