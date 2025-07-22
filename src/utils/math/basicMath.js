/**
 * @fileoverview Basic Math Operations
 * Basic mathematical utility functions for the 3D editor
 */

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Smooth interpolation using smoothstep
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Smoothly interpolated value
 */
export function smoothLerp(a, b, t) {
  const smoothT = t * t * (3 - 2 * t);
  return lerp(a, b, smoothT);
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} Radians
 */
export function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param {number} radians - Radians
 * @returns {number} Degrees
 */
export function radToDeg(radians) {
  return radians * 180 / Math.PI;
}

/**
 * Check if a value is approximately equal to another
 * @param {number} a - First value
 * @param {number} b - Second value
 * @param {number} epsilon - Tolerance for comparison
 * @returns {boolean} True if values are approximately equal
 */
export function approximately(a, b, epsilon = 0.0001) {
  return Math.abs(a - b) < epsilon;
}

/**
 * Round to a specific number of decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export function roundTo(value, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Get the sign of a number
 * @param {number} value - Value to get sign of
 * @returns {number} Sign (-1, 0, or 1)
 */
export function sign(value) {
  return value > 0 ? 1 : value < 0 ? -1 : 0;
}

/**
 * Check if a number is between two values (inclusive)
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if value is between min and max
 */
export function isBetween(value, min, max) {
  return value >= min && value <= max;
}

/**
 * Map a value from one range to another
 * @param {number} value - Value to map
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

/**
 * Clamp a value to a range and map it
 * @param {number} value - Value to clamp and map
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Clamped and mapped value
 */
export function clampAndMap(value, inMin, inMax, outMin, outMax) {
  const clamped = clamp(value, inMin, inMax);
  return mapRange(clamped, inMin, inMax, outMin, outMax);
}

/**
 * Calculate the factorial of a number
 * @param {number} n - Number to calculate factorial of
 * @returns {number} Factorial
 */
export function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Calculate the greatest common divisor of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Greatest common divisor
 */
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  
  return a;
}

/**
 * Calculate the least common multiple of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Least common multiple
 */
export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * Check if a number is prime
 * @param {number} n - Number to check
 * @returns {boolean} True if number is prime
 */
export function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  const sqrt = Math.sqrt(n);
  for (let i = 3; i <= sqrt; i += 2) {
    if (n % i === 0) return false;
  }
  
  return true;
}

/**
 * Generate a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function random(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
  return Math.floor(random(min, max + 1));
}

/**
 * Generate a random boolean
 * @param {number} [probability=0.5] - Probability of true
 * @returns {boolean} Random boolean
 */
export function randomBool(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * Generate a random element from an array
 * @param {Array} array - Array to pick from
 * @returns {*} Random element
 */
export function randomChoice(array) {
  if (array.length === 0) return undefined;
  return array[randomInt(0, array.length - 1)];
}

/**
 * Shuffle an array in place
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array (same reference)
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generate a random color in hex format
 * @returns {string} Random hex color
 */
export function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Convert a number to a percentage string
 * @param {number} value - Value to convert
 * @param {number} [decimals=1] - Number of decimal places
 * @returns {string} Percentage string
 */
export function toPercentage(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Convert a percentage string to a number
 * @param {string} percentage - Percentage string (e.g., "50%")
 * @returns {number} Number value
 */
export function fromPercentage(percentage) {
  return parseFloat(percentage.replace('%', '')) / 100;
} 