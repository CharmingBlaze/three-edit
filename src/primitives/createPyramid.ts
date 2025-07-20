import { EditableMesh } from '../core/index.ts';
import { Vertex } from '../core/index.ts';
import { Edge } from '../core/index.ts';
import { Face } from '../core/index.ts';

/**
 * Options for creating a pyramid
 */
export interface CreatePyramidOptions {
  /** Width of the base */
  width?: number;
  /** Height of the base */
  height?: number;
  /** Height of the pyramid */
  depth?: number;
  /** Number of width segments */
  widthSegments?: number;
  /** Number of height segments */
  heightSegments?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a pyramid as an EditableMesh
 * @param options Options for creating the pyramid
 * @returns A new EditableMesh instance representing a pyramid
 */
export function createPyramid(options: CreatePyramidOptions = {}): EditableMesh {
  const width = options.width ?? 1;
  const height = options.height ?? 1;
  const depth = options.depth ?? 1;
  const widthSegments = Math.max(1, Math.floor(options.widthSegments ?? 1));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const name = options.name ?? 'Pyramid';
  
  const mesh = new EditableMesh({ name });
  
  // Calculate half depth for positioning
  const halfDepth = depth / 2;
  
  // Create vertices for the pyramid
  const vertices: number[][] = [];
  
  // Create base vertices
  for (let h = 0; h <= heightSegments; h++) {
    const y = (h / heightSegments - 0.5) * height;
    const row: number[] = [];
    
    for (let w = 0; w <= widthSegments; w++) {
      const x = (w / widthSegments - 0.5) * width;
      const z = -halfDepth; // Base is at the bottom
      
      const vertex = new Vertex(x, y, z);
      
      // Generate UVs
      const u = w / widthSegments;
      const v = h / heightSegments;
      vertex.uv = { u, v };
      
      const vertexIndex = mesh.addVertex(vertex);
      row.push(vertexIndex);
    }
    
    vertices.push(row);
  }
  
  // Create apex vertex
  const apexVertex = new Vertex(0, 0, halfDepth);
  apexVertex.uv = { u: 0.5, v: 0.5 };
  const apexIndex = mesh.addVertex(apexVertex);
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create base faces
  for (let h = 0; h < heightSegments; h++) {
    for (let w = 0; w < widthSegments; w++) {
      const v1 = vertices[h][w];
      const v2 = vertices[h][w + 1];
      const v3 = vertices[h + 1][w + 1];
      const v4 = vertices[h + 1][w];

      const edge1 = addEdge(v1, v2);
      const edge2 = addEdge(v2, v3);
      const edge3 = addEdge(v3, v4);
      const edge4 = addEdge(v4, v1);

      mesh.addFace(new Face([v4, v3, v2, v1], [edge4, edge3, edge2, edge1], { materialIndex: 0 }));
    }
  }

  // Create side faces (triangles from base to apex)
  // Front face
  for (let w = 0; w < widthSegments; w++) {
    const v1 = vertices[0][w];
    const v2 = vertices[0][w + 1];

    const edge1 = addEdge(v1, v2);
    const edge2 = addEdge(v2, apexIndex);
    const edge3 = addEdge(apexIndex, v1);

    mesh.addFace(new Face([v1, v2, apexIndex], [edge1, edge2, edge3], { materialIndex: 1 }));
  }

  // Back face
  for (let w = 0; w < widthSegments; w++) {
    const v1 = vertices[heightSegments][w + 1];
    const v2 = vertices[heightSegments][w];

    const edge1 = addEdge(v1, v2);
    const edge2 = addEdge(v2, apexIndex);
    const edge3 = addEdge(apexIndex, v1);

    mesh.addFace(new Face([v1, v2, apexIndex], [edge1, edge2, edge3], { materialIndex: 2 }));
  }

  // Left face
  for (let h = 0; h < heightSegments; h++) {
    const v1 = vertices[h + 1][0];
    const v2 = vertices[h][0];

    const edge1 = addEdge(v1, v2);
    const edge2 = addEdge(v2, apexIndex);
    const edge3 = addEdge(apexIndex, v1);

    mesh.addFace(new Face([v1, v2, apexIndex], [edge1, edge2, edge3], { materialIndex: 3 }));
  }

  // Right face
  for (let h = 0; h < heightSegments; h++) {
    const v1 = vertices[h][widthSegments];
    const v2 = vertices[h + 1][widthSegments];

    const edge1 = addEdge(v1, v2);
    const edge2 = addEdge(v2, apexIndex);
    const edge3 = addEdge(apexIndex, v1);

    mesh.addFace(new Face([v1, v2, apexIndex], [edge1, edge2, edge3], { materialIndex: 4 }));
  }
  
  return mesh;
}