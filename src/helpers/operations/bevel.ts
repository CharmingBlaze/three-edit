/**
 * Bevel operation helpers
 * Pure, composable functions for bevel operations
 */

import { Vector3 } from 'three';
import { Vertex } from '../../core/Vertex';
import { Edge } from '../../core/Edge';
import { Face } from '../../core/Face';
import { createVertex } from '../core/vertex';
import { createEdge, calculateEdgeLength, calculateEdgeDirection } from '../core/edge';
import { createFace, getFaceVertices, calculateFaceNormal, calculateFaceCentroid } from '../core/face';

/**
 * Options for beveling an edge
 */
export interface BevelEdgeOptions {
  /** Distance to bevel (offset from original edge) */
  distance?: number;
  /** Number of segments for the bevel */
  segments?: number;
  /** Material index for new faces */
  materialIndex?: number;
  /** Whether to keep the original edge */
  keepOriginal?: boolean;
}

/**
 * Result of edge bevel operation
 */
export interface BevelEdgeResult {
  /** New vertices created */
  newVertices: Vertex[];
  /** New edges created */
  newEdges: Edge[];
  /** New faces created */
  newFaces: Face[];
  /** Indices of new vertices in the original vertex array */
  newVertexIndices: number[];
  /** Indices of new edges in the original edge array */
  newEdgeIndices: number[];
  /** Indices of new faces in the original face array */
  newFaceIndices: number[];
}

/**
 * Bevel an edge by creating offset vertices and connecting faces
 */
export function bevelEdge(
  edge: Edge,
  vertices: Vertex[],
  adjacentFaces: Face[],
  options: BevelEdgeOptions = {}
): BevelEdgeResult {
  const distance = options.distance ?? 0.1;
  const segments = options.segments ?? 1;
  const materialIndex = options.materialIndex ?? 0;

  const v1 = vertices[edge.v1];
  const v2 = vertices[edge.v2];

  if (!v1 || !v2) {
    throw new Error(`Invalid vertex indices in edge: ${edge.v1}, ${edge.v2}`);
  }

  // Calculate edge direction and length
  const { direction, length } = calculateEdgeDirection(edge, vertices);
  
  // Calculate perpendicular direction (average of adjacent face normals)
  const perpendicular = new Vector3(0, 0, 0);
  for (const face of adjacentFaces) {
    const faceNormal = calculateFaceNormal(face, vertices);
    perpendicular.add(faceNormal);
  }
  perpendicular.normalize();

  // Create bevel vertices
  const newVertices: Vertex[] = [];
  const newVertexIndices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    
    // Interpolate position along edge
    const position = new Vector3(
      v1.x + (v2.x - v1.x) * t,
      v1.y + (v2.y - v1.y) * t,
      v1.z + (v2.z - v1.z) * t
    );

    // Offset perpendicular to edge
    position.add(perpendicular.clone().multiplyScalar(distance));

    const newVertex = createVertex(
      position.x,
      position.y,
      position.z,
      {
        normal: perpendicular.clone(),
        userData: { type: 'bevel_vertex', segment: i }
      }
    );

    newVertices.push(newVertex);
    newVertexIndices.push(vertices.length + newVertices.length - 1);
  }

  // Create new edges connecting bevel vertices
  const newEdges: Edge[] = [];
  const newEdgeIndices: number[] = [];

  for (let i = 0; i < newVertexIndices.length - 1; i++) {
    const newEdge = createEdge(newVertexIndices[i], newVertexIndices[i + 1]);
    newEdges.push(newEdge);
    newEdgeIndices.push(vertices.length + newVertices.length + newEdges.length - 1);
  }

  // Create faces connecting original vertices to bevel vertices
  const newFaces: Face[] = [];
  const newFaceIndices: number[] = [];

  for (let i = 0; i < segments; i++) {
    const v1Index = edge.v1;
    const v2Index = edge.v2;
    const bevelV1Index = newVertexIndices[i];
    const bevelV2Index = newVertexIndices[i + 1];

    // Create quad face
    const newFace = createFace(
      [v1Index, v2Index, bevelV2Index, bevelV1Index],
      [],
      {
        materialIndex,
        userData: { type: 'bevel_face', segment: i }
      }
    );

    newFaces.push(newFace);
    newFaceIndices.push(vertices.length + newVertices.length + newEdges.length + newFaces.length - 1);
  }

  return {
    newVertices,
    newEdges,
    newFaces,
    newVertexIndices,
    newEdgeIndices,
    newFaceIndices
  };
}

/**
 * Options for beveling a vertex
 */
export interface BevelVertexOptions {
  /** Distance to bevel (radius of the bevel) */
  distance?: number;
  /** Number of segments for the bevel */
  segments?: number;
  /** Material index for new faces */
  materialIndex?: number;
  /** Whether to keep the original vertex */
  keepOriginal?: boolean;
}

/**
 * Result of vertex bevel operation
 */
export interface BevelVertexResult {
  /** New vertices created */
  newVertices: Vertex[];
  /** New edges created */
  newEdges: Edge[];
  /** New faces created */
  newFaces: Face[];
  /** Indices of new vertices in the original vertex array */
  newVertexIndices: number[];
  /** Indices of new edges in the original edge array */
  newEdgeIndices: number[];
  /** Indices of new faces in the original face array */
  newFaceIndices: number[];
}

/**
 * Bevel a vertex by creating a ring of offset vertices
 */
export function bevelVertex(
  vertex: Vertex,
  vertexIndex: number,
  connectedVertices: Vertex[],
  options: BevelVertexOptions = {}
): BevelVertexResult {
  const distance = options.distance ?? 0.1;
  const segments = options.segments ?? connectedVertices.length;
  const materialIndex = options.materialIndex ?? 0;

  // Calculate average direction to connected vertices
  const avgDirection = new Vector3(0, 0, 0);
  for (const connectedVertex of connectedVertices) {
    avgDirection.add(new Vector3(
      connectedVertex.x - vertex.x,
      connectedVertex.y - vertex.y,
      connectedVertex.z - vertex.z
    ));
  }
  avgDirection.normalize();

  // Create bevel vertices in a ring around the original vertex
  const newVertices: Vertex[] = [];
  const newVertexIndices: number[] = [];

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    
    // Create perpendicular direction
    const perpendicular = new Vector3(
      Math.cos(angle),
      Math.sin(angle),
      0
    );

    // Offset position
    const position = new Vector3(
      vertex.x + perpendicular.x * distance,
      vertex.y + perpendicular.y * distance,
      vertex.z + perpendicular.z * distance
    );

    const newVertex = createVertex(
      position.x,
      position.y,
      position.z,
      {
        normal: perpendicular.clone(),
        userData: { type: 'bevel_vertex', segment: i }
      }
    );

    newVertices.push(newVertex);
    newVertexIndices.push(vertexIndex + 1 + i);
  }

  // Create edges connecting bevel vertices
  const newEdges: Edge[] = [];
  const newEdgeIndices: number[] = [];

  for (let i = 0; i < newVertexIndices.length; i++) {
    const v1Index = newVertexIndices[i];
    const v2Index = newVertexIndices[(i + 1) % newVertexIndices.length];
    
    const newEdge = createEdge(v1Index, v2Index);
    newEdges.push(newEdge);
    newEdgeIndices.push(vertexIndex + 1 + segments + i);
  }

  // Create faces connecting original vertex to bevel vertices
  const newFaces: Face[] = [];
  const newFaceIndices: number[] = [];

  for (let i = 0; i < segments; i++) {
    const v1Index = vertexIndex;
    const v2Index = newVertexIndices[i];
    const v3Index = newVertexIndices[(i + 1) % segments];

    const newFace = createFace(
      [v1Index, v2Index, v3Index],
      [],
      {
        materialIndex,
        userData: { type: 'bevel_face', segment: i }
      }
    );

    newFaces.push(newFace);
    newFaceIndices.push(vertexIndex + 1 + segments + segments + i);
  }

  return {
    newVertices,
    newEdges,
    newFaces,
    newVertexIndices,
    newEdgeIndices,
    newFaceIndices
  };
}

/**
 * Options for beveling a face
 */
export interface BevelFaceOptions {
  /** Distance to bevel (offset from original face) */
  distance?: number;
  /** Number of segments for the bevel */
  segments?: number;
  /** Material index for new faces */
  materialIndex?: number;
  /** Whether to keep the original face */
  keepOriginal?: boolean;
}

/**
 * Result of face bevel operation
 */
export interface BevelFaceResult {
  /** New vertices created */
  newVertices: Vertex[];
  /** New edges created */
  newEdges: Edge[];
  /** New faces created */
  newFaces: Face[];
  /** Indices of new vertices in the original vertex array */
  newVertexIndices: number[];
  /** Indices of new edges in the original edge array */
  newEdgeIndices: number[];
  /** Indices of new faces in the original face array */
  newFaceIndices: number[];
}

/**
 * Bevel a face by creating offset vertices and connecting faces
 */
export function bevelFace(
  face: Face,
  vertices: Vertex[],
  options: BevelFaceOptions = {}
): BevelFaceResult {
  const distance = options.distance ?? 0.1;
  const segments = options.segments ?? 1;
  const materialIndex = options.materialIndex ?? face.materialIndex;

  const faceVertices = getFaceVertices(face, vertices);
  const faceNormal = calculateFaceNormal(face, vertices);
  const faceCenter = calculateFaceCentroid(face, vertices);

  // Create bevel vertices (offset from original vertices)
  const newVertices: Vertex[] = [];
  const newVertexIndices: number[] = [];

  for (let i = 0; i < face.vertices.length; i++) {
    const originalVertex = faceVertices[i];
    const originalVertexIndex = face.vertices[i];

    // Calculate offset direction (away from face center)
    const toCenter = new Vector3(
      faceCenter.x - originalVertex.x,
      faceCenter.y - originalVertex.y,
      faceCenter.z - originalVertex.z
    ).normalize();

    // Combine with face normal for bevel direction
    const bevelDirection = new Vector3()
      .addVectors(toCenter, faceNormal)
      .normalize();

    // Create bevel vertex
    const bevelPosition = new Vector3(
      originalVertex.x + bevelDirection.x * distance,
      originalVertex.y + bevelDirection.y * distance,
      originalVertex.z + bevelDirection.z * distance
    );

    const newVertex = createVertex(
      bevelPosition.x,
      bevelPosition.y,
      bevelPosition.z,
      {
        normal: originalVertex.normal?.clone(),
        uv: originalVertex.uv,
        color: originalVertex.color?.clone(),
        userData: { ...originalVertex.userData, type: 'bevel_vertex' }
      }
    );

    newVertices.push(newVertex);
    newVertexIndices.push(vertices.length + newVertices.length - 1);
  }

  // Create edges connecting original and bevel vertices
  const newEdges: Edge[] = [];
  const newEdgeIndices: number[] = [];

  for (let i = 0; i < face.vertices.length; i++) {
    const originalVertexIndex = face.vertices[i];
    const bevelVertexIndex = newVertexIndices[i];
    
    const newEdge = createEdge(originalVertexIndex, bevelVertexIndex);
    newEdges.push(newEdge);
    newEdgeIndices.push(vertices.length + newVertices.length + newEdges.length - 1);
  }

  // Create side faces
  const newFaces: Face[] = [];
  const newFaceIndices: number[] = [];

  for (let i = 0; i < face.vertices.length; i++) {
    const v1 = face.vertices[i];
    const v2 = face.vertices[(i + 1) % face.vertices.length];
    const v3 = newVertexIndices[(i + 1) % face.vertices.length];
    const v4 = newVertexIndices[i];

    const sideFace = createFace(
      [v1, v2, v3, v4],
      [],
      {
        materialIndex,
        userData: { type: 'bevel_side_face' }
      }
    );

    newFaces.push(sideFace);
    newFaceIndices.push(vertices.length + newVertices.length + newEdges.length + newFaces.length - 1);
  }

  // Create bevel face (offset from original)
  const bevelFace = createFace(
    [...newVertexIndices],
    [],
    {
      faceVertexUvs: face.faceVertexUvs ? [...face.faceVertexUvs] : undefined,
      materialIndex,
      normal: faceNormal.clone(),
      userData: { ...face.userData, type: 'bevel_face' }
    }
  );

  newFaces.push(bevelFace);
  newFaceIndices.push(vertices.length + newVertices.length + newEdges.length + newFaces.length - 1);

  return {
    newVertices,
    newEdges,
    newFaces,
    newVertexIndices,
    newEdgeIndices,
    newFaceIndices
  };
} 