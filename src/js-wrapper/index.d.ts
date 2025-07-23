import { EditableMesh } from '../core/EditableMesh';
import { Vector3 } from 'three';
import * as THREE from 'three';

/**
 * ThreeEditJS - A JavaScript-friendly wrapper for three-edit
 */
declare const ThreeEditJS: {
  // Core functionality
  createMesh: () => EditableMesh;
  toBufferGeometry: (mesh: EditableMesh) => THREE.BufferGeometry;
  fromBufferGeometry: (geometry: THREE.BufferGeometry) => EditableMesh;
  toJSON: (mesh: EditableMesh) => any;
  fromJSON: (json: any) => EditableMesh;
  
  // Core classes
  EditableMesh: typeof EditableMesh;
  Vertex: any;
  Edge: any;
  Face: any;
  
  // Primitives
  createCube: (options?: any) => EditableMesh;
  createSphere: (options?: any) => EditableMesh;
  createCylinder: (options?: any) => EditableMesh;
  createCone: (options?: any) => EditableMesh;
  createPlane: (options?: any) => EditableMesh;
  createTorus: (options?: any) => EditableMesh;
  createTetrahedron: (options?: any) => EditableMesh;
  createOctahedron: (options?: any) => EditableMesh;
  createDodecahedron: (options?: any) => EditableMesh;
  createIcosahedron: (options?: any) => EditableMesh;
  createTorusKnot: (options?: any) => EditableMesh;
  createCircle: (options?: any) => EditableMesh;
  createPyramid: (options?: any) => EditableMesh;
  createCapsule: (options?: any) => EditableMesh;
  createLowPolySphere: (options?: any) => EditableMesh;
  createRoundedBox: (options?: any) => EditableMesh;
  createStairs: (options?: any) => EditableMesh;
  createRamp: (options?: any) => EditableMesh;
  createArrow: (options?: any) => EditableMesh;
  createNGon: (options?: any) => EditableMesh;
  createWedge: (options?: any) => EditableMesh;
  createPipe: (options?: any) => EditableMesh;
  createMobiusStrip: (options?: any) => EditableMesh;
  createHandle: (options?: any) => EditableMesh;
  createGreebleBlock: (options?: any) => EditableMesh;
  createBoundingBox: (options?: any) => EditableMesh;
  createEmpty: (options?: any) => EditableMesh;
  
  // Editing operations
  extrudeFace: (mesh: EditableMesh, face: any, options?: any) => void;
  extrudeEdge: (mesh: EditableMesh, edge: any, options?: any) => void;
  extrudeVertex: (mesh: EditableMesh, vertex: any, options?: any) => void;
  bevelEdge: (mesh: EditableMesh, edge: any, options?: any) => void;
  bevelVertex: (mesh: EditableMesh, vertex: any, options?: any) => void;
  bevelFace: (mesh: EditableMesh, face: any, options?: any) => void;
  bevel: (mesh: EditableMesh, selection: any, options?: any) => void;
  knifeCut: (mesh: EditableMesh, options?: any) => void;
  knifeCutLine: (mesh: EditableMesh, start: Vector3, end: Vector3, options?: any) => void;
  knifeCutPath: (mesh: EditableMesh, path: Vector3[], options?: any) => void;
  knifeCutCircle: (mesh: EditableMesh, center: Vector3, radius: number, options?: any) => void;
  insetFaces: (mesh: EditableMesh, faces: any[], options?: any) => void;
  insetAllFaces: (mesh: EditableMesh, options?: any) => void;
  insetIndividualFaces: (mesh: EditableMesh, faces: any[], options?: any) => void;
  bridgeEdges: (mesh: EditableMesh, edges1: any[], edges2: any[], options?: any) => void;
  bridgeEdgeSequence: (mesh: EditableMesh, edgeSequence: any[], options?: any) => void;
  bridgeFaces: (mesh: EditableMesh, faces1: any[], faces2: any[], options?: any) => void;
  bridgeSelectedEdges: (mesh: EditableMesh, options?: any) => void;
  cutEdgeLoop: (mesh: EditableMesh, edge: any, options?: any) => void;
  cutMultipleLoops: (mesh: EditableMesh, edges: any[], options?: any) => void;
  cutSelectedLoops: (mesh: EditableMesh, options?: any) => void;
  
  // Transform operations
  moveVertices: (mesh: EditableMesh, vertices: any[], offset: Vector3) => void;
  rotateVertices: (mesh: EditableMesh, vertices: any[], center: Vector3, axis: Vector3, angle: number) => void;
  scaleVertices: (mesh: EditableMesh, vertices: any[], center: Vector3, scale: Vector3) => void;
  mirrorVertices: (mesh: EditableMesh, vertices: any[], plane: any) => void;
  arrayVertices: (mesh: EditableMesh, vertices: any[], options?: any) => void;
  bendVertices: (mesh: EditableMesh, vertices: any[], options?: any) => void;
  twistVertices: (mesh: EditableMesh, vertices: any[], options?: any) => void;
  taperVertices: (mesh: EditableMesh, vertices: any[], options?: any) => void;
  deform: (mesh: EditableMesh, vertices: any[], options?: any) => void;
  applyNoise: (mesh: EditableMesh, vertices: any[], options?: any) => void;
  
  // Selection utilities
  selectByRay: (mesh: EditableMesh, ray: any, options?: any) => any[];
  selectByBox: (mesh: EditableMesh, box: any, options?: any) => any[];
  selectByCircle: (mesh: EditableMesh, center: Vector3, radius: number, options?: any) => any[];
  selectByLasso: (mesh: EditableMesh, points: Vector3[], options?: any) => any[];
  selectConnected: (mesh: EditableMesh, elements: any[], options?: any) => any[];
  selectSimilar: (mesh: EditableMesh, elements: any[], options?: any) => any[];
  selectFaceByRay: (mesh: EditableMesh, ray: any, options?: any) => any[];
  selectVertex: (mesh: EditableMesh, vertex: any, options?: any) => any[];
  
  // Boolean operations
  booleanUnion: (mesh1: EditableMesh, mesh2: EditableMesh, options?: any) => EditableMesh;
  booleanIntersection: (mesh1: EditableMesh, mesh2: EditableMesh, options?: any) => EditableMesh;
  booleanDifference: (mesh1: EditableMesh, mesh2: EditableMesh, options?: any) => EditableMesh;
  csgUnion: (mesh1: EditableMesh, mesh2: EditableMesh, options?: any) => EditableMesh;
  csgSubtract: (mesh1: EditableMesh, mesh2: EditableMesh, options?: any) => EditableMesh;
  csgIntersect: (mesh1: EditableMesh, mesh2: EditableMesh, options?: any) => EditableMesh;
  
  // Material operations
  assignMaterial: (mesh: EditableMesh, faces: any[], material: any) => void;
  MaterialManager: any;
  
  // UV operations
  generatePlanarUVs: (mesh: EditableMesh, options?: any) => void;
  generateCylindricalUVs: (mesh: EditableMesh, options?: any) => void;
  generateSphericalUVs: (mesh: EditableMesh, options?: any) => void;
  generateCubicUVs: (mesh: EditableMesh, options?: any) => void;
  generateUVs: (mesh: EditableMesh, options?: any) => void;
  transformUVs: (mesh: EditableMesh, transform: any) => void;
  
  // Validation operations
  validateMesh: (mesh: EditableMesh) => any;
  validateGeometryIntegrity: (mesh: EditableMesh) => any;
  repairMesh: (mesh: EditableMesh, options?: any) => void;
  fixWindingOrder: (mesh: EditableMesh) => void;
  
  // IO operations
  parseOBJ: (content: string, options?: any) => EditableMesh;
  exportOBJ: (mesh: EditableMesh, options?: any) => string;
  loadOBJ: (url: string, options?: any) => Promise<EditableMesh>;
  saveOBJ: (mesh: EditableMesh, filename: string, options?: any) => Promise<void>;
  importGLTF: (data: any, options?: any) => EditableMesh;
  exportGLTF: (mesh: EditableMesh, options?: any) => any;
  parsePLY: (content: string | ArrayBuffer, options?: any) => EditableMesh;
  exportPLY: (mesh: EditableMesh, options?: any) => string;
  loadPLY: (url: string, options?: any) => Promise<EditableMesh>;
  savePLY: (mesh: EditableMesh, filename: string, options?: any) => Promise<void>;
  importSTL: (data: string | ArrayBuffer) => EditableMesh[];
  exportSTL: (meshes: EditableMesh[], options?: any) => string;
  validateSTL: (data: string | ArrayBuffer) => boolean;
  getSTLInfo: (data: string | ArrayBuffer) => any;
  
  // Utility functions
  calculateFaceNormal: (face: any) => Vector3;
  calculateFaceCenter: (face: any) => Vector3;
  
  // Query operations
  queryGeometry: (mesh: EditableMesh, options?: any) => any;
  findNearestElement: (mesh: EditableMesh, point: Vector3, options?: any) => any;
  findNearestVertex: (mesh: EditableMesh, point: Vector3, options?: any) => any;
  findNearestEdge: (mesh: EditableMesh, point: Vector3, options?: any) => any;
  findNearestFace: (mesh: EditableMesh, point: Vector3, options?: any) => any;
  querySelection: (mesh: EditableMesh, selection: any, options?: any) => any;
  queryTopology: (mesh: EditableMesh, options?: any) => any;
  
  // History operations
  CommandHistory: any;
  CommandFactory: any;
  
  // Scene operations
  SceneGraph: any;
  SceneNode: any;
  
  // Topology operations
  EdgeKeyCache: any;
  compareVertices: (v1: any, v2: any, threshold?: number) => boolean;
  canWeldVertices: (v1: any, v2: any, threshold?: number) => boolean;
  
  // Helper functions
  mergeVertices: (vertices: any[], faces: any[], threshold?: number) => any;
  triangulatePolygon: (vertices: any[], face: any) => any[];
  subdivideFace: (vertices: any[], face: any, addCenterVertex?: boolean) => any;
  extrudeFaceHelper: (vertices: any[], face: any, direction: Vector3, distance: number) => any;
  createVertexGrid: (width: number, height: number, generator: Function) => any[][];
  createFacesFromGrid: (grid: any[][], materialIndex?: number) => any[];
  
  // Helper methods for JavaScript users
  createFromThreeGeometry: (geometry: THREE.BufferGeometry) => EditableMesh;
  applyOperation: (mesh: EditableMesh, operation: Function, ...args: any[]) => THREE.BufferGeometry;
  createSceneGraph: () => Promise<any>;
  getPrimitives: () => any;
  getOperations: () => any;
  getSelection: () => any;
  getIO: () => any;
  getValidation: () => any;
  getPerformance: () => any;
};

export default ThreeEditJS;
