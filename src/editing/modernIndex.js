/**
 * @fileoverview Modern Editing System Index
 * Clean, modular exports for the refactored editing system
 */

// Core types and enums
export * from './types/index.js';

// Validation system
export * from './validation/index.js';

// Core utilities and components
export * from './core/index.js';

// Operations
export * from './operations/index.js';

// Tools
export * from './tools/index.js';

// Legacy compatibility exports
export { GeometryOperations } from './operations/geometryOperations.js';
export { VertexOperations } from './operations/vertexOperations.js';
export { EdgeOperations } from './operations/edgeOperations.js';
export { FaceOperations } from './operations/faceOperations.js';
export { UVOperations } from './operations/uvOperations.js';

export { SelectTool } from './tools/selectTool.js';
export { TransformTool } from './tools/transformTool.js';

export { ModernEditManager } from './core/modernEditManager.js';
export { EditStateManager } from './core/editState.js';
export { EditHistoryManager } from './core/editHistory.js';
export { EditOperationsCoordinator } from './core/editOperations.js';

// Re-export core utilities for easy access
export { 
  getVerticesFromIndices,
  getFaceVertices,
  getEdges,
  getAdjacentFaces,
  calculateFaceNormal,
  calculateFaceCenter,
  createGeometryFromVertices,
  cloneGeometryWithPositions,
  mergeGeometries,
  isValidGeometry
} from './core/geometryUtils.js';

export {
  distance,
  distanceSquared,
  closestPointOnLine,
  closestPointOnPlane,
  angleBetweenVectors,
  interpolatePoints,
  calculateCentroid,
  calculateBoundingBox,
  calculateBoundingSphere,
  rotatePointAroundAxis,
  scalePointFromCenter,
  reflectPointAcrossPlane,
  calculateTriangleArea,
  calculateTetrahedronVolume,
  isPointInTriangle,
  signedDistanceToPlane,
  clamp,
  lerp,
  smoothstep
} from './core/mathUtils.js';

// Default export with all components
export default {
  // Operations
  GeometryOperations: () => import('./operations/geometryOperations.js'),
  VertexOperations: () => import('./operations/vertexOperations.js'),
  EdgeOperations: () => import('./operations/edgeOperations.js'),
  FaceOperations: () => import('./operations/faceOperations.js'),
  UVOperations: () => import('./operations/uvOperations.js'),
  
  // Tools
  SelectTool: () => import('./tools/selectTool.js'),
  TransformTool: () => import('./tools/transformTool.js'),
  
  // Core components
  ModernEditManager: () => import('./core/modernEditManager.js'),
  EditStateManager: () => import('./core/editState.js'),
  EditHistoryManager: () => import('./core/editHistory.js'),
  EditOperationsCoordinator: () => import('./core/editOperations.js'),
  
  // Validation
  GeometryOperationValidator: () => import('./validation/operationValidator.js'),
  VertexOperationValidator: () => import('./validation/operationValidator.js'),
  EdgeOperationValidator: () => import('./validation/operationValidator.js'),
  FaceOperationValidator: () => import('./validation/operationValidator.js'),
  UVOperationValidator: () => import('./validation/operationValidator.js'),
  
  // Types
  GeometryOperationTypes: () => import('./types/operationTypes.js'),
  VertexOperationTypes: () => import('./types/operationTypes.js'),
  EdgeOperationTypes: () => import('./types/operationTypes.js'),
  FaceOperationTypes: () => import('./types/operationTypes.js'),
  UVOperationTypes: () => import('./types/operationTypes.js'),
  EditTypes: () => import('./types/operationTypes.js'),
  EditModes: () => import('./types/operationTypes.js'),
  EditToolStates: () => import('./types/operationTypes.js')
}; 