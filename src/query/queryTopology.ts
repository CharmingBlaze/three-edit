import { EditableMesh } from '../core/EditableMesh.ts';

/**
 * Result of a topology query
 */
export interface TopologyQueryResult {
  /** Whether the mesh is manifold (each edge connects at most two faces) */
  isManifold: boolean;
  /** Whether the mesh is closed (no boundary edges) */
  isClosed: boolean;
  /** Whether the mesh is orientable (consistent face normals) */
  isOrientable: boolean;
  /** Number of connected components in the mesh */
  connectedComponents: number;
  /** Number of boundary edges */
  boundaryEdgeCount: number;
  /** Number of non-manifold edges */
  nonManifoldEdgeCount: number;
  /** Genus of the mesh (number of "handles") */
  genus: number;
  /** Euler characteristic of the mesh */
  eulerCharacteristic: number;
  /** List of boundary loops (arrays of vertex indices) */
  boundaryLoops: number[][];
}

/**
 * Options for topology queries
 */
export interface TopologyQueryOptions {
  /** Whether to compute connected components */
  computeConnectedComponents?: boolean;
  /** Whether to compute boundary loops */
  computeBoundaryLoops?: boolean;
  /** Whether to compute genus */
  computeGenus?: boolean;
  /** Whether to check if the mesh is orientable */
  checkOrientable?: boolean;
}

/**
 * Queries topology information about a mesh
 * @param mesh The mesh to query
 * @param options Query options
 * @returns Topology query result
 */
export function queryTopology(
  mesh: EditableMesh,
  options: TopologyQueryOptions = {}
): TopologyQueryResult {
  // Set default options
  const opts = {
    computeConnectedComponents: options.computeConnectedComponents ?? true,
    computeBoundaryLoops: options.computeBoundaryLoops ?? true,
    computeGenus: options.computeGenus ?? true,
    checkOrientable: options.checkOrientable ?? true
  };
  
  // Initialize result
  const result: TopologyQueryResult = {
    isManifold: true,
    isClosed: true,
    isOrientable: true,
    connectedComponents: 0,
    boundaryEdgeCount: 0,
    nonManifoldEdgeCount: 0,
    genus: 0,
    eulerCharacteristic: 0,
    boundaryLoops: []
  };
  
  // Count vertices, edges, and faces
  const vertexCount = mesh.vertices.length;
  const edgeCount = mesh.edges.length;
  const faceCount = mesh.faces.length;
  
  // Build edge-to-face map for manifold and boundary checks
  const edgeToFaces = new Map<string, number[]>();
  
  // Process all faces to build the edge-to-face map
  for (let faceIndex = 0; faceIndex < mesh.faces.length; faceIndex++) {
    const face = mesh.faces[faceIndex];
    
    // For each edge in the face
    for (let i = 0; i < face.vertices.length; i++) {
      const v1 = face.vertices[i];
      const v2 = face.vertices[(i + 1) % face.vertices.length];
      
      // Create a unique edge key (always use smaller index first)
      const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      
      // Add this face to the edge's face list
      const faces = edgeToFaces.get(edgeKey) || [];
      faces.push(faceIndex);
      edgeToFaces.set(edgeKey, faces);
    }
  }
  
  // Check for manifold and boundary edges
  for (const [edgeKey, faces] of edgeToFaces.entries()) {
    if (faces.length > 2) {
      // Non-manifold edge (more than two faces share this edge)
      result.isManifold = false;
      result.nonManifoldEdgeCount++;
    } else if (faces.length === 1) {
      // Boundary edge (only one face uses this edge)
      result.isClosed = false;
      result.boundaryEdgeCount++;
    }
  }
  
  // Compute Euler characteristic
  result.eulerCharacteristic = vertexCount - edgeCount + faceCount;
  
  // Compute connected components if requested
  if (opts.computeConnectedComponents) {
    result.connectedComponents = computeConnectedComponents(mesh);
  }
  
  // Compute boundary loops if requested
  if (opts.computeBoundaryLoops && !result.isClosed) {
    result.boundaryLoops = computeBoundaryLoops(mesh, edgeToFaces);
  }
  
  // Compute genus if requested
  if (opts.computeGenus) {
    // For a closed, orientable surface: χ = 2 - 2g
    // For a surface with b boundary components: χ = 2 - 2g - b
    const boundaryCount = result.boundaryLoops.length;
    
    if (result.isManifold) {
      if (result.isClosed) {
        // Closed surface
        result.genus = (2 - result.eulerCharacteristic) / 2;
      } else {
        // Surface with boundaries
        result.genus = (2 - result.eulerCharacteristic - boundaryCount) / 2;
      }
    }
  }
  
  // Check if the mesh is orientable if requested
  if (opts.checkOrientable) {
    result.isOrientable = checkOrientable(mesh);
  }
  
  return result;
}

/**
 * Computes the number of connected components in a mesh
 * @param mesh The mesh to analyze
 * @returns The number of connected components
 */
export function computeConnectedComponents(mesh: EditableMesh): number {
  // Use a breadth-first search to find connected components
  const visited = new Set<number>();
  let componentCount = 0;
  
  // Build vertex adjacency list
  const adjacencyList = new Map<number, Set<number>>();
  
  // Add vertices to adjacency list
  for (let i = 0; i < mesh.vertices.length; i++) {
    adjacencyList.set(i, new Set<number>());
  }
  
  // Add edges to adjacency list
  for (const edge of mesh.edges) {
    const neighbors1 = adjacencyList.get(edge.v1);
    const neighbors2 = adjacencyList.get(edge.v2);
    
    if (neighbors1) neighbors1.add(edge.v2);
    if (neighbors2) neighbors2.add(edge.v1);
  }
  
  // Process each vertex
  for (let i = 0; i < mesh.vertices.length; i++) {
    if (visited.has(i)) continue;
    
    // Start a new component
    componentCount++;
    
    // Breadth-first search
    const queue: number[] = [i];
    visited.add(i);
    
    while (queue.length > 0) {
      const vertex = queue.shift()!;
      const neighbors = adjacencyList.get(vertex);
      
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
  }
  
  return componentCount;
}

/**
 * Computes the boundary loops of a mesh
 * @param mesh The mesh to analyze
 * @param edgeToFaces Map of edge keys to face indices
 * @returns Array of boundary loops (each loop is an array of vertex indices)
 */
export function computeBoundaryLoops(
  mesh: EditableMesh,
  edgeToFaces: Map<string, number[]>
): number[][] {
  const boundaryLoops: number[][] = [];
  const visitedEdges = new Set<string>();
  
  // Find all boundary edges (edges with only one adjacent face)
  const boundaryEdges: [number, number][] = [];
  
  for (const [edgeKey, faces] of edgeToFaces.entries()) {
    if (faces.length === 1) {
      const [v1, v2] = edgeKey.split('-').map(Number);
      boundaryEdges.push([v1, v2]);
    }
  }
  
  // Build a map of vertices to their boundary edges
  const vertexToBoundaryEdges = new Map<number, number[]>();
  
  boundaryEdges.forEach(([v1, v2], edgeIndex) => {
    // Add edge to v1's list
    const v1Edges = vertexToBoundaryEdges.get(v1) || [];
    v1Edges.push(edgeIndex);
    vertexToBoundaryEdges.set(v1, v1Edges);
    
    // Add edge to v2's list
    const v2Edges = vertexToBoundaryEdges.get(v2) || [];
    v2Edges.push(edgeIndex);
    vertexToBoundaryEdges.set(v2, v2Edges);
  });
  
  // Trace boundary loops
  for (let edgeIndex = 0; edgeIndex < boundaryEdges.length; edgeIndex++) {
    const edgeKey = `${boundaryEdges[edgeIndex][0]}-${boundaryEdges[edgeIndex][1]}`;
    if (visitedEdges.has(edgeKey)) continue;
    
    // Start a new boundary loop
    const loop: number[] = [];
    let currentVertex = boundaryEdges[edgeIndex][0];
    let nextVertex = boundaryEdges[edgeIndex][1];
    
    while (true) {
      // Add current vertex to the loop
      loop.push(currentVertex);
      
      // Mark edge as visited
      const edgeKey = currentVertex < nextVertex
        ? `${currentVertex}-${nextVertex}`
        : `${nextVertex}-${currentVertex}`;
      visitedEdges.add(edgeKey);
      
      // Move to the next vertex
      currentVertex = nextVertex;
      
      // Find the next unvisited boundary edge from this vertex
      const edges = vertexToBoundaryEdges.get(currentVertex) || [];
      let foundNext = false;
      
      for (const edgeIndex of edges) {
        const [v1, v2] = boundaryEdges[edgeIndex];
        const nextEdgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
        
        if (!visitedEdges.has(nextEdgeKey)) {
          nextVertex = v1 === currentVertex ? v2 : v1;
          foundNext = true;
          break;
        }
      }
      
      // If we can't find an unvisited edge, we've completed the loop
      if (!foundNext || nextVertex === loop[0]) {
        if (nextVertex === loop[0]) {
          // Close the loop
          loop.push(nextVertex);
        }
        break;
      }
    }
    
    // Add the loop if it has at least 3 vertices
    if (loop.length >= 3) {
      boundaryLoops.push(loop);
    }
  }
  
  return boundaryLoops;
}

/**
 * Checks if a mesh is orientable
 * @param mesh The mesh to check
 * @returns Whether the mesh is orientable
 */
export function checkOrientable(mesh: EditableMesh): boolean {
  // A mesh is orientable if we can assign consistent orientations to all faces
  // We'll use a breadth-first traversal to check this
  
  if (mesh.faces.length === 0) {
    return true;
  }
  
  // Build edge-to-face map
  const edgeToFaces = new Map<string, { faceIndex: number, edgeDirection: boolean }[]>();
  
  // Process all faces
  for (let faceIndex = 0; faceIndex < mesh.faces.length; faceIndex++) {
    const face = mesh.faces[faceIndex];
    
    // For each edge in the face
    for (let i = 0; i < face.vertices.length; i++) {
      const v1 = face.vertices[i];
      const v2 = face.vertices[(i + 1) % face.vertices.length];
      
      // Create a canonical edge key (always use smaller index first)
      const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      
      // Record the face and the direction of the edge in this face
      const edgeDirection = v1 < v2;
      const faces = edgeToFaces.get(edgeKey) || [];
      faces.push({ faceIndex, edgeDirection });
      edgeToFaces.set(edgeKey, faces);
    }
  }
  
  // Assign orientations to faces (1 or -1)
  const faceOrientations = new Array(mesh.faces.length).fill(0);
  const queue: number[] = [0]; // Start with the first face
  faceOrientations[0] = 1;
  
  while (queue.length > 0) {
    const faceIndex = queue.shift()!;
    const face = mesh.faces[faceIndex];
    const orientation = faceOrientations[faceIndex];
    
    // For each edge in the face
    for (let i = 0; i < face.vertices.length; i++) {
      const v1 = face.vertices[i];
      const v2 = face.vertices[(i + 1) % face.vertices.length];
      
      // Create a canonical edge key
      const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      const edgeDirection = v1 < v2;
      
      // Find adjacent faces through this edge
      const adjacentFaces = edgeToFaces.get(edgeKey) || [];
      
      for (const { faceIndex: adjFaceIndex, edgeDirection: adjEdgeDirection } of adjacentFaces) {
        if (adjFaceIndex === faceIndex) continue;
        
        if (faceOrientations[adjFaceIndex] === 0) {
          // Unvisited face - assign orientation based on edge direction
          const newOrientation = edgeDirection === adjEdgeDirection ? -orientation : orientation;
          faceOrientations[adjFaceIndex] = newOrientation;
          queue.push(adjFaceIndex);
        } else {
          // Check if orientations are consistent
          const expectedOrientation = edgeDirection === adjEdgeDirection ? -orientation : orientation;
          if (faceOrientations[adjFaceIndex] !== expectedOrientation) {
            return false; // Inconsistent orientation - not orientable
          }
        }
      }
    }
  }
  
  return true;
}
