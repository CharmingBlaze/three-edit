/**
 * Mesh operations for three-edit
 * Pure functions for modifying mesh geometry and properties
 */

import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Edge } from '../core/Edge';
import { EditableMesh } from '../core/EditableMesh';
import { UVCoord } from '../uv/types';
import { 
  VertexOptions, 
  FaceOptions, 
  EdgeOptions, 
  PrimitiveContext,
  VertexCreationResult,
  FaceCreationResult,
  EdgeCreationResult
} from '../primitives/types';
import { EdgeKeyCache } from '../topology/edgeKey';
import { Vector3, Matrix4 } from 'three';

/**
 * Center vertices around a point
 */
export function centerVertices(vertices: Vertex[], center: Vector3): void {
  vertices.forEach(vertex => {
    vertex.x -= center.x;
    vertex.y -= center.y;
    vertex.z -= center.z;
  });
}

/**
 * Scale vertices
 */
export function scaleVertices(vertices: Vertex[], scale: Vector3): void {
  vertices.forEach(vertex => {
    vertex.x *= scale.x;
    vertex.y *= scale.y;
    vertex.z *= scale.z;
  });
}

/**
 * Rotate vertices around an axis
 */
export function rotateVertices(
  vertices: Vertex[],
  axis: Vector3,
  angle: number
): void {
  vertices.forEach(vertex => {
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    position.applyAxisAngle(axis, angle);
    vertex.x = position.x;
    vertex.y = position.y;
    vertex.z = position.z;
  });
}

/**
 * Apply transformation matrix to vertices
 */
export function transformVertices(mesh: EditableMesh, matrix: Matrix4): void {
  mesh.vertices.forEach(vertex => {
    const vec = new Vector3(vertex.x, vertex.y, vertex.z);
    vec.applyMatrix4(matrix);
    vertex.x = vec.x;
    vertex.y = vec.y;
    vertex.z = vec.z;
  });
}

/**
 * Create a vertex with standardized options
 */
export function createVertex(
  mesh: EditableMesh,
  options: VertexOptions,
  context?: PrimitiveContext
): VertexCreationResult {
  const vertex = new Vertex(options.x, options.y, options.z, {
    uv: options.uv,
    normal: options.normal,
    color: options.color,
    userData: options.userData
  });
  
  const id = mesh.addVertex(vertex);
  return { id, vertex };
}

/**
 * Create a face with standardized options
 */
export function createFace(
  mesh: EditableMesh,
  options: FaceOptions,
  context?: PrimitiveContext
): FaceCreationResult {
  // Create edges first
  const edgeIds = createFaceEdges(mesh, options.vertexIds, context);
  
  // Create face
  const face = new Face(options.vertexIds, edgeIds, {
    materialIndex: options.materialId ?? context?.materialId ?? 0,
    faceVertexUvs: options.faceVertexUvs,
    userData: options.userData
  });
  
  // Calculate and assign the face normal
  face.normal = calculateFaceNormal(mesh, face);

  const id = mesh.addFace(face);
  return { id, face, edgeIds };
}

/**
 * Create a face with its edges, using a cache to avoid duplicates
 */
export function createFaceWithEdges(
  mesh: EditableMesh,
  vertexIds: number[],
  materialId: number,
  edgeKeyCache: EdgeKeyCache,
  faceVertexUvs?: UVCoord[]
): FaceCreationResult {
  const edgeIds: number[] = [];
  edgeKeyCache.setMesh(mesh);

  for (let i = 0; i < vertexIds.length; i++) {
    const v1 = vertexIds[i];
    const v2 = vertexIds[(i + 1) % vertexIds.length];
    const edgeId = edgeKeyCache.getOrCreate(v1, v2);
    edgeIds.push(edgeId);
  }

  const face = new Face(vertexIds, edgeIds, {
    materialIndex: materialId,
    faceVertexUvs: faceVertexUvs,
  });

  face.normal = calculateFaceNormal(mesh, face);
  const id = mesh.addFace(face);

  return { id, face, edgeIds };
}

/**
 * Create an edge with standardized options
 */
export function createEdge(
  mesh: EditableMesh,
  options: EdgeOptions,
  context?: PrimitiveContext
): EdgeCreationResult {
  const edge = new Edge(options.v1, options.v2, {
    userData: options.userData
  });
  
  const id = mesh.addEdge(edge);
  return { id, edge };
}

/**
 * Create edges for a face using edge key caching
 */
export function createFaceEdges(
  mesh: EditableMesh,
  vertexIds: number[],
  context?: PrimitiveContext
): number[] {
  const edgeIds: number[] = [];
  const edgeKeyCache = context?.edgeKeyCache || new EdgeKeyCache();
  
  // Set the mesh in the cache
  edgeKeyCache.setMesh(mesh);
  
  for (let i = 0; i < vertexIds.length; i++) {
    const v1 = vertexIds[i];
    const v2 = vertexIds[(i + 1) % vertexIds.length];
    
    // Get UVs for seam detection
    const vertex1 = mesh.getVertex(v1);
    const vertex2 = mesh.getVertex(v2);
    const uv1 = vertex1?.uv;
    const uv2 = vertex2?.uv;
    
    // Get or create edge using cache
    const edgeId = edgeKeyCache.getOrCreate(v1, v2, uv1, uv2);
    edgeIds.push(edgeId);
  }
  
  return edgeIds;
}

/**
 * Create primitive context
 */
export function createPrimitiveContext(mesh: EditableMesh): PrimitiveContext {
  return {
    mesh,
    edgeKeyCache: new EdgeKeyCache(),
    materialId: 0,
    validate: true,
    uvLayout: 'standard',
    smoothNormals: false
  };
}

/**
 * Normalize options with defaults
 */
export function normalizeOptions<T>(options: Partial<T>, defaults: T): T {
  return { ...defaults, ...options };
}

/**
 * Calculate face normal
 */
function calculateFaceNormal(mesh: EditableMesh, face: Face): Vector3 {
  if (face.vertices.length < 3) {
    return new Vector3(0, 0, 1);
  }
  
  const v1 = mesh.getVertex(face.vertices[0]);
  const v2 = mesh.getVertex(face.vertices[1]);
  const v3 = mesh.getVertex(face.vertices[2]);
  
  if (!v1 || !v2 || !v3) {
    return new Vector3(0, 0, 1);
  }
  
  const edge1 = new Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
  const edge2 = new Vector3(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
  
  return new Vector3().crossVectors(edge1, edge2).normalize();
} 