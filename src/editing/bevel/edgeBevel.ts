import { Vector3 } from 'three';
import { EditableMesh } from '../../core/EditableMesh';
import { Edge } from '../../core/Edge';
import { Face } from '../../core/Face';
import { Vertex } from '../../core/Vertex';
import { EdgeBevelOptions } from './types';

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

  const materialIndex = options.materialIndex ?? 0;
  const keepOriginal = options.keepOriginal ?? true;
  const bothSides = options.bothSides ?? false;

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
  edgeDirection.subVectors(
    new Vector3(v2.x, v2.y, v2.z),
    new Vector3(v1.x, v1.y, v1.z)
  ).normalize();

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

  // Create vertices along the bevel
  for (let i = 0; i <= segments; i++) {
    const currentDistance = distance;

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
      
      // Add vertices from the next segment if available
      if (i < segments - 1) {
        const nextBaseIndex = (i + 1) * (bothSides ? 4 : 2);
        faceVertices.push(
          vertexIndices[nextBaseIndex + sideOffset + 1],
          vertexIndices[nextBaseIndex + sideOffset]
        );
      }

      const face = new Face(faceVertices, [], { // TODO: Correctly calculate edge indices
        materialIndex
      });
      mesh.addFace(face);
    }
  }

  // Remove original edge if not keeping original geometry
  if (!keepOriginal) {
    mesh.removeEdge(edgeIndex);
  }

  return mesh;
} 