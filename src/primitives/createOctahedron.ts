import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

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
    const vertexIndex = mesh.addVertex({
      x: vertex.x,
      y: vertex.y,
      z: vertex.z,
      uv: generateUVs ? { u: 0, v: 0 } : undefined,
      normal: generateNormals ? new Vector3(0, 1, 0) : undefined
    });
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
          const vec1 = new Vector3().subVectors(v2, v1);
          const vec2 = new Vector3().subVectors(v3, v1);
          const normal = new Vector3();
          normal.crossVectors(vec1, vec2).normalize();
          face.normal = normal;
        }
      }
    }
  }

  return mesh;
} 