/**
 * @fileoverview Modern Selection Index
 * Centralized exports for the modern modular selection system
 */

// Core selection components
export { ModernMeshSelector } from './modernMeshSelector.js';

// Raycasting modules
export * from './raycasting/index.js';

// Legacy exports for backward compatibility
export { ModernMeshSelector as MeshSelector } from './modernMeshSelector.js'; 