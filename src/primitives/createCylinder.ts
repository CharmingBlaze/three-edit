import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for creating a cylinder
 */
export interface CreateCylinderOptions {
  /** Radius of the cylinder */
  radius?: number;
  /** Height of the cylinder */
  height?: number;
  /** Number of radial segments (around the circumference) */
  radialSegments?: number;
  /** Number of height segments */
  heightSegments?: number;
  /** Whether the cylinder is open-ended (no caps) */
  openEnded?: boolean;
  /** Starting angle in radians */
  thetaStart?: number;
  /** Ending angle in radians */
  thetaLength?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a cylinder as an EditableMesh
 * @param options Options for creating the cylinder
 * @returns A new EditableMesh instance representing a cylinder
 */
export function createCylinder(options: CreateCylinderOptions = {}): EditableMesh {
  const radius = options.radius ?? 1;
  const height = options.height ?? 2;
  const radialSegments = Math.max(3, Math.floor(options.radialSegments ?? 8));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const openEnded = options.openEnded ?? false;
  const thetaStart = options.thetaStart ?? 0;
  const thetaLength = options.thetaLength ?? Math.PI * 2;
  const name = options.name ?? 'Cylinder';
  
  const mesh = new EditableMesh({ name });
  
  // Calculate half height for positioning
  const halfHeight = height / 2;
  
  // Create vertices for the cylinder
  const vertices: number[][] = [];
  
  // Create vertices for each height segment
  for (let h = 0; h <= heightSegments; h++) {
    const y = (h / heightSegments - 0.5) * height;
    const row: number[] = [];
    
    // Create vertices around the circumference
    for (let r = 0; r <= radialSegments; r++) {
      const theta = thetaStart + (r / radialSegments) * thetaLength;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      
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
  
  // Create caps if not open-ended
  if (!openEnded) {
    // Bottom cap
    if (thetaLength === Math.PI * 2) {
      // Full circle - create a single face
      const bottomVertices: number[] = [];
      const bottomEdges: number[] = [];
      
      for (let r = 0; r < radialSegments; r++) {
        bottomVertices.push(vertices[0][r]);
        if (r > 0) {
          const edge = mesh.addEdge(new Edge(vertices[0][r - 1], vertices[0][r]));
          bottomEdges.push(edge);
        }
      }
      
      // Close the circle
      const edge = mesh.addEdge(new Edge(vertices[0][radialSegments - 1], vertices[0][0]));
      bottomEdges.push(edge);
      
      mesh.addFace(
        new Face(
          bottomVertices,
          bottomEdges,
          { materialIndex: 1 } // Bottom cap material
        )
      );
    } else {
      // Partial circle - create individual triangles
      // Create center vertex for the bottom cap
      const bottomCenterVertex = new Vertex(0, -halfHeight, 0);
      bottomCenterVertex.uv = { u: 0.5, v: 0.5 };
      const bottomCenterIndex = mesh.addVertex(bottomCenterVertex);
      
      for (let r = 0; r < radialSegments; r++) {
        const v1 = vertices[0][r];
        const v2 = vertices[0][r + 1];
        
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
      // Full circle - create a single face
      const topVertices: number[] = [];
      const topEdges: number[] = [];
      
      for (let r = 0; r < radialSegments; r++) {
        topVertices.push(vertices[heightSegments][r]);
        if (r > 0) {
          const edge = mesh.addEdge(new Edge(vertices[heightSegments][r - 1], vertices[heightSegments][r]));
          topEdges.push(edge);
        }
      }
      
      // Close the circle
      const edge = mesh.addEdge(new Edge(vertices[heightSegments][radialSegments - 1], vertices[heightSegments][0]));
      topEdges.push(edge);
      
      mesh.addFace(
        new Face(
          topVertices,
          topEdges,
          { materialIndex: 2 } // Top cap material
        )
      );
    } else {
      // Partial circle - create individual triangles
      // Create center vertex for the top cap
      const topCenterVertex = new Vertex(0, halfHeight, 0);
      topCenterVertex.uv = { u: 0.5, v: 0.5 };
      const topCenterIndex = mesh.addVertex(topCenterVertex);
      
      for (let r = 0; r < radialSegments; r++) {
        const v1 = vertices[heightSegments][r];
        const v2 = vertices[heightSegments][r + 1];
        
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