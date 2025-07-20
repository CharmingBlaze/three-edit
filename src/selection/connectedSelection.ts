import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from './Selection';
import { ConnectedSelectionOptions } from './types';

/**
 * Select connected elements
 */
export function selectConnected(
  mesh: EditableMesh,
  currentSelection: Selection,
  options: ConnectedSelectionOptions = {}
): Selection {
  const selectFaces = options.selectFaces ?? true;
  const selectVertices = options.selectVertices ?? true;
  const selectEdges = options.selectEdges ?? true;
  const maxDepth = options.maxDepth ?? 1;

  const newSelection = new Selection();

  if (selectFaces && currentSelection.faces.size > 0) {
    const connectedFaces = findConnectedFaces(mesh, Array.from(currentSelection.faces), maxDepth);
    newSelection.addFaces(connectedFaces);
  }

  if (selectVertices && currentSelection.vertices.size > 0) {
    const connectedVertices = findConnectedVertices(mesh, Array.from(currentSelection.vertices), maxDepth);
    newSelection.addVertices(connectedVertices);
  }

  if (selectEdges && currentSelection.edges.size > 0) {
    const connectedEdges = findConnectedEdges(mesh, Array.from(currentSelection.edges), maxDepth);
    newSelection.addEdges(connectedEdges);
  }

  return newSelection;
}

/**
 * Find connected faces
 */
function findConnectedFaces(mesh: EditableMesh, faceIndices: number[], maxDepth: number): number[] {
  const connectedFaces = new Set<number>();
  const visited = new Set<number>();

  for (const faceIndex of faceIndices) {
    findConnectedFacesRecursive(mesh, faceIndex, connectedFaces, visited, maxDepth, 0);
  }

  return Array.from(connectedFaces);
}

/**
 * Recursively find connected faces
 */
function findConnectedFacesRecursive(
  mesh: EditableMesh,
  faceIndex: number,
  connectedFaces: Set<number>,
  visited: Set<number>,
  maxDepth: number,
  currentDepth: number
): void {
  if (visited.has(faceIndex) || currentDepth > maxDepth) {
    return;
  }

  visited.add(faceIndex);
  connectedFaces.add(faceIndex);

  if (currentDepth >= maxDepth) {
    return;
  }

  const face = mesh.faces[faceIndex];
  if (!face) return;

  // Find faces that share edges with this face
  for (const edgeIndex of face.edges || []) {
    const edge = mesh.edges[edgeIndex];
    if (!edge) continue;

    // Find faces that share this edge
    for (let i = 0; i < mesh.faces.length; i++) {
      if (i === faceIndex) continue;
      
      const otherFace = mesh.faces[i];
      if (otherFace.edges && otherFace.edges.includes(edgeIndex)) {
        findConnectedFacesRecursive(mesh, i, connectedFaces, visited, maxDepth, currentDepth + 1);
      }
    }
  }
}

/**
 * Find connected vertices
 */
function findConnectedVertices(mesh: EditableMesh, vertexIndices: number[], maxDepth: number): number[] {
  const connectedVertices = new Set<number>();
  const visited = new Set<number>();

  for (const vertexIndex of vertexIndices) {
    findConnectedVerticesRecursive(mesh, vertexIndex, connectedVertices, visited, maxDepth, 0);
  }

  return Array.from(connectedVertices);
}

/**
 * Recursively find connected vertices
 */
function findConnectedVerticesRecursive(
  mesh: EditableMesh,
  vertexIndex: number,
  connectedVertices: Set<number>,
  visited: Set<number>,
  maxDepth: number,
  currentDepth: number
): void {
  if (visited.has(vertexIndex) || currentDepth > maxDepth) {
    return;
  }

  visited.add(vertexIndex);
  connectedVertices.add(vertexIndex);

  if (currentDepth >= maxDepth) {
    return;
  }

  // Find edges connected to this vertex
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    if (edge.v1 === vertexIndex || edge.v2 === vertexIndex) {
      const connectedVertexIndex = edge.v1 === vertexIndex ? edge.v2 : edge.v1;
      findConnectedVerticesRecursive(mesh, connectedVertexIndex, connectedVertices, visited, maxDepth, currentDepth + 1);
    }
  }
}

/**
 * Find connected edges
 */
function findConnectedEdges(mesh: EditableMesh, edgeIndices: number[], maxDepth: number): number[] {
  const connectedEdges = new Set<number>();
  const visited = new Set<number>();

  for (const edgeIndex of edgeIndices) {
    findConnectedEdgesRecursive(mesh, edgeIndex, connectedEdges, visited, maxDepth, 0);
  }

  return Array.from(connectedEdges);
}

/**
 * Recursively find connected edges
 */
function findConnectedEdgesRecursive(
  mesh: EditableMesh,
  edgeIndex: number,
  connectedEdges: Set<number>,
  visited: Set<number>,
  maxDepth: number,
  currentDepth: number
): void {
  if (visited.has(edgeIndex) || currentDepth > maxDepth) {
    return;
  }

  visited.add(edgeIndex);
  connectedEdges.add(edgeIndex);

  if (currentDepth >= maxDepth) {
    return;
  }

  const edge = mesh.edges[edgeIndex];
  if (!edge) return;

  // Find edges that share vertices with this edge
  for (let i = 0; i < mesh.edges.length; i++) {
    if (i === edgeIndex) continue;
    
    const otherEdge = mesh.edges[i];
    if (otherEdge.v1 === edge.v1 || otherEdge.v1 === edge.v2 || 
        otherEdge.v2 === edge.v1 || otherEdge.v2 === edge.v2) {
      findConnectedEdgesRecursive(mesh, i, connectedEdges, visited, maxDepth, currentDepth + 1);
    }
  }
} 