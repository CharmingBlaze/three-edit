/**
 * three-edit JavaScript Wrapper - Complete Feature Access
 * 
 * This file provides access to ALL features of three-edit for vanilla JavaScript users.
 * It wraps the TypeScript functionality in a more JavaScript-friendly way.
 */

// Import core classes
import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

// Import conversion functions
import { toBufferGeometry } from '../conversion/toBufferGeometry';
import { fromBufferGeometry } from '../conversion/fromBufferGeometry';
import { toJSON } from '../conversion/toJSON';
import { fromJSON } from '../conversion/fromJSON';

// Import ALL primitives
import { createCube } from '../primitives/createCube';
import { createSphere } from '../primitives/createSphere';
import { createCylinder } from '../primitives/createCylinder';
import { createCone } from '../primitives/createCone';
import { createPlane } from '../primitives/createPlane';
import { createTorus } from '../primitives/createTorus';
import { createTetrahedron } from '../primitives/createTetrahedron';
import { createOctahedron } from '../primitives/createOctahedron';
import { createDodecahedron } from '../primitives/createDodecahedron';
import { createIcosahedron } from '../primitives/createIcosahedron';
import { createTorusKnot } from '../primitives/createTorusKnot';
import { createCircle } from '../primitives/createCircle';
import { createPyramid } from '../primitives/createPyramid';
import { createCapsule } from '../primitives/createCapsule';
import { createLowPolySphere } from '../primitives/createLowPolySphere';
import { createRoundedBox } from '../primitives/createRoundedBox';
import { createStairs } from '../primitives/createStairs';
import { createRamp } from '../primitives/createRamp';
import { createArrow } from '../primitives/createArrow';
import { createNGon } from '../primitives/createNGon';
import { createWedge } from '../primitives/createWedge';
import { createPipe } from '../primitives/createPipe';
import { createMobiusStrip } from '../primitives/createMobiusStrip';
import { createHandle } from '../primitives/createHandle';
import { createGreebleBlock } from '../primitives/createGreebleBlock';
import { createBoundingBox } from '../primitives/createBoundingBox';
import { createEmpty } from '../primitives/createEmpty';

// Import ALL editing operations
import { extrudeFace } from '../editing/extrudeFace';
import { extrudeEdge } from '../editing/extrudeEdge';
import { extrudeVertex } from '../editing/extrudeVertex';
import { bevelEdge, bevelVertex, bevelFace, bevel } from '../editing/bevel';
import { knifeCut, knifeCutLine, knifeCutPath, knifeCutCircle } from '../editing/knife';
import { insetFaces, insetAllFaces, insetIndividualFaces } from '../editing/inset';
import { bridgeEdges, bridgeEdgeSequence, bridgeFaces, bridgeSelectedEdges } from '../editing/bridge';
import { cutEdgeLoop, cutMultipleLoops, cutSelectedLoops } from '../editing/loopCut';

// Import ALL transform operations
import { move } from '../transform/move';
import { rotate } from '../transform/rotate';
import { scale } from '../transform/scale';
import { mirror } from '../transform/mirror';
import { array } from '../transform/array';
import { bend, twist, taper, deform } from '../transform/deform';
import { applyNoise } from '../transform/noise';

// Import ALL selection operations
import { selectByRay } from '../selection/raySelection';
import { selectByBox, selectByCircle } from '../selection/boxSelection';
import { selectByLasso } from '../selection/lassoSelection';
import { selectConnected } from '../selection/connectedSelection';
import { selectSimilar } from '../selection/similarSelection';
import { selectFaceByRay } from '../selection/selectFace';
import { selectVertex } from '../selection/selectVertex';

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

// Import ALL scene operations
import { SceneGraph } from '../scene/SceneGraph';
import { SceneNode } from '../scene/SceneNode';

// Import ALL topology operations
import { EdgeKeyCache } from '../topology/edgeKey';
import { compareVertices, canWeldVertices } from '../topology/vertexCompare';

// Import ALL helpers - COMPLETE MODULAR SYSTEM
import * as Helpers from '../helpers';

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
  
  // ===== CORE CLASSES =====
  EditableMesh,
  Vertex,
  Edge,
  Face,
  
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
  importOBJ: parseOBJ,
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
  
  // ===== ALL SCENE OPERATIONS =====
  SceneGraph,
  SceneNode,
  
  // ===== ALL TOPOLOGY OPERATIONS =====
  EdgeKeyCache,
  compareVertices,
  canWeldVertices,
  
  // ===== ALL HELPER FUNCTIONS - COMPLETE MODULAR SYSTEM =====
  ...Helpers,
  
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
    }
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
    obj: { import: parseOBJ, export: exportOBJ },
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
  }),
  
  /**
   * Gets all available helper methods as an object
   * @return {Object} All helper functions organized by category
   */
  getHelpers: () => ({
    math: {
      // Basic math utilities
      clamp: Helpers.clamp,
      lerp: Helpers.lerp,
      roundTo: Helpers.roundTo,
      modulo: Helpers.modulo,
      // Vector math
      distance3D: Helpers.distance3D,
      dotProduct: Helpers.dotProduct,
      crossProduct: Helpers.crossProduct,
      // Triangle math
      isValidTriangle: Helpers.isValidTriangle,
      calculateTriangleArea: Helpers.calculateTriangleArea,
      calculateTriangleNormal: Helpers.calculateTriangleNormal
    },
    geometry: {
      // Core geometry operations
      triangulatePolygon: Helpers.triangulatePolygon,
      subdivideFace: Helpers.subdivideFace,
      extrudeFace: Helpers.extrudeFace,
      mergeVertices: Helpers.mergeVertices,
      // Vertex operations
      centerVertices: Helpers.centerVertices,
      scaleVertices: Helpers.scaleVertices,
      rotateVertices: Helpers.rotateVertices,
      // Face operations
      createFacesFromGrid: Helpers.createFacesFromGrid
    },
    primitives: {
      // Basic shapes
      createCube: Helpers.createCube,
      createSphere: Helpers.createSphere,
      createCylinder: Helpers.createCylinder,
      createPlane: Helpers.createPlane,
      // Complex shapes
      createTorus: Helpers.createTorus,
      createCone: Helpers.createCone,
      createPyramid: Helpers.createPyramid,
      createCapsule: Helpers.createCapsule,
      // Parametric shapes
      createTorusKnot: Helpers.createTorusKnot,
      createMobiusStrip: Helpers.createMobiusStrip,
      createArrow: Helpers.createArrow
    },
    editor: {
      // Highlight helpers
      createVertexHighlight: Helpers.createVertexHighlight,
      createEdgeHighlight: Helpers.createEdgeHighlight,
      createFaceHighlight: Helpers.createFaceHighlight,
      updateHighlightColor: Helpers.updateHighlightColor,
      // Grid helpers
      createGrid: Helpers.createGrid,
      createSnapGrid: Helpers.createSnapGrid,
      updateGridScale: Helpers.updateGridScale,
      // Overlay helpers
      createMeasurementLine: Helpers.createMeasurementLine,
      createAxisArrows: Helpers.createAxisArrows,
      createBoundingBoxOverlay: Helpers.createBoundingBoxOverlay
    },
    utilities: {
      // UV operations
      generatePlanarUVs: Helpers.generatePlanarUVs,
      generateCylindricalUVs: Helpers.generateCylindricalUVs,
      generateSphericalUVs: Helpers.generateSphericalUVs,
      // Normal operations
      calculateFaceNormals: Helpers.calculateFaceNormals,
      calculateSmoothNormals: Helpers.calculateSmoothNormals,
      // Validation
      validateMesh: Helpers.validateMesh,
      repairMesh: Helpers.repairMesh,
      // Debug
      debugMesh: Helpers.debugMesh,
      logMeshStats: Helpers.logMeshStats
    }
  })
};

export default ThreeEditJS;
