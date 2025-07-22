/**
 * @fileoverview Pack UVs Operation
 * Efficiently packs UV islands into the 0-1 UV space
 */

import * as THREE from 'three';
import { UVOperationTypes } from '../../types/operationTypes.js';
import { UVOperationValidator } from '../../validation/operationValidator.js';

/**
 * Packs UV islands efficiently into the 0-1 UV space
 * @param {THREE.BufferGeometry} geometry - The geometry to modify
 * @param {Object} options - Configuration options
 * @param {number} [options.margin=0.01] - Margin between UV islands
 * @param {boolean} [options.rotate=true] - Allow rotation of islands for better packing
 * @param {string} [options.algorithm='shelf'] - Packing algorithm: 'shelf', 'bin', 'skyline'
 * @param {number} [options.maxWidth=1.0] - Maximum width for packing
 * @param {number} [options.maxHeight=1.0] - Maximum height for packing
 * @returns {Object} Operation result with success status and modified geometry
 */
export function packUVs(geometry, options = {}) {
  const validator = new UVOperationValidator();
  const validation = validator.validateParams({ geometry, options }, UVOperationTypes.PACK);
  
  if (!validation.isValid) {
    return { success: false, errors: validation.errors, geometry: null };
  }

  const { 
    margin = 0.01, 
    rotate = true, 
    algorithm = 'shelf',
    maxWidth = 1.0,
    maxHeight = 1.0
  } = options;
  
  try {
    const newGeometry = geometry.clone();
    const uvAttribute = newGeometry.getAttribute('uv');
    
    if (!uvAttribute) {
      return { 
        success: false, 
        errors: ['Geometry must have UV attribute'], 
        geometry: null 
      };
    }

    // Extract UV islands
    const islands = extractUVIslands(newGeometry);
    
    if (islands.length === 0) {
      return { 
        success: false, 
        errors: ['No UV islands found to pack'], 
        geometry: null 
      };
    }

    // Pack islands based on algorithm
    let packedIslands;
    switch (algorithm) {
      case 'shelf':
        packedIslands = packWithShelfAlgorithm(islands, margin, rotate, maxWidth, maxHeight);
        break;
      case 'bin':
        packedIslands = packWithBinAlgorithm(islands, margin, rotate, maxWidth, maxHeight);
        break;
      case 'skyline':
        packedIslands = packWithSkylineAlgorithm(islands, margin, rotate, maxWidth, maxHeight);
        break;
      default:
        packedIslands = packWithShelfAlgorithm(islands, margin, rotate, maxWidth, maxHeight);
    }

    // Apply packed coordinates back to geometry
    applyPackedIslands(newGeometry, packedIslands);

    return {
      success: true,
      geometry: newGeometry,
      metadata: {
        islandCount: islands.length,
        algorithm,
        margin,
        rotate,
        maxWidth,
        maxHeight
      }
    };
  } catch (error) {
    return { success: false, errors: [error.message], geometry: null };
  }
}

/**
 * Extract UV islands from geometry
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @returns {Array<Object>} Array of UV islands
 */
function extractUVIslands(geometry) {
  const uvAttribute = geometry.getAttribute('uv');
  const indexAttribute = geometry.getIndex();
  const islands = [];
  const visited = new Set();

  if (!indexAttribute) {
    // Non-indexed geometry - treat each vertex as an island
    for (let i = 0; i < uvAttribute.count; i++) {
      const u = uvAttribute.getX(i);
      const v = uvAttribute.getY(i);
      islands.push({
        vertices: [i],
        bounds: { minX: u, maxX: u, minY: v, maxY: v },
        center: new THREE.Vector2(u, v)
      });
    }
    return islands;
  }

  const indices = indexAttribute.array;
  
  // Group connected faces into islands
  for (let i = 0; i < indices.length; i += 3) {
    if (visited.has(i)) continue;
    
    const island = {
      vertices: new Set(),
      faces: [],
      bounds: { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    };
    
    const stack = [i];
    while (stack.length > 0) {
      const faceIndex = stack.pop();
      if (visited.has(faceIndex)) continue;
      
      visited.add(faceIndex);
      island.faces.push(faceIndex);
      
      const v1 = indices[faceIndex];
      const v2 = indices[faceIndex + 1];
      const v3 = indices[faceIndex + 2];
      
      island.vertices.add(v1);
      island.vertices.add(v2);
      island.vertices.add(v3);
      
      // Update bounds
      [v1, v2, v3].forEach(vertexIndex => {
        const u = uvAttribute.getX(vertexIndex);
        const v = uvAttribute.getY(vertexIndex);
        
        island.bounds.minX = Math.min(island.bounds.minX, u);
        island.bounds.maxX = Math.max(island.bounds.maxX, u);
        island.bounds.minY = Math.min(island.bounds.minY, v);
        island.bounds.maxY = Math.max(island.bounds.maxY, v);
      });
      
      // Find connected faces
      for (let j = 0; j < indices.length; j += 3) {
        if (visited.has(j)) continue;
        
        const jv1 = indices[j];
        const jv2 = indices[j + 1];
        const jv3 = indices[j + 2];
        
        // Check if faces share an edge
        if (sharesEdge([v1, v2, v3], [jv1, jv2, jv3])) {
          stack.push(j);
        }
      }
    }
    
    // Convert Set to Array and calculate center
    island.vertices = Array.from(island.vertices);
    island.center = new THREE.Vector2(
      (island.bounds.minX + island.bounds.maxX) / 2,
      (island.bounds.minY + island.bounds.maxY) / 2
    );
    
    islands.push(island);
  }
  
  return islands;
}

/**
 * Check if two faces share an edge
 * @param {Array<number>} face1 - First face vertices
 * @param {Array<number>} face2 - Second face vertices
 * @returns {boolean} True if faces share an edge
 */
function sharesEdge(face1, face2) {
  const edges1 = [
    [face1[0], face1[1]],
    [face1[1], face1[2]],
    [face1[2], face1[0]]
  ];
  
  const edges2 = [
    [face2[0], face2[1]],
    [face2[1], face2[2]],
    [face2[2], face2[0]]
  ];
  
  for (const edge1 of edges1) {
    for (const edge2 of edges2) {
      if ((edge1[0] === edge2[0] && edge1[1] === edge2[1]) ||
          (edge1[0] === edge2[1] && edge1[1] === edge2[0])) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Pack islands using shelf algorithm
 * @param {Array<Object>} islands - Array of UV islands
 * @param {number} margin - Margin between islands
 * @param {boolean} rotate - Allow rotation
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Array<Object>} Packed islands
 */
function packWithShelfAlgorithm(islands, margin, rotate, maxWidth, maxHeight) {
  // Sort islands by height (descending)
  const sortedIslands = [...islands].sort((a, b) => {
    const heightA = a.bounds.maxY - a.bounds.minY;
    const heightB = b.bounds.maxY - b.bounds.minY;
    return heightB - heightA;
  });
  
  const packedIslands = [];
  let currentY = 0;
  let currentX = 0;
  let rowHeight = 0;
  
  for (const island of sortedIslands) {
    const width = island.bounds.maxX - island.bounds.minX;
    const height = island.bounds.maxY - island.bounds.minY;
    
    // Check if island fits in current row
    if (currentX + width + margin > maxWidth) {
      // Start new row
      currentX = 0;
      currentY += rowHeight + margin;
      rowHeight = 0;
    }
    
    // Check if we've exceeded max height
    if (currentY + height > maxHeight) {
      break;
    }
    
    // Position island
    const offsetX = currentX - island.bounds.minX;
    const offsetY = currentY - island.bounds.minY;
    
    packedIslands.push({
      ...island,
      offset: new THREE.Vector2(offsetX, offsetY)
    });
    
    currentX += width + margin;
    rowHeight = Math.max(rowHeight, height);
  }
  
  return packedIslands;
}

/**
 * Pack islands using bin algorithm
 * @param {Array<Object>} islands - Array of UV islands
 * @param {number} margin - Margin between islands
 * @param {boolean} rotate - Allow rotation
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Array<Object>} Packed islands
 */
function packWithBinAlgorithm(islands, margin, rotate, maxWidth, maxHeight) {
  // Simple bin packing - can be enhanced with more sophisticated algorithms
  return packWithShelfAlgorithm(islands, margin, rotate, maxWidth, maxHeight);
}

/**
 * Pack islands using skyline algorithm
 * @param {Array<Object>} islands - Array of UV islands
 * @param {number} margin - Margin between islands
 * @param {boolean} rotate - Allow rotation
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Array<Object>} Packed islands
 */
function packWithSkylineAlgorithm(islands, margin, rotate, maxWidth, maxHeight) {
  // Skyline packing - can be enhanced with more sophisticated algorithms
  return packWithShelfAlgorithm(islands, margin, rotate, maxWidth, maxHeight);
}

/**
 * Apply packed islands back to geometry
 * @param {THREE.BufferGeometry} geometry - The geometry
 * @param {Array<Object>} packedIslands - Packed islands with offsets
 */
function applyPackedIslands(geometry, packedIslands) {
  const uvAttribute = geometry.getAttribute('uv');
  
  for (const island of packedIslands) {
    for (const vertexIndex of island.vertices) {
      const u = uvAttribute.getX(vertexIndex);
      const v = uvAttribute.getY(vertexIndex);
      
      const newU = u + island.offset.x;
      const newV = v + island.offset.y;
      
      uvAttribute.setXY(vertexIndex, newU, newV);
    }
  }
  
  uvAttribute.needsUpdate = true;
} 