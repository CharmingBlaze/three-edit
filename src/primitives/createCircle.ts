import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

/**
 * Options for creating a circle
 */
export interface CreateCircleOptions {
  /** Radius of the circle */
  radius?: number;
  /** Number of segments */
  segments?: number;
  /** Starting angle in radians */
  thetaStart?: number;
  /** Ending angle in radians */
  thetaLength?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a circle as an EditableMesh
 * @param options Options for creating the circle
 * @returns A new EditableMesh instance representing a circle
 */
export function createCircle(options: CreateCircleOptions = {}): EditableMesh {
  const radius = options.radius ?? 1;
  const segments = Math.max(3, Math.floor(options.segments ?? 8));
  const thetaStart = options.thetaStart ?? 0;
  const thetaLength = options.thetaLength ?? Math.PI * 2;
  const name = options.name ?? 'Circle';
  
  const mesh = new EditableMesh({ name });
  
  // Create center vertex
  const centerVertex = new Vertex(0, 0, 0);
  centerVertex.uv = { u: 0.5, v: 0.5 };
  const centerIndex = mesh.addVertex(centerVertex);
  
  // Create vertices around the circle
  const vertices: number[] = [];
  
  for (let i = 0; i <= segments; i++) {
    const theta = thetaStart + (i / segments) * thetaLength;
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;
    const z = 0;
    
    const vertex = new Vertex(x, y, z);
    
    // Generate UVs
    const u = (Math.cos(theta) + 1) / 2;
    const v = (Math.sin(theta) + 1) / 2;
    vertex.uv = { u, v };
    
    const vertexIndex = mesh.addVertex(vertex);
    vertices.push(vertexIndex);
  }
  
  // Create edges and faces
  for (let i = 0; i < segments; i++) {
    const v1 = vertices[i];
    const v2 = vertices[i + 1];
    
    // Create edges
    const edge1 = mesh.addEdge(new Edge(centerIndex, v1));
    const edge2 = mesh.addEdge(new Edge(v1, v2));
    const edge3 = mesh.addEdge(new Edge(v2, centerIndex));
    
    // Create face (material index 0)
    mesh.addFace(
      new Face(
        [centerIndex, v1, v2],
        [edge1, edge2, edge3],
        { materialIndex: 0 }
      )
    );
  }
  
  return mesh;
} 