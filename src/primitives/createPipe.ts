import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

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
      
      // Outer vertices
      const outerX = Math.cos(theta) * outerRadius;
      const outerZ = Math.sin(theta) * outerRadius;
      const outerVertex = new Vertex(outerX, y, outerZ);
      outerVertex.uv = { u: r / radialSegments, v: h / heightSegments };
      const outerVertexIndex = mesh.addVertex(outerVertex);
      outerRow.push(outerVertexIndex);
      
      // Inner vertices
      const innerX = Math.cos(theta) * innerRadius;
      const innerZ = Math.sin(theta) * innerRadius;
      const innerVertex = new Vertex(innerX, y, innerZ);
      innerVertex.uv = { u: r / radialSegments, v: h / heightSegments };
      const innerVertexIndex = mesh.addVertex(innerVertex);
      innerRow.push(innerVertexIndex);
    }
    
    outerVertices.push(outerRow);
    innerVertices.push(innerRow);
  }
  
  // Create edges and faces for the outer wall
  for (let h = 0; h < heightSegments; h++) {
    for (let r = 0; r < radialSegments; r++) {
      const a = outerVertices[h][r];
      const b = outerVertices[h][r + 1];
      const c = outerVertices[h + 1][r + 1];
      const d = outerVertices[h + 1][r];
      
      // Create edges
      const edgeAB = mesh.addEdge(new Edge(a, b));
      const edgeBC = mesh.addEdge(new Edge(b, c));
      const edgeCD = mesh.addEdge(new Edge(c, d));
      const edgeDA = mesh.addEdge(new Edge(d, a));
      
      // Create face (material index 0 for outer wall)
      mesh.addFace(
        new Face(
          [a, b, c, d],
          [edgeAB, edgeBC, edgeCD, edgeDA],
          { materialIndex: 0 }
        )
      );
    }
  }
  
  // Create edges and faces for the inner wall
  for (let h = 0; h < heightSegments; h++) {
    for (let r = 0; r < radialSegments; r++) {
      const a = innerVertices[h][r];
      const b = innerVertices[h][r + 1];
      const c = innerVertices[h + 1][r + 1];
      const d = innerVertices[h + 1][r];
      
      // Create edges
      const edgeAB = mesh.addEdge(new Edge(a, b));
      const edgeBC = mesh.addEdge(new Edge(b, c));
      const edgeCD = mesh.addEdge(new Edge(c, d));
      const edgeDA = mesh.addEdge(new Edge(d, a));
      
      // Create face (material index 1 for inner wall)
      mesh.addFace(
        new Face(
          [a, b, c, d],
          [edgeAB, edgeBC, edgeCD, edgeDA],
          { materialIndex: 1 }
        )
      );
    }
  }
  
  // Create edges and faces for the end caps (connecting outer to inner)
  if (!openEnded) {
    // Bottom cap
    for (let r = 0; r < radialSegments; r++) {
      const outerA = outerVertices[0][r];
      const outerB = outerVertices[0][r + 1];
      const innerA = innerVertices[0][r];
      const innerB = innerVertices[0][r + 1];
      
      // Create edges
      const edgeOuterAB = mesh.addEdge(new Edge(outerA, outerB));
      const edgeOuterBInnerB = mesh.addEdge(new Edge(outerB, innerB));
      const edgeInnerBInnerA = mesh.addEdge(new Edge(innerB, innerA));
      const edgeInnerAOuterA = mesh.addEdge(new Edge(innerA, outerA));
      
      // Create face (material index 2 for bottom cap)
      mesh.addFace(
        new Face(
          [outerA, outerB, innerB, innerA],
          [edgeOuterAB, edgeOuterBInnerB, edgeInnerBInnerA, edgeInnerAOuterA],
          { materialIndex: 2 }
        )
      );
    }
    
    // Top cap
    for (let r = 0; r < radialSegments; r++) {
      const outerA = outerVertices[heightSegments][r];
      const outerB = outerVertices[heightSegments][r + 1];
      const innerA = innerVertices[heightSegments][r];
      const innerB = innerVertices[heightSegments][r + 1];
      
      // Create edges
      const edgeOuterAB = mesh.addEdge(new Edge(outerA, outerB));
      const edgeOuterBInnerB = mesh.addEdge(new Edge(outerB, innerB));
      const edgeInnerBInnerA = mesh.addEdge(new Edge(innerB, innerA));
      const edgeInnerAOuterA = mesh.addEdge(new Edge(innerA, outerA));
      
      // Create face (material index 3 for top cap)
      mesh.addFace(
        new Face(
          [outerA, outerB, innerB, innerA],
          [edgeOuterAB, edgeOuterBInnerB, edgeInnerBInnerA, edgeInnerAOuterA],
          { materialIndex: 3 }
        )
      );
    }
  }
  
  return mesh;
} 