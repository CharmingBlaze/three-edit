/**
 * @fileoverview Raycasting Index
 * Centralized exports for all raycasting modules
 */

// Raycasting modules
export * from './vertexRaycaster.js';
export * from './edgeRaycaster.js';

// Legacy exports for backward compatibility
export { selectVerticesByRay, raycastVertex } from './vertexRaycaster.js';
export { selectEdgesByRay, raycastEdge } from './edgeRaycaster.js'; 