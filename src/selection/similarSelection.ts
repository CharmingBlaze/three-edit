import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from './Selection.ts';
import { SimilarSelectionOptions } from './types.ts';

/**
 * Select similar elements
 */
export function selectSimilar(
  mesh: EditableMesh,
  currentSelection: Selection,
  options: SimilarSelectionOptions = {}
): Selection {
  const selectFaces = options.selectFaces ?? true;
  const selectVertices = options.selectVertices ?? true;
  const selectEdges = options.selectEdges ?? true;
  const similarityThreshold = options.similarityThreshold ?? 0.5; // Increased default threshold

  const newSelection = new Selection();

  if (selectFaces && currentSelection.faces.size > 0) {
    const similarFaces = findSimilarFaces(mesh, Array.from(currentSelection.faces), similarityThreshold);
    newSelection.addFaces(similarFaces);
  }

  if (selectVertices && currentSelection.vertices.size > 0) {
    const similarVertices = findSimilarVertices(mesh, Array.from(currentSelection.vertices), similarityThreshold);
    newSelection.addVertices(similarVertices);
  }

  if (selectEdges && currentSelection.edges.size > 0) {
    const similarEdges = findSimilarEdges(mesh, Array.from(currentSelection.edges), similarityThreshold);
    newSelection.addEdges(similarEdges);
  }

  return newSelection;
}

/**
 * Find similar faces
 */
function findSimilarFaces(mesh: EditableMesh, faceIndices: number[], threshold: number): number[] {
  const similarFaces: number[] = [];
  
  // Calculate properties of selected faces
  const selectedProperties = faceIndices.map(index => {
    const face = mesh.getFace(index);
    if (!face) return null;
    return {
      area: calculateFaceArea(mesh, face),
      normal: calculateFaceNormal(mesh, face),
      center: calculateFaceCenter(mesh, face)
    };
  }).filter(Boolean);

  // Find faces with similar properties
  for (let i = 0; i < mesh.faces.length; i++) {
    if (faceIndices.includes(i)) continue;
    
    const face = mesh.getFace(i);
    if (!face) continue;
    const area = calculateFaceArea(mesh, face);
    const normal = calculateFaceNormal(mesh, face);
    const center = calculateFaceCenter(mesh, face);

    // Check if this face is similar to any selected face
    for (const selectedProp of selectedProperties) {
      if (!selectedProp) continue;
      const areaDiff = Math.abs(area - selectedProp.area) / Math.max(area, selectedProp.area);
      const normalDiff = 1 - normal.dot(selectedProp.normal);
      const centerDiff = center.distanceTo(selectedProp.center);

      // More lenient similarity check - if any property is similar enough
      if (areaDiff <= threshold || normalDiff <= threshold || centerDiff <= threshold) {
        similarFaces.push(i);
        break;
      }
    }
  }

  return similarFaces;
}

/**
 * Find similar vertices
 */
function findSimilarVertices(mesh: EditableMesh, vertexIndices: number[], threshold: number): number[] {
  const similarVertices: number[] = [];
  
  // Calculate properties of selected vertices
  const selectedProperties = vertexIndices.map(index => {
    const vertex = mesh.getVertex(index);
    if (!vertex) return null;
    return {
      position: new Vector3(vertex.x, vertex.y, vertex.z),
      valence: calculateVertexValence(mesh, index)
    };
  }).filter(Boolean);

  // Find vertices with similar properties
  for (let i = 0; i < mesh.vertices.length; i++) {
    if (vertexIndices.includes(i)) continue;
    
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    const valence = calculateVertexValence(mesh, i);

    // Check if this vertex is similar to any selected vertex
    for (const selectedProp of selectedProperties) {
      if (!selectedProp) continue;
      const positionDiff = position.distanceTo(selectedProp.position);
      const valenceDiff = Math.abs(valence - selectedProp.valence);

      if (positionDiff <= threshold && valenceDiff <= 2) {
        similarVertices.push(i);
        break;
      }
    }
  }

  return similarVertices;
}

/**
 * Find similar edges
 */
function findSimilarEdges(mesh: EditableMesh, edgeIndices: number[], threshold: number): number[] {
  const similarEdges: number[] = [];
  
  // Calculate properties of selected edges
  const selectedProperties = edgeIndices.map(index => {
    const edge = mesh.getEdge(index);
    if (!edge) return null;
    const v1 = mesh.getVertex(edge.v1);
    const v2 = mesh.getVertex(edge.v2);
    
    if (!v1 || !v2) return null;
    
    return {
      length: new Vector3(v1.x, v1.y, v1.z).distanceTo(new Vector3(v2.x, v2.y, v2.z)),
      center: new Vector3().addVectors(
        new Vector3(v1.x, v1.y, v1.z),
        new Vector3(v2.x, v2.y, v2.z)
      ).multiplyScalar(0.5)
    };
  }).filter(Boolean);

  // Find edges with similar properties
  for (let i = 0; i < mesh.edges.length; i++) {
    if (edgeIndices.includes(i)) continue;
    
    const edge = mesh.getEdge(i);
    if (!edge) continue;
    const v1 = mesh.getVertex(edge.v1);
    const v2 = mesh.getVertex(edge.v2);
    
    if (!v1 || !v2) continue;
    
    const length = new Vector3(v1.x, v1.y, v1.z).distanceTo(new Vector3(v2.x, v2.y, v2.z));
    const center = new Vector3().addVectors(
      new Vector3(v1.x, v1.y, v1.z),
      new Vector3(v2.x, v2.y, v2.z)
    ).multiplyScalar(0.5);

    // Check if this edge is similar to any selected edge
    for (const selectedProp of selectedProperties) {
      if (!selectedProp) continue;
      const lengthDiff = Math.abs(length - selectedProp.length) / Math.max(length, selectedProp.length);
      const centerDiff = center.distanceTo(selectedProp.center);

      if (lengthDiff <= threshold && centerDiff <= threshold) {
        similarEdges.push(i);
        break;
      }
    }
  }

  return similarEdges;
}

/**
 * Calculate face area
 */
function calculateFaceArea(mesh: EditableMesh, face: any): number {
  if (face.vertices.length < 3) return 0;
  
  const v1 = mesh.getVertex(face.vertices[0]);
  if (!v1) return 0;
  
  let area = 0;
  const p1 = new Vector3(v1.x, v1.y, v1.z);
  
  for (let i = 1; i < face.vertices.length - 1; i++) {
    const v2 = mesh.getVertex(face.vertices[i]);
    const v3 = mesh.getVertex(face.vertices[i + 1]);
    
    if (!v2 || !v3) continue;
    
    const p2 = new Vector3(v2.x, v2.y, v2.z);
    const p3 = new Vector3(v3.x, v3.y, v3.z);
    
    const edge1 = new Vector3().subVectors(p2, p1);
    const edge2 = new Vector3().subVectors(p3, p1);
    const cross = new Vector3().crossVectors(edge1, edge2);
    
    area += cross.length() * 0.5;
  }
  
  return area;
}

/**
 * Calculate face normal
 */
function calculateFaceNormal(mesh: EditableMesh, face: any): Vector3 {
  if (face.vertices.length < 3) return new Vector3(0, 1, 0);
  
  const v1 = mesh.getVertex(face.vertices[0]);
  const v2 = mesh.getVertex(face.vertices[1]);
  const v3 = mesh.getVertex(face.vertices[2]);
  
  if (!v1 || !v2 || !v3) return new Vector3(0, 1, 0);
  
  const p1 = new Vector3(v1.x, v1.y, v1.z);
  const p2 = new Vector3(v2.x, v2.y, v2.z);
  const p3 = new Vector3(v3.x, v3.y, v3.z);
  
  const edge1 = new Vector3().subVectors(p2, p1);
  const edge2 = new Vector3().subVectors(p3, p1);
  const normal = new Vector3().crossVectors(edge1, edge2).normalize();
  
  return normal;
}

/**
 * Calculate face center
 */
function calculateFaceCenter(mesh: EditableMesh, face: any): Vector3 {
  const center = new Vector3();
  
  for (const vertexIndex of face.vertices) {
    const vertex = mesh.getVertex(vertexIndex);
    if (vertex) {
      center.add(new Vector3(vertex.x, vertex.y, vertex.z));
    }
  }
  
  center.divideScalar(face.vertices.length);
  return center;
}

/**
 * Calculate vertex valence (number of connected edges)
 */
function calculateVertexValence(mesh: EditableMesh, vertexIndex: number): number {
  let valence = 0;
  
  for (const edge of mesh.edges) {
    if (edge.v1 === vertexIndex || edge.v2 === vertexIndex) {
      valence++;
    }
  }
  
  return valence;
} 