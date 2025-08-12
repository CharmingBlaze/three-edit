/**
 * Mesh module exports for three-edit
 * Unified mesh operations, queries, and analysis
 */

// Export query functions
export {
  getMeshStatistics,
  findOrphanedVertices,
  getUniqueMaterialCount,
  getUVCount,
  getNormalCount,
  calculateBoundingBox,
  findFacesByMaterial,
  getMaterialDistribution,
  findVerticesInRadius,
  findFacesContainingVertex,
  findEdgesConnectedToVertex,
  calculateSurfaceArea,
  calculateVolume
} from './queries';

// Export operation functions
export {
  centerVertices,
  scaleVertices,
  rotateVertices,
  transformVertices,
  createVertex,
  createFace,
  createFaceWithEdges,
  createEdge,
  createFaceEdges,
  createPrimitiveContext,
  normalizeOptions
} from './operations'; 