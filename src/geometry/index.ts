/**
 * Unified Geometry Operations for Three-Edit
 * 
 * This module consolidates all geometry operations from scattered files
 * into a single, well-organized system. It provides:
 * 
 * - Triangulation operations
 * - Vertex and face merging
 * - Core geometry operations (extrusion, subdivision, transformation)
 * - Grid creation and manipulation
 * 
 * All functions are pure, well-typed, and follow consistent patterns.
 */

// Export triangulation operations
export * from './triangulation';

// Export merging operations
export * from './merging';

// Export core operations
export * from './operations';

// Re-export commonly used types for convenience
export type { Vector3 } from 'three'; 