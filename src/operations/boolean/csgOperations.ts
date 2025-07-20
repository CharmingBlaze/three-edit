import { EditableMesh } from '../../core/EditableMesh.ts';
import { Face } from '../../core/Face.ts';
import { Vertex } from '../../core/Vertex.ts';
import { CSGOptions } from './types';

/**
 * Performs CSG (Constructive Solid Geometry) operations between two meshes
 * @param meshA The first mesh
 * @param meshB The second mesh
 * @param operation The CSG operation to perform
 * @param options Options for the CSG operation
 * @returns The result mesh
 */
export function performCSG(
  meshA: EditableMesh,
  meshB: EditableMesh,
  operation: 'union' | 'intersection' | 'difference',
  options: CSGOptions = {}
): EditableMesh {
  const tolerance = options.tolerance ?? 0.001;

  // Create a copy of meshA as the result
  const resultMesh = meshA.clone();

  // Perform the CSG operation
  switch (operation) {
    case 'union':
      return performUnion(resultMesh, meshB, tolerance);
    
    case 'intersection':
      return performIntersection(resultMesh, meshB, tolerance);
    
    case 'difference':
      return performDifference(resultMesh, meshB, tolerance);
    
    default:
      throw new Error(`Unknown CSG operation: ${operation}`);
  }
}

/**
 * Performs union operation
 */
function performUnion(
  meshA: EditableMesh,
  meshB: EditableMesh,
  _tolerance: number
): EditableMesh {
  // Add all faces from meshB to meshA
  for (let i = 0; i < meshB.getFaceCount(); i++) {
    const face = meshB.getFace(i);
    if (face) {
      // Create new face with same vertices
      const newFace = new Face(face.vertices, face.edges, {
        materialIndex: face.materialIndex ?? 0
      });
      meshA.addFace(newFace);
    }
  }

  return meshA;
}

/**
 * Performs intersection operation
 */
function performIntersection(
  meshA: EditableMesh,
  meshB: EditableMesh,
  tolerance: number
): EditableMesh {
  // For intersection, we need to find faces that are inside both meshes
  // This is a simplified implementation
  const intersectionFaces: Face[] = [];

  // Check each face of meshA against meshB
  for (let i = 0; i < meshA.getFaceCount(); i++) {
    const face = meshA.getFace(i);
    if (!face) continue;

    // Check if face center is inside meshB
    const faceCenter = calculateFaceCenter(meshA, face);
    if (isPointInsideMesh(faceCenter, meshB, tolerance)) {
      intersectionFaces.push(face);
    }
  }

  // Create new mesh with intersection faces
  const resultMesh = new EditableMesh();
  
  // Add vertices and faces
  for (const face of intersectionFaces) {
    // Add vertices for this face
    const vertexIndices: number[] = [];
    for (const vertexIndex of face.vertices) {
      const vertex = meshA.getVertex(vertexIndex);
      if (vertex) {
        const newVertex = new Vertex(vertex.x, vertex.y, vertex.z, { uv: vertex.uv });
        vertexIndices.push(resultMesh.addVertex(newVertex));
      }
    }

    // Create new face
    const newFace = new Face(vertexIndices, [], {
      materialIndex: face.materialIndex ?? 0
    });
    resultMesh.addFace(newFace);
  }

  return resultMesh;
}

/**
 * Performs difference operation
 */
function performDifference(
  meshA: EditableMesh,
  meshB: EditableMesh,
  tolerance: number
): EditableMesh {
  // For difference, we need to remove faces that are inside meshB
  const remainingFaces: Face[] = [];

  // Check each face of meshA against meshB
  for (let i = 0; i < meshA.getFaceCount(); i++) {
    const face = meshA.getFace(i);
    if (!face) continue;

    // Check if face center is outside meshB
    const faceCenter = calculateFaceCenter(meshA, face);
    if (!isPointInsideMesh(faceCenter, meshB, tolerance)) {
      remainingFaces.push(face);
    }
  }

  // Create new mesh with remaining faces
  const resultMesh = new EditableMesh();
  
  // Add vertices and faces
  for (const face of remainingFaces) {
    // Add vertices for this face
    const vertexIndices: number[] = [];
    for (const vertexIndex of face.vertices) {
      const vertex = meshA.getVertex(vertexIndex);
      if (vertex) {
        const newVertex = new Vertex(vertex.x, vertex.y, vertex.z, { uv: vertex.uv });
        vertexIndices.push(resultMesh.addVertex(newVertex));
      }
    }

    // Create new face
    const newFace = new Face(vertexIndices, [], {
      materialIndex: face.materialIndex ?? 0
    });
    resultMesh.addFace(newFace);
  }

  return resultMesh;
}

/**
 * Calculate face center
 */
interface Point { x: number; y: number; z: number; }

function calculateFaceCenter(mesh: EditableMesh, face: Face): Point {
  const center = { x: 0, y: 0, z: 0 };
  let count = 0;

  for (const vertexIndex of face.vertices) {
    const vertex = mesh.getVertex(vertexIndex);
    if (vertex) {
      center.x += vertex.x;
      center.y += vertex.y;
      center.z += vertex.z;
      count++;
    }
  }

  if (count > 0) {
    center.x /= count;
    center.y /= count;
    center.z /= count;
  }

  return center;
}

/**
 * Check if point is inside mesh using ray casting
 */
function isPointInsideMesh(point: Point, mesh: EditableMesh, tolerance: number): boolean {
  // Use ray casting to determine if point is inside mesh
  const rayDirection = { x: 1, y: 0, z: 0 }; // Cast ray in +X direction
  let intersectionCount = 0;

  // Check each face of the mesh
  for (let i = 0; i < mesh.getFaceCount(); i++) {
    const face = mesh.getFace(i);
    if (!face) continue;

    // Check if ray intersects with this face
    if (rayIntersectsFace(point, rayDirection, mesh, face, tolerance)) {
      intersectionCount++;
    }
  }

  // Odd number of intersections means point is inside
  return (intersectionCount % 2) === 1;
}

/**
 * Check if ray intersects with a face
 */
function rayIntersectsFace(
  rayOrigin: Point,
  rayDirection: Point,
  mesh: EditableMesh,
  face: Face,
  tolerance: number
): boolean {
  // Get face vertices
  const vertices: Point[] = [];
  for (const vertexIndex of face.vertices) {
    const vertex = mesh.getVertex(vertexIndex);
    if (vertex) {
      vertices.push({ x: vertex.x, y: vertex.y, z: vertex.z });
    }
  }

  if (vertices.length < 3) return false;

  // Check intersection with each triangle of the face
  for (let i = 1; i < vertices.length - 1; i++) {
    const triangle = [
      vertices[0],
      vertices[i],
      vertices[i + 1]
    ];

    if (rayIntersectsTriangle(rayOrigin, rayDirection, triangle, tolerance)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if ray intersects with a triangle
 */
function rayIntersectsTriangle(
  rayOrigin: Point,
  rayDirection: Point,
  triangle: Point[],
  tolerance: number
): boolean {
  if (triangle.length !== 3) return false;

  const [v0, v1, v2] = triangle;

  // Calculate triangle edges
  const edge1 = {
    x: v1.x - v0.x,
    y: v1.y - v0.y,
    z: v1.z - v0.z
  };
  const edge2 = {
    x: v2.x - v0.x,
    y: v2.y - v0.y,
    z: v2.z - v0.z
  };

  // Calculate determinant
  const h = {
    x: rayDirection.y * edge2.z - rayDirection.z * edge2.y,
    y: rayDirection.z * edge2.x - rayDirection.x * edge2.z,
    z: rayDirection.x * edge2.y - rayDirection.y * edge2.x
  };

  const a = edge1.x * h.x + edge1.y * h.y + edge1.z * h.z;

  if (Math.abs(a) < tolerance) return false; // Ray is parallel to triangle

  const f = 1.0 / a;
  const s = {
    x: rayOrigin.x - v0.x,
    y: rayOrigin.y - v0.y,
    z: rayOrigin.z - v0.z
  };

  const u = f * (s.x * h.x + s.y * h.y + s.z * h.z);

  if (u < 0.0 || u > 1.0) return false;

  const q = {
    x: s.y * edge1.z - s.z * edge1.y,
    y: s.z * edge1.x - s.x * edge1.z,
    z: s.x * edge1.y - s.y * edge1.x
  };

  const v = f * (rayDirection.x * q.x + rayDirection.y * q.y + rayDirection.z * q.z);

  if (v < 0.0 || u + v > 1.0) return false;

  const t = f * (edge2.x * q.x + edge2.y * q.y + edge2.z * q.z);

  return t > tolerance; // Intersection point is in front of ray origin
} 