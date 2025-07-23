import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { Vector3 } from 'three';
import { validateGeometryIntegrity } from '../validation/validateGeometryIntegrity';

/**
 * Knife tool options
 */
export interface KnifeOptions {
  /** Whether to create new vertices at intersection points */
  createVertices?: boolean;
  /** Whether to split faces along the cut line */
  splitFaces?: boolean;
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
  /** Whether to create new edges along the cut */
  createEdges?: boolean;
  /** Whether to fill holes created by the cut */
  fillHoles?: boolean;
}

/**
 * Knife cut result
 */
export interface KnifeResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
  /** Number of vertices created */
  verticesCreated: number;
  /** Number of edges created */
  edgesCreated: number;
  /** Number of faces split */
  facesSplit: number;
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
 * Line segment for knife cuts
 */
export interface CutLine {
  start: Vector3;
  end: Vector3;
}

/**
 * Intersection point information
 */
interface IntersectionPoint {
  position: Vector3;
  faceIndex: number;
  edgeIndices: number[];
  parameter: number; // 0-1 along the cut line
}

/**
 * Perform knife cut operation on a mesh
 * @param mesh The mesh to cut
 * @param cutLines Array of cut lines
 * @param options Knife tool options
 * @returns Knife operation result
 */
export function knifeCut(
  mesh: EditableMesh,
  cutLines: CutLine[],
  options: KnifeOptions = {}
): KnifeResult {
  const startTime = performance.now();
  const {
    createVertices = true,
    splitFaces = true,
    tolerance = 1e-6,
    validate = true,
    repair = false,
    preserveMaterials = true,
    mergeVertices = true,
    createEdges = true,
    fillHoles = true
  } = options;

  try {
    // Validate input
    if (!mesh || mesh.vertices.length === 0) {
      return {
        success: false,
        error: 'Invalid mesh: mesh is null or has no vertices',
        verticesCreated: 0,
        edgesCreated: 0,
        facesSplit: 0
      };
    }

    if (!cutLines || cutLines.length === 0) {
      return {
        success: false,
        error: 'No cut lines provided',
        verticesCreated: 0,
        edgesCreated: 0,
        facesSplit: 0
      };
    }

    const inputStats = {
      inputVertices: mesh.vertices.length,
      inputEdges: mesh.edges.length,
      inputFaces: mesh.faces.length
    };

    let verticesCreated = 0;
    let edgesCreated = 0;
    let facesSplit = 0;

    // Process each cut line
    for (const cutLine of cutLines) {
      const result = processCutLine(mesh, cutLine, {
        createVertices,
        splitFaces,
        tolerance,
        preserveMaterials,
        createEdges,
        fillHoles
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          verticesCreated,
          edgesCreated,
          facesSplit
        };
      }

      verticesCreated += result.verticesCreated;
      edgesCreated += result.edgesCreated;
      facesSplit += result.facesSplit;
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
      facesSplit,
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
      error: `Knife cut failed: ${error instanceof Error ? error.message : String(error)}`,
      verticesCreated: 0,
      edgesCreated: 0,
      facesSplit: 0
    };
  }
}

/**
 * Process a single cut line
 */
function processCutLine(
  mesh: EditableMesh,
  cutLine: CutLine,
  options: Required<Pick<KnifeOptions, 'createVertices' | 'splitFaces' | 'tolerance' | 'preserveMaterials' | 'createEdges' | 'fillHoles'>>
): KnifeResult {
  const { createVertices, splitFaces, tolerance, preserveMaterials, createEdges, fillHoles } = options;

  console.log('processCutLine called with options:', { createVertices, splitFaces, tolerance, preserveMaterials, createEdges, fillHoles });

  let verticesCreated = 0;
  let edgesCreated = 0;
  let facesSplit = 0;

  // Find intersections with faces
  const intersections = findFaceIntersections(mesh, cutLine, tolerance);

  console.log('Found intersections:', intersections.length);

  // Create vertices at intersection points only if requested
  const newVertexIndices: number[] = [];
  if (createVertices) {
    if (intersections.length > 0) {
      console.log('Creating vertices at', intersections.length, 'intersection points');
      for (const intersection of intersections) {
        const vertexIndex = createVertexAtPosition(mesh, intersection.position);
        newVertexIndices.push(vertexIndex);
        verticesCreated++;
        console.log('Created vertex at', intersection.position, 'with index', vertexIndex);
      }
    } else {
      // For circular cuts or when no intersections are found, create vertices at start and end points
      console.log('No intersections found, creating vertices at start and end points');
      const startVertexIndex = createVertexAtPosition(mesh, cutLine.start);
      const endVertexIndex = createVertexAtPosition(mesh, cutLine.end);
      newVertexIndices.push(startVertexIndex, endVertexIndex);
      verticesCreated += 2;
      console.log('Created vertices at start', cutLine.start, 'and end', cutLine.end);
    }
  } else {
    console.log('createVertices is false, skipping vertex creation');
  }

  // Split faces that intersect with the cut line only if requested
  if (splitFaces && createVertices && intersections.length > 0) {
    console.log('Splitting faces at', intersections.length, 'intersection points');
    for (let i = 0; i < intersections.length; i++) {
      const intersection = intersections[i];
      const faceIndex = intersection.faceIndex;
      
      console.log('Splitting face', faceIndex, 'at intersection', i);
      
      if (faceIndex >= 0 && faceIndex < mesh.faces.length) {
        const splitResult = splitFaceAtIntersection(
          mesh,
          faceIndex,
          intersection,
          newVertexIndices[i],
          preserveMaterials
        );
        
        console.log('Split result for face', faceIndex, ':', splitResult);
        
        if (splitResult.success) {
          facesSplit += splitResult.facesCreated;
        }
      } else {
        console.log('Invalid face index:', faceIndex, 'mesh has', mesh.faces.length, 'faces');
      }
    }
  } else {
    console.log('splitFaces or createVertices is false, or no intersections, skipping face splitting');
  }

  // Create edges along the cut line only if requested
  if (createEdges && createVertices && newVertexIndices.length >= 2) {
    console.log('Creating edges between', newVertexIndices.length, 'vertices');
    for (let i = 0; i < newVertexIndices.length - 1; i++) {
      const edgeIndex = createEdge(mesh, newVertexIndices[i], newVertexIndices[i + 1]);
      if (edgeIndex >= 0) {
        edgesCreated++;
        console.log('Created edge between vertices', newVertexIndices[i], 'and', newVertexIndices[i + 1], 'with index', edgeIndex);
      }
    }
  }

  // Fill holes if requested
  if (fillHoles && createVertices) {
    const holesFilled = fillHolesCreatedByCut(mesh, newVertexIndices, tolerance);
    facesSplit += holesFilled;
    console.log('Filled', holesFilled, 'holes');
  }

  console.log('processCutLine result:', { verticesCreated, edgesCreated, facesSplit });

  return {
    success: true,
    verticesCreated,
    edgesCreated,
    facesSplit
  };
}

/**
 * Find intersections between a cut line and mesh faces
 */
function findFaceIntersections(
  mesh: EditableMesh,
  cutLine: CutLine,
  tolerance: number
): IntersectionPoint[] {
  const intersections: IntersectionPoint[] = [];

  // Find edge intersections first (more reliable for knife tool)
  const edgeIntersections = findEdgeIntersections(mesh, cutLine, tolerance);
  
  // Group intersections by face
  const faceIntersections = new Map<number, IntersectionPoint[]>();
  
  for (const intersection of edgeIntersections) {
    // Find faces that contain this edge
    const edge = mesh.edges[intersection.edgeIndex];
    if (!edge) continue;
    
    for (let faceIndex = 0; faceIndex < mesh.faces.length; faceIndex++) {
      const face = mesh.faces[faceIndex];
      const hasV1 = face.vertices.includes(edge.v1);
      const hasV2 = face.vertices.includes(edge.v2);
      
      if (hasV1 && hasV2) {
        if (!faceIntersections.has(faceIndex)) {
          faceIntersections.set(faceIndex, []);
        }
        faceIntersections.get(faceIndex)!.push({
          position: intersection.position,
          faceIndex,
          edgeIndices: [intersection.edgeIndex],
          parameter: intersection.parameter
        });
      }
    }
  }

  // Convert to flat array
  for (const [faceIndex, faceIntersectionList] of faceIntersections) {
    intersections.push(...faceIntersectionList);
  }

  return intersections;
}

/**
 * Find intersections between a cut line and mesh edges
 */
function findEdgeIntersections(
  mesh: EditableMesh,
  cutLine: CutLine,
  tolerance: number
): Array<{ position: Vector3; edgeIndex: number; parameter: number }> {
  const intersections: Array<{ position: Vector3; edgeIndex: number; parameter: number }> = [];

  // Calculate cut line length to determine if this is a small segment (likely from circular cut)
  const cutLineLength = cutLine.start.distanceTo(cutLine.end);
  const isSmallSegment = cutLineLength < 0.1; // Small segments from circular cuts
  
  // For small segments, use a more permissive bounding box check
  const boundingBoxExpansion = isSmallSegment ? 0.5 : 0; // Expand bounding box for small segments
  
  // Quick bounding box check to skip edges that can't possibly intersect
  const cutLineMin = new Vector3(
    Math.min(cutLine.start.x, cutLine.end.x) - boundingBoxExpansion,
    Math.min(cutLine.start.y, cutLine.end.y) - boundingBoxExpansion,
    Math.min(cutLine.start.z, cutLine.end.z) - boundingBoxExpansion
  );
  const cutLineMax = new Vector3(
    Math.max(cutLine.start.x, cutLine.end.x) + boundingBoxExpansion,
    Math.max(cutLine.start.y, cutLine.end.y) + boundingBoxExpansion,
    Math.max(cutLine.start.z, cutLine.end.z) + boundingBoxExpansion
  );

  for (let edgeIndex = 0; edgeIndex < mesh.edges.length; edgeIndex++) {
    const edge = mesh.edges[edgeIndex];
    const v1 = mesh.vertices[edge.v1];
    const v2 = mesh.vertices[edge.v2];
    
    // Quick bounding box check
    const edgeMin = new Vector3(
      Math.min(v1.x, v2.x),
      Math.min(v1.y, v2.y),
      Math.min(v1.z, v2.z)
    );
    const edgeMax = new Vector3(
      Math.max(v1.x, v2.x),
      Math.max(v1.y, v2.y),
      Math.max(v1.z, v2.z)
    );

    // Check if bounding boxes overlap
    if (edgeMax.x < cutLineMin.x || edgeMin.x > cutLineMax.x ||
        edgeMax.y < cutLineMin.y || edgeMin.y > cutLineMax.y ||
        edgeMax.z < cutLineMin.z || edgeMin.z > cutLineMax.z) {
      continue; // No intersection possible
    }

    // Debug: print edge and cut line being checked
    console.log('Checking edge', edgeIndex, 'from', v1, 'to', v2, 'against cut line', cutLine.start, cutLine.end);
    
    const intersection = lineLineIntersection(
      cutLine,
      { start: new Vector3(v1.x, v1.y, v1.z), end: new Vector3(v2.x, v2.y, v2.z) },
      tolerance
    );
    
    if (intersection) {
      console.log('Intersection found at', intersection.position, 'on edge', edgeIndex);
      intersections.push({
        position: intersection.position,
        edgeIndex,
        parameter: intersection.parameter
      });
    }
  }

  return intersections;
}

/**
 * Find intersection between two line segments
 */
function lineLineIntersection(
  line1: CutLine,
  line2: CutLine,
  tolerance: number
): { position: Vector3; parameter: number } | null {
  const p1 = line1.start;
  const p2 = line1.end;
  const p3 = line2.start;
  const p4 = line2.end;

  const d1 = p2.clone().sub(p1);
  const d2 = p4.clone().sub(p3);
  const d3 = p3.clone().sub(p1);

  const cross1 = d1.clone().cross(d2);
  const cross2 = d3.clone().cross(d2);
  const cross3 = d3.clone().cross(d1);

  const denominator = cross1.lengthSq();
  
  if (denominator < tolerance * tolerance) {
    return null; // Lines are parallel
  }

  const t1 = cross2.dot(cross1) / denominator;
  const t2 = cross3.dot(cross1) / denominator;

  // Check if intersection is within both line segments with some tolerance
  // Use a small tolerance to handle floating-point precision issues
  const segmentTolerance = tolerance * 0.1;
  if (t1 >= -segmentTolerance && t1 <= 1 + segmentTolerance && 
      t2 >= -segmentTolerance && t2 <= 1 + segmentTolerance) {
    const intersection = p1.clone().add(d1.multiplyScalar(t1));
    return {
      position: intersection,
      parameter: t1
    };
  }

  return null;
}

/**
 * Calculate face normal from vertices
 */
function calculateFaceNormal(vertices: Vertex[]): Vector3 {
  if (vertices.length < 3) {
    return new Vector3(0, 1, 0);
  }

  const v0 = vertices[0];
  const v1 = vertices[1];
  const v2 = vertices[2];

  const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
  const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);

  return edge1.cross(edge2).normalize();
}

/**
 * Calculate parameter along a line
 */
function calculateLineParameter(line: CutLine, point: Vector3): number {
  const lineVector = new Vector3(
    line.end.x - line.start.x,
    line.end.y - line.start.y,
    line.end.z - line.start.z
  );
  
  const pointVector = new Vector3(
    point.x - line.start.x,
    point.y - line.start.y,
    point.z - line.start.z
  );

  const lineLength = lineVector.length();
  if (lineLength < 1e-10) {
    return 0;
  }

  return pointVector.dot(lineVector) / (lineLength * lineLength);
}

/**
 * Find edge between two vertices
 */
function findEdgeBetweenVertices(mesh: EditableMesh, vertexIndex1: number, vertexIndex2: number): number {
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    if ((edge.v1 === vertexIndex1 && edge.v2 === vertexIndex2) ||
        (edge.v1 === vertexIndex2 && edge.v2 === vertexIndex1)) {
      return i;
    }
  }
  return -1;
}

/**
 * Create a vertex at a specific position
 */
function createVertexAtPosition(mesh: EditableMesh, position: Vector3): number {
  const vertex = new Vertex(position.x, position.y, position.z);
  mesh.vertices.push(vertex);
  return mesh.vertices.length - 1;
}

/**
 * Create an edge between two vertices
 */
function createEdge(mesh: EditableMesh, vertexIndex1: number, vertexIndex2: number): number {
  if (vertexIndex1 === vertexIndex2) {
    return -1; // Don't create self-loops
  }

  // Check if edge already exists
  const existingEdge = findEdgeBetweenVertices(mesh, vertexIndex1, vertexIndex2);
  if (existingEdge >= 0) {
    return existingEdge;
  }

  const edge = new Edge(vertexIndex1, vertexIndex2);
  mesh.edges.push(edge);
  return mesh.edges.length - 1;
}

/**
 * Split a face at an intersection point
 */
function splitFaceAtIntersection(
  mesh: EditableMesh,
  faceIndex: number,
  intersection: IntersectionPoint,
  newVertexIndex: number,
  preserveMaterials: boolean
): { success: boolean; facesCreated: number } {
  const face = mesh.faces[faceIndex];
  if (!face) {
    return { success: false, facesCreated: 0 };
  }

  // Simple face splitting: create two new faces
  const originalVertices = [...face.vertices];
  const materialIndex = preserveMaterials ? face.materialIndex : 0;

  // Find the best position to insert the new vertex
  let insertIndex = 0;
  let minDistance = Infinity;

  for (let i = 0; i < originalVertices.length; i++) {
    const vertex = mesh.vertices[originalVertices[i]];
    const distance = new Vector3(vertex.x, vertex.y, vertex.z)
      .distanceTo(intersection.position);
    
    if (distance < minDistance) {
      minDistance = distance;
      insertIndex = i;
    }
  }

  // Create first new face
  const face1Vertices = [...originalVertices];
  face1Vertices.splice(insertIndex, 0, newVertexIndex);
  
  const face1 = new Face(face1Vertices);
  face1.materialIndex = materialIndex;
  mesh.faces.push(face1);

  // Create second new face
  const face2Vertices = [...originalVertices];
  face2Vertices.splice((insertIndex + 1) % originalVertices.length, 0, newVertexIndex);
  
  const face2 = new Face(face2Vertices);
  face2.materialIndex = materialIndex;
  mesh.faces.push(face2);

  // Remove original face
  mesh.faces.splice(faceIndex, 1);

  return { success: true, facesCreated: 2 };
}

/**
 * Fill holes created by the cut
 */
function fillHolesCreatedByCut(
  mesh: EditableMesh,
  newVertexIndices: number[],
  tolerance: number
): number {
  if (newVertexIndices.length < 3) {
    return 0;
  }

  let holesFilled = 0;

  // Simple hole filling: create triangular faces
  for (let i = 1; i < newVertexIndices.length - 1; i++) {
    const face = new Face([
      newVertexIndices[0],
      newVertexIndices[i],
      newVertexIndices[i + 1]
    ]);
    face.materialIndex = 0;
    mesh.faces.push(face);
    holesFilled++;
  }

  return holesFilled;
}

/**
 * Merge coincident vertices
 */
function mergeCoincidentVertices(mesh: EditableMesh, tolerance: number): void {
  const vertexMap = new Map<string, number>();
  const vertexRemap: number[] = [];

  // Build vertex map
  for (let i = 0; i < mesh.vertices.length; i++) {
    const vertex = mesh.vertices[i];
    const key = `${Math.round(vertex.x / tolerance)},${Math.round(vertex.y / tolerance)},${Math.round(vertex.z / tolerance)}`;
    
    if (vertexMap.has(key)) {
      vertexRemap[i] = vertexMap.get(key)!;
    } else {
      vertexMap.set(key, i);
      vertexRemap[i] = i;
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
 * Create a knife cut along a single line
 */
export function knifeCutLine(
  mesh: EditableMesh,
  start: Vector3,
  end: Vector3,
  options: KnifeOptions = {}
): KnifeResult {
  return knifeCut(mesh, [{ start, end }], options);
}

/**
 * Create a knife cut along multiple connected lines
 */
export function knifeCutPath(
  mesh: EditableMesh,
  points: Vector3[],
  options: KnifeOptions = {}
): KnifeResult {
  if (points.length < 2) {
    return {
      success: false,
      error: 'At least 2 points required for a path cut',
      verticesCreated: 0,
      edgesCreated: 0,
      facesSplit: 0
    };
  }

  const cutLines: CutLine[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    cutLines.push({
      start: points[i],
      end: points[i + 1]
    });
  }

  return knifeCut(mesh, cutLines, options);
}

/**
 * Create a knife cut in a circular pattern
 */
export function knifeCutCircle(
  mesh: EditableMesh,
  center: Vector3,
  radius: number,
  normal: Vector3,
  segments: number = 32,
  options: KnifeOptions = {}
): KnifeResult {
  const points: Vector3[] = [];
  normal.normalize();

  // Create two orthogonal vectors to the normal
  const u = (Math.abs(normal.x) > 0.1 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)).cross(normal).normalize();
  const v = normal.clone().cross(u).normalize();

  // Generate points on the plane defined by the normal
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const pointOnCircle = u.clone().multiplyScalar(Math.cos(angle) * radius)
      .add(v.clone().multiplyScalar(Math.sin(angle) * radius));
    points.push(center.clone().add(pointOnCircle));
  }

  // Close the circle
  if (points.length > 0) {
    points.push(points[0].clone());
  }

  // For circular cuts, we want to create vertices even if they don't intersect
  const circleOptions = { ...options, createVertices: true, createEdges: true };
  
  return knifeCutPath(mesh, points, circleOptions);
}