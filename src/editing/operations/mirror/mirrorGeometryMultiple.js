/**
 * @fileoverview Mirror geometry across multiple planes
 * Provides functionality to mirror geometry across multiple planes
 */

import * as THREE from 'three';
import { mirrorGeometry } from './mirrorGeometry.js';

/**
 * Mirror geometry across multiple planes
 * @param {THREE.BufferGeometry} geometry - The geometry to mirror
 * @param {Array<Object>} planes - Array of mirror planes
 * @param {Object} options - Mirror options
 * @param {boolean} [options.merge=true] - Whether to merge results
 * @returns {Object} Operation result with success status and mirrored geometry
 */
export function mirrorGeometryMultiple(geometry, planes, options = {}) {
  const { merge = true } = options;
  
  if (!geometry) {
    return { success: false, errors: ['No geometry provided'], geometry: null };
  }

  if (!planes || planes.length === 0) {
    return { success: false, errors: ['No planes provided'], geometry: null };
  }

  try {
    let resultGeometry = geometry.clone();
    
    // Apply each mirror plane
    for (const plane of planes) {
      const mirrorResult = mirrorGeometry(resultGeometry, plane, { merge: false });
      if (mirrorResult.success) {
        resultGeometry = mirrorResult.geometry;
      }
    }

    return {
      success: true,
      geometry: resultGeometry,
      metadata: {
        planeCount: planes.length,
        merge
      }
    };
  } catch (error) {
    return { success: false, errors: [error.message], geometry: null };
  }
} 