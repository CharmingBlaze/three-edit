/**
 * Geometry Helpers - Modular geometry operations
 * 
 * This module provides pure functions for geometry operations:
 * - Vertex operations: merging, transforming, finding vertices
 * - Face operations: triangulation, subdivision, extrusion
 * - Math operations: vector and triangle calculations
 */

// Vertex operations
export * from './vertex-operations';

// Face operations
export * from './face-operations';

// Math operations
export * from '../math/vector-math';
export * from '../math/triangle-math';

// Re-export commonly used functions for convenience
export {
  mergeVertices,
  centerVertices,
  scaleVertices,
  rotateVertices,
  transformVertices,
  findVerticesInRadius,
  createVertexGrid,
  calculateBoundingBox
} from './vertex-operations';

export {
  triangulatePolygon,
  subdivideFace,
  extrudeFace,
  createFacesFromGrid
} from './face-operations';

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
} from '../math/vector-math';

export {
  isValidTriangle,
  calculateTriangleArea,
  calculateTriangleNormal,
  calculateTriangleCentroid,
  pointInTriangle,
  calculateBarycentricCoordinates,
  closestPointOnTriangle,
  calculateTriangleCircumcenter,
  calculateTriangleIncenter
} from '../math/triangle-math'; 