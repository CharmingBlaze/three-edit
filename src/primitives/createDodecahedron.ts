import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { Vector3 } from 'three';
import { calculateFaceNormal } from '../utils/mathUtils';

/**
 * Options for creating a dodecahedron.
 */
export interface CreateDodecahedronOptions {
  radius?: number;
  name?: string;
}

/**
 * Creates a dodecahedron as an EditableMesh.
 * @param options - Options for creating the dodecahedron.
 * @returns A new EditableMesh instance representing a dodecahedron.
 */
export function createDodecahedron(options: CreateDodecahedronOptions = {}): EditableMesh {
  const radius = options.radius ?? 1;
  const name = options.name ?? 'Dodecahedron';
  const mesh = new EditableMesh({ name });

  const t = (1 + Math.sqrt(5)) / 2; // Golden ratio
  const r = 1 / t;

  const vertices = [
    [-1, -1, -1], [ -1, -1, 1], [-1, 1, -1], [-1, 1, 1],
    [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1],
    [0, -r, -t], [0, -r, t], [0, r, -t], [0, r, t],
    [-r, -t, 0], [-r, t, 0], [r, -t, 0], [r, t, 0],
    [-t, 0, -r], [-t, 0, r], [t, 0, -r], [t, 0, r],
  ];

  const vertexIds = vertices.map(v => {
    const x = v[0] * radius;
    const y = v[1] * radius;
    const z = v[2] * radius;
    const u = Math.atan2(z, x) / (2 * Math.PI) + 0.5;
    const v_uv = Math.asin(y / radius) / Math.PI + 0.5;
    
    const vertex = new Vertex(x, y, z, { uv: { u, v: v_uv } });
    return mesh.addVertex(vertex);
  });

  const faces = [
    [3, 11, 7, 15, 13], [3, 13, 17, 2, 10], [3, 10, 6, 7, 11],
    [7, 6, 18, 19, 15], [15, 19, 5, 14, 14], [5, 9, 1, 12, 14],
    [1, 17, 13, 12, 12], [12, 13, 17, 2, 10], [2, 16, 0, 8, 10],
    [0, 12, 1, 9, 8], [8, 9, 5, 14, 4], [4, 18, 6, 10, 8],
  ].map(f => [f[0], f[1], f[2], f[3], f[4]]);

  const edgeMap: { [key: string]: number } = {};

  for (const faceIndices of faces) {
    const faceVertexIds = faceIndices.map(i => vertexIds[i]);
    const edgeIds: number[] = [];

    for (let i = 0; i < faceVertexIds.length; i++) {
      const id1 = faceVertexIds[i];
      const id2 = faceVertexIds[(i + 1) % faceVertexIds.length];
      const key = id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
      if (edgeMap[key] === undefined) {
        edgeMap[key] = mesh.addEdge(new Edge(id1, id2));
      }
      edgeIds.push(edgeMap[key]);
    }

    const face = new Face(faceVertexIds, edgeIds, {
      faceVertexUvs: [
        { u: 0.5, v: 1.0 },
        { u: 0.09, v: 0.69 },
        { u: 0.91, v: 0.69 },
        { u: 0.24, v: 0.09 },
        { u: 0.76, v: 0.09 },
      ],
      materialIndex: 0,
    });
    face.normal = calculateFaceNormal(mesh, face);
    mesh.addFace(face);
  }

  return mesh;
}
 