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
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create edges and faces
  for (let d = 0; d < divisions; d++) {
    for (let h = 0; h < divisions; h++) {
      for (let w = 0; w < divisions; w++) {
        const v_d_h_w = vertices[d][h][w];
        const v_d_h_w1 = vertices[d][h][w + 1];
        const v_d_h1_w1 = vertices[d][h + 1][w + 1];
        const v_d_h1_w = vertices[d][h + 1][w];
        const v_d1_h_w = vertices[d + 1][h][w];
        const v_d1_h_w1 = vertices[d + 1][h][w + 1];
        const v_d1_h1_w1 = vertices[d + 1][h + 1][w + 1];
        const v_d1_h1_w = vertices[d + 1][h + 1][w];

        // Top face
        mesh.addFace(new Face([v_d1_h_w, v_d1_h_w1, v_d1_h1_w1, v_d1_h1_w], [addEdge(v_d1_h_w, v_d1_h_w1), addEdge(v_d1_h_w1, v_d1_h1_w1), addEdge(v_d1_h1_w1, v_d1_h1_w), addEdge(v_d1_h1_w, v_d1_h_w)], { materialIndex: 0 }));
        // Bottom face
        mesh.addFace(new Face([v_d_h_w, v_d_h1_w, v_d_h1_w1, v_d_h_w1], [addEdge(v_d_h_w, v_d_h1_w), addEdge(v_d_h1_w, v_d_h1_w1), addEdge(v_d_h1_w1, v_d_h_w1), addEdge(v_d_h_w1, v_d_h_w)], { materialIndex: 1 }));

        // Left side
        if (w === 0) {
            mesh.addFace(new Face([v_d_h_w, v_d_h_w, v_d1_h_w, v_d1_h1_w, v_d_h1_w], [addEdge(v_d_h_w, v_d1_h_w), addEdge(v_d1_h_w, v_d1_h1_w), addEdge(v_d1_h1_w, v_d_h1_w), addEdge(v_d_h1_w, v_d_h_w)], { materialIndex: 2 }));
        }
        // Right side
        if (w === divisions - 1) {
            mesh.addFace(new Face([v_d_h_w1, v_d_h1_w1, v_d1_h1_w1, v_d1_h_w1], [addEdge(v_d_h_w1, v_d_h1_w1), addEdge(v_d_h1_w1, v_d1_h1_w1), addEdge(v_d1_h1_w1, v_d1_h_w1), addEdge(v_d1_h_w1, v_d_h_w1)], { materialIndex: 3 }));
        }
        // Front face
        if (h === 0) {
            mesh.addFace(new Face([v_d_h_w, v_d_h_w1, v_d1_h_w1, v_d1_h_w], [addEdge(v_d_h_w, v_d_h_w1), addEdge(v_d_h_w1, v_d1_h_w1), addEdge(v_d1_h_w1, v_d1_h_w), addEdge(v_d1_h_w, v_d_h_w)], { materialIndex: 4 }));
        }
        // Back face
        if (h === divisions - 1) {
            mesh.addFace(new Face([v_d_h1_w, v_d1_h1_w, v_d1_h1_w1, v_d_h1_w1], [addEdge(v_d_h1_w, v_d1_h1_w), addEdge(v_d1_h1_w, v_d1_h1_w1), addEdge(v_d1_h1_w1, v_d_h1_w1), addEdge(v_d_h1_w1, v_d_h1_w)], { materialIndex: 5 }));
        }
      }
    }
  }
  
  return mesh;
} 