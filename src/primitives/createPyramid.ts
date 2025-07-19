import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

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
  
  // Create base faces
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
      
      // Create base face (material index 0)
      mesh.addFace(
        new Face(
          [a, b, c, d],
          [edgeAB, edgeBC, edgeCD, edgeDA],
          { materialIndex: 0 }
        )
      );
    }
  }
  
  // Create side faces (triangles from base to apex)
  // Front face
  for (let w = 0; w < widthSegments; w++) {
    const v1 = vertices[0][w];
    const v2 = vertices[0][w + 1];
    
    const edge1 = mesh.addEdge(new Edge(v1, v2));
    const edge2 = mesh.addEdge(new Edge(v2, apexIndex));
    const edge3 = mesh.addEdge(new Edge(apexIndex, v1));
    
    mesh.addFace(
      new Face(
        [v1, v2, apexIndex],
        [edge1, edge2, edge3],
        { materialIndex: 1 }
      )
    );
  }
  
  // Back face
  for (let w = 0; w < widthSegments; w++) {
    const v1 = vertices[heightSegments][w];
    const v2 = vertices[heightSegments][w + 1];
    
    const edge1 = mesh.addEdge(new Edge(v1, v2));
    const edge2 = mesh.addEdge(new Edge(v2, apexIndex));
    const edge3 = mesh.addEdge(new Edge(apexIndex, v1));
    
    mesh.addFace(
      new Face(
        [v1, v2, apexIndex],
        [edge1, edge2, edge3],
        { materialIndex: 2 }
      )
    );
  }
  
  // Left face
  for (let h = 0; h < heightSegments; h++) {
    const v1 = vertices[h][0];
    const v2 = vertices[h + 1][0];
    
    const edge1 = mesh.addEdge(new Edge(v1, v2));
    const edge2 = mesh.addEdge(new Edge(v2, apexIndex));
    const edge3 = mesh.addEdge(new Edge(apexIndex, v1));
    
    mesh.addFace(
      new Face(
        [v1, v2, apexIndex],
        [edge1, edge2, edge3],
        { materialIndex: 3 }
      )
    );
  }
  
  // Right face
  for (let h = 0; h < heightSegments; h++) {
    const v1 = vertices[h][widthSegments];
    const v2 = vertices[h + 1][widthSegments];
    
    const edge1 = mesh.addEdge(new Edge(v1, v2));
    const edge2 = mesh.addEdge(new Edge(v2, apexIndex));
    const edge3 = mesh.addEdge(new Edge(apexIndex, v1));
    
    mesh.addFace(
      new Face(
        [v1, v2, apexIndex],
        [edge1, edge2, edge3],
        { materialIndex: 4 }
      )
    );
  }
  
  return mesh;
} 