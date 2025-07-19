/**
 * Interface representing a UV coordinate
 */
export interface UVCoord {
  /** U coordinate (horizontal, 0-1) */
  u: number;
  /** V coordinate (vertical, 0-1) */
  v: number;
}

/**
 * Creates a new UV coordinate
 * @param u U coordinate (horizontal, 0-1)
 * @param v V coordinate (vertical, 0-1)
 * @returns A new UV coordinate
 */
export function createUV(u: number, v: number): UVCoord {
  return { u, v };
}

/**
 * Clones a UV coordinate
 * @param uv The UV coordinate to clone
 * @returns A new UV coordinate with the same values
 */
export function cloneUV(uv: UVCoord): UVCoord {
  return { u: uv.u, v: uv.v };
}

/**
 * Adds two UV coordinates
 * @param a First UV coordinate
 * @param b Second UV coordinate
 * @returns A new UV coordinate with the sum of the components
 */
export function addUV(a: UVCoord, b: UVCoord): UVCoord {
  return { u: a.u + b.u, v: a.v + b.v };
}

/**
 * Subtracts one UV coordinate from another
 * @param a First UV coordinate
 * @param b Second UV coordinate to subtract from the first
 * @returns A new UV coordinate with the difference of the components
 */
export function subtractUV(a: UVCoord, b: UVCoord): UVCoord {
  return { u: a.u - b.u, v: a.v - b.v };
}

/**
 * Multiplies a UV coordinate by a scalar
 * @param uv The UV coordinate
 * @param scalar The scalar value
 * @returns A new UV coordinate with scaled components
 */
export function multiplyUV(uv: UVCoord, scalar: number): UVCoord {
  return { u: uv.u * scalar, v: uv.v * scalar };
}

/**
 * Calculates the distance between two UV coordinates
 * @param a First UV coordinate
 * @param b Second UV coordinate
 * @returns The Euclidean distance between the coordinates
 */
export function distanceUV(a: UVCoord, b: UVCoord): number {
  const du = a.u - b.u;
  const dv = a.v - b.v;
  return Math.sqrt(du * du + dv * dv);
}

/**
 * Linearly interpolates between two UV coordinates
 * @param a First UV coordinate
 * @param b Second UV coordinate
 * @param t Interpolation factor (0-1)
 * @returns A new UV coordinate interpolated between a and b
 */
export function lerpUV(a: UVCoord, b: UVCoord, t: number): UVCoord {
  const s = Math.max(0, Math.min(1, t)); // Clamp t to [0,1]
  return {
    u: a.u + (b.u - a.u) * s,
    v: a.v + (b.v - a.v) * s
  };
}

/**
 * Wraps UV coordinates to the [0,1] range
 * @param uv The UV coordinate to wrap
 * @returns A new UV coordinate with components wrapped to [0,1]
 */
export function wrapUV(uv: UVCoord): UVCoord {
  return {
    u: uv.u - Math.floor(uv.u),
    v: uv.v - Math.floor(uv.v)
  };
}

/**
 * Clamps UV coordinates to the [0,1] range
 * @param uv The UV coordinate to clamp
 * @returns A new UV coordinate with components clamped to [0,1]
 */
export function clampUV(uv: UVCoord): UVCoord {
  return {
    u: Math.max(0, Math.min(1, uv.u)),
    v: Math.max(0, Math.min(1, uv.v))
  };
}

/**
 * Checks if two UV coordinates are approximately equal
 * @param a First UV coordinate
 * @param b Second UV coordinate
 * @param epsilon Tolerance for equality check
 * @returns Whether the coordinates are approximately equal
 */
export function equalsUV(a: UVCoord, b: UVCoord, epsilon: number = 1e-6): boolean {
  return Math.abs(a.u - b.u) < epsilon && Math.abs(a.v - b.v) < epsilon;
}
