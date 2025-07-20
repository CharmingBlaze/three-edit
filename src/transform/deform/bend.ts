import { Vector3, Matrix4 } from 'three';
import { EditableMesh } from '../../core/index.ts';
import { BendOptions } from './types';

/**
 * Bends a mesh along a specified axis and angle
 */
export function bend(
  mesh: EditableMesh,
  options: BendOptions = {}
): EditableMesh {
  const angle = options.angle ?? Math.PI / 4; // 45 degrees default
  const axis = options.axis ?? new Vector3(0, 1, 0);
  const center = options.center ?? new Vector3(0, 0, 0);
  const direction = options.direction ?? new Vector3(1, 0, 0);
  const startPoint = options.startPoint ?? new Vector3(-1, 0, 0);
  const endPoint = options.endPoint ?? new Vector3(1, 0, 0);

  // Normalize vectors
  axis.normalize();
  direction.normalize();

  // Calculate bend region
  const bendLength = endPoint.distanceTo(startPoint);
  const bendDirection = new Vector3().subVectors(endPoint, startPoint).normalize();

  // Create transformation matrix for each vertex
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate position relative to bend region
    const relativePos = new Vector3(vertex.x, vertex.y, vertex.z).sub(startPoint);
    const projection = relativePos.dot(bendDirection);
    
    // Only bend vertices within the bend region
    if (projection >= 0 && projection <= bendLength) {
      // Calculate bend factor (0 at start, 1 at end)
      const bendFactor = projection / bendLength;
      
      // Calculate bend angle for this vertex
      const vertexAngle = angle * bendFactor;
      
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
 * Advanced bend operation with control points
 */
export function bendAdvanced(
  mesh: EditableMesh,
  controlPoints: Vector3[],
  options: BendOptions = {}
): EditableMesh {
  if (controlPoints.length < 2) {
    throw new Error('At least 2 control points are required for advanced bending');
  }

  const angle = options.angle ?? Math.PI / 4;
  const axis = options.axis ?? new Vector3(0, 1, 0);
  const center = options.center ?? new Vector3(0, 0, 0);

  // Normalize axis
  axis.normalize();

  // Calculate bend curve from control points
  const curve = calculateBendCurve(controlPoints);

  // Apply bend to each vertex
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate bend factor based on position along curve
    const bendFactor = calculateBendFactor(vertex, curve);
    
    if (bendFactor > 0) {
      // Calculate bend angle for this vertex
      const vertexAngle = angle * bendFactor;
      
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
 * Calculate bend curve from control points
 */
export function calculateBendCurve(controlPoints: Vector3[]): Vector3[] {
  // Simple linear interpolation between control points
  const curve: Vector3[] = [];
  
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const start = controlPoints[i];
    const end = controlPoints[i + 1];
    
    // Add intermediate points
    const steps = 10;
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      const point = new Vector3();
      point.lerpVectors(start, end, t);
      curve.push(point);
    }
  }
  
  return curve;
}

/**
 * Calculate bend factor for a vertex based on curve
 */
export function calculateBendFactor(vertex: any, curve: Vector3[]): number {
  // Find closest point on curve
  let minDistance = Infinity;
  let closestIndex = 0;
  
  for (let i = 0; i < curve.length; i++) {
    const distance = new Vector3(vertex.x, vertex.y, vertex.z).distanceTo(curve[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  
  // Return normalized factor (0 to 1)
  return closestIndex / Math.max(curve.length - 1, 1);
} 