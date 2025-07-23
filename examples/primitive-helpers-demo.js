/**
 * Primitive Helpers Demo - Shows how to use the new modular primitive system
 * This demonstrates the easy-to-use helper functions for creating primitives
 */

// Import the modular primitive helpers
import { 
  // Basic shapes
  createCube,
  createSphere,
  createPlane,
  createCylinder,
  createCone,
  createTorus,
  createCircle,
  createRing,
  createCapsule,
  createPyramid,
  createTetrahedron,
  createOctahedron,
  createWedge,
  createRamp,
  createStairs,
  
  // Complex shapes
  createTorusKnot,
  createMobiusStrip,
  createPipe,
  createHandle,
  createGreebleBlock,
  createLowPolySphere,
  createArrow,
  
  // Parametric shapes
  createParametricSurface,
  createKleinBottle,
  createHelicoid,
  createCatenoid,
  createHyperboloid,
  createParaboloid,
  createSaddle,
  createSpiral,
  createWave,
  createRipple,
  createCorkscrew,
  createSeashell,
  
  // Vertex generators
  createVertex,
  createVertexWithUV,
  createVertexWithNormal,
  createGridVertices,
  createCircleVertices,
  createSphereVertices,
  createCylinderVertices,
  createTorusVertices,
  createBoxVertices,
  
  // Face generators
  createFace,
  createTriangleFace,
  createQuadFace,
  createGridFaces,
  createCircleFaces,
  createSphereFaces,
  createCylinderFaces,
  createTorusFaces,
  createBoxFaces,
  
  // Geometry builders
  buildPlane,
  buildBox,
  buildSphere,
  buildCylinder,
  buildCone,
  buildTorus,
  buildCircle,
  buildRing,
  buildCapsule,
  buildPyramid,
  buildTetrahedron,
  buildOctahedron,
  
  // Transform helpers
  translateVertices,
  scaleVertices,
  rotateVertices,
  transformVertices,
  centerVertices,
  normalizeVertices,
  mirrorVertices,
  extrudeVertices,
  
  // UV generators
  generatePlanarUVs,
  generateCylindricalUVs,
  generateSphericalUVs,
  generateCubicUVs,
  generateTorusUVs,
  generateGridUVs,
  generateCircleUVs,
  generateTriplanarUVs,
  generateBoxUVs,
  generateSeamlessUVs,
  generateCheckerboardUVs,
  generatePolarUVs
} from '../src/helpers/primitives/index.js';

// Example 1: Create a simple cube
console.log('Creating a simple cube...');
const cube = createCube(1, 0); // size: 1, materialIndex: 0
console.log(`Cube created with ${cube.vertexCount} vertices and ${cube.faceCount} faces`);

// Example 2: Create a sphere with custom parameters
console.log('Creating a sphere...');
const sphere = createSphere(0.5, 16, 0); // radius: 0.5, segments: 16, materialIndex: 0
console.log(`Sphere created with ${sphere.vertexCount} vertices and ${sphere.faceCount} faces`);

// Example 3: Create a complex torus knot
console.log('Creating a torus knot...');
const torusKnot = createTorusKnot(0.5, 0.2, 2, 3, 16, 8, 0);
console.log(`Torus knot created with ${torusKnot.vertexCount} vertices and ${torusKnot.faceCount} faces`);

// Example 4: Create a parametric wave surface
console.log('Creating a wave surface...');
const wave = createWave(2, 2, 0.5, 2, 16, 16, 0);
console.log(`Wave surface created with ${wave.vertexCount} vertices and ${wave.faceCount} faces`);

// Example 5: Create vertices and faces manually
console.log('Creating custom geometry...');
const vertices = createGridVertices(1, 1, 2, 2, true);
const faces = createGridFaces(2, 2, 0);
console.log(`Custom grid created with ${vertices.length} vertices and ${faces.length} faces`);

// Example 6: Transform vertices
console.log('Transforming vertices...');
const originalVertices = createCircleVertices(1, 8);
console.log(`Original circle has ${originalVertices.length} vertices`);

// Scale the vertices
scaleVertices(originalVertices, { x: 2, y: 1, z: 1 });
console.log('Vertices scaled by 2x in X direction');

// Rotate the vertices
rotateVertices(originalVertices, { x: 0, y: 0, z: 1 }, Math.PI / 4);
console.log('Vertices rotated 45 degrees around Z axis');

// Example 7: Generate UV coordinates
console.log('Generating UV coordinates...');
generatePlanarUVs(originalVertices, 'z', { x: 1, y: 1 });
console.log('Planar UV coordinates generated');

// Example 8: Create a complete geometry with all steps
console.log('Creating complete geometry...');

// Step 1: Create vertices
const customVertices = createBoxVertices(1, 1, 1, 2, 2, 2);

// Step 2: Create faces
const customFaces = createBoxFaces(2, 2, 2, 0);

// Step 3: Transform vertices
centerVertices(customVertices);

// Step 4: Generate UVs
generateBoxUVs(customVertices, 1, 1, 1);

const customGeometry = {
  vertices: customVertices,
  faces: customFaces,
  vertexCount: customVertices.length,
  faceCount: customFaces.length
};

console.log(`Custom geometry created with ${customGeometry.vertexCount} vertices and ${customGeometry.faceCount} faces`);

// Example 9: Create advanced shapes
console.log('Creating advanced shapes...');

const kleinBottle = createKleinBottle(0.5, 16, 8, 0);
console.log(`Klein bottle created with ${kleinBottle.vertexCount} vertices and ${kleinBottle.faceCount} faces`);

const saddle = createSaddle(1, 1, 2, 16, 16, 0);
console.log(`Saddle surface created with ${saddle.vertexCount} vertices and ${saddle.faceCount} faces`);

const arrow = createArrow(1, 0.2, 0.1, 0.05, 0);
console.log(`Arrow created with ${arrow.vertexCount} vertices and ${arrow.faceCount} faces`);

console.log('Primitive helpers demo completed successfully!');
console.log('');
console.log('Available functions:');
console.log('- Basic shapes: createCube, createSphere, createPlane, createCylinder, createCone, createTorus, etc.');
console.log('- Complex shapes: createTorusKnot, createMobiusStrip, createPipe, createHandle, etc.');
console.log('- Parametric shapes: createParametricSurface, createKleinBottle, createHelicoid, etc.');
console.log('- Vertex generators: createVertex, createGridVertices, createCircleVertices, etc.');
console.log('- Face generators: createFace, createTriangleFace, createGridFaces, etc.');
console.log('- Geometry builders: buildPlane, buildBox, buildSphere, etc.');
console.log('- Transform helpers: translateVertices, scaleVertices, rotateVertices, etc.');
console.log('- UV generators: generatePlanarUVs, generateSphericalUVs, generateBoxUVs, etc.'); 