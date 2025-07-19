import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for creating a torus
 */
export interface CreateTorusOptions {
  /** Radius of the torus (distance from center to tube center) */
  radius?: number;
  /** Radius of the tube */
  tubeRadius?: number;
  /** Number of radial segments (around the torus) */
  radialSegments?: number;
  /** Number of tubular segments (around the tube) */
  tubularSegments?: number;
  /** Starting angle in radians */
  arc?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a torus as an EditableMesh
 * @param options Options for creating the torus
 * @returns A new EditableMesh instance representing a torus
 */
export function createTorus(options: CreateTorusOptions = {}): EditableMesh {
  const radius = options.radius ?? 1;
  const tubeRadius = options.tubeRadius ?? 0.4;
  const radialSegments = Math.max(3, Math.floor(options.radialSegments ?? 8));
  const tubularSegments = Math.max(3, Math.floor(options.tubularSegments ?? 6));
  const arc = options.arc ?? Math.PI * 2;
  const name = options.name ?? 'Torus';
  
  const mesh = new EditableMesh({ name });
  
  // Create vertices for the torus
  const vertices: number[][] = [];
  
  // Create vertices in a grid
  for (let r = 0; r <= radialSegments; r++) {
    const u = r / radialSegments * arc;
    const row: number[] = [];
    
    for (let t = 0; t <= tubularSegments; t++) {
      const v = t / tubularSegments * Math.PI * 2;
      
      // Calculate position
      const x = (radius + tubeRadius * Math.cos(v)) * Math.cos(u);
      const y = (radius + tubeRadius * Math.cos(v)) * Math.sin(u);
      const z = tubeRadius * Math.sin(v);
      
      const vertex = new Vertex(x, y, z);
      
      // Generate UVs
      const uvU = r / radialSegments;
      const uvV = t / tubularSegments;
      vertex.uv = { u: uvU, v: uvV };
      
      const vertexIndex = mesh.addVertex(vertex);
      row.push(vertexIndex);
    }
    
    vertices.push(row);
  }
  
  // Create edges and faces
  for (let r = 0; r < radialSegments; r++) {
    for (let t = 0; t < tubularSegments; t++) {
      const a = vertices[r][t];
      const b = vertices[r][t + 1];
      const c = vertices[r + 1][t + 1];
      const d = vertices[r + 1][t];
      
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