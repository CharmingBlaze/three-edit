import { Vector3 } from 'three';
import { EditableMesh } from '../../core/index.ts';
import { TaperOptions } from './types';

/**
 * Tapers a mesh along a specified axis
 */
export function taper(
  mesh: EditableMesh,
  options: TaperOptions = {}
): EditableMesh {
  const factor = options.factor ?? 0.5;
  const axis = options.axis ?? new Vector3(0, 1, 0);
  const center = options.center ?? new Vector3(0, 0, 0);
  const startPoint = options.startPoint ?? new Vector3(0, -1, 0);
  const endPoint = options.endPoint ?? new Vector3(0, 1, 0);
  const uniform = options.uniform ?? true;

  // Normalize axis
  axis.normalize();

  // Calculate taper region
  const taperLength = endPoint.distanceTo(startPoint);
  const taperDirection = new Vector3().subVectors(endPoint, startPoint).normalize();

  // Create transformation matrix for each vertex
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate position relative to taper region
    const relativePos = new Vector3(vertex.x, vertex.y, vertex.z).sub(startPoint);
    const projection = relativePos.dot(taperDirection);
    
    // Only taper vertices within the taper region
    if (projection >= 0 && projection <= taperLength) {
      // Calculate taper factor (0 at start, 1 at end)
      const taperFactor = projection / taperLength;
      
      // Calculate scale factor
      const scaleFactor = 1 - (factor * taperFactor);
      
      if (uniform) {
        // Uniform taper (scale all axes equally)
        const scale = new Vector3(scaleFactor, scaleFactor, scaleFactor);
        
        // Apply scaling around center
        const transformedPos = new Vector3(vertex.x, vertex.y, vertex.z);
        transformedPos.sub(center);
        transformedPos.multiply(scale);
        transformedPos.add(center);
        
        // Update vertex position
        vertex.x = transformedPos.x;
        vertex.y = transformedPos.y;
        vertex.z = transformedPos.z;
      } else {
        // Non-uniform taper (scale perpendicular to axis)
        const perpendicularScale = new Vector3(scaleFactor, scaleFactor, scaleFactor);
        
        // Don't scale along the axis direction
        const axisScale = 1.0;
        if (Math.abs(axis.x) > 0.5) {
          perpendicularScale.x = axisScale;
        } else if (Math.abs(axis.y) > 0.5) {
          perpendicularScale.y = axisScale;
        } else if (Math.abs(axis.z) > 0.5) {
          perpendicularScale.z = axisScale;
        }
        
        // Apply scaling around center
        const transformedPos = new Vector3(vertex.x, vertex.y, vertex.z);
        transformedPos.sub(center);
        transformedPos.multiply(perpendicularScale);
        transformedPos.add(center);
        
        // Update vertex position
        vertex.x = transformedPos.x;
        vertex.y = transformedPos.y;
        vertex.z = transformedPos.z;
      }
    }
  }

  return mesh;
}

/**
 * Advanced taper operation with custom taper profile function
 */
export function taperAdvanced(
  mesh: EditableMesh,
  taperProfile: (position: Vector3) => Vector3,
  options: TaperOptions = {}
): EditableMesh {
  const _axis = options.axis ?? new Vector3(0, 1, 0);
  const center = options.center ?? new Vector3(0, 0, 0);

  // Normalize axis
  _axis.normalize();

  // Apply taper to each vertex
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate taper profile for this vertex position
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    const scaleFactors = taperProfile(position);
    
    // Apply scaling around center
    const transformedPos = new Vector3(vertex.x, vertex.y, vertex.z);
    transformedPos.sub(center);
    transformedPos.multiply(scaleFactors);
    transformedPos.add(center);
    
    // Update vertex position
    vertex.x = transformedPos.x;
    vertex.y = transformedPos.y;
    vertex.z = transformedPos.z;
  }

  return mesh;
}

/**
 * Calculate taper profile based on distance from axis
 */
export function calculateTaperProfile(
  vertex: any,
  axis: Vector3,
  startPoint: Vector3,
  endPoint: Vector3,
  factor: number
): Vector3 {
  // Calculate distance from vertex to axis
  const vertexPos = new Vector3(vertex.x, vertex.y, vertex.z);
  const axisPoint = new Vector3().copy(startPoint);
  
  // Project vertex onto axis
  const axisDirection = new Vector3().subVectors(endPoint, startPoint).normalize();
  const projection = vertexPos.clone().sub(axisPoint).dot(axisDirection);
  
  // Calculate taper factor based on distance from axis
  const distanceFromAxis = vertexPos.distanceTo(axisPoint.add(axisDirection.multiplyScalar(projection)));
  const taperFactor = Math.min(1, distanceFromAxis / 2); // Normalize to 0-1 range
  
  // Calculate scale factors
  const scaleFactor = 1 - (factor * taperFactor);
  
  return new Vector3(scaleFactor, scaleFactor, scaleFactor);
} 