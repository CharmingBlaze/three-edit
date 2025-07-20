import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

/**
 * Options for creating a plane
 */
export interface CreatePlaneOptions {
  /** Width of the plane */
  width?: number;
  /** Height of the plane */
  height?: number;
  /** Number of width segments */
  widthSegments?: number;
  /** Number of height segments */
  heightSegments?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a plane as an EditableMesh
 * @param options Options for creating the plane
 * @returns A new EditableMesh instance representing a plane
 */
export function createPlane(options: CreatePlaneOptions = {}): EditableMesh {
  const width = options.width ?? 1;
  const height = options.height ?? 1;
  const widthSegments = Math.max(1, Math.floor(options.widthSegments ?? 1));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const name = options.name ?? 'Plane';
  
  const mesh = new EditableMesh({ name });
  
  // Create vertices for the plane
  const vertices: number[][] = [];
  
  // Create vertices in a grid
  for (let h = 0; h <= heightSegments; h++) {
    const y = (h / heightSegments - 0.5) * height;
    const row: number[] = [];
    
    for (let w = 0; w <= widthSegments; w++) {
      const x = (w / widthSegments - 0.5) * width;
      const z = 0; // Plane is in XZ plane
      
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
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create edges and faces
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

      mesh.addFace(new Face([v1, v2, v3, v4], [edge1, edge2, edge3, edge4], { materialIndex: 0 }));
    }
  }
  
  return mesh;
} 