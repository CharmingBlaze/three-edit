import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for creating a rounded box
 */
export interface CreateRoundedBoxOptions {
  /** Width of the box */
  width?: number;
  /** Height of the box */
  height?: number;
  /** Depth of the box */
  depth?: number;
  /** Radius of the corner fillets */
  cornerRadius?: number;
  /** Number of segments for the corner fillets */
  cornerSegments?: number;
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
 * Creates a rounded box as an EditableMesh
 * @param options Options for creating the rounded box
 * @returns A new EditableMesh instance representing a rounded box
 */
export function createRoundedBox(options: CreateRoundedBoxOptions = {}): EditableMesh {
  const width = options.width ?? 1;
  const height = options.height ?? 1;
  const depth = options.depth ?? 1;
  const cornerRadius = Math.min(
    options.cornerRadius ?? 0.1,
    Math.min(width, height, depth) / 2
  );
  const cornerSegments = Math.max(2, Math.floor(options.cornerSegments ?? 4));
  const widthSegments = Math.max(1, Math.floor(options.widthSegments ?? 1));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const depthSegments = Math.max(1, Math.floor(options.depthSegments ?? 1));
  const name = options.name ?? 'RoundedBox';
  
  const mesh = new EditableMesh({ name });
  
  // Calculate half dimensions for positioning
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;
  
  // Helper function to create corner vertices
  const createCornerVertices = (
    centerX: number,
    centerY: number,
    centerZ: number,
    startAngle: number,
    endAngle: number,
    segments: number
  ): number[] => {
    const vertices: number[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (i / segments) * (endAngle - startAngle);
      const x = centerX + Math.cos(angle) * cornerRadius;
      const y = centerY + Math.sin(angle) * cornerRadius;
      const z = centerZ;
      
      const vertex = new Vertex(x, y, z);
      vertex.uv = { u: i / segments, v: 0 };
      
      const vertexIndex = mesh.addVertex(vertex);
      vertices.push(vertexIndex);
    }
    
    return vertices;
  };
  
  // Create vertices for the rounded box
  const vertices: number[][][] = [];
  
  // Create vertices for each depth segment
  for (let d = 0; d <= depthSegments; d++) {
    const z = (d / depthSegments - 0.5) * depth;
    const depthPlane: number[][] = [];
    
    // Create vertices for each height segment
    for (let h = 0; h <= heightSegments; h++) {
      const y = (h / heightSegments - 0.5) * height;
      const heightRow: number[] = [];
      
      // Create vertices for each width segment
      for (let w = 0; w <= widthSegments; w++) {
        const x = (w / widthSegments - 0.5) * width;
        
        // Check if this vertex is in a corner region
        const isCorner = (
          (w === 0 || w === widthSegments) &&
          (h === 0 || h === heightSegments)
        );
        
        if (isCorner) {
          // Create corner vertices
          let startAngle = 0;
          let endAngle = Math.PI / 2;
          
          if (w === 0 && h === 0) {
            // Bottom-left corner
            startAngle = Math.PI;
            endAngle = Math.PI * 1.5;
          } else if (w === widthSegments && h === 0) {
            // Bottom-right corner
            startAngle = Math.PI * 1.5;
            endAngle = 0;
          } else if (w === 0 && h === heightSegments) {
            // Top-left corner
            startAngle = Math.PI / 2;
            endAngle = Math.PI;
          } else if (w === widthSegments && h === heightSegments) {
            // Top-right corner
            startAngle = 0;
            endAngle = Math.PI / 2;
          }
          
          const cornerVertices = createCornerVertices(
            x, y, z, startAngle, endAngle, cornerSegments
          );
          heightRow.push(...cornerVertices);
        } else {
          // Regular vertex
          const vertex = new Vertex(x, y, z);
          vertex.uv = { u: w / widthSegments, v: h / heightSegments };
          
          const vertexIndex = mesh.addVertex(vertex);
          heightRow.push(vertexIndex);
        }
      }
      
      depthPlane.push(heightRow);
    }
    
    vertices.push(depthPlane);
  }
  
  // Create edges and faces
  for (let d = 0; d < depthSegments; d++) {
    for (let h = 0; h < heightSegments; h++) {
      for (let w = 0; w < widthSegments; w++) {
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