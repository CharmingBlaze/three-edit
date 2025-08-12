/**
 * Core Geometry Operations
 * Pure functions for fundamental geometry operations like extrusion, subdivision, and transformation
 */

import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { EditableMesh } from '../core/EditableMesh';
import { Matrix4, Vector3 } from 'three';
import { 
  distance3D, 
  addVectors, 
  multiplyVectorByScalar,
  centroid,
  calculateTriangleArea,
  calculateTriangleNormal
} from '../math';

/**
 * Geometry operation result with success status
 */
export interface GeometryOperationResult {
  success: boolean;
  newVertices?: Vertex[];
  newFaces?: Face[];
  error?: string;
}

/**
 * Subdivide a face into smaller faces
 * @param vertices Array of all vertices in the mesh
 * @param face Face to subdivide
 * @param addCenterVertex Whether to add a center vertex (default: true)
 * @returns New vertices and faces from subdivision
 */
export function subdivideFace(
  vertices: Vertex[],
  face: Face,
  addCenterVertex: boolean = true
): GeometryOperationResult {
  try {
    const newVertices: Vertex[] = [];
    const newFaces: Face[] = [];
    
    const faceVertices = face.vertices.map(index => vertices[index]).filter(Boolean);
    
    if (faceVertices.length < 3) {
      return {
        success: false,
        error: 'Face must have at least 3 vertices'
      };
    }
    
    let centerVertex: Vertex | null = null;
    let centerIndex = -1;
    
    if (addCenterVertex) {
      // Calculate face center
      const center = centroid(faceVertices.map(v => new Vector3(v.x, v.y, v.z)));
      
      // Create center vertex
      centerVertex = new Vertex(center.x, center.y, center.z);
      centerVertex.uv = { u: 0.5, v: 0.5 }; // Default UV for center
      centerVertex.normal = calculateTriangleNormal(
        new Vector3(faceVertices[0].x, faceVertices[0].y, faceVertices[0].z),
        new Vector3(faceVertices[1].x, faceVertices[1].y, faceVertices[1].z),
        new Vector3(faceVertices[2].x, faceVertices[2].y, faceVertices[2].z)
      );
      
      newVertices.push(centerVertex);
      centerIndex = 0;
    }
    
    // Create new faces
    for (let i = 0; i < faceVertices.length; i++) {
      const currentIndex = face.vertices[i];
      const nextIndex = face.vertices[(i + 1) % faceVertices.length];
      
      if (addCenterVertex && centerVertex) {
        // Create triangle from current edge to center
        const triangle = new Face(
          [currentIndex, nextIndex, centerIndex],
          [], // Edges will be updated by the mesh
          {
            materialIndex: face.materialIndex,
            normal: face.normal?.clone(),
            userData: { ...face.userData }
          }
        );
        newFaces.push(triangle);
      } else {
        // Create smaller face without center vertex
        // This would require more complex subdivision logic
        // For now, just return the original face
        newFaces.push(face.clone());
      }
    }
    
    return {
      success: true,
      newVertices,
      newFaces
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during face subdivision'
    };
  }
}

/**
 * Extrude a face along a direction
 * @param vertices Array of all vertices in the mesh
 * @param face Face to extrude
 * @param direction Extrusion direction (should be normalized)
 * @param distance Extrusion distance
 * @returns New vertices and faces from extrusion
 */
export function extrudeFace(
  vertices: Vertex[],
  face: Face,
  direction: Vector3,
  distance: number
): GeometryOperationResult {
  try {
    const newVertices: Vertex[] = [];
    const newFaces: Face[] = [];
    
    const faceVertices = face.vertices.map(index => vertices[index]).filter(Boolean);
    
    if (faceVertices.length < 3) {
      return {
        success: false,
        error: 'Face must have at least 3 vertices'
      };
    }
    
    // Create extruded vertices
    const extrudedIndices: number[] = [];
    const originalIndices = face.vertices;
    
    for (let i = 0; i < faceVertices.length; i++) {
      const originalVertex = faceVertices[i];
      const originalIndex = originalIndices[i];
      
      // Create extruded vertex
      const extrudedPosition = addVectors(
        new Vector3(originalVertex.x, originalVertex.y, originalVertex.z),
        multiplyVectorByScalar(direction, distance)
      );
      
      const extrudedVertex = new Vertex(
        extrudedPosition.x,
        extrudedPosition.y,
        extrudedPosition.z
      );
      
      // Copy properties from original vertex
      if (originalVertex.uv) {
        extrudedVertex.uv = { ...originalVertex.uv };
      }
      if (originalVertex.normal) {
        extrudedVertex.normal = originalVertex.normal.clone();
      }
      if (originalVertex.color) {
        extrudedVertex.color = originalVertex.color.clone();
      }
      extrudedVertex.userData = { ...originalVertex.userData };
      
      newVertices.push(extrudedVertex);
      extrudedIndices.push(originalIndices.length + i);
    }
    
    // Create side faces (quads)
    for (let i = 0; i < faceVertices.length; i++) {
      const nextI = (i + 1) % faceVertices.length;
      
      const v1 = originalIndices[i];
      const v2 = originalIndices[nextI];
      const v3 = extrudedIndices[nextI];
      const v4 = extrudedIndices[i];
      
      // Create quad face
      const quadFace = new Face(
        [v1, v2, v3, v4],
        [], // Edges will be updated by the mesh
        {
          materialIndex: face.materialIndex,
          normal: face.normal?.clone(),
          userData: { ...face.userData }
        }
      );
      
      newFaces.push(quadFace);
    }
    
    // Create extruded face (reversed winding)
    const extrudedFace = new Face(
      [...extrudedIndices].reverse(),
      [], // Edges will be updated by the mesh
      {
        materialIndex: face.materialIndex,
        normal: face.normal?.clone(),
        userData: { ...face.userData }
      }
    );
    
    newFaces.push(extrudedFace);
    
    return {
      success: true,
      newVertices,
      newFaces
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during face extrusion'
    };
  }
}

/**
 * Compute centroid of a face
 * @param face Face to compute centroid for
 * @param vertices Array of all vertices in the mesh
 * @returns Centroid point
 */
export function computeCentroid(face: Face, vertices: Vertex[]): Vector3 {
  const faceVertices = face.vertices.map(index => vertices[index]).filter(Boolean);
  
  if (faceVertices.length === 0) {
    return new Vector3(0, 0, 0);
  }
  
  return centroid(faceVertices.map(v => new Vector3(v.x, v.y, v.z)));
}

/**
 * Calculate bounding box of vertices
 * @param vertices Array of vertices
 * @returns Bounding box information
 */
export function calculateBoundingBox(vertices: Vertex[]): {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  size: Vector3;
} {
  if (vertices.length === 0) {
    return {
      min: new Vector3(0, 0, 0),
      max: new Vector3(0, 0, 0),
      center: new Vector3(0, 0, 0),
      size: new Vector3(0, 0, 0)
    };
  }
  
  let minX = vertices[0].x;
  let minY = vertices[0].y;
  let minZ = vertices[0].z;
  let maxX = vertices[0].x;
  let maxY = vertices[0].y;
  let maxZ = vertices[0].z;
  
  for (const vertex of vertices) {
    minX = Math.min(minX, vertex.x);
    minY = Math.min(minY, vertex.y);
    minZ = Math.min(minZ, vertex.z);
    maxX = Math.max(maxX, vertex.x);
    maxY = Math.max(maxY, vertex.y);
    maxZ = Math.max(maxZ, vertex.z);
  }
  
  const min = new Vector3(minX, minY, minZ);
  const max = new Vector3(maxX, maxY, maxZ);
  const center = new Vector3(
    (minX + maxX) * 0.5,
    (minY + maxY) * 0.5,
    (minZ + maxZ) * 0.5
  );
  const size = new Vector3(maxX - minX, maxY - minY, maxZ - minZ);
  
  return { min, max, center, size };
}

/**
 * Center vertices around a specific point
 * @param vertices Array of vertices to center
 * @param center Center point
 */
export function centerVertices(vertices: Vertex[], center: Vector3): void {
  for (const vertex of vertices) {
    vertex.x -= center.x;
    vertex.y -= center.y;
    vertex.z -= center.z;
  }
}

/**
 * Scale vertices by a scale factor
 * @param vertices Array of vertices to scale
 * @param scale Scale vector
 */
export function scaleVertices(vertices: Vertex[], scale: Vector3): void {
  for (const vertex of vertices) {
    vertex.x *= scale.x;
    vertex.y *= scale.y;
    vertex.z *= scale.z;
  }
}

/**
 * Rotate vertices around an axis
 * @param vertices Array of vertices to rotate
 * @param axis Rotation axis (should be normalized)
 * @param angle Rotation angle in radians
 */
export function rotateVertices(
  vertices: Vertex[],
  axis: Vector3,
  angle: number
): void {
  // This is a simplified rotation - in a real implementation you'd use quaternions
  // or rotation matrices for more accurate results
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  for (const vertex of vertices) {
    const pos = new Vector3(vertex.x, vertex.y, vertex.z);
    
    // Rodrigues' rotation formula
    const rotated = addVectors(
      multiplyVectorByScalar(pos, cos),
      addVectors(
        multiplyVectorByScalar(axis.clone().cross(pos), sin),
        multiplyVectorByScalar(axis, axis.dot(pos) * (1 - cos))
      )
    );
    
    vertex.x = rotated.x;
    vertex.y = rotated.y;
    vertex.z = rotated.z;
  }
}

/**
 * Transform vertices using a transformation matrix
 * @param mesh Mesh containing vertices to transform
 * @param matrix Transformation matrix
 */
export function transformVertices(mesh: EditableMesh, matrix: Matrix4): void {
  for (const vertex of mesh.vertices) {
    const pos = new Vector3(vertex.x, vertex.y, vertex.z);
    pos.applyMatrix4(matrix);
    
    vertex.x = pos.x;
    vertex.y = pos.y;
    vertex.z = pos.z;
  }
}

/**
 * Create a vertex grid for procedural geometry
 * @param width Number of vertices in X direction
 * @param height Number of vertices in Y direction
 * @param generator Function to generate vertex positions
 * @returns 2D array of vertices
 */
export function createVertexGrid(
  width: number,
  height: number,
  generator: (x: number, y: number) => { x: number; y: number; z: number }
): Vertex[][] {
  const grid: Vertex[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Vertex[] = [];
    for (let x = 0; x < width; x++) {
      const pos = generator(x, y);
      const vertex = new Vertex(pos.x, pos.y, pos.z);
      
      // Generate UV coordinates
      vertex.uv = {
        u: x / (width - 1),
        v: y / (height - 1)
      };
      
      row.push(vertex);
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Create faces from a vertex grid
 * @param grid 2D array of vertices
 * @param materialIndex Material index for faces
 * @returns Array of faces
 */
export function createFacesFromGrid(
  grid: Vertex[][],
  materialIndex: number = 0
): Face[] {
  const faces: Face[] = [];
  
  for (let y = 0; y < grid.length - 1; y++) {
    for (let x = 0; x < grid[y].length - 1; x++) {
      // Create quad from four vertices
      const v00 = grid[y][x];
      const v10 = grid[y][x + 1];
      const v11 = grid[y + 1][x + 1];
      const v01 = grid[y + 1][x];
      
      // Create two triangles to form a quad
      const triangle1 = new Face(
        [0, 1, 2], // Will be updated with actual indices
        [],
        { materialIndex }
      );
      
      const triangle2 = new Face(
        [0, 2, 3], // Will be updated with actual indices
        [],
        { materialIndex }
      );
      
      faces.push(triangle1, triangle2);
    }
  }
  
  return faces;
}

/**
 * Find vertices within a radius of a point
 * @param vertices Array of vertices to search
 * @param center Center point
 * @param radius Search radius
 * @returns Array of vertex indices within radius
 */
export function findVerticesInRadius(
  vertices: Vertex[],
  center: Vector3,
  radius: number
): number[] {
  const result: number[] = [];
  const radiusSquared = radius * radius;
  
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const distance = distance3D(
      new Vector3(vertex.x, vertex.y, vertex.z),
      center
    );
    
    if (distance <= radius) {
      result.push(i);
    }
  }
  
  return result;
} 