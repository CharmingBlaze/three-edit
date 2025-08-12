import { Vector3, Matrix4 } from 'three';
import { EditableMesh } from '../core/EditableMesh';

/**
 * Options for mirroring geometry
 */
export interface MirrorOptions {
  /** Whether to duplicate the geometry or replace it */
  duplicate?: boolean;
  /** Whether to weld vertices at the mirror plane */
  weldVertices?: boolean;
  /** Tolerance for welding vertices */
  weldTolerance?: number;
}

/**
 * Mirrors geometry across a plane
 * @param mesh The mesh to mirror
 * @param planePoint A point on the mirror plane
 * @param planeNormal Normal vector of the mirror plane
 * @param options Options for the mirror operation
 * @returns The mirrored mesh (new instance if duplicate is true, same instance if false)
 */
export function mirrorByPlane(
  mesh: EditableMesh,
  planePoint: Vector3,
  planeNormal: Vector3,
  options: MirrorOptions = {}
): EditableMesh {
  const duplicate = options.duplicate ?? true;
  // const _weldVertices = options.weldVertices ?? false;
  // const _weldTolerance = options.weldTolerance ?? 0.001;
  
  // Normalize the plane normal
  const normalizedNormal = planeNormal.clone().normalize();
  
  // Create a reflection matrix for the plane
  // Formula: R = I - 2 * n * n^T where n is the normalized normal
  const reflectionMatrix = new Matrix4();
  const n = normalizedNormal;
  
  // Set the reflection matrix elements
  reflectionMatrix.set(
    1 - 2 * n.x * n.x, -2 * n.x * n.y, -2 * n.x * n.z, 0,
    -2 * n.y * n.x, 1 - 2 * n.y * n.y, -2 * n.y * n.z, 0,
    -2 * n.z * n.x, -2 * n.z * n.y, 1 - 2 * n.z * n.z, 0,
    0, 0, 0, 1
  );
  
  // Translate to origin, reflect, then translate back
  const translationMatrix = new Matrix4();
  translationMatrix.makeTranslation(-planePoint.x, -planePoint.y, -planePoint.z);
  
  const finalMatrix = new Matrix4();
  finalMatrix.multiply(translationMatrix);
  finalMatrix.multiply(reflectionMatrix);
  finalMatrix.multiply(translationMatrix.clone().invert());
  
  // Apply the transformation
  if (duplicate) {
    const mirroredMesh = mesh.clone();
    mirroredMesh.matrix.multiply(finalMatrix);
    mirroredMesh.applyMatrix();
    return mirroredMesh;
  } else {
    mesh.matrix.multiply(finalMatrix);
    mesh.applyMatrix();
    return mesh;
  }
}

/**
 * Mirrors geometry across an axis
 * @param mesh The mesh to mirror
 * @param axis The axis to mirror across ('x', 'y', or 'z')
 * @param options Options for the mirror operation
 * @returns The mirrored mesh
 */
export function mirrorByAxis(
  mesh: EditableMesh,
  axis: 'x' | 'y' | 'z',
  options: MirrorOptions = {}
): EditableMesh {
  const duplicate = options.duplicate ?? true;
  
  // Create the mirror matrix based on the axis
  const mirrorMatrix = new Matrix4();
  switch (axis) {
    case 'x':
      mirrorMatrix.makeScale(-1, 1, 1);
      break;
    case 'y':
      mirrorMatrix.makeScale(1, -1, 1);
      break;
    case 'z':
      mirrorMatrix.makeScale(1, 1, -1);
      break;
  }
  
  // Apply the transformation
  if (duplicate) {
    const mirroredMesh = mesh.clone();
    mirroredMesh.matrix.multiply(mirrorMatrix);
    mirroredMesh.applyMatrix();
    return mirroredMesh;
  } else {
    mesh.matrix.multiply(mirrorMatrix);
    mesh.applyMatrix();
    return mesh;
  }
}

/**
 * Mirrors geometry across a point
 * @param mesh The mesh to mirror
 * @param centerPoint The center point for mirroring
 * @param options Options for the mirror operation
 * @returns The mirrored mesh
 */
export function mirrorByPoint(
  mesh: EditableMesh,
  centerPoint: Vector3,
  options: MirrorOptions = {}
): EditableMesh {
  const duplicate = options.duplicate ?? true;
  
  // Create the mirror matrix (scale by -1 in all directions)
  const mirrorMatrix = new Matrix4();
  mirrorMatrix.makeScale(-1, -1, -1);
  
  // Translate to origin, mirror, then translate back
  const translationMatrix = new Matrix4();
  translationMatrix.makeTranslation(-centerPoint.x, -centerPoint.y, -centerPoint.z);
  
  const finalMatrix = new Matrix4();
  finalMatrix.multiply(translationMatrix);
  finalMatrix.multiply(mirrorMatrix);
  finalMatrix.multiply(translationMatrix.clone().invert());
  
  // Apply the transformation
  if (duplicate) {
    const mirroredMesh = mesh.clone();
    mirroredMesh.matrix.multiply(finalMatrix);
    mirroredMesh.applyMatrix();
    return mirroredMesh;
  } else {
    mesh.matrix.multiply(finalMatrix);
    mesh.applyMatrix();
    return mesh;
  }
}

/**
 * Generic mirror function that can mirror across various geometries
 * @param mesh The mesh to mirror
 * @param mirrorType The type of mirror operation
 * @param parameters Parameters for the mirror operation
 * @param options Options for the mirror operation
 * @returns The mirrored mesh
 */
export function mirror(
  mesh: EditableMesh,
  mirrorType: 'plane' | 'axis' | 'point',
  parameters: {
    planePoint?: Vector3;
    planeNormal?: Vector3;
    axis?: 'x' | 'y' | 'z';
    centerPoint?: Vector3;
  },
  options: MirrorOptions = {}
): EditableMesh {
  switch (mirrorType) {
    case 'plane':
      if (!parameters.planePoint || !parameters.planeNormal) {
        throw new Error('Plane point and normal are required for plane mirroring');
      }
      return mirrorByPlane(mesh, parameters.planePoint, parameters.planeNormal, options);
    
    case 'axis':
      if (!parameters.axis) {
        throw new Error('Axis is required for axis mirroring');
      }
      return mirrorByAxis(mesh, parameters.axis, options);
    
    case 'point':
      if (!parameters.centerPoint) {
        throw new Error('Center point is required for point mirroring');
      }
      return mirrorByPoint(mesh, parameters.centerPoint, options);
    
    default:
      throw new Error(`Unknown mirror type: ${mirrorType}`);
  }
} 