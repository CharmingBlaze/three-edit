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
export { createEmpty } from './primitives/createEmpty';

// Three.js Integration (matching GitHub API)
export { toBufferGeometry } from './conversion/toBufferGeometry';
export { fromBufferGeometry } from './conversion/fromBufferGeometry';
export { toJSON } from './conversion/toJSON';
export { fromJSON } from './conversion/fromJSON';

// Transform Operations
export { move } from './transform/move';
export { rotate } from './transform/rotate';
export { scale } from './transform/scale';
export { mirror } from './transform/mirror';
export { array } from './transform/array';
export { bend, twist, taper, deform } from './transform/deform';
export { applyNoise } from './transform/noise';

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
export { extrudeVertex } from './editing/extrudeVertex';
export { bevelEdge, bevelVertex, bevelFace, bevel } from './editing/bevel';
export { insetFaces, insetAllFaces, insetIndividualFaces } from './editing/inset';
export { bridgeEdges, bridgeEdgeSequence, bridgeFaces, bridgeSelectedEdges } from './editing/bridge';
export { knifeCut, knifeCutLine, knifeCutPath, knifeCutCircle } from './editing/knife';
export { cutEdgeLoop, cutMultipleLoops, cutSelectedLoops } from './editing/loopCut';

// Boolean Operations
export { booleanUnion, booleanIntersection, booleanDifference } from './operations/boolean';
export { csgUnion, csgSubtract, csgIntersect } from './operations/boolean/csgOperations';
export { applyMorphTargets } from './operations/morphing';
export { SkeletalAnimation, SkinnedMeshOperations } from './operations/skeletalAnimation';
export { WeightPaintingBrush, WeightPaintingOperations } from './operations/weightPainting';

// Import/Export
export { exportGLTF } from './io/gltf';
export { parseOBJ, exportOBJ, loadOBJ, saveOBJ } from './io/obj';
export { parsePLY, exportPLY, loadPLY, savePLY } from './io/ply';
export { importSTL, exportSTL, validateSTL, getSTLInfo } from './io/stl';

// Validation System
export type {
  ValidationResult,
  PrimitiveValidationOptions,
  MeshValidationOptions,
  GeometryValidationOptions,
  TopologyValidationOptions,
  UVValidationOptions,
  NormalValidationOptions,
  DetailedValidationResult
} from './validation';

export {
  validateMesh,
  validateTopology,
  validateGeometry,
  findOrphanedVertices,
  findNonManifoldEdges,
  findBoundaryEdges,
  findConnectedComponents,
  isWatertight,
  isManifold,
  calculateGenus,
  mergeVerticesWithFaces,
  validatePrimitiveOptions,
  validateNumericValue,
  validateCubeOptions,
  validateSphereOptions,
  validateCylinderOptions,
  validateConeOptions,
  validatePlaneOptions,
  validateTorusOptions,
  validateUVs,
  validateNormals
} from './validation';

// Mesh Operations & Queries
export * from './mesh';

// Unified Math System
export * from './math';

// Unified Geometry System (excluding functions already in mesh)
export { 
  extrudeFace as extrudeFaceHelper
} from './geometry';

// Unified Type System
export * from './types';

// Utilities
export { triangulateForExport, mergeTrianglesToQuads } from './utils/triangulation';
export { generateUVs } from './uv/generateUVs';
export { generatePlanarUVs } from './uv/generatePlanarUVs';
export { generateCylindricalUVs } from './uv/cylindricalUVs';
export { generateSphericalUVs } from './uv/sphericalUVs';

// Visual Helpers (Blender-style modular system)
export * from './visuals';
export { generateCubicUVs } from './uv/cubicUVs';
export { transformUVs } from './uv/transformUVs';

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
export { CommandFactory } from './history/CommandFactory';

// Query System
export { queryGeometry } from './query/queryGeometry';
export { findNearestElement, findNearestVertex, findNearestEdge, findNearestFace } from './query/queryNearest';
export { querySelection } from './query/querySelection';
export { queryTopology } from './query/queryTopology';

// Helper Functions (from geometry module)
export { mergeVertices, triangulatePolygon, subdivideFace, createVertexGrid, createFacesFromGrid } from './geometry';

// New module exports for compatibility
export * as core from "./core";
export * as ops from "./ops";
export * as io from "./io";
export * as scene from "./scene";
export * as easy from "./easy";
