/**
 * Complex Shape Helpers - Advanced primitive shapes
 * These provide functions for more complex geometric shapes
 */

import { Vector3 } from 'three';
import { Vertex, Face } from '../../core';
import { PrimitiveResult } from './types';
import * as builders from './geometry-builders';
import * as transforms from './transform-helpers';
import * as uvs from './uv-generators';

/**
 * Create a torus knot (helper version)
 */
export function createTorusKnotHelper(
  radius: number = 0.5,
  tube: number = 0.2,
  p: number = 2,
  q: number = 3,
  radialSegments: number = 8,
  tubularSegments: number = 6,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices: Vertex[] = [];
  const faces: Face[] = [];
  
  for (let i = 0; i <= radialSegments; i++) {
    const u = i / radialSegments * p * Math.PI * 2;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    
    for (let j = 0; j <= tubularSegments; j++) {
      const v = j / tubularSegments * q * Math.PI * 2;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);
      
      const x = (radius + tube * cosV) * cosU;
      const y = (radius + tube * cosV) * sinU;
      const z = tube * sinV;
      
      vertices.push(new Vertex(x, y, z));
    }
  }
  
  // Create faces
  for (let i = 0; i < radialSegments; i++) {
    for (let j = 0; j < tubularSegments; j++) {
      const a = i * (tubularSegments + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (tubularSegments + 1) + j;
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
 * Create a Mobius strip (helper version)
 */
export function createMobiusStripHelper(
  radius: number = 0.5,
  tube: number = 0.2,
  radialSegments: number = 8,
  tubularSegments: number = 6,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices: Vertex[] = [];
  const faces: Face[] = [];
  
  for (let i = 0; i <= radialSegments; i++) {
    const u = i / radialSegments * Math.PI * 2;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    
    for (let j = 0; j <= tubularSegments; j++) {
      const v = j / tubularSegments * Math.PI * 2;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);
      
      const x = (radius + tube * cosV * cosU) * cosU;
      const y = (radius + tube * cosV * cosU) * sinU;
      const z = tube * sinV;
      
      vertices.push(new Vertex(x, y, z));
    }
  }
  
  // Create faces
  for (let i = 0; i < radialSegments; i++) {
    for (let j = 0; j < tubularSegments; j++) {
      const a = i * (tubularSegments + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (tubularSegments + 1) + j;
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
 * Create a pipe (helper version)
 */
export function createPipeHelper(
  radius: number = 0.5,
  height: number = 1,
  thickness: number = 0.1,
  radialSegments: number = 8,
  heightSegments: number = 1,
  materialIndex: number = 0
): PrimitiveResult {
  const innerRadius = radius - thickness;
  const outerRadius = radius + thickness;
  
  const vertices: Vertex[] = [];
  const faces: Face[] = [];
  
  // Create vertices for inner and outer cylinders
  for (let y = 0; y <= heightSegments; y++) {
    const vertexY = (y / heightSegments - 0.5) * height;
    
    for (let x = 0; x <= radialSegments; x++) {
      const angle = (x / radialSegments) * Math.PI * 2;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      
      // Inner cylinder
      vertices.push(new Vertex(
        innerRadius * cosAngle,
        vertexY,
        innerRadius * sinAngle
      ));
      
      // Outer cylinder
      vertices.push(new Vertex(
        outerRadius * cosAngle,
        vertexY,
        outerRadius * sinAngle
      ));
    }
  }
  
  // Create faces
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const base = (y * (radialSegments + 1) + x) * 2;
      const nextX = (x + 1) % (radialSegments + 1);
      const nextBase = (y * (radialSegments + 1) + nextX) * 2;
      
      // Inner face
      faces.push(new Face([base, nextBase, base + 2], [], { materialIndex }));
      faces.push(new Face([nextBase, nextBase + 2, base + 2], [], { materialIndex }));
      
      // Outer face
      faces.push(new Face([base + 1, base + 3, nextBase + 1], [], { materialIndex }));
      faces.push(new Face([nextBase + 1, base + 3, nextBase + 3], [], { materialIndex }));
      
      // Side faces
      faces.push(new Face([base, base + 1, nextBase], [], { materialIndex }));
      faces.push(new Face([nextBase, base + 1, nextBase + 1], [], { materialIndex }));
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
 * Create a handle (curved pipe) (helper version)
 */
export function createHandleHelper(
  radius: number = 0.5,
  tube: number = 0.1,
  arc: number = Math.PI,
  radialSegments: number = 8,
  tubularSegments: number = 6,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices: Vertex[] = [];
  const faces: Face[] = [];
  
  for (let i = 0; i <= radialSegments; i++) {
    const u = i / radialSegments * arc;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    
    for (let j = 0; j <= tubularSegments; j++) {
      const v = j / tubularSegments * Math.PI * 2;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);
      
      const x = (radius + tube * cosV) * cosU;
      const y = (radius + tube * cosV) * sinU;
      const z = tube * sinV;
      
      vertices.push(new Vertex(x, y, z));
    }
  }
  
  // Create faces
  for (let i = 0; i < radialSegments; i++) {
    for (let j = 0; j < tubularSegments; j++) {
      const a = i * (tubularSegments + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (tubularSegments + 1) + j;
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
 * Create a greeble block (detailed block with protrusions)
 */
export function createGreebleBlockHelper(
  width: number = 1,
  height: number = 1,
  depth: number = 1,
  detailLevel: number = 3,
  materialIndex: number = 0
): PrimitiveResult {
  const result = builders.buildBox(width, height, depth, detailLevel, detailLevel, detailLevel, materialIndex);
  
  // Add random protrusions (simplified)
  // This is a placeholder for actual greeble generation
  transforms.normalizeVertices(result.vertices);
  
  return result;
}

/**
 * Create a low-poly sphere
 */
export function createLowPolySphereHelper(
  radius: number = 0.5,
  detailLevel: number = 2,
  materialIndex: number = 0
): PrimitiveResult {
  // Use icosahedron as base and subdivide
  const result = builders.buildOctahedron(radius, materialIndex);
  
  // Subdivide faces for more detail
  // This is a simplified version - would need proper subdivision
  transforms.normalizeVertices(result.vertices);
  
  return result;
}

/**
 * Create an arrow
 */
export function createArrowHelper(
  length: number = 1,
  headLength: number = 0.2,
  headWidth: number = 0.1,
  shaftWidth: number = 0.05,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices: Vertex[] = [];
  const faces: Face[] = [];
  
  // Shaft vertices
  const halfShaftWidth = shaftWidth / 2;
  vertices.push(
    new Vertex(-halfShaftWidth, 0, -halfShaftWidth), // 0
    new Vertex(halfShaftWidth, 0, -halfShaftWidth),  // 1
    new Vertex(halfShaftWidth, 0, halfShaftWidth),   // 2
    new Vertex(-halfShaftWidth, 0, halfShaftWidth),  // 3
    new Vertex(-halfShaftWidth, length - headLength, -halfShaftWidth), // 4
    new Vertex(halfShaftWidth, length - headLength, -halfShaftWidth),  // 5
    new Vertex(halfShaftWidth, length - headLength, halfShaftWidth),   // 6
    new Vertex(-halfShaftWidth, length - headLength, halfShaftWidth),  // 7
  );
  
  // Head vertices
  const halfHeadWidth = headWidth / 2;
  vertices.push(
    new Vertex(0, length, 0), // 8 - tip
    new Vertex(-halfHeadWidth, length - headLength, -halfHeadWidth), // 9
    new Vertex(halfHeadWidth, length - headLength, -halfHeadWidth),  // 10
    new Vertex(halfHeadWidth, length - headLength, halfHeadWidth),   // 11
    new Vertex(-halfHeadWidth, length - headLength, halfHeadWidth),  // 12
  );
  
  // Shaft faces
  faces.push(new Face([0, 1, 2], [], { materialIndex }));
  faces.push(new Face([0, 2, 3], [], { materialIndex }));
  faces.push(new Face([4, 6, 5], [], { materialIndex }));
  faces.push(new Face([4, 7, 6], [], { materialIndex }));
  faces.push(new Face([0, 4, 5], [], { materialIndex }));
  faces.push(new Face([0, 5, 1], [], { materialIndex }));
  faces.push(new Face([1, 5, 6], [], { materialIndex }));
  faces.push(new Face([1, 6, 2], [], { materialIndex }));
  faces.push(new Face([2, 6, 7], [], { materialIndex }));
  faces.push(new Face([2, 7, 3], [], { materialIndex }));
  faces.push(new Face([3, 7, 4], [], { materialIndex }));
  faces.push(new Face([3, 4, 0], [], { materialIndex }));
  
  // Head faces
  faces.push(new Face([8, 9, 10], [], { materialIndex }));
  faces.push(new Face([8, 10, 11], [], { materialIndex }));
  faces.push(new Face([8, 11, 12], [], { materialIndex }));
  faces.push(new Face([8, 12, 9], [], { materialIndex }));
  faces.push(new Face([9, 4, 5], [], { materialIndex }));
  faces.push(new Face([9, 5, 10], [], { materialIndex }));
  faces.push(new Face([10, 5, 6], [], { materialIndex }));
  faces.push(new Face([10, 6, 11], [], { materialIndex }));
  faces.push(new Face([11, 6, 7], [], { materialIndex }));
  faces.push(new Face([11, 7, 12], [], { materialIndex }));
  faces.push(new Face([12, 7, 4], [], { materialIndex }));
  faces.push(new Face([12, 4, 9], [], { materialIndex }));
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
} 