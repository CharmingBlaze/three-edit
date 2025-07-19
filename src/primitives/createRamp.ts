import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for creating a ramp
 */
export interface CreateRampOptions {
  /** Width of the ramp */
  width?: number;
  /** Height of the ramp */
  height?: number;
  /** Length of the ramp */
  length?: number;
  /** Number of width segments */
  widthSegments?: number;
  /** Number of height segments */
  heightSegments?: number;
  /** Number of length segments */
  lengthSegments?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a ramp as an EditableMesh
 * @param options Options for creating the ramp
 * @returns A new EditableMesh instance representing a ramp
 */
export function createRamp(options: CreateRampOptions = {}): EditableMesh {
  const width = options.width ?? 2;
  const height = options.height ?? 1;
  const length = options.length ?? 4;
  const widthSegments = Math.max(1, Math.floor(options.widthSegments ?? 1));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const lengthSegments = Math.max(1, Math.floor(options.lengthSegments ?? 1));
  const name = options.name ?? 'Ramp';
  
  const mesh = new EditableMesh({ name });
  
  // Create vertices for the ramp
  const vertices: number[][] = [];
  
  // Create vertices for each height segment
  for (let h = 0; h <= heightSegments; h++) {
    const y = (h / heightSegments) * height;
    const heightPlane: number[][] = [];
    
    // Create vertices for each length segment
    for (let l = 0; l <= lengthSegments; l++) {
      const z = (l / lengthSegments - 0.5) * length;
      const lengthRow: number[] = [];
      
      // Create vertices for each width segment
      for (let w = 0; w <= widthSegments; w++) {
        const x = (w / widthSegments - 0.5) * width;
        
        const vertex = new Vertex(x, y, z);
        vertex.uv = { u: w / widthSegments, v: l / lengthSegments };
        
        const vertexIndex = mesh.addVertex(vertex);
        lengthRow.push(vertexIndex);
      }
      
      heightPlane.push(lengthRow);
    }
    
    vertices.push(heightPlane);
  }
  
  // Create edges and faces for the ramp
  for (let h = 0; h < heightSegments; h++) {
    for (let l = 0; l < lengthSegments; l++) {
      for (let w = 0; w < widthSegments; w++) {
        const a = vertices[h][l][w];
        const b = vertices[h][l][w + 1];
        const c = vertices[h][l + 1][w + 1];
        const d = vertices[h][l + 1][w];
        const e = vertices[h + 1][l][w];
        const f = vertices[h + 1][l][w + 1];
        const g = vertices[h + 1][l + 1][w + 1];
        const h_vertex = vertices[h + 1][l + 1][w];
        
        // Create edges
        const edgeAB = mesh.addEdge(new Edge(a, b));
        const edgeBC = mesh.addEdge(new Edge(b, c));
        const edgeCD = mesh.addEdge(new Edge(c, d));
        const edgeDA = mesh.addEdge(new Edge(d, a));
        const edgeEF = mesh.addEdge(new Edge(e, f));
        const edgeFG = mesh.addEdge(new Edge(f, g));
        const edgeGH = mesh.addEdge(new Edge(g, h_vertex));
        const edgeHE = mesh.addEdge(new Edge(h_vertex, e));
        const edgeAE = mesh.addEdge(new Edge(a, e));
        const edgeBF = mesh.addEdge(new Edge(b, f));
        const edgeCG = mesh.addEdge(new Edge(c, g));
        const edgeDH = mesh.addEdge(new Edge(d, h_vertex));
        
        // Create faces (material indices: 0=top, 1=bottom, 2=left, 3=right, 4=front, 5=back)
        // Top face (ramp surface)
        mesh.addFace(
          new Face(
            [e, f, g, h_vertex],
            [edgeEF, edgeFG, edgeGH, edgeHE],
            { materialIndex: 0 }
          )
        );
        
        // Bottom face
        mesh.addFace(
          new Face(
            [a, b, c, d],
            [edgeAB, edgeBC, edgeCD, edgeDA],
            { materialIndex: 1 }
          )
        );
        
        // Left side
        if (w === 0) {
          mesh.addFace(
            new Face(
              [a, d, h_vertex, e],
              [edgeDA, edgeDH, edgeHE, edgeAE],
              { materialIndex: 2 }
            )
          );
        }
        
        // Right side
        if (w === widthSegments - 1) {
          mesh.addFace(
            new Face(
              [b, c, g, f],
              [edgeBC, edgeCG, edgeFG, edgeBF],
              { materialIndex: 3 }
            )
          );
        }
        
        // Front face (low end)
        if (l === 0) {
          mesh.addFace(
            new Face(
              [a, b, f, e],
              [edgeAB, edgeBF, edgeEF, edgeAE],
              { materialIndex: 4 }
            )
          );
        }
        
        // Back face (high end)
        if (l === lengthSegments - 1) {
          mesh.addFace(
            new Face(
              [d, c, g, h_vertex],
              [edgeCD, edgeCG, edgeGH, edgeDH],
              { materialIndex: 5 }
            )
          );
        }
      }
    }
  }
  
  return mesh;
} 