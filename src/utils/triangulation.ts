import { EditableMesh } from '../core/EditableMesh';
import { Face, FaceType } from '../core/Face';
import { Edge } from '../core/Edge';
import { Vector3 } from 'three';

/**
 * Options for triangulation
 */
export interface TriangulationOptions {
  /** Method to use for triangulating quads */
  quadMethod?: 'diagonal' | 'optimal';
  /** Method to use for triangulating n-gons */
  ngonMethod?: 'earcut' | 'fan';
  /** Whether to preserve the original mesh */
  preserveOriginal?: boolean;
}

/**
 * Result of triangulation operation
 */
export interface TriangulationResult {
  /** The triangulated mesh */
  mesh: EditableMesh;
  /** Mapping from original face indices to new triangle face indices */
  faceMapping: Map<number, number[]>;
  /** Statistics about the triangulation */
  stats: {
    originalFaces: number;
    triangleFaces: number;
    quadsTriangulated: number;
    ngonsTriangulated: number;
  };
}

/**
 * Triangulates a mesh for export to formats that require triangles
 * @param mesh The mesh to triangulate
 * @param options Triangulation options
 * @returns Triangulated mesh and mapping information
 */
export function triangulateForExport(
  mesh: EditableMesh, 
  options: TriangulationOptions = {}
): TriangulationResult {
  const {
    quadMethod = 'diagonal',
    ngonMethod = 'earcut',
    preserveOriginal = true
  } = options;

  // Create a new mesh or use the original
  const resultMesh = preserveOriginal ? mesh.clone() : mesh;
  const faceMapping = new Map<number, number[]>();
  
  let quadsTriangulated = 0;
  let ngonsTriangulated = 0;
  const originalFaces = mesh.getFaceCount();

  // Process faces in reverse order to avoid index shifting
  for (let i = mesh.getFaceCount() - 1; i >= 0; i--) {
    const face = mesh.getFace(i);
    if (!face) continue;

    const faceType = face.getFaceType();
    const newFaceIndices: number[] = [];

    if (faceType === FaceType.TRIANGLE) {
      // Triangles are already in the correct format
      newFaceIndices.push(i);
    } else if (faceType === FaceType.QUAD) {
      // Triangulate quad
      const triangles = triangulateQuad(face, resultMesh, quadMethod);
      newFaceIndices.push(...triangles);
      quadsTriangulated++;
    } else if (faceType === FaceType.NGON) {
      // Triangulate n-gon
      const triangles = triangulateNgon(face, resultMesh, ngonMethod);
      newFaceIndices.push(...triangles);
      ngonsTriangulated++;
    }

    faceMapping.set(i, newFaceIndices);
  }

  return {
    mesh: resultMesh,
    faceMapping,
    stats: {
      originalFaces,
      triangleFaces: resultMesh.getFaceCount(),
      quadsTriangulated,
      ngonsTriangulated
    }
  };
}

/**
 * Triangulates a quad face
 * @param face The quad face to triangulate
 * @param mesh The mesh containing the face
 * @param method The triangulation method
 * @returns Array of new triangle face indices
 */
function triangulateQuad(
  face: Face, 
  mesh: EditableMesh, 
  method: 'diagonal' | 'optimal'
): number[] {
  const vertexIds = face.vertices;
  const materialId = face.materialIndex;
  const faceVertexUvs = face.faceVertexUvs;

  if (method === 'optimal') {
    // Use optimal diagonal based on face shape
    return triangulateQuadOptimal(face, mesh);
  } else {
    // Use simple diagonal split
    return triangulateQuadDiagonal(face, mesh);
  }
}

/**
 * Triangulates a quad using diagonal split
 * @param face The quad face
 * @param mesh The mesh
 * @returns Array of new triangle face indices
 */
function triangulateQuadDiagonal(face: Face, mesh: EditableMesh): number[] {
  const vertexIds = face.vertices;
  const materialId = face.materialIndex;
  const faceVertexUvs = face.faceVertexUvs;

  // Create two triangles: [0,1,2] and [0,2,3]
  const triangle1 = createTriangleFace(mesh, [vertexIds[0], vertexIds[1], vertexIds[2]], materialId, faceVertexUvs.slice(0, 3));
  const triangle2 = createTriangleFace(mesh, [vertexIds[0], vertexIds[2], vertexIds[3]], materialId, [faceVertexUvs[0], faceVertexUvs[2], faceVertexUvs[3]]);

  return [triangle1, triangle2];
}

/**
 * Triangulates a quad using optimal diagonal
 * @param face The quad face
 * @param mesh The mesh
 * @returns Array of new triangle face indices
 */
function triangulateQuadOptimal(face: Face, mesh: EditableMesh): number[] {
  const vertexIds = face.vertices;
  const materialId = face.materialIndex;
  const faceVertexUvs = face.faceVertexUvs;

  // Get vertex positions
  const v0 = mesh.getVertex(vertexIds[0]);
  const v1 = mesh.getVertex(vertexIds[1]);
  const v2 = mesh.getVertex(vertexIds[2]);
  const v3 = mesh.getVertex(vertexIds[3]);

  if (!v0 || !v1 || !v2 || !v3) {
    return triangulateQuadDiagonal(face, mesh);
  }

  // Calculate diagonal lengths
  const diagonal1Length = v0.distanceTo(v2);
  const diagonal2Length = v1.distanceTo(v3);

  // Use the shorter diagonal
  if (diagonal1Length <= diagonal2Length) {
    // Use diagonal [0,2]
    const triangle1 = createTriangleFace(mesh, [vertexIds[0], vertexIds[1], vertexIds[2]], materialId, faceVertexUvs.slice(0, 3));
    const triangle2 = createTriangleFace(mesh, [vertexIds[0], vertexIds[2], vertexIds[3]], materialId, [faceVertexUvs[0], faceVertexUvs[2], faceVertexUvs[3]]);
    return [triangle1, triangle2];
  } else {
    // Use diagonal [1,3]
    const triangle1 = createTriangleFace(mesh, [vertexIds[0], vertexIds[1], vertexIds[3]], materialId, [faceVertexUvs[0], faceVertexUvs[1], faceVertexUvs[3]]);
    const triangle2 = createTriangleFace(mesh, [vertexIds[1], vertexIds[2], vertexIds[3]], materialId, faceVertexUvs.slice(1, 4));
    return [triangle1, triangle2];
  }
}

/**
 * Triangulates an n-gon face
 * @param face The n-gon face to triangulate
 * @param mesh The mesh containing the face
 * @param method The triangulation method
 * @returns Array of new triangle face indices
 */
function triangulateNgon(
  face: Face, 
  mesh: EditableMesh, 
  method: 'earcut' | 'fan'
): number[] {
  if (method === 'earcut') {
    return triangulateNgonEarcut(face, mesh);
  } else {
    return triangulateNgonFan(face, mesh);
  }
}

/**
 * Triangulates an n-gon using fan triangulation
 * @param face The n-gon face
 * @param mesh The mesh
 * @returns Array of new triangle face indices
 */
function triangulateNgonFan(face: Face, mesh: EditableMesh): number[] {
  const vertexIds = face.vertices;
  const materialId = face.materialIndex;
  const faceVertexUvs = face.faceVertexUvs;
  const triangleIndices: number[] = [];

  // Fan triangulation: create triangles from center vertex to each edge
  const centerVertex = vertexIds[0];
  const centerUV = faceVertexUvs[0];

  for (let i = 1; i < vertexIds.length - 1; i++) {
    const triangle = createTriangleFace(
      mesh,
      [centerVertex, vertexIds[i], vertexIds[i + 1]],
      materialId,
      [centerUV, faceVertexUvs[i], faceVertexUvs[i + 1]]
    );
    triangleIndices.push(triangle);
  }

  return triangleIndices;
}

/**
 * Triangulates an n-gon using earcut algorithm (simplified)
 * @param face The n-gon face
 * @param mesh The mesh
 * @returns Array of new triangle face indices
 */
function triangulateNgonEarcut(face: Face, mesh: EditableMesh): number[] {
  // For now, fall back to fan triangulation
  // TODO: Implement proper earcut algorithm
  return triangulateNgonFan(face, mesh);
}

/**
 * Creates a triangle face in the mesh
 * @param mesh The mesh
 * @param vertexIds The vertex indices for the triangle
 * @param materialId The material ID
 * @param faceVertexUvs The UV coordinates
 * @returns The index of the created face
 */
function createTriangleFace(
  mesh: EditableMesh,
  vertexIds: number[],
  materialId: number,
  faceVertexUvs: any[]
): number {
  // Create edges for the triangle
  const edgeIds: number[] = [];
  for (let i = 0; i < 3; i++) {
    const v1 = vertexIds[i];
    const v2 = vertexIds[(i + 1) % 3];
    
    // Find or create edge
    let edgeId = -1;
    for (let j = 0; j < mesh.getEdgeCount(); j++) {
      const edge = mesh.getEdge(j);
      if (edge && 
          ((edge.v1 === v1 && edge.v2 === v2) || 
           (edge.v1 === v2 && edge.v2 === v1))) {
        edgeId = j;
        break;
      }
    }
    
    if (edgeId === -1) {
      // Create new edge
      const edge = new Edge(v1, v2);
      edgeId = mesh.addEdge(edge);
    }
    
    edgeIds.push(edgeId);
  }

  // Create the triangle face
  const triangleFace = new Face(vertexIds, edgeIds, {
    materialIndex: materialId,
    faceVertexUvs: faceVertexUvs
  });

  return mesh.addFace(triangleFace);
}

/**
 * Merges adjacent triangles into quads where possible
 * @param mesh The mesh to process
 * @returns Number of quads created
 */
export function mergeTrianglesToQuads(mesh: EditableMesh): number {
  // TODO: Implement triangle-to-quad merging
  // This is a complex operation that requires:
  // 1. Finding adjacent triangles
  // 2. Checking if they can form a valid quad
  // 3. Merging them while preserving topology
  return 0;
} 