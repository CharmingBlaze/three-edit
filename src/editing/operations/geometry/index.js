/**
 * @fileoverview Geometry Operations Index
 * Centralized exports for all geometry operations
 */

// Core geometry operations
export { bevel } from './bevel.js';
export { extrude } from './extrude.js';

// Default export with all geometry operations
export default {
  bevel: () => import('./bevel.js'),
  extrude: () => import('./extrude.js')
}; 