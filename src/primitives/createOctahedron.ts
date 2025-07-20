import { Vector3 } from 'three';
import { EditableMesh } from '../core/index.ts';
import { Vertex } from '../core/index.ts';
import { Edge } from '../core/index.ts';
import { Face } from '../core/index.ts';

/**
 * Options for creating an octahedron
 */
export interface OctahedronOptions {
  /** Size of the octahedron (default: 1.0) */
  size?: number;
  /** Material index for the faces (default: 0) */
  materialIndex?: number;
  /** Whether to generate UV coordinates (default: true) */
  generateUVs?: boolean;
  /** Whether to generate vertex normals (default: true) */
  generateNormals?: boolean;
  /** Center point of the octahedron (default: origin) */
  center?: Vector3;
}

/**
 * Creates a regular octahedron primitive
 * @param options Options for creating the octahedron
 * @returns The created EditableMesh
 */
export function createOctahedron(options: OctahedronOptions = {}): EditableMesh {
  const size = options.size ?? 1.0;
  const materialIndex = options.materialIndex ?? 0;
  const generateUVs = options.generateUVs ?? true;
  const generateNormals = options.generateNormals ?? true;
  const center = options.center ?? new Vector3(0, 0, 0);

  const mesh = new EditableMesh();

  // Octahedron vertices (6 vertices)
  const vertices = [
    new Vector3(1, 0, 0),   // Right
    new Vector3(-1, 0, 0),  // Left
    new Vector3(0, 1, 0),   // Top
    new Vector3(0, -1, 0),  // Bottom
    new Vector3(0, 0, 1),   // Front
    new Vector3(0, 0, -1)   // Back
  ];

  // Scale and center vertices
  vertices.forEach(vertex => {
    vertex.multiplyScalar(size);
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

  // Octahedron faces (8 triangular faces)
  const faces = [
    [0, 2, 4], // Right-Top-Front
    [0, 4, 3], // Right-Front-Bottom
    [0, 3, 5], // Right-Bottom-Back
    [0, 5, 2], // Right-Back-Top
    [1, 2, 4], // Left-Top-Front
    [1, 4, 3], // Left-Front-Bottom
    [1, 3, 5], // Left-Bottom-Back
    [1, 5, 2]  // Left-Back-Top
  ];

  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Create faces
  for (const face of faces) {
    const v1 = vertexIndices[face[0]];
    const v2 = vertexIndices[face[1]];
    const v3 = vertexIndices[face[2]];

    const edge1 = addEdge(v1, v2);
    const edge2 = addEdge(v2, v3);
    const edge3 = addEdge(v3, v1);

    mesh.addFace(new Face([v1, v2, v3], [edge1, edge2, edge3], { materialIndex }));
  }

  // Generate proper UVs if requested
  if (generateUVs) {
    // UV mapping for octahedron
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