import { Vector3 } from 'three';
import { EditableMesh } from '../../core/index';
import { FaceDisplacementOptions, NoiseOptions } from './types';
import { PerlinNoise, clampValue } from './perlinNoise';

/**
 * Applies face displacement using noise
 */
export function applyFaceDisplacement(
  mesh: EditableMesh,
  options: FaceDisplacementOptions = {}
): EditableMesh {
  const scale = options.scale ?? 1.0;
  const intensity = options.intensity ?? 0.1;
  const seed = options.seed ?? 0;
  const octaves = options.octaves ?? 1;
  const persistence = options.persistence ?? 0.5;
  const lacunarity = options.lacunarity ?? 2.0;
  const direction = options.direction ?? new Vector3(0, 1, 0);
  // const _allFaces = options.allFaces ?? true;
  const threshold = options.threshold ?? 0;
  // const _preserveNormals = options.preserveNormals ?? true;
  // const _keepOriginal = options.keepOriginal ?? true;
  // const _materialIndex = options.materialIndex ?? 0;

  // Normalize direction
  direction.normalize();

  // Create noise generator
  const noise = new PerlinNoise(seed);

  // Apply displacement to faces
  for (let i = 0; i < mesh.getFaceCount(); i++) {
    const face = mesh.getFace(i);
    if (!face) continue;

    // Calculate face center
    const faceCenter = calculateFaceCenter(mesh, face);
    
    // Calculate noise value at face center
    const noiseValue = noise.fractal(
      faceCenter.x * scale,
      faceCenter.y * scale,
      faceCenter.z * scale,
      octaves,
      persistence,
      lacunarity
    );

    // Apply threshold
    if (Math.abs(noiseValue) < threshold) continue;

    // Calculate displacement
    const displacement = direction.clone().multiplyScalar(noiseValue * intensity);

    // Apply displacement to face vertices
    for (const vertexIndex of face.vertices) {
      const vertex = mesh.getVertex(vertexIndex);
      if (!vertex) continue;

      vertex.x = clampValue(vertex.x + displacement.x);
      vertex.y = clampValue(vertex.y + displacement.y);
      vertex.z = clampValue(vertex.z + displacement.z);
    }
  }

  return mesh;
}

/**
 * Applies cellular noise to mesh
 */
export function applyCellularNoise(
  mesh: EditableMesh,
  options: NoiseOptions = {}
): EditableMesh {
  const scale = options.scale ?? 1.0;
  const intensity = options.intensity ?? 0.1;
  const seed = options.seed ?? 0;
  const octaves = options.octaves ?? 1;
  const persistence = options.persistence ?? 0.5;
  const lacunarity = options.lacunarity ?? 2.0;

  // Create noise generator
  const noise = new PerlinNoise(seed);

  // Apply cellular noise to vertices
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate cellular noise value (unused - kept for future implementation)
    // const noiseValue = noise.fractal(
    //   vertex.x * scale,
    //   vertex.y * scale,
    //   vertex.z * scale,
    //   octaves,
    //   persistence,
    //   lacunarity
    // );

    // Apply cellular displacement
    const displacement = new Vector3(
      noise.fractal(vertex.x * scale * 1.1, vertex.y * scale, vertex.z * scale, octaves, persistence, lacunarity),
      noise.fractal(vertex.x * scale, vertex.y * scale * 1.1, vertex.z * scale, octaves, persistence, lacunarity),
      noise.fractal(vertex.x * scale, vertex.y * scale, vertex.z * scale * 1.1, octaves, persistence, lacunarity)
    );

    vertex.x = clampValue(vertex.x + displacement.x * intensity);
    vertex.y = clampValue(vertex.y + displacement.y * intensity);
    vertex.z = clampValue(vertex.z + displacement.z * intensity);
  }

  return mesh;
}

/**
 * Applies turbulence noise to mesh
 */
export function applyTurbulenceNoise(
  mesh: EditableMesh,
  options: NoiseOptions = {}
): EditableMesh {
  const scale = options.scale ?? 1.0;
  const intensity = options.intensity ?? 0.1;
  const seed = options.seed ?? 0;
  const octaves = options.octaves ?? 4;
  const persistence = options.persistence ?? 0.5;
  const lacunarity = options.lacunarity ?? 2.0;

  // Create noise generator
  const noise = new PerlinNoise(seed);

  // Apply turbulence noise to vertices
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate turbulence noise value
    let turbulence = 0;
    let frequency = 1;
    let amplitude = 1;

    for (let j = 0; j < octaves; j++) {
      const noiseValue = noise.fractal(
        vertex.x * scale * frequency,
        vertex.y * scale * frequency,
        vertex.z * scale * frequency,
        1,
        persistence,
        lacunarity
      );
      
      turbulence += Math.abs(noiseValue) * amplitude;
      frequency *= lacunarity;
      amplitude *= persistence;
    }

    // Apply turbulence displacement
    const displacement = new Vector3(
      turbulence * intensity,
      turbulence * intensity,
      turbulence * intensity
    );

    vertex.x = clampValue(vertex.x + displacement.x);
    vertex.y = clampValue(vertex.y + displacement.y);
    vertex.z = clampValue(vertex.z + displacement.z);
  }

  return mesh;
}

/**
 * Calculate face center
 */
export function calculateFaceCenter(mesh: EditableMesh, face: any): Vector3 {
  const center = new Vector3();
  let vertexCount = 0;
  
  face.vertices.forEach((vertexIndex: number) => {
    const vertex = mesh.getVertex(vertexIndex);
    if (vertex) {
      center.add(new Vector3(vertex.x, vertex.y, vertex.z));
      vertexCount++;
    }
  });
  
  return vertexCount > 0 ? center.divideScalar(vertexCount) : center;
} 