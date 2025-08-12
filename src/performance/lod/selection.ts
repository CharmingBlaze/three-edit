import { Vector3 } from 'three';
import { EditableMesh } from '../../core/index';
import { LODLevel, LODSelectionOptions } from './types';

/**
 * Select appropriate LOD level based on distance and quality preferences
 */
export function selectLODLevel(
  levels: LODLevel[],
  options: LODSelectionOptions = {}
): LODLevel {
  const {
    cameraPosition = new Vector3(0, 0, 0),
    meshPosition = new Vector3(0, 0, 0),
    maxDistance = 1000,
    qualityPreference = 'balanced'
  } = options;

  // Calculate distance from camera to mesh
  const distance = cameraPosition.distanceTo(meshPosition);
  
  // If distance exceeds max, use lowest quality level
  if (distance > maxDistance) {
    return levels[levels.length - 1];
  }

  // Find appropriate level based on distance
  let selectedLevel = levels[0]; // Default to highest quality
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (distance >= levels[i].distance) {
      selectedLevel = levels[i];
      break;
    }
  }

  // Adjust based on quality preference
  switch (qualityPreference) {
    case 'performance':
      // Use lower quality level
      const performanceIndex = Math.min(
        selectedLevel.level + 1,
        levels.length - 1
      );
      return levels[performanceIndex];
    
    case 'quality':
      // Use higher quality level
      const qualityIndex = Math.max(selectedLevel.level - 1, 0);
      return levels[qualityIndex];
    
    case 'balanced':
    default:
      return selectedLevel;
  }
}

/**
 * Calculate optimal distance for LOD level
 */
export function calculateOptimalDistance(level: number): number {
  // Exponential distance increase for each level
  return Math.pow(2, level) * 10;
}

/**
 * Calculate error metric between original and simplified mesh
 */
export function calculateErrorMetric(
  original: EditableMesh,
  simplified: EditableMesh
): number {
  let totalError = 0;
  let vertexCount = 0;
  
  // Calculate error based on vertex displacement
  simplified.vertices.forEach((vertex, index) => {
    if (index < original.vertices.length) {
      const originalVertex = original.vertices[index];
      const displacement = new Vector3(
        vertex.x - originalVertex.x,
        vertex.y - originalVertex.y,
        vertex.z - originalVertex.z
      );
      totalError += displacement.length();
      vertexCount++;
    }
  });
  
  return vertexCount > 0 ? totalError / vertexCount : 0;
}

/**
 * Find closest point on mesh to given vertex
 */
export function findClosestPoint(mesh: EditableMesh, vertex: any): Vector3 {
  let closestPoint = new Vector3();
  let minDistance = Infinity;
  
  mesh.faces.forEach(face => {
    const faceCenter = calculateFaceCenter(mesh, face);
    const distance = new Vector3(vertex.x, vertex.y, vertex.z).distanceTo(faceCenter);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint.copy(faceCenter);
    }
  });
  
  return closestPoint;
}

/**
 * Calculate face center
 */
export function calculateFaceCenter(mesh: EditableMesh, face: any): Vector3 {
  const center = new Vector3();
  let vertexCount = 0;
  
  face.vertices.forEach((vertexIndex: number) => {
    const vertex = mesh.vertices[vertexIndex];
    if (vertex) {
      center.add(new Vector3(vertex.x, vertex.y, vertex.z));
      vertexCount++;
    }
  });
  
  return vertexCount > 0 ? center.divideScalar(vertexCount) : center;
} 