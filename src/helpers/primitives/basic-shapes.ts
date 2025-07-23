/**
 * Basic Shape Helpers - Simple primitive shapes
 * These provide easy-to-use functions for common basic shapes
 */

import { Vector3 } from 'three';
import { PrimitiveResult } from './types';
import * as builders from './geometry-builders';
import * as transforms from './transform-helpers';
import * as uvs from './uv-generators';

/**
 * Create a simple cube
 */
export function createCube(
  size: number = 1,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildBox(size, size, size, 1, 1, 1, materialIndex);
}

/**
 * Create a simple sphere
 */
export function createSphere(
  radius: number = 0.5,
  segments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildSphere(radius, segments, segments, 0, Math.PI * 2, 0, Math.PI, materialIndex);
}

/**
 * Create a simple plane
 */
export function createPlane(
  size: number = 1,
  segments: number = 1,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildPlane(size, size, segments, segments, materialIndex);
}

/**
 * Create a simple cylinder
 */
export function createCylinder(
  radius: number = 0.5,
  height: number = 1,
  segments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildCylinder(radius, radius, height, segments, 1, false, materialIndex);
}

/**
 * Create a simple cone
 */
export function createCone(
  radius: number = 0.5,
  height: number = 1,
  segments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildCone(radius, height, segments, 1, false, materialIndex);
}

/**
 * Create a simple torus
 */
export function createTorus(
  radius: number = 0.5,
  tube: number = 0.2,
  segments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildTorus(radius, tube, segments, segments, Math.PI * 2, materialIndex);
}

/**
 * Create a simple circle
 */
export function createCircle(
  radius: number = 0.5,
  segments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildCircle(radius, segments, 0, Math.PI * 2, materialIndex);
}

/**
 * Create a simple ring
 */
export function createRing(
  innerRadius: number = 0.3,
  outerRadius: number = 0.5,
  segments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildRing(innerRadius, outerRadius, segments, segments, materialIndex);
}

/**
 * Create a simple capsule
 */
export function createCapsule(
  radius: number = 0.5,
  height: number = 1,
  segments: number = 8,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildCapsule(radius, height, segments, 1, materialIndex);
}

/**
 * Create a simple pyramid
 */
export function createPyramid(
  size: number = 1,
  height: number = 1,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildPyramid(size, height, size, materialIndex);
}

/**
 * Create a simple tetrahedron
 */
export function createTetrahedron(
  radius: number = 0.5,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildTetrahedron(radius, materialIndex);
}

/**
 * Create a simple octahedron
 */
export function createOctahedron(
  radius: number = 0.5,
  materialIndex: number = 0
): PrimitiveResult {
  return builders.buildOctahedron(radius, materialIndex);
}

/**
 * Create a simple box with rounded corners
 */
export function createRoundedBox(
  width: number = 1,
  height: number = 1,
  depth: number = 1,
  radius: number = 0.1,
  segments: number = 4,
  materialIndex: number = 0
): PrimitiveResult {
  const result = builders.buildBox(width, height, depth, 1, 1, 1, materialIndex);
  
  // Apply rounded corners (simplified - would need more complex geometry)
  // This is a placeholder for the actual rounded box implementation
  transforms.normalizeVertices(result.vertices);
  
  return result;
}

/**
 * Create a simple wedge (triangular prism)
 */
export function createWedge(
  width: number = 1,
  height: number = 1,
  depth: number = 1,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices = [
    // Front face
    { x: -width/2, y: -height/2, z: depth/2 },  // 0
    { x: width/2, y: -height/2, z: depth/2 },   // 1
    { x: 0, y: height/2, z: depth/2 },          // 2
    
    // Back face
    { x: -width/2, y: -height/2, z: -depth/2 }, // 3
    { x: width/2, y: -height/2, z: -depth/2 },  // 4
    { x: 0, y: height/2, z: -depth/2 },         // 5
  ];
  
  const faces = [
    // Front triangle
    [0, 1, 2],
    // Back triangle
    [3, 5, 4],
    // Side faces
    [0, 3, 4], [0, 4, 1], // Left side
    [1, 4, 5], [1, 5, 2], // Right side
    [2, 5, 3], [2, 3, 0], // Top side
  ];
  
  // Convert to Vertex and Face objects
  const vertexObjects = vertices.map(v => new Vertex(v.x, v.y, v.z));
  const faceObjects = faces.map(f => new Face(f, [], { materialIndex }));
  
  return {
    vertices: vertexObjects,
    faces: faceObjects,
    vertexCount: vertexObjects.length,
    faceCount: faceObjects.length
  };
}

/**
 * Create a simple ramp
 */
export function createRamp(
  width: number = 1,
  height: number = 1,
  depth: number = 1,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices = [
    // Front face
    { x: -width/2, y: -height/2, z: depth/2 },  // 0
    { x: width/2, y: -height/2, z: depth/2 },   // 1
    { x: width/2, y: height/2, z: depth/2 },    // 2
    { x: -width/2, y: height/2, z: depth/2 },   // 3
    
    // Back face
    { x: -width/2, y: -height/2, z: -depth/2 }, // 4
    { x: width/2, y: -height/2, z: -depth/2 },  // 5
    { x: width/2, y: height/2, z: -depth/2 },   // 6
    { x: -width/2, y: height/2, z: -depth/2 },  // 7
  ];
  
  const faces = [
    // Front face
    [0, 1, 2], [0, 2, 3],
    // Back face
    [4, 6, 5], [4, 7, 6],
    // Left face
    [0, 3, 7], [0, 7, 4],
    // Right face
    [1, 5, 6], [1, 6, 2],
    // Bottom face
    [0, 4, 5], [0, 5, 1],
    // Top face (ramp)
    [3, 2, 6], [3, 6, 7],
  ];
  
  // Convert to Vertex and Face objects
  const vertexObjects = vertices.map(v => new Vertex(v.x, v.y, v.z));
  const faceObjects = faces.map(f => new Face(f, [], { materialIndex }));
  
  return {
    vertices: vertexObjects,
    faces: faceObjects,
    vertexCount: vertexObjects.length,
    faceCount: faceObjects.length
  };
}

/**
 * Create a simple stairs
 */
export function createStairs(
  width: number = 1,
  height: number = 1,
  depth: number = 1,
  steps: number = 3,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices = [];
  const faces = [];
  
  const stepHeight = height / steps;
  const stepDepth = depth / steps;
  
  for (let i = 0; i <= steps; i++) {
    const y = -height/2 + i * stepHeight;
    const z = depth/2 - i * stepDepth;
    
    // Front vertices
    vertices.push(new Vertex(-width/2, y, z));
    vertices.push(new Vertex(width/2, y, z));
  }
  
  // Create faces for each step
  for (let i = 0; i < steps; i++) {
    const base = i * 2;
    
    // Step face
    faces.push(new Face([base, base+1, base+3, base+2], [], { materialIndex }));
    
    // Side faces
    faces.push(new Face([base, base+2, base+2+steps*2, base+steps*2], [], { materialIndex }));
    faces.push(new Face([base+1, base+steps*2+1, base+2+steps*2+1, base+3], [], { materialIndex }));
  }
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
} 