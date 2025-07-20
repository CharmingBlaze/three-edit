import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

/**
 * Options for creating an arrow
 */
export interface CreateArrowOptions {
  /** Length of the arrow shaft */
  shaftLength?: number;
  /** Width of the arrow shaft */
  shaftWidth?: number;
  /** Height of the arrow shaft */
  shaftHeight?: number;
  /** Length of the arrow head */
  headLength?: number;
  /** Width of the arrow head */
  headWidth?: number;
  /** Height of the arrow head */
  headHeight?: number;
  /** Number of segments for the shaft */
  shaftSegments?: number;
  /** Number of segments for the head */
  headSegments?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates an arrow as an EditableMesh
 * @param options Options for creating the arrow
 * @returns A new EditableMesh instance representing an arrow
 */
export function createArrow(options: CreateArrowOptions = {}): EditableMesh {
  const shaftLength = options.shaftLength ?? 2;
  const shaftWidth = options.shaftWidth ?? 0.1;
  const shaftHeight = options.shaftHeight ?? 0.1;
  const headLength = options.headLength ?? 0.5;
  const headWidth = options.headWidth ?? 0.3;
  const headHeight = options.headHeight ?? 0.3;
  const shaftSegments = Math.max(1, Math.floor(options.shaftSegments ?? 1));
  const headSegments = Math.max(1, Math.floor(options.headSegments ?? 1));
  const name = options.name ?? 'Arrow';
  
  const mesh = new EditableMesh({ name });
  
  // Calculate dimensions
  // Calculate dimensions for arrow creation
  
  // Create vertices for the arrow
  const vertices: number[][][] = [];
  
  // Create vertices for the shaft
  for (let s = 0; s <= shaftSegments; s++) {
    const z = (s / shaftSegments) * shaftLength;
    const shaftPlane: number[][] = [];
    
    // Create vertices for each height segment
    for (let h = 0; h <= 1; h++) {
      const y = (h - 0.5) * shaftHeight;
      const heightRow: number[] = [];
      
      // Create vertices for each width segment
      for (let w = 0; w <= 1; w++) {
        const x = (w - 0.5) * shaftWidth;
        
        const vertex = new Vertex(x, y, z);
        vertex.uv = { u: w, v: s / shaftSegments };
        
        const vertexIndex = mesh.addVertex(vertex);
        heightRow.push(vertexIndex);
      }
      
      shaftPlane.push(heightRow);
    }
    
    vertices.push(shaftPlane);
  }
  
  // Create vertices for the head
  for (let h = 0; h <= headSegments; h++) {
    const z = shaftLength + (h / headSegments) * headLength;
    const headPlane: number[][] = [];
    
    // Create vertices for each height segment
    for (let hy = 0; hy <= 1; hy++) {
      const y = (hy - 0.5) * headHeight;
      const heightRow: number[] = [];
      
      // Create vertices for each width segment
      for (let w = 0; w <= 1; w++) {
        const x = (w - 0.5) * headWidth;
        
        const vertex = new Vertex(x, y, z);
        vertex.uv = { u: w, v: (shaftSegments + h) / (shaftSegments + headSegments) };
        
        const vertexIndex = mesh.addVertex(vertex);
        heightRow.push(vertexIndex);
      }
      
      headPlane.push(heightRow);
    }
    
    vertices.push(headPlane);
  }
  
  // Create edges and faces for the shaft
  for (let s = 0; s < shaftSegments; s++) {
    for (let h = 0; h < 1; h++) {
      for (let w = 0; w < 1; w++) {
        const a = vertices[s][h][w];
        const b = vertices[s][h][w + 1];
        const c = vertices[s][h + 1][w + 1];
        const d = vertices[s][h + 1][w];
        const e = vertices[s + 1][h][w];
        const f = vertices[s + 1][h][w + 1];
        const g = vertices[s + 1][h + 1][w + 1];
        const h_vertex = vertices[s + 1][h + 1][w];
        
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
        
        // Create faces (material indices: 0=shaft, 1=head)
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
            [a, b, c, d],
            [edgeAB, edgeBC, edgeCD, edgeDA],
            { materialIndex: 0 }
          )
        );
        
        // Left side
        if (w === 0) {
          mesh.addFace(
            new Face(
              [a, d, h_vertex, e],
              [edgeDA, edgeDH, edgeHE, edgeAE],
              { materialIndex: 0 }
            )
          );
        }
        
        // Right side
        if (w === 0) {
          mesh.addFace(
            new Face(
              [b, c, g, f],
              [edgeBC, edgeCG, edgeFG, edgeBF],
              { materialIndex: 0 }
            )
          );
        }
        
        // Front face
        if (s === 0) {
          mesh.addFace(
            new Face(
              [a, b, f, e],
              [edgeAB, edgeBF, edgeEF, edgeAE],
              { materialIndex: 0 }
            )
          );
        }
        
        // Back face
        if (s === shaftSegments - 1) {
          mesh.addFace(
            new Face(
              [d, c, g, h_vertex],
              [edgeCD, edgeCG, edgeGH, edgeDH],
              { materialIndex: 0 }
            )
          );
        }
      }
    }
  }
  
  // Create edges and faces for the head
  for (let h = 0; h < headSegments; h++) {
    for (let hy = 0; hy < 1; hy++) {
      for (let w = 0; w < 1; w++) {
        const a = vertices[shaftSegments + h][hy][w];
        const b = vertices[shaftSegments + h][hy][w + 1];
        const c = vertices[shaftSegments + h][hy + 1][w + 1];
        const d = vertices[shaftSegments + h][hy + 1][w];
        const e = vertices[shaftSegments + h + 1][hy][w];
        const f = vertices[shaftSegments + h + 1][hy][w + 1];
        const g = vertices[shaftSegments + h + 1][hy + 1][w + 1];
        const h_vertex = vertices[shaftSegments + h + 1][hy + 1][w];
        
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
        
        // Create faces (material index 1 for head)
        // Top face
        mesh.addFace(
          new Face(
            [e, f, g, h_vertex],
            [edgeEF, edgeFG, edgeGH, edgeHE],
            { materialIndex: 1 }
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
              { materialIndex: 1 }
            )
          );
        }
        
        // Right side
        if (w === 0) {
          mesh.addFace(
            new Face(
              [b, c, g, f],
              [edgeBC, edgeCG, edgeFG, edgeBF],
              { materialIndex: 1 }
            )
          );
        }
        
        // Front face
        if (h === 0) {
          mesh.addFace(
            new Face(
              [a, b, f, e],
              [edgeAB, edgeBF, edgeEF, edgeAE],
              { materialIndex: 1 }
            )
          );
        }
        
        // Back face
        if (h === headSegments - 1) {
          mesh.addFace(
            new Face(
              [d, c, g, h_vertex],
              [edgeCD, edgeCG, edgeGH, edgeDH],
              { materialIndex: 1 }
            )
          );
        }
      }
    }
  }
  
  return mesh;
} 