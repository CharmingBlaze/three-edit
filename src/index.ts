/**
 * Three-Edit Library
 * A comprehensive 3D mesh editing library for Three.js
 */

// Core Classes
export { EditableMesh } from './core/EditableMesh';
export { Vertex } from './core/Vertex';
export { Edge } from './core/Edge';
export { Face } from './core/Face';

// Primitive Creation (Three.js-style)
export { createCube } from './primitives/createCube';
export { createSphere } from './primitives/createSphere';
export { createCylinder } from './primitives/createCylinder';
export { createCone } from './primitives/createCone';
export { createPlane } from './primitives/createPlane';
export { createTorus } from './primitives/createTorus';
export { createTetrahedron } from './primitives/createTetrahedron';
export { createOctahedron } from './primitives/createOctahedron';
export { createDodecahedron } from './primitives/createDodecahedron';
export { createIcosahedron } from './primitives/createIcosahedron';
export { createTorusKnot } from './primitives/createTorusKnot';
export { createCircle } from './primitives/createCircle';
export { createPyramid } from './primitives/createPyramid';
export { createCapsule } from './primitives/createCapsule';
export { createLowPolySphere } from './primitives/createLowPolySphere';
export { createRoundedBox } from './primitives/createRoundedBox';
export { createStairs } from './primitives/createStairs';
export { createRamp } from './primitives/createRamp';
export { createArrow } from './primitives/createArrow';
export { createNGon } from './primitives/createNGon';
export { createWedge } from './primitives/createWedge';
export { createPipe } from './primitives/createPipe';
export { createMobiusStrip } from './primitives/createMobiusStrip';
export { createHandle } from './primitives/createHandle';
export { createGreebleBlock } from './primitives/createGreebleBlock';
export { createBoundingBox } from './primitives/createBoundingBox';

// Three.js Integration (matching GitHub API)
export { toBufferGeometry } from './conversion/toBufferGeometry';
export { fromBufferGeometry } from './conversion/fromBufferGeometry';

// Transform Operations
export { move } from './transform/move';
export { rotate } from './transform/rotate';
export { scale } from './transform/scale';

// Selection System
export { Selection } from './selection/Selection';
export { selectFaceByRay, selectFacesByVertices } from './selection/selectFace';
export { selectVertex } from './selection/selectVertex';
export { selectByRay } from './selection/raySelection';
export { selectByBox, selectByCircle } from './selection/boxSelection';
export { selectByLasso } from './selection/lassoSelection';
export { selectConnected } from './selection/connectedSelection';
export { selectSimilar } from './selection/similarSelection';

// Editing Operations
export { extrudeFace } from './editing/extrudeFace';
export { extrudeEdge } from './editing/extrudeEdge';
export { bevelEdge } from './editing/bevel';
export { insetFaces } from './editing/inset';
export { bridgeEdges } from './editing/bridge';

// Boolean Operations
export { booleanUnion } from './operations/boolean';

// Import/Export
export { exportGLTF } from './exporters/gltf/exportGLTF';
export { importGLTF } from './exporters/gltf/importGLTF';

// Validation
export { validateMesh } from './validation/validateMesh';
export { validateGeometryIntegrity } from './validation/validateGeometryIntegrity';

// Utilities
export { calculateFaceNormal } from './utils/mathUtils';
export { generateUVs } from './uv/generateUVs';

// Types
export type { CreatePrimitiveOptions, PrimitiveResult } from './primitives/types';
export type { UVCoord } from './uv/types';

// Topology System
export { EdgeKeyCache } from './topology/edgeKey';
export { compareVertices, canWeldVertices } from './topology/vertexCompare';

// Scene Graph
export { SceneGraph } from './scene/SceneGraph';

// Material System
export { MaterialManager } from './materials/MaterialManager';
export { assignMaterial } from './materials/assignMaterial';

// History System
export { CommandHistory } from './history/CommandHistory';