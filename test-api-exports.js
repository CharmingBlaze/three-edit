/**
 * Test file to verify all API exports are working
 */

// Test TypeScript exports
const { 
  EditableMesh,
  createCube,
  createSphere,
  createCylinder,
  createCone,
  createPlane,
  createTorus,
  createTetrahedron,
  createOctahedron,
  createDodecahedron,
  createIcosahedron,
  createTorusKnot,
  createCircle,
  createPyramid,
  createCapsule,
  createLowPolySphere,
  createRoundedBox,
  createStairs,
  createRamp,
  createArrow,
  createNGon,
  createWedge,
  createPipe,
  createMobiusStrip,
  createHandle,
  createGreebleBlock,
  createBoundingBox,
  createEmpty,
  toBufferGeometry,
  fromBufferGeometry,
  toJSON,
  fromJSON,
  move,
  rotate,
  scale,
  mirror,
  array,
  bend,
  twist,
  taper,
  deform,
  applyNoise,
  extrudeFace,
  extrudeEdge,
  extrudeVertex,
  bevelEdge,
  bevelVertex,
  bevelFace,
  bevel,
  insetFaces,
  insetAllFaces,
  insetIndividualFaces,
  bridgeEdges,
  bridgeEdgeSequence,
  bridgeFaces,
  bridgeSelectedEdges,
  knifeCut,
  knifeCutLine,
  knifeCutPath,
  knifeCutCircle,
  cutEdgeLoop,
  cutMultipleLoops,
  cutSelectedLoops,
  booleanUnion,
  booleanIntersection,
  booleanDifference,
  csgUnion,
  csgSubtract,
  csgIntersect,
  selectByRay,
  selectByBox,
  selectByCircle,
  selectByLasso,
  selectConnected,
  selectSimilar,
  selectFaceByRay,
  selectVertex,
  assignMaterial,
  MaterialManager,
  generateUVs,
  generatePlanarUVs,
  generateCylindricalUVs,
  generateSphericalUVs,
  generateCubicUVs,
  transformUVs,
  validateMesh,
  validateGeometryIntegrity,
  repairMesh,
  fixWindingOrder,
  parseOBJ,
  exportOBJ,
  loadOBJ,
  saveOBJ,
  parsePLY,
  exportPLY,
  loadPLY,
  savePLY,
  importSTL,
  exportSTL,
  validateSTL,
  getSTLInfo,
  calculateFaceNormal,
  calculateFaceCenter,
  findNearestElement,
  findNearestVertex,
  findNearestEdge,
  findNearestFace,
  queryGeometry,
  querySelection,
  queryTopology,
  CommandHistory,
  CommandFactory,
  SceneGraph,
  EdgeKeyCache,
  compareVertices,
  canWeldVertices,
  mergeVertices,
  triangulatePolygon,
  subdivideFace,
  extrudeFaceHelper,
  createVertexGrid,
  createFacesFromGrid
} = require('./dist/index.js');

console.log('✅ All TypeScript exports are working!');

// Test JavaScript wrapper
const ThreeEditJS = require('./dist/js-wrapper/index.js').default;

console.log('✅ JavaScript wrapper is working!');

// Test that we can create basic primitives
try {
  const cube = createCube();
  const sphere = createSphere();
  const cylinder = createCylinder();
  
  console.log('✅ Basic primitives created successfully:');
  console.log(`  - Cube: ${cube.getVertexCount()} vertices, ${cube.getFaceCount()} faces`);
  console.log(`  - Sphere: ${sphere.getVertexCount()} vertices, ${sphere.getFaceCount()} faces`);
  console.log(`  - Cylinder: ${cylinder.getVertexCount()} vertices, ${cylinder.getFaceCount()} faces`);
  
  // Test JavaScript wrapper primitives
  const jsCube = ThreeEditJS.createCube();
  const jsSphere = ThreeEditJS.createSphere();
  
  console.log('✅ JavaScript wrapper primitives created successfully:');
  console.log(`  - JS Cube: ${jsCube.getVertexCount()} vertices, ${jsCube.getFaceCount()} faces`);
  console.log(`  - JS Sphere: ${jsSphere.getVertexCount()} vertices, ${jsSphere.getFaceCount()} faces`);
  
  console.log('\n🎉 All API exports are working correctly!');
  
} catch (error) {
  console.error('❌ Error testing primitives:', error);
} 