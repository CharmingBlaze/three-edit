import { Vector3 } from 'three';
import { EditableMesh, Face } from '../../core/index';
import { EdgeCollapse } from './types';

/**
 * Collapse an edge in the mesh
 */
export function collapseEdge(mesh: EditableMesh, collapse: EdgeCollapse): void {
  const { edge, newPosition } = collapse;
  
  // Get vertex indices
  const v1Index = edge.v1;
  const v2Index = edge.v2;
  
  // Get vertices
  const v1 = mesh.getVertex(v1Index);
  const v2 = mesh.getVertex(v2Index);
  
  if (!v1 || !v2) {
    throw new Error('Invalid vertex indices in edge collapse');
  }
  
  if (!newPosition) {
    throw new Error('New position is required for edge collapse');
  }
  
  // Update v1 position to new position
  v1.x = newPosition.x;
  v1.y = newPosition.y;
  v1.z = newPosition.z;
  
  // Update UV coordinates if both vertices have UVs
  if (v1.uv && v2.uv) {
    v1.uv.u = (v1.uv.u + v2.uv.u) / 2;
    v1.uv.v = (v1.uv.v + v2.uv.v) / 2;
  }
  
  // Update normal if both vertices have normals
  if (v1.normal && v2.normal) {
    v1.normal.add(v2.normal).normalize();
  }
  
  // Update faces to use v1 instead of v2
  mesh.faces.forEach(face => {
    face.vertices = face.vertices.map(vertexIndex => 
      vertexIndex === v2Index ? v1Index : vertexIndex
    );
  });
  
  // Remove faces that become degenerate (less than 3 unique vertices)
  mesh.faces = mesh.faces.filter(face => {
    const uniqueVertices = new Set(face.vertices);
    return uniqueVertices.size >= 3;
  });
  
  // Remove v2 from vertices array
  mesh.vertices.splice(v2Index, 1);
  
  // Update all vertex indices that were greater than v2Index
  mesh.faces.forEach(face => {
    face.vertices = face.vertices.map(vertexIndex => 
      vertexIndex > v2Index ? vertexIndex - 1 : vertexIndex
    );
  });
}

/**
 * Calculate error metric for simplification quality
 */
export function calculateErrorMetric(mesh: EditableMesh): number {
  let totalError = 0;
  let faceCount = 0;
  
  mesh.faces.forEach(face => {
    const area = calculateFaceArea(mesh, face);
    // const _center = calculateFaceCenter(mesh, face);
    const normal = calculateFaceNormal(mesh, face);
    
    // Calculate error based on face properties
    const faceError = area * normal.length();
    totalError += faceError;
    faceCount++;
  });
  
  return faceCount > 0 ? totalError / faceCount : 0;
}

/**
 * Calculate face area
 */
export function calculateFaceArea(mesh: EditableMesh, face: Face): number {
  if (face.vertices.length < 3) return 0;
  
  const vertices = face.vertices.map(index => mesh.vertices[index]).filter(Boolean);
  if (vertices.length < 3) return 0;
  
  // Calculate area using cross product
  const v0 = vertices[0];
  const v1 = vertices[1];
  const v2 = vertices[2];
  
  const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
  const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
  
  const cross = new Vector3();
  cross.crossVectors(edge1, edge2);
  
  return cross.length() * 0.5;
}

/**
 * Calculate face center
 */
export function calculateFaceCenter(mesh: EditableMesh, face: Face): Vector3 {
  const center = new Vector3();
  let vertexCount = 0;
  
  face.vertices.forEach(vertexIndex => {
    const vertex = mesh.vertices[vertexIndex];
    if (vertex) {
      center.add(new Vector3(vertex.x, vertex.y, vertex.z));
      vertexCount++;
    }
  });
  
  return vertexCount > 0 ? center.divideScalar(vertexCount) : center;
}

/**
 * Calculate face normal
 */
export function calculateFaceNormal(mesh: EditableMesh, face: Face): Vector3 {
  if (face.vertices.length < 3) return new Vector3();
  
  const vertices = face.vertices.map(index => mesh.vertices[index]).filter(Boolean);
  if (vertices.length < 3) return new Vector3();
  
  const v0 = vertices[0];
  const v1 = vertices[1];
  const v2 = vertices[2];
  
  const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
  const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
  
  const normal = new Vector3();
  normal.crossVectors(edge1, edge2);
  normal.normalize();
  
  return normal;
} 