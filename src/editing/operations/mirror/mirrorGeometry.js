/**
 * @fileoverview Mirror geometry across plane
 * Provides functionality to mirror geometry across a defined plane
 */

import * as THREE from 'three';
import { reflectPointAcrossPlane } from '../../core/mathUtils.js';

/**
 * Mirror geometry across a plane
 * @param {THREE.BufferGeometry} geometry - The geometry to mirror
 * @param {Object} plane - Mirror plane definition
 * @param {THREE.Vector3} plane.normal - Plane normal vector
 * @param {THREE.Vector3} plane.point - Point on the plane
 * @param {Object} options - Mirror options
 * @param {boolean} [options.merge=true] - Whether to merge with original
 * @param {boolean} [options.flipNormals=false] - Whether to flip face normals
 * @returns {Object} Operation result with success status and mirrored geometry
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