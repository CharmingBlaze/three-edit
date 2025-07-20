import { Vector3 } from 'three';
import { EditableMesh, Vertex, Face } from '../../core/index.ts';
import { LODOptions } from './types';

/**
 * Calculate face normal
 */
export function calculateFaceNormal(mesh: EditableMesh, face: Face): Vector3 | undefined {
  if (face.vertices.length < 3) return undefined;

  const v0 = mesh.vertices[face.vertices[0]];
  const v1 = mesh.vertices[face.vertices[1]];
  const v2 = mesh.vertices[face.vertices[2]];

  if (!v0 || !v1 || !v2) return undefined;

  const edge1 = new Vector3().subVectors(
    new Vector3(v1.x, v1.y, v1.z),
    new Vector3(v0.x, v0.y, v0.z)
  );
  const edge2 = new Vector3().subVectors(
    new Vector3(v2.x, v2.y, v2.z),
    new Vector3(v0.x, v0.y, v0.z)
  );

  const normal = new Vector3().crossVectors(edge1, edge2).normalize();
  return normal;
}

/**
 * Calculate edge length
 */
export function calculateEdgeLength(
  mesh: EditableMesh,
  edge: { v1: number; v2: number }
): number {
  const v1 = mesh.getVertex(edge.v1);
  const v2 = mesh.getVertex(edge.v2);

  if (!v1 || !v2) {
    return 0;
  }

  return new Vector3(v1.x, v1.y, v1.z).distanceTo(
    new Vector3(v2.x, v2.y, v2.z)
  );
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
 * Calculate costs for edge collapse
 */
export function calculateEdgeCosts(
  mesh: EditableMesh,
  edges: Array<{ v1: number; v2: number }>
): number[] {
  return edges.map(edge => {
    
    // Calculate edge length
    const length = calculateEdgeLength(mesh, edge);
    
    // Calculate curvature cost
    const curvatureCost = calculateCurvatureCost(mesh, edge);
    
    // Calculate boundary cost
    const boundaryCost = calculateBoundaryCost(mesh, edge);
    
    return length * (1 + curvatureCost + boundaryCost);
  });
}

/**
 * Calculate curvature cost for edge collapse
 */
export function calculateCurvatureCost(
  mesh: EditableMesh,
  edge: { v1: number; v2: number }
): number {

  // Find faces connected to this edge
  const connectedFaces = mesh.faces.filter(face => {
    const vertices = face.vertices;
    return (
      (vertices.includes(edge.v1) && vertices.includes(edge.v2)) ||
      (vertices.includes(edge.v2) && vertices.includes(edge.v1))
    );
  });

  if (connectedFaces.length < 2) return 0;

  // Calculate normal difference between connected faces
  let totalCurvature = 0;
  for (let i = 0; i < connectedFaces.length; i++) {
    for (let j = i + 1; j < connectedFaces.length; j++) {
      const normal1 = calculateFaceNormal(mesh, connectedFaces[i]);
      const normal2 = calculateFaceNormal(mesh, connectedFaces[j]);
      if (normal1 && normal2) {
        const dotProduct = normal1.dot(normal2);
        totalCurvature += 1 - Math.abs(dotProduct);
      }
    }
  }
  
  return totalCurvature / (connectedFaces.length * (connectedFaces.length - 1) / 2);
}

/**
 * Calculate boundary cost for edge collapse
 */
export function calculateBoundaryCost(
  mesh: EditableMesh,
  edge: { v1: number; v2: number }
): number {
  // Find faces connected to this edge
  const connectedFaces = mesh.faces.filter(face => {
    const vertices = face.vertices;
    return (
      (vertices.includes(edge.v1) && vertices.includes(edge.v2)) ||
      (vertices.includes(edge.v2) && vertices.includes(edge.v1))
    );
  });

  // Boundary edges have only one connected face
  return connectedFaces.length === 1 ? 10 : 0;
}

/**
 * Collapse an edge in the mesh
 */
export function collapseEdge(mesh: EditableMesh, edge: { v1: number; v2: number }): void {
  const v1 = mesh.getVertex(edge.v1);
  const v2 = mesh.getVertex(edge.v2);
  
  if (!v1 || !v2) {
    return;
  }
  
  // Calculate new position (midpoint)
  const newPosition = new Vector3();
  newPosition.addVectors(
    new Vector3(v1.x, v1.y, v1.z),
    new Vector3(v2.x, v2.y, v2.z)
  );
  newPosition.multiplyScalar(0.5);
  
  // Update v1 position
  v1.x = newPosition.x;
  v1.y = newPosition.y;
  v1.z = newPosition.z;
  
  // Update faces to use v1 instead of v2
  mesh.faces.forEach(face => {
    face.vertices = face.vertices.map(vertexIndex => 
      vertexIndex === edge.v2 ? edge.v1 : vertexIndex
    );
  });
  
  // Remove degenerate faces
  mesh.faces = mesh.faces.filter(face => {
    const uniqueVertices = new Set(face.vertices);
    return uniqueVertices.size >= 3;
  });
}

/**
 * Clean up collapsed vertices
 */
export function cleanupCollapsedVertices(mesh: EditableMesh): void {
  // Remove vertices that are no longer referenced
  const usedVertices = new Set<number>();
  
  mesh.faces.forEach(face => {
    face.vertices.forEach(vertexIndex => {
      usedVertices.add(vertexIndex);
    });
  });

  // Remove unused vertices
  mesh.vertices = mesh.vertices.filter((_, index) => usedVertices.has(index));
  
  // Update vertex indices in faces
  const newIndices = new Map<number, number>();
  let newIndex = 0;
  
  mesh.vertices.forEach((_, oldIndex) => {
    if (usedVertices.has(oldIndex)) {
      newIndices.set(oldIndex, newIndex++);
    }
  });
  
  mesh.faces.forEach(face => {
    face.vertices = face.vertices.map(oldIndex => newIndices.get(oldIndex) ?? oldIndex);
  });
}

/**
 * Simplify mesh for LOD level
 */
export function simplifyMeshForLOD(
  mesh: EditableMesh,
  level: number,
  options: LODOptions
): EditableMesh {
  const simplifiedMesh = mesh.clone();
  const targetVertexCount = Math.floor(
    mesh.vertices.length * Math.pow(options.reductionFactor ?? 0.5, level)
  );

  // Edge collapse-based simplification
  const edges = getMeshEdges(mesh);
  const edgeCosts = calculateEdgeCosts(mesh, edges);
  
  // Sort edges by cost (lowest cost first)
  const sortedEdges = edges
    .map((edge, index) => ({ edge, cost: edgeCosts[index] }))
    .sort((a, b) => a.cost - b.cost);

  // Collapse edges until target vertex count is reached
  const collapsedVertices = new Set<Vertex>();
  let currentVertexCount = mesh.vertices.length;

  for (const { edge } of sortedEdges) {
    if (currentVertexCount <= targetVertexCount) break;
    
    const v1 = mesh.vertices[edge.v1];
    const v2 = mesh.vertices[edge.v2];
    
    if (!collapsedVertices.has(v1) && !collapsedVertices.has(v2)) {
      collapseEdge(simplifiedMesh, edge);
      collapsedVertices.add(v1);
      collapsedVertices.add(v2);
      currentVertexCount--;
    }
  }

  // Clean up collapsed vertices
  cleanupCollapsedVertices(simplifiedMesh);
  
  return simplifiedMesh;
}