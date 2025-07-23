import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Edge } from '../core/Edge';
import { Matrix4, Vector2, Vector3 } from 'three';
import { UVCoord } from '../uv/types';
import { 
  VertexOptions, 
  FaceOptions, 
  EdgeOptions, 
  PrimitiveContext,
  VertexCreationResult,
  FaceCreationResult,
  EdgeCreationResult,
  UVGenerationParams,
  NormalGenerationParams,
  MaterialAssignmentParams
} from './types';
import { EdgeKeyCache } from '../topology/edgeKey';


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
 * Create a face with its edges, using a cache to avoid duplicates.
 * This is a more comprehensive, low-level function.
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
 * Generate a unique edge key that considers both vertex position and UV coordinates
 */
function generateEdgeKey(v1: Vertex, v2: Vertex): string {
  // Create position-based key
  const pos1 = `${v1.x.toFixed(6)},${v1.y.toFixed(6)},${v1.z.toFixed(6)}`;
  const pos2 = `${v2.x.toFixed(6)},${v2.y.toFixed(6)},${v2.z.toFixed(6)}`;
  
  // Create UV-based key
  const uv1 = v1.uv ? `${v1.uv.u.toFixed(6)},${v1.uv.v.toFixed(6)}` : 'no-uv';
  const uv2 = v2.uv ? `${v2.uv.u.toFixed(6)},${v2.uv.v.toFixed(6)}` : 'no-uv';
  
  // Ensure consistent ordering (smaller position first)
  const [firstPos, secondPos] = pos1 < pos2 ? [pos1, pos2] : [pos2, pos1];
  const [firstUV, secondUV] = pos1 < pos2 ? [uv1, uv2] : [uv2, uv1];
  
  return `${firstPos}-${secondPos}-${firstUV}-${secondUV}`;
}



/**
 * Calculate normals for vertices and faces
 */
export function calculateNormals(
  mesh: EditableMesh,
  params: NormalGenerationParams
): void {
  if (params.smooth) {
    calculateSmoothVertexNormals(mesh, params);
  } else {
    calculateFlatVertexNormals(mesh);
  }
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

/**
 * Calculate smooth vertex normals
 */
function calculateSmoothVertexNormals(
  mesh: EditableMesh,
  params: NormalGenerationParams
): void {
  // Reset vertex normals
  mesh.vertices.forEach(vertex => {
    vertex.normal = new Vector3(0, 0, 0);
  });
  
  // Accumulate face normals
  mesh.faces.forEach(face => {
    const faceNormal = calculateFaceNormal(mesh, face);
    face.vertices.forEach(vertexId => {
      const vertex = mesh.getVertex(vertexId);
      if (vertex && vertex.normal) {
        vertex.normal.add(faceNormal);
      }
    });
  });
  
  // Normalize vertex normals
  mesh.vertices.forEach(vertex => {
    if (vertex.normal && vertex.normal.length() > 0) {
      vertex.normal.normalize();
    }
  });
}

/**
 * Calculate flat vertex normals
 */
function calculateFlatVertexNormals(mesh: EditableMesh): void {
  mesh.faces.forEach(face => {
    const faceNormal = calculateFaceNormal(mesh, face);
    face.vertices.forEach(vertexId => {
      const vertex = mesh.getVertex(vertexId);
      if (vertex) {
        vertex.normal = faceNormal.clone();
      }
    });
  });
}

/**
 * Assign materials to faces
 */
export function assignMaterials(
  faces: Face[],
  params: MaterialAssignmentParams
): void {
  switch (params.strategy) {
    case 'per-face':
      assignPerFaceMaterials(faces, params.faceMaterialIds || []);
      break;
    case 'per-material-group':
      assignMaterialGroups(faces, params);
      break;
    case 'uniform':
    default:
      assignUniformMaterial(faces, params.baseMaterialId);
      break;
  }
}

/**
 * Assign uniform material to all faces
 */
function assignUniformMaterial(faces: Face[], materialId: number): void {
  faces.forEach(face => {
    face.materialIndex = materialId;
  });
}

/**
 * Assign different materials per face
 */
function assignPerFaceMaterials(faces: Face[], materialIds: number[]): void {
  faces.forEach((face, index) => {
    face.materialIndex = materialIds[index] ?? materialIds[0] ?? 0;
  });
}

/**
 * Assign materials by groups
 */
function assignMaterialGroups(faces: Face[], params: MaterialAssignmentParams): void {
  // Simple group assignment - could be enhanced
  assignUniformMaterial(faces, params.baseMaterialId);
}

/**
 * Create primitive context
 */
export function createPrimitiveContext(
  mesh: EditableMesh,
  options: any
): PrimitiveContext {
  return {
    mesh,
    edgeKeyCache: new EdgeKeyCache(),
    materialId: options.materialId ?? 0,
    validate: options.validate ?? true,
    uvLayout: options.uvLayout ?? 'standard',
    smoothNormals: options.smoothNormals ?? false
  };
}

/**
 * Normalize options with defaults
 */
export function normalizeOptions<T extends Record<string, any>>(
  options: T,
  defaults: Partial<T>
): T {
  return { ...defaults, ...options };
}

/**
 * Validate primitive options
 */
export function validatePrimitiveOptions(
  options: any,
  validators: Record<string, (value: any) => boolean>
): void {
  Object.entries(validators).forEach(([key, validator]) => {
    if (options[key] !== undefined && !validator(options[key])) {
      throw new Error(`Invalid value for ${key}: ${options[key]}`);
    }
  });
}

/**
 * Create a vertex grid
 */
export function createVertexGrid(
  mesh: EditableMesh,
  width: number,
  height: number,
  generator: (x: number, y: number) => VertexOptions,
  context?: PrimitiveContext
): number[][] {
  const grid: number[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const options = generator(x, y);
      const result = createVertex(mesh, options, context);
      row.push(result.id);
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Create faces from a vertex grid
 */
export function createFacesFromGrid(
  mesh: EditableMesh,
  grid: number[][],
  materialId: number = 0,
  context?: PrimitiveContext
): number[] {
  const faceIds: number[] = [];
  
  for (let y = 0; y < grid.length - 1; y++) {
    for (let x = 0; x < grid[y].length - 1; x++) {
      const v1 = grid[y][x];
      const v2 = grid[y][x + 1];
      const v3 = grid[y + 1][x + 1];
      const v4 = grid[y + 1][x];
      
      // Create two triangular faces
      const face1 = createFace(mesh, {
        vertexIds: [v1, v2, v3],
        materialId
      }, context);
      
      const face2 = createFace(mesh, {
        vertexIds: [v1, v3, v4],
        materialId
      }, context);
      
      faceIds.push(face1.id, face2.id);
    }
  }
  
  return faceIds;
}

/**
 * Calculate bounding box for vertices
 */
export function calculateBoundingBox(vertices: Vertex[]): {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  size: Vector3;
} {
  if (vertices.length === 0) {
    return {
      min: new Vector3(0, 0, 0),
      max: new Vector3(0, 0, 0),
      center: new Vector3(0, 0, 0),
      size: new Vector3(0, 0, 0)
    };
  }
  
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  
  vertices.forEach(vertex => {
    min.x = Math.min(min.x, vertex.x);
    min.y = Math.min(min.y, vertex.y);
    min.z = Math.min(min.z, vertex.z);
    
    max.x = Math.max(max.x, vertex.x);
    max.y = Math.max(max.y, vertex.y);
    max.z = Math.max(max.z, vertex.z);
  });
  
  const center = new Vector3().addVectors(min, max).multiplyScalar(0.5);
  const size = new Vector3().subVectors(max, min);
  
  return { min, max, center, size };
}

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
 * Applies a transformation matrix to all vertices in a mesh.
 * @param mesh - The mesh to transform.
 * @param matrix - The transformation matrix to apply.
 */
export function transformVertices(mesh: EditableMesh, matrix: Matrix4) {
  mesh.vertices.forEach(vertex => {
    const vec = new Vector3(vertex.x, vertex.y, vertex.z);
    vec.applyMatrix4(matrix);
    vertex.x = vec.x;
    vertex.y = vec.y;
    vertex.z = vec.z;
  });
}