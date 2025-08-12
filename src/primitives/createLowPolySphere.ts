import { EditableMesh } from '../core/index';
import { Vertex } from '../core/index';
import { Edge } from '../core/index';
import { Face } from '../core/index';

/**
 * Options for creating a low-poly sphere
 */
export interface CreateLowPolySphereOptions {
  /** Radius of the sphere */
  radius?: number;
  /** Number of segments around the sphere */
  segments?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a low-poly sphere as an EditableMesh
 * @param options Options for creating the low-poly sphere
 * @returns A new EditableMesh instance representing a low-poly sphere
 */
export function createLowPolySphere(options: CreateLowPolySphereOptions = {}): EditableMesh {
  const radius = options.radius ?? 1;
  const segments = Math.max(3, Math.floor(options.segments ?? 6));
  const name = options.name ?? 'LowPolySphere';
  
  const mesh = new EditableMesh({ name });
  
  // Create vertices for the low-poly sphere in a grid pattern
  const grid: number[][] = [];
  
  // Create multiple rings for quad faces
  const rings = Math.max(2, Math.floor(segments / 4));
  
  for (let ring = 0; ring <= rings; ring++) {
    const ringRadius = (ring / rings) * radius;
    const row: number[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = ringRadius * Math.cos(theta);
      const z = ringRadius * Math.sin(theta);
      
      const u = (Math.cos(theta) + 1) / 2;
      const v = ring / rings;
      
      const vertex = new Vertex(x, 0, z, { uv: { u, v } });
      const vertexIndex = mesh.addVertex(vertex);
      row.push(vertexIndex);
    }
    grid.push(row);
  }
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create quad faces
  for (let ring = 0; ring < rings; ring++) {
    for (let i = 0; i < segments; i++) {
      const v1 = grid[ring][i];
      const v2 = grid[ring][i + 1];
      const v3 = grid[ring + 1][i + 1];
      const v4 = grid[ring + 1][i];

      const edge1 = addEdge(v1, v2);
      const edge2 = addEdge(v2, v3);
      const edge3 = addEdge(v3, v4);
      const edge4 = addEdge(v4, v1);

      // Create face (material index 0)
      mesh.addFace(new Face([v1, v2, v3, v4], [edge1, edge2, edge3, edge4], { materialIndex: 0 }));
    }
  }
  
  return mesh;
} 