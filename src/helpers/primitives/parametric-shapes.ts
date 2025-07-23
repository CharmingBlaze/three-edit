/**
 * Parametric Shape Helpers - Mathematical surfaces and curves
 * These provide functions for creating shapes based on mathematical equations
 */

import { Vector3 } from 'three';
import { Vertex, Face } from '../../core';
import { PrimitiveResult } from './types';

/**
 * Create a parametric surface
 */
export function createParametricSurface(
  uMin: number,
  uMax: number,
  vMin: number,
  vMax: number,
  uSegments: number,
  vSegments: number,
  surfaceFunction: (u: number, v: number) => Vector3,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices: Vertex[] = [];
  const faces: Face[] = [];
  
  for (let i = 0; i <= uSegments; i++) {
    const u = uMin + (uMax - uMin) * (i / uSegments);
    
    for (let j = 0; j <= vSegments; j++) {
      const v = vMin + (vMax - vMin) * (j / vSegments);
      const position = surfaceFunction(u, v);
      
      vertices.push(new Vertex(position.x, position.y, position.z));
    }
  }
  
  // Create faces
  for (let i = 0; i < uSegments; i++) {
    for (let j = 0; j < vSegments; j++) {
      const a = i * (vSegments + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (vSegments + 1) + j;
      const d = c + 1;
      
      faces.push(new Face([a, b, c], [], { materialIndex }));
      faces.push(new Face([b, d, c], [], { materialIndex }));
    }
  }
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
}

/**
 * Create a Klein bottle
 */
export function createKleinBottle(
  radius: number = 0.5,
  uSegments: number = 16,
  vSegments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return createParametricSurface(
    0, Math.PI * 2,
    0, Math.PI * 2,
    uSegments, vSegments,
    (u, v) => {
      const x = radius * (1 + Math.cos(v)) * Math.cos(u);
      const y = radius * (1 + Math.cos(v)) * Math.sin(u);
      const z = radius * Math.sin(v) * Math.cos(u / 2);
      return new Vector3(x, y, z);
    },
    materialIndex
  );
}

/**
 * Create a helicoid
 */
export function createHelicoid(
  radius: number = 1,
  height: number = 2,
  turns: number = 2,
  uSegments: number = 16,
  vSegments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return createParametricSurface(
    0, turns * Math.PI * 2,
    0, radius,
    uSegments, vSegments,
    (u, v) => {
      const x = v * Math.cos(u);
      const y = v * Math.sin(u);
      const z = (u / (turns * Math.PI * 2)) * height - height / 2;
      return new Vector3(x, y, z);
    },
    materialIndex
  );
}

/**
 * Create a catenoid
 */
export function createCatenoid(
  radius: number = 1,
  height: number = 2,
  uSegments: number = 16,
  vSegments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return createParametricSurface(
    0, Math.PI * 2,
    -height / 2, height / 2,
    uSegments, vSegments,
    (u, v) => {
      const x = radius * Math.cosh(v / radius) * Math.cos(u);
      const y = radius * Math.cosh(v / radius) * Math.sin(u);
      const z = v;
      return new Vector3(x, y, z);
    },
    materialIndex
  );
}

/**
 * Create a hyperboloid
 */
export function createHyperboloid(
  a: number = 1,
  b: number = 1,
  c: number = 1,
  uSegments: number = 16,
  vSegments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return createParametricSurface(
    0, Math.PI * 2,
    -2, 2,
    uSegments, vSegments,
    (u, v) => {
      const x = a * Math.cosh(v) * Math.cos(u);
      const y = b * Math.cosh(v) * Math.sin(u);
      const z = c * Math.sinh(v);
      return new Vector3(x, y, z);
    },
    materialIndex
  );
}

/**
 * Create a paraboloid
 */
export function createParaboloid(
  a: number = 1,
  b: number = 1,
  height: number = 2,
  uSegments: number = 16,
  vSegments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return createParametricSurface(
    0, Math.PI * 2,
    0, Math.sqrt(height),
    uSegments, vSegments,
    (u, v) => {
      const x = v * Math.cos(u);
      const y = v * Math.sin(u);
      const z = a * x * x + b * y * y;
      return new Vector3(x, y, z);
    },
    materialIndex
  );
}

/**
 * Create a saddle surface (hyperbolic paraboloid)
 */
export function createSaddle(
  a: number = 1,
  b: number = 1,
  size: number = 2,
  uSegments: number = 16,
  vSegments: number = 16,
  materialIndex: number = 0
): PrimitiveResult {
  return createParametricSurface(
    -size, size,
    -size, size,
    uSegments, vSegments,
    (u, v) => {
      const x = u;
      const y = v;
      const z = a * u * u - b * v * v;
      return new Vector3(x, y, z);
    },
    materialIndex
  );
}

/**
 * Create a spiral surface
 */
export function createSpiral(
  radius: number = 1,
  height: number = 2,
  turns: number = 3,
  uSegments: number = 16,
  vSegments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return createParametricSurface(
    0, turns * Math.PI * 2,
    0, radius,
    uSegments, vSegments,
    (u, v) => {
      const x = v * Math.cos(u);
      const y = v * Math.sin(u);
      const z = (u / (turns * Math.PI * 2)) * height;
      return new Vector3(x, y, z);
    },
    materialIndex
  );
}

/**
 * Create a wave surface
 */
export function createWave(
  width: number = 2,
  height: number = 2,
  amplitude: number = 0.5,
  frequency: number = 2,
  uSegments: number = 16,
  vSegments: number = 16,
  materialIndex: number = 0
): PrimitiveResult {
  return createParametricSurface(
    -width / 2, width / 2,
    -height / 2, height / 2,
    uSegments, vSegments,
    (u, v) => {
      const x = u;
      const y = v;
      const z = amplitude * Math.sin(frequency * u) * Math.cos(frequency * v);
      return new Vector3(x, y, z);
    },
    materialIndex
  );
}

/**
 * Create a rippled surface
 */
export function createRipple(
  width: number = 2,
  height: number = 2,
  amplitude: number = 0.3,
  frequency: number = 4,
  uSegments: number = 16,
  vSegments: number = 16,
  materialIndex: number = 0
): PrimitiveResult {
  return createParametricSurface(
    -width / 2, width / 2,
    -height / 2, height / 2,
    uSegments, vSegments,
    (u, v) => {
      const distance = Math.sqrt(u * u + v * v);
      const x = u;
      const y = v;
      const z = amplitude * Math.sin(frequency * distance) / (1 + distance);
      return new Vector3(x, y, z);
    },
    materialIndex
  );
}

/**
 * Create a corkscrew surface
 */
export function createCorkscrew(
  radius: number = 1,
  height: number = 2,
  turns: number = 4,
  uSegments: number = 16,
  vSegments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return createParametricSurface(
    0, turns * Math.PI * 2,
    0, radius,
    uSegments, vSegments,
    (u, v) => {
      const x = v * Math.cos(u);
      const y = v * Math.sin(u);
      const z = (u / (turns * Math.PI * 2)) * height + v * Math.sin(u * 2);
      return new Vector3(x, y, z);
    },
    materialIndex
  );
}

/**
 * Create a seashell surface
 */
export function createSeashell(
  radius: number = 1,
  height: number = 2,
  turns: number = 3,
  uSegments: number = 16,
  vSegments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return createParametricSurface(
    0, turns * Math.PI * 2,
    0, radius,
    uSegments, vSegments,
    (u, v) => {
      const x = v * Math.cos(u) * (1 + Math.cos(u * 2));
      const y = v * Math.sin(u) * (1 + Math.cos(u * 2));
      const z = (u / (turns * Math.PI * 2)) * height + v * Math.sin(u);
      return new Vector3(x, y, z);
    },
    materialIndex
  );
} 