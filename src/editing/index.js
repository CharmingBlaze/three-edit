/**
 * @fileoverview Editing System Index
 * Main entry point for the modular editing system
 */

// --- Operation Modules ---
export { GeometryOperations } from './geometryOperations.js';
export { VertexOperations } from './vertexOperations.js';
export { EdgeOperations } from './edgeOperations.js';
export { FaceOperations } from './faceOperations.js';
export { UVOperations } from './uvOperations.js';

// Import all modular components
export * from './types/index.js';
export * from './validation/index.js';
export * from './core/index.js';
// export * from './operations/index.js'; // Deprecated
export * from './tools/index.js';
export { DrawingOperations } from './operations/drawingOperations.js';
export { SculptingOperations } from './operations/sculptingOperations.js';
export { ObjectOperations } from './operations/objectOperations.js';
export { MirrorOperations } from './operations/mirrorOperations.js';

// Factory functions for creating operation instances
export const createGeometryOperations = () => GeometryOperations;
export const createVertexOperations = () => VertexOperations;
export const createEdgeOperations = () => EdgeOperations;
export const createFaceOperations = () => FaceOperations;
export const createUVOperations = () => UVOperations;

export { SelectTool } from './tools/selectTool.js';
export { TransformTool } from './tools/transformTool.js';

export { ModernEditManager } from './core/modernEditManager.js';
export { EditStateManager } from './core/editState.js';
export { EditHistoryManager } from './core/editHistory.js';
export { EditOperationsCoordinator } from './core/editOperations.js';

// Re-export commonly used utilities
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
  DrawingOperations: () => import('./operations/drawingOperations.js'),
  SculptingOperations: () => import('./operations/sculptingOperations.js'),
  ObjectOperations: () => import('./operations/objectOperations.js'),
  MirrorOperations: () => import('./operations/mirrorOperations.js'),
  
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
  EditToolStates: () => import('./types/operationTypes.js'),
  EditStates: () => import('./types/constants.js'),
  EditSpaces: () => import('./types/constants.js'),
  EditSnapModes: () => import('./types/constants.js'),
  EditBooleanOperations: () => import('./types/constants.js'),
  EditArrayModes: () => import('./types/constants.js'),
  DefaultValues: () => import('./types/constants.js'),
  ValidationLimits: () => import('./types/constants.js')
};