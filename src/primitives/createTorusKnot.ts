import { Vector3 } from 'three';
import { EditableMesh } from '../core/index.ts';
import { Vertex } from '../core/index.ts';
import { Edge } from '../core/index.ts';
import { Face } from '../core/index.ts';

/**
 * Options for creating a torus knot
 */
export interface TorusKnotOptions {
  /** Radius of the torus (default: 1.0) */
  radius?: number;
  /** Radius of the tube (default: 0.3) */
  tubeRadius?: number;
  /** Number of tubular segments (default: 64) */
  tubularSegments?: number;
  /** Number of radial segments (default: 8) */
  radialSegments?: number;
  /** P parameter for the knot (default: 2) */
  p?: number;
  /** Q parameter for the knot (default: 3) */
  q?: number;
  /** Material index for the faces (default: 0) */
  materialIndex?: number;
  /** Whether to generate UV coordinates (default: true) */
  generateUVs?: boolean;
  /** Whether to generate vertex normals (default: true) */
  generateNormals?: boolean;
  /** Center point of the torus knot (default: origin) */
  center?: Vector3;
}

/**
 * Creates a torus knot primitive
 * @param options Options for creating the torus knot
 * @returns The created EditableMesh
 */
export function createTorusKnot(options: TorusKnotOptions = {}): EditableMesh {
  const radius = options.radius ?? 1;
  const tubeRadius = options.tubeRadius ?? 0.3;
  const tubularSegments = Math.max(3, Math.floor(options.tubularSegments ?? 64));
  const radialSegments = Math.max(3, Math.floor(options.radialSegments ?? 8));
  const p = options.p ?? 2;
  const q = options.q ?? 3;
  // const _center = options.center ?? new Vector3(0, 0, 0);
  const materialIndex = options.materialIndex ?? 0;
  const generateUVs = options.generateUVs ?? true;
  const generateNormals = options.generateNormals ?? true;

  const mesh = new EditableMesh();

  // Generate vertices
  const vertices: Vector3[] = [];
  const uvs: { u: number; v: number }[] = [];
  const normals: Vector3[] = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments * p * Math.PI * 2;
    const p1 = new Vector3(
      (2 + Math.cos(q * u)) * Math.cos(p * u),
      (2 + Math.cos(q * u)) * Math.sin(p * u),
      Math.sin(q * u)
    );

    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments * Math.PI * 2;
      const cx = -Math.tan(q * u) * Math.cos(p * u);
      const cy = -Math.tan(q * u) * Math.sin(p * u);
      const cz = Math.cos(p * u);

      const x = p1.x + tubeRadius * (Math.cos(v) * cx + Math.sin(v) * Math.cos(p * u));
      const y = p1.y + tubeRadius * (Math.cos(v) * cy + Math.sin(v) * Math.sin(p * u));
      const z = p1.z + tubeRadius * Math.sin(v);

      vertices.push(new Vector3(x * radius, y * radius, z * radius));
      uvs.push({ u: i / tubularSegments, v: j / radialSegments });
      
      // Calculate normal
      const normal = new Vector3(cx, cy, cz).normalize();
      normals.push(normal);
    }
  }

  // Add vertices to mesh
  const vertexIndices: number[] = [];
  for (const vertex of vertices) {
    const newVertex = new Vertex(vertex.x, vertex.y, vertex.z, {
      uv: generateUVs ? { u: 0, v: 0 } : undefined,
      normal: generateNormals ? normals[0] : undefined // Assuming a default normal or that normals are not generated per vertex
    });
    const vertexIndex = mesh.addVertex(newVertex);
    vertexIndices.push(vertexIndex);
  }

  // Generate faces
  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + j + 1;
      const d = i * (radialSegments + 1) + j + 1;

      // Create edges for the face
      const edgeIndices: number[] = [];
      const faceVertices = [a, b, c, d];
      
      for (let k = 0; k < faceVertices.length; k++) {
        const v1 = vertexIndices[faceVertices[k]];
        const v2 = vertexIndices[faceVertices[(k + 1) % faceVertices.length]];
        const edge = new Edge(v1, v2);
        const edgeIndex = mesh.addEdge(edge);
        edgeIndices.push(edgeIndex);
      }

      // Create face
      const meshFaceVertices = faceVertices.map(index => vertexIndices[index]);
      const face = new Face(meshFaceVertices, edgeIndices, {
        materialIndex: materialIndex
      });
      mesh.addFace(face);
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