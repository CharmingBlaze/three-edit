import { Vector3 } from 'three';
import { EditableMesh } from '../../core/EditableMesh.ts';
import { Edge } from '../../core/Edge.ts';
import { Face } from '../../core/Face.ts';
import { Vertex } from '../../core/Vertex.ts';
import { FaceBevelOptions } from './types';

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

  const materialIndex = options.materialIndex ?? 0;
  const keepOriginal = options.keepOriginal ?? true;

  const face = mesh.getFace(faceIndex);
  if (!face) {
    throw new Error(`Face ${faceIndex} not found`);
  }

  if (face.edges.length === 0) {
    throw new Error(`No edges found for face ${faceIndex}`);
  }

  // Calculate face normal
  const faceNormal = calculateFaceNormal(mesh, face);
  
  // Calculate bevel direction
  let bevelDirection = options.direction;
  if (!bevelDirection) {
    bevelDirection = faceNormal;
  }

  // Create bevel geometry
  const newVertices: Vertex[] = [];
  const newEdges: Edge[] = [];

  // Create vertices around the face edges
  for (let i = 0; i <= segments; i++) {
    const currentDistance = distance;

    // Create vertices for each edge of the face
    for (let j = 0; j < face.vertices.length; j++) {
      const vertexIndex = face.vertices[j];
      const vertex = mesh.getVertex(vertexIndex);
      if (!vertex) continue;

      // Calculate edge direction
      const nextVertexIndex = face.vertices[(j + 1) % face.vertices.length];
      const nextVertex = mesh.getVertex(nextVertexIndex);
      if (!nextVertex) continue;

      const edgeDirection = new Vector3();
      edgeDirection.subVectors(
        new Vector3(nextVertex.x, nextVertex.y, nextVertex.z),
        new Vector3(vertex.x, vertex.y, vertex.z)
      ).normalize();

      // Calculate perpendicular direction (inward from edge)
      const perpendicular = new Vector3();
      perpendicular.crossVectors(edgeDirection, faceNormal).normalize();

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
    const baseIndex = i * face.vertices.length;
    const nextBaseIndex = (i + 1) * face.vertices.length;
    
    // Create edges around the bevel
    for (let j = 0; j < face.vertices.length; j++) {
      const currentIndex = baseIndex + j;
      const nextIndex = baseIndex + ((j + 1) % face.vertices.length);

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
    const baseIndex = i * face.vertices.length;
    
    for (let j = 0; j < face.vertices.length; j++) {
      const currentIndex = baseIndex + j;
      const nextIndex = baseIndex + ((j + 1) % face.vertices.length);
      
      const faceVertices = [
        vertexIndices[currentIndex],
        vertexIndices[nextIndex]
      ];
      
      // Add vertices from the next segment if available
      if (i < segments - 1) {
        const nextBaseIndex = (i + 1) * face.vertices.length;
        const nextSegmentNextIndex = nextBaseIndex + ((j + 1) % face.vertices.length);
        const nextSegmentIndex = nextBaseIndex + j;
        faceVertices.push(
          vertexIndices[nextSegmentNextIndex],
          vertexIndices[nextSegmentIndex]
        );
      }

      const newFace = new Face(faceVertices, [], { 
        materialIndex
      });
      mesh.addFace(newFace);
    }
  }

  // Remove original face if not keeping original geometry
  if (!keepOriginal) {
    mesh.removeFace(faceIndex);
  }

  return mesh;
}

/**
 * Calculate face normal
 */
function calculateFaceNormal(mesh: EditableMesh, face: Face): Vector3 {
  if (face.vertices.length < 3) {
    return new Vector3(0, 1, 0);
  }

  const v1 = mesh.getVertex(face.vertices[0]);
  const v2 = mesh.getVertex(face.vertices[1]);
  const v3 = mesh.getVertex(face.vertices[2]);

  if (!v1 || !v2 || !v3) {
    return new Vector3(0, 1, 0);
  }

  const edge1 = new Vector3();
  edge1.subVectors(
    new Vector3(v2.x, v2.y, v2.z),
    new Vector3(v1.x, v1.y, v1.z)
  );

  const edge2 = new Vector3();
  edge2.subVectors(
    new Vector3(v3.x, v3.y, v3.z),
    new Vector3(v1.x, v1.y, v1.z)
  );

  const normal = new Vector3();
  normal.crossVectors(edge1, edge2).normalize();

  return normal;
} 