import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

/**
 * Options for creating a capsule
 */
export interface CreateCapsuleOptions {
  /** Radius of the capsule */
  radius?: number;
  /** Height of the capsule */
  height?: number;
  /** Number of radial segments (around the circumference) */
  radialSegments?: number;
  /** Number of height segments */
  heightSegments?: number;
  /** Number of cap segments */
  capSegments?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a capsule as an EditableMesh
 * @param options Options for creating the capsule
 * @returns A new EditableMesh instance representing a capsule
 */
export function createCapsule(options: CreateCapsuleOptions = {}): EditableMesh {
  const radius = options.radius ?? 1;
  const height = options.height ?? 2;
  const radialSegments = Math.max(3, Math.floor(options.radialSegments ?? 8));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const capSegments = Math.max(1, Math.floor(options.capSegments ?? 4));
  const name = options.name ?? 'Capsule';
  
  const mesh = new EditableMesh({ name });
  
  // Calculate half height for positioning
  const halfHeight = height / 2;
  const cylinderHeight = height - 2 * radius;
  
  // Create vertices for the capsule
  const vertices: number[][] = [];
  
  // Create vertices for the bottom cap
  for (let c = 0; c <= capSegments; c++) {
    const phi = (Math.PI / 2) * (c / capSegments);
    const y = -halfHeight + radius * Math.sin(phi);
    const currentRadius = radius * Math.cos(phi);
    const row: number[] = [];
    
    for (let r = 0; r <= radialSegments; r++) {
      const theta = (r / radialSegments) * Math.PI * 2;
      const x = Math.cos(theta) * currentRadius;
      const z = Math.sin(theta) * currentRadius;
      
      const vertex = new Vertex(x, y, z);
      
      // Generate UVs
      const u = r / radialSegments;
      const v = c / capSegments;
      vertex.uv = { u, v };
      
      const vertexIndex = mesh.addVertex(vertex);
      row.push(vertexIndex);
    }
    
    vertices.push(row);
  }
  
  // Create vertices for the cylinder part (if any)
  if (cylinderHeight > 0) {
    for (let h = 1; h <= heightSegments; h++) {
      const y = -halfHeight + radius + (h / heightSegments) * cylinderHeight;
      const row: number[] = [];
      
      for (let r = 0; r <= radialSegments; r++) {
        const theta = (r / radialSegments) * Math.PI * 2;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        
        const vertex = new Vertex(x, y, z);
        
        // Generate UVs
        const u = r / radialSegments;
        const v = (capSegments + h) / (capSegments + heightSegments + capSegments);
        vertex.uv = { u, v };
        
        const vertexIndex = mesh.addVertex(vertex);
        row.push(vertexIndex);
      }
      
      vertices.push(row);
    }
  }
  
  // Create vertices for the top cap
  for (let c = 0; c <= capSegments; c++) {
    const phi = (Math.PI / 2) * (1 - c / capSegments);
    const y = halfHeight - radius * Math.sin(phi);
    const currentRadius = radius * Math.cos(phi);
    const row: number[] = [];
    
    for (let r = 0; r <= radialSegments; r++) {
      const theta = (r / radialSegments) * Math.PI * 2;
      const x = Math.cos(theta) * currentRadius;
      const z = Math.sin(theta) * currentRadius;
      
      const vertex = new Vertex(x, y, z);
      
      // Generate UVs
      const u = r / radialSegments;
      const v = 1 - c / capSegments;
      vertex.uv = { u, v };
      
      const vertexIndex = mesh.addVertex(vertex);
      row.push(vertexIndex);
    }
    
    vertices.push(row);
  }
  
  // Create edges and faces
  for (let h = 0; h < vertices.length - 1; h++) {
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
      
      // Create face (material index 0)
      mesh.addFace(
        new Face(
          [a, b, c, d],
          [edgeAB, edgeBC, edgeCD, edgeDA],
          { materialIndex: 0 }
        )
      );
    }
  }
  
  return mesh;
} 