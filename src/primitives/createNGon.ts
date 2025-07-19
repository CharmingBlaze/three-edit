import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

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
    
    // Create vertices around the perimeter
    for (let s = 0; s <= sides; s++) {
      const theta = thetaStart + (s / sides) * thetaLength;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      
      const vertex = new Vertex(x, y, z);
      
      // Generate UVs
      const u = s / sides;
      const v = h / heightSegments;
      vertex.uv = { u, v };
      
      const vertexIndex = mesh.addVertex(vertex);
      row.push(vertexIndex);
    }
    
    vertices.push(row);
  }
  
  // Create edges and faces for the side walls
  for (let h = 0; h < heightSegments; h++) {
    for (let s = 0; s < sides; s++) {
      const a = vertices[h][s];
      const b = vertices[h][s + 1];
      const c = vertices[h + 1][s + 1];
      const d = vertices[h + 1][s];
      
      // Create edges
      const edgeAB = mesh.addEdge(new Edge(a, b));
      const edgeBC = mesh.addEdge(new Edge(b, c));
      const edgeCD = mesh.addEdge(new Edge(c, d));
      const edgeDA = mesh.addEdge(new Edge(d, a));
      
      // Create face (material index 0 for sides)
      mesh.addFace(
        new Face(
          [a, b, c, d],
          [edgeAB, edgeBC, edgeCD, edgeDA],
          { materialIndex: 0 }
        )
      );
    }
  }
  
  // Create caps if not open-ended
  if (!openEnded) {
    // Bottom cap
    if (thetaLength === Math.PI * 2) {
      // Full NGon - create a single face
      const bottomVertices: number[] = [];
      const bottomEdges: number[] = [];
      
      for (let s = 0; s < sides; s++) {
        bottomVertices.push(vertices[0][s]);
        if (s > 0) {
          const edge = mesh.addEdge(new Edge(vertices[0][s - 1], vertices[0][s]));
          bottomEdges.push(edge);
        }
      }
      
      // Close the NGon
      const edge = mesh.addEdge(new Edge(vertices[0][sides - 1], vertices[0][0]));
      bottomEdges.push(edge);
      
      mesh.addFace(
        new Face(
          bottomVertices,
          bottomEdges,
          { materialIndex: 1 } // Bottom cap material
        )
      );
    } else {
      // Partial NGon - create individual triangles
      // Create center vertex for the bottom cap
      const bottomCenterVertex = new Vertex(0, -halfHeight, 0);
      bottomCenterVertex.uv = { u: 0.5, v: 0.5 };
      const bottomCenterIndex = mesh.addVertex(bottomCenterVertex);
      
      for (let s = 0; s < sides; s++) {
        const v1 = vertices[0][s];
        const v2 = vertices[0][s + 1];
        
        const edge1 = mesh.addEdge(new Edge(bottomCenterIndex, v1));
        const edge2 = mesh.addEdge(new Edge(v1, v2));
        const edge3 = mesh.addEdge(new Edge(v2, bottomCenterIndex));
        
        mesh.addFace(
          new Face(
            [bottomCenterIndex, v1, v2],
            [edge1, edge2, edge3],
            { materialIndex: 1 }
          )
        );
      }
    }
    
    // Top cap
    if (thetaLength === Math.PI * 2) {
      // Full NGon - create a single face
      const topVertices: number[] = [];
      const topEdges: number[] = [];
      
      for (let s = 0; s < sides; s++) {
        topVertices.push(vertices[heightSegments][s]);
        if (s > 0) {
          const edge = mesh.addEdge(new Edge(vertices[heightSegments][s - 1], vertices[heightSegments][s]));
          topEdges.push(edge);
        }
      }
      
      // Close the NGon
      const edge = mesh.addEdge(new Edge(vertices[heightSegments][sides - 1], vertices[heightSegments][0]));
      topEdges.push(edge);
      
      mesh.addFace(
        new Face(
          topVertices,
          topEdges,
          { materialIndex: 2 } // Top cap material
        )
      );
    } else {
      // Partial NGon - create individual triangles
      // Create center vertex for the top cap
      const topCenterVertex = new Vertex(0, halfHeight, 0);
      topCenterVertex.uv = { u: 0.5, v: 0.5 };
      const topCenterIndex = mesh.addVertex(topCenterVertex);
      
      for (let s = 0; s < sides; s++) {
        const v1 = vertices[heightSegments][s];
        const v2 = vertices[heightSegments][s + 1];
        
        const edge1 = mesh.addEdge(new Edge(topCenterIndex, v1));
        const edge2 = mesh.addEdge(new Edge(v1, v2));
        const edge3 = mesh.addEdge(new Edge(v2, topCenterIndex));
        
        mesh.addFace(
          new Face(
            [topCenterIndex, v1, v2],
            [edge1, edge2, edge3],
            { materialIndex: 2 }
          )
        );
      }
    }
  }
  
  return mesh;
} 