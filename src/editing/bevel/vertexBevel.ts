import { Vector3 } from 'three';
import { EditableMesh } from '../../core/EditableMesh.ts';
import { Edge } from '../../core/Edge.ts';
import { Face } from '../../core/Face.ts';
import { Vertex } from '../../core/Vertex.ts';
import { VertexBevelOptions } from './types';

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

  const vertex = mesh.getVertex(vertexIndex);
  if (!vertex) {
    throw new Error(`Vertex ${vertexIndex} not found`);
  }

  // Find all edges connected to this vertex
  const connectedEdges: Edge[] = [];
  for (let i = 0; i < mesh.edges.length; i++) {
    const edge = mesh.edges[i];
    if (edge.v1 === vertexIndex || edge.v2 === vertexIndex) {
      connectedEdges.push(edge);
    }
  }

  if (connectedEdges.length === 0) {
    throw new Error(`No edges connected to vertex ${vertexIndex}`);
  }

  // Calculate bevel direction
  let bevelDirection = options.direction;
  if (!bevelDirection) {
    // Auto-calculate direction based on connected edges
    const averageDirection = new Vector3();
    for (const edge of connectedEdges) {
      const otherVertexIndex = edge.v1 === vertexIndex ? edge.v2 : edge.v1;
      const otherVertex = mesh.getVertex(otherVertexIndex);
      if (otherVertex) {
        const direction = new Vector3();
        direction.subVectors(
          new Vector3(otherVertex.x, otherVertex.y, otherVertex.z),
          new Vector3(vertex.x, vertex.y, vertex.z)
        ).normalize();
        averageDirection.add(direction);
      }
    }
    bevelDirection = averageDirection.normalize();
  }

  // Create bevel geometry
  const newVertices: Vertex[] = [];
  const newEdges: Edge[] = [];

  // Create vertices around the bevel
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const profileOffset = profile * Math.sin(Math.PI * t);
    const currentDistance = distance * (1 + profileOffset);

    // Create vertices for each connected edge
    for (const edge of connectedEdges) {
      const otherVertexIndex = edge.v1 === vertexIndex ? edge.v2 : edge.v1;
      const otherVertex = mesh.getVertex(otherVertexIndex);
      if (!otherVertex) continue;

      const edgeDirection = new Vector3();
      edgeDirection.subVectors(
        new Vector3(otherVertex.x, otherVertex.y, otherVertex.z),
        new Vector3(vertex.x, vertex.y, vertex.z)
      ).normalize();

      // Calculate perpendicular direction
      const perpendicular = new Vector3();
      perpendicular.crossVectors(edgeDirection, bevelDirection).normalize();

      const offset = perpendicular.clone().multiplyScalar(currentDistance);
      
      // Create bevel vertex
      const bevelVertex = new Vertex(
        vertex.x + offset.x,
        vertex.y + offset.y,
        vertex.z + offset.z,
        { uv: vertex.uv }
      );
      newVertices.push(bevelVertex);
    }
  }

  // Add new vertices to mesh
  const vertexIndices = newVertices.map(v => mesh.addVertex(v));

  // Create edges connecting the bevel vertices
  for (let i = 0; i < segments; i++) {
    const baseIndex = i * connectedEdges.length;
    const nextBaseIndex = (i + 1) * connectedEdges.length;
    
    // Create edges around the bevel
    for (let j = 0; j < connectedEdges.length; j++) {
      const currentIndex = baseIndex + j;
      const nextIndex = baseIndex + ((j + 1) % connectedEdges.length);

      // Horizontal edges
      const edge1 = new Edge(vertexIndices[currentIndex], vertexIndices[nextIndex]);
      newEdges.push(edge1);
      mesh.addEdge(edge1);

      // Vertical edges (if not last segment)
      if (i < segments - 1) {
        const edge2 = new Edge(vertexIndices[currentIndex], vertexIndices[nextBaseIndex + j]);
        newEdges.push(edge2);
        mesh.addEdge(edge2);
      }
    }
  }

  // Create faces for the bevel
  for (let i = 0; i < segments; i++) {
    const baseIndex = i * connectedEdges.length;
    
    for (let j = 0; j < connectedEdges.length; j++) {
      const currentIndex = baseIndex + j;
      const nextIndex = baseIndex + ((j + 1) % connectedEdges.length);
      
      // Create face for this segment
      const faceVertices = [
        vertexIndices[currentIndex],
        vertexIndices[nextIndex]
      ];
      
      // Add vertices from the next segment if available
      if (i < segments - 1) {
        const nextBaseIndex = (i + 1) * connectedEdges.length;
        const nextSegmentNextIndex = nextBaseIndex + ((j + 1) % connectedEdges.length);
        const nextSegmentIndex = nextBaseIndex + j;
        faceVertices.push(
          vertexIndices[nextSegmentNextIndex],
          vertexIndices[nextSegmentIndex]
        );
      }

      const face = new Face(faceVertices, [], { // TODO: Correctly calculate edge indices
        materialIndex
      });
      mesh.addFace(face);
    }
  }

  // Remove original vertex if not keeping original geometry
  if (!keepOriginal) {
    mesh.removeVertex(vertexIndex);
  }

  return mesh;
} 