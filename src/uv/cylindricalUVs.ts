import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { UVGenerationParams } from './types';

/**
 * Generates cylindrical UV coordinates for a mesh
 * @param mesh The mesh to generate UVs for
 * @param params UV generation parameters
 * @returns The mesh with generated UVs
 */
export function generateCylindricalUVs(
  mesh: EditableMesh,
  params: UVGenerationParams
): EditableMesh {
  const { scale, offset, normalize, flipU, flipV, rotation } = params;
  
  // Find bounds for normalization
  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;
  
  // Generate raw UVs based on cylindrical projection
  mesh.vertices.forEach(vertex => {
    const pos = new Vector3(vertex.x, vertex.y, vertex.z);
    // const _radius = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
    const theta = Math.atan2(pos.z, pos.x);
    const height = pos.y;
    
    // Convert to UV coordinates
    let u = (theta + Math.PI) / (2 * Math.PI); // [0, 1]
    let v = height; // Use height directly
    
    // Apply rotation if specified
    if (rotation && rotation !== 0) {
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
      u = u * (scale ?? 1) + (offset?.u ?? 0);
      v = v * (scale ?? 1) + (offset?.v ?? 0);
      
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
      if (flipU) u = 1 - u;
      if (flipV) v = -v;
      
      // Apply scale and offset
      u = u * (scale ?? 1) + (offset?.u ?? 0);
      v = v * (scale ?? 1) + (offset?.v ?? 0);
      
      // Update UV
      vertex.uv = { u, v };
    });
  }
  
  return mesh;
} 