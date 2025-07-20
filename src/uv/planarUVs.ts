import { EditableMesh } from '../core/EditableMesh.ts';
import { UVGenerationParams } from './types';

/**
 * Generates planar UV coordinates for a mesh
 * @param mesh The mesh to generate UVs for
 * @param projectionAxis The axis to project along
 * @param params UV generation parameters
 * @returns The mesh with generated UVs
 */
export function generatePlanarUVs(
  mesh: EditableMesh,
  projectionAxis: 'x' | 'y' | 'z',
  params: UVGenerationParams
): EditableMesh {
  const { scale, offset, normalize, flipU, flipV, rotation } = params;
  
  // Find bounds for normalization
  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
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