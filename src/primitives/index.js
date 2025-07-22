/**
 * @fileoverview Primitives module exports
 * Exports all primitive creation functions with flexible parameter systems
 */

import { createCube } from './createCube.js';
import { createSphere } from './createSphere.js';
import { createPlane } from './createPlane.js';
import { createCylinder } from './createCylinder.js';
import { createCone } from './createCone.js';
import { createTorus } from './createTorus.js';
import { createRing } from './createRing.js';
import { createPyramid } from './createPyramid.js';
import { createOctahedron } from './createOctahedron.js';
import { createIcosahedron } from './createIcosahedron.js';

/**
 * Create a primitive with flexible parameters
 * @param {string} type - Primitive type ('cube', 'sphere', 'plane', 'cylinder', 'cone', 'torus', 'ring', 'pyramid', 'octahedron', 'icosahedron')
 * @param {Object} params - Primitive parameters
 * @returns {EditableMesh} Primitive mesh
 */
export function createPrimitive(type, params = {}) {
  const primitives = {
    cube: createCube,
    sphere: createSphere,
    plane: createPlane,
    cylinder: createCylinder,
    cone: createCone,
    torus: createTorus,
    ring: createRing,
    pyramid: createPyramid,
    octahedron: createOctahedron,
    icosahedron: createIcosahedron
  };

  const createFunction = primitives[type.toLowerCase()];
  if (!createFunction) {
    throw new Error(`Unknown primitive type: ${type}. Available types: ${Object.keys(primitives).join(', ')}`);
  }

  return createFunction(params);
}

/**
 * Get available primitive types
 * @returns {string[]} Array of available primitive type names
 */
export function getAvailablePrimitives() {
  return [
    'cube',
    'sphere', 
    'plane',
    'cylinder',
    'cone',
    'torus',
    'ring',
    'pyramid',
    'octahedron',
    'icosahedron'
  ];
}

/**
 * Get default parameters for a primitive type
 * @param {string} type - Primitive type
 * @returns {Object} Default parameters for the primitive
 */
export function getDefaultParams(type) {
  const defaults = {
    cube: {
      width: 1, height: 1, depth: 1,
      widthSegments: 1, heightSegments: 1, depthSegments: 1,
      x: 0, y: 0, z: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      material: { name: 'Default', type: 'standard', color: { r: 0.8, g: 0.8, b: 0.8 } },
      name: 'Cube'
    },
    sphere: {
      radius: 0.5,
      widthSegments: 32, heightSegments: 16,
      x: 0, y: 0, z: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      material: { name: 'Default', type: 'standard', color: { r: 0.8, g: 0.8, b: 0.8 } },
      name: 'Sphere'
    },
    plane: {
      width: 1, height: 1,
      widthSegments: 1, heightSegments: 1,
      x: 0, y: 0, z: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      material: { name: 'Default', type: 'standard', color: { r: 0.8, g: 0.8, b: 0.8 } },
      name: 'Plane'
    },
    cylinder: {
      radiusTop: 0.5, radiusBottom: 0.5, height: 1,
      radialSegments: 32, heightSegments: 1, openEnded: false,
      x: 0, y: 0, z: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      material: { name: 'Default', type: 'standard', color: { r: 0.8, g: 0.8, b: 0.8 } },
      name: 'Cylinder'
    },
    cone: {
      radius: 0.5, height: 1,
      radialSegments: 32, heightSegments: 1, openEnded: false,
      x: 0, y: 0, z: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      material: { name: 'Default', type: 'standard', color: { r: 0.8, g: 0.8, b: 0.8 } },
      name: 'Cone'
    },
    torus: {
      radius: 1, tube: 0.3,
      radialSegments: 32, tubularSegments: 24,
      x: 0, y: 0, z: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      material: { name: 'Default', type: 'standard', color: { r: 0.8, g: 0.8, b: 0.8 } },
      name: 'Torus'
    },
    ring: {
      innerRadius: 0.3, outerRadius: 0.7,
      thetaSegments: 32, phiSegments: 1,
      x: 0, y: 0, z: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      material: { name: 'Default', type: 'standard', color: { r: 0.8, g: 0.8, b: 0.8 } },
      name: 'Ring'
    },
    pyramid: {
      baseSize: 1, height: 1,
      x: 0, y: 0, z: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      material: { name: 'Default', type: 'standard', color: { r: 0.8, g: 0.8, b: 0.8 } },
      name: 'Pyramid'
    },
    octahedron: {
      radius: 0.5,
      x: 0, y: 0, z: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      material: { name: 'Default', type: 'standard', color: { r: 0.8, g: 0.8, b: 0.8 } },
      name: 'Octahedron'
    },
    icosahedron: {
      radius: 0.5,
      x: 0, y: 0, z: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      material: { name: 'Default', type: 'standard', color: { r: 0.8, g: 0.8, b: 0.8 } },
      name: 'Icosahedron'
    }
  };

  return defaults[type.toLowerCase()] || {};
} 