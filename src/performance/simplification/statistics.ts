import { Vector3 } from 'three';
import { EditableMesh } from '../../core/index';
import { SimplificationStatistics } from './types';

/**
 * Calculate mesh statistics for simplification analysis
 */
export function calculateSimplificationStatistics(mesh: EditableMesh): SimplificationStatistics {
  const vertexCount = mesh.vertices.length;
  const faceCount = mesh.faces.length;
  const edgeCount = calculateEdgeCount(mesh);
  const averageEdgeLength = calculateAverageEdgeLength(mesh);
  const averageFaceArea = calculateAverageFaceArea(mesh);
  
  return {
    vertexCount,
    faceCount,
    edgeCount,
    averageEdgeLength,
    averageFaceArea
  };
}

/**
 * Calculate total number of edges in mesh
 */
export function calculateEdgeCount(mesh: EditableMesh): number {
  const edges = new Set<string>();
  
  mesh.faces.forEach(face => {
    for (let i = 0; i < face.vertices.length; i++) {
      const v1 = face.vertices[i];
      const v2 = face.vertices[(i + 1) % face.vertices.length];
      
      const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      edges.add(edgeKey);
    }
  });
  
  return edges.size;
}

/**
 * Calculate average edge length
 */
export function calculateAverageEdgeLength(mesh: EditableMesh): number {
  const edges = new Set<string>();
  let totalLength = 0;
  let edgeCount = 0;
  
  mesh.faces.forEach(face => {
    for (let i = 0; i < face.vertices.length; i++) {
      const v1Index = face.vertices[i];
      const v2Index = face.vertices[(i + 1) % face.vertices.length];
      
      const edgeKey = v1Index < v2Index ? `${v1Index}-${v2Index}` : `${v2Index}-${v1Index}`;
      
      if (!edges.has(edgeKey)) {
        edges.add(edgeKey);
        
        const v1 = mesh.vertices[v1Index];
        const v2 = mesh.vertices[v2Index];
        
        if (v1 && v2) {
          const length = new Vector3(v1.x, v1.y, v1.z).distanceTo(new Vector3(v2.x, v2.y, v2.z));
          totalLength += length;
          edgeCount++;
        }
      }
    }
  });
  
  return edgeCount > 0 ? totalLength / edgeCount : 0;
}

/**
 * Calculate average face area
 */
export function calculateAverageFaceArea(mesh: EditableMesh): number {
  let totalArea = 0;
  let faceCount = 0;
  
  mesh.faces.forEach(face => {
    const area = calculateFaceArea(mesh, face);
    totalArea += area;
    faceCount++;
  });
  
  return faceCount > 0 ? totalArea / faceCount : 0;
}

/**
 * Calculate face area
 */
export function calculateFaceArea(mesh: EditableMesh, face: any): number {
  if (face.vertices.length < 3) return 0;
  
  const vertices = face.vertices.map((index: number) => mesh.vertices[index]).filter(Boolean);
  if (vertices.length < 3) return 0;
  
  // Calculate area using cross product
  const v0 = vertices[0];
  const v1 = vertices[1];
  const v2 = vertices[2];
  
  const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
  const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
  
  const cross = new Vector3();
  cross.crossVectors(edge1, edge2);
  
  return cross.length() * 0.5;
}

/**
 * Calculate reduction ratio
 */
export function calculateReductionRatio(
  originalCount: number,
  finalCount: number
): number {
  if (originalCount === 0) return 0;
  return (originalCount - finalCount) / originalCount;
} 