import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { Vector3 } from 'three';
import { calculateFaceNormal } from '../utils/mathUtils';

/**
 * Options for creating a torus knot.
 */
export interface CreateTorusKnotOptions {
  radius?: number;
  tubeRadius?: number;
  tubularSegments?: number;
  radialSegments?: number;
  p?: number;
  q?: number;
  name?: string;
}

// Helper function to calculate TorusKnot point
const getPoint = (u: number, p: number, q: number, radius: number): Vector3 => {
  const cu = Math.cos(u);
  const su = Math.sin(u);
  const quOverP = q / p * u;
  const cs = Math.cos(quOverP);

  const x = (2 + cs) * 0.5 * cu;
  const y = (2 + cs) * 0.5 * su;
  const z = Math.sin(quOverP) * 0.5;

  return new Vector3(x, y, z).multiplyScalar(radius);
};

/**
 * Creates a torus knot as an EditableMesh.
 * @param options - Options for creating the torus knot.
 * @returns A new EditableMesh instance representing a torus knot.
 */
export function createTorusKnot(options: CreateTorusKnotOptions = {}): EditableMesh {
  const {
    radius = 1,
    tubeRadius = 0.1,
    tubularSegments = 64,
    radialSegments = 8,
    p = 2,
    q = 3,
    name = 'TorusKnot',
  } = options;

  const mesh = new EditableMesh({ name });
  const grid: number[][] = [];
  const edgeMap: { [key: string]: number } = {};

  // Create vertices with UVs
  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments * 2 * Math.PI;
    const p1 = getPoint(u, p, q, radius);
    const p2 = getPoint(u + 0.01, p, q, radius);
    const tangent = p2.clone().sub(p1);
    const normal = getPoint(u + 0.01, p, q, radius).sub(p1).cross(new Vector3(0, 0, 1)).normalize();
    const binormal = tangent.clone().cross(normal).normalize();

    const row: number[] = [];
    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments * 2 * Math.PI;
      const cx = -tubeRadius * Math.cos(v); // around the tube
      const cy = tubeRadius * Math.sin(v);
      const pos = p1.clone();
      pos.x += cx * normal.x + cy * binormal.x;
      pos.y += cx * normal.y + cy * binormal.y;
      pos.z += cx * normal.z + cy * binormal.z;
      
      const u_uv = i / tubularSegments;
      const v_uv = j / radialSegments;
      
      const vertex = new Vertex(pos.x, pos.y, pos.z, { uv: { u: u_uv, v: v_uv } });
      row.push(mesh.addVertex(vertex));
    }
    grid.push(row);
  }

  // Create faces
  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const v1 = grid[i][j];
      const v2 = grid[i + 1][j];
      const v3 = grid[i + 1][j + 1];
      const v4 = grid[i][j + 1];
      const faceVertexIds = [v1, v2, v3, v4];

      const edgeIds: number[] = [];
      for (let k = 0; k < faceVertexIds.length; k++) {
        const id1 = faceVertexIds[k];
        const id2 = faceVertexIds[(k + 1) % faceVertexIds.length];
        const key = id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
        if (edgeMap[key] === undefined) {
          edgeMap[key] = mesh.addEdge(new Edge(id1, id2));
        }
        edgeIds.push(edgeMap[key]);
      }

      const u1 = i / tubularSegments;
      const u2 = (i + 1) / tubularSegments;
      const v1_uv = j / radialSegments;
      const v2_uv = (j + 1) / radialSegments;

      const face = new Face(faceVertexIds, edgeIds, {
        faceVertexUvs: [{ u: u1, v: v1_uv }, { u: u2, v: v1_uv }, { u: u2, v: v2_uv }, { u: u1, v: v2_uv }],
        materialIndex: 0,
      });
      face.normal = calculateFaceNormal(mesh, face);
      mesh.addFace(face);
    }
  }

  return mesh;
}