import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { Vector3 } from 'three';
import { validateGeometryIntegrity } from '../validation/validateGeometryIntegrity';

/**
 * Inset tool options
 */
export interface InsetOptions {
  /** Distance to inset faces */
  distance?: number;
  /** Whether to create new faces */
  createFaces?: boolean;
  /** Whether to keep original faces */
  keepOriginal?: boolean;
  /** Tolerance for floating point comparisons */
  tolerance?: number;
  /** Whether to validate the result */
  validate?: boolean;
  /** Whether to repair geometry issues */
  repair?: boolean;
  /** Whether to preserve material assignments */
  preserveMaterials?: boolean;
  /** Whether to merge coincident vertices */
  mergeVertices?: boolean;
  /** Material index for new faces */
  materialIndex?: number;
  /** Whether to inset all faces or only selected faces */
  insetAll?: boolean;
  /** Whether to create individual insets or connected inset */
  individual?: boolean;
}

/**
 * Inset operation result
 */
export interface InsetResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
  /** Number of vertices created */
  verticesCreated: number;
  /** Number of edges created */
  edgesCreated: number;
  /** Number of faces created */
  facesCreated: number;
  /** Validation results if validation was performed */
  validation?: any;
  /** Statistics about the operation */
  statistics?: {
    inputVertices: number;
    inputEdges: number;
    inputFaces: number;
    outputVertices: number;
    outputEdges: number;
    outputFaces: number;
    processingTime: number;
  };
}

/**
 * Perform inset operation on selected faces
 */
export function insetFaces(
  mesh: EditableMesh,
  faceIndices: number[],
  options: InsetOptions = {}
): InsetResult {
  const startTime = performance.now();
  const {
    distance = 0.1,
    createFaces = true,
    keepOriginal = true,
    tolerance = 1e-6,
    validate = true,
    repair = false,
    preserveMaterials = true,
    mergeVertices = true,
    materialIndex,
    individual = false
  } = options;

  try {
    // Validate input
    if (!mesh || mesh.vertices.length === 0) {
      return {
        success: false,
        error: 'Invalid mesh: mesh is null or has no vertices',
        verticesCreated: 0,
        edgesCreated: 0,
        facesCreated: 0
      };
    }

    if (!faceIndices || faceIndices.length === 0) {
      return {
        success: false,
        error: 'No faces selected for inset operation',
        verticesCreated: 0,
        edgesCreated: 0,
        facesCreated: 0
      };
    }

    const inputStats = {
      inputVertices: mesh.vertices.length,
      inputEdges: mesh.edges.length,
      inputFaces: mesh.faces.length
    };

    let verticesCreated = 0;
    let edgesCreated = 0;
    let facesCreated = 0;

    // Process each selected face
    for (const faceIndex of faceIndices) {
      if (faceIndex < 0 || faceIndex >= mesh.faces.length) {
        continue; // Skip invalid face indices
      }

      const result = insetSingleFace(mesh, faceIndex, {
        distance,
        createFaces,
        keepOriginal,
        tolerance,
        preserveMaterials,
        materialIndex
      });

      if (result.success) {
        verticesCreated += result.verticesCreated;
        edgesCreated += result.edgesCreated;
        facesCreated += result.facesCreated;
      }
    }

    // Post-process the mesh
    if (mergeVertices) {
      mergeCoincidentVertices(mesh, tolerance);
    }

    // Validate if requested
    let validation;
    if (validate) {
      validation = validateGeometryIntegrity(mesh);
      if (!validation.valid && repair) {
        // TODO: Implement repair functionality
        console.warn('Geometry validation failed, repair not yet implemented');
      }
    }

    const processingTime = performance.now() - startTime;

    return {
      success: true,
      verticesCreated,
      edgesCreated,
      facesCreated,
      validation,
      statistics: {
        ...inputStats,
        outputVertices: mesh.vertices.length,
        outputEdges: mesh.edges.length,
        outputFaces: mesh.faces.length,
        processingTime
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Inset operation failed: ${error instanceof Error ? error.message : String(error)}`,
      verticesCreated: 0,
      edgesCreated: 0,
      facesCreated: 0
    };
  }
}

/**
 * Inset a single face
 */
function insetSingleFace(
  mesh: EditableMesh,
  faceIndex: number,
  options: Required<Pick<InsetOptions, 'distance' | 'createFaces' | 'keepOriginal' | 'tolerance' | 'preserveMaterials'>> & { materialIndex?: number }
): InsetResult {
  const { distance, createFaces, keepOriginal, tolerance, preserveMaterials, materialIndex } = options;
  
  const face = mesh.faces[faceIndex];
  if (!face || face.vertices.length < 3) {
    return {
      success: false,
      error: 'Invalid face for inset operation',
      verticesCreated: 0,
      edgesCreated: 0,
      facesCreated: 0
    };
  }

  let verticesCreated = 0;
  let edgesCreated = 0;
  let facesCreated = 0;

  // Calculate face normal
  const faceNormal = calculateFaceNormal(face, mesh);

  // Create inset vertices by moving along face edges inward
  const insetVertices: number[] = [];
  for (let i = 0; i < face.vertices.length; i++) {
    const currentVertexIndex = face.vertices[i];
    const nextVertexIndex = face.vertices[(i + 1) % face.vertices.length];
    const prevVertexIndex = face.vertices[(i - 1 + face.vertices.length) % face.vertices.length];
    
    const currentVertex = mesh.vertices[currentVertexIndex];
    const nextVertex = mesh.vertices[nextVertexIndex];
    const prevVertex = mesh.vertices[prevVertexIndex];
    
    if (!currentVertex || !nextVertex || !prevVertex) continue;

    // Calculate edge vectors
    const edge1 = new Vector3().subVectors(currentVertex.toVector3(), prevVertex.toVector3()).normalize();
    const edge2 = new Vector3().subVectors(nextVertex.toVector3(), currentVertex.toVector3()).normalize();
    
    // Calculate inward direction (average of edge normals)
    const inwardDir = new Vector3().addVectors(edge1, edge2).normalize();
    
    // Project inward direction onto face plane
    const projectedInward = new Vector3().subVectors(
      inwardDir, 
      faceNormal.clone().multiplyScalar(inwardDir.dot(faceNormal))
    ).normalize();
    
    // Create inset vertex
    const insetPosition = new Vector3().addVectors(
      currentVertex.toVector3(),
      projectedInward.multiplyScalar(distance)
    );

    const insetVertex = new Vertex(insetPosition.x, insetPosition.y, insetPosition.z);
    
    // Copy UV coordinates from original vertex
    if (currentVertex.uv) {
      insetVertex.uv = { u: currentVertex.uv.u, v: currentVertex.uv.v };
    } else {
      insetVertex.uv = { u: 0, v: 0 };
    }
    
    const newVertexIndex = mesh.addVertex(insetVertex);
    insetVertices.push(newVertexIndex);
    verticesCreated++;
  }

  // Create inset face
  if (createFaces && insetVertices.length >= 3) {
    // Create edges for the inset face first
    const insetFaceEdges: number[] = [];
    for (let i = 0; i < insetVertices.length; i++) {
      const nextI = (i + 1) % insetVertices.length;
      const edge = new Edge(insetVertices[i], insetVertices[nextI]);
      const edgeIndex = mesh.addEdge(edge);
      insetFaceEdges.push(edgeIndex);
      edgesCreated++;
    }
    
    const insetFace = new Face(insetVertices, insetFaceEdges, {
      materialIndex: preserveMaterials ? face.materialIndex : materialIndex
    });
    
    // Calculate and assign normal to inset face
    const insetFaceNormal = calculateFaceNormal(insetFace, mesh);
    insetFace.normal = insetFaceNormal;
    
    mesh.addFace(insetFace);
    facesCreated++;

    // Create connecting faces between original and inset
    for (let i = 0; i < face.vertices.length; i++) {
      const nextI = (i + 1) % face.vertices.length;
      
      const originalV1 = face.vertices[i];
      const originalV2 = face.vertices[nextI];
      const insetV1 = insetVertices[i];
      const insetV2 = insetVertices[nextI];

      // Create edges for the connecting face
      const connectingFaceEdges: number[] = [];
      
      // Edge 1: originalV1 to originalV2
      const edge1 = new Edge(originalV1, originalV2);
      const edge1Index = mesh.addEdge(edge1);
      connectingFaceEdges.push(edge1Index);
      edgesCreated++;
      
      // Edge 2: originalV2 to insetV2
      const edge2 = new Edge(originalV2, insetV2);
      const edge2Index = mesh.addEdge(edge2);
      connectingFaceEdges.push(edge2Index);
      edgesCreated++;
      
      // Edge 3: insetV2 to insetV1
      const edge3 = new Edge(insetV2, insetV1);
      const edge3Index = mesh.addEdge(edge3);
      connectingFaceEdges.push(edge3Index);
      edgesCreated++;
      
      // Edge 4: insetV1 to originalV1
      const edge4 = new Edge(insetV1, originalV1);
      const edge4Index = mesh.addEdge(edge4);
      connectingFaceEdges.push(edge4Index);
      edgesCreated++;

      // Create connecting face with proper winding order and edge associations
      const connectingFace = new Face([originalV1, originalV2, insetV2, insetV1], connectingFaceEdges, {
        materialIndex: preserveMaterials ? face.materialIndex : materialIndex
      });
      
      // Calculate and assign normal to connecting face
      const connectingFaceNormal = calculateFaceNormal(connectingFace, mesh);
      connectingFace.normal = connectingFaceNormal;
      
      mesh.addFace(connectingFace);
      facesCreated++;
    }
  }

  // Remove original face if not keeping it
  if (!keepOriginal) {
    mesh.removeFace(faceIndex);
  }

  return {
    success: true,
    verticesCreated,
    edgesCreated,
    facesCreated
  };
}

/**
 * Calculate face normal
 */
function calculateFaceNormal(face: Face, mesh: EditableMesh): Vector3 {
  if (face.vertices.length < 3) {
    return new Vector3(0, 1, 0);
  }

  const v0 = mesh.vertices[face.vertices[0]];
  const v1 = mesh.vertices[face.vertices[1]];
  const v2 = mesh.vertices[face.vertices[2]];

  if (!v0 || !v1 || !v2) {
    return new Vector3(0, 1, 0);
  }

  const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
  const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);

  return edge1.cross(edge2).normalize();
}

/**
 * Calculate face center
 */
function calculateFaceCenter(face: Face, mesh: EditableMesh): Vector3 {
  const center = new Vector3();
  let validVertices = 0;

  for (const vertexIndex of face.vertices) {
    const vertex = mesh.vertices[vertexIndex];
    if (vertex) {
      center.add(new Vector3(vertex.x, vertex.y, vertex.z));
      validVertices++;
    }
  }

  if (validVertices > 0) {
    center.divideScalar(validVertices);
  }

  return center;
}

/**
 * Merge coincident vertices
 */
function mergeCoincidentVertices(mesh: EditableMesh, tolerance: number): void {
  const vertexRemap: number[] = [];
  for (let i = 0; i < mesh.vertices.length; i++) {
    vertexRemap[i] = i;
  }

  // Find vertices to merge
  for (let i = 0; i < mesh.vertices.length; i++) {
    for (let j = i + 1; j < mesh.vertices.length; j++) {
      const v1 = mesh.vertices[i];
      const v2 = mesh.vertices[j];
      
      if (!v1 || !v2) continue;

      const distance = Math.sqrt(
        Math.pow(v1.x - v2.x, 2) +
        Math.pow(v1.y - v2.y, 2) +
        Math.pow(v1.z - v2.z, 2)
      );

      if (distance <= tolerance) {
        vertexRemap[j] = i;
      }
    }
  }

  // Remap edges and faces
  for (const edge of mesh.edges) {
    edge.v1 = vertexRemap[edge.v1];
    edge.v2 = vertexRemap[edge.v2];
  }

  for (const face of mesh.faces) {
    face.vertices = face.vertices.map(v => vertexRemap[v]);
  }

  // Remove duplicate vertices
  const newVertices: Vertex[] = [];
  const vertexRemap2: number[] = [];
  let newIndex = 0;

  for (let i = 0; i < mesh.vertices.length; i++) {
    if (vertexRemap[i] === i) {
      newVertices.push(mesh.vertices[i]);
      vertexRemap2[i] = newIndex++;
    }
  }

  // Update edges and faces with new indices
  for (const edge of mesh.edges) {
    edge.v1 = vertexRemap2[edge.v1];
    edge.v2 = vertexRemap2[edge.v2];
  }

  for (const face of mesh.faces) {
    face.vertices = face.vertices.map(v => vertexRemap2[v]);
  }

  mesh.vertices = newVertices;
}

/**
 * Inset all faces in the mesh
 */
export function insetAllFaces(
  mesh: EditableMesh,
  options: InsetOptions = {}
): InsetResult {
  const faceIndices = Array.from({ length: mesh.faces.length }, (_, i) => i);
  return insetFaces(mesh, faceIndices, { ...options, insetAll: true });
}

/**
 * Inset individual faces (each face gets its own inset)
 */
export function insetIndividualFaces(
  mesh: EditableMesh,
  faceIndices: number[],
  options: InsetOptions = {}
): InsetResult {
  return insetFaces(mesh, faceIndices, { ...options, individual: true });
} 