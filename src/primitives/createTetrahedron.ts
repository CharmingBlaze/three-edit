import { Vector3 } from 'three';
import { EditableMesh } from '../core/index.ts';
import { Vertex } from '../core/index.ts';
import { Edge } from '../core/index.ts';
import { Face } from '../core/index.ts';

/**
 * Options for creating a tetrahedron
 */
export interface TetrahedronOptions {
  /** Size of the tetrahedron (default: 1.0) */
  size?: number;
  /** Material index for the faces (default: 0) */
  materialIndex?: number;
  /** Whether to generate UV coordinates (default: true) */
  generateUVs?: boolean;
  /** Whether to generate vertex normals (default: true) */
  generateNormals?: boolean;
  /** Center point of the tetrahedron (default: origin) */
  center?: Vector3;
}

/**
 * Creates a regular tetrahedron primitive
 * @param options Options for creating the tetrahedron
 * @returns The created EditableMesh
 */
export function createTetrahedron(options: TetrahedronOptions = {}): EditableMesh {
  const size = options.size ?? 1.0;
  const materialIndex = options.materialIndex ?? 0;
  const generateUVs = options.generateUVs ?? true;
  const generateNormals = options.generateNormals ?? true;
  const center = options.center ?? new Vector3(0, 0, 0);

  const mesh = new EditableMesh();

  // Tetrahedron vertices (regular tetrahedron)
  const vertices = [
    new Vector3(1, 1, 1),
    new Vector3(-1, -1, 1),
    new Vector3(-1, 1, -1),
    new Vector3(1, -1, -1)
  ];

  // Scale and center vertices
  vertices.forEach(vertex => {
    vertex.multiplyScalar(size / Math.sqrt(3));
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

  // Tetrahedron faces (4 triangular faces)
  const faces = [
    [0, 1, 2], // Face 1
    [0, 2, 3], // Face 2
    [0, 3, 1], // Face 3
    [1, 3, 2]  // Face 4
  ];

  // Create faces
  for (const faceVertices of faces) {
    // Create edges for the face
    const edgeIndices: number[] = [];
    for (let i = 0; i < faceVertices.length; i++) {
      const v1 = vertexIndices[faceVertices[i]];
      const v2 = vertexIndices[faceVertices[(i + 1) % faceVertices.length]];
      const edge = new Edge(v1, v2);
      const edgeIndex = mesh.addEdge(edge);
      edgeIndices.push(edgeIndex);
    }

    // Create face
    const meshFaceVertices = faceVertices.map(i => vertexIndices[i]);
    const face = new Face(meshFaceVertices, edgeIndices, {
      materialIndex: materialIndex
    });
    mesh.addFace(face);
  }

  // Generate proper UVs if requested
  if (generateUVs) {
    // Simple UV mapping for tetrahedron
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