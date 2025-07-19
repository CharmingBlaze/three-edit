import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for creating a handle
 */
export interface CreateHandleOptions {
  /** Radius of the handle */
  radius?: number;
  /** Height of the handle */
  height?: number;
  /** Number of radial segments */
  radialSegments?: number;
  /** Number of height segments */
  heightSegments?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a handle as an EditableMesh
 * @param options Options for creating the handle
 * @returns A new EditableMesh instance representing a handle
 */
export function createHandle(options: CreateHandleOptions = {}): EditableMesh {
  const radius = options.radius ?? 0.1;
  const height = options.height ?? 0.5;
  const radialSegments = Math.max(3, Math.floor(options.radialSegments ?? 8));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const name = options.name ?? 'Handle';
  
  const mesh = new EditableMesh({ name });
  
  // Create vertices for the handle
  const vertices: number[][] = [];
  
  // Create vertices for each height segment
  for (let h = 0; h <= heightSegments; h++) {
    const y = (h / heightSegments - 0.5) * height;
    const row: number[] = [];
    
    // Create vertices around the circumference
    for (let r = 0; r <= radialSegments; r++) {
      const theta = (r / radialSegments) * Math.PI * 2;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      
      const vertex = new Vertex(x, y, z);
      
      // Generate UVs
      const u = r / radialSegments;
      const v = h / heightSegments;
      vertex.uv = { u, v };
      
      const vertexIndex = mesh.addVertex(vertex);
      row.push(vertexIndex);
    }
    
    vertices.push(row);
  }
  
  // Create edges and faces for the side walls
  for (let h = 0; h < heightSegments; h++) {
    for (let r = 0; r < radialSegments; r++) {
      const a = vertices[h][r];
      const b = vertices[h][r + 1];
      const c = vertices[h + 1][r + 1];
      const d = vertices[h + 1][r];
      
      // Create edges
      const edgeAB = mesh.addEdge(new Edge(a, b));
      const edgeBC = mesh.addEdge(new Edge(b, c));
      const edgeCD = mesh.addEdge(new Edge(c, d));
      const edgeDA = mesh.addEdge(new Edge(d, a));
      
      // Create face (material index 0 for sides)
      mesh.addFace(
        new Face(
          [a, b, c, d],
          [edgeAB, edgeBC, edgeCD, edgeDA],
          { materialIndex: 0 }
        )
      );
    }
  }
  
  // Create top and bottom caps
  // Bottom cap
  const bottomVertices: number[] = [];
  const bottomEdges: number[] = [];
  
  for (let r = 0; r < radialSegments; r++) {
    bottomVertices.push(vertices[0][r]);
    if (r > 0) {
      const edge = mesh.addEdge(new Edge(vertices[0][r - 1], vertices[0][r]));
      bottomEdges.push(edge);
    }
  }
  
  // Close the circle
  const bottomCloseEdge = mesh.addEdge(new Edge(vertices[0][radialSegments - 1], vertices[0][0]));
  bottomEdges.push(bottomCloseEdge);
  
  mesh.addFace(
    new Face(
      bottomVertices,
      bottomEdges,
      { materialIndex: 1 } // Bottom cap material
    )
  );
  
  // Top cap
  const topVertices: number[] = [];
  const topEdges: number[] = [];
  
  for (let r = 0; r < radialSegments; r++) {
    topVertices.push(vertices[heightSegments][r]);
    if (r > 0) {
      const edge = mesh.addEdge(new Edge(vertices[heightSegments][r - 1], vertices[heightSegments][r]));
      topEdges.push(edge);
    }
  }
  
  // Close the circle
  const topCloseEdge = mesh.addEdge(new Edge(vertices[heightSegments][radialSegments - 1], vertices[heightSegments][0]));
  topEdges.push(topCloseEdge);
  
  mesh.addFace(
    new Face(
      topVertices,
      topEdges,
      { materialIndex: 2 } // Top cap material
    )
  );
  
  return mesh;
} 