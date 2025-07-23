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

  const angle = options.angle ?? Math.PI / 2;
  const axis = options.axis ?? new Vector3(0, 1, 0);
  const center = options.center ?? new Vector3(0, 0, 0);

  // Normalize axis
  axis.normalize();

  // Create spline from control points
  const spline = createSplineFromPoints(controlPoints);

  // Apply bend to each vertex
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate bend factor based on position along spline
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    const bendFactor = calculateBendFactor(position, spline, controlPoints);
    
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
 * Create a spline from control points
 */
function createSplineFromPoints(points: Vector3[]): Vector3[] {
  const spline: Vector3[] = [];
  const segments = 50; // Number of segments between control points
  
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const point = new Vector3();
      point.lerpVectors(start, end, t);
      spline.push(point);
    }
  }
  
  return spline;
}

/**
 * Calculate bend factor based on distance from spline
 */
function calculateBendFactor(position: Vector3, spline: Vector3[], _controlPoints: Vector3[]): number {
  // Find closest point on spline
  let minDistance = Infinity;
  // let closestPoint = spline[0];
  
  for (const splinePoint of spline) {
    const distance = position.distanceTo(splinePoint);
    if (distance < minDistance) {
      minDistance = distance;
      // closestPoint = splinePoint;
    }
  }
  
  // Calculate bend factor based on distance from spline
  const maxDistance = 2.0; // Maximum distance for bending effect
  const factor = Math.max(0, 1 - (minDistance / maxDistance));
  
  return factor;
} 