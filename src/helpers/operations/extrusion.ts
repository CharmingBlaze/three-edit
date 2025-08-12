/**
 * Extrusion operation helpers
 * Pure, composable functions for extrusion operations
 */

import { Vector3 } from 'three';
import { Vertex } from '../../core/Vertex';
import { Edge } from '../../core/Edge';
import { Face } from '../../core/Face';
import { createVertex, getVertexPosition, setVertexPosition } from '../core/vertex';
import { createEdge } from '../core/edge';
import { createFace, getFaceVertices, calculateFaceCentroid, calculateFaceNormal } from '../core/face';

/**
 * Options for extruding a face
 */
export interface ExtrudeFaceOptions {
  /** Distance to extrude along the face normal */
  distance?: number;
  /** Custom direction for extrusion (overrides face normal) */
  direction?: Vector3;
  /** Scale factor for the extruded face */
  scale?: number | { x: number; y: number };
  /** Whether to keep the original face */
  keepOriginal?: boolean;
  /** Material index for new faces */
  materialIndex?: number;
}

/**
 * Result of face extrusion operation
 */
export interface ExtrudeFaceResult {
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
 * Extrude a face along its normal or custom direction
 */
export function extrudeFace(
  face: Face,
  vertices: Vertex[],
  options: ExtrudeFaceOptions = {}
): ExtrudeFaceResult {
  const distance = options.distance ?? 1;
  const scale = options.scale ?? 1;
  const keepOriginal = options.keepOriginal ?? false;
  const materialIndex = options.materialIndex ?? face.materialIndex;

  // Get face vertices and calculate properties
  const faceVertices = getFaceVertices(face, vertices);
  const faceNormal = options.direction?.normalize() ?? calculateFaceNormal(face, vertices);
  const faceCenter = calculateFaceCentroid(face, vertices);

  // Create extruded vertices
  const newVertices: Vertex[] = [];
  const newVertexIndices: number[] = [];
  const vertexCount = face.vertices.length;

  for (let i = 0; i < vertexCount; i++) {
    const originalVertex = faceVertices[i];
    const originalVertexIndex = face.vertices[i];

    // Create new vertex at extruded position
    const extrudedPosition = new Vector3(
      originalVertex.x + faceNormal.x * distance,
      originalVertex.y + faceNormal.y * distance,
      originalVertex.z + faceNormal.z * distance
    );

    // Apply scaling if specified
    if (scale !== 1) {
      const relativePos = new Vector3(
        extrudedPosition.x - faceCenter.x,
        extrudedPosition.y - faceCenter.y,
        extrudedPosition.z - faceCenter.z
      );

      if (typeof scale === 'number') {
        relativePos.multiplyScalar(scale);
      } else {
        relativePos.x *= scale.x;
        relativePos.y *= scale.y;
      }

      extrudedPosition.set(
        faceCenter.x + relativePos.x,
        faceCenter.y + relativePos.y,
        faceCenter.z + relativePos.z
      );
    }

    const newVertex = createVertex(
      extrudedPosition.x,
      extrudedPosition.y,
      extrudedPosition.z,
      {
        normal: originalVertex.normal?.clone(),
        uv: originalVertex.uv,
        color: originalVertex.color?.clone(),
        userData: { ...originalVertex.userData }
      }
    );

    newVertices.push(newVertex);
    newVertexIndices.push(vertices.length + newVertices.length - 1);
  }

  // Create new edges connecting original and extruded vertices
  const newEdges: Edge[] = [];
  const newEdgeIndices: number[] = [];

  for (let i = 0; i < vertexCount; i++) {
    const originalVertexIndex = face.vertices[i];
    const extrudedVertexIndex = newVertexIndices[i];
    
    const newEdge = createEdge(originalVertexIndex, extrudedVertexIndex);
    newEdges.push(newEdge);
    newEdgeIndices.push(vertices.length + newVertices.length + newEdges.length - 1);
  }

  // Create side faces (connecting original and extruded vertices)
  const newFaces: Face[] = [];
  const newFaceIndices: number[] = [];

  for (let i = 0; i < vertexCount; i++) {
    const v1 = face.vertices[i];
    const v2 = face.vertices[(i + 1) % vertexCount];
    const v3 = newVertexIndices[(i + 1) % vertexCount];
    const v4 = newVertexIndices[i];

    const sideFace = createFace(
      [v1, v2, v3, v4],
      [],
      {
        materialIndex,
        userData: { ...face.userData, type: 'extruded_side' }
      }
    );

    newFaces.push(sideFace);
    newFaceIndices.push(vertices.length + newVertices.length + newEdges.length + newFaces.length - 1);
  }

  // Create extruded face (reversed winding)
  const extrudedFace = createFace(
    [...newVertexIndices].reverse(),
    [],
    {
      faceVertexUvs: face.faceVertexUvs ? [...face.faceVertexUvs].reverse() : undefined,
      materialIndex,
      normal: faceNormal.clone().negate(),
      userData: { ...face.userData, type: 'extruded_face' }
    }
  );

  newFaces.push(extrudedFace);
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

/**
 * Options for extruding an edge
 */
export interface ExtrudeEdgeOptions {
  /** Distance to extrude */
  distance?: number;
  /** Direction to extrude (if not specified, uses edge direction) */
  direction?: Vector3;
  /** Whether to keep the original edge */
  keepOriginal?: boolean;
  /** Material index for new faces */
  materialIndex?: number;
}

/**
 * Result of edge extrusion operation
 */
export interface ExtrudeEdgeResult {
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
 * Extrude an edge along its direction or custom direction
 */
export function extrudeEdge(
  edge: Edge,
  vertices: Vertex[],
  options: ExtrudeEdgeOptions = {}
): ExtrudeEdgeResult {
  const distance = options.distance ?? 1;
  const materialIndex = options.materialIndex ?? 0;

  const v1 = vertices[edge.v1];
  const v2 = vertices[edge.v2];

  if (!v1 || !v2) {
    throw new Error(`Invalid vertex indices in edge: ${edge.v1}, ${edge.v2}`);
  }

  // Calculate extrusion direction
  let direction: Vector3;
  if (options.direction) {
    direction = options.direction.normalize();
  } else {
    direction = new Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z).normalize();
  }

  // Create extruded vertices
  const newV1 = createVertex(
    v1.x + direction.x * distance,
    v1.y + direction.y * distance,
    v1.z + direction.z * distance,
    {
      normal: v1.normal?.clone(),
      uv: v1.uv,
      color: v1.color?.clone(),
      userData: { ...v1.userData }
    }
  );

  const newV2 = createVertex(
    v2.x + direction.x * distance,
    v2.y + direction.y * distance,
    v2.z + direction.z * distance,
    {
      normal: v2.normal?.clone(),
      uv: v2.uv,
      color: v2.color?.clone(),
      userData: { ...v2.userData }
    }
  );

  const newVertices = [newV1, newV2];
  const newVertexIndices = [
    vertices.length,
    vertices.length + 1
  ];

  // Create new edges
  const newEdge1 = createEdge(edge.v1, newVertexIndices[0]);
  const newEdge2 = createEdge(edge.v2, newVertexIndices[1]);
  const newEdge3 = createEdge(newVertexIndices[0], newVertexIndices[1]);

  const newEdges = [newEdge1, newEdge2, newEdge3];
  const newEdgeIndices = [
    vertices.length + newVertices.length,
    vertices.length + newVertices.length + 1,
    vertices.length + newVertices.length + 2
  ];

  // Create new face
  const newFace = createFace(
    [edge.v1, edge.v2, newVertexIndices[1], newVertexIndices[0]],
    [],
    {
      materialIndex,
      userData: { type: 'extruded_edge_face' }
    }
  );

  const newFaces = [newFace];
  const newFaceIndices = [vertices.length + newVertices.length + newEdges.length];

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
 * Options for extruding a vertex
 */
export interface ExtrudeVertexOptions {
  /** Distance to extrude */
  distance?: number;
  /** Direction to extrude (if not specified, uses average normal) */
  direction?: Vector3;
  /** Whether to create edges to connected vertices */
  createEdges?: boolean;
  /** Whether to keep the original vertex */
  keepOriginal?: boolean;
  /** Material index for new faces */
  materialIndex?: number;
}

/**
 * Result of vertex extrusion operation
 */
export interface ExtrudeVertexResult {
  /** New vertex created */
  newVertex: Vertex;
  /** New edges created */
  newEdges: Edge[];
  /** New faces created */
  newFaces: Face[];
  /** Index of new vertex in the original vertex array */
  newVertexIndex: number;
  /** Indices of new edges in the original edge array */
  newEdgeIndices: number[];
  /** Indices of new faces in the original face array */
  newFaceIndices: number[];
}

/**
 * Extrude a vertex along a direction
 */
export function extrudeVertex(
  vertex: Vertex,
  vertexIndex: number,
  connectedVertices: Vertex[],
  options: ExtrudeVertexOptions = {}
): ExtrudeVertexResult {
  const distance = options.distance ?? 1;
  const createEdges = options.createEdges ?? true;
  const materialIndex = options.materialIndex ?? 0;

  // Calculate extrusion direction
  let direction: Vector3;
  if (options.direction) {
    direction = options.direction.normalize();
  } else if (vertex.normal) {
    direction = vertex.normal.clone().normalize();
  } else {
    // Calculate average direction to connected vertices
    if (connectedVertices.length > 0) {
      const avgDirection = new Vector3(0, 0, 0);
      for (const connectedVertex of connectedVertices) {
        avgDirection.add(new Vector3(
          connectedVertex.x - vertex.x,
          connectedVertex.y - vertex.y,
          connectedVertex.z - vertex.z
        ));
      }
      direction = avgDirection.normalize();
    } else {
      direction = new Vector3(0, 1, 0); // Default up direction
    }
  }

  // Create extruded vertex
  const newVertex = createVertex(
    vertex.x + direction.x * distance,
    vertex.y + direction.y * distance,
    vertex.z + direction.z * distance,
    {
      normal: vertex.normal?.clone(),
      uv: vertex.uv,
      color: vertex.color?.clone(),
      userData: { ...vertex.userData }
    }
  );

  const newVertexIndex = vertexIndex + 1; // Assuming this is the next available index

  // Create edges to connected vertices if requested
  const newEdges: Edge[] = [];
  const newEdgeIndices: number[] = [];

  if (createEdges) {
    for (let i = 0; i < connectedVertices.length; i++) {
      const connectedVertexIndex = vertexIndex + 2 + i; // Assuming these are the next available indices
      const newEdge = createEdge(newVertexIndex, connectedVertexIndex);
      newEdges.push(newEdge);
      newEdgeIndices.push(vertexIndex + 2 + connectedVertices.length + i);
    }
  }

  // Create faces if we have enough connected vertices
  const newFaces: Face[] = [];
  const newFaceIndices: number[] = [];

  if (connectedVertices.length >= 2) {
    for (let i = 0; i < connectedVertices.length; i++) {
      const v1 = vertexIndex;
      const v2 = vertexIndex + 2 + i;
      const v3 = vertexIndex + 2 + ((i + 1) % connectedVertices.length);
      const v4 = newVertexIndex;

      const newFace = createFace(
        [v1, v2, v3, v4],
        [],
        {
          materialIndex,
          userData: { type: 'extruded_vertex_face' }
        }
      );

      newFaces.push(newFace);
      newFaceIndices.push(vertexIndex + 2 + connectedVertices.length + newEdges.length + i);
    }
  }

  return {
    newVertex,
    newEdges,
    newFaces,
    newVertexIndex,
    newEdgeIndices,
    newFaceIndices
  };
} 