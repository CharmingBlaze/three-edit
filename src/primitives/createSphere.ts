import { EditableMesh } from '../core/index.ts';
import { Vertex } from '../core/index.ts';
import { Edge } from '../core/index.ts';
import { Face } from '../core/index.ts';
import { Vector3 } from 'three';

/**
 * Options for creating a sphere
 */
export interface CreateSphereOptions {
  /** Radius of the sphere */
  radius?: number;
  /** Number of horizontal segments */
  widthSegments?: number;
  /** Number of vertical segments */
  heightSegments?: number;
  /** Starting horizontal angle in radians */
  phiStart?: number;
  /** Horizontal sweep angle size in radians */
  phiLength?: number;
  /** Starting vertical angle in radians */
  thetaStart?: number;
  /** Vertical sweep angle size in radians */
  thetaLength?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a sphere as an EditableMesh
 * @param options Options for creating the sphere
 * @returns A new EditableMesh instance representing a sphere
 */
export function createSphere(options: CreateSphereOptions = {}): EditableMesh {
  const radius = options.radius ?? 1;
  const widthSegments = Math.max(3, Math.floor(options.widthSegments ?? 32));
  const heightSegments = Math.max(2, Math.floor(options.heightSegments ?? 16));
  const phiStart = options.phiStart ?? 0;
  const phiLength = options.phiLength ?? Math.PI * 2;
  const thetaStart = options.thetaStart ?? 0;
  const thetaLength = options.thetaLength ?? Math.PI;
  const name = options.name ?? 'Sphere';
  
  const mesh = new EditableMesh({ name });
  
  // Create a grid of vertices
  const vertexGrid: number[][] = [];
  
  // Generate vertices
  for (let iy = 0; iy <= heightSegments; iy++) {
    const vertexRow: number[] = [];
    const v = iy / heightSegments;
    
    // Calculate the current vertical angle
    const theta = thetaStart + v * thetaLength;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    for (let ix = 0; ix <= widthSegments; ix++) {
      const u = ix / widthSegments;
      
      // Calculate the current horizontal angle
      const phi = phiStart + u * phiLength;
      
      // Calculate the vertex position
      const x = -radius * Math.cos(phi) * sinTheta;
      const y = radius * cosTheta;
      const z = radius * Math.sin(phi) * sinTheta;
      
      // Create vertex with position and normal
      const vertex = new Vertex(x, y, z);
      
      // Set normal (normalized position vector for a sphere)
      const normal = new Vector3(x, y, z).normalize();
      vertex.normal = normal;
      
      // Set UV coordinates
      vertex.uv = { u, v };
      
      // Add vertex to mesh and store its index
      const vertexIndex = mesh.addVertex(vertex);
      vertexRow.push(vertexIndex);
    }
    
    vertexGrid.push(vertexRow);
  }
  
  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create faces and edges
  for (let iy = 0; iy < heightSegments; iy++) {
    for (let ix = 0; ix < widthSegments; ix++) {
      const a = vertexGrid[iy][ix];
      const b = vertexGrid[iy][ix + 1];
      const c = vertexGrid[iy + 1][ix + 1];
      const d = vertexGrid[iy + 1][ix];

      if (iy === 0 && thetaStart === 0) {
        // Top pole
        const edge1 = addEdge(a, c);
        const edge2 = addEdge(c, b);
        mesh.addFace(new Face([a, c, b], [edge1, edge2, addEdge(b,a)], { materialIndex: 0 }));
      } else if (iy === heightSegments - 1 && thetaStart + thetaLength === Math.PI) {
        // Bottom pole
        const edge1 = addEdge(a, d);
        const edge2 = addEdge(d, c);
        mesh.addFace(new Face([a, d, c], [edge1, edge2, addEdge(c,a)], { materialIndex: 0 }));
      } else {
        // Quad face
        const edge1 = addEdge(a,b);
        const edge2 = addEdge(b,c);
        const edge3 = addEdge(c,d);
        const edge4 = addEdge(d,a);
        mesh.addFace(new Face([a, b, c, d], [edge1, edge2, edge3, edge4], { materialIndex: 0 }));
      }
    }
  }
  
  return mesh;
}
