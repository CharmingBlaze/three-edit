import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Face } from '../core/Face';
import { Vertex } from '../core/Vertex';

/**
 * Calculates the normal vector of a face
 * @param mesh The mesh containing the face
 * @param face The face to calculate the normal for
 * @returns The normal vector of the face, or undefined if the calculation fails
 */
export function calculateFaceNormal(mesh: EditableMesh, face: Face): Vector3 | undefined {
  if (face.vertices.length < 3) return undefined;
  
  // Get the first three vertices of the face
  const v0 = mesh.getVertex(face.vertices[0]);
  const v1 = mesh.getVertex(face.vertices[1]);
  const v2 = mesh.getVertex(face.vertices[2]);
  
  if (!v0 || !v1 || !v2) return undefined;
  
  // Calculate two edges
  const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
  const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
  
  // Calculate the normal using cross product
  const normal = new Vector3().crossVectors(edge1, edge2).normalize();
  
  return normal;
}

/**
 * Calculates the center point of a face
 * @param mesh The mesh containing the face
 * @param face The face to calculate the center for
 * @returns The center point of the face
 */
export function calculateFaceCenter(mesh: EditableMesh, face: Face): Vector3 {
  const center = new Vector3();
  const vertexCount = face.vertices.length;
  
  if (vertexCount === 0) return center;
  
  // Sum up all vertex positions
  for (const vertexIndex of face.vertices) {
    const vertex = mesh.getVertex(vertexIndex);
    if (vertex) {
      center.x += vertex.x;
      center.y += vertex.y;
      center.z += vertex.z;
    }
  }
  
  // Divide by the number of vertices to get the average (center)
  center.divideScalar(vertexCount);
  
  return center;
}

/**
 * Calculates the area of a face
 * @param mesh The mesh containing the face
 * @param face The face to calculate the area for
 * @returns The area of the face
 */
export function calculateFaceArea(mesh: EditableMesh, face: Face): number {
  if (face.vertices.length < 3) return 0;
  
  let area = 0;
  
  // Calculate area using triangulation
  for (let i = 1; i < face.vertices.length - 1; i++) {
    const v0 = mesh.getVertex(face.vertices[0]);
    const v1 = mesh.getVertex(face.vertices[i]);
    const v2 = mesh.getVertex(face.vertices[i + 1]);
    
    if (v0 && v1 && v2) {
      const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
      const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
      const cross = new Vector3().crossVectors(edge1, edge2);
      area += cross.length() * 0.5;
    }
  }
  
  return area;
}

/**
 * Calculates the distance between two vertices
 * @param v1 First vertex
 * @param v2 Second vertex
 * @returns The distance between the vertices
 */
export function calculateVertexDistance(v1: Vertex, v2: Vertex): number {
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  const dz = v2.z - v1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculates the angle between three vertices
 * @param v1 First vertex
 * @param v2 Second vertex (center)
 * @param v3 Third vertex
 * @returns The angle in radians
 */
export function calculateVertexAngle(v1: Vertex, v2: Vertex, v3: Vertex): number {
  const edge1 = new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  const edge2 = new Vector3(v3.x - v2.x, v3.y - v2.y, v3.z - v2.z);
  
  edge1.normalize();
  edge2.normalize();
  
  return Math.acos(edge1.dot(edge2));
}

/**
 * Checks if a point is inside a triangle
 * @param point The point to test
 * @param v1 First vertex of the triangle
 * @param v2 Second vertex of the triangle
 * @param v3 Third vertex of the triangle
 * @returns True if the point is inside the triangle
 */
export function isPointInTriangle(
  point: Vector3,
  v1: Vertex,
  v2: Vertex,
  v3: Vertex
): boolean {
  const u = new Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
  const v = new Vector3(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
  const w = new Vector3(point.x - v1.x, point.y - v1.y, point.z - v1.z);
  
  const uu = u.dot(u);
  const uv = u.dot(v);
  const vv = v.dot(v);
  const wu = w.dot(u);
  const wv = w.dot(v);
  
  const d = uv * uv - uu * vv;
  
  if (Math.abs(d) < 1e-10) return false;
  
  const s = (uv * wv - vv * wu) / d;
  const t = (uv * wu - uu * wv) / d;
  
  return s >= 0 && t >= 0 && s + t <= 1;
}

/**
 * Triangulates a face into an array of triangles
 * Each triangle is an array of three vertex indices
 * @param face The face to triangulate
 * @returns An array of triangles
 */
export function triangulateFace(face: Face): number[][] {
  const triangles: number[][] = [];
  const vertices = face.vertices;
  
  if (vertices.length < 3) {
    return triangles;
  }
  
  // Simple fan triangulation
  // This works well for convex polygons
  // For concave polygons, a more sophisticated triangulation algorithm would be needed
  for (let i = 1; i < vertices.length - 1; i++) {
    triangles.push([vertices[0], vertices[i], vertices[i + 1]]);
  }
  
  return triangles;
} 