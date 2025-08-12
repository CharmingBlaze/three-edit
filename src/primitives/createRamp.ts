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
  const vertices: number[][][] = [];
  
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
        
        const newVertex = new Vertex(x, y, z, {
          uv: { u: w / widthSegments, v: l / lengthSegments }
        });
        const vertexIndex = mesh.addVertex(newVertex);
        lengthRow.push(vertexIndex);
      }
      
      heightPlane.push(lengthRow);
    }
    
    vertices.push(heightPlane);
  }
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create edges and faces for the ramp
  for (let h = 0; h < heightSegments; h++) {
    for (let l = 0; l < lengthSegments; l++) {
      for (let w = 0; w < widthSegments; w++) {
        const v_a = vertices[h][l][w];
        const v_b = vertices[h][l][w + 1];
        const v_c = vertices[h][l + 1][w + 1];
        const v_d = vertices[h][l + 1][w];
        const v_e = vertices[h + 1][l][w];
        const v_f = vertices[h + 1][l][w + 1];
        const v_g = vertices[h + 1][l + 1][w + 1];
        const v_h = vertices[h + 1][l + 1][w];

        // Create faces (material indices: 0=top, 1=bottom, 2=left, 3=right, 4=front, 5=back)
        // Top face (ramp surface)
        const top_edge1 = addEdge(v_e, v_f);
        const top_edge2 = addEdge(v_f, v_g);
        const top_edge3 = addEdge(v_g, v_h);
        const top_edge4 = addEdge(v_h, v_e);
        mesh.addFace(new Face([v_e, v_f, v_g, v_h], [top_edge1, top_edge2, top_edge3, top_edge4], { materialIndex: 0 }));

        // Bottom face
        const bot_edge1 = addEdge(v_a, v_b);
        const bot_edge2 = addEdge(v_b, v_c);
        const bot_edge3 = addEdge(v_c, v_d);
        const bot_edge4 = addEdge(v_d, v_a);
        mesh.addFace(new Face([v_d, v_c, v_b, v_a], [bot_edge4, bot_edge3, bot_edge2, bot_edge1], { materialIndex: 1 }));

        // Left side
        if (w === 0) {
          const edge1 = addEdge(v_a, v_d);
          const edge2 = addEdge(v_d, v_h);
          const edge3 = addEdge(v_h, v_e);
          const edge4 = addEdge(v_e, v_a);
          mesh.addFace(new Face([v_a, v_d, v_h, v_e], [edge1, edge2, edge3, edge4], { materialIndex: 2 }));
        }

        // Right side
        if (w === widthSegments - 1) {
          const edge1 = addEdge(v_b, v_f);
          const edge2 = addEdge(v_f, v_g);
          const edge3 = addEdge(v_g, v_c);
          const edge4 = addEdge(v_c, v_b);
          mesh.addFace(new Face([v_b, v_f, v_g, v_c], [edge1, edge2, edge3, edge4], { materialIndex: 3 }));
        }

        // Front face (low end)
        if (l === 0) {
          const edge1 = addEdge(v_a, v_b);
          const edge2 = addEdge(v_b, v_f);
          const edge3 = addEdge(v_f, v_e);
          const edge4 = addEdge(v_e, v_a);
          mesh.addFace(new Face([v_a, v_b, v_f, v_e], [edge1, edge2, edge3, edge4], { materialIndex: 4 }));
        }

        // Back face (high end)
        if (l === lengthSegments - 1) {
          const edge1 = addEdge(v_d, v_c);
          const edge2 = addEdge(v_c, v_g);
          const edge3 = addEdge(v_g, v_h);
          const edge4 = addEdge(v_h, v_d);
          mesh.addFace(new Face([v_d, v_c, v_g, v_h], [edge1, edge2, edge3, edge4], { materialIndex: 5 }));
        }
      }
    }
  }
  
  return mesh;
}