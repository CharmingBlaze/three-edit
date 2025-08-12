/**
 * Geometry Type Definitions
 * Comprehensive TypeScript types for geometry operations and data structures
 */

import { Vector3 } from 'three';

/**
 * Basic 3D point interface
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * UV coordinate interface
 */
export interface UVCoord {
  u: number;
  v: number;
}

/**
 * Color interface
 */
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * Vertex data interface
 */
export interface VertexData {
  position: Point3D;
  normal?: Vector3;
  uv?: UVCoord;
  color?: Color;
  userData?: Record<string, any>;
}

/**
 * Face data interface
 */
export interface FaceData {
  vertices: number[];
  edges?: number[];
  materialIndex?: number;
  normal?: Vector3;
  userData?: Record<string, any>;
}

/**
 * Edge data interface
 */
export interface EdgeData {
  vertices: [number, number];
  faces?: number[];
  userData?: Record<string, any>;
}

/**
 * Bounding box interface
 */
export interface BoundingBox {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  size: Vector3;
}

/**
 * Triangle interface
 */
export interface Triangle {
  a: Vector3;
  b: Vector3;
  c: Vector3;
}

/**
 * Quad interface
 */
export interface Quad {
  a: Vector3;
  b: Vector3;
  c: Vector3;
  d: Vector3;
}

/**
 * Polygon interface (n-sided face)
 */
export interface Polygon {
  vertices: Vector3[];
}

/**
 * Geometry operation options
 */
export interface GeometryOptions {
  materialIndex?: number;
  generateNormals?: boolean;
  generateUVs?: boolean;
  generateColors?: boolean;
  userData?: Record<string, any>;
}

/**
 * Triangulation options
 */
export interface TriangulationOptions {
  method?: 'ear-clipping' | 'fan' | 'strip';
  preserveUVs?: boolean;
  preserveNormals?: boolean;
  tolerance?: number;
}

/**
 * Merging options
 */
export interface MergingOptions {
  threshold?: number;
  mergeByPosition?: boolean;
  mergeByUV?: boolean;
  mergeByNormal?: boolean;
  preserveTopology?: boolean;
}

/**
 * Extrusion options
 */
export interface ExtrusionOptions {
  direction: Vector3;
  distance: number;
  scale?: Vector3;
  rotation?: Vector3;
  generateCaps?: boolean;
  generateSides?: boolean;
}

/**
 * Subdivision options
 */
export interface SubdivisionOptions {
  method?: 'catmull-clark' | 'loop' | 'butterfly' | 'simple';
  iterations?: number;
  addCenterVertex?: boolean;
  preserveUVs?: boolean;
  preserveNormals?: boolean;
}

/**
 * Transformation options
 */
export interface TransformationOptions {
  translation?: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  pivot?: Vector3;
  matrix?: any; // Three.js Matrix4
}

/**
 * Geometry validation result
 */
export interface GeometryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  issues: {
    duplicateVertices?: number[];
    orphanedVertices?: number[];
    degenerateFaces?: number[];
    nonManifoldEdges?: number[];
    invalidNormals?: number[];
    invalidUVs?: number[];
  };
}

/**
 * Geometry statistics
 */
export interface GeometryStats {
  vertexCount: number;
  faceCount: number;
  edgeCount: number;
  triangleCount: number;
  quadCount: number;
  nGonCount: number;
  boundingBox: BoundingBox;
  surfaceArea: number;
  volume: number;
  hasNormals: boolean;
  hasUVs: boolean;
  hasColors: boolean;
}

/**
 * Geometry operation result
 */
export interface GeometryOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * Vertex operation result
 */
export interface VertexOperationResult {
  success: boolean;
  vertexIndex?: number;
  vertex?: any; // Vertex instance
  error?: string;
}

/**
 * Face operation result
 */
export interface FaceOperationResult {
  success: boolean;
  faceIndex?: number;
  face?: any; // Face instance
  error?: string;
}

/**
 * Edge operation result
 */
export interface EdgeOperationResult {
  success: boolean;
  edgeIndex?: number;
  edge?: any; // Edge instance
  error?: string;
}

/**
 * Mesh operation result
 */
export interface MeshOperationResult {
  success: boolean;
  mesh?: any; // EditableMesh instance
  modifiedVertices?: number[];
  modifiedFaces?: number[];
  modifiedEdges?: number[];
  error?: string;
}

/**
 * Geometry creation options
 */
export interface GeometryCreationOptions extends GeometryOptions {
  name?: string;
  id?: string;
  center?: Vector3;
  size?: Vector3;
  segments?: number;
  radius?: number;
  height?: number;
  width?: number;
  depth?: number;
}

/**
 * Primitive creation options
 */
export interface PrimitiveOptions extends GeometryCreationOptions {
  // Cube options
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
  
  // Sphere options
  phiSegments?: number;
  thetaSegments?: number;
  phiStart?: number;
  phiLength?: number;
  sphereThetaStart?: number;
  sphereThetaLength?: number;
  
  // Cylinder options
  radialSegments?: number;
  cylinderHeightSegments?: number;
  openEnded?: boolean;
  cylinderThetaStart?: number;
  cylinderThetaLength?: number;
  
  // Torus options
  tubularSegments?: number;
  arc?: number;
}

/**
 * Geometry import options
 */
export interface GeometryImportOptions {
  format: 'obj' | 'stl' | 'ply' | 'gltf' | 'glb';
  generateNormals?: boolean;
  generateUVs?: boolean;
  generateColors?: boolean;
  scale?: number;
  center?: boolean;
  flipNormals?: boolean;
  flipUVs?: boolean;
}

/**
 * Geometry export options
 */
export interface GeometryExportOptions {
  format: 'obj' | 'stl' | 'ply' | 'gltf' | 'glb';
  includeNormals?: boolean;
  includeUVs?: boolean;
  includeColors?: boolean;
  includeUserData?: boolean;
  binary?: boolean;
  pretty?: boolean;
}

/**
 * Geometry analysis options
 */
export interface GeometryAnalysisOptions {
  includeBoundingBox?: boolean;
  includeSurfaceArea?: boolean;
  includeVolume?: boolean;
  includeTopology?: boolean;
  includeNormals?: boolean;
  includeUVs?: boolean;
  tolerance?: number;
}

/**
 * Geometry repair options
 */
export interface GeometryRepairOptions {
  fixDuplicateVertices?: boolean;
  fixOrphanedVertices?: boolean;
  fixDegenerateFaces?: boolean;
  fixNonManifoldEdges?: boolean;
  fixNormals?: boolean;
  fixUVs?: boolean;
  tolerance?: number;
  threshold?: number;
}

/**
 * Geometry optimization options
 */
export interface GeometryOptimizationOptions {
  mergeVertices?: boolean;
  mergeFaces?: boolean;
  removeOrphanedVertices?: boolean;
  triangulate?: boolean;
  optimizeTopology?: boolean;
  tolerance?: number;
  threshold?: number;
}

/**
 * Geometry comparison options
 */
export interface GeometryComparisonOptions {
  comparePositions?: boolean;
  compareNormals?: boolean;
  compareUVs?: boolean;
  compareColors?: boolean;
  compareTopology?: boolean;
  tolerance?: number;
  threshold?: number;
}

/**
 * Geometry selection options
 */
export interface GeometrySelectionOptions {
  selectVertices?: boolean;
  selectEdges?: boolean;
  selectFaces?: boolean;
  selectByPosition?: boolean;
  selectByNormal?: boolean;
  selectByUV?: boolean;
  selectByColor?: boolean;
  radius?: number;
  tolerance?: number;
}

/**
 * Geometry modification options
 */
export interface GeometryModificationOptions {
  modifyVertices?: boolean;
  modifyEdges?: boolean;
  modifyFaces?: boolean;
  preserveTopology?: boolean;
  preserveNormals?: boolean;
  preserveUVs?: boolean;
  preserveColors?: boolean;
  tolerance?: number;
} 