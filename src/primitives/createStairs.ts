import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

/**
 * Options for creating stairs
 */
export interface CreateStairsOptions {
  /** Width of the stairs */
  width?: number;
  /** Height of the stairs */
  height?: number;
  /** Depth of the stairs */
  depth?: number;
  /** Number of steps */
  steps?: number;
  /** Number of width segments */
  widthSegments?: number;
  /** Number of height segments per step */
  heightSegments?: number;
  /** Number of depth segments per step */
  depthSegments?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates stairs as an EditableMesh
 * @param options Options for creating the stairs
 * @returns A new EditableMesh instance representing stairs
 */
export function createStairs(options: CreateStairsOptions = {}): EditableMesh {
  const width = options.width ?? 2;
  const height = options.height ?? 2;
  const depth = options.depth ?? 4;
  const steps = Math.max(2, Math.floor(options.steps ?? 4));
  const widthSegments = Math.max(1, Math.floor(options.widthSegments ?? 1));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  // const _depthSegments = Math.max(1, Math.floor(options.depthSegments ?? 1));
  const name = options.name ?? 'Stairs';
  
  const mesh = new EditableMesh({ name });
  
  // Calculate step dimensions
  const stepHeight = height / steps;
  const stepDepth = depth / steps;
  
  // Create vertices for the stairs
  const vertices: number[][][] = [];
  
  // Create vertices for each step
  for (let step = 0; step <= steps; step++) {
    const stepY = step * stepHeight;
    const stepZ = step * stepDepth;
    const stepPlane: number[][] = [];
    
    // Create vertices for each height segment
    for (let h = 0; h <= heightSegments; h++) {
      const y = stepY + (h / heightSegments) * stepHeight;
      const heightRow: number[] = [];
      
      // Create vertices for each width segment
      for (let w = 0; w <= widthSegments; w++) {
        const x = (w / widthSegments - 0.5) * width;
        const z = stepZ;
        
        const vertex = new Vertex(x, y, z);
        vertex.uv = { u: w / widthSegments, v: step / steps };
        
        const vertexIndex = mesh.addVertex(vertex);
        heightRow.push(vertexIndex);
      }
      
      stepPlane.push(heightRow);
    }
    
    vertices.push(stepPlane);
  }
  
  // Create edges and faces for the steps
  for (let step = 0; step < steps; step++) {
    for (let h = 0; h < heightSegments; h++) {
      for (let w = 0; w < widthSegments; w++) {
        const a = vertices[step][h][w];
        const b = vertices[step][h][w + 1];
        const c = vertices[step][h + 1][w + 1];
        const d = vertices[step][h + 1][w];
        const e = vertices[step + 1][h][w];
        const f = vertices[step + 1][h][w + 1];
        const g = vertices[step + 1][h + 1][w + 1];
        const h_vertex = vertices[step + 1][h + 1][w];
        
        // Create edges
        const edgeAB = mesh.addEdge(new Edge(a, b));
        const edgeBC = mesh.addEdge(new Edge(b, c));
        // const _edgeCD = mesh.addEdge(new Edge(c, d));
        const edgeDA = mesh.addEdge(new Edge(d, a));
        const edgeEF = mesh.addEdge(new Edge(e, f));
        const edgeFG = mesh.addEdge(new Edge(f, g));
        const edgeGH = mesh.addEdge(new Edge(g, h_vertex));
        const edgeHE = mesh.addEdge(new Edge(h_vertex, e));
        const edgeAE = mesh.addEdge(new Edge(a, e));
        const edgeBF = mesh.addEdge(new Edge(b, f));
        const edgeCG = mesh.addEdge(new Edge(c, g));
        const edgeDH = mesh.addEdge(new Edge(d, h_vertex));
        
        // Create faces (material indices: 0=steps, 1=sides, 2=risers)
        // Step face (top)
        mesh.addFace(
          new Face(
            [e, f, g, h_vertex],
            [edgeEF, edgeFG, edgeGH, edgeHE],
            { materialIndex: 0 }
          )
        );
        
        // Side faces
        if (w === 0) {
          // Left side
          mesh.addFace(
            new Face(
              [a, d, h_vertex, e],
              [edgeDA, edgeDH, edgeHE, edgeAE],
              { materialIndex: 1 }
            )
          );
        }
        
        if (w === widthSegments - 1) {
          // Right side
          mesh.addFace(
            new Face(
              [b, c, g, f],
              [edgeBC, edgeCG, edgeFG, edgeBF],
              { materialIndex: 1 }
            )
          );
        }
        
        // Riser face (front of step)
        if (h === 0) {
          mesh.addFace(
            new Face(
              [a, b, f, e],
              [edgeAB, edgeBF, edgeEF, edgeAE],
              { materialIndex: 2 }
            )
          );
        }
      }
    }
  }
  
  return mesh;
} 