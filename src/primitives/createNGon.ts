import { EditableMesh } from '../core/index';
import { Vertex } from '../core/index';
import { Edge } from '../core/index';
import { Face } from '../core/index';

/**
 * Options for creating an NGon
 */
export interface CreateNGonOptions {
  /** Radius of the NGon */
  radius?: number;
  /** Number of sides */
  sides?: number;
  /** Height of the NGon */
  height?: number;
  /** Number of height segments */
  heightSegments?: number;
  /** Whether the NGon is open-ended (no caps) */
  openEnded?: boolean;
  /** Starting angle in radians */
  thetaStart?: number;
  /** Ending angle in radians */
  thetaLength?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates an NGon as an EditableMesh
 * @param options Options for creating the NGon
 * @returns A new EditableMesh instance representing an NGon
 */
export function createNGon(options: CreateNGonOptions = {}): EditableMesh {
  const radius = options.radius ?? 1;
  const sides = Math.max(3, Math.floor(options.sides ?? 6));
  const height = options.height ?? 1;
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const openEnded = options.openEnded ?? false;
  const thetaStart = options.thetaStart ?? 0;
  const thetaLength = options.thetaLength ?? Math.PI * 2;
  const name = options.name ?? 'NGon';
  
  const mesh = new EditableMesh({ name });
  
  // Calculate half height for positioning
  const halfHeight = height / 2;
  
  // Create vertices for the NGon
  const vertices: number[][] = [];
  
  // Create vertices for each height segment
  for (let h = 0; h <= heightSegments; h++) {
    const y = (h / heightSegments - 0.5) * height;
    const row: number[] = [];
    
    // Create vertices around the perimeter with UVs
    for (let s = 0; s <= sides; s++) {
      const theta = thetaStart + (s / sides) * thetaLength;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      
      const u = s / sides;
      const v = h / heightSegments;
      
      const vertex = new Vertex(x, y, z, { uv: { u, v } });
      const vertexIndex = mesh.addVertex(vertex);
      row.push(vertexIndex);
    }
    
    vertices.push(row);
  }
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create edges and faces for the side walls (quads)
  for (let h = 0; h < heightSegments; h++) {
    for (let s = 0; s < sides; s++) {
      const v1 = vertices[h][s];
      const v2 = vertices[h][s + 1];
      const v3 = vertices[h + 1][s + 1];
      const v4 = vertices[h + 1][s];

      const edge1 = addEdge(v1, v2);
      const edge2 = addEdge(v2, v3);
      const edge3 = addEdge(v3, v4);
      const edge4 = addEdge(v4, v1);

      mesh.addFace(new Face([v1, v2, v3, v4], [edge1, edge2, edge3, edge4], { materialIndex: 0 }));
    }
  }

  // Create caps if not open-ended
  if (!openEnded) {
    // Bottom cap
    if (thetaLength === Math.PI * 2) {
      // Full circle - create a single n-gon face
      const bottomVertices = vertices[0].slice(0, sides).reverse();
      const bottomEdges: number[] = [];
      for (let s = 0; s < sides; s++) {
        bottomEdges.push(addEdge(bottomVertices[s], bottomVertices[(s + 1) % sides]));
      }
      mesh.addFace(new Face(bottomVertices, bottomEdges, { materialIndex: 1 }));
    } else {
      // Partial circle - create triangular faces from center
      const bottomCenterVertex = new Vertex(0, -halfHeight, 0, { uv: { u: 0.5, v: 0.5 } });
      const bottomCenterIndex = mesh.addVertex(bottomCenterVertex);
      for (let s = 0; s < sides; s++) {
        const v1 = vertices[0][s];
        const v2 = vertices[0][s + 1];
        const edge1 = addEdge(bottomCenterIndex, v1);
        const edge2 = addEdge(v1, v2);
        const edge3 = addEdge(v2, bottomCenterIndex);
        mesh.addFace(new Face([bottomCenterIndex, v1, v2], [edge1, edge2, edge3], { materialIndex: 1 }));
      }
    }

    // Top cap
    if (thetaLength === Math.PI * 2) {
      // Full circle - create a single n-gon face
      const topVertices = vertices[heightSegments].slice(0, sides);
      const topEdges: number[] = [];
      for (let s = 0; s < sides; s++) {
        topEdges.push(addEdge(topVertices[s], topVertices[(s + 1) % sides]));
      }
      mesh.addFace(new Face(topVertices, topEdges, { materialIndex: 2 }));
    } else {
      // Partial circle - create triangular faces from center
      const topCenterVertex = new Vertex(0, halfHeight, 0, { uv: { u: 0.5, v: 0.5 } });
      const topCenterIndex = mesh.addVertex(topCenterVertex);
      for (let s = 0; s < sides; s++) {
        const v1 = vertices[heightSegments][s];
        const v2 = vertices[heightSegments][s + 1];
        const edge1 = addEdge(topCenterIndex, v1);
        const edge2 = addEdge(v1, v2);
        const edge3 = addEdge(v2, topCenterIndex);
        mesh.addFace(new Face([topCenterIndex, v1, v2], [edge1, edge2, edge3], { materialIndex: 2 }));
      }
    }
  }
  
  return mesh;
} 