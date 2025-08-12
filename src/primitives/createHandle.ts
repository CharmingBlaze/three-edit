import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for creating a handle
 */
export interface CreateHandleOptions {
  /** Radius of the handle */
  radius?: number;
  /** Height of the handle */
  height?: number;
  /** Number of radial segments */
  radialSegments?: number;
  /** Number of height segments */
  heightSegments?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a handle as an EditableMesh
 * @param options Options for creating the handle
 * @returns A new EditableMesh instance representing a handle
 */
export function createHandle(options: CreateHandleOptions = {}): EditableMesh {
  const radius = options.radius ?? 0.1;
  const height = options.height ?? 0.5;
  const radialSegments = Math.max(3, Math.floor(options.radialSegments ?? 8));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const name = options.name ?? 'Handle';
  
  const mesh = new EditableMesh({ name });
  
  // Create vertices for the handle
  const vertices: number[][] = [];
  
  // Create vertices for each height segment
  for (let h = 0; h <= heightSegments; h++) {
    const y = (h / heightSegments - 0.5) * height;
    const row: number[] = [];
    
    // Create vertices around the circumference
    for (let r = 0; r <= radialSegments; r++) {
      const theta = (r / radialSegments) * Math.PI * 2;
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
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create edges and faces for the side walls
  for (let h = 0; h < heightSegments; h++) {
    for (let r = 0; r < radialSegments; r++) {
      const v1 = vertices[h][r];
      const v2 = vertices[h][r + 1];
      const v3 = vertices[h + 1][r + 1];
      const v4 = vertices[h + 1][r];

      const edge1 = addEdge(v1, v2);
      const edge2 = addEdge(v2, v3);
      const edge3 = addEdge(v3, v4);
      const edge4 = addEdge(v4, v1);

      mesh.addFace(new Face([v1, v2, v3, v4], [edge1, edge2, edge3, edge4], { materialIndex: 0 }));
    }
  }

  // Create top and bottom caps
  const createCap = (isTop: boolean) => {
    const vertexRow = isTop ? vertices[heightSegments] : vertices[0];
    const materialIndex = isTop ? 2 : 1;
    const capVertexIndices = [];
    for (let r = 0; r < radialSegments; r++) {
      capVertexIndices.push(vertexRow[r]);
    }

    const capEdgeIndices = [];
    for (let r = 0; r < radialSegments; r++) {
      const v1 = vertexRow[r];
      const v2 = vertexRow[(r + 1) % radialSegments];
      capEdgeIndices.push(addEdge(v1, v2));
    }

    if (isTop) {
      mesh.addFace(new Face(capVertexIndices.slice().reverse(), capEdgeIndices.slice().reverse(), { materialIndex }));
    } else {
      mesh.addFace(new Face(capVertexIndices, capEdgeIndices, { materialIndex }));
    }
  };

  createCap(false); // Bottom cap
  createCap(true);  // Top cap
  
  return mesh;
} 