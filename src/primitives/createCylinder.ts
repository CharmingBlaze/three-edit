import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

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
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      const newEdge = new Edge(v1, v2);
      edgeMap[key] = mesh.addEdge(newEdge);
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

  // Create caps if not open-ended
  if (!openEnded) {
    const createCap = (isTop: boolean) => {
      const y = isTop ? halfHeight : -halfHeight;
      const vertexRow = isTop ? vertices[heightSegments] : vertices[0];
      const materialIndex = isTop ? 2 : 1;

      if (thetaLength >= Math.PI * 2) {
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
      } else {
        const centerVertex = new Vertex(0, y, 0);
        centerVertex.uv = { u: 0.5, v: 0.5 };
        const centerIndex = mesh.addVertex(centerVertex);

        for (let r = 0; r < radialSegments; r++) {
          const v1 = vertexRow[r];
          const v2 = vertexRow[r + 1];
          const edge1 = addEdge(centerIndex, v1);
          const edge2 = addEdge(v1, v2);
          const edge3 = addEdge(v2, centerIndex);
          if (isTop) {
            mesh.addFace(new Face([centerIndex, v2, v1], [edge3, edge2, edge1], { materialIndex }));
          } else {
            mesh.addFace(new Face([centerIndex, v1, v2], [edge1, edge2, edge3], { materialIndex }));
          }
        }
      }
    };

    createCap(false); // Bottom cap
    createCap(true);  // Top cap
  }
  
  return mesh;
}