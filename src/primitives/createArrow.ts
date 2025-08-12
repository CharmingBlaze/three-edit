import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { calculateFaceNormal } from '../utils/mathUtils';

export interface CreateArrowOptions {
  shaftRadius?: number;
  shaftLength?: number;
  headRadius?: number;
  headLength?: number;
  radialSegments?: number;
  heightSegments?: number;
  name?: string;
}

export function createArrow(options: CreateArrowOptions = {}): EditableMesh {
  const {
    shaftRadius = 0.1,
    shaftLength = 1,
    headRadius = 0.2,
    headLength = 0.4,
    radialSegments = 16,
    heightSegments = 4,
    name = 'Arrow',
  } = options;

  const mesh = new EditableMesh({ name });
  const edgeMap: { [key: string]: number } = {};

  const addVertex = (v: Vertex): number => {
    return mesh.addVertex(v);
  };

  const addFace = (vertIds: number[], uvs: { u: number; v: number }[], matIndex: number) => {
    const edgeIds: number[] = [];
    for (let i = 0; i < vertIds.length; i++) {
      const v1 = vertIds[i];
      const v2 = vertIds[(i + 1) % vertIds.length];
      const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      if (edgeMap[key] === undefined) {
        edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
      }
      edgeIds.push(edgeMap[key]);
    }
    const face = new Face(vertIds, edgeIds, { faceVertexUvs: uvs, materialIndex: matIndex });
    face.normal = calculateFaceNormal(mesh, face);
    mesh.addFace(face);
  };

  // --- Shaft ---
  const shaftGrid: number[][] = [];
  for (let h = 0; h <= heightSegments; h++) {
    const row: number[] = [];
    const y = (h / heightSegments) * shaftLength;
    for (let r = 0; r < radialSegments; r++) {
      const theta = (r / radialSegments) * Math.PI * 2;
      const x = Math.cos(theta) * shaftRadius;
      const z = Math.sin(theta) * shaftRadius;
      const u = r / radialSegments;
      const v = h / heightSegments;
      
      const vertex = new Vertex(x, y, z, { uv: { u, v } });
      row.push(addVertex(vertex));
    }
    shaftGrid.push(row);
  }

  // Create quad faces for shaft
  for (let h = 0; h < heightSegments; h++) {
    for (let r = 0; r < radialSegments; r++) {
      const r1 = (r + 1) % radialSegments;
      const v1 = shaftGrid[h][r];
      const v2 = shaftGrid[h + 1][r];
      const v3 = shaftGrid[h + 1][r1];
      const v4 = shaftGrid[h][r1];
      const uvs = [
        { u: r / radialSegments, v: h / heightSegments },
        { u: r / radialSegments, v: (h + 1) / heightSegments },
        { u: (r + 1) / radialSegments, v: (h + 1) / heightSegments },
        { u: (r + 1) / radialSegments, v: h / heightSegments },
      ];
      addFace([v1, v2, v3, v4], uvs, 0);
    }
  }

  // --- Head ---
  const headBaseIds = shaftGrid[heightSegments];
  const tipVertex = new Vertex(0, shaftLength + headLength, 0, { uv: { u: 0.5, v: 1 } });
  const tipId = addVertex(tipVertex);

  for (let r = 0; r < radialSegments; r++) {
    const r1 = (r + 1) % radialSegments;
    const v1 = headBaseIds[r];
    const v2 = headBaseIds[r1];
    const uvs = [
      { u: r / radialSegments, v: 0 },
      { u: (r + 1) / radialSegments, v: 0 },
      { u: 0.5, v: 1 },
    ];
    addFace([v1, v2, tipId], uvs, 1);
  }

  // --- Base Cap ---
  const baseCenterVertex = new Vertex(0, 0, 0, { uv: { u: 0.5, v: 0.5 } });
  const baseCenterId = addVertex(baseCenterVertex);
  for (let r = 0; r < radialSegments; r++) {
    const r1 = (r + 1) % radialSegments;
    const v1 = shaftGrid[0][r1];
    const v2 = shaftGrid[0][r];
    const getUv = (v: Vertex) => ({ u: (v.x / shaftRadius + 1) / 2, v: (v.z / shaftRadius + 1) / 2 });
    const uvs = [getUv(mesh.getVertex(v1)!), getUv(mesh.getVertex(v2)!), { u: 0.5, v: 0.5 }];
    addFace([v1, v2, baseCenterId], uvs, 0);
  }

  return mesh;
}