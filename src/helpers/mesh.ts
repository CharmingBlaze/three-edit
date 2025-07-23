/**
 * Mesh utility functions for three-edit
 * Pure functions for mesh-level operations and statistics
 */

import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Edge } from '../core/Edge';
import { Vector3 } from 'three';

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
  const center = new Vector3(
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2
  );
  const size = new Vector3(maxX - minX, maxY - minY, maxZ - minZ);
  
  return { min, max, center, size };
}

/**
 * Center vertices around a point
 */
export function centerVertices(vertices: Vertex[], center: Vector3): void {
  for (const vertex of vertices) {
    vertex.x -= center.x;
    vertex.y -= center.y;
    vertex.z -= center.z;
  }
}

/**
 * Scale vertices by a factor
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
 */
export function rotateVertices(
  vertices: Vertex[],
  axis: Vector3,
  angle: number
): void {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const axisX = axis.x, axisY = axis.y, axisZ = axis.z;
  
  for (const vertex of vertices) {
    const x = vertex.x, y = vertex.y, z = vertex.z;
    
    // Rodrigues' rotation formula
    const dot = x * axisX + y * axisY + z * axisZ;
    const crossX = axisY * z - axisZ * y;
    const crossY = axisZ * x - axisX * z;
    const crossZ = axisX * y - axisY * x;
    
    vertex.x = x * cos + crossX * sin + axisX * dot * (1 - cos);
    vertex.y = y * cos + crossY * sin + axisY * dot * (1 - cos);
    vertex.z = z * cos + crossZ * sin + axisZ * dot * (1 - cos);
  }
}

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
  const orphaned = findOrphanedVertices(vertices, faces);
  const boundingBox = calculateBoundingBox(vertices);
  
  // Count triangles (assuming all faces are triangles)
  const triangleCount = faces.reduce((count, face) => {
    return count + Math.max(0, face.vertices.length - 2);
  }, 0);
  
  return {
    vertexCount: vertices.length,
    faceCount: faces.length,
    edgeCount: edges.length,
    triangleCount,
    materialCount: getUniqueMaterialCount(faces),
    uvCount: getUVCount(vertices),
    normalCount: getNormalCount(vertices),
    orphanedVertices: orphaned.length,
    boundingBox
  };
}

/**
 * Find faces by material index
 */
export function findFacesByMaterial(faces: Face[], materialIndex: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < faces.length; i++) {
    if (faces[i].materialIndex === materialIndex) {
      result.push(i);
    }
  }
  
  return result;
}

/**
 * Get material distribution
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
 * Find vertices within a radius of a point
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
    const dx = vertex.x - center.x;
    const dy = vertex.y - center.y;
    const dz = vertex.z - center.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    
    if (distanceSquared <= radiusSquared) {
      result.push(i);
    }
  }
  
  return result;
}

/**
 * Find faces containing a specific vertex
 */
export function findFacesContainingVertex(faces: Face[], vertexIndex: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < faces.length; i++) {
    if (faces[i].vertices.includes(vertexIndex)) {
      result.push(i);
    }
  }
  
  return result;
}

/**
 * Find edges connected to a vertex
 */
export function findEdgesConnectedToVertex(edges: Edge[], vertexIndex: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < edges.length; i++) {
    if (edges[i].v1 === vertexIndex || edges[i].v2 === vertexIndex) {
      result.push(i);
    }
  }
  
  return result;
}

/**
 * Calculate mesh surface area
 */
export function calculateSurfaceArea(vertices: Vertex[], faces: Face[]): number {
  let totalArea = 0;
  
  for (const face of faces) {
    if (face.vertices.length >= 3) {
      // Calculate area of the first triangle
      const v1 = vertices[face.vertices[0]];
      const v2 = vertices[face.vertices[1]];
      const v3 = vertices[face.vertices[2]];
      
      if (v1 && v2 && v3) {
        const edge1 = new Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
        const edge2 = new Vector3(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
        const cross = new Vector3().crossVectors(edge1, edge2);
        totalArea += cross.length() * 0.5;
      }
      
      // Add area for additional triangles if face has more than 3 vertices
      for (let i = 3; i < face.vertices.length; i++) {
        const v1 = vertices[face.vertices[0]];
        const v2 = vertices[face.vertices[i - 1]];
        const v3 = vertices[face.vertices[i]];
        
        if (v1 && v2 && v3) {
          const edge1 = new Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
          const edge2 = new Vector3(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
          const cross = new Vector3().crossVectors(edge1, edge2);
          totalArea += cross.length() * 0.5;
        }
      }
    }
  }
  
  return totalArea;
}

/**
 * Calculate mesh volume (approximate, assumes closed mesh)
 */
export function calculateVolume(vertices: Vertex[], faces: Face[]): number {
  let totalVolume = 0;
  
  for (const face of faces) {
    if (face.vertices.length >= 3) {
      // Calculate volume contribution of the first triangle
      const v1 = vertices[face.vertices[0]];
      const v2 = vertices[face.vertices[1]];
      const v3 = vertices[face.vertices[2]];
      
      if (v1 && v2 && v3) {
        const volume = (v1.x * v2.y * v3.z + v2.x * v3.y * v1.z + v3.x * v1.y * v2.z -
                       v1.x * v3.y * v2.z - v2.x * v1.y * v3.z - v3.x * v2.y * v1.z) / 6;
        totalVolume += volume;
      }
      
      // Add volume for additional triangles if face has more than 3 vertices
      for (let i = 3; i < face.vertices.length; i++) {
        const v1 = vertices[face.vertices[0]];
        const v2 = vertices[face.vertices[i - 1]];
        const v3 = vertices[face.vertices[i]];
        
        if (v1 && v2 && v3) {
          const volume = (v1.x * v2.y * v3.z + v2.x * v3.y * v1.z + v3.x * v1.y * v2.z -
                         v1.x * v3.y * v2.z - v2.x * v1.y * v3.z - v3.x * v2.y * v1.z) / 6;
          totalVolume += volume;
        }
      }
    }
  }
  
  return Math.abs(totalVolume);
} 