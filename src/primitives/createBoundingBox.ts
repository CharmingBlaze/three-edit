import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for creating a bounding box
 */
export interface CreateBoundingBoxOptions {
  /** Width of the bounding box */
  width?: number;
  /** Height of the bounding box */
  height?: number;
  /** Depth of the bounding box */
  depth?: number;
  /** Thickness of the wireframe lines */
  lineThickness?: number;
  /** Name of the mesh */
  name?: string;
}

/**
 * Creates a bounding box as an EditableMesh
 * @param options Options for creating the bounding box
 * @returns A new EditableMesh instance representing a bounding box
 */
export function createBoundingBox(options: CreateBoundingBoxOptions = {}): EditableMesh {
  const width = options.width ?? 2;
  const height = options.height ?? 2;
  const depth = options.depth ?? 2;
  const lineThickness = options.lineThickness ?? 0.02;
  const name = options.name ?? 'BoundingBox';
  
  const mesh = new EditableMesh({ name });
  
  // Calculate half dimensions
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;
  const halfThickness = lineThickness / 2;
  
  // Create vertices for the bounding box wireframe
  const vertices: number[] = [];
  
  // Create vertices for each corner of the box
  // We'll create small cubes at each corner to represent the wireframe
  const corners = [
    // Bottom corners
    [-halfWidth, -halfHeight, -halfDepth],
    [halfWidth, -halfHeight, -halfDepth],
    [halfWidth, -halfHeight, halfDepth],
    [-halfWidth, -halfHeight, halfDepth],
    // Top corners
    [-halfWidth, halfHeight, -halfDepth],
    [halfWidth, halfHeight, -halfDepth],
    [halfWidth, halfHeight, halfDepth],
    [-halfWidth, halfHeight, halfDepth],
  ];
  
  // Create small cubes at each corner
  for (const [cx, cy, cz] of corners) {
    // Create 8 vertices for each corner cube
    const cornerVertices = [
      // Bottom face
      new Vertex(cx - halfThickness, cy - halfThickness, cz - halfThickness),
      new Vertex(cx + halfThickness, cy - halfThickness, cz - halfThickness),
      new Vertex(cx + halfThickness, cy - halfThickness, cz + halfThickness),
      new Vertex(cx - halfThickness, cy - halfThickness, cz + halfThickness),
      // Top face
      new Vertex(cx - halfThickness, cy + halfThickness, cz - halfThickness),
      new Vertex(cx + halfThickness, cy + halfThickness, cz - halfThickness),
      new Vertex(cx + halfThickness, cy + halfThickness, cz + halfThickness),
      new Vertex(cx - halfThickness, cy + halfThickness, cz + halfThickness),
    ];
    
    // Add vertices to mesh with UVs
    for (let i = 0; i < cornerVertices.length; i++) {
      const vertex = cornerVertices[i];
      vertex.uv = { u: i % 2, v: Math.floor(i / 2) };
      vertices.push(mesh.addVertex(vertex));
    }
  }
  
  // Create edges and faces for each corner cube
  for (let corner = 0; corner < 8; corner++) {
    const baseIndex = corner * 8;
    
    // Create faces for this corner cube with their own edges (material index 0)
    // Bottom face
    const bottomEdges = [
      mesh.addEdge(new Edge(vertices[baseIndex], vertices[baseIndex + 1])),
      mesh.addEdge(new Edge(vertices[baseIndex + 1], vertices[baseIndex + 2])),
      mesh.addEdge(new Edge(vertices[baseIndex + 2], vertices[baseIndex + 3])),
      mesh.addEdge(new Edge(vertices[baseIndex + 3], vertices[baseIndex]))
    ];
    mesh.addFace(
      new Face(
        [vertices[baseIndex], vertices[baseIndex + 1], vertices[baseIndex + 2], vertices[baseIndex + 3]],
        bottomEdges,
        { materialIndex: 0 }
      )
    );
    
    // Top face
    const topEdges = [
      mesh.addEdge(new Edge(vertices[baseIndex + 4], vertices[baseIndex + 5])),
      mesh.addEdge(new Edge(vertices[baseIndex + 5], vertices[baseIndex + 6])),
      mesh.addEdge(new Edge(vertices[baseIndex + 6], vertices[baseIndex + 7])),
      mesh.addEdge(new Edge(vertices[baseIndex + 7], vertices[baseIndex + 4]))
    ];
    mesh.addFace(
      new Face(
        [vertices[baseIndex + 4], vertices[baseIndex + 5], vertices[baseIndex + 6], vertices[baseIndex + 7]],
        topEdges,
        { materialIndex: 0 }
      )
    );
    
    // Left face
    const leftEdges = [
      mesh.addEdge(new Edge(vertices[baseIndex], vertices[baseIndex + 3])),
      mesh.addEdge(new Edge(vertices[baseIndex + 3], vertices[baseIndex + 7])),
      mesh.addEdge(new Edge(vertices[baseIndex + 7], vertices[baseIndex + 4])),
      mesh.addEdge(new Edge(vertices[baseIndex + 4], vertices[baseIndex]))
    ];
    mesh.addFace(
      new Face(
        [vertices[baseIndex], vertices[baseIndex + 3], vertices[baseIndex + 7], vertices[baseIndex + 4]],
        leftEdges,
        { materialIndex: 0 }
      )
    );
    
    // Right face
    const rightEdges = [
      mesh.addEdge(new Edge(vertices[baseIndex + 1], vertices[baseIndex + 2])),
      mesh.addEdge(new Edge(vertices[baseIndex + 2], vertices[baseIndex + 6])),
      mesh.addEdge(new Edge(vertices[baseIndex + 6], vertices[baseIndex + 5])),
      mesh.addEdge(new Edge(vertices[baseIndex + 5], vertices[baseIndex + 1]))
    ];
    mesh.addFace(
      new Face(
        [vertices[baseIndex + 1], vertices[baseIndex + 2], vertices[baseIndex + 6], vertices[baseIndex + 5]],
        rightEdges,
        { materialIndex: 0 }
      )
    );
    
    // Front face
    const frontEdges = [
      mesh.addEdge(new Edge(vertices[baseIndex], vertices[baseIndex + 1])),
      mesh.addEdge(new Edge(vertices[baseIndex + 1], vertices[baseIndex + 5])),
      mesh.addEdge(new Edge(vertices[baseIndex + 5], vertices[baseIndex + 4])),
      mesh.addEdge(new Edge(vertices[baseIndex + 4], vertices[baseIndex]))
    ];
    mesh.addFace(
      new Face(
        [vertices[baseIndex], vertices[baseIndex + 1], vertices[baseIndex + 5], vertices[baseIndex + 4]],
        frontEdges,
        { materialIndex: 0 }
      )
    );
    
    // Back face
    const backEdges = [
      mesh.addEdge(new Edge(vertices[baseIndex + 3], vertices[baseIndex + 2])),
      mesh.addEdge(new Edge(vertices[baseIndex + 2], vertices[baseIndex + 6])),
      mesh.addEdge(new Edge(vertices[baseIndex + 6], vertices[baseIndex + 7])),
      mesh.addEdge(new Edge(vertices[baseIndex + 7], vertices[baseIndex + 3]))
    ];
    mesh.addFace(
      new Face(
        [vertices[baseIndex + 3], vertices[baseIndex + 2], vertices[baseIndex + 6], vertices[baseIndex + 7]],
        backEdges,
        { materialIndex: 0 }
      )
    );
  }
  
  return mesh;
} 