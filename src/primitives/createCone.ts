import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for creating a cone
 */
export interface CreateConeOptions {
  /** Radius of the base */
  radius?: number;
  /** Height of the cone */
  height?: number;
  /** Number of radial segments (around the circumference) */
  radialSegments?: number;
  /** Number of height segments */
  heightSegments?: number;
  /** Whether the cone is open-ended (no base) */
  openEnded?: boolean;
  /** Starting angle in radians */
  thetaStart?: number;
  /** Ending angle in radians */
  thetaLength?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a cone as an EditableMesh
 * @param options Options for creating the cone
 * @returns A new EditableMesh instance representing a cone
 */
export function createCone(options: CreateConeOptions = {}): EditableMesh {
  const radius = options.radius ?? 1;
  const height = options.height ?? 2;
  const radialSegments = Math.max(3, Math.floor(options.radialSegments ?? 8));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const openEnded = options.openEnded ?? false;
  const thetaStart = options.thetaStart ?? 0;
  const thetaLength = options.thetaLength ?? Math.PI * 2;
  const name = options.name ?? 'Cone';
  
  const mesh = new EditableMesh({ name });
  
  // Calculate half height for positioning
  const halfHeight = height / 2;
  
  // Create vertices for the cone
  const vertices: number[][] = [];
  
  // Create vertices for each height segment
  for (let h = 0; h <= heightSegments; h++) {
    const y = (h / heightSegments - 0.5) * height;
    const currentRadius = radius * (1 - h / heightSegments); // Radius decreases towards the top
    const row: number[] = [];
    
    // Create vertices around the circumference
    for (let r = 0; r <= radialSegments; r++) {
      const theta = thetaStart + (r / radialSegments) * thetaLength;
      const x = Math.cos(theta) * currentRadius;
      const z = Math.sin(theta) * currentRadius;
      
      const vertex = new Vertex(x, y, z);
      
      // Generate UVs
      const u = r / radialSegments;
      const v = h / heightSegments;
      vertex.uv = { u, v };
      
      const vertexIndex = mesh.addVertex(vertex);
      row.push(vertexIndex);
    }
    
    vertices.push(row);
  }
  
  // Create edges and faces for the side walls
  for (let h = 0; h < heightSegments; h++) {
    for (let r = 0; r < radialSegments; r++) {
      const a = vertices[h][r];
      const b = vertices[h][r + 1];
      const c = vertices[h + 1][r + 1];
      const d = vertices[h + 1][r];
      
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
  
  // Create base if not open-ended
  if (!openEnded) {
    // Base cap
    if (thetaLength === Math.PI * 2) {
      // Full circle - create a single face
      const baseVertices: number[] = [];
      const baseEdges: number[] = [];
      
      for (let r = 0; r < radialSegments; r++) {
        baseVertices.push(vertices[0][r]);
        if (r > 0) {
          const edge = mesh.addEdge(new Edge(vertices[0][r - 1], vertices[0][r]));
          baseEdges.push(edge);
        }
      }
      
      // Close the circle
      const edge = mesh.addEdge(new Edge(vertices[0][radialSegments - 1], vertices[0][0]));
      baseEdges.push(edge);
      
      mesh.addFace(
        new Face(
          baseVertices,
          baseEdges,
          { materialIndex: 1 } // Base material
        )
      );
    } else {
      // Partial circle - create individual triangles
      // Create center vertex for the base
      const baseCenterVertex = new Vertex(0, -halfHeight, 0);
      baseCenterVertex.uv = { u: 0.5, v: 0.5 };
      const baseCenterIndex = mesh.addVertex(baseCenterVertex);
      
      for (let r = 0; r < radialSegments; r++) {
        const v1 = vertices[0][r];
        const v2 = vertices[0][r + 1];
        
        const edge1 = mesh.addEdge(new Edge(baseCenterIndex, v1));
        const edge2 = mesh.addEdge(new Edge(v1, v2));
        const edge3 = mesh.addEdge(new Edge(v2, baseCenterIndex));
        
        mesh.addFace(
          new Face(
            [baseCenterIndex, v1, v2],
            [edge1, edge2, edge3],
            { materialIndex: 1 }
          )
        );
      }
    }
  }
  
  return mesh;
} 