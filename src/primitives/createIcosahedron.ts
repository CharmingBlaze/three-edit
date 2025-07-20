import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

/**
 * Options for creating an icosahedron
 */
export interface IcosahedronOptions {
  /** Size of the icosahedron (default: 1.0) */
  size?: number;
  /** Material index for the faces (default: 0) */
  materialIndex?: number;
  /** Whether to generate UV coordinates (default: true) */
  generateUVs?: boolean;
  /** Whether to generate vertex normals (default: true) */
  generateNormals?: boolean;
  /** Center point of the icosahedron (default: origin) */
  center?: Vector3;
}

/**
 * Creates a regular icosahedron primitive
 * @param options Options for creating the icosahedron
 * @returns The created EditableMesh
 */
export function createIcosahedron(options: IcosahedronOptions = {}): EditableMesh {
  const size = options.size ?? 1.0;
  const materialIndex = options.materialIndex ?? 0;
  const generateUVs = options.generateUVs ?? true;
  const generateNormals = options.generateNormals ?? true;
  const center = options.center ?? new Vector3(0, 0, 0);

  const mesh = new EditableMesh();

  // Golden ratio for icosahedron
  const phi = (1 + Math.sqrt(5)) / 2;

  // Icosahedron vertices (12 vertices)
  const vertices = [
    // Top and bottom vertices
    new Vector3(0, phi, 1),
    new Vector3(0, -phi, 1),
    new Vector3(0, phi, -1),
    new Vector3(0, -phi, -1),
    
    // Front and back vertices
    new Vector3(1, 0, phi),
    new Vector3(-1, 0, phi),
    new Vector3(1, 0, -phi),
    new Vector3(-1, 0, -phi),
    
    // Left and right vertices
    new Vector3(phi, 1, 0),
    new Vector3(-phi, 1, 0),
    new Vector3(phi, -1, 0),
    new Vector3(-phi, -1, 0)
  ];

  // Scale and center vertices
  vertices.forEach(vertex => {
    vertex.multiplyScalar(size / Math.sqrt(phi * phi + 1));
    vertex.add(center);
  });

  // Add vertices to mesh
  const vertexIndices: number[] = [];
  for (const vertex of vertices) {
    const newVertex = new Vertex(vertex.x, vertex.y, vertex.z, {
      uv: generateUVs ? { u: 0, v: 0 } : undefined,
      normal: generateNormals ? new Vector3(0, 1, 0) : undefined
    });
    const vertexIndex = mesh.addVertex(newVertex);
    vertexIndices.push(vertexIndex);
  }

  // Icosahedron faces (20 triangular faces)
  const faces = [
    // Top faces
    [0, 4, 1], [0, 1, 5], [0, 5, 8], [0, 8, 4],
    [1, 4, 10], [1, 10, 5], [1, 5, 2], [1, 2, 4],
    
    // Bottom faces
    [2, 6, 3], [2, 3, 7], [2, 7, 11], [2, 11, 6],
    [3, 6, 9], [3, 9, 7], [3, 7, 2], [3, 2, 6],
    
    // Side faces
    [4, 8, 9], [5, 10, 11], [6, 9, 8], [7, 11, 10]
  ];

  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  const createFace = (v1: number, v2: number, v3: number): void => {
    const edge1 = addEdge(v1, v2);
    const edge2 = addEdge(v2, v3);
    const edge3 = addEdge(v3, v1);

    mesh.addFace(new Face([v1, v2, v3], [edge1, edge2, edge3], { materialIndex }));
  };

  // Create faces
  for (const face of faces) {
    const v1 = vertexIndices[face[0]];
    const v2 = vertexIndices[face[1]];
    const v3 = vertexIndices[face[2]];

    createFace(v1, v2, v3);
  }

  // Generate proper UVs if requested
  if (generateUVs) {
    // UV mapping for icosahedron
    for (let i = 0; i < mesh.getVertexCount(); i++) {
      const vertex = mesh.getVertex(i);
      if (vertex) {
        // Map vertices to UV coordinates based on their position
        const u = (vertex.x + size) / (2 * size);
        const v = (vertex.y + size) / (2 * size);
        vertex.uv = { u: Math.max(0, Math.min(1, u)), v: Math.max(0, Math.min(1, v)) };
      }
    }
  }

  // Generate proper normals if requested
  if (generateNormals) {
    for (let i = 0; i < mesh.getFaceCount(); i++) {
      const face = mesh.getFace(i);
      if (face && face.vertices.length >= 3) {
        const v1 = mesh.getVertex(face.vertices[0]);
        const v2 = mesh.getVertex(face.vertices[1]);
        const v3 = mesh.getVertex(face.vertices[2]);
        
        if (v1 && v2 && v3) {
          const vec1 = new Vector3().subVectors(
            new Vector3(v2.x, v2.y, v2.z),
            new Vector3(v1.x, v1.y, v1.z)
          );
          const vec2 = new Vector3().subVectors(
            new Vector3(v3.x, v3.y, v3.z),
            new Vector3(v1.x, v1.y, v1.z)
          );
          const normal = new Vector3();
          normal.crossVectors(vec1, vec2).normalize();
          face.normal = normal;
        }
      }
    }
  }

  return mesh;
} 