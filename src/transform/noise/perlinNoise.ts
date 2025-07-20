import { NoiseGenerator } from './types';

/**
 * Simple Perlin noise implementation
 */
export class PerlinNoise implements NoiseGenerator {
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
export function clampValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  // Clamp to reasonable bounds to prevent extreme values
  return Math.max(-1000, Math.min(1000, value));
} 