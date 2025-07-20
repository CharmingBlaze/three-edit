import { Vector3, Box3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from './Selection';
import { BoxSelectionOptions } from './types';

/**
 * Select mesh elements using a bounding box
 */
export function selectByBox(
  mesh: EditableMesh,
  box: Box3,
  options: BoxSelectionOptions = {}
): Selection {
  const selectFaces = options.selectFaces ?? true;
  const selectVertices = options.selectVertices ?? true;
  const selectEdges = options.selectEdges ?? true;
  const partialSelection = options.partialSelection ?? false;

  const selection = new Selection();

  if (selectFaces) {
    const faceIndices = selectFacesByBox(mesh, box, partialSelection);
    selection.addFaces(faceIndices);
  }

  if (selectVertices) {
    const vertexIndices = selectVerticesByBox(mesh, box);
    selection.addVertices(vertexIndices);
  }

  if (selectEdges) {
    const edgeIndices = selectEdgesByBox(mesh, box, partialSelection);
    selection.addEdges(edgeIndices);
  }

  return selection;
}

/**
 * Select mesh elements using a circle
 */
export function selectByCircle(
  mesh: EditableMesh,
  center: Vector3,
  radius: number,
  options: BoxSelectionOptions = {}
): Selection {
  const selectFaces = options.selectFaces ?? true;
  const selectVertices = options.selectVertices ?? true;
  const selectEdges = options.selectEdges ?? true;
  const partialSelection = options.partialSelection ?? false;

  const selection = new Selection();

  if (selectFaces) {
    const faceIndices = selectFacesByCircle(mesh, center, radius, partialSelection);
    selection.addFaces(faceIndices);
  }

  if (selectVertices) {
    const vertexIndices = selectVerticesByCircle(mesh, center, radius);
    selection.addVertices(vertexIndices);
  }

  if (selectEdges) {
    const edgeIndices = selectEdgesByCircle(mesh, center, radius, partialSelection);
    selection.addEdges(edgeIndices);
  }

  return selection;
}

/**
 * Select faces using a bounding box
 */
function selectFacesByBox(mesh: EditableMesh, box: Box3, partialSelection: boolean): number[] {
  const selectedFaces: number[] = [];
  
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    const faceCenter = calculateFaceCenter(mesh, face);
    
    if (partialSelection) {
      // Select faces that are partially inside the box
      const faceBox = calculateFaceBoundingBox(mesh, face);
      if (box.intersectsBox(faceBox)) {
        selectedFaces.push(i);
      }
    } else {
      // Select faces that are completely inside the box
      if (box.containsPoint(faceCenter)) {
        selectedFaces.push(i);
      }
    }
  }
  
  return selectedFaces;
}

/**
 * Select vertices using a bounding box
 */
function selectVerticesByBox(mesh: EditableMesh, box: Box3): number[] {
  const selectedVertices: number[] = [];
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const vertexPos = new Vector3(vertex.x, vertex.y, vertex.z);
    
    if (box.containsPoint(vertexPos)) {
      selectedVertices.push(i);
    }
  }
  
  return selectedVertices;
}

/**
 * Select edges using a bounding box
 */
function selectEdgesByBox(mesh: EditableMesh, box: Box3, partialSelection: boolean): number[] {
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
    
    if (partialSelection) {
      // Select edges that are partially inside the box
      const edgeBox = new Box3().setFromPoints([start, end]);
      if (box.intersectsBox(edgeBox)) {
        selectedEdges.push(i);
      }
    } else {
      // Select edges that are completely inside the box
      if (box.containsPoint(start) && box.containsPoint(end)) {
        selectedEdges.push(i);
      }
    }
  }
  
  return selectedEdges;
}

/**
 * Select faces using a circle
 */
function selectFacesByCircle(mesh: EditableMesh, center: Vector3, radius: number, partialSelection: boolean): number[] {
  const selectedFaces: number[] = [];
  const radiusSquared = radius * radius;
  
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    const faceCenter = calculateFaceCenter(mesh, face);
    const distanceSquared = faceCenter.distanceToSquared(center);
    
    if (partialSelection) {
      // Select faces that are partially inside the circle
      const faceRadius = calculateFaceRadius(mesh, face);
      if (distanceSquared <= (radius + faceRadius) * (radius + faceRadius)) {
        selectedFaces.push(i);
      }
    } else {
      // Select faces that are completely inside the circle
      if (distanceSquared <= radiusSquared) {
        selectedFaces.push(i);
      }
    }
  }
  
  return selectedFaces;
}

/**
 * Select vertices using a circle
 */
function selectVerticesByCircle(mesh: EditableMesh, center: Vector3, radius: number): number[] {
  const selectedVertices: number[] = [];
  const radiusSquared = radius * radius;
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const vertexPos = new Vector3(vertex.x, vertex.y, vertex.z);
    const distanceSquared = vertexPos.distanceToSquared(center);
    
    if (distanceSquared <= radiusSquared) {
      selectedVertices.push(i);
    }
  }
  
  return selectedVertices;
}

/**
 * Select edges using a circle
 */
function selectEdgesByCircle(mesh: EditableMesh, center: Vector3, radius: number, partialSelection: boolean): number[] {
  const selectedEdges: number[] = [];
  const radiusSquared = radius * radius;
  
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    const v1 = mesh.getVertex(edge.v1);
    const v2 = mesh.getVertex(edge.v2);
    
    if (!v1 || !v2) {
      continue;
    }
    
    const start = new Vector3(v1.x, v1.y, v1.z);
    const end = new Vector3(v2.x, v2.y, v2.z);
    
    if (partialSelection) {
      // Select edges that are partially inside the circle
      const edgeCenter = new Vector3().addVectors(start, end).multiplyScalar(0.5);
      const edgeLength = start.distanceTo(end);
      const distanceSquared = edgeCenter.distanceToSquared(center);
      
      if (distanceSquared <= (radius + edgeLength * 0.5) * (radius + edgeLength * 0.5)) {
        selectedEdges.push(i);
      }
    } else {
      // Select edges that are completely inside the circle
      const startDistanceSquared = start.distanceToSquared(center);
      const endDistanceSquared = end.distanceToSquared(center);
      
      if (startDistanceSquared <= radiusSquared && endDistanceSquared <= radiusSquared) {
        selectedEdges.push(i);
      }
    }
  }
  
  return selectedEdges;
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
 * Calculate face bounding box
 */
function calculateFaceBoundingBox(mesh: EditableMesh, face: any): Box3 {
  const box = new Box3();
  
  for (const vertexIndex of face.vertices) {
    const vertex = mesh.getVertex(vertexIndex);
    if (vertex) {
      box.expandByPoint(new Vector3(vertex.x, vertex.y, vertex.z));
    }
  }
  
  return box;
}

/**
 * Calculate face radius (distance from center to furthest vertex)
 */
function calculateFaceRadius(mesh: EditableMesh, face: any): number {
  const center = calculateFaceCenter(mesh, face);
  let maxDistance = 0;
  
  for (const vertexIndex of face.vertices) {
    const vertex = mesh.getVertex(vertexIndex);
    if (vertex) {
      const distance = center.distanceTo(new Vector3(vertex.x, vertex.y, vertex.z));
      maxDistance = Math.max(maxDistance, distance);
    }
  }
  
  return maxDistance;
} 