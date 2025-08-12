/**
 * Mesh query functions for three-edit
 * Pure functions for querying mesh properties and statistics
 */

import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Edge } from '../core/Edge';
import { Vector3 } from 'three';

/**
 * Get mesh statistics
 */
export function getMeshStatistics(
  vertices: Vertex[],
  faces: Face[],
  edges: Edge[]
): {
  vertexCount: number;
  faceCount: number;
  edgeCount: number;
  triangleCount: number;
  materialCount: number;
  uvCount: number;
  normalCount: number;
  orphanedVertices: number;
  boundingBox: {
    min: Vector3;
    max: Vector3;
    center: Vector3;
    size: Vector3;
  };
} {
  const orphanedVertices = findOrphanedVertices(vertices, faces);
  const boundingBox = calculateBoundingBox(vertices);
  
  return {
    vertexCount: vertices.length,
    faceCount: faces.length,
    edgeCount: edges.length,
    triangleCount: faces.filter(f => f.vertices.length === 3).length,
    materialCount: getUniqueMaterialCount(faces),
    uvCount: getUVCount(vertices),
    normalCount: getNormalCount(vertices),
    orphanedVertices: orphanedVertices.length,
    boundingBox
  };
}

/**
 * Find orphaned vertices (not used by any face)
 */
export function findOrphanedVertices(vertices: Vertex[], faces: Face[]): number[] {
  const usedVertices = new Set<number>();
  
  // Collect all vertex indices used by faces
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      usedVertices.add(vertexIndex);
    }
  }
  
  // Find vertices not used by any face
  const orphaned: number[] = [];
  for (let i = 0; i < vertices.length; i++) {
    if (!usedVertices.has(i)) {
      orphaned.push(i);
    }
  }
  
  return orphaned;
}

/**
 * Get unique material count
 */
export function getUniqueMaterialCount(faces: Face[]): number {
  const materials = new Set<number>();
  
  for (const face of faces) {
    materials.add(face.materialIndex || 0);
  }
  
  return materials.size;
}

/**
 * Get UV count (vertices with UV coordinates)
 */
export function getUVCount(vertices: Vertex[]): number {
  return vertices.filter(vertex => vertex.uv !== undefined).length;
}

/**
 * Get normal count (vertices with normals)
 */
export function getNormalCount(vertices: Vertex[]): number {
  return vertices.filter(vertex => vertex.normal !== undefined).length;
}

/**
 * Calculate mesh bounding box
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
  
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  
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
  const center = new Vector3().addVectors(min, max).multiplyScalar(0.5);
  const size = new Vector3().subVectors(max, min);
  
  return { min, max, center, size };
}

/**
 * Find faces by material index
 */
export function findFacesByMaterial(faces: Face[], materialIndex: number): number[] {
  const faceIndices: number[] = [];
  
  for (let i = 0; i < faces.length; i++) {
    if (faces[i].materialIndex === materialIndex) {
      faceIndices.push(i);
    }
  }
  
  return faceIndices;
}

/**
 * Get material distribution (count of faces per material)
 */
export function getMaterialDistribution(faces: Face[]): Record<number, number> {
  const distribution: Record<number, number> = {};
  
  for (const face of faces) {
    const materialIndex = face.materialIndex || 0;
    distribution[materialIndex] = (distribution[materialIndex] || 0) + 1;
  }
  
  return distribution;
}

/**
 * Find vertices within a radius of a center point
 */
export function findVerticesInRadius(
  vertices: Vertex[],
  center: Vector3,
  radius: number
): number[] {
  const vertexIndices: number[] = [];
  const radiusSquared = radius * radius;
  
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const distanceSquared = 
      Math.pow(vertex.x - center.x, 2) +
      Math.pow(vertex.y - center.y, 2) +
      Math.pow(vertex.z - center.z, 2);
    
    if (distanceSquared <= radiusSquared) {
      vertexIndices.push(i);
    }
  }
  
  return vertexIndices;
}

/**
 * Find faces that contain a specific vertex
 */
export function findFacesContainingVertex(faces: Face[], vertexIndex: number): number[] {
  const faceIndices: number[] = [];
  
  for (let i = 0; i < faces.length; i++) {
    if (faces[i].vertices.includes(vertexIndex)) {
      faceIndices.push(i);
    }
  }
  
  return faceIndices;
}

/**
 * Find edges connected to a specific vertex
 */
export function findEdgesConnectedToVertex(edges: Edge[], vertexIndex: number): number[] {
  const edgeIndices: number[] = [];
  
  for (let i = 0; i < edges.length; i++) {
    if (edges[i].v1 === vertexIndex || edges[i].v2 === vertexIndex) {
      edgeIndices.push(i);
    }
  }
  
  return edgeIndices;
}

/**
 * Calculate total surface area of the mesh
 */
export function calculateSurfaceArea(vertices: Vertex[], faces: Face[]): number {
  let totalArea = 0;
  
  for (const face of faces) {
    if (face.vertices.length < 3) continue;
    
    // For triangular faces, use cross product
    if (face.vertices.length === 3) {
      const v1 = vertices[face.vertices[0]];
      const v2 = vertices[face.vertices[1]];
      const v3 = vertices[face.vertices[2]];
      
      if (!v1 || !v2 || !v3) continue;
      
      const edge1 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
      const edge2 = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };
      
      // Cross product
      const crossX = edge1.y * edge2.z - edge1.z * edge2.y;
      const crossY = edge1.z * edge2.x - edge1.x * edge2.z;
      const crossZ = edge1.x * edge2.y - edge1.y * edge2.x;
      
      totalArea += Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) * 0.5;
    } else {
      // For non-triangular faces, triangulate and sum areas
      // This is a simplified approach
      const center = calculateFaceCenter(vertices, face);
      
      for (let i = 0; i < face.vertices.length; i++) {
        const v1 = vertices[face.vertices[i]];
        const v2 = vertices[face.vertices[(i + 1) % face.vertices.length]];
        
        if (v1 && v2) {
          const edge1 = { x: v1.x - center.x, y: v1.y - center.y, z: v1.z - center.z };
          const edge2 = { x: v2.x - center.x, y: v2.y - center.y, z: v2.z - center.z };
          
          const crossX = edge1.y * edge2.z - edge1.z * edge2.y;
          const crossY = edge1.z * edge2.x - edge1.x * edge2.z;
          const crossZ = edge1.x * edge2.y - edge1.y * edge2.x;
          
          totalArea += Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ) * 0.5;
        }
      }
    }
  }
  
  return totalArea;
}

/**
 * Calculate volume of the mesh (for closed meshes)
 */
export function calculateVolume(vertices: Vertex[], faces: Face[]): number {
  let totalVolume = 0;
  
  for (const face of faces) {
    if (face.vertices.length < 3) continue;
    
    // For triangular faces, use signed volume
    if (face.vertices.length === 3) {
      const v1 = vertices[face.vertices[0]];
      const v2 = vertices[face.vertices[1]];
      const v3 = vertices[face.vertices[2]];
      
      if (!v1 || !v2 || !v3) continue;
      
      // Signed volume of tetrahedron with origin
      const volume = (
        v1.x * (v2.y * v3.z - v2.z * v3.y) +
        v1.y * (v2.z * v3.x - v2.x * v3.z) +
        v1.z * (v2.x * v3.y - v2.y * v3.x)
      ) / 6.0;
      
      totalVolume += volume;
    }
  }
  
  return Math.abs(totalVolume);
}

/**
 * Calculate the center point of a face
 */
function calculateFaceCenter(vertices: Vertex[], face: Face): { x: number; y: number; z: number } {
  let centerX = 0, centerY = 0, centerZ = 0;
  let validVertices = 0;
  
  for (const vertexIndex of face.vertices) {
    const vertex = vertices[vertexIndex];
    if (vertex) {
      centerX += vertex.x;
      centerY += vertex.y;
      centerZ += vertex.z;
      validVertices++;
    }
  }
  
  if (validVertices === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  
  return {
    x: centerX / validVertices,
    y: centerY / validVertices,
    z: centerZ / validVertices
  };
} 