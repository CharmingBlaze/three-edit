import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

/**
 * Options for creating a dodecahedron
 */
export interface DodecahedronOptions {
  /** Size of the dodecahedron (default: 1.0) */
  size?: number;
  /** Material index for the faces (default: 0) */
  materialIndex?: number;
  /** Whether to generate UV coordinates (default: true) */
  generateUVs?: boolean;
  /** Whether to generate vertex normals (default: true) */
  generateNormals?: boolean;
  /** Center point of the dodecahedron (default: origin) */
  center?: Vector3;
}

/**
 * Creates a regular dodecahedron primitive
 * @param options Options for creating the dodecahedron
 * @returns The created EditableMesh
 */
export function createDodecahedron(options: DodecahedronOptions = {}): EditableMesh {
  const size = options.size ?? 1.0;
  const materialIndex = options.materialIndex ?? 0;
  const generateUVs = options.generateUVs ?? true;
  const generateNormals = options.generateNormals ?? true;
  const center = options.center ?? new Vector3(0, 0, 0);

  const mesh = new EditableMesh();

  // Golden ratio for dodecahedron
  const phi = (1 + Math.sqrt(5)) / 2;
  const invPhi = 1 / phi;

  // Dodecahedron vertices (20 vertices)
  const vertices = [
    // (±1, ±1, ±1)
    new Vector3(1, 1, 1),
    new Vector3(-1, 1, 1),
    new Vector3(1, -1, 1),
    new Vector3(-1, -1, 1),
    new Vector3(1, 1, -1),
    new Vector3(-1, 1, -1),
    new Vector3(1, -1, -1),
    new Vector3(-1, -1, -1),
    
    // (0, ±φ, ±1/φ)
    new Vector3(0, phi, invPhi),
    new Vector3(0, -phi, invPhi),
    new Vector3(0, phi, -invPhi),
    new Vector3(0, -phi, -invPhi),
    
    // (±1/φ, 0, ±φ)
    new Vector3(invPhi, 0, phi),
    new Vector3(-invPhi, 0, phi),
    new Vector3(invPhi, 0, -phi),
    new Vector3(-invPhi, 0, -phi),
    
    // (±φ, ±1/φ, 0)
    new Vector3(phi, invPhi, 0),
    new Vector3(-phi, invPhi, 0),
    new Vector3(phi, -invPhi, 0),
    new Vector3(-phi, -invPhi, 0)
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

  // Dodecahedron faces (12 pentagonal faces)
  const faces = [
    // Top faces
    [0, 8, 1, 9, 2],
    [0, 2, 14, 13, 8],
    [1, 8, 13, 15, 9],
    [2, 9, 15, 14, 0],
    
    // Bottom faces
    [3, 10, 7, 11, 6],
    [3, 6, 16, 17, 10],
    [7, 10, 17, 19, 11],
    [6, 11, 19, 16, 3],
    
    // Side faces
    [0, 1, 5, 4, 8],
    [1, 9, 3, 7, 5],
    [2, 14, 6, 10, 9],
    [8, 13, 15, 19, 17]
  ];

  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      const newEdge = new Edge(v1, v2);
      edgeMap[key] = mesh.addEdge(newEdge);
    }
    return edgeMap[key];
  };

  // Create faces
  for (const faceVertexIndices of faces) {
    const meshFaceVertices = faceVertexIndices.map(i => vertexIndices[i]);
    const edgeIndices: number[] = [];
    for (let i = 0; i < meshFaceVertices.length; i++) {
      const v1 = meshFaceVertices[i];
      const v2 = meshFaceVertices[(i + 1) % meshFaceVertices.length];
      edgeIndices.push(addEdge(v1, v2));
    }

    const face = new Face(meshFaceVertices, edgeIndices, {
      materialIndex: materialIndex
    });
    mesh.addFace(face);
  }

  // Generate proper UVs if requested
  if (generateUVs) {
    // UV mapping for dodecahedron
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