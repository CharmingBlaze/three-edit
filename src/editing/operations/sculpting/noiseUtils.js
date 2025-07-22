/**
 * @fileoverview Noise generation utilities
 * Provides utility functions for generating various types of noise
 */

/**
 * Generate simple 3D noise
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @param {number} seed - Random seed
 * @returns {number} Noise value
 */
export function simpleNoise3D(x, y, z, seed) {
  const hash = (x, y, z) => {
    const n = x + y * 57 + z * 131 + seed * 13;
    return (n << 13) ^ n;
  };
  
  const n = hash(x, y, z);
  return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
}

/**
 * Generate Perlin-like noise value
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @param {number} seed - Random seed
 * @returns {number} Normalized noise value (-1 to 1)
 */
export function perlinNoise3D(x, y, z, seed) {
  // Simplified Perlin noise implementation
  const noise = simpleNoise3D(x, y, z, seed);
  return (noise / 0x7fffffff) * 2 - 1;
} 