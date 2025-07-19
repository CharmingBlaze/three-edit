import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

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
  
  // Create edges and faces
  for (let h = 0; h < heightSegments; h++) {
    for (let w = 0; w < widthSegments; w++) {
      const a = vertices[h][w];
      const b = vertices[h][w + 1];
      const c = vertices[h + 1][w + 1];
      const d = vertices[h + 1][w];
      
      // Create edges
      const edgeAB = mesh.addEdge(new Edge(a, b));
      const edgeBC = mesh.addEdge(new Edge(b, c));
      const edgeCD = mesh.addEdge(new Edge(c, d));
      const edgeDA = mesh.addEdge(new Edge(d, a));
      
      // Create face (material index 0)
      mesh.addFace(
        new Face(
          [a, b, c, d],
          [edgeAB, edgeBC, edgeCD, edgeDA],
          { materialIndex: 0 }
        )
      );
    }
  }
  
  return mesh;
} 