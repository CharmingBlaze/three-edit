/**
 * Bridge operation helpers
 * Pure, composable functions for bridge operations
 */

import { Vector3 } from 'three';
import { Vertex } from '../../core/Vertex';
import { Edge } from '../../core/Edge';
import { Face } from '../../core/Face';
import { createVertex } from '../core/vertex';
import { createEdge, calculateEdgeLength, calculateEdgeDirection } from '../core/edge';
import { createFace, getFaceVertices, calculateFaceNormal, calculateFaceCentroid } from '../core/face';

/**
 * Options for bridging edges
 */
export interface BridgeEdgesOptions {
  /** Number of segments for the bridge */
  segments?: number;
  /** Material index for new faces */
  materialIndex?: number;
  /** Whether to twist the bridge */
  twist?: number;
  /** Whether to merge vertices at the ends */
  mergeEnds?: boolean;
}

/**
 * Result of edge bridge operation
 */
export interface BridgeEdgesResult {
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
 * Bridge two edges by creating faces between them
 */
export function bridgeEdges(
  edge1: Edge,
  edge2: Edge,
  vertices: Vertex[],
  options: BridgeEdgesOptions = {}
): BridgeEdgesResult {
  const segments = options.segments ?? 1;
  const materialIndex = options.materialIndex ?? 0;
  const twist = options.twist ?? 0;
  const mergeEnds = options.mergeEnds ?? false;

  const v1a = vertices[edge1.v1];
  const v1b = vertices[edge1.v2];
  const v2a = vertices[edge2.v1];
  const v2b = vertices[edge2.v2];

  if (!v1a || !v1b || !v2a || !v2b) {
    throw new Error(`Invalid vertex indices in edges`);
  }

  // Create bridge vertices
  const newVertices: Vertex[] = [];
  const newVertexIndices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    
    // Interpolate between edge vertices
    const pos1 = new Vector3(
      v1a.x + (v1b.x - v1a.x) * t,
      v1a.y + (v1b.y - v1a.y) * t,
      v1a.z + (v1b.z - v1a.z) * t
    );

    const pos2 = new Vector3(
      v2a.x + (v2b.x - v2a.x) * t,
      v2a.y + (v2b.y - v2a.y) * t,
      v2a.z + (v2b.z - v2a.z) * t
    );

    // Apply twist
    const twistAngle = (twist * t * Math.PI * 2) / segments;
    const center = new Vector3(
      (pos1.x + pos2.x) * 0.5,
      (pos1.y + pos2.y) * 0.5,
      (pos1.z + pos2.z) * 0.5
    );

    const radius = pos1.distanceTo(pos2) * 0.5;
    const offset = new Vector3(
      Math.cos(twistAngle) * radius,
      Math.sin(twistAngle) * radius,
      0
    );

    const bridgePos = new Vector3(
      center.x + offset.x,
      center.y + offset.y,
      center.z + offset.z
    );

    const newVertex = createVertex(
      bridgePos.x,
      bridgePos.y,
      bridgePos.z,
      {
        userData: { type: 'bridge_vertex', segment: i }
      }
    );

    newVertices.push(newVertex);
    newVertexIndices.push(vertices.length + newVertices.length - 1);
  }

  // Create edges along the bridge
  const newEdges: Edge[] = [];
  const newEdgeIndices: number[] = [];

  for (let i = 0; i < newVertexIndices.length - 1; i++) {
    const newEdge = createEdge(newVertexIndices[i], newVertexIndices[i + 1]);
    newEdges.push(newEdge);
    newEdgeIndices.push(vertices.length + newVertices.length + newEdges.length - 1);
  }

  // Create faces between segments
  const newFaces: Face[] = [];
  const newFaceIndices: number[] = [];

  for (let i = 0; i < segments; i++) {
    const v1 = newVertexIndices[i];
    const v2 = newVertexIndices[i + 1];
    const v3 = newVertexIndices[i + 1];
    const v4 = newVertexIndices[i];

    const newFace = createFace(
      [v1, v2, v3, v4],
      [],
      {
        materialIndex,
        userData: { type: 'bridge_face', segment: i }
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
 * Options for bridging faces
 */
export interface BridgeFacesOptions {
  /** Number of segments for the bridge */
  segments?: number;
  /** Material index for new faces */
  materialIndex?: number;
  /** Whether to twist the bridge */
  twist?: number;
  /** Whether to merge vertices at the ends */
  mergeEnds?: boolean;
}

/**
 * Result of face bridge operation
 */
export interface BridgeFacesResult {
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
 * Bridge two faces by creating faces between corresponding vertices
 */
export function bridgeFaces(
  face1: Face,
  face2: Face,
  vertices: Vertex[],
  options: BridgeFacesOptions = {}
): BridgeFacesResult {
  const segments = options.segments ?? 1;
  const materialIndex = options.materialIndex ?? 0;
  const twist = options.twist ?? 0;

  const face1Vertices = getFaceVertices(face1, vertices);
  const face2Vertices = getFaceVertices(face2, vertices);

  if (face1Vertices.length !== face2Vertices.length) {
    throw new Error(`Cannot bridge faces with different vertex counts: ${face1Vertices.length} vs ${face2Vertices.length}`);
  }

  const vertexCount = face1Vertices.length;

  // Create bridge vertices for each segment
  const newVertices: Vertex[] = [];
  const newVertexIndices: number[] = [];

  for (let seg = 0; seg <= segments; seg++) {
    const t = seg / segments;
    
    for (let i = 0; i < vertexCount; i++) {
      const v1 = face1Vertices[i];
      const v2 = face2Vertices[(i + Math.floor(twist * vertexCount)) % vertexCount];

      // Interpolate between corresponding vertices
      const position = new Vector3(
        v1.x + (v2.x - v1.x) * t,
        v1.y + (v2.y - v1.y) * t,
        v1.z + (v2.z - v1.z) * t
      );

      const newVertex = createVertex(
        position.x,
        position.y,
        position.z,
        {
          normal: v1.normal?.clone(),
          uv: v1.uv,
          color: v1.color?.clone(),
          userData: { type: 'bridge_vertex', segment: seg, vertex: i }
        }
      );

      newVertices.push(newVertex);
      newVertexIndices.push(vertices.length + newVertices.length - 1);
    }
  }

  // Create edges
  const newEdges: Edge[] = [];
  const newEdgeIndices: number[] = [];

  // Horizontal edges (around each ring)
  for (let seg = 0; seg <= segments; seg++) {
    for (let i = 0; i < vertexCount; i++) {
      const v1Index = newVertexIndices[seg * vertexCount + i];
      const v2Index = newVertexIndices[seg * vertexCount + ((i + 1) % vertexCount)];
      
      const newEdge = createEdge(v1Index, v2Index);
      newEdges.push(newEdge);
      newEdgeIndices.push(vertices.length + newVertices.length + newEdges.length - 1);
    }
  }

  // Vertical edges (between rings)
  for (let seg = 0; seg < segments; seg++) {
    for (let i = 0; i < vertexCount; i++) {
      const v1Index = newVertexIndices[seg * vertexCount + i];
      const v2Index = newVertexIndices[(seg + 1) * vertexCount + i];
      
      const newEdge = createEdge(v1Index, v2Index);
      newEdges.push(newEdge);
      newEdgeIndices.push(vertices.length + newVertices.length + newEdges.length - 1);
    }
  }

  // Create faces
  const newFaces: Face[] = [];
  const newFaceIndices: number[] = [];

  for (let seg = 0; seg < segments; seg++) {
    for (let i = 0; i < vertexCount; i++) {
      const v1 = newVertexIndices[seg * vertexCount + i];
      const v2 = newVertexIndices[seg * vertexCount + ((i + 1) % vertexCount)];
      const v3 = newVertexIndices[(seg + 1) * vertexCount + ((i + 1) % vertexCount)];
      const v4 = newVertexIndices[(seg + 1) * vertexCount + i];

      const newFace = createFace(
        [v1, v2, v3, v4],
        [],
        {
          materialIndex,
          userData: { type: 'bridge_face', segment: seg, vertex: i }
        }
      );

      newFaces.push(newFace);
      newFaceIndices.push(vertices.length + newVertices.length + newEdges.length + newFaces.length - 1);
    }
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
 * Options for bridging loops of vertices
 */
export interface BridgeLoopsOptions {
  /** Number of segments for the bridge */
  segments?: number;
  /** Material index for new faces */
  materialIndex?: number;
  /** Whether to twist the bridge */
  twist?: number;
  /** Whether to merge vertices at the ends */
  mergeEnds?: boolean;
}

/**
 * Result of loop bridge operation
 */
export interface BridgeLoopsResult {
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
 * Bridge two loops of vertices
 */
export function bridgeLoops(
  loop1: Vertex[],
  loop2: Vertex[],
  options: BridgeLoopsOptions = {}
): BridgeLoopsResult {
  const segments = options.segments ?? 1;
  const materialIndex = options.materialIndex ?? 0;
  const twist = options.twist ?? 0;

  if (loop1.length !== loop2.length) {
    throw new Error(`Cannot bridge loops with different vertex counts: ${loop1.length} vs ${loop2.length}`);
  }

  const vertexCount = loop1.length;

  // Create bridge vertices for each segment
  const newVertices: Vertex[] = [];
  const newVertexIndices: number[] = [];

  for (let seg = 0; seg <= segments; seg++) {
    const t = seg / segments;
    
    for (let i = 0; i < vertexCount; i++) {
      const v1 = loop1[i];
      const v2 = loop2[(i + Math.floor(twist * vertexCount)) % vertexCount];

      // Interpolate between corresponding vertices
      const position = new Vector3(
        v1.x + (v2.x - v1.x) * t,
        v1.y + (v2.y - v1.y) * t,
        v1.z + (v2.z - v1.z) * t
      );

      const newVertex = createVertex(
        position.x,
        position.y,
        position.z,
        {
          normal: v1.normal?.clone(),
          uv: v1.uv,
          color: v1.color?.clone(),
          userData: { type: 'bridge_vertex', segment: seg, vertex: i }
        }
      );

      newVertices.push(newVertex);
      newVertexIndices.push(newVertices.length - 1);
    }
  }

  // Create edges
  const newEdges: Edge[] = [];
  const newEdgeIndices: number[] = [];

  // Horizontal edges (around each ring)
  for (let seg = 0; seg <= segments; seg++) {
    for (let i = 0; i < vertexCount; i++) {
      const v1Index = newVertexIndices[seg * vertexCount + i];
      const v2Index = newVertexIndices[seg * vertexCount + ((i + 1) % vertexCount)];
      
      const newEdge = createEdge(v1Index, v2Index);
      newEdges.push(newEdge);
      newEdgeIndices.push(newEdges.length - 1);
    }
  }

  // Vertical edges (between rings)
  for (let seg = 0; seg < segments; seg++) {
    for (let i = 0; i < vertexCount; i++) {
      const v1Index = newVertexIndices[seg * vertexCount + i];
      const v2Index = newVertexIndices[(seg + 1) * vertexCount + i];
      
      const newEdge = createEdge(v1Index, v2Index);
      newEdges.push(newEdge);
      newEdgeIndices.push(newEdges.length - 1);
    }
  }

  // Create faces
  const newFaces: Face[] = [];
  const newFaceIndices: number[] = [];

  for (let seg = 0; seg < segments; seg++) {
    for (let i = 0; i < vertexCount; i++) {
      const v1 = newVertexIndices[seg * vertexCount + i];
      const v2 = newVertexIndices[seg * vertexCount + ((i + 1) % vertexCount)];
      const v3 = newVertexIndices[(seg + 1) * vertexCount + ((i + 1) % vertexCount)];
      const v4 = newVertexIndices[(seg + 1) * vertexCount + i];

      const newFace = createFace(
        [v1, v2, v3, v4],
        [],
        {
          materialIndex,
          userData: { type: 'bridge_face', segment: seg, vertex: i }
        }
      );

      newFaces.push(newFace);
      newFaceIndices.push(newFaces.length - 1);
    }
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