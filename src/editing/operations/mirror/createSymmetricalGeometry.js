/**
 * @fileoverview Create symmetrical geometry
 * Provides functionality to create symmetrical geometry along specified axes
 */

import * as THREE from 'three';
import { mirrorGeometry } from './mirrorGeometry.js';

/**
 * Create symmetrical geometry
 * @param {THREE.BufferGeometry} geometry - The geometry to make symmetrical
 * @param {Object} options - Symmetry options
 * @param {string} [options.axis='x'] - Symmetry axis: 'x', 'y', 'z'
 * @param {number} [options.position=0] - Position of symmetry plane
 * @returns {Object} Operation result with success status and symmetrical geometry
 */
export function createSymmetricalGeometry(geometry, options = {}) {
  const { axis = 'x', position = 0 } = options;
  
  if (!geometry) {
    return { success: false, errors: ['No geometry provided'], geometry: null };
  }

  try {
    const normal = new THREE.Vector3();
    const point = new THREE.Vector3();
    
    // Set up plane based on axis
    switch (axis.toLowerCase()) {
      case 'x':
        normal.set(1, 0, 0);
        point.set(position, 0, 0);
        break;
      case 'y':
        normal.set(0, 1, 0);
        point.set(0, position, 0);
        break;
      case 'z':
        normal.set(0, 0, 1);
        point.set(0, 0, position);
        break;
      default:
        return { success: false, errors: ['Invalid axis specified'], geometry: null };
    }
    
    const plane = { normal, point };
    return mirrorGeometry(geometry, plane, { merge: true });
  } catch (error) {
    return { success: false, errors: [error.message], geometry: null };
  }
} 