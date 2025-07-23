import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { calculateFaceNormal } from '../utils/mathUtils';

/**
 * Options for creating a capsule.
 */
export interface CreateCapsuleOptions {
  radius?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  capSegments?: number;
  name?: string;
}

/**
 * Creates a capsule as an EditableMesh.
 * @param options - Options for creating the capsule.
 * @returns A new EditableMesh instance representing a capsule.
 */
export function createCapsule(options: CreateCapsuleOptions = {}): EditableMesh {
  const radius = options.radius ?? 0.5;
  const height = options.height ?? 2;
  const radialSegments = Math.max(3, Math.floor(options.radialSegments ?? 16));
  const heightSegments = Math.max(1, Math.floor(options.heightSegments ?? 1));
  const capSegments = Math.max(1, Math.floor(options.capSegments ?? 8));
  const name = options.name ?? 'Capsule';

  const mesh = new EditableMesh({ name });
  const grid: number[][] = [];
  const edgeMap: { [key: string]: number } = {};
  const cylinderHeight = height - 2 * radius;
  const totalSegments = capSegments * 2 + heightSegments;

  // Create vertices with UVs
  for (let i = 0; i <= totalSegments; i++) {
    const row: number[] = [];
    let y: number;
    let currentRadius: number;
    let segmentRatio: number;

    if (i <= capSegments) { // Bottom cap
      segmentRatio = i / capSegments;
      const angle = Math.PI / 2 * segmentRatio;
      y = -cylinderHeight / 2 - radius * Math.cos(angle);
      currentRadius = radius * Math.sin(angle);
    } else if (i > capSegments && i < capSegments + heightSegments) { // Cylinder
      segmentRatio = (i - capSegments) / heightSegments;
      y = -cylinderHeight / 2 + segmentRatio * cylinderHeight;
      currentRadius = radius;
    } else { // Top cap
      segmentRatio = (i - capSegments - heightSegments) / capSegments;
      const angle = Math.PI / 2 * (1 - segmentRatio);
      y = cylinderHeight / 2 + radius * Math.cos(angle);
      currentRadius = radius * Math.sin(angle);
    }

    for (let j = 0; j <= radialSegments; j++) {
      const theta = j / radialSegments * 2 * Math.PI;
      const x = currentRadius * Math.cos(theta);
      const z = currentRadius * Math.sin(theta);
      const u = j / radialSegments;
      const v = i / totalSegments;
      
      const vertex = new Vertex(x, y, z, { uv: { u, v } });
      row.push(mesh.addVertex(vertex));
    }
    grid.push(row);
  }

  // Create faces
  for (let i = 0; i < totalSegments; i++) {
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

      const u1 = j / radialSegments;
      const u2 = (j + 1) / radialSegments;
      const v1_uv = i / totalSegments;
      const v2_uv = (i + 1) / totalSegments;

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