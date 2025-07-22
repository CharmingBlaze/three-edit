/**
 * @fileoverview Split mesh into components
 * Provides functionality to split a mesh into disconnected components
 */

import * as THREE from 'three';
import { findDisconnectedComponents, createGeometryFromComponent } from './componentUtils.js';

/**
 * Split a mesh into disconnected components
 * @param {THREE.BufferGeometry} geometry - The geometry to split
 * @param {Object} options - Split options
 * @param {boolean} [options.rebuildEdges=true] - Whether to rebuild edges
 * @returns {Object} Operation result with success status and component geometries
 */
export function splitMesh(geometry, options = {}) {
  const { rebuildEdges = true } = options;
  
  if (!geometry) {
    return { success: false, errors: ['No geometry provided'], geometry: null };
  }

  try {
    // Find disconnected components
    const components = findDisconnectedComponents(geometry);
    
    // Create separate geometries for each component
    const componentGeometries = components.map(component => 
      createGeometryFromComponent(geometry, component)
    );

    return {
      success: true,
      geometries: componentGeometries,
      metadata: {
        componentCount: componentGeometries.length,
        rebuildEdges
      }
    };
  } catch (error) {
    return { success: false, errors: [error.message], geometry: null };
  }
} 