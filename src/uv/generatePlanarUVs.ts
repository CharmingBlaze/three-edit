import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { UVCoord } from './UVCoord';

/**
 * Projection axis for planar UV generation
 */
export type ProjectionAxis = 'x' | 'y' | 'z' | 'xy' | 'xz' | 'yz' | 'xyz';

/**
 * Options for planar UV generation
 */
export interface GeneratePlanarUVsOptions {
  /** The projection axis to use */
  projectionAxis?: ProjectionAxis;
  /** Whether to normalize UV coordinates to [0,1] range */
  normalize?: boolean;
  /** UV offset */
  offset?: { u: number; v: number };
  /** UV scale */
  scale?: { u: number; v: number };
}

/**
 * Generates planar UV coordinates for a mesh
 * @param mesh The mesh to generate UVs for
 * @param options Options for UV generation
 * @returns The mesh with generated UVs
 */
export function generatePlanarUVs(
  mesh: EditableMesh,
  options: GeneratePlanarUVsOptions = {}
): EditableMesh {
  const opts = {
    projectionAxis: options.projectionAxis ?? 'z',
    normalize: options.normalize ?? true,
    offset: options.offset ?? { u: 0, v: 0 },
    scale: options.scale ?? { u: 1, v: 1 }
  };
  
  // Calculate bounding box for normalization
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (const vertex of mesh.vertices) {
    minX = Math.min(minX, vertex.x);
    maxX = Math.max(maxX, vertex.x);
    minY = Math.min(minY, vertex.y);
    maxY = Math.max(maxY, vertex.y);
    minZ = Math.min(minZ, vertex.z);
    maxZ = Math.max(maxZ, vertex.z);
  }
  
  const rangeX = maxX - minX;
  const rangeY = maxY - minY;
  const rangeZ = maxZ - minZ;
  
  // Generate UVs for each vertex
  for (const vertex of mesh.vertices) {
    let u = 0, v = 0;
    
    switch (opts.projectionAxis) {
      case 'x':
        u = (vertex.y - minY) / rangeY;
        v = (vertex.z - minZ) / rangeZ;
        break;
      case 'y':
        u = (vertex.x - minX) / rangeX;
        v = (vertex.z - minZ) / rangeZ;
        break;
      case 'z':
        u = (vertex.x - minX) / rangeX;
        v = (vertex.y - minY) / rangeY;
        break;
      case 'xy':
        u = (vertex.x - minX) / rangeX;
        v = (vertex.y - minY) / rangeY;
        break;
      case 'xz':
        u = (vertex.x - minX) / rangeX;
        v = (vertex.z - minZ) / rangeZ;
        break;
      case 'yz':
        u = (vertex.y - minY) / rangeY;
        v = (vertex.z - minZ) / rangeZ;
        break;
      case 'xyz':
        // Use spherical projection
        const center = new Vector3(
          (minX + maxX) / 2,
          (minY + maxY) / 2,
          (minZ + maxZ) / 2
        );
        const direction = new Vector3(
          vertex.x - center.x,
          vertex.y - center.y,
          vertex.z - center.z
        ).normalize();
        
        u = (Math.atan2(direction.y, direction.x) + Math.PI) / (2 * Math.PI);
        v = (Math.asin(direction.z) + Math.PI / 2) / Math.PI;
        break;
    }
    
    // Apply scale and offset
    u = u * opts.scale.u + opts.offset.u;
    v = v * opts.scale.v + opts.offset.v;
    
    // Normalize to [0,1] if requested
    if (opts.normalize) {
      u = Math.max(0, Math.min(1, u));
      v = Math.max(0, Math.min(1, v));
    }
    
    vertex.uv = { u, v };
  }
  
  return mesh;
}

/**
 * Generates cylindrical UV coordinates
 * @param mesh The mesh to generate UVs for
 * @param options Options for UV generation
 * @returns The mesh with generated UVs
 */
export function generateCylindricalUVs(
  mesh: EditableMesh,
  options: {
    axis?: 'x' | 'y' | 'z';
    normalize?: boolean;
    offset?: { u: number; v: number };
    scale?: { u: number; v: number };
  } = {}
): EditableMesh {
  const opts = {
    axis: options.axis ?? 'z',
    normalize: options.normalize ?? true,
    offset: options.offset ?? { u: 0, v: 0 },
    scale: options.scale ?? { u: 1, v: 1 }
  };
  
  // Calculate bounding box
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (const vertex of mesh.vertices) {
    minX = Math.min(minX, vertex.x);
    maxX = Math.max(maxX, vertex.x);
    minY = Math.min(minY, vertex.y);
    maxY = Math.max(maxY, vertex.y);
    minZ = Math.min(minZ, vertex.z);
    maxZ = Math.max(maxZ, vertex.z);
  }
  
  const center = new Vector3(
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2
  );
  
  for (const vertex of mesh.vertices) {
    let u = 0, v = 0;
    
    switch (opts.axis) {
      case 'x':
        u = (Math.atan2(vertex.z - center.z, vertex.y - center.y) + Math.PI) / (2 * Math.PI);
        v = (vertex.x - minX) / (maxX - minX);
        break;
      case 'y':
        u = (Math.atan2(vertex.x - center.x, vertex.z - center.z) + Math.PI) / (2 * Math.PI);
        v = (vertex.y - minY) / (maxY - minY);
        break;
      case 'z':
        u = (Math.atan2(vertex.y - center.y, vertex.x - center.x) + Math.PI) / (2 * Math.PI);
        v = (vertex.z - minZ) / (maxZ - minZ);
        break;
    }
    
    // Apply scale and offset
    u = u * opts.scale.u + opts.offset.u;
    v = v * opts.scale.v + opts.offset.v;
    
    // Normalize to [0,1] if requested
    if (opts.normalize) {
      u = Math.max(0, Math.min(1, u));
      v = Math.max(0, Math.min(1, v));
    }
    
    vertex.uv = { u, v };
  }
  
  return mesh;
}

/**
 * Generates spherical UV coordinates
 * @param mesh The mesh to generate UVs for
 * @param options Options for UV generation
 * @returns The mesh with generated UVs
 */
export function generateSphericalUVs(
  mesh: EditableMesh,
  options: {
    center?: Vector3;
    normalize?: boolean;
    offset?: { u: number; v: number };
    scale?: { u: number; v: number };
  } = {}
): EditableMesh {
  const opts = {
    normalize: options.normalize ?? true,
    offset: options.offset ?? { u: 0, v: 0 },
    scale: options.scale ?? { u: 1, v: 1 }
  };
  
  // Calculate center if not provided
  let center = options.center;
  if (!center) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    for (const vertex of mesh.vertices) {
      minX = Math.min(minX, vertex.x);
      maxX = Math.max(maxX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxY = Math.max(maxY, vertex.y);
      minZ = Math.min(minZ, vertex.z);
      maxZ = Math.max(maxZ, vertex.z);
    }
    
    center = new Vector3(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2
    );
  }
  
  for (const vertex of mesh.vertices) {
    const direction = new Vector3(
      vertex.x - center.x,
      vertex.y - center.y,
      vertex.z - center.z
    ).normalize();
    
    // Convert to spherical coordinates
    const u = (Math.atan2(direction.y, direction.x) + Math.PI) / (2 * Math.PI);
    const v = (Math.asin(direction.z) + Math.PI / 2) / Math.PI;
    
    // Apply scale and offset
    const finalU = u * opts.scale.u + opts.offset.u;
    const finalV = v * opts.scale.v + opts.offset.v;
    
    // Normalize to [0,1] if requested
    if (opts.normalize) {
      vertex.uv = {
        u: Math.max(0, Math.min(1, finalU)),
        v: Math.max(0, Math.min(1, finalV))
      };
    } else {
      vertex.uv = { u: finalU, v: finalV };
    }
  }
  
  return mesh;
} 