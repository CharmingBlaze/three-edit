import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Face } from '../core/Face.ts';
import { Edge } from '../core/Edge.ts';

export interface SmoothingOptions {
  iterations?: number;
  factor?: number;
  preserveBoundaries?: boolean;
  preserveSharpEdges?: boolean;
  selectionOnly?: boolean;
  materialIndex?: number;
}

export interface SubdivisionOptions extends SmoothingOptions {
  levels?: number;
  scheme?: 'catmullClark' | 'loop' | 'butterfly';
}

export interface LaplacianOptions extends SmoothingOptions {
  lambda?: number;
}

/**
 * Subdivide mesh surface using various schemes
 */
export function subdivideSurface(
  mesh: EditableMesh,
  options: SubdivisionOptions = {}
): EditableMesh {
  const {
    levels = 1,
    scheme = 'catmullClark',
    iterations = 1,
    factor = 1.0,
    selectionOnly = false,
    materialIndex
  } = options;

  let clonedMesh = mesh.clone();
  
  for (let level = 0; level < levels; level++) {
    switch (scheme) {
      case 'catmullClark':
        clonedMesh = subdivideCatmullClark(clonedMesh);
        break;
      case 'loop':
        clonedMesh = subdivideLoop(clonedMesh);
        break;
      case 'butterfly':
        clonedMesh = subdivideButterfly(clonedMesh);
        break;
      default:
        throw new Error(`Unknown subdivision scheme: ${scheme}`);
    }
  }

  // Apply smoothing if iterations > 0
  if (iterations > 0) {
    clonedMesh = smoothVertices(clonedMesh, { iterations, factor, selectionOnly, materialIndex });
  }

  return clonedMesh;
}

/**
 * Catmull-Clark subdivision
 */
function subdivideCatmullClark(mesh: EditableMesh): EditableMesh {
  const clonedMesh = new EditableMesh();
  
  // For each face, create new vertices at face centers
  mesh.faces.forEach(face => {
    const faceCenter = calculateFaceCenter(mesh, face);
    const centerVertex = new Vertex(faceCenter.x, faceCenter.y, faceCenter.z);
    const centerVertexIndex = clonedMesh.addVertex(centerVertex);
    
    // Create new faces by connecting center to each edge
    for (let i = 0; i < face.vertices.length; i++) {
      const v1 = face.vertices[i];
      const v2 = face.vertices[(i + 1) % face.vertices.length];
      
      // Add original vertices
      const originalV1 = mesh.vertices[v1];
      const originalV2 = mesh.vertices[v2];
      const newV1Index = clonedMesh.addVertex(new Vertex(originalV1.x, originalV1.y, originalV1.z));
      const newV2Index = clonedMesh.addVertex(new Vertex(originalV2.x, originalV2.y, originalV2.z));
      
      // Create new face
      const newFace = new Face([newV1Index, centerVertexIndex, newV2Index], []);
      clonedMesh.addFace(newFace);
    }
  });
  
  return clonedMesh;
}

/**
 * Loop subdivision
 */
function subdivideLoop(mesh: EditableMesh): EditableMesh {
  const clonedMesh = new EditableMesh();
  
  // Loop subdivision is primarily for triangular meshes
  // This is a simplified implementation
  mesh.faces.forEach(face => {
    if (face.vertices.length === 3) {
      // For triangles, create new vertices at edge midpoints
      const newVertices: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const v1 = face.vertices[i];
        const v2 = face.vertices[(i + 1) % 3];
        
        const originalV1 = mesh.vertices[v1];
        const originalV2 = mesh.vertices[v2];
        
        // Create midpoint vertex
        const midpoint = new Vertex(
          (originalV1.x + originalV2.x) / 2,
          (originalV1.y + originalV2.y) / 2,
          (originalV1.z + originalV2.z) / 2
        );
        newVertices.push(clonedMesh.addVertex(midpoint));
      }
      
      // Create new faces
      const originalVertices = face.vertices.map(v => {
        const originalVertex = mesh.vertices[v];
        return clonedMesh.addVertex(new Vertex(originalVertex.x, originalVertex.y, originalVertex.z));
      });
      
      // Create 4 new triangular faces
      for (let i = 0; i < 3; i++) {
        const newFace = new Face([
          originalVertices[i],
          newVertices[i],
          newVertices[(i + 2) % 3]
        ], []);
        clonedMesh.addFace(newFace);
      }
      
      // Center face
      const centerFace = new Face(newVertices, []);
      clonedMesh.addFace(centerFace);
    }
  });
  
  return clonedMesh;
}

/**
 * Butterfly subdivision
 */
function subdivideButterfly(mesh: EditableMesh): EditableMesh {
  // Butterfly subdivision is similar to Loop but with different weights
  // This is a simplified implementation
  return subdivideLoop(mesh);
}

/**
 * Calculate face center
 */
function calculateFaceCenter(mesh: EditableMesh, face: Face): Vector3 {
  const center = new Vector3();
  let count = 0;
  
  face.vertices.forEach(vertexIndex => {
    const vertex = mesh.vertices[vertexIndex];
    if (vertex) {
      center.add(new Vector3(vertex.x, vertex.y, vertex.z));
      count++;
    }
  });
  
  if (count > 0) {
    center.divideScalar(count);
  }
  
  return center;
}

/**
 * Laplacian smoothing
 */
export function laplacianSmoothing(
  mesh: EditableMesh,
  options: LaplacianOptions = {}
): EditableMesh {
  const {
    lambda = 0.5,
    iterations = 1,
    factor = 1.0,
    selectionOnly = false,
    materialIndex
  } = options;

  const clonedMesh = mesh.clone();
  
  // Get vertices to smooth
  const verticesToSmooth = selectionOnly 
    ? (clonedMesh as any).getSelectedVertices?.() || clonedMesh.vertices
    : clonedMesh.vertices;

  for (let iteration = 0; iteration < iterations; iteration++) {
    const newPositions = new Map<Vertex, Vector3>();
    
    verticesToSmooth.forEach((vertex: Vertex) => {
      const connectedVertices = getConnectedVertices(clonedMesh, vertex);
      
      if (connectedVertices.length === 0) {
        newPositions.set(vertex, new Vector3(vertex.x, vertex.y, vertex.z));
        return;
      }
      
      // Calculate Laplacian
      const laplacian = new Vector3();
      connectedVertices.forEach(connectedVertex => {
        laplacian.add(new Vector3(connectedVertex.x, connectedVertex.y, connectedVertex.z));
      });
      laplacian.divideScalar(connectedVertices.length);
      laplacian.sub(new Vector3(vertex.x, vertex.y, vertex.z));
      
      // Apply Laplacian smoothing
      const newPosition = new Vector3(vertex.x, vertex.y, vertex.z);
      newPosition.add(laplacian.multiplyScalar(lambda * factor));
      
      newPositions.set(vertex, newPosition);
    });
    
    // Apply new positions
    newPositions.forEach((newPosition, vertex) => {
      vertex.setPosition(newPosition.x, newPosition.y, newPosition.z);
    });
  }

  // Assign material if specified
  if (materialIndex !== undefined) {
    clonedMesh.faces.forEach(face => {
      face.materialIndex = materialIndex;
    });
  }

  return clonedMesh;
}

/**
 * Smooth edges by moving vertices towards edge midpoints
 */
export function smoothEdges(
  mesh: EditableMesh,
  options: SmoothingOptions = {}
): EditableMesh {
  const {
    iterations = 1,
    factor = 1.0,
    selectionOnly = false,
    materialIndex
  } = options;

  const clonedMesh = mesh.clone();
  
  // Get edges to smooth
  const edgesToSmooth = selectionOnly 
    ? (clonedMesh as any).getSelectedEdges?.() || clonedMesh.edges
    : clonedMesh.edges;

  for (let iteration = 0; iteration < iterations; iteration++) {
    edgesToSmooth.forEach((edge: Edge) => {
      const v1 = clonedMesh.vertices[edge.v1];
      const v2 = clonedMesh.vertices[edge.v2];
      
      // Calculate midpoint
      const midpoint = new Vector3();
      midpoint.addVectors(
        new Vector3(v1.x, v1.y, v1.z),
        new Vector3(v2.x, v2.y, v2.z)
      );
      midpoint.divideScalar(2);
      
      // Move vertices towards midpoint
      const offset1 = midpoint.clone().sub(new Vector3(v1.x, v1.y, v1.z)).multiplyScalar(factor * 0.5);
      const offset2 = midpoint.clone().sub(new Vector3(v2.x, v2.y, v2.z)).multiplyScalar(factor * 0.5);
      
      v1.setPosition(v1.x + offset1.x, v1.y + offset1.y, v1.z + offset1.z);
      v2.setPosition(v2.x + offset2.x, v2.y + offset2.y, v2.z + offset2.z);
    });
  }

  // Assign material if specified
  if (materialIndex !== undefined) {
    clonedMesh.faces.forEach(face => {
      face.materialIndex = materialIndex;
    });
  }

  return clonedMesh;
}

/**
 * Smooth vertices by averaging with neighbors
 */
export function smoothVertices(
  mesh: EditableMesh,
  options: SmoothingOptions = {}
): EditableMesh {
  const {
    iterations = 1,
    factor = 1.0,
    selectionOnly = false,
    materialIndex
  } = options;

  const clonedMesh = mesh.clone();
  
  // Get vertices to smooth
  const verticesToSmooth = selectionOnly 
    ? (clonedMesh as any).getSelectedVertices?.() || clonedMesh.vertices
    : clonedMesh.vertices;

  for (let iteration = 0; iteration < iterations; iteration++) {
    const newPositions = new Map<Vertex, Vector3>();
    
    verticesToSmooth.forEach((vertex: Vertex) => {
      const connectedVertices = getConnectedVertices(clonedMesh, vertex);
      
      if (connectedVertices.length === 0) {
        newPositions.set(vertex, new Vector3(vertex.x, vertex.y, vertex.z));
        return;
      }
      
      // Calculate average position
      const averagePosition = new Vector3();
      connectedVertices.forEach(connectedVertex => {
        averagePosition.add(new Vector3(connectedVertex.x, connectedVertex.y, connectedVertex.z));
      });
      averagePosition.divideScalar(connectedVertices.length);
      
      // Interpolate towards average
      const newPosition = new Vector3(vertex.x, vertex.y, vertex.z);
      newPosition.lerp(averagePosition, factor);
      
      newPositions.set(vertex, newPosition);
    });
    
    // Apply new positions
    newPositions.forEach((newPosition, vertex) => {
      vertex.setPosition(newPosition.x, newPosition.y, newPosition.z);
    });
  }

  // Assign material if specified
  if (materialIndex !== undefined) {
    clonedMesh.faces.forEach(face => {
      face.materialIndex = materialIndex;
    });
  }

  return clonedMesh;
}

/**
 * Get connected vertices for a given vertex
 */
function getConnectedVertices(mesh: EditableMesh, vertex: Vertex): Vertex[] {
  const connectedVertices: Vertex[] = [];
  const vertexIndex = mesh.vertices.indexOf(vertex);
  
  if (vertexIndex === -1) return connectedVertices;
  
  // Find faces that contain this vertex
  mesh.faces.forEach(face => {
    if (face.vertices.includes(vertexIndex)) {
      // Add all other vertices in this face
      face.vertices.forEach(vIndex => {
        if (vIndex !== vertexIndex) {
          const connectedVertex = mesh.vertices[vIndex];
          if (connectedVertex && !connectedVertices.includes(connectedVertex)) {
            connectedVertices.push(connectedVertex);
          }
        }
      });
    }
  });
  
  return connectedVertices;
}

 