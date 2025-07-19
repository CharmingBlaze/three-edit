import { Vector3, Matrix4, MathUtils } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';

/**
 * Options for deformation operations
 */
export interface DeformOptions {
  /** Axis of deformation (default: Y-axis) */
  axis?: Vector3;
  /** Center point of deformation (default: origin) */
  center?: Vector3;
  /** Whether to keep original geometry */
  keepOriginal?: boolean;
  /** Material index for new faces */
  materialIndex?: number;
}

/**
 * Options for bend operations
 */
export interface BendOptions extends DeformOptions {
  /** Bend angle in radians */
  angle?: number;
  /** Direction of the bend */
  direction?: Vector3;
  /** Start point of the bend region */
  startPoint?: Vector3;
  /** End point of the bend region */
  endPoint?: Vector3;
}

/**
 * Options for twist operations
 */
export interface TwistOptions extends DeformOptions {
  /** Twist angle in radians */
  angle?: number;
  /** Start point of the twist region */
  startPoint?: Vector3;
  /** End point of the twist region */
  endPoint?: Vector3;
}

/**
 * Options for taper operations
 */
export interface TaperOptions extends DeformOptions {
  /** Taper factor (0 = no taper, 1 = full taper) */
  factor?: number;
  /** Start point of the taper region */
  startPoint?: Vector3;
  /** End point of the taper region */
  endPoint?: Vector3;
  /** Whether to taper uniformly or per-axis */
  uniform?: boolean;
}

/**
 * Bends a mesh along a specified axis and angle
 * @param mesh The mesh to bend
 * @param options Options for the bend operation
 * @returns The modified mesh
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
  const keepOriginal = options.keepOriginal ?? true;
  const materialIndex = options.materialIndex ?? 0;

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
 * Twists a mesh around a specified axis
 * @param mesh The mesh to twist
 * @param options Options for the twist operation
 * @returns The modified mesh
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
  const keepOriginal = options.keepOriginal ?? true;
  const materialIndex = options.materialIndex ?? 0;

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
 * Tapers a mesh along a specified axis
 * @param mesh The mesh to taper
 * @param options Options for the taper operation
 * @returns The modified mesh
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
  const keepOriginal = options.keepOriginal ?? true;
  const materialIndex = options.materialIndex ?? 0;

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
      
      // Calculate scale factor for this vertex
      const scaleFactor = 1 - (factor * taperFactor);
      
      // Create scale matrix
      const scaleMatrix = new Matrix4();
      if (uniform) {
        // Uniform scaling
        scaleMatrix.makeScale(scaleFactor, scaleFactor, scaleFactor);
      } else {
        // Non-uniform scaling based on axis
        const scaleX = axis.x !== 0 ? scaleFactor : 1;
        const scaleY = axis.y !== 0 ? scaleFactor : 1;
        const scaleZ = axis.z !== 0 ? scaleFactor : 1;
        scaleMatrix.makeScale(scaleX, scaleY, scaleZ);
      }
      
      // Apply scaling around center
      const transformedPos = new Vector3(vertex.x, vertex.y, vertex.z);
      transformedPos.sub(center);
      transformedPos.applyMatrix4(scaleMatrix);
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
 * Generic deformation function that can apply bend, twist, or taper
 * @param mesh The mesh to deform
 * @param deformType The type of deformation operation
 * @param options Options for the deformation operation
 * @returns The modified mesh
 */
export function deform(
  mesh: EditableMesh,
  deformType: 'bend' | 'twist' | 'taper',
  options: BendOptions | TwistOptions | TaperOptions = {}
): EditableMesh {
  switch (deformType) {
    case 'bend':
      return bend(mesh, options as BendOptions);
    case 'twist':
      return twist(mesh, options as TwistOptions);
    case 'taper':
      return taper(mesh, options as TaperOptions);
    default:
      throw new Error(`Unknown deformation type: ${deformType}`);
  }
}

/**
 * Advanced bend operation with multiple control points
 * @param mesh The mesh to bend
 * @param controlPoints Array of control points for complex bending
 * @param options Options for the bend operation
 * @returns The modified mesh
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
  const keepOriginal = options.keepOriginal ?? true;
  const materialIndex = options.materialIndex ?? 0;

  // Normalize axis
  axis.normalize();

  // Calculate total path length
  let totalLength = 0;
  for (let i = 1; i < controlPoints.length; i++) {
    totalLength += controlPoints[i].distanceTo(controlPoints[i - 1]);
  }

  // Apply deformation to each vertex
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Find the closest point on the control path
    let minDistance = Infinity;
    let closestPoint = new Vector3();
    let pathPosition = 0;

    for (let j = 1; j < controlPoints.length; j++) {
      const segmentStart = controlPoints[j - 1];
      const segmentEnd = controlPoints[j];
      const segmentDirection = new Vector3().subVectors(segmentEnd, segmentStart).normalize();
      
      // Project vertex onto segment
      const toVertex = new Vector3().subVectors(new Vector3(vertex.x, vertex.y, vertex.z), segmentStart);
      const projection = toVertex.dot(segmentDirection);
      
      if (projection >= 0 && projection <= segmentEnd.distanceTo(segmentStart)) {
        const pointOnSegment = segmentStart.clone().add(segmentDirection.clone().multiplyScalar(projection));
        const distance = pointOnSegment.distanceTo(new Vector3(vertex.x, vertex.y, vertex.z));
        
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint.copy(pointOnSegment);
          pathPosition += projection;
        }
      }
      
      pathPosition += segmentEnd.distanceTo(segmentStart);
    }

    // Calculate bend factor based on path position
    const bendFactor = pathPosition / totalLength;
    const vertexAngle = angle * bendFactor;

    // Create rotation matrix
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

  return mesh;
}

/**
 * Advanced twist operation with variable twist rate
 * @param mesh The mesh to twist
 * @param twistRate Function that returns twist angle based on position
 * @param options Options for the twist operation
 * @returns The modified mesh
 */
export function twistAdvanced(
  mesh: EditableMesh,
  twistRate: (position: Vector3) => number,
  options: TwistOptions = {}
): EditableMesh {
  const axis = options.axis ?? new Vector3(0, 1, 0);
  const center = options.center ?? new Vector3(0, 0, 0);
  const keepOriginal = options.keepOriginal ?? true;
  const materialIndex = options.materialIndex ?? 0;

  // Normalize axis
  axis.normalize();

  // Apply deformation to each vertex
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    const vertexAngle = twistRate(position);

    // Create rotation matrix
    const rotationMatrix = new Matrix4();
    rotationMatrix.makeRotationAxis(axis, vertexAngle);

    // Apply rotation around center
    const transformedPos = position.clone();
    transformedPos.sub(center);
    transformedPos.applyMatrix4(rotationMatrix);
    transformedPos.add(center);

    // Update vertex position
    vertex.x = transformedPos.x;
    vertex.y = transformedPos.y;
    vertex.z = transformedPos.z;
  }

  return mesh;
}

/**
 * Advanced taper operation with custom taper profile
 * @param mesh The mesh to taper
 * @param taperProfile Function that returns scale factor based on position
 * @param options Options for the taper operation
 * @returns The modified mesh
 */
export function taperAdvanced(
  mesh: EditableMesh,
  taperProfile: (position: Vector3) => Vector3,
  options: TaperOptions = {}
): EditableMesh {
  const center = options.center ?? new Vector3(0, 0, 0);
  const keepOriginal = options.keepOriginal ?? true;
  const materialIndex = options.materialIndex ?? 0;

  // Apply deformation to each vertex
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    const scaleFactor = taperProfile(position);

    // Create scale matrix
    const scaleMatrix = new Matrix4();
    scaleMatrix.makeScale(scaleFactor.x, scaleFactor.y, scaleFactor.z);

    // Apply scaling around center
    const transformedPos = position.clone();
    transformedPos.sub(center);
    transformedPos.applyMatrix4(scaleMatrix);
    transformedPos.add(center);

    // Update vertex position
    vertex.x = transformedPos.x;
    vertex.y = transformedPos.y;
    vertex.z = transformedPos.z;
  }

  return mesh;
} 