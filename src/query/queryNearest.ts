// Re-export from modular structure
export * from './types';
export * from './geometry';
export * from './nearest';
export * from './raycast';

// Legacy exports for backward compatibility
import { findNearestElement, findNearestVertex, findNearestEdge, findNearestFace } from './nearest';
import { findRayIntersections, findFirstRayIntersection, hasRayIntersection } from './raycast';
import { closestPointOnLineSegment, closestPointOnTriangle } from './geometry';

export {
  findNearestElement,
  findNearestVertex,
  findNearestEdge,
  findNearestFace,
  findRayIntersections,
  findFirstRayIntersection,
  hasRayIntersection,
  closestPointOnLineSegment,
  closestPointOnTriangle
};
