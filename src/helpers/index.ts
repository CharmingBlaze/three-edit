/**
 * Three-Edit Helpers - Barrel Export
 * 
 * This module exports all helper functions organized by category:
 * - Math utilities for common mathematical operations
 * - UV utilities for texture coordinate generation and manipulation
 * - Edge utilities for edge key generation and seam detection
 * - Normal utilities for face and vertex normal calculation
 * - Validation utilities for primitive options and geometry integrity
 * - Mesh utilities for mesh-level operations and statistics
 * - Geometry utilities for triangulation, vertex merging, and extrusion
 * - Debug utilities for development logging and mesh statistics
 */

// Math utilities
export * from './math';

// UV utilities
export * from './uv';

// Edge utilities
export * from './edge';

// Normal utilities
export * from './normal';

// Validation utilities
export * from './validation';

// Mesh utilities
export * from './mesh';

// Geometry utilities
export * from './geometry';

// Debug utilities
export * from './debug';

// Re-export commonly used types
// (These are defined inline below)

// Create a types file for shared interfaces
export interface UVGenerationParams {
  layout: 'planar' | 'spherical' | 'cylindrical' | 'box' | 'default';
  scale?: { x: number; y: number };
  offset?: { x: number; y: number };
  rotation?: number;
  seamThreshold?: number;
}

export interface NormalGenerationParams {
  smooth: boolean;
  angleThreshold?: number;
  areaWeighted?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PrimitiveValidationOptions {
  allowZero?: boolean;
  allowNegative?: boolean;
  minValue?: number;
  maxValue?: number;
  required?: boolean;
}

export interface DebugOptions {
  verbose?: boolean;
  includeWarnings?: boolean;
  includeGeometry?: boolean;
  includeTopology?: boolean;
  includeMaterials?: boolean;
} 