import { Vector3, Matrix4 } from 'three';
import { EditableMesh } from '../../core/index.ts';
import { TwistOptions } from './types';

/**
 * Twists a mesh around a specified axis
 */
export function twist(
  mesh: EditableMesh,
  options: TwistOptions = {}
): EditableMesh {
  const angle = options.angle ?? Math.PI / 2; // 90 degrees default
  const axis = options.axis ?? new Vector3(0, 1, 0);
  const center = options.center ?? new Vector3(0, 0, 0);
  const startPoint = options.startPoint ?? new Vector3(0, -1, 0);
  const endPoint = options.endPoint ?? new Vector3(0, 1, 0);

  // Normalize axis
  axis.normalize();

  // Calculate twist region
  const twistLength = endPoint.distanceTo(startPoint);
  const twistDirection = new Vector3().subVectors(endPoint, startPoint).normalize();

  // Create transformation matrix for each vertex
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate position relative to twist region
    const relativePos = new Vector3(vertex.x, vertex.y, vertex.z).sub(startPoint);
    const projection = relativePos.dot(twistDirection);
    
    // Only twist vertices within the twist region
    if (projection >= 0 && projection <= twistLength) {
      // Calculate twist factor (0 at start, 1 at end)
      const twistFactor = projection / twistLength;
      
      // Calculate twist angle for this vertex
      const vertexAngle = angle * twistFactor;
      
      // Create rotation matrix around the axis
      const rotationMatrix = new Matrix4();
      rotationMatrix.makeRotationAxis(axis, vertexAngle);
      
      // Apply rotation around center
      const transformedPos = new Vector3(vertex.x, vertex.y, vertex.z);
      transformedPos.sub(center);
      transformedPos.applyMatrix4(rotationMatrix);
      transformedPos.add(center);
      
      // Update vertex position
      vertex.x = transformedPos.x;
      vertex.y = transformedPos.y;
      vertex.z = transformedPos.z;
    }
  }

  return mesh;
}

/**
 * Advanced twist operation with custom twist rate function
 */
export function twistAdvanced(
  mesh: EditableMesh,
  twistProfile: (position: Vector3) => number,
  options: TwistOptions = {}
): EditableMesh {
  const _axis = options.axis ?? new Vector3(0, 1, 0);
  const center = options.center ?? new Vector3(0, 0, 0);
  const angle = options.angle ?? Math.PI / 2;

  // Normalize axis
  _axis.normalize();

  // Apply twist to each vertex
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate twist rate for this vertex position
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    const twistFactor = twistProfile(position);
    
    if (twistFactor > 0) {
      // Calculate twist angle for this vertex
      const vertexAngle = angle * twistFactor;
      
      // Create rotation matrix around the axis
      const rotationMatrix = new Matrix4();
      rotationMatrix.makeRotationAxis(_axis, vertexAngle);
      
      // Apply rotation around center
      const transformedPos = new Vector3(vertex.x, vertex.y, vertex.z);
      transformedPos.sub(center);
      transformedPos.applyMatrix4(rotationMatrix);
      transformedPos.add(center);
      
      // Update vertex position
      vertex.x = transformedPos.x;
      vertex.y = transformedPos.y;
      vertex.z = transformedPos.z;
    }
  }

  return mesh;
}

/**
 * Calculate twist factor based on distance from axis
 */
export function calculateTwistFactor(
  vertex: any,
  _axis: Vector3,
  startPoint: Vector3,
  endPoint: Vector3
): number {
  // Calculate distance from vertex to axis
  const vertexPos = new Vector3(vertex.x, vertex.y, vertex.z);
  const axisPoint = new Vector3().copy(startPoint);
  
  // Project vertex onto axis
  const axisDirection = new Vector3().subVectors(endPoint, startPoint).normalize();
  const projection = vertexPos.clone().sub(axisPoint).dot(axisDirection);
  
  // Calculate twist factor based on distance from axis
  const distanceFromAxis = vertexPos.distanceTo(axisPoint.add(axisDirection.multiplyScalar(projection)));
  
  return Math.min(1, distanceFromAxis / 2); // Normalize to 0-1 range
} 