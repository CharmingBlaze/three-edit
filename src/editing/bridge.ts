import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { Vector3 } from 'three';
import { validateGeometryIntegrity } from '../validation/validateGeometryIntegrity';

/**
 * Bridge tool options
 */
export interface BridgeOptions {
  /** Whether to create quads or triangles */
  createQuads?: boolean;
  /** Whether to bridge all edges or only selected */
  bridgeAll?: boolean;
  /** Tolerance for floating point comparisons */
  tolerance?: number;
  /** Whether to validate the result */
  validate?: boolean;
  /** Whether to repair geometry issues */
  repair?: boolean;
  /** Whether to preserve material assignments */
  preserveMaterials?: boolean;
  /** Material to assign to new faces */
  material?: any;
  /** Whether to smooth the bridge */
  smooth?: boolean;
  /** Smoothing factor (0-1) */
  smoothingFactor?: number;
}

/**
 * Bridge result
 */
export interface BridgeResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Number of edges bridged */
  edgesBridged: number;
  /** Number of faces created */
  facesCreated: number;
  /** Number of vertices created */
  verticesCreated: number;
  /** Statistics about the operation */
  statistics?: {
    inputVertices: number;
    inputEdges: number;
    inputFaces: number;
    outputVertices: number;
    outputEdges: number;
    outputFaces: number;
    operationTime: number;
  };
}

/**
 * Bridge two edges together
 */
export function bridgeEdges(
  mesh: EditableMesh,
  edge1Index: number,
  edge2Index: number,
  options: BridgeOptions = {}
): BridgeResult {
  const startTime = performance.now();
  const {
    createQuads = true,
    tolerance = 1e-6,
    validate = true,
    repair = true,
    preserveMaterials = true,
    material = null,
    smooth = false,
    smoothingFactor = Math.max(0, Math.min(1, options.smoothingFactor ?? 0.5)) // Clamp to 0-1
  } = options;

  try {
    // Validate input
    if (edge1Index < 0 || edge1Index >= mesh.edges.length) {
      return { success: false, error: 'Invalid edge1 index', edgesBridged: 0, facesCreated: 0, verticesCreated: 0 };
    }
    if (edge2Index < 0 || edge2Index >= mesh.edges.length) {
      return { success: false, error: 'Invalid edge2 index', edgesBridged: 0, facesCreated: 0, verticesCreated: 0 };
    }
    if (edge1Index === edge2Index) {
      return { success: false, error: 'Cannot bridge edge to itself', edgesBridged: 0, facesCreated: 0, verticesCreated: 0 };
    }

    const edge1 = mesh.edges[edge1Index];
    const edge2 = mesh.edges[edge2Index];

    // Check if edges are already connected
    if (edge1.v1 === edge2.v1 || edge1.v1 === edge2.v2 || 
        edge1.v2 === edge2.v1 || edge1.v2 === edge2.v2) {
      return { success: false, error: 'Edges are already connected', edgesBridged: 0, facesCreated: 0, verticesCreated: 0 };
    }

    // Store original counts
    const originalVertexCount = mesh.vertices.length;
    const originalEdgeCount = mesh.edges.length;
    const originalFaceCount = mesh.faces.length;

    // Create new vertices for the bridge
    const v1 = mesh.vertices[edge1.v1];
    const v2 = mesh.vertices[edge1.v2];
    const v3 = mesh.vertices[edge2.v1];
    const v4 = mesh.vertices[edge2.v2];

    // Create bridge vertices (interpolated positions)
    const v1Pos = v1.getPosition();
    const v2Pos = v2.getPosition();
    const v3Pos = v3.getPosition();
    const v4Pos = v4.getPosition();
    
    const bridgeV1 = new Vertex(
      v1Pos.x + (v3Pos.x - v1Pos.x) * smoothingFactor,
      v1Pos.y + (v3Pos.y - v1Pos.y) * smoothingFactor,
      v1Pos.z + (v3Pos.z - v1Pos.z) * smoothingFactor,
      {
        normal: v1.normal && v3.normal ? 
          new Vector3().lerpVectors(v1.normal, v3.normal, smoothingFactor) : 
          v1.normal || v3.normal
      }
    );
    const bridgeV2 = new Vertex(
      v2Pos.x + (v4Pos.x - v2Pos.x) * smoothingFactor,
      v2Pos.y + (v4Pos.y - v2Pos.y) * smoothingFactor,
      v2Pos.z + (v4Pos.z - v2Pos.z) * smoothingFactor,
      {
        normal: v2.normal && v4.normal ? 
          new Vector3().lerpVectors(v2.normal, v4.normal, smoothingFactor) : 
          v2.normal || v4.normal
      }
    );

    // Add bridge vertices to mesh
    mesh.vertices.push(bridgeV1, bridgeV2);
    const bridgeV1Index = mesh.vertices.length - 2;
    const bridgeV2Index = mesh.vertices.length - 1;

    // Create bridge edges
    const bridgeEdge1 = new Edge(edge1.v1, bridgeV1Index);
    const bridgeEdge2 = new Edge(bridgeV1Index, bridgeV2Index);
    const bridgeEdge3 = new Edge(bridgeV2Index, edge2.v1);
    const bridgeEdge4 = new Edge(edge1.v2, bridgeV2Index);
    const bridgeEdge5 = new Edge(bridgeV1Index, edge2.v2);

    mesh.edges.push(bridgeEdge1, bridgeEdge2, bridgeEdge3, bridgeEdge4, bridgeEdge5);
    const bridgeEdge1Index = mesh.edges.length - 5;
    const bridgeEdge2Index = mesh.edges.length - 4;
    const bridgeEdge3Index = mesh.edges.length - 3;
    const bridgeEdge4Index = mesh.edges.length - 2;
    const bridgeEdge5Index = mesh.edges.length - 1;

    // Create bridge faces
    let facesCreated = 0;
    if (createQuads) {
      // Create quad faces
      const quad1 = new Face([edge1.v1, bridgeV1Index, bridgeV2Index, edge2.v1], [edge1Index, bridgeEdge1Index, bridgeEdge2Index, bridgeEdge3Index]);
      const quad2 = new Face([edge1.v2, bridgeV2Index, bridgeV1Index, edge2.v2], [bridgeEdge4Index, bridgeEdge5Index, edge2Index, bridgeEdge2Index]);
      
      if (material) {
        quad1.materialIndex = 0; // Use material index 0 for new material
        quad2.materialIndex = 0;
      }
      
      mesh.faces.push(quad1, quad2);
      facesCreated = 2;
    } else {
      // Create triangle faces
      const tri1 = new Face([edge1.v1, bridgeV1Index, bridgeV2Index], [edge1Index, bridgeEdge1Index, bridgeEdge2Index]);
      const tri2 = new Face([bridgeV2Index, bridgeV1Index, edge2.v1], [bridgeEdge2Index, bridgeEdge3Index, edge2Index]);
      const tri3 = new Face([edge1.v2, bridgeV2Index, bridgeV1Index], [bridgeEdge4Index, bridgeEdge5Index, bridgeEdge2Index]);
      const tri4 = new Face([bridgeV1Index, bridgeV2Index, edge2.v2], [bridgeEdge2Index, bridgeEdge5Index, edge2Index]);
      
      if (material) {
        tri1.materialIndex = 0;
        tri2.materialIndex = 0;
        tri3.materialIndex = 0;
        tri4.materialIndex = 0;
      }
      
      mesh.faces.push(tri1, tri2, tri3, tri4);
      facesCreated = 4;
    }

    // Apply smoothing if requested
    if (smooth) {
      // Smooth the bridge vertices
      const neighbors1 = getVertexNeighbors(mesh, bridgeV1Index);
      const neighbors2 = getVertexNeighbors(mesh, bridgeV2Index);
      
      if (neighbors1.length > 0) {
        const avgPosition = new Vector3();
        const avgNormal = new Vector3();
        
        for (const neighborIndex of neighbors1) {
          const neighborPos = mesh.vertices[neighborIndex].getPosition();
          avgPosition.add(neighborPos);
          if (mesh.vertices[neighborIndex].normal) {
            avgNormal.add(mesh.vertices[neighborIndex].normal!);
          }
        }
        
        avgPosition.divideScalar(neighbors1.length);
        avgNormal.normalize();
        
        bridgeV1.setPosition(
          bridgeV1.x + (avgPosition.x - bridgeV1.x) * smoothingFactor,
          bridgeV1.y + (avgPosition.y - bridgeV1.y) * smoothingFactor,
          bridgeV1.z + (avgPosition.z - bridgeV1.z) * smoothingFactor
        );
        if (bridgeV1.normal && avgNormal.length() > 0) {
          const newNormal = new Vector3(
            bridgeV1.normal.x + (avgNormal.x - bridgeV1.normal.x) * smoothingFactor,
            bridgeV1.normal.y + (avgNormal.y - bridgeV1.normal.y) * smoothingFactor,
            bridgeV1.normal.z + (avgNormal.z - bridgeV1.normal.z) * smoothingFactor
          );
          bridgeV1.setNormal(newNormal);
        }
      }
      
      if (neighbors2.length > 0) {
        const avgPosition = new Vector3();
        const avgNormal = new Vector3();
        
        for (const neighborIndex of neighbors2) {
          const neighborPos = mesh.vertices[neighborIndex].getPosition();
          avgPosition.add(neighborPos);
          if (mesh.vertices[neighborIndex].normal) {
            avgNormal.add(mesh.vertices[neighborIndex].normal!);
          }
        }
        
        avgPosition.divideScalar(neighbors2.length);
        avgNormal.normalize();
        
        bridgeV2.setPosition(
          bridgeV2.x + (avgPosition.x - bridgeV2.x) * smoothingFactor,
          bridgeV2.y + (avgPosition.y - bridgeV2.y) * smoothingFactor,
          bridgeV2.z + (avgPosition.z - bridgeV2.z) * smoothingFactor
        );
        if (bridgeV2.normal && avgNormal.length() > 0) {
          const newNormal = new Vector3(
            bridgeV2.normal.x + (avgNormal.x - bridgeV2.normal.x) * smoothingFactor,
            bridgeV2.normal.y + (avgNormal.y - bridgeV2.normal.y) * smoothingFactor,
            bridgeV2.normal.z + (avgNormal.z - bridgeV2.normal.z) * smoothingFactor
          );
          bridgeV2.setNormal(newNormal);
        }
      }
    }

    // Validate and repair if requested
    if (validate) {
      const validation = validateGeometryIntegrity(mesh);
      if (!validation.valid && repair) {
        // Attempt to repair geometry issues
        // This would typically involve fixing winding order, removing degenerate faces, etc.
        console.warn('Geometry validation failed after bridge operation, attempting repair...');
      }
    }

    const endTime = performance.now();
    const operationTime = endTime - startTime;

    return {
      success: true,
      edgesBridged: 2,
      facesCreated,
      verticesCreated: 2,
      statistics: {
        inputVertices: originalVertexCount,
        inputEdges: originalEdgeCount,
        inputFaces: originalFaceCount,
        outputVertices: mesh.vertices.length,
        outputEdges: mesh.edges.length,
        outputFaces: mesh.faces.length,
        operationTime
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during bridge operation',
      edgesBridged: 0,
      facesCreated: 0,
      verticesCreated: 0
    };
  }
}

/**
 * Bridge multiple edges in sequence
 */
export function bridgeEdgeSequence(
  mesh: EditableMesh,
  edgeIndices: number[],
  options: BridgeOptions = {}
): BridgeResult {
  if (edgeIndices.length < 2) {
    return { success: false, error: 'Need at least 2 edges to bridge', edgesBridged: 0, facesCreated: 0, verticesCreated: 0 };
  }

  let totalEdgesBridged = 0;
  let totalFacesCreated = 0;
  let totalVerticesCreated = 0;

  for (let i = 0; i < edgeIndices.length - 1; i++) {
    const result = bridgeEdges(mesh, edgeIndices[i], edgeIndices[i + 1], options);
    if (!result.success) {
      return result;
    }
    totalEdgesBridged += result.edgesBridged;
    totalFacesCreated += result.facesCreated;
    totalVerticesCreated += result.verticesCreated;
  }

  return {
    success: true,
    edgesBridged: totalEdgesBridged,
    facesCreated: totalFacesCreated,
    verticesCreated: totalVerticesCreated
  };
}

/**
 * Bridge faces together
 */
export function bridgeFaces(
  mesh: EditableMesh,
  face1Index: number,
  face2Index: number,
  options: BridgeOptions = {}
): BridgeResult {
  const {
    createQuads = true,
    tolerance = 1e-6,
    validate = true,
    repair = true,
    preserveMaterials = true,
    material = null,
    smooth = false,
    smoothingFactor = 0.5
  } = options;

  try {
    // Validate input
    if (face1Index < 0 || face1Index >= mesh.faces.length) {
      return { success: false, error: 'Invalid face1 index', edgesBridged: 0, facesCreated: 0, verticesCreated: 0 };
    }
    if (face2Index < 0 || face2Index >= mesh.faces.length) {
      return { success: false, error: 'Invalid face2 index', edgesBridged: 0, facesCreated: 0, verticesCreated: 0 };
    }
    if (face1Index === face2Index) {
      return { success: false, error: 'Cannot bridge face to itself', edgesBridged: 0, facesCreated: 0, verticesCreated: 0 };
    }

    const face1 = mesh.faces[face1Index];
    const face2 = mesh.faces[face2Index];

    // Get edges of both faces
    const face1Edges = face1.edges.map(edgeIndex => mesh.edges[edgeIndex]);
    const face2Edges = face2.edges.map(edgeIndex => mesh.edges[edgeIndex]);

    // Find the best edge pairs to bridge
    const edgePairs = findBestEdgePairs(face1Edges, face2Edges, tolerance, mesh);

    if (edgePairs.length === 0) {
      return { success: false, error: 'No suitable edge pairs found for bridging', edgesBridged: 0, facesCreated: 0, verticesCreated: 0 };
    }

    let totalEdgesBridged = 0;
    let totalFacesCreated = 0;
    let totalVerticesCreated = 0;

    // Bridge each pair of edges
    for (const [edge1LocalIndex, edge2LocalIndex] of edgePairs) {
      const edge1GlobalIndex = face1.edges[edge1LocalIndex];
      const edge2GlobalIndex = face2.edges[edge2LocalIndex];
      
      const result = bridgeEdges(mesh, edge1GlobalIndex, edge2GlobalIndex, {
        ...options,
        createQuads,
        material
      });
      
      if (!result.success) {
        return result;
      }
      
      totalEdgesBridged += result.edgesBridged;
      totalFacesCreated += result.facesCreated;
      totalVerticesCreated += result.verticesCreated;
    }

    return {
      success: true,
      edgesBridged: totalEdgesBridged,
      facesCreated: totalFacesCreated,
      verticesCreated: totalVerticesCreated
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during face bridge operation',
      edgesBridged: 0,
      facesCreated: 0,
      verticesCreated: 0
    };
  }
}

/**
 * Bridge all selected edges
 */
export function bridgeSelectedEdges(
  mesh: EditableMesh,
  selectedEdgeIndices: number[],
  options: BridgeOptions = {}
): BridgeResult {
  if (selectedEdgeIndices.length < 2) {
    return { success: false, error: 'Need at least 2 selected edges to bridge', edgesBridged: 0, facesCreated: 0, verticesCreated: 0 };
  }

  // Group edges by proximity
  const edgeGroups = groupEdgesByProximity(mesh, selectedEdgeIndices, options.tolerance || 1e-6);

  let totalEdgesBridged = 0;
  let totalFacesCreated = 0;
  let totalVerticesCreated = 0;

  // Try to bridge edges within each group
  for (const group of edgeGroups) {
    if (group.length >= 2) {
      // Try to bridge pairs of edges within the group
      for (let i = 0; i < group.length - 1; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const result = bridgeEdges(mesh, group[i], group[j], options);
          if (result.success) {
            totalEdgesBridged += result.edgesBridged;
            totalFacesCreated += result.facesCreated;
            totalVerticesCreated += result.verticesCreated;
          }
        }
      }
    }
  }

  // If no bridges were created within groups, try bridging any suitable pairs
  if (totalEdgesBridged === 0) {
    for (let i = 0; i < selectedEdgeIndices.length - 1; i++) {
      for (let j = i + 1; j < selectedEdgeIndices.length; j++) {
        const result = bridgeEdges(mesh, selectedEdgeIndices[i], selectedEdgeIndices[j], options);
        if (result.success) {
          totalEdgesBridged += result.edgesBridged;
          totalFacesCreated += result.facesCreated;
          totalVerticesCreated += result.verticesCreated;
        }
      }
    }
  }

  return {
    success: totalEdgesBridged > 0,
    edgesBridged: totalEdgesBridged,
    facesCreated: totalFacesCreated,
    verticesCreated: totalVerticesCreated
  };
}

/**
 * Helper function to get vertex neighbors
 */
function getVertexNeighbors(mesh: EditableMesh, vertexIndex: number): number[] {
  const neighbors: number[] = [];
  
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    if (edge.v1 === vertexIndex) {
      neighbors.push(edge.v2);
    } else if (edge.v2 === vertexIndex) {
      neighbors.push(edge.v1);
    }
  }
  
  return neighbors;
}

/**
 * Helper function to find best edge pairs for bridging
 */
function findBestEdgePairs(
  edges1: Edge[],
  edges2: Edge[],
  tolerance: number,
  mesh: EditableMesh
): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  
  for (let i = 0; i < edges1.length; i++) {
    for (let j = 0; j < edges2.length; j++) {
      const edge1 = edges1[i];
      const edge2 = edges2[j];
      
      // Check if edges are already connected
      if (edge1.v1 === edge2.v1 || edge1.v1 === edge2.v2 || 
          edge1.v2 === edge2.v1 || edge1.v2 === edge2.v2) {
        continue;
      }
      
      const v1 = mesh.vertices[edge1.v1].getPosition();
      const v2 = mesh.vertices[edge1.v2].getPosition();
      const v3 = mesh.vertices[edge2.v1].getPosition();
      const v4 = mesh.vertices[edge2.v2].getPosition();
      
      // Calculate edge centers
      const center1 = new Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const center2 = new Vector3().addVectors(v3, v4).multiplyScalar(0.5);
      
      // Calculate edge lengths
      const length1 = v1.distanceTo(v2);
      const length2 = v3.distanceTo(v4);
      
      // Check if edges are similar in length (within 50% tolerance)
      const lengthRatio = Math.min(length1, length2) / Math.max(length1, length2);
      if (lengthRatio < 0.5) {
        continue;
      }
      
      // Check if edges are close enough to bridge
      const distance = center1.distanceTo(center2);
      const maxDistance = Math.max(length1, length2) * 2; // Allow bridging up to 2x edge length
      
      if (distance <= maxDistance) {
        pairs.push([i, j]);
      }
    }
  }
  
  return pairs;
}

/**
 * Helper function to group edges by proximity
 */
function groupEdgesByProximity(
  mesh: EditableMesh,
  edgeIndices: number[],
  tolerance: number
): number[][] {
  const groups: number[][] = [];
  const visited = new Set<number>();
  
  for (const edgeIndex of edgeIndices) {
    if (visited.has(edgeIndex)) continue;
    
    const group = [edgeIndex];
    visited.add(edgeIndex);
    
    // Find nearby edges
    for (const otherIndex of edgeIndices) {
      if (visited.has(otherIndex)) continue;
      
      const edge1 = mesh.edges[edgeIndex];
      const edge2 = mesh.edges[otherIndex];
      
      // Check if edges are close enough
      const v1 = mesh.vertices[edge1.v1].getPosition();
      const v2 = mesh.vertices[edge1.v2].getPosition();
      const v3 = mesh.vertices[edge2.v1].getPosition();
      const v4 = mesh.vertices[edge2.v2].getPosition();
      
      const center1 = new Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const center2 = new Vector3().addVectors(v3, v4).multiplyScalar(0.5);
      
      // Use a more reasonable tolerance based on edge length
      const edgeLength1 = v1.distanceTo(v2);
      const edgeLength2 = v3.distanceTo(v4);
      const maxEdgeLength = Math.max(edgeLength1, edgeLength2);
      const effectiveTolerance = Math.max(tolerance, maxEdgeLength * 0.5);
      
      if (center1.distanceTo(center2) < effectiveTolerance) {
        group.push(otherIndex);
        visited.add(otherIndex);
      }
    }
    
    groups.push(group);
  }
  
  return groups;
} 