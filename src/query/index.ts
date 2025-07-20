/**
 * Query utilities for analyzing and extracting information from EditableMesh structures.
 * @module query
 */

// Export from modular query system
export * from './types';
export * from './geometry';
export * from './nearest';
export * from './raycast';
export * from './queryGeometry';
export * from './querySelection';
export * from './queryTopology';

// Main query functions
export { findNearestElement, findNearestVertex, findNearestEdge, findNearestFace } from './nearest';
export { findRayIntersections, findFirstRayIntersection, hasRayIntersection } from './raycast';
export { closestPointOnLineSegment, closestPointOnTriangle } from './geometry';
