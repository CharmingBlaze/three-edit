/**
 * @fileoverview Utils Index
 * Centralized exports for all utility modules in the editing system.
 */

// Core utility modules
export * from './uvHelpers.js';
export * from './edgeHelpers.js';
export * from './vertexHelpers.js';
export * from './faceHelpers.js';
export * from './advancedOperations.js';
export * from './objectManagement.js';
export * from './objectUtils.js';
export * from './idUtils.js';

// Legacy exports for backward compatibility
export { default as UVHelpers } from './uvHelpers.js';
export { default as EdgeHelpers } from './edgeHelpers.js';
export { default as VertexHelpers } from './vertexHelpers.js';
export { default as FaceHelpers } from './faceHelpers.js';
export { default as AdvancedOperations } from './advancedOperations.js';
export { default as ObjectManagement } from './objectManagement.js';
export { default as ObjectUtils } from './objectUtils.js';
export { default as IdUtils } from './idUtils.js'; 