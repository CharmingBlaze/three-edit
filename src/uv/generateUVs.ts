import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { UVCoord, createUV } from './UVCoord';

/**
 * UV mapping projection types
 */
export enum UVProjectionType {
  /** Projects UVs based on planar projection along an axis */
  PLANAR = 'planar',
  /** Projects UVs based on cubic projection (6 faces) */
  CUBIC = 'cubic',
  /** Projects UVs based on spherical coordinates */
  SPHERICAL = 'spherical',
  /** Projects UVs based on cylindrical coordinates */
  CYLINDRICAL = 'cylindrical'
}

/**
 * Options for UV generation
 */
export interface GenerateUVsOptions {
  /** Projection type */
  projectionType?: UVProjectionType;
  /** Projection axis for planar projection */
  projectionAxis?: 'x' | 'y' | 'z';
  /** Scale factor for UV coordinates */
  scale?: number;
  /** Offset for UV coordinates */
  offset?: UVCoord;
  /** Whether to normalize UVs to [0,1] range */
  normalize?: boolean;
  /** Whether to flip U coordinates */
  flipU?: boolean;
  /** Whether to flip V coordinates */
  flipV?: boolean;
  /** Whether to rotate UVs (in degrees) */
  rotation?: number;
}

/**
 * Generates UV coordinates for a mesh using the specified projection
 * @param mesh The mesh to generate UVs for
 * @param options UV generation options
 * @returns The mesh with generated UVs
 */
export function generateUVs(
  mesh: EditableMesh,
  options: GenerateUVsOptions = {}
): EditableMesh {
  const projectionType = options.projectionType ?? UVProjectionType.PLANAR;
  const projectionAxis = options.projectionAxis ?? 'y';
  const scale = options.scale ?? 1.0;
  const offset = options.offset ?? { u: 0, v: 0 };
  const normalize = options.normalize ?? true;
  const flipU = options.flipU ?? false;
  const flipV = options.flipV ?? false;
  const rotation = options.rotation ?? 0;
  
  // Choose the appropriate projection function
  switch (projectionType) {
    case UVProjectionType.PLANAR:
      return generatePlanarUVs(mesh, projectionAxis, scale, offset, normalize, flipU, flipV, rotation);
    case UVProjectionType.CUBIC:
      return generateCubicUVs(mesh, scale, offset, normalize, flipU, flipV, rotation);
    case UVProjectionType.SPHERICAL:
      return generateSphericalUVs(mesh, scale, offset, normalize, flipU, flipV, rotation);
    case UVProjectionType.CYLINDRICAL:
      return generateCylindricalUVs(mesh, scale, offset, normalize, flipU, flipV, rotation);
    default:
      throw new Error(`Unsupported UV projection type: ${projectionType}`);
  }
}

/**
 * Generates planar UV coordinates for a mesh
 * @param mesh The mesh to generate UVs for
 * @param projectionAxis The axis to project along
 * @param scale Scale factor for UV coordinates
 * @param offset Offset for UV coordinates
 * @param normalize Whether to normalize UVs to [0,1] range
 * @param flipU Whether to flip U coordinates
 * @param flipV Whether to flip V coordinates
 * @param rotation Rotation angle in degrees
 * @returns The mesh with generated UVs
 */
function generatePlanarUVs(
  mesh: EditableMesh,
  projectionAxis: 'x' | 'y' | 'z',
  scale: number,
  offset: UVCoord,
  normalize: boolean,
  flipU: boolean,
  flipV: boolean,
  rotation: number
): EditableMesh {
  // Find bounds for normalization
  let minU = Infinity;
  let maxU = -Infinity;
  let minV = -Infinity;
  let maxV = -Infinity;
  
  // Generate raw UVs based on projection
  mesh.vertices.forEach(vertex => {
    let u: number;
    let v: number;
    
    // Project based on the specified axis
    switch (projectionAxis) {
      case 'x':
        u = vertex.z;
        v = vertex.y;
        break;
      case 'y':
        u = vertex.x;
        v = vertex.z;
        break;
      case 'z':
        u = vertex.x;
        v = vertex.y;
        break;
      default:
        throw new Error(`Invalid projection axis: ${projectionAxis}`);
    }
    
    // Apply rotation if specified
    if (rotation !== 0) {
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const newU = u * cos - v * sin;
      const newV = u * sin + v * cos;
      u = newU;
      v = newV;
    }
    
    // Track min/max for normalization
    minU = Math.min(minU, u);
    maxU = Math.max(maxU, u);
    minV = Math.min(minV, v);
    maxV = Math.max(maxV, v);
    
    // Store raw UVs temporarily
    vertex.uv = { u, v };
  });
  
  // Normalize and apply transformations
  if (normalize && minU !== maxU && minV !== maxV) {
    const rangeU = maxU - minU;
    const rangeV = maxV - minV;
    
    mesh.vertices.forEach(vertex => {
      if (!vertex.uv) return;
      
      // Normalize to [0,1]
      let u = (vertex.uv.u - minU) / rangeU;
      let v = (vertex.uv.v - minV) / rangeV;
      
      // Apply flip
      if (flipU) u = 1 - u;
      if (flipV) v = 1 - v;
      
      // Apply scale and offset
      u = u * scale + offset.u;
      v = v * scale + offset.v;
      
      // Update UV
      vertex.uv = { u, v };
    });
  } else {
    // Apply transformations without normalization
    mesh.vertices.forEach(vertex => {
      if (!vertex.uv) return;
      
      let u = vertex.uv.u;
      let v = vertex.uv.v;
      
      // Apply flip
      if (flipU) u = -u;
      if (flipV) v = -v;
      
      // Apply scale and offset
      u = u * scale + offset.u;
      v = v * scale + offset.v;
      
      // Update UV
      vertex.uv = { u, v };
    });
  }
  
  return mesh;
}

/**
 * Generates cubic UV coordinates for a mesh
 * @param mesh The mesh to generate UVs for
 * @param scale Scale factor for UV coordinates
 * @param offset Offset for UV coordinates
 * @param normalize Whether to normalize UVs to [0,1] range
 * @param flipU Whether to flip U coordinates
 * @param flipV Whether to flip V coordinates
 * @param rotation Rotation angle in degrees
 * @returns The mesh with generated UVs
 */
function generateCubicUVs(
  mesh: EditableMesh,
  scale: number,
  offset: UVCoord,
  normalize: boolean,
  flipU: boolean,
  flipV: boolean,
  rotation: number
): EditableMesh {
  // For each face, determine the dominant axis and use planar projection
  mesh.faces.forEach(face => {
    // Calculate face normal if not available
    if (!face.normal) {
      const v0 = mesh.getVertex(face.vertices[0]);
      const v1 = mesh.getVertex(face.vertices[1]);
      const v2 = mesh.getVertex(face.vertices[2]);
      
      if (v0 && v1 && v2) {
        const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
        const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
        face.normal = new Vector3().crossVectors(edge1, edge2).normalize();
      }
    }
    
    if (!face.normal) return;
    
    // Determine dominant axis based on normal
    let projectionAxis: 'x' | 'y' | 'z';
    const absX = Math.abs(face.normal.x);
    const absY = Math.abs(face.normal.y);
    const absZ = Math.abs(face.normal.z);
    
    if (absX >= absY && absX >= absZ) {
      projectionAxis = 'x';
    } else if (absY >= absX && absY >= absZ) {
      projectionAxis = 'y';
    } else {
      projectionAxis = 'z';
    }
    
    // Generate UVs for vertices of this face using planar projection
    face.vertices.forEach(vertexIndex => {
      const vertex = mesh.getVertex(vertexIndex);
      if (!vertex) return;
      
      let u: number;
      let v: number;
      
      // Project based on the dominant axis
      switch (projectionAxis) {
        case 'x':
          u = vertex.z;
          v = vertex.y;
          break;
        case 'y':
          u = vertex.x;
          v = vertex.z;
          break;
        case 'z':
          u = vertex.x;
          v = vertex.y;
          break;
      }
      
      // Apply rotation if specified
      if (rotation !== 0) {
        const rad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const newU = u * cos - v * sin;
        const newV = u * sin + v * cos;
        u = newU;
        v = newV;
      }
      
      // Apply transformations
      if (flipU) u = -u;
      if (flipV) v = -v;
      
      // Apply scale and offset
      u = u * scale + offset.u;
      v = v * scale + offset.v;
      
      // Update UV
      vertex.uv = { u, v };
    });
  });
  
  // Normalize UVs if requested
  if (normalize) {
    // Find bounds
    let minU = Infinity;
    let maxU = -Infinity;
    let minV = -Infinity;
    let maxV = -Infinity;
    
    mesh.vertices.forEach(vertex => {
      if (!vertex.uv) return;
      minU = Math.min(minU, vertex.uv.u);
      maxU = Math.max(maxU, vertex.uv.u);
      minV = Math.min(minV, vertex.uv.v);
      maxV = Math.max(maxV, vertex.uv.v);
    });
    
    // Normalize
    if (minU !== maxU && minV !== maxV) {
      const rangeU = maxU - minU;
      const rangeV = maxV - minV;
      
      mesh.vertices.forEach(vertex => {
        if (!vertex.uv) return;
        vertex.uv.u = (vertex.uv.u - minU) / rangeU;
        vertex.uv.v = (vertex.uv.v - minV) / rangeV;
      });
    }
  }
  
  return mesh;
}

/**
 * Generates spherical UV coordinates for a mesh
 * @param mesh The mesh to generate UVs for
 * @param scale Scale factor for UV coordinates
 * @param offset Offset for UV coordinates
 * @param normalize Whether to normalize UVs to [0,1] range
 * @param flipU Whether to flip U coordinates
 * @param flipV Whether to flip V coordinates
 * @param rotation Rotation angle in degrees
 * @returns The mesh with generated UVs
 */
function generateSphericalUVs(
  mesh: EditableMesh,
  scale: number,
  offset: UVCoord,
  normalize: boolean,
  flipU: boolean,
  flipV: boolean,
  rotation: number
): EditableMesh {
  // Find center and radius
  const center = new Vector3();
  let totalVertices = 0;
  
  // Calculate center
  mesh.vertices.forEach(vertex => {
    center.x += vertex.x;
    center.y += vertex.y;
    center.z += vertex.z;
    totalVertices++;
  });
  
  if (totalVertices > 0) {
    center.divideScalar(totalVertices);
  }
  
  // Find radius
  let maxRadiusSq = 0;
  mesh.vertices.forEach(vertex => {
    const dx = vertex.x - center.x;
    const dy = vertex.y - center.y;
    const dz = vertex.z - center.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    maxRadiusSq = Math.max(maxRadiusSq, distSq);
  });
  
  const radius = Math.sqrt(maxRadiusSq);
  
  // Generate spherical UVs
  mesh.vertices.forEach(vertex => {
    // Vector from center to vertex
    const dx = vertex.x - center.x;
    const dy = vertex.y - center.y;
    const dz = vertex.z - center.z;
    
    // Convert to spherical coordinates
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const theta = Math.atan2(dy, dx); // Azimuthal angle (around y-axis)
    const phi = Math.acos(dz / (r || 1)); // Polar angle (from z-axis)
    
    // Map to UV coordinates
    let u = (theta + Math.PI) / (2 * Math.PI); // Map theta to [0,1]
    let v = phi / Math.PI; // Map phi to [0,1]
    
    // Apply rotation if specified
    if (rotation !== 0) {
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const newU = u * cos - v * sin;
      const newV = u * sin + v * cos;
      u = newU;
      v = newV;
    }
    
    // Apply flip
    if (flipU) u = 1 - u;
    if (flipV) v = 1 - v;
    
    // Apply scale and offset
    u = u * scale + offset.u;
    v = v * scale + offset.v;
    
    // Update UV
    vertex.uv = { u, v };
  });
  
  return mesh;
}

/**
 * Generates cylindrical UV coordinates for a mesh
 * @param mesh The mesh to generate UVs for
 * @param scale Scale factor for UV coordinates
 * @param offset Offset for UV coordinates
 * @param normalize Whether to normalize UVs to [0,1] range
 * @param flipU Whether to flip U coordinates
 * @param flipV Whether to flip V coordinates
 * @param rotation Rotation angle in degrees
 * @returns The mesh with generated UVs
 */
function generateCylindricalUVs(
  mesh: EditableMesh,
  scale: number,
  offset: UVCoord,
  normalize: boolean,
  flipU: boolean,
  flipV: boolean,
  rotation: number
): EditableMesh {
  // Find center and height range
  const center = new Vector3();
  let totalVertices = 0;
  let minY = Infinity;
  let maxY = -Infinity;
  
  // Calculate center (xy-plane) and height range
  mesh.vertices.forEach(vertex => {
    center.x += vertex.x;
    center.z += vertex.z;
    minY = Math.min(minY, vertex.y);
    maxY = Math.max(maxY, vertex.y);
    totalVertices++;
  });
  
  if (totalVertices > 0) {
    center.x /= totalVertices;
    center.z /= totalVertices;
  }
  
  const height = maxY - minY;
  
  // Generate cylindrical UVs
  mesh.vertices.forEach(vertex => {
    // Vector from center to vertex (in xy-plane)
    const dx = vertex.x - center.x;
    const dz = vertex.z - center.z;
    
    // Convert to cylindrical coordinates
    const theta = Math.atan2(dz, dx); // Angle in xy-plane
    
    // Map to UV coordinates
    let u = (theta + Math.PI) / (2 * Math.PI); // Map theta to [0,1]
    let v = (vertex.y - minY) / (height || 1); // Map height to [0,1]
    
    // Apply rotation if specified
    if (rotation !== 0) {
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const newU = u * cos - v * sin;
      const newV = u * sin + v * cos;
      u = newU;
      v = newV;
    }
    
    // Apply flip
    if (flipU) u = 1 - u;
    if (flipV) v = 1 - v;
    
    // Apply scale and offset
    u = u * scale + offset.u;
    v = v * scale + offset.v;
    
    // Update UV
    vertex.uv = { u, v };
  });
  
  return mesh;
}
