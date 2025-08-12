/**
 * Validation module exports for three-edit
 * Unified validation system for mesh integrity and geometry
 */

// Export types
export * from './types';

// Export mesh validation functions
export {
  validateMesh,
  validateTopology,
  findOrphanedVertices,
  mergeVerticesWithFaces
} from './mesh';

// Export geometry validation functions
export {
  validateGeometry
} from './geometry';

// Export topology validation functions
export {
  validateTopology as validateTopologyDetailed,
  findOrphanedVertices as findOrphanedVerticesTopology,
  findNonManifoldEdges,
  findBoundaryEdges,
  findConnectedComponents,
  isWatertight,
  isManifold,
  calculateGenus
} from './topology';

// Re-export primitive validation functions from the original validation file
// These will be moved to separate modules in the future
export {
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
} from '../helpers/validation'; 