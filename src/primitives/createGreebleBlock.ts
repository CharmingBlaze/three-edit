import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for creating a greeble block
 */
export interface CreateGreebleBlockOptions {
  /** Width of the block */
  width?: number;
  /** Height of the block */
  height?: number;
  /** Depth of the block */
  depth?: number;
  /** Number of greeble divisions */
  divisions?: number;
  /** Maximum height of greeble details */
  detailHeight?: number;
  /** Random seed for greeble generation */
  seed?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Simple random number generator for consistent greeble generation
 */
function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Creates a greeble block as an EditableMesh
 * @param options Options for creating the greeble block
 * @returns A new EditableMesh instance representing a greeble block
 */
export function createGreebleBlock(options: CreateGreebleBlockOptions = {}): EditableMesh {
  const width = options.width ?? 1;
  const height = options.height ?? 1;
  const depth = options.depth ?? 1;
  const divisions = Math.max(2, Math.floor(options.divisions ?? 3));
  const detailHeight = options.detailHeight ?? 0.1;
  const seed = options.seed ?? Math.floor(Math.random() * 1000000);
  const name = options.name ?? 'GreebleBlock';
  
  const mesh = new EditableMesh({ name });
  const random = seededRandom(seed);
  
  // Calculate dimensions
  const divisionWidth = width / divisions;
  const divisionHeight = height / divisions;
  const divisionDepth = depth / divisions;
  
  // Create vertices for the greeble block
  const vertices: number[][][] = [];
  
  // Create vertices for each division
  for (let d = 0; d <= divisions; d++) {
    const z = (d / divisions - 0.5) * depth;
    const depthPlane: number[][] = [];
    
    for (let h = 0; h <= divisions; h++) {
      const y = (h / divisions - 0.5) * height;
      const heightRow: number[] = [];
      
      for (let w = 0; w <= divisions; w++) {
        const x = (w / divisions - 0.5) * width;
        
        // Add greeble detail height
        const detailOffset = random() * detailHeight;
        const finalY = y + detailOffset;
        
        const vertex = new Vertex(x, finalY, z);
        vertex.uv = { u: w / divisions, v: h / divisions };
        
        const vertexIndex = mesh.addVertex(vertex);
        heightRow.push(vertexIndex);
      }
      
      depthPlane.push(heightRow);
    }
    
    vertices.push(depthPlane);
  }
  
  // Create edges and faces
  for (let d = 0; d < divisions; d++) {
    for (let h = 0; h < divisions; h++) {
      for (let w = 0; w < divisions; w++) {
        const a = vertices[d][h][w];
        const b = vertices[d][h][w + 1];
        const c = vertices[d][h + 1][w + 1];
        const d_vertex = vertices[d][h + 1][w];
        const e = vertices[d + 1][h][w];
        const f = vertices[d + 1][h][w + 1];
        const g = vertices[d + 1][h + 1][w + 1];
        const h_vertex = vertices[d + 1][h + 1][w];
        
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
        
        // Create faces (material indices: 0=top, 1=bottom, 2=left, 3=right, 4=front, 5=back)
        // Top face
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
            [a, b, c, d_vertex],
            [edgeAB, edgeBC, edgeCD, edgeDA],
            { materialIndex: 1 }
          )
        );
        
        // Left side
        if (w === 0) {
          mesh.addFace(
            new Face(
              [a, d_vertex, h_vertex, e],
              [edgeDA, edgeDH, edgeHE, edgeAE],
              { materialIndex: 2 }
            )
          );
        }
        
        // Right side
        if (w === divisions - 1) {
          mesh.addFace(
            new Face(
              [b, c, g, f],
              [edgeBC, edgeCG, edgeFG, edgeBF],
              { materialIndex: 3 }
            )
          );
        }
        
        // Front face
        if (d === 0) {
          mesh.addFace(
            new Face(
              [a, b, f, e],
              [edgeAB, edgeBF, edgeEF, edgeAE],
              { materialIndex: 4 }
            )
          );
        }
        
        // Back face
        if (d === divisions - 1) {
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
  }
  
  return mesh;
} 