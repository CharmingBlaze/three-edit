import { EditableMesh } from '../core/index';
import { Vertex } from '../core/index';
import { Edge } from '../core/index';
import { Face } from '../core/index';

/**
 * Options for creating a wedge
 */
export interface CreateWedgeOptions {
  /** Width of the wedge */
  width?: number;
  /** Height of the wedge */
  height?: number;
  /** Depth of the wedge */
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
 * Creates a wedge as an EditableMesh
 * @param options Options for creating the wedge
 * @returns A new EditableMesh instance representing a wedge
 */
export function createWedge(options: CreateWedgeOptions = {}): EditableMesh {
  const width = options.width ?? 1;
  const height = options.height ?? 1;
  const depth = options.depth ?? 1;
  const widthSegments = Math.max(1, Math.floor(options.widthSegments ?? 1));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const depthSegments = Math.max(1, Math.floor(options.depthSegments ?? 1));
  const name = options.name ?? 'Wedge';
  
  const mesh = new EditableMesh({ name });
  
  // Create vertices for the wedge
  const vertices: number[][] = [];
  
  // Create vertices for each depth segment
  for (let d = 0; d <= depthSegments; d++) {
    const z = (d / depthSegments - 0.5) * depth;
    const row: number[] = [];
    
    // Create vertices for each height segment
    for (let h = 0; h <= heightSegments; h++) {
      const y = (h / heightSegments - 0.5) * height;
      
      // Create vertices for each width segment
      for (let w = 0; w <= widthSegments; w++) {
        const x = (w / widthSegments - 0.5) * width;
        
        const u = w / widthSegments;
        const v = h / heightSegments;
        
        const vertex = new Vertex(x, y, z, { uv: { u, v } });
        const vertexIndex = mesh.addVertex(vertex);
        row.push(vertexIndex);
      }
    }
    
    vertices.push(row);
  }
  
  // Create edges and faces for the wedge
  for (let d = 0; d < depthSegments; d++) {
    for (let h = 0; h < heightSegments; h++) {
      for (let w = 0; w < widthSegments; w++) {
        const a = vertices[d][h * (widthSegments + 1) + w];
        const b = vertices[d][h * (widthSegments + 1) + w + 1];
        const c = vertices[d][(h + 1) * (widthSegments + 1) + w + 1];
        const d_vertex = vertices[d][(h + 1) * (widthSegments + 1) + w];
        const e = vertices[d + 1][h * (widthSegments + 1) + w];
        const f = vertices[d + 1][h * (widthSegments + 1) + w + 1];
        const g = vertices[d + 1][(h + 1) * (widthSegments + 1) + w + 1];
        const h_vertex = vertices[d + 1][(h + 1) * (widthSegments + 1) + w];
        
        // Create edges
        const edgeAB = mesh.addEdge(new Edge(a, b));
        const edgeBC = mesh.addEdge(new Edge(b, c));
        const edgeCD = mesh.addEdge(new Edge(c, d_vertex));
        const edgeDA = mesh.addEdge(new Edge(d_vertex, a));
        const edgeEF = mesh.addEdge(new Edge(e, f));
        const edgeFG = mesh.addEdge(new Edge(f, g));
        const edgeGH = mesh.addEdge(new Edge(g, h_vertex));
        const edgeHE = mesh.addEdge(new Edge(h_vertex, e));
        const edgeAE = mesh.addEdge(new Edge(a, e));
        const edgeBF = mesh.addEdge(new Edge(b, f));
        const edgeCG = mesh.addEdge(new Edge(c, g));
        const edgeDH = mesh.addEdge(new Edge(d_vertex, h_vertex));
        
        // Create faces (material indices: 0=bottom, 1=top, 2=left, 3=right, 4=front, 5=back)
        // Bottom face
        mesh.addFace(
          new Face(
            [a, b, c, d_vertex],
            [edgeAB, edgeBC, edgeCD, edgeDA],
            { materialIndex: 0 }
          )
        );
        
        // Top face
        mesh.addFace(
          new Face(
            [e, f, g, h_vertex],
            [edgeEF, edgeFG, edgeGH, edgeHE],
            { materialIndex: 1 }
          )
        );
        
        // Left face
        mesh.addFace(
          new Face(
            [a, d_vertex, h_vertex, e],
            [edgeDA, edgeDH, edgeHE, edgeAE],
            { materialIndex: 2 }
          )
        );
        
        // Right face
        mesh.addFace(
          new Face(
            [b, c, g, f],
            [edgeBC, edgeCG, edgeFG, edgeBF],
            { materialIndex: 3 }
          )
        );
        
        // Front face
        mesh.addFace(
          new Face(
            [a, b, f, e],
            [edgeAB, edgeBF, edgeEF, edgeAE],
            { materialIndex: 4 }
          )
        );
        
        // Back face
        mesh.addFace(
          new Face(
            [d_vertex, c, g, h_vertex],
            [edgeCD, edgeCG, edgeGH, edgeDH],
            { materialIndex: 5 }
          )
        );
      }
    }
  }
  
  return mesh;
} 