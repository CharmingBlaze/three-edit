/**
 * @fileoverview Mirror Operations
 * Modular mirror operations for mesh reflection and symmetry
 */

import * as THREE from 'three';
import { getVerticesFromIndices } from '../core/geometryUtils.js';
import { reflectPointAcrossPlane } from '../core/mathUtils.js';

/**
 * Mirror geometry across a plane
 * @param {THREE.BufferGeometry} geometry - The geometry to mirror
 * @param {Object} plane - Mirror plane definition
 * @param {THREE.Vector3} plane.normal - Plane normal vector
 * @param {THREE.Vector3} plane.point - Point on the plane
 * @param {Object} options - Mirror options
 * @param {boolean} [options.merge=true] - Whether to merge with original
 * @param {boolean} [options.flipNormals=false] - Whether to flip face normals
 * @returns {Object} Operation result
 */
export function mirrorGeometry(geometry, plane, options = {}) {
  const { merge = true, flipNormals = false } = options;
  
  if (!geometry) {
    return { success: false, errors: ['No geometry provided'], geometry: null };
  }

  if (!plane || !plane.normal || !plane.point) {
    return { success: false, errors: ['Invalid plane definition'], geometry: null };
  }

  try {
    const newGeometry = geometry.clone();
    const positions = newGeometry.attributes.position;
    
    // Mirror each vertex
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positions, i);
      
      const mirroredVertex = reflectPointAcrossPlane(vertex, plane.normal, plane.point);
      
      positions.setXYZ(i, mirroredVertex.x, mirroredVertex.y, mirroredVertex.z);
    }
    
    // Update normals if needed
    if (flipNormals && newGeometry.attributes.normal) {
      const normals = newGeometry.attributes.normal;
      for (let i = 0; i < normals.count; i++) {
        const normal = new THREE.Vector3();
        normal.fromBufferAttribute(normals, i);
        normal.negate();
        normals.setXYZ(i, normal.x, normal.y, normal.z);
      }
    }

    return {
      success: true,
      geometry: newGeometry,
      metadata: {
        mirroredVertices: positions.count,
        merge,
        flipNormals
      }
    };
  } catch (error) {
    return { success: false, errors: [error.message], geometry: null };
  }
}

/**
 * Mirror geometry across multiple planes
 * @param {THREE.BufferGeometry} geometry - The geometry to mirror
 * @param {Array<Object>} planes - Array of mirror planes
 * @param {Object} options - Mirror options
 * @param {boolean} [options.merge=true] - Whether to merge results
 * @returns {Object} Operation result
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

/**
 * Create symmetrical geometry
 * @param {THREE.BufferGeometry} geometry - The geometry to make symmetrical
 * @param {Object} options - Symmetry options
 * @param {string} [options.axis='x'] - Symmetry axis: 'x', 'y', 'z'
 * @param {number} [options.position=0] - Position of symmetry plane
 * @returns {Object} Operation result
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

// Export the MirrorOperations object for backward compatibility
export const MirrorOperations = {
  mirrorGeometry,
  mirrorGeometryMultiple,
  createSymmetricalGeometry
}; 