import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

/**
 * Options for creating a Möbius strip
 */
export interface MobiusStripOptions {
  /** Radius of the strip (default: 1.0) */
  radius?: number;
  /** Width of the strip (default: 0.3) */
  width?: number;
  /** Number of segments along the strip (default: 64) */
  segments?: number;
  /** Number of segments across the width (default: 8) */
  widthSegments?: number;
  /** Number of twists (default: 1) */
  twists?: number;
  /** Material index for the faces (default: 0) */
  materialIndex?: number;
  /** Whether to generate UV coordinates (default: true) */
  generateUVs?: boolean;
  /** Whether to generate vertex normals (default: true) */
  generateNormals?: boolean;

}

/**
 * Creates a Möbius strip primitive
 * @param options Options for creating the Möbius strip
 * @returns The created EditableMesh
 */
export function createMobiusStrip(options: MobiusStripOptions = {}): EditableMesh {
  const radius = options.radius ?? 1.0;
  const width = options.width ?? 0.3;
  const segments = options.segments ?? 64;
  const widthSegments = options.widthSegments ?? 8;
  const twists = options.twists ?? 1;
  const materialIndex = options.materialIndex ?? 0;
  const generateUVs = options.generateUVs ?? true;
  const generateNormals = options.generateNormals ?? true;

  const mesh = new EditableMesh();

  // Generate vertices
  const vertices: Vector3[] = [];
  const uvs: { u: number; v: number }[] = [];
  const normals: Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const u = i / segments * Math.PI * 2;
    const twistAngle = (u * twists) / 2;

    for (let j = 0; j <= widthSegments; j++) {
      const v = j / widthSegments * 2 - 1;
      const w = v * width / 2;

      // Position
      const x = (radius + w * Math.cos(twistAngle)) * Math.cos(u);
      const y = (radius + w * Math.cos(twistAngle)) * Math.sin(u);
      const z = w * Math.sin(twistAngle);

      vertices.push(new Vector3(x, y, z));
      uvs.push({ u: i / segments, v: j / widthSegments });
      
      // Normal
      const normal = new Vector3(
        Math.cos(twistAngle) * Math.cos(u),
        Math.cos(twistAngle) * Math.sin(u),
        Math.sin(twistAngle)
      ).normalize();
      normals.push(normal);
    }
  }

  // Add vertices to mesh
  const vertexIndices: number[] = [];
  for (const vertex of vertices) {
    const newVertex = new Vertex(vertex.x, vertex.y, vertex.z, {
      uv: generateUVs ? { u: 0, v: 0 } : undefined,
      normal: generateNormals ? normals[0] : undefined
    });
    const vertexIndex = mesh.addVertex(newVertex);
    vertexIndices.push(vertexIndex);
  }

  const edgeMap: { [key: string]: number } = {};
  const addEdge = (v1: number, v2: number): number => {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeMap[key] === undefined) {
      edgeMap[key] = mesh.addEdge(new Edge(v1, v2));
    }
    return edgeMap[key];
  };

  // Generate faces
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < widthSegments; j++) {
      const v1 = vertexIndices[i * (widthSegments + 1) + j];
      const v2 = vertexIndices[((i + 1) % (segments + 1)) * (widthSegments + 1) + j];
      const v3 = vertexIndices[((i + 1) % (segments + 1)) * (widthSegments + 1) + j + 1];
      const v4 = vertexIndices[i * (widthSegments + 1) + j + 1];

      const edge1 = addEdge(v1, v2);
      const edge2 = addEdge(v2, v3);
      const edge3 = addEdge(v3, v4);
      const edge4 = addEdge(v4, v1);

      mesh.addFace(new Face([v1, v2, v3, v4], [edge1, edge2, edge3, edge4], { materialIndex }));
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