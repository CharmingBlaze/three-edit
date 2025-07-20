import { Vector3, Box3, Sphere } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from '../selection/Selection.ts';
import { computeFaceArea } from './queryGeometry';

/**
 * Result of a selection query
 */
export interface SelectionQueryResult {
  /** Type of selection (vertex, edge, face) */
  type: 'vertex' | 'edge' | 'face';
  /** Number of selected elements */
  count: number;
  /** Bounding box of the selection */
  boundingBox: Box3;
  /** Bounding sphere of the selection */
  boundingSphere: Sphere;
  /** Center point of the selection */
  center: Vector3;
  /** Total length of selected edges (for edge selections) */
  totalLength?: number;
  /** Total area of selected faces (for face selections) */
  totalArea?: number;
  /** List of vertex indices in the selection (including vertices of selected edges/faces) */
  vertexIndices: number[];
  /** List of edge indices in the selection (including edges of selected faces) */
  edgeIndices: number[];
  /** List of face indices in the selection */
  faceIndices: number[];
  /** Material indices used by the selection */
  materialIndices: number[];
}

/**
 * Options for selection queries
 */
export interface SelectionQueryOptions {
  /** Whether to compute total length for edge selections */
  computeLength?: boolean;
  /** Whether to compute total area for face selections */
  computeArea?: boolean;
  /** Whether to include related elements (e.g., edges of selected faces) */
  includeRelatedElements?: boolean;
}

/**
 * Queries information about a selection
 * @param mesh The mesh containing the selection
 * @param selection The selection to query
 * @param options Query options
 * @returns Selection query result
 */
export function querySelection(
  mesh: EditableMesh,
  selection: Selection,
  options: SelectionQueryOptions = {}
): SelectionQueryResult {
  // Set default options
  const opts = {
    computeLength: options.computeLength ?? true,
    computeArea: options.computeArea ?? true,
    includeRelatedElements: options.includeRelatedElements ?? true
  };
  
  // Determine selection type and count
  let selectionType: 'vertex' | 'edge' | 'face' = 'vertex'; // Default
  let count = 0;
  
  if (selection.vertices.size > 0) {
    selectionType = 'vertex';
    count = selection.vertices.size;
  } else if (selection.edges.size > 0) {
    selectionType = 'edge';
    count = selection.edges.size;
  } else if (selection.faces.size > 0) {
    selectionType = 'face';
    count = selection.faces.size;
  }
  
  // Initialize result
  const result: SelectionQueryResult = {
    type: selectionType,
    count: count,
    boundingBox: new Box3(),
    boundingSphere: new Sphere(),
    center: new Vector3(),
    vertexIndices: [],
    edgeIndices: [],
    faceIndices: [],
    materialIndices: []
  };
  
  // Process selection based on type
  if (selectionType === 'vertex') {
    processVertexSelection(mesh, selection, result, opts);
  } else if (selectionType === 'edge') {
    processEdgeSelection(mesh, selection, result, opts);
  } else if (selectionType === 'face') {
    processFaceSelection(mesh, selection, result, opts);
  }
  
  // Compute bounding box and sphere from vertex positions
  const points: Vector3[] = [];
  for (const vertexIndex of result.vertexIndices) {
    const vertex = mesh.getVertex(vertexIndex);
    if (vertex) {
      points.push(new Vector3(vertex.x, vertex.y, vertex.z));
    }
  }
  
  if (points.length > 0) {
    result.boundingBox.setFromPoints(points);
    result.boundingSphere.setFromPoints(points);
    result.center.copy(result.boundingBox.getCenter(new Vector3()));
  }
  
  return result;
}

/**
 * Processes a vertex selection
 * @param mesh The mesh containing the selection
 * @param selection The vertex selection
 * @param result The result to populate
 * @param options Query options
 */
function processVertexSelection(
  mesh: EditableMesh,
  selection: Selection,
  result: SelectionQueryResult,
  options: Required<SelectionQueryOptions>
): void {
  // Add selected vertices
  result.vertexIndices = Array.from(selection.vertices);
  
  if (options.includeRelatedElements) {
    // Find edges that use these vertices
    for (let edgeIndex = 0; edgeIndex < mesh.edges.length; edgeIndex++) {
      const edge = mesh.edges[edgeIndex];
      if (selection.vertices.has(edge.v1) || selection.vertices.has(edge.v2)) {
        result.edgeIndices.push(edgeIndex);
      }
    }
    
    // Find faces that use these vertices
    for (let faceIndex = 0; faceIndex < mesh.faces.length; faceIndex++) {
      const face = mesh.faces[faceIndex];
      if (face.vertices.some(v => selection.vertices.has(v))) {
        result.faceIndices.push(faceIndex);
        
        // Add material index if not already included
        if (!result.materialIndices.includes(face.materialIndex)) {
          result.materialIndices.push(face.materialIndex);
        }
      }
    }
  }
}

/**
 * Processes an edge selection
 * @param mesh The mesh containing the selection
 * @param selection The edge selection
 * @param result The result to populate
 * @param options Query options
 */
function processEdgeSelection(
  mesh: EditableMesh,
  selection: Selection,
  result: SelectionQueryResult,
  options: Required<SelectionQueryOptions>
): void {
  // Add selected edges
  result.edgeIndices = Array.from(selection.edges);
  
  // Collect vertices from selected edges
  const vertexSet = new Set<number>();
  let totalLength = 0;
  
  for (const edgeIndex of selection.edges) {
    const edge = mesh.getEdge(edgeIndex);
    if (edge) {
      vertexSet.add(edge.v1);
      vertexSet.add(edge.v2);
      
      // Compute edge length if requested
      if (options.computeLength) {
        const v1 = mesh.getVertex(edge.v1);
        const v2 = mesh.getVertex(edge.v2);
        
        if (v1 && v2) {
          const dx = v2.x - v1.x;
          const dy = v2.y - v1.y;
          const dz = v2.z - v1.z;
          const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
          totalLength += length;
        }
      }
    }
  }
  
  result.vertexIndices = Array.from(vertexSet);
  
  if (options.computeLength) {
    result.totalLength = totalLength;
  }
  
  if (options.includeRelatedElements) {
    // Find faces that use these edges
    for (let faceIndex = 0; faceIndex < mesh.faces.length; faceIndex++) {
      const face = mesh.faces[faceIndex];
      if (face.edges.some(e => selection.edges.has(e))) {
        result.faceIndices.push(faceIndex);
        
        // Add material index if not already included
        if (!result.materialIndices.includes(face.materialIndex)) {
          result.materialIndices.push(face.materialIndex);
        }
      }
    }
  }
}

/**
 * Processes a face selection
 * @param mesh The mesh containing the selection
 * @param selection The face selection
 * @param result The result to populate
 * @param options Query options
 */
function processFaceSelection(
  mesh: EditableMesh,
  selection: Selection,
  result: SelectionQueryResult,
  options: Required<SelectionQueryOptions>
): void {
  // Add selected faces
  result.faceIndices = Array.from(selection.faces);
  
  // Collect vertices and edges from selected faces
  const vertexSet = new Set<number>();
  const edgeSet = new Set<number>();
  const materialSet = new Set<number>();
  let totalArea = 0;
  
  for (const faceIndex of selection.faces) {
    const face = mesh.getFace(faceIndex);
    if (face) {
      // Add vertices
      face.vertices.forEach(v => vertexSet.add(v));
      
      // Add edges
      face.edges.forEach(e => edgeSet.add(e));
      
      // Add material index
      materialSet.add(face.materialIndex);
      
      // Compute face area if requested
      if (options.computeArea) {
        totalArea += computeFaceArea(mesh, face);
      }
    }
  }
  
  result.vertexIndices = Array.from(vertexSet);
  result.edgeIndices = Array.from(edgeSet);
  result.materialIndices = Array.from(materialSet);
  
  if (options.computeArea) {
    result.totalArea = totalArea;
  }
}

/**
 * Finds the center of a selection
 * @param mesh The mesh containing the selection
 * @param selection The selection to find the center of
 * @returns The center point of the selection
 */
export function findSelectionCenter(
  mesh: EditableMesh,
  selection: Selection
): Vector3 {
  const center = new Vector3();
  let count = 0;
  
  // Collect vertex positions based on selection type
  if (selection.vertices.size > 0) {
    // For vertex selection, use selected vertices
    for (const vertexIndex of selection.vertices) {
      const vertex = mesh.getVertex(vertexIndex);
      if (vertex) {
        center.add(new Vector3(vertex.x, vertex.y, vertex.z));
        count++;
      }
    }
  } else if (selection.edges.size > 0) {
    // For edge selection, use vertices of selected edges
    const vertexSet = new Set<number>();
    
    for (const edgeIndex of selection.edges) {
      const edge = mesh.getEdge(edgeIndex);
      if (edge) {
        vertexSet.add(edge.v1);
        vertexSet.add(edge.v2);
      }
    }
    
    for (const vertexIndex of vertexSet) {
      const vertex = mesh.getVertex(vertexIndex);
      if (vertex) {
        center.add(new Vector3(vertex.x, vertex.y, vertex.z));
        count++;
      }
    }
  } else if (selection.faces.size > 0) {
    // For face selection, use vertices of selected faces
    const vertexSet = new Set<number>();
    
    for (const faceIndex of selection.faces) {
      const face = mesh.getFace(faceIndex);
      if (face) {
        face.vertices.forEach(v => vertexSet.add(v));
      }
    }
    
    for (const vertexIndex of vertexSet) {
      const vertex = mesh.getVertex(vertexIndex);
      if (vertex) {
        center.add(new Vector3(vertex.x, vertex.y, vertex.z));
        count++;
      }
    }
  }
  
  // Compute average position
  if (count > 0) {
    center.divideScalar(count);
  }
  
  return center;
}
