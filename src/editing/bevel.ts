import { Vector3, Matrix4 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { Vertex } from '../core/Vertex';

/**
 * Options for beveling operations
 */
export interface BevelOptions {
  /** Distance of the bevel */
  distance?: number;
  /** Number of segments in the bevel */
  segments?: number;
  /** Profile of the bevel (0 = linear, 1 = curved) */
  profile?: number;
  /** Material index for new faces */
  materialIndex?: number;
  /** Whether to keep original geometry */
  keepOriginal?: boolean;
  /** Tolerance for vertex welding */
  weldTolerance?: number;
}

/**
 * Options for edge beveling
 */
export interface EdgeBevelOptions extends BevelOptions {
  /** Direction of the bevel (optional, auto-calculated if not provided) */
  direction?: Vector3;
  /** Whether to bevel both sides of the edge */
  bothSides?: boolean;
}

/**
 * Options for vertex beveling
 */
export interface VertexBevelOptions extends BevelOptions {
  /** Direction of the bevel (optional, auto-calculated if not provided) */
  direction?: Vector3;
  /** Whether to bevel all connected edges */
  allEdges?: boolean;
}

/**
 * Options for face beveling
 */
export interface FaceBevelOptions extends BevelOptions {
  /** Direction of the bevel (optional, auto-calculated if not provided) */
  direction?: Vector3;
  /** Whether to bevel all edges of the face */
  allEdges?: boolean;
}

/**
 * Bevels an edge by creating new geometry along the edge
 * @param mesh The mesh containing the edge
 * @param edgeIndex The index of the edge to bevel
 * @param options Options for the bevel operation
 * @returns The modified mesh
 */
export function bevelEdge(
  mesh: EditableMesh,
  edgeIndex: number,
  options: EdgeBevelOptions = {}
): EditableMesh {
  const distance = options.distance ?? 0.1;
  const segments = options.segments ?? 1;
  const profile = options.profile ?? 0;
  const materialIndex = options.materialIndex ?? 0;
  const keepOriginal = options.keepOriginal ?? true;
  const bothSides = options.bothSides ?? false;
  const weldTolerance = options.weldTolerance ?? 0.001;

  const edge = mesh.getEdge(edgeIndex);
  if (!edge) {
    throw new Error(`Edge ${edgeIndex} not found`);
  }

  const v1 = mesh.getVertex(edge.v1);
  const v2 = mesh.getVertex(edge.v2);
  if (!v1 || !v2) {
    throw new Error('Edge vertices not found');
  }

  // Calculate edge direction
  const edgeDirection = new Vector3();
  edgeDirection.subVectors(v2, v1).normalize();

  // Calculate bevel direction (perpendicular to edge)
  let bevelDirection = options.direction;
  if (!bevelDirection) {
    // Auto-calculate perpendicular direction
    const up = new Vector3(0, 1, 0);
    bevelDirection = new Vector3();
    bevelDirection.crossVectors(edgeDirection, up).normalize();
    if (bevelDirection.length() < 0.1) {
      // If edge is vertical, use different up vector
      const right = new Vector3(1, 0, 0);
      bevelDirection.crossVectors(edgeDirection, right).normalize();
    }
  }

  // Create bevel geometry
  const newVertices: Vertex[] = [];
  const newEdges: Edge[] = [];
  const newFaces: Face[] = [];

  // Create vertices along the bevel
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const profileOffset = profile * Math.sin(Math.PI * t);
    const currentDistance = distance * (1 + profileOffset);

    // Create vertices for both sides if requested
    const sides = bothSides ? [-1, 1] : [1];
    
    for (const side of sides) {
      const offset = bevelDirection.clone().multiplyScalar(currentDistance * side);
      
      // Create vertex at v1 position
      const v1Bevel = new Vertex(
        v1.x + offset.x,
        v1.y + offset.y,
        v1.z + offset.z,
        { uv: v1.uv }
      );
      newVertices.push(v1Bevel);

      // Create vertex at v2 position
      const v2Bevel = new Vertex(
        v2.x + offset.x,
        v2.y + offset.y,
        v2.z + offset.z,
        { uv: v2.uv }
      );
      newVertices.push(v2Bevel);
    }
  }

  // Add new vertices to mesh
  const vertexIndices = newVertices.map(vertex => mesh.addVertex(vertex));

  // Create edges connecting the bevel vertices
  for (let i = 0; i < segments; i++) {
    const baseIndex = i * (bothSides ? 4 : 2);
    
    // Create edges along the bevel
    for (let j = 0; j < (bothSides ? 2 : 1); j++) {
      const sideOffset = j * 2;
      
      // Horizontal edges
      const edge1 = new Edge(
        vertexIndices[baseIndex + sideOffset],
        vertexIndices[baseIndex + sideOffset + 1]
      );
      newEdges.push(edge1);
      mesh.addEdge(edge1);

      // Vertical edges (if not last segment)
      if (i < segments - 1) {
        const nextBaseIndex = (i + 1) * (bothSides ? 4 : 2);
        const edge2 = new Edge(
          vertexIndices[baseIndex + sideOffset],
          vertexIndices[nextBaseIndex + sideOffset]
        );
        newEdges.push(edge2);
        mesh.addEdge(edge2);

        const edge3 = new Edge(
          vertexIndices[baseIndex + sideOffset + 1],
          vertexIndices[nextBaseIndex + sideOffset + 1]
        );
        newEdges.push(edge3);
        mesh.addEdge(edge3);
      }
    }
  }

  // Create faces for the bevel
  for (let i = 0; i < segments; i++) {
    const baseIndex = i * (bothSides ? 4 : 2);
    
    for (let j = 0; j < (bothSides ? 2 : 1); j++) {
      const sideOffset = j * 2;
      
      // Create face for this segment
      const faceVertices = [
        vertexIndices[baseIndex + sideOffset],
        vertexIndices[baseIndex + sideOffset + 1]
      ];
      
      const faceEdgeIndices = [newEdges[i * (bothSides ? 3 : 1) + j].v1, newEdges[i * (bothSides ? 3 : 1) + j].v2];
      
      // Add vertices and edges from next segment if available
      if (i < segments - 1) {
        const nextBaseIndex = (i + 1) * (bothSides ? 4 : 2);
        faceVertices.push(
          vertexIndices[nextBaseIndex + sideOffset + 1],
          vertexIndices[nextBaseIndex + sideOffset]
        );
        
        const nextEdgeIndex = (i + 1) * (bothSides ? 3 : 1) + j;
        faceEdgeIndices.push(
          newEdges[nextEdgeIndex].v1,
          newEdges[nextEdgeIndex].v2
        );
      }

      const face = new Face(faceVertices, faceEdgeIndices, {
        materialIndex,
        normal: new Vector3(0, 1, 0) // Default normal
      });
      newFaces.push(face);
      mesh.addFace(face);
    }
  }

  // Remove original edge if not keeping original
  if (!keepOriginal) {
    mesh.removeEdge(edgeIndex);
  }

  return mesh;
}

/**
 * Bevels a vertex by creating new geometry around the vertex
 * @param mesh The mesh containing the vertex
 * @param vertexIndex The index of the vertex to bevel
 * @param options Options for the bevel operation
 * @returns The modified mesh
 */
export function bevelVertex(
  mesh: EditableMesh,
  vertexIndex: number,
  options: VertexBevelOptions = {}
): EditableMesh {
  const distance = options.distance ?? 0.1;
  const segments = options.segments ?? 1;
  const profile = options.profile ?? 0;
  const materialIndex = options.materialIndex ?? 0;
  const keepOriginal = options.keepOriginal ?? true;
  const allEdges = options.allEdges ?? true;
  const weldTolerance = options.weldTolerance ?? 0.001;

  const vertex = mesh.getVertex(vertexIndex);
  if (!vertex) {
    throw new Error(`Vertex ${vertexIndex} not found`);
  }

  // Get connected edges
  const connectedEdges = mesh.edges.filter(edge => 
    edge.v1 === vertexIndex || edge.v2 === vertexIndex
  );

  if (connectedEdges.length === 0) {
    throw new Error(`No edges connected to vertex ${vertexIndex}`);
  }

  // Calculate average direction from connected vertices
  const connectedVertices = new Set<number>();
  connectedEdges.forEach(edge => {
    if (edge.v1 === vertexIndex) {
      connectedVertices.add(edge.v2);
    } else {
      connectedVertices.add(edge.v1);
    }
  });

  const avgDirection = new Vector3();
  connectedVertices.forEach(vIndex => {
    const v = mesh.getVertex(vIndex);
    if (v) {
      avgDirection.add(new Vector3(v.x - vertex.x, v.y - vertex.y, v.z - vertex.z));
    }
  });
  avgDirection.normalize();

  // Calculate bevel direction
  let bevelDirection = options.direction;
  if (!bevelDirection) {
    bevelDirection = avgDirection.clone();
  }

  // Create bevel geometry
  const newVertices: Vertex[] = [];
  const newEdges: Edge[] = [];
  const newFaces: Face[] = [];

  // Create vertices around the bevel
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const profileOffset = profile * Math.sin(Math.PI * t);
    const currentDistance = distance * (1 + profileOffset);

    // Create vertices for each connected edge
    connectedEdges.forEach(edge => {
      const otherVertexIndex = edge.v1 === vertexIndex ? edge.v2 : edge.v1;
      const otherVertex = mesh.getVertex(otherVertexIndex);
      
      if (otherVertex) {
        const edgeDirection = new Vector3();
        edgeDirection.subVectors(otherVertex, vertex).normalize();
        
        const offset = bevelDirection.clone().multiplyScalar(currentDistance);
        const bevelVertex = new Vertex(
          vertex.x + offset.x,
          vertex.y + offset.y,
          vertex.z + offset.z,
          { uv: vertex.uv }
        );
        newVertices.push(bevelVertex);
      }
    });
  }

  // Add new vertices to mesh
  const vertexIndices = newVertices.map(v => mesh.addVertex(v));

  // Create edges and faces for the bevel
  for (let i = 0; i < segments; i++) {
    const baseIndex = i * connectedEdges.length;
    const nextBaseIndex = (i + 1) * connectedEdges.length;
    
    // Create edges connecting bevel vertices
    for (let j = 0; j < connectedEdges.length; j++) {
      const currentIndex = baseIndex + j;
      const nextIndex = nextBaseIndex + j;
      
      // Vertical edge
      const edge = new Edge(vertexIndices[currentIndex], vertexIndices[nextIndex]);
      newEdges.push(edge);
      mesh.addEdge(edge);
      
      // Horizontal edge (if not last segment)
      if (i < segments - 1) {
        const nextJ = (j + 1) % connectedEdges.length;
        const horizontalEdge = new Edge(
          vertexIndices[currentIndex],
          vertexIndices[baseIndex + nextJ]
        );
        newEdges.push(horizontalEdge);
        mesh.addEdge(horizontalEdge);
      }
    }
  }

  // Create faces for the bevel
  for (let i = 0; i < segments; i++) {
    const baseIndex = i * connectedEdges.length;
    
    for (let j = 0; j < connectedEdges.length; j++) {
      const currentIndex = baseIndex + j;
      const nextJ = (j + 1) % connectedEdges.length;
      const nextIndex = baseIndex + nextJ;
      
      const faceVertices = [
        vertexIndices[currentIndex],
        vertexIndices[nextIndex]
      ];
      
      const faceEdgeIndices = [
        newEdges[i * connectedEdges.length + j].v1,
        newEdges[i * connectedEdges.length + j].v2
      ];
      
      // Add vertices and edges from next segment if available
      if (i < segments - 1) {
        const nextBaseIndex = (i + 1) * connectedEdges.length;
        faceVertices.push(
          vertexIndices[nextBaseIndex + nextJ],
          vertexIndices[nextBaseIndex + j]
        );
        
        const nextEdgeIndex = (i + 1) * connectedEdges.length + j;
        faceEdgeIndices.push(
          newEdges[nextEdgeIndex].v1,
          newEdges[nextEdgeIndex].v2
        );
      }

      const face = new Face(faceVertices, faceEdgeIndices, {
        materialIndex,
        normal: new Vector3(0, 1, 0) // Default normal
      });
      newFaces.push(face);
      mesh.addFace(face);
    }
  }

  // Remove original vertex if not keeping original
  if (!keepOriginal) {
    mesh.removeVertex(vertexIndex);
  }

  return mesh;
}

/**
 * Bevels a face by creating new geometry around the face edges
 * @param mesh The mesh containing the face
 * @param faceIndex The index of the face to bevel
 * @param options Options for the bevel operation
 * @returns The modified mesh
 */
export function bevelFace(
  mesh: EditableMesh,
  faceIndex: number,
  options: FaceBevelOptions = {}
): EditableMesh {
  const distance = options.distance ?? 0.1;
  const segments = options.segments ?? 1;
  const profile = options.profile ?? 0;
  const materialIndex = options.materialIndex ?? 0;
  const keepOriginal = options.keepOriginal ?? true;
  const allEdges = options.allEdges ?? true;
  const weldTolerance = options.weldTolerance ?? 0.001;

  const face = mesh.getFace(faceIndex);
  if (!face) {
    throw new Error(`Face ${faceIndex} not found`);
  }

  // Get face edges
  const faceEdges = face.edges.map(edgeIndex => mesh.getEdge(edgeIndex)).filter(Boolean) as Edge[];
  
  if (faceEdges.length === 0) {
    throw new Error(`No edges found for face ${faceIndex}`);
  }

  // Calculate face normal
  let faceNormal = face.normal;
  if (!faceNormal) {
    const faceVertices = face.vertices.map(v => mesh.getVertex(v)).filter(Boolean) as Vertex[];
    if (faceVertices.length >= 3) {
      const v1 = faceVertices[0];
      const v2 = faceVertices[1];
      const v3 = faceVertices[2];
      faceNormal = new Vector3();
      const vec1 = new Vector3().subVectors(v2, v1);
      const vec2 = new Vector3().subVectors(v3, v1);
      faceNormal.crossVectors(vec1, vec2).normalize();
    } else {
      faceNormal = new Vector3(0, 1, 0);
    }
  }

  // Calculate bevel direction (opposite to face normal)
  let bevelDirection = options.direction;
  if (!bevelDirection) {
    bevelDirection = faceNormal.clone().negate();
  }

  // Create bevel geometry
  const newVertices: Vertex[] = [];
  const newEdges: Edge[] = [];
  const newFaces: Face[] = [];

  // Create vertices along each edge
  faceEdges.forEach(edge => {
    const v1 = mesh.getVertex(edge.v1);
    const v2 = mesh.getVertex(edge.v2);
    
    if (v1 && v2) {
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const profileOffset = profile * Math.sin(Math.PI * t);
        const currentDistance = distance * (1 + profileOffset);
        
        // Interpolate between v1 and v2
        const interpolatedVertex = new Vertex(
          v1.x + (v2.x - v1.x) * t,
          v1.y + (v2.y - v1.y) * t,
          v1.z + (v2.z - v1.z) * t,
          { uv: v1.uv }
        );
        
        // Apply bevel offset
        const offset = bevelDirection.clone().multiplyScalar(currentDistance);
        const bevelVertex = new Vertex(
          interpolatedVertex.x + offset.x,
          interpolatedVertex.y + offset.y,
          interpolatedVertex.z + offset.z,
          { uv: interpolatedVertex.uv }
        );
        
        newVertices.push(bevelVertex);
      }
    }
  });

  // Add new vertices to mesh
  const vertexIndices = newVertices.map(v => mesh.addVertex(v));

  // Create edges and faces for the bevel
  const verticesPerEdge = segments + 1;
  
  for (let i = 0; i < segments; i++) {
    const baseIndex = i * verticesPerEdge;
    
    // Create edges connecting bevel vertices
    for (let j = 0; j < faceEdges.length; j++) {
      const currentIndex = baseIndex + j;
      const nextIndex = baseIndex + j + 1;
      
      // Vertical edge
      const edge = new Edge(vertexIndices[currentIndex], vertexIndices[nextIndex]);
      newEdges.push(edge);
      mesh.addEdge(edge);
      
      // Horizontal edge (if not last segment)
      if (i < segments - 1) {
        const nextBaseIndex = (i + 1) * verticesPerEdge;
        const horizontalEdge = new Edge(
          vertexIndices[currentIndex],
          vertexIndices[nextBaseIndex + j]
        );
        newEdges.push(horizontalEdge);
        mesh.addEdge(horizontalEdge);
      }
    }
  }

  // Create faces for the bevel
  for (let i = 0; i < segments; i++) {
    const baseIndex = i * verticesPerEdge;
    
    for (let j = 0; j < faceEdges.length; j++) {
      const currentIndex = baseIndex + j;
      const nextJ = (j + 1) % faceEdges.length;
      const nextIndex = baseIndex + nextJ;
      
      const faceVertices = [
        vertexIndices[currentIndex],
        vertexIndices[nextIndex]
      ];
      
      const faceEdgeIndices = [
        newEdges[i * faceEdges.length + j].v1,
        newEdges[i * faceEdges.length + j].v2
      ];
      
      // Add vertices and edges from next segment if available
      if (i < segments - 1) {
        const nextBaseIndex = (i + 1) * verticesPerEdge;
        faceVertices.push(
          vertexIndices[nextBaseIndex + nextJ],
          vertexIndices[nextBaseIndex + j]
        );
        
        const nextEdgeIndex = (i + 1) * faceEdges.length + j;
        faceEdgeIndices.push(
          newEdges[nextEdgeIndex].v1,
          newEdges[nextEdgeIndex].v2
        );
      }

      const face = new Face(faceVertices, faceEdgeIndices, {
        materialIndex,
        normal: faceNormal.clone()
      });
      newFaces.push(face);
      mesh.addFace(face);
    }
  }

  // Remove original face if not keeping original
  if (!keepOriginal) {
    mesh.removeFace(faceIndex);
  }

  return mesh;
}

/**
 * Generic bevel function that can bevel edges, vertices, or faces
 * @param mesh The mesh to bevel
 * @param bevelType The type of bevel operation
 * @param targetIndex The index of the edge, vertex, or face to bevel
 * @param options Options for the bevel operation
 * @returns The modified mesh
 */
export function bevel(
  mesh: EditableMesh,
  bevelType: 'edge' | 'vertex' | 'face',
  targetIndex: number,
  options: EdgeBevelOptions | VertexBevelOptions | FaceBevelOptions = {}
): EditableMesh {
  switch (bevelType) {
    case 'edge':
      return bevelEdge(mesh, targetIndex, options as EdgeBevelOptions);
    case 'vertex':
      return bevelVertex(mesh, targetIndex, options as VertexBevelOptions);
    case 'face':
      return bevelFace(mesh, targetIndex, options as FaceBevelOptions);
    default:
      throw new Error(`Unknown bevel type: ${bevelType}`);
  }
} 