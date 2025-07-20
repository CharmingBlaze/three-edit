import { Vector3 } from 'three';
import { EditableMesh, Vertex, Face } from '../../core/index.ts';
import { SimplificationOptions, EdgeCollapse } from './types';

/**
 * Find the best edge to collapse
 */
export function findBestEdgeCollapse(
  mesh: EditableMesh,
  options: SimplificationOptions
): EdgeCollapse | null {
  const edges = getMeshEdges(mesh);
  const edgeCollapses: EdgeCollapse[] = [];

  for (const edge of edges) {
    const collapse = calculateEdgeCollapse(mesh, edge, options);
    if (collapse) {
      edgeCollapses.push(collapse);
    }
  }

  if (edgeCollapses.length === 0) return null;

  // Sort by cost (lowest first)
  edgeCollapses.sort((a, b) => a.cost - b.cost);
  return edgeCollapses[0];
}

/**
 * Calculate edge collapse information
 */
export function calculateEdgeCollapse(
  mesh: EditableMesh,
  edge: { v1: number; v2: number },
  options: SimplificationOptions
): EdgeCollapse | null {
  const v1 = mesh.vertices[edge.v1];
  const v2 = mesh.vertices[edge.v2];

  // Find faces connected to this edge
  const connectedFaces = getConnectedFaces(mesh, edge);
  
  if (connectedFaces.length === 0) return null;

  // Check boundary preservation
  if (options.preserveBoundaries && isBoundaryEdge(mesh, edge)) {
    return null;
  }

  // Calculate optimal position for collapsed vertex
  const newPosition = calculateOptimalPosition(v1, v2, connectedFaces);
  
  // Calculate collapse cost
  const cost = calculateCollapseCost(mesh, edge, newPosition, connectedFaces, options);
  
  return {
    edge,
    cost,
    newPosition,
    affectedFaces: connectedFaces
  };
}

/**
 * Get all edges from mesh
 */
export function getMeshEdges(mesh: EditableMesh): Array<{ v1: number; v2: number }> {
  const edges = new Set<string>();
  const edgeList: Array<{ v1: number; v2: number }> = [];

  mesh.faces.forEach(face => {
    for (let i = 0; i < face.vertices.length; i++) {
      const v1 = face.vertices[i];
      const v2 = face.vertices[(i + 1) % face.vertices.length];
      
      const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      
      if (!edges.has(edgeKey)) {
        edges.add(edgeKey);
        edgeList.push({ v1: Math.min(v1, v2), v2: Math.max(v1, v2) });
      }
    }
  });

  return edgeList;
}

/**
 * Get faces connected to an edge
 */
export function getConnectedFaces(mesh: EditableMesh, edge: { v1: number; v2: number }): Face[] {
  return mesh.faces.filter(face => {
    const vertices = face.vertices;
    return (
      (vertices.includes(edge.v1) && vertices.includes(edge.v2)) ||
      (vertices.includes(edge.v2) && vertices.includes(edge.v1))
    );
  });
}

/**
 * Check if edge is on boundary
 */
export function isBoundaryEdge(mesh: EditableMesh, edge: { v1: number; v2: number }): boolean {
  const connectedFaces = getConnectedFaces(mesh, edge);
  return connectedFaces.length === 1;
}

/**
 * Calculate optimal position for collapsed vertex
 */
export function calculateOptimalPosition(
  v1: Vertex,
  v2: Vertex,
  connectedFaces: Face[]
): Vector3 {
  // Use midpoint as default
  const midpoint = new Vector3();
  midpoint.addVectors(
    new Vector3(v1.x, v1.y, v1.z),
    new Vector3(v2.x, v2.y, v2.z)
  );
  midpoint.multiplyScalar(0.5);
  
  return midpoint;
}

/**
 * Calculate collapse cost based on various factors
 */
export function calculateCollapseCost(
  mesh: EditableMesh,
  edge: { v1: number; v2: number },
  newPosition: Vector3,
  connectedFaces: Face[],
  options: SimplificationOptions
): number {
  let cost = 0;
  
  // Distance cost
  const v1 = mesh.vertices[edge.v1];
  const v2 = mesh.vertices[edge.v2];
  const distance = new Vector3(v1.x, v1.y, v1.z).distanceTo(new Vector3(v2.x, v2.y, v2.z));
  cost += distance;
  
  // Curvature cost
  if (options.preserveNormals) {
    cost += calculateCurvatureCost(connectedFaces);
  }
  
  // UV distortion cost
  if (options.preserveUVs) {
    cost += calculateUVDistortionCost(mesh, edge);
  }
  
  return cost;
}

/**
 * Calculate curvature cost for normal preservation
 */
export function calculateCurvatureCost(faces: Face[]): number {
  if (faces.length < 2) return 0;
  
  // Calculate average normal of connected faces
  const averageNormal = new Vector3();
  faces.forEach(face => {
    if (face.normal) {
      averageNormal.add(face.normal);
    }
  });
  averageNormal.normalize();
  
  // Calculate variance in normals
  let variance = 0;
  faces.forEach(face => {
    if (face.normal) {
      const dot = face.normal.dot(averageNormal);
      variance += (1 - dot) * (1 - dot);
    }
  });
  
  return variance / faces.length;
}

/**
 * Calculate UV distortion cost
 */
export function calculateUVDistortionCost(mesh: EditableMesh, edge: { v1: number; v2: number }): number {
  const v1 = mesh.vertices[edge.v1];
  const v2 = mesh.vertices[edge.v2];
  
  if (!v1.uv || !v2.uv) return 0;
  
  // Calculate UV distance
  const uvDistance = Math.sqrt(
    Math.pow(v1.uv!.u - v2.uv!.u, 2) + Math.pow(v1.uv!.v - v2.uv!.v, 2)
  );
  
  return uvDistance;
} 