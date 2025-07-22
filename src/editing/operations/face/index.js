/**
 * @fileoverview Face Operations Index
 * Centralized exports for all face operations
 */

// Core face operations
export { extrudeFaces } from './extrudeFaces.js';
export { insetFaces } from './insetFaces.js';
export { bevelFaces } from './bevelFaces.js';
export { fillFaces } from './fillFaces.js';

// Default export with all face operations
export default {
  extrudeFaces: () => import('./extrudeFaces.js'),
  insetFaces: () => import('./insetFaces.js'),
  bevelFaces: () => import('./bevelFaces.js'),
  fillFaces: () => import('./fillFaces.js')
}; 