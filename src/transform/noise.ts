// Legacy exports for backward compatibility
import { EditableMesh } from '../core/EditableMesh.ts';
import { VertexNoiseOptions, FaceDisplacementOptions, NoiseOptions } from './noise/types';
import { applyVertexNoise, applyFractalNoise } from './noise/vertexNoise';
import { applyFaceDisplacement, applyCellularNoise, applyTurbulenceNoise } from './noise/faceNoise';

export type {
  NoiseOptions,
  VertexNoiseOptions,
  FaceDisplacementOptions
};

/**
 * Applies noise to mesh based on type
 */
export function applyNoise(
  mesh: EditableMesh,
  noiseType: 'vertex' | 'face' | 'fractal' | 'cellular' | 'turbulence',
  options: VertexNoiseOptions | FaceDisplacementOptions | NoiseOptions = {}
): EditableMesh {
  switch (noiseType) {
    case 'vertex':
      return applyVertexNoise(mesh, options as VertexNoiseOptions);
    
    case 'face':
      return applyFaceDisplacement(mesh, options as FaceDisplacementOptions);
    
    case 'fractal':
      return applyFractalNoise(mesh, options as VertexNoiseOptions);
    
    case 'cellular':
      return applyCellularNoise(mesh, options as NoiseOptions);
    
    case 'turbulence':
      return applyTurbulenceNoise(mesh, options as NoiseOptions);
    
    default:
      throw new Error(`Unknown noise type: ${noiseType}`);
  }
}

// Re-export main functions for backward compatibility
export { applyVertexNoise } from './noise/vertexNoise';
export { applyFaceDisplacement, applyCellularNoise, applyTurbulenceNoise } from './noise/faceNoise';
export { applyFractalNoise } from './noise/vertexNoise'; 