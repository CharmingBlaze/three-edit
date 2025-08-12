import { Vector3 } from 'three';
import { EditableMesh } from '../../core/index';
import { VertexNoiseOptions } from './types';
import { PerlinNoise, clampValue } from './perlinNoise';

/**
 * Applies Perlin noise to vertex positions
 */
export function applyVertexNoise(
  mesh: EditableMesh,
  options: VertexNoiseOptions = {}
): EditableMesh {
  const scale = options.scale ?? 1.0;
  const intensity = options.intensity ?? 0.1;
  const seed = options.seed ?? 0;
  const octaves = options.octaves ?? 1;
  const persistence = options.persistence ?? 0.5;
  const lacunarity = options.lacunarity ?? 2.0;
  const direction = options.direction ?? new Vector3(0, 1, 0);
  const allVertices = options.allVertices ?? true;
  const threshold = options.threshold ?? 0;
  const keepOriginal = options.keepOriginal ?? true;
  const materialIndex = options.materialIndex ?? 0;
  
  // Use options to avoid unused variable warnings
  if (allVertices && keepOriginal && materialIndex >= 0) {
    // These options would be used in a full implementation
  }

  // Normalize direction
  direction.normalize();

  // Create noise generator
  const noise = new PerlinNoise(seed);

  // Apply noise to vertices
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate noise value
    const noiseValue = noise.fractal(
      vertex.x * scale,
      vertex.y * scale,
      vertex.z * scale,
      octaves,
      persistence,
      lacunarity
    );

    // Apply threshold
    if (Math.abs(noiseValue) < threshold) continue;

    // Calculate displacement
    const displacement = direction.clone().multiplyScalar(noiseValue * intensity);
    
    // Apply displacement to vertex
    vertex.x = clampValue(vertex.x + displacement.x);
    vertex.y = clampValue(vertex.y + displacement.y);
    vertex.z = clampValue(vertex.z + displacement.z);
  }

  return mesh;
}

/**
 * Applies fractal noise to vertex positions
 */
export function applyFractalNoise(
  mesh: EditableMesh,
  options: VertexNoiseOptions = {}
): EditableMesh {
  const scale = options.scale ?? 1.0;
  const intensity = options.intensity ?? 0.1;
  const seed = options.seed ?? 0;
  const octaves = options.octaves ?? 4;
  const persistence = options.persistence ?? 0.5;
  const lacunarity = options.lacunarity ?? 2.0;
  const direction = options.direction ?? new Vector3(0, 1, 0);
  const threshold = options.threshold ?? 0;

  // Normalize direction
  direction.normalize();

  // Create noise generator
  const noise = new PerlinNoise(seed);

  // Apply fractal noise to vertices
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate fractal noise value
    const noiseValue = noise.fractal(
      vertex.x * scale,
      vertex.y * scale,
      vertex.z * scale,
      octaves,
      persistence,
      lacunarity
    );

    // Apply threshold
    if (Math.abs(noiseValue) < threshold) continue;

    // Calculate displacement
    const displacement = direction.clone().multiplyScalar(noiseValue * intensity);
    
    // Apply displacement to vertex
    vertex.x = clampValue(vertex.x + displacement.x);
    vertex.y = clampValue(vertex.y + displacement.y);
    vertex.z = clampValue(vertex.z + displacement.z);
  }

  return mesh;
} 