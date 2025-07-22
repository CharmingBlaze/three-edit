/**
 * @fileoverview Vertex Operations Index
 * Centralized exports for all vertex operations
 */

// Core vertex operations
export { snapVertices } from './snapVertices.js';
export { mergeVertices } from './mergeVertices.js';
export { splitVertices } from './splitVertices.js';
export { smoothVertices } from './smoothVertices.js';
export { connectVertices } from './connectVertices.js';

// Default export with all vertex operations
export default {
  snapVertices: () => import('./snapVertices.js'),
  mergeVertices: () => import('./mergeVertices.js'),
  splitVertices: () => import('./splitVertices.js'),
  smoothVertices: () => import('./smoothVertices.js'),
  connectVertices: () => import('./connectVertices.js')
}; 