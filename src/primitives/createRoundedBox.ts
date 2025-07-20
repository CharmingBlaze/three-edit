import { EditableMesh } from '../core/index.ts';
import { Vertex } from '../core/index.ts';
import { Edge } from '../core/index.ts';
import { Face } from '../core/index.ts';

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
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create edges and faces
  for (let d = 0; d < depthSegments; d++) {
    for (let h = 0; h < heightSegments; h++) {
      for (let w = 0; w < widthSegments; w++) {
        const v_a = vertices[d][h][w];
        const v_b = vertices[d][h][w + 1];
        const v_c = vertices[d][h + 1][w + 1];
        const v_d = vertices[d][h + 1][w];
        const v_e = vertices[d + 1][h][w];
        const v_f = vertices[d + 1][h][w + 1];
        const v_g = vertices[d + 1][h + 1][w + 1];
        const v_h = vertices[d + 1][h + 1][w];

        // Bottom face
        const bot_edge1 = addEdge(v_a, v_b);
        const bot_edge2 = addEdge(v_b, v_c);
        const bot_edge3 = addEdge(v_c, v_d);
        const bot_edge4 = addEdge(v_d, v_a);
        mesh.addFace(new Face([v_d, v_c, v_b, v_a], [bot_edge4, bot_edge3, bot_edge2, bot_edge1], { materialIndex: 0 }));

        // Top face
        const top_edge1 = addEdge(v_e, v_f);
        const top_edge2 = addEdge(v_f, v_g);
        const top_edge3 = addEdge(v_g, v_h);
        const top_edge4 = addEdge(v_h, v_e);
        mesh.addFace(new Face([v_e, v_f, v_g, v_h], [top_edge1, top_edge2, top_edge3, top_edge4], { materialIndex: 1 }));

        // Left face
        const left_edge1 = addEdge(v_a, v_d);
        const left_edge2 = addEdge(v_d, v_h);
        const left_edge3 = addEdge(v_h, v_e);
        const left_edge4 = addEdge(v_e, v_a);
        mesh.addFace(new Face([v_a, v_d, v_h, v_e], [left_edge1, left_edge2, left_edge3, left_edge4], { materialIndex: 2 }));

        // Right face
        const right_edge1 = addEdge(v_b, v_c);
        const right_edge2 = addEdge(v_c, v_g);
        const right_edge3 = addEdge(v_g, v_f);
        const right_edge4 = addEdge(v_f, v_b);
        mesh.addFace(new Face([v_b, v_c, v_g, v_f], [right_edge1, right_edge2, right_edge3, right_edge4], { materialIndex: 3 }));

        // Front face
        const front_edge1 = addEdge(v_a, v_b);
        const front_edge2 = addEdge(v_b, v_f);
        const front_edge3 = addEdge(v_f, v_e);
        const front_edge4 = addEdge(v_e, v_a);
        mesh.addFace(new Face([v_a, v_b, v_f, v_e], [front_edge1, front_edge2, front_edge3, front_edge4], { materialIndex: 4 }));

        // Back face
        const back_edge1 = addEdge(v_d, v_c);
        const back_edge2 = addEdge(v_c, v_g);
        const back_edge3 = addEdge(v_g, v_h);
        const back_edge4 = addEdge(v_h, v_d);
        mesh.addFace(new Face([v_d, v_c, v_g, v_h], [back_edge1, back_edge2, back_edge3, back_edge4], { materialIndex: 5 }));
      }
    }
  }
  
  return mesh;
}