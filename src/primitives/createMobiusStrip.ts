import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

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
  /** Center point of the Möbius strip (default: origin) */
  center?: Vector3;
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
  const center = options.center ?? new Vector3(0, 0, 0);

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
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const uv = uvs[i];
    const normal = normals[i];
    
    vertex.add(center);
    
    const vertexIndex = mesh.addVertex({
      x: vertex.x,
      y: vertex.y,
      z: vertex.z,
      uv: generateUVs ? uv : undefined,
      normal: generateNormals ? normal : undefined
    });
    vertexIndices.push(vertexIndex);
  }

  // Generate faces
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < widthSegments; j++) {
      const a = i * (widthSegments + 1) + j;
      const b = (i + 1) * (widthSegments + 1) + j;
      const c = (i + 1) * (widthSegments + 1) + j + 1;
      const d = i * (widthSegments + 1) + j + 1;

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