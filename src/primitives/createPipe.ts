import { EditableMesh } from '../core/index.ts';
import { Vertex } from '../core/index.ts';
import { Edge } from '../core/index.ts';
import { Face } from '../core/index.ts';

/**
 * Options for creating a pipe
 */
export interface CreatePipeOptions {
  /** Outer radius of the pipe */
  outerRadius?: number;
  /** Inner radius of the pipe */
  innerRadius?: number;
  /** Height of the pipe */
  height?: number;
  /** Number of radial segments (around the circumference) */
  radialSegments?: number;
  /** Number of height segments */
  heightSegments?: number;
  /** Whether the pipe is open-ended (no caps) */
  openEnded?: boolean;
  /** Starting angle in radians */
  thetaStart?: number;
  /** Ending angle in radians */
  thetaLength?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a pipe as an EditableMesh
 * @param options Options for creating the pipe
 * @returns A new EditableMesh instance representing a pipe
 */
export function createPipe(options: CreatePipeOptions = {}): EditableMesh {
  const outerRadius = options.outerRadius ?? 1;
  const innerRadius = options.innerRadius ?? 0.5;
  const height = options.height ?? 2;
  const radialSegments = Math.max(3, Math.floor(options.radialSegments ?? 8));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const openEnded = options.openEnded ?? false;
  const thetaStart = options.thetaStart ?? 0;
  const thetaLength = options.thetaLength ?? Math.PI * 2;
  const name = options.name ?? 'Pipe';
  
  const mesh = new EditableMesh({ name });
  

  
  // Create vertices for the pipe
  const outerVertices: number[][] = [];
  const innerVertices: number[][] = [];
  
  // Create vertices for each height segment
  for (let h = 0; h <= heightSegments; h++) {
    const y = (h / heightSegments - 0.5) * height;
    const outerRow: number[] = [];
    const innerRow: number[] = [];
    
    // Create vertices around the circumference
    for (let r = 0; r <= radialSegments; r++) {
      const theta = thetaStart + (r / radialSegments) * thetaLength;
      
      // Outer vertices with UVs
      const outerX = Math.cos(theta) * outerRadius;
      const outerZ = Math.sin(theta) * outerRadius;
      const u = r / radialSegments;
      const v = h / heightSegments;
      
      const outerVertex = new Vertex(outerX, y, outerZ, { uv: { u, v } });
      const outerVertexIndex = mesh.addVertex(outerVertex);
      outerRow.push(outerVertexIndex);
      
      // Inner vertices with UVs
      const innerX = Math.cos(theta) * innerRadius;
      const innerZ = Math.sin(theta) * innerRadius;
      
      const innerVertex = new Vertex(innerX, y, innerZ, { uv: { u, v } });
      const innerVertexIndex = mesh.addVertex(innerVertex);
      innerRow.push(innerVertexIndex);
    }
    
    outerVertices.push(outerRow);
    innerVertices.push(innerRow);
  }
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create edges and faces for the outer wall
  for (let h = 0; h < heightSegments; h++) {
    for (let r = 0; r < radialSegments; r++) {
      const v1 = outerVertices[h][r];
      const v2 = outerVertices[h][r + 1];
      const v3 = outerVertices[h + 1][r + 1];
      const v4 = outerVertices[h + 1][r];

      const edge1 = addEdge(v1, v2);
      const edge2 = addEdge(v2, v3);
      const edge3 = addEdge(v3, v4);
      const edge4 = addEdge(v4, v1);

      mesh.addFace(new Face([v1, v2, v3, v4], [edge1, edge2, edge3, edge4], { materialIndex: 0 }));
    }
  }

  // Create edges and faces for the inner wall
  for (let h = 0; h < heightSegments; h++) {
    for (let r = 0; r < radialSegments; r++) {
      const v1 = innerVertices[h][r];
      const v2 = innerVertices[h][r + 1];
      const v3 = innerVertices[h + 1][r + 1];
      const v4 = innerVertices[h + 1][r];

      const edge1 = addEdge(v1, v2);
      const edge2 = addEdge(v2, v3);
      const edge3 = addEdge(v3, v4);
      const edge4 = addEdge(v4, v1);

      // Note: Faces are wound in reverse for the inner wall to face inwards
      mesh.addFace(new Face([v4, v3, v2, v1], [edge4, edge3, edge2, edge1], { materialIndex: 1 }));
    }
  }

  // Create edges and faces for the end caps (connecting outer to inner)
  if (!openEnded) {
    // Bottom cap
    for (let r = 0; r < radialSegments; r++) {
      const v1 = outerVertices[0][r];
      const v2 = outerVertices[0][r + 1];
      const v3 = innerVertices[0][r + 1];
      const v4 = innerVertices[0][r];

      const edge1 = addEdge(v1, v2);
      const edge2 = addEdge(v2, v3);
      const edge3 = addEdge(v3, v4);
      const edge4 = addEdge(v4, v1);

      mesh.addFace(new Face([v4, v3, v2, v1], [edge4, edge3, edge2, edge1], { materialIndex: 2 }));
    }

    // Top cap
    for (let r = 0; r < radialSegments; r++) {
      const v1 = outerVertices[heightSegments][r];
      const v2 = outerVertices[heightSegments][r + 1];
      const v3 = innerVertices[heightSegments][r + 1];
      const v4 = innerVertices[heightSegments][r];

      const edge1 = addEdge(v1, v2);
      const edge2 = addEdge(v2, v3);
      const edge3 = addEdge(v3, v4);
      const edge4 = addEdge(v4, v1);

      mesh.addFace(new Face([v1, v2, v3, v4], [edge1, edge2, edge3, edge4], { materialIndex: 3 }));
    }
  }
  
  return mesh;
} 