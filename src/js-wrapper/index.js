/**
 * three-edit JavaScript Wrapper - Complete Feature Access
 * 
 * This file provides access to ALL features of three-edit for vanilla JavaScript users.
 * It wraps the TypeScript functionality in a more JavaScript-friendly way.
 */

// Import ALL operations
import { booleanUnion, booleanIntersection, booleanDifference } from '../operations/boolean';
import { csgUnion, csgSubtract, csgIntersect } from '../operations/boolean/csgOperations';
import { applyMorphTargets } from '../operations/morphing';
import { SkeletalAnimation, SkinnedMeshOperations } from '../operations/skeletalAnimation';
import { WeightPaintingBrush, WeightPaintingOperations } from '../operations/weightPainting';

// Import ALL material operations
import { assignMaterial } from '../materials/assignMaterial';
import { MaterialManager } from '../materials/MaterialManager';

// Import ALL UV operations
import { generatePlanarUVs } from '../uv/generatePlanarUVs';
import { generateCylindricalUVs } from '../uv/cylindricalUVs';
import { generateSphericalUVs } from '../uv/sphericalUVs';
import { generateCubicUVs } from '../uv/cubicUVs';
import { generateUVs } from '../uv/generateUVs';
import { transformUVs } from '../uv/transformUVs';

// Import ALL validation operations
import { validateMesh } from '../validation/validateMesh';
import { validateGeometryIntegrity } from '../validation/validateGeometryIntegrity';
import { repairMesh } from '../validation/repairMesh';
import { fixWindingOrder } from '../validation/fixWindingOrder';

// Import ALL IO operations
import { parseOBJ, exportOBJ, loadOBJ, saveOBJ } from '../io/obj';
import { importGLTF, exportGLTF } from '../io/gltf';
import { importPLY, exportPLY } from '../io/ply';
import { importSTL, exportSTL } from '../io/stl';

// Import ALL utility functions
import { calculateFaceNormal, calculateFaceCenter } from '../utils/mathUtils';
import { calculateArea, calculateVolume } from '../utils/math';

// Import ALL query operations
import { queryGeometry } from '../query/queryGeometry';
import { queryNearest } from '../query/queryNearest';
import { querySelection } from '../query/querySelection';
import { queryTopology } from '../query/queryTopology';

// Import ALL performance operations
import { buildOctree } from '../performance/octree';
import { simplifyMesh } from '../performance/simplification';
import { optimizeMemory } from '../performance/memory';
import { initializeGPU } from '../performance/gpu';

// Import ALL history operations
import { CommandHistory } from '../history/CommandHistory';
import { CommandFactory } from '../history/CommandFactory';

/**
 * ThreeEditJS - Complete JavaScript wrapper for three-edit
 * Provides access to ALL features of the library
 */
const ThreeEditJS = {
  // ===== CORE FUNCTIONALITY =====
  createMesh: () => new EditableMesh(),
  toBufferGeometry,
  fromBufferGeometry,
  toJSON,
  fromJSON,
  
  // ===== ALL PRIMITIVES =====
  createCube,
  createSphere,
  createCylinder,
  createCone,
  createPlane,
  createTorus,
  createPyramid,
  createCircle,
  createNGon,
  createPipe,
  createRoundedBox,
  createTetrahedron,
  createOctahedron,
  createDodecahedron,
  createIcosahedron,
  createTorusKnot,
  createMobiusStrip,
  createArrow,
  createCapsule,
  createStairs,
  createRamp,
  createWedge,
  createHandle,
  createGreebleBlock,
  createLowPolySphere,
  createBoundingBox,
  createEmpty,
  
  // ===== ALL EDITING OPERATIONS =====
  extrudeFace,
  extrudeEdge,
  extrudeVertex,
  bevelEdge,
  bevelVertex,
  bevelFace,
  bevel,
  knifeCut,
  knifeCutLine,
  knifeCutPath,
  knifeCutCircle,
  insetFaces,
  insetAllFaces,
  insetIndividualFaces,
  bridgeEdges,
  bridgeEdgeSequence,
  bridgeFaces,
  bridgeSelectedEdges,
  cutEdgeLoop,
  cutMultipleLoops,
  cutSelectedLoops,
  
  // ===== ALL TRANSFORM OPERATIONS =====
  moveVertices: move,
  rotateVertices: rotate,
  scaleVertices: scale,
  mirrorVertices: mirror,
  arrayVertices: array,
  bendVertices: bend,
  twistVertices: twist,
  taperVertices: taper,
  deform,
  applyNoise,
  
  // ===== ALL SELECTION UTILITIES =====
  selectByRay,
  selectByBox,
  selectByCircle,
  selectByLasso,
  selectConnected,
  selectSimilar,
  selectFaceByRay,
  selectVertex,
  
  // ===== ALL OPERATIONS =====
  booleanUnion,
  booleanIntersection,
  booleanDifference,
  csgUnion,
  csgSubtract,
  csgIntersect,
  applyMorphTargets,
  SkeletalAnimation,
  SkinnedMeshOperations,
  WeightPaintingBrush,
  WeightPaintingOperations,
  
  // ===== ALL MATERIAL OPERATIONS =====
  assignMaterial,
  MaterialManager,
  
  // ===== ALL UV OPERATIONS =====
  generatePlanarUVs,
  generateCylindricalUVs,
  generateSphericalUVs,
  generateCubicUVs,
  generateUVs,
  transformUVs,
  
  // ===== ALL VALIDATION OPERATIONS =====
  validateMesh,
  validateGeometryIntegrity,
  repairMesh,
  fixWindingOrder,
  
  // ===== ALL IO OPERATIONS =====
  importOBJ,
  exportOBJ,
  importGLTF,
  exportGLTF,
  importPLY,
  exportPLY,
  importSTL,
  exportSTL,
  
  // ===== ALL UTILITY FUNCTIONS =====
  calculateFaceNormal,
  calculateFaceCenter,
  calculateArea,
  calculateVolume,
  
  // ===== ALL QUERY OPERATIONS =====
  queryGeometry,
  queryNearest,
  querySelection,
  queryTopology,
  
  // ===== ALL PERFORMANCE OPERATIONS =====
  buildOctree,
  simplifyMesh,
  optimizeMemory,
  initializeGPU,
  
  // ===== ALL HISTORY OPERATIONS =====
  CommandHistory,
  CommandFactory,
  
  // ===== HELPER METHODS FOR JAVASCRIPT USERS =====
  
  /**
   * Creates a mesh from a Three.js BufferGeometry
   * @param {THREE.BufferGeometry} geometry - The Three.js geometry to convert
   * @return {EditableMesh} The resulting editable mesh
   */
  createFromThreeGeometry: (geometry) => {
    return fromBufferGeometry(geometry);
  },
  
  /**
   * Applies an operation to a mesh and returns the updated Three.js geometry
   * @param {EditableMesh} mesh - The mesh to operate on
   * @param {Function} operation - The operation function to apply
   * @param {...any} args - Arguments for the operation
   * @return {THREE.BufferGeometry} The resulting Three.js geometry
   */
  applyOperation: (mesh, operation, ...args) => {
    operation(mesh, ...args);
    return toBufferGeometry(mesh);
  },
  
  /**
   * Creates a scene graph (requires dynamic import)
   * @return {Promise<Object>} Scene graph functionality
   */
  createSceneGraph: async () => {
    const { SceneGraph, SceneNode } = await import('../scene');
    return { SceneGraph, SceneNode };
  },
  
  /**
   * Gets all available primitives as an object
   * @return {Object} All primitive creation functions
   */
  getPrimitives: () => ({
    cube: createCube,
    sphere: createSphere,
    cylinder: createCylinder,
    cone: createCone,
    plane: createPlane,
    torus: createTorus,
    pyramid: createPyramid,
    circle: createCircle,
    ngon: createNGon,
    pipe: createPipe,
    roundedBox: createRoundedBox,
    tetrahedron: createTetrahedron,
    octahedron: createOctahedron,
    dodecahedron: createDodecahedron,
    icosahedron: createIcosahedron,
    torusKnot: createTorusKnot,
    mobiusStrip: createMobiusStrip,
    arrow: createArrow,
    capsule: createCapsule,
    stairs: createStairs,
    ramp: createRamp,
    wedge: createWedge,
    handle: createHandle,
    greebleBlock: createGreebleBlock,
    lowPolySphere: createLowPolySphere,
    boundingBox: createBoundingBox,
    empty: createEmpty
  }),
  
  /**
   * Gets all available operations as an object
   * @return {Object} All operation functions
   */
  getOperations: () => ({
    extrude: { face: extrudeFace, edge: extrudeEdge, vertex: extrudeVertex },
    bevel: { edge: bevelEdge, vertex: bevelVertex, face: bevelFace, generic: bevel },
    transform: {
      move: moveVertices,
      rotate: rotateVertices,
      scale: scaleVertices,
      mirror: mirrorVertices,
      array: arrayVertices,
      deform: { bend: bendVertices, twist: twistVertices, taper: taperVertices, generic: deform },
      noise: applyNoise
    },
    boolean: {
      union: booleanUnion,
      intersection: booleanIntersection,
      difference: booleanDifference,
      csg: { union: csgUnion, intersection: csgIntersect, difference: csgSubtract }
    },
    smoothing: subdivideSurface,
    morphing: applyMorphing,
    skeletalAnimation: applySkeletalAnimation,
    weightPainting: applyWeightPainting
  }),
  
  /**
   * Gets all available selection methods as an object
   * @return {Object} All selection functions
   */
  getSelection: () => ({
    byRay: selectByRay,
    byBox: selectByBox,
    byCircle: selectByCircle,
    byLasso: selectByLasso,
    connected: selectConnected,
    similar: selectSimilar,
    face: selectFaceByRay,
    vertex: selectVertex
  }),
  
  /**
   * Gets all available IO methods as an object
   * @return {Object} All IO functions
   */
  getIO: () => ({
    obj: { import: importOBJ, export: exportOBJ },
    gltf: { import: importGLTF, export: exportGLTF },
    ply: { import: importPLY, export: exportPLY },
    stl: { import: importSTL, export: exportSTL }
  }),
  
  /**
   * Gets all available validation methods as an object
   * @return {Object} All validation functions
   */
  getValidation: () => ({
    validateMesh,
    validateGeometryIntegrity,
    repairMesh,
    fixWindingOrder
  }),
  
  /**
   * Gets all available performance methods as an object
   * @return {Object} All performance functions
   */
  getPerformance: () => ({
    buildOctree,
    simplifyMesh,
    optimizeMemory,
    initializeGPU
  })
};

export default ThreeEditJS;
