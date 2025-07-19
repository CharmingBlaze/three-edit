import { EditableMesh } from '../core/EditableMesh';
import { Selection } from './Selection';
import { Vector3, Ray, Box3 } from 'three';
import { calculateFaceCenter, calculateFaceNormal } from '../utils/mathUtils';

/**
 * Options for ray-based selection
 */
export interface RaySelectionOptions {
  /** Maximum distance for selection */
  maxDistance?: number;
  /** Whether to select faces */
  selectFaces?: boolean;
  /** Whether to select vertices */
  selectVertices?: boolean;
  /** Whether to select edges */
  selectEdges?: boolean;
  /** Tolerance for intersection tests */
  tolerance?: number;
}

/**
 * Options for box selection
 */
export interface BoxSelectionOptions {
  /** Whether to select faces */
  selectFaces?: boolean;
  /** Whether to select vertices */
  selectVertices?: boolean;
  /** Whether to select edges */
  selectEdges?: boolean;
  /** Whether to select elements that are partially inside the box */
  partialSelection?: boolean;
}

/**
 * Options for lasso selection
 */
export interface LassoSelectionOptions {
  /** Whether to select faces */
  selectFaces?: boolean;
  /** Whether to select vertices */
  selectVertices?: boolean;
  /** Whether to select edges */
  selectEdges?: boolean;
  /** Tolerance for point-in-polygon tests */
  tolerance?: number;
}

/**
 * Ray-based selection
 * @param mesh The mesh to select from
 * @param ray The ray for selection
 * @param options Selection options
 * @returns Selection containing selected elements
 */
export function selectByRay(
  mesh: EditableMesh,
  ray: Ray,
  options: RaySelectionOptions = {}
): Selection {
  const {
    maxDistance = Infinity,
    selectFaces = true,
    selectVertices = false,
    selectEdges = false,
    tolerance = 1e-6
  } = options;

  const selection = new Selection();

  if (selectFaces) {
    const selectedFaces = selectFacesByRay(mesh, ray, maxDistance, tolerance);
    selection.faces = new Set(selectedFaces);
  }

  if (selectVertices) {
    const selectedVertices = selectVerticesByRay(mesh, ray, maxDistance, tolerance);
    selection.vertices = new Set(selectedVertices);
  }

  if (selectEdges) {
    const selectedEdges = selectEdgesByRay(mesh, ray, maxDistance, tolerance);
    selection.edges = new Set(selectedEdges);
  }

  return selection;
}

/**
 * Box selection
 * @param mesh The mesh to select from
 * @param box The bounding box for selection
 * @param options Selection options
 * @returns Selection containing selected elements
 */
export function selectByBox(
  mesh: EditableMesh,
  box: Box3,
  options: BoxSelectionOptions = {}
): Selection {
  const {
    selectFaces = true,
    selectVertices = false,
    selectEdges = false,
    partialSelection = true
  } = options;

  const selection = new Selection();

  if (selectFaces) {
    const selectedFaces = selectFacesByBox(mesh, box, partialSelection);
    selection.faces = new Set(selectedFaces);
  }

  if (selectVertices) {
    const selectedVertices = selectVerticesByBox(mesh, box);
    selection.vertices = new Set(selectedVertices);
  }

  if (selectEdges) {
    const selectedEdges = selectEdgesByBox(mesh, box, partialSelection);
    selection.edges = new Set(selectedEdges);
  }

  return selection;
}

/**
 * Lasso selection
 * @param mesh The mesh to select from
 * @param points Array of points defining the lasso polygon
 * @param options Selection options
 * @returns Selection containing selected elements
 */
export function selectByLasso(
  mesh: EditableMesh,
  points: Vector3[],
  options: LassoSelectionOptions = {}
): Selection {
  const {
    selectFaces = true,
    selectVertices = false,
    selectEdges = false,
    tolerance = 1e-6
  } = options;

  const selection = new Selection();

  if (selectFaces) {
    const selectedFaces = selectFacesByLasso(mesh, points, tolerance);
    selection.faces = new Set(selectedFaces);
  }

  if (selectVertices) {
    const selectedVertices = selectVerticesByLasso(mesh, points, tolerance);
    selection.vertices = new Set(selectedVertices);
  }

  if (selectEdges) {
    const selectedEdges = selectEdgesByLasso(mesh, points, tolerance);
    selection.edges = new Set(selectedEdges);
  }

  return selection;
}

/**
 * Circular selection
 * @param mesh The mesh to select from
 * @param center Center point of the circle
 * @param radius Radius of the circle
 * @param options Selection options
 * @returns Selection containing selected elements
 */
export function selectByCircle(
  mesh: EditableMesh,
  center: Vector3,
  radius: number,
  options: BoxSelectionOptions = {}
): Selection {
  const {
    selectFaces = true,
    selectVertices = false,
    selectEdges = false,
    partialSelection = true
  } = options;

  const selection = new Selection();

  if (selectFaces) {
    const selectedFaces = selectFacesByCircle(mesh, center, radius, partialSelection);
    selection.faces = new Set(selectedFaces);
  }

  if (selectVertices) {
    const selectedVertices = selectVerticesByCircle(mesh, center, radius);
    selection.vertices = new Set(selectedVertices);
  }

  if (selectEdges) {
    const selectedEdges = selectEdgesByCircle(mesh, center, radius, partialSelection);
    selection.edges = new Set(selectedEdges);
  }

  return selection;
}

/**
 * Select connected elements
 * @param mesh The mesh to select from
 * @param currentSelection Current selection to expand from
 * @param options Selection options
 * @returns Selection containing connected elements
 */
export function selectConnected(
  mesh: EditableMesh,
  currentSelection: Selection,
  options: {
    selectFaces?: boolean;
    selectVertices?: boolean;
    selectEdges?: boolean;
    maxDepth?: number;
  } = {}
): Selection {
  const {
    selectFaces = true,
    selectVertices = false,
    selectEdges = false,
    maxDepth = 1
  } = options;

  const selection = new Selection();

  if (selectFaces && currentSelection.faces.size > 0) {
    const connectedFaces = findConnectedFaces(mesh, Array.from(currentSelection.faces), maxDepth);
    selection.faces = new Set(connectedFaces);
  }

  if (selectVertices && currentSelection.vertices.size > 0) {
    const connectedVertices = findConnectedVertices(mesh, Array.from(currentSelection.vertices), maxDepth);
    selection.vertices = new Set(connectedVertices);
  }

  if (selectEdges && currentSelection.edges.size > 0) {
    const connectedEdges = findConnectedEdges(mesh, Array.from(currentSelection.edges), maxDepth);
    selection.edges = new Set(connectedEdges);
  }

  return selection;
}

/**
 * Select similar elements
 * @param mesh The mesh to select from
 * @param currentSelection Current selection to find similar elements for
 * @param options Selection options
 * @returns Selection containing similar elements
 */
export function selectSimilar(
  mesh: EditableMesh,
  currentSelection: Selection,
  options: {
    selectFaces?: boolean;
    selectVertices?: boolean;
    selectEdges?: boolean;
    similarityThreshold?: number;
  } = {}
): Selection {
  const {
    selectFaces = true,
    selectVertices = false,
    selectEdges = false,
    similarityThreshold = 0.1
  } = options;

  const selection = new Selection();

  if (selectFaces && currentSelection.faces.size > 0) {
    const similarFaces = findSimilarFaces(mesh, Array.from(currentSelection.faces), similarityThreshold);
    selection.faces = new Set(similarFaces);
  }

  if (selectVertices && currentSelection.vertices.size > 0) {
    const similarVertices = findSimilarVertices(mesh, Array.from(currentSelection.vertices), similarityThreshold);
    selection.vertices = new Set(similarVertices);
  }

  if (selectEdges && currentSelection.edges.size > 0) {
    const similarEdges = findSimilarEdges(mesh, Array.from(currentSelection.edges), similarityThreshold);
    selection.edges = new Set(similarEdges);
  }

  return selection;
}

// Internal helper functions

function selectFacesByRay(mesh: EditableMesh, ray: Ray, maxDistance: number, tolerance: number): number[] {
  const selectedFaces: number[] = [];
  let closestDistance = maxDistance;

  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    if (face.vertices.length < 3) continue;

    // Calculate face center and normal
    const center = calculateFaceCenter(mesh, face);
    const normal = calculateFaceNormal(mesh, face);
    
    if (!normal || !center) continue;

    // Ray-plane intersection
    const denom = ray.direction.dot(normal);
    if (Math.abs(denom) < tolerance) continue; // Ray is parallel to face

    const t = normal.dot(center.clone().sub(ray.origin)) / denom;
    if (t < 0) continue; // Intersection is behind ray origin

    // For now, just check if the intersection point is reasonably close to the face center
    const intersection = ray.origin.clone().add(ray.direction.clone().multiplyScalar(t));
    const distanceToCenter = center.distanceTo(intersection);
    
    // If the intersection is close to the face center, consider it a hit
    if (distanceToCenter <= 1.0) { // Use a reasonable tolerance
      if (t < closestDistance) {
        closestDistance = t;
        selectedFaces.length = 0; // Clear previous selections
        selectedFaces.push(i);
      } else if (Math.abs(t - closestDistance) < tolerance) {
        selectedFaces.push(i);
      }
    }
  }

  return selectedFaces;
}

function selectVerticesByRay(mesh: EditableMesh, ray: Ray, maxDistance: number, tolerance: number): number[] {
  const selectedVertices: number[] = [];

  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const distance = ray.distanceToPoint(vertex);
    
    if (distance <= maxDistance && distance <= tolerance) {
      selectedVertices.push(i);
    }
  }

  return selectedVertices;
}

function selectEdgesByRay(mesh: EditableMesh, ray: Ray, maxDistance: number, tolerance: number): number[] {
  const selectedEdges: number[] = [];

  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    const v1 = mesh.vertices[edge.v1];
    const v2 = mesh.vertices[edge.v2];
    
    if (!v1 || !v2) continue; // Skip edges with undefined vertices
    
    // Convert vertices to Vector3 for vector operations
    const v1Vector = new Vector3(v1.x, v1.y, v1.z);
    const v2Vector = new Vector3(v2.x, v2.y, v2.z);
    
    // Calculate distance from ray to edge
    const edgeVector = v2Vector.clone().sub(v1Vector);
    const rayToV1 = ray.origin.clone().sub(v1Vector);
    const rayToV2 = ray.origin.clone().sub(v2Vector);
    
    const cross = ray.direction.clone().cross(edgeVector);
    const distance = Math.abs(ray.direction.dot(rayToV1.cross(rayToV2))) / cross.length();
    
    if (distance <= maxDistance && distance <= tolerance) {
      selectedEdges.push(i);
    }
  }

  return selectedEdges;
}

function selectFacesByBox(mesh: EditableMesh, box: Box3, partialSelection: boolean): number[] {
  const selectedFaces: number[] = [];

  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    let verticesInBox = 0;

    for (const vertexIndex of face.vertices) {
      const vertex = mesh.vertices[vertexIndex];
      if (box.containsPoint(vertex)) {
        verticesInBox++;
      }
    }

    if (partialSelection) {
      if (verticesInBox > 0) {
        selectedFaces.push(i);
      }
    } else {
      if (verticesInBox === face.vertices.length) {
        selectedFaces.push(i);
      }
    }
  }

  return selectedFaces;
}

function selectVerticesByBox(mesh: EditableMesh, box: Box3): number[] {
  const selectedVertices: number[] = [];

  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    if (box.containsPoint(vertex)) {
      selectedVertices.push(i);
    }
  }

  return selectedVertices;
}

function selectEdgesByBox(mesh: EditableMesh, box: Box3, partialSelection: boolean): number[] {
  const selectedEdges: number[] = [];

  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    const v1 = mesh.vertices[edge.v1];
    const v2 = mesh.vertices[edge.v2];
    
    if (!v1 || !v2) continue; // Skip edges with undefined vertices
    
    const v1InBox = box.containsPoint(v1);
    const v2InBox = box.containsPoint(v2);
    
    if (partialSelection) {
      if (v1InBox || v2InBox) {
        selectedEdges.push(i);
      }
    } else {
      if (v1InBox && v2InBox) {
        selectedEdges.push(i);
      }
    }
  }

  return selectedEdges;
}

function selectFacesByLasso(mesh: EditableMesh, points: Vector3[], tolerance: number): number[] {
  const selectedFaces: number[] = [];

  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    const center = calculateFaceCenter(mesh, face);
    
    if (isPointInPolygon(center, points, tolerance)) {
      selectedFaces.push(i);
    }
  }

  return selectedFaces;
}

function selectVerticesByLasso(mesh: EditableMesh, points: Vector3[], tolerance: number): number[] {
  const selectedVertices: number[] = [];

  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    
    if (isPointInPolygon(vertex, points, tolerance)) {
      selectedVertices.push(i);
    }
  }

  return selectedVertices;
}

function selectEdgesByLasso(mesh: EditableMesh, points: Vector3[], tolerance: number): number[] {
  const selectedEdges: number[] = [];

  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    const v1 = mesh.vertices[edge.v1];
    const v2 = mesh.vertices[edge.v2];
    
    // Convert vertices to Vector3 for vector operations
    const v1Vector = new Vector3(v1.x, v1.y, v1.z);
    const v2Vector = new Vector3(v2.x, v2.y, v2.z);
    
    const center = v1Vector.clone().add(v2Vector).multiplyScalar(0.5);
    
    if (isPointInPolygon(center, points, tolerance)) {
      selectedEdges.push(i);
    }
  }

  return selectedEdges;
}

function selectFacesByCircle(mesh: EditableMesh, center: Vector3, radius: number, partialSelection: boolean): number[] {
  const selectedFaces: number[] = [];

  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    let verticesInCircle = 0;

    for (const vertexIndex of face.vertices) {
      const vertex = mesh.vertices[vertexIndex];
      const distance = center.distanceTo(vertex);
      
      if (distance <= radius) {
        verticesInCircle++;
      }
    }

    if (partialSelection) {
      if (verticesInCircle > 0) {
        selectedFaces.push(i);
      }
    } else {
      if (verticesInCircle === face.vertices.length) {
        selectedFaces.push(i);
      }
    }
  }

  return selectedFaces;
}

function selectVerticesByCircle(mesh: EditableMesh, center: Vector3, radius: number): number[] {
  const selectedVertices: number[] = [];

  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const distance = center.distanceTo(vertex);
    
    if (distance <= radius) {
      selectedVertices.push(i);
    }
  }

  return selectedVertices;
}

function selectEdgesByCircle(mesh: EditableMesh, center: Vector3, radius: number, partialSelection: boolean): number[] {
  const selectedEdges: number[] = [];

  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    const v1 = mesh.vertices[edge.v1];
    const v2 = mesh.vertices[edge.v2];
    
    const d1 = center.distanceTo(v1);
    const d2 = center.distanceTo(v2);
    
    if (partialSelection) {
      if (d1 <= radius || d2 <= radius) {
        selectedEdges.push(i);
      }
    } else {
      if (d1 <= radius && d2 <= radius) {
        selectedEdges.push(i);
      }
    }
  }

  return selectedEdges;
}

function findConnectedFaces(mesh: EditableMesh, faceIndices: number[], maxDepth: number): number[] {
  const connectedFaces = new Set(faceIndices);
  const visited = new Set<number>();
  
  for (const faceIndex of faceIndices) {
    findConnectedFacesRecursive(mesh, faceIndex, connectedFaces, visited, maxDepth, 0);
  }
  
  return Array.from(connectedFaces);
}

function findConnectedFacesRecursive(
  mesh: EditableMesh,
  faceIndex: number,
  connectedFaces: Set<number>,
  visited: Set<number>,
  maxDepth: number,
  currentDepth: number
): void {
  if (visited.has(faceIndex) || currentDepth > maxDepth) return;
  
  visited.add(faceIndex);
  connectedFaces.add(faceIndex);
  
  const face = mesh.faces[faceIndex];
  if (!face) return;
  
  // Find faces that share edges with this face
  for (const edgeIndex of face.edges) {
    const edge = mesh.edges[edgeIndex];
    if (!edge) continue;
    
    // Find faces that use this edge
    for (let i = 0; i < mesh.faces.length; i++) {
      if (i === faceIndex) continue;
      const otherFace = mesh.faces[i];
      if (otherFace.edges.includes(edgeIndex)) {
        findConnectedFacesRecursive(mesh, i, connectedFaces, visited, maxDepth, currentDepth + 1);
      }
    }
  }
}

function findConnectedVertices(mesh: EditableMesh, vertexIndices: number[], maxDepth: number): number[] {
  const connectedVertices = new Set(vertexIndices);
  const visited = new Set<number>();
  
  for (const vertexIndex of vertexIndices) {
    findConnectedVerticesRecursive(mesh, vertexIndex, connectedVertices, visited, maxDepth, 0);
  }
  
  return Array.from(connectedVertices);
}

function findConnectedVerticesRecursive(
  mesh: EditableMesh,
  vertexIndex: number,
  connectedVertices: Set<number>,
  visited: Set<number>,
  maxDepth: number,
  currentDepth: number
): void {
  if (visited.has(vertexIndex) || currentDepth > maxDepth) return;
  
  visited.add(vertexIndex);
  connectedVertices.add(vertexIndex);
  
  // Find edges that use this vertex
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    if (edge.v1 === vertexIndex || edge.v2 === vertexIndex) {
      const otherVertex = edge.v1 === vertexIndex ? edge.v2 : edge.v1;
      findConnectedVerticesRecursive(mesh, otherVertex, connectedVertices, visited, maxDepth, currentDepth + 1);
    }
  }
}

function findConnectedEdges(mesh: EditableMesh, edgeIndices: number[], maxDepth: number): number[] {
  const connectedEdges = new Set(edgeIndices);
  const visited = new Set<number>();
  
  for (const edgeIndex of edgeIndices) {
    findConnectedEdgesRecursive(mesh, edgeIndex, connectedEdges, visited, maxDepth, 0);
  }
  
  return Array.from(connectedEdges);
}

function findConnectedEdgesRecursive(
  mesh: EditableMesh,
  edgeIndex: number,
  connectedEdges: Set<number>,
  visited: Set<number>,
  maxDepth: number,
  currentDepth: number
): void {
  if (visited.has(edgeIndex) || currentDepth > maxDepth) return;
  
  visited.add(edgeIndex);
  connectedEdges.add(edgeIndex);
  
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

function findSimilarFaces(mesh: EditableMesh, faceIndices: number[], threshold: number): number[] {
  const similarFaces: number[] = [];
  
  if (faceIndices.length === 0) return similarFaces;
  
  // Calculate average properties of selected faces
  const selectedFaces = faceIndices.map(i => mesh.faces[i]).filter(Boolean);
  if (selectedFaces.length === 0) return similarFaces;
  
  const avgArea = selectedFaces.reduce((sum, face) => {
    const center = calculateFaceCenter(mesh, face);
    return sum + (center ? 1 : 0); // Simplified area calculation
  }, 0) / selectedFaces.length;
  
  // Find faces with similar properties
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    const center = calculateFaceCenter(mesh, face);
    const area = center ? 1 : 0; // Simplified area calculation
    
    if (Math.abs(area - avgArea) <= threshold) {
      similarFaces.push(i);
    }
  }
  
  return similarFaces;
}

function findSimilarVertices(mesh: EditableMesh, vertexIndices: number[], threshold: number): number[] {
  const similarVertices: number[] = [];
  
  if (vertexIndices.length === 0) return similarVertices;
  
  // Calculate average position of selected vertices
  const selectedVertices = vertexIndices.map(i => mesh.vertices[i]).filter(Boolean);
  if (selectedVertices.length === 0) return similarVertices;
  
  const avgPosition = new Vector3();
  selectedVertices.forEach(vertex => {
    avgPosition.add(new Vector3(vertex.x, vertex.y, vertex.z));
  });
  avgPosition.divideScalar(selectedVertices.length);
  
  // Find vertices with similar positions
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const vertexVector = new Vector3(vertex.x, vertex.y, vertex.z);
    const distance = avgPosition.distanceTo(vertexVector);
    
    if (distance <= threshold) {
      similarVertices.push(i);
    }
  }
  
  return similarVertices;
}

function findSimilarEdges(mesh: EditableMesh, edgeIndices: number[], threshold: number): number[] {
  const similarEdges: number[] = [];
  
  if (edgeIndices.length === 0) return similarEdges;
  
  // Calculate average length of selected edges
  const selectedEdges = edgeIndices.map(i => mesh.edges[i]).filter(Boolean);
  if (selectedEdges.length === 0) return similarEdges;
  
  const avgLength = selectedEdges.reduce((sum, edge) => {
    const v1 = mesh.vertices[edge.v1];
    const v2 = mesh.vertices[edge.v2];
    if (v1 && v2) {
      const v1Vector = new Vector3(v1.x, v1.y, v1.z);
      const v2Vector = new Vector3(v2.x, v2.y, v2.z);
      return sum + v1Vector.distanceTo(v2Vector);
    }
    return sum;
  }, 0) / selectedEdges.length;
  
  // Find edges with similar lengths
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    const v1 = mesh.vertices[edge.v1];
    const v2 = mesh.vertices[edge.v2];
    
    if (v1 && v2) {
      const v1Vector = new Vector3(v1.x, v1.y, v1.z);
      const v2Vector = new Vector3(v2.x, v2.y, v2.z);
      const length = v1Vector.distanceTo(v2Vector);
      if (Math.abs(length - avgLength) <= threshold) {
        similarEdges.push(i);
      }
    }
  }
  
  return similarEdges;
}

// Utility functions

function isPointInFace(mesh: EditableMesh, face: any, point: Vector3, tolerance: number): boolean {
  // Simplified point-in-face test
  // In a full implementation, this would use proper barycentric coordinates
  const center = calculateFaceCenter(mesh, face);
  if (!center) return false;
  
  return center.distanceTo(point) <= tolerance;
}

function isPointInPolygon(point: Vector3, polygon: Vector3[], tolerance: number): boolean {
  // Ray casting algorithm for point-in-polygon test
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