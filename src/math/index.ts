/**
 * Unified Math System for Three-Edit
 * 
 * This module consolidates all mathematical operations from scattered files
 * into a single, well-organized system. It provides:
 * 
 * - Mathematical constants
 * - Vector operations
 * - Triangle calculations
 * - General math utilities
 * 
 * All functions are pure, well-typed, and follow consistent patterns.
 */

// Export constants
export * from './constants';

// Export vector operations
export * from './vector';

// Export triangle operations
export * from './triangle';

// Re-export commonly used Three.js types for convenience
export type { Vector3 } from 'three';

/**
 * General math utilities that don't fit into vector or triangle categories
 */

/**
 * Round a number to a specified number of decimal places
 * @param value Number to round
 * @param decimals Number of decimal places (default: 6)
 * @returns Rounded number
 */
export function roundTo(value: number, decimals: number = 6): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Clamp a value between min and max
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param a First value
 * @param b Second value
 * @param t Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param radians Angle in radians
 * @returns Angle in degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Check if two numbers are close to each other within a tolerance
 * @param a First number
 * @param b Second number
 * @param tolerance Tolerance for comparison
 * @returns True if numbers are close
 */
export function isClose(a: number, b: number, tolerance: number = 1e-6): boolean {
  return Math.abs(a - b) < tolerance;
}

/**
 * Check if a number is approximately zero
 * @param value Number to check
 * @param tolerance Tolerance for comparison
 * @returns True if number is approximately zero
 */
export function isZero(value: number, tolerance: number = 1e-6): boolean {
  return Math.abs(value) < tolerance;
}

/**
 * Get the sign of a number (-1, 0, or 1)
 * @param value Number to get sign for
 * @returns Sign of the number
 */
export function sign(value: number): number {
  return value > 0 ? 1 : value < 0 ? -1 : 0;
}

/**
 * Normalize a value from one range to another
 * @param value Value to normalize
 * @param min Minimum of source range
 * @param max Maximum of source range
 * @returns Normalized value (0-1)
 */
export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

/**
 * Map a normalized value (0-1) to a new range
 * @param value Normalized value (0-1)
 * @param inMin Minimum of input range
 * @param inMax Maximum of input range
 * @param outMin Minimum of output range
 * @param outMax Maximum of output range
 * @returns Mapped value
 */
export function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return outMin + (outMax - outMin) * normalize(value, inMin, inMax);
}

/**
 * Modulo operation that handles negative numbers correctly
 * @param n Dividend
 * @param d Divisor
 * @returns Modulo result
 */
export function modulo(n: number, d: number): number {
  return ((n % d) + d) % d;
}

/**
 * Wrap a value to a range
 * @param value Value to wrap
 * @param min Minimum of range
 * @param max Maximum of range
 * @returns Wrapped value
 */
export function wrap(value: number, min: number, max: number): number {
  const range = max - min;
  if (range === 0) return min;
  
  const normalized = (value - min) / range;
  const wrapped = modulo(normalized, 1);
  return min + wrapped * range;
}

/**
 * Smoothstep interpolation (smooth S-curve)
 * @param edge0 Lower edge
 * @param edge1 Upper edge
 * @param x Value to interpolate
 * @returns Smoothly interpolated value
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Smootherstep interpolation (even smoother S-curve)
 * @param edge0 Lower edge
 * @param edge1 Upper edge
 * @param x Value to interpolate
 * @returns Smoothly interpolated value
 */
export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Check if a number is finite and not NaN
 * @param value Number to check
 * @returns True if number is valid
 */
export function isValidNumber(value: number): boolean {
  return Number.isFinite(value) && !Number.isNaN(value);
}

/**
 * Get the minimum of multiple numbers
 * @param values Numbers to compare
 * @returns Minimum value
 */
export function min(...values: number[]): number {
  return Math.min(...values);
}

/**
 * Get the maximum of multiple numbers
 * @param values Numbers to compare
 * @returns Maximum value
 */
export function max(...values: number[]): number {
  return Math.max(...values);
}

/**
 * Calculate the average of multiple numbers
 * @param values Numbers to average
 * @returns Average value
 */
export function average(...values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate the sum of multiple numbers
 * @param values Numbers to sum
 * @returns Sum of values
 */
export function sum(...values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0);
}

/**
 * Calculate the product of multiple numbers
 * @param values Numbers to multiply
 * @returns Product of values
 */
export function product(...values: number[]): number {
  return values.reduce((prod, val) => prod * val, 1);
} 