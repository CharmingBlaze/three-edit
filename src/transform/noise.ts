import { Vector3, MathUtils } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';

/**
 * Options for noise operations
 */
export interface NoiseOptions {
  /** Scale of the noise (default: 1.0) */
  scale?: number;
  /** Intensity of the noise (default: 0.1) */
  intensity?: number;
  /** Seed for the noise generator (default: 0) */
  seed?: number;
  /** Number of octaves for fractal noise (default: 1) */
  octaves?: number;
  /** Persistence for fractal noise (default: 0.5) */
  persistence?: number;
  /** Lacunarity for fractal noise (default: 2.0) */
  lacunarity?: number;
  /** Whether to keep original geometry */
  keepOriginal?: boolean;
  /** Material index for new faces */
  materialIndex?: number;
}

/**
 * Options for vertex noise operations
 */
export interface VertexNoiseOptions extends NoiseOptions {
  /** Direction of the noise displacement */
  direction?: Vector3;
  /** Whether to apply noise to all vertices */
  allVertices?: boolean;
  /** Minimum noise threshold */
  threshold?: number;
}

/**
 * Options for face displacement operations
 */
export interface FaceDisplacementOptions extends NoiseOptions {
  /** Direction of the displacement */
  direction?: Vector3;
  /** Whether to displace all faces */
  allFaces?: boolean;
  /** Minimum displacement threshold */
  threshold?: number;
  /** Whether to preserve face normals */
  preserveNormals?: boolean;
}

/**
 * Simple Perlin noise implementation
 */
class PerlinNoise {
  private permutation: number[];
  private p: number[];

  constructor(seed: number = 0) {
    this.permutation = [];
    this.p = [];
    
    // Initialize permutation table
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }
    
    // Shuffle based on seed
    let currentSeed = seed;
    for (let i = 255; i > 0; i--) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      const j = Math.floor((currentSeed / 233280) * (i + 1));
      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }
    
    // Create p array
    for (let i = 0; i < 512; i++) {
      this.p[i] = this.permutation[i & 255];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number): number {
    return (hash & 1) === 0 ? x : -x;
  }

  noise(x: number, y: number = 0, z: number = 0): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x),
      this.grad(this.p[BA], x - 1)),
      this.lerp(u, this.grad(this.p[AB], x),
        this.grad(this.p[BB], x - 1))),
      this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x),
        this.grad(this.p[BA + 1], x - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x),
          this.grad(this.p[BB + 1], x - 1))));
  }

  fractal(x: number, y: number = 0, z: number = 0, octaves: number = 1, persistence: number = 0.5, lacunarity: number = 2.0): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }
}

/**
 * Ensures a value is finite and within reasonable bounds
 */
function clampValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  // Clamp to reasonable bounds to prevent extreme values
  return Math.max(-1000, Math.min(1000, value));
}

/**
 * Applies Perlin noise to vertex positions
 * @param mesh The mesh to apply noise to
 * @param options Options for the noise operation
 * @returns The modified mesh
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

    // Apply displacement with validation
    vertex.x = clampValue(vertex.x + displacement.x);
    vertex.y = clampValue(vertex.y + displacement.y);
    vertex.z = clampValue(vertex.z + displacement.z);
  }

  return mesh;
}

/**
 * Applies displacement mapping to face normals
 * @param mesh The mesh to apply displacement to
 * @param options Options for the displacement operation
 * @returns The modified mesh
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
  const allFaces = options.allFaces ?? true;
  const threshold = options.threshold ?? 0;
  const preserveNormals = options.preserveNormals ?? true;
  const keepOriginal = options.keepOriginal ?? true;
  const materialIndex = options.materialIndex ?? 0;

  // Normalize direction
  direction.normalize();

  // Create noise generator
  const noise = new PerlinNoise(seed);

  // Apply displacement to faces
  for (let i = 0; i < mesh.getFaceCount(); i++) {
    const face = mesh.getFace(i);
    if (!face) continue;

    // Calculate face center
    const faceVertices = face.vertices.map(v => mesh.getVertex(v)).filter(Boolean) as Vertex[];
    if (faceVertices.length === 0) continue;

    const center = new Vector3();
    faceVertices.forEach(vertex => {
      center.add(new Vector3(vertex.x, vertex.y, vertex.z));
    });
    center.divideScalar(faceVertices.length);

    // Calculate noise value at face center
    const noiseValue = noise.fractal(
      center.x * scale,
      center.y * scale,
      center.z * scale,
      octaves,
      persistence,
      lacunarity
    );

    // Apply threshold
    if (Math.abs(noiseValue) < threshold) continue;

    // Calculate displacement
    const displacement = direction.clone().multiplyScalar(noiseValue * intensity);

    // Apply displacement to face vertices with validation
    faceVertices.forEach(vertex => {
      vertex.x = clampValue(vertex.x + displacement.x);
      vertex.y = clampValue(vertex.y + displacement.y);
      vertex.z = clampValue(vertex.z + displacement.z);
    });

    // Update face normal if preserving normals
    if (preserveNormals && faceVertices.length >= 3) {
      const v1 = faceVertices[0];
      const v2 = faceVertices[1];
      const v3 = faceVertices[2];
      
      const vec1 = new Vector3().subVectors(v2, v1);
      const vec2 = new Vector3().subVectors(v3, v1);
      const normal = new Vector3();
      normal.crossVectors(vec1, vec2).normalize();
      
      face.normal = normal;
    }
  }

  return mesh;
}

/**
 * Applies fractal noise to create terrain-like geometry
 * @param mesh The mesh to apply fractal noise to
 * @param options Options for the fractal noise operation
 * @returns The modified mesh
 */
export function applyFractalNoise(
  mesh: EditableMesh,
  options: NoiseOptions = {}
): EditableMesh {
  const scale = options.scale ?? 1.0;
  const intensity = options.intensity ?? 0.1;
  const seed = options.seed ?? 0;
  const octaves = options.octaves ?? 4;
  const persistence = options.persistence ?? 0.5;
  const lacunarity = options.lacunarity ?? 2.0;
  const keepOriginal = options.keepOriginal ?? true;
  const materialIndex = options.materialIndex ?? 0;

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

    // Apply displacement in Y direction (terrain-like) with validation
    vertex.y = clampValue(vertex.y + noiseValue * intensity);
  }

  return mesh;
}

/**
 * Applies cellular noise for organic patterns
 * @param mesh The mesh to apply cellular noise to
 * @param options Options for the cellular noise operation
 * @returns The modified mesh
 */
export function applyCellularNoise(
  mesh: EditableMesh,
  options: NoiseOptions = {}
): EditableMesh {
  const scale = options.scale ?? 1.0;
  const intensity = options.intensity ?? 0.1;
  const seed = options.seed ?? 0;
  const keepOriginal = options.keepOriginal ?? true;
  const materialIndex = options.materialIndex ?? 0;

  // Create noise generator
  const noise = new PerlinNoise(seed);

  // Apply cellular noise to vertices
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate cellular noise using multiple noise samples
    const noise1 = noise.noise(vertex.x * scale, vertex.y * scale, vertex.z * scale);
    const noise2 = noise.noise(vertex.x * scale * 2, vertex.y * scale * 2, vertex.z * scale * 2);
    const noise3 = noise.noise(vertex.x * scale * 4, vertex.y * scale * 4, vertex.z * scale * 4);
    
    // Combine noise values for cellular effect
    const cellularValue = Math.abs(noise1) + Math.abs(noise2) * 0.5 + Math.abs(noise3) * 0.25;

    // Apply displacement with validation
    vertex.x = clampValue(vertex.x + cellularValue * intensity);
    vertex.y = clampValue(vertex.y + cellularValue * intensity);
    vertex.z = clampValue(vertex.z + cellularValue * intensity);
  }

  return mesh;
}

/**
 * Applies turbulence noise for complex surface detail
 * @param mesh The mesh to apply turbulence noise to
 * @param options Options for the turbulence noise operation
 * @returns The modified mesh
 */
export function applyTurbulenceNoise(
  mesh: EditableMesh,
  options: NoiseOptions = {}
): EditableMesh {
  const scale = options.scale ?? 1.0;
  const intensity = options.intensity ?? 0.1;
  const seed = options.seed ?? 0;
  const octaves = options.octaves ?? 3;
  const persistence = options.persistence ?? 0.5;
  const lacunarity = options.lacunarity ?? 2.0;
  const keepOriginal = options.keepOriginal ?? true;
  const materialIndex = options.materialIndex ?? 0;

  // Create noise generator
  const noise = new PerlinNoise(seed);

  // Apply turbulence noise to vertices
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (!vertex) continue;

    // Calculate turbulence value
    let turbulence = 0;
    let amplitude = 1;
    let frequency = 1;

    for (let j = 0; j < octaves; j++) {
      const noiseValue = noise.noise(
        vertex.x * scale * frequency,
        vertex.y * scale * frequency,
        vertex.z * scale * frequency
      );
      turbulence += Math.abs(noiseValue) * amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    // Apply displacement with validation
    vertex.x = clampValue(vertex.x + turbulence * intensity);
    vertex.y = clampValue(vertex.y + turbulence * intensity);
    vertex.z = clampValue(vertex.z + turbulence * intensity);
  }

  return mesh;
}

/**
 * Generic noise function that can apply different types of noise
 * @param mesh The mesh to apply noise to
 * @param noiseType The type of noise operation
 * @param options Options for the noise operation
 * @returns The modified mesh
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
      return applyFractalNoise(mesh, options as NoiseOptions);
    case 'cellular':
      return applyCellularNoise(mesh, options as NoiseOptions);
    case 'turbulence':
      return applyTurbulenceNoise(mesh, options as NoiseOptions);
    default:
      throw new Error(`Unknown noise type: ${noiseType}`);
  }
} 