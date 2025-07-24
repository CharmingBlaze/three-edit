/**
 * Three-Edit Helpers - Main export file
 * Provides access to all helper functions organized by category
 * 
 * 🧮 Math Utilities:
 * - math.ts: Low-level math utilities (clamp, lerp, roundTo, etc.)
 * - math/vector-math.ts: Vector operations (distance, dot/cross product, etc.)
 * - math/triangle-math.ts: Triangle-specific calculations
 * 
 * 📐 Geometry Tools:
 * - geometry.ts: Generic geometric tools (triangulation, merging, extrusion)
 * - geometry/vertex-operations.ts: Vertex manipulation
 * - geometry/face-operations.ts: Face operations
 * 
 * 🧱 Primitive Helpers:
 * - primitives/: Complete modular primitive creation system
 * 
 * 🔗 Other Helpers:
 * - edge.ts: Topology-aware edge helpers
 * - uv.ts: UV mapping logic
 * - normal.ts: Normal vector calculations
 * - validation.ts: Mesh validation utilities
 * - mesh.ts: EditableMesh query helpers
 * - debug.ts: Developer debugging utilities
 */

// Core math utilities - export main math.ts for basic functions
export * from './math';

// Modular math helpers - avoid conflicts by using specific exports
export {
  distanceSquared3D,
  distance3D,
  dotProduct,
  crossProduct,
  vectorLength,
  normalizeVector,
  addVectors,
  subtractVectors,
  multiplyVectorByScalar,
  angleBetweenVectors,
  midpoint,
  centroid,
  vectorsEqual,
  reflectVector,
  projectVector
} from './math/vector-math';

export {
  calculateTriangleArea,
  calculateTriangleNormal,
  calculateTriangleCentroid,
  calculateBarycentricCoordinates,
  closestPointOnTriangle,
  calculateTriangleCircumcenter,
  calculateTriangleIncenter
} from './math/triangle-math';

// Geometry helpers - export main geometry.ts for core functions
export * from './geometry';

// Modular geometry helpers - avoid conflicts
export {
  mergeVertices,
  centerVertices,
  scaleVertices,
  rotateVertices,
  transformVertices,
  findVerticesInRadius,
  createVertexGrid,
  calculateBoundingBox
} from './geometry/vertex-operations';

export {
  triangulatePolygon,
  subdivideFace,
  extrudeFace,
  createFacesFromGrid
} from './geometry/face-operations';

// Primitive creation helpers - NEW MODULAR SYSTEM
export * from './primitives/types';
export * from './primitives/geometry-builders';
export * from './primitives/transform-helpers';
export * from './primitives/basic-shapes';
export * from './primitives/complex-shapes';
export * from './primitives/parametric-shapes';

// Note: Individual primitive helper modules are available for import:
// - primitives/vertex-generators: createVertex, createGridVertices, etc.
// - primitives/face-generators: createFace, createGridFaces, etc.  
// - primitives/uv-generators: generateUVs, generatePlanarUVs, etc.

// Other helper categories
export * from './uv';
export * from './uv-additional'; // Additional UV functions with exact signatures
export * from './edge';
export * from './normal';
export * from './validation';
// Note: mesh.ts exports are included in validation.ts, so we don't need to export mesh separately
export * from './debug';

// Editor helper modules
export * from './highlight';
export * from './grid';
export * from './overlay';

// Shared interfaces and types
export interface HelperOptions {
  materialIndex?: number;
  userData?: Record<string, any>;
}

export interface GeometryHelperResult {
  vertices: any[];
  faces: any[];
  edges?: any[];
  vertexCount: number;
  faceCount: number;
  edgeCount?: number;
}

// Re-export commonly used types for convenience
export type { PrimitiveResult } from './primitives/types';
export type { VertexOptions, FaceOptions } from './primitives/types'; 