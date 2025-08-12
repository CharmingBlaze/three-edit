import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Selection } from './Selection';
import { LassoSelectionOptions } from './types';

/**
 * Select mesh elements using a lasso (polygon)
 */
export function selectByLasso(
  mesh: EditableMesh,
  points: Vector3[],
  options: LassoSelectionOptions = {}
): Selection {
  const selectFaces = options.selectFaces ?? true;
  const selectVertices = options.selectVertices ?? true;
  const selectEdges = options.selectEdges ?? true;
  const tolerance = options.tolerance ?? 0.001;

  const selection = new Selection();

  if (selectFaces) {
    const faceIndices = selectFacesByLasso(mesh, points, tolerance);
    selection.addFaces(faceIndices);
  }

  if (selectVertices) {
    const vertexIndices = selectVerticesByLasso(mesh, points, tolerance);
    selection.addVertices(vertexIndices);
  }

  if (selectEdges) {
    const edgeIndices = selectEdgesByLasso(mesh, points, tolerance);
    selection.addEdges(edgeIndices);
  }

  return selection;
}

/**
 * Select faces using a lasso
 */
function selectFacesByLasso(mesh: EditableMesh, points: Vector3[], _tolerance: number): number[] {
  const selectedFaces: number[] = [];
  
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    const faceCenter = calculateFaceCenter(mesh, face);
    
    if (isPointInPolygon(faceCenter, points)) {
      selectedFaces.push(i);
    }
  }
  
  return selectedFaces;
}

/**
 * Select vertices using a lasso
 */
function selectVerticesByLasso(mesh: EditableMesh, points: Vector3[], _tolerance: number): number[] {
  const selectedVertices: number[] = [];
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const vertexPos = new Vector3(vertex.x, vertex.y, vertex.z);
    
    if (isPointInPolygon(vertexPos, points)) {
      selectedVertices.push(i);
    }
  }
  
  return selectedVertices;
}

/**
 * Select edges using a lasso
 */
function selectEdgesByLasso(mesh: EditableMesh, points: Vector3[], _tolerance: number): number[] {
  const selectedEdges: number[] = [];
  
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    const v1 = mesh.getVertex(edge.v1);
    const v2 = mesh.getVertex(edge.v2);
    
    if (!v1 || !v2) {
      continue;
    }
    
    const start = new Vector3(v1.x, v1.y, v1.z);
    const end = new Vector3(v2.x, v2.y, v2.z);
    const edgeCenter = new Vector3().addVectors(start, end).multiplyScalar(0.5);
    
    if (isPointInPolygon(edgeCenter, points)) {
      selectedEdges.push(i);
    }
  }
  
  return selectedEdges;
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function isPointInPolygon(point: Vector3, polygon: Vector3[]): boolean {
  if (polygon.length < 3) {
    return false;
  }
  
  // Use ray casting algorithm
  let inside = false;
  const x = point.x;
  const y = point.y;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
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