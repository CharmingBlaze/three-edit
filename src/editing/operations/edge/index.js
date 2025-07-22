/**
 * @fileoverview Edge Operations Index
 * Centralized exports for all edge operations
 */

// Core edge operations
export { splitEdges } from './splitEdges.js';
export { collapseEdges } from './collapseEdges.js';
export { dissolveEdges } from './dissolveEdges.js';
export { bevelEdges } from './bevelEdges.js';
export { extrudeEdges } from './extrudeEdges.js';

// Default export with all edge operations
export default {
  splitEdges: () => import('./splitEdges.js'),
  collapseEdges: () => import('./collapseEdges.js'),
  dissolveEdges: () => import('./dissolveEdges.js'),
  bevelEdges: () => import('./bevelEdges.js'),
  extrudeEdges: () => import('./extrudeEdges.js')
}; 