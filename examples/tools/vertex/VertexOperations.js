/**
 * VertexOperations - Core operations for vertex manipulation
 * Provides standalone functions for vertex-level operations
 */

import * as THREE from 'three';

export default class VertexOperations {
  constructor() {
    // No editor dependency - pure operations
  }

  /**
   * Get vertex position from geometry
   * @param {THREE.BufferGeometry} geometry - The geometry
   * @param {Number} vertexIndex - Index of the vertex
   * @returns {THREE.Vector3|null} Vertex position or null if not found
   */
  getVertexPosition(geometry, vertexIndex) {
    if (!geometry || !geometry.attributes || !geometry.attributes.position) return null;
    
    const positionAttribute = geometry.attributes.position;
    if (vertexIndex >= positionAttribute.count) return null;
    
    return new THREE.Vector3(
      positionAttribute.getX(vertexIndex),
      positionAttribute.getY(vertexIndex),
      positionAttribute.getZ(vertexIndex)
    );
  }

  /**
   * Set vertex position in geometry
   * @param {THREE.BufferGeometry} geometry - The geometry
   * @param {Number} vertexIndex - Index of the vertex
   * @param {THREE.Vector3} position - New position
   * @returns {Boolean} Success
   */
  setVertexPosition(geometry, vertexIndex, position) {
    if (!geometry || !geometry.attributes || !geometry.attributes.position) return false;
    
    const positionAttribute = geometry.attributes.position;
    if (vertexIndex >= positionAttribute.count) return false;
    
    positionAttribute.setXYZ(vertexIndex, position.x, position.y, position.z);
    positionAttribute.needsUpdate = true;
    
    return true;
  }

  /**
   * Move vertex by delta
   * @param {THREE.BufferGeometry} geometry - The geometry
   * @param {Number} vertexIndex - Index of the vertex
   * @param {THREE.Vector3} delta - Position delta
   * @returns {Boolean} Success
   */
  moveVertex(geometry, vertexIndex, delta) {
    const position = this.getVertexPosition(geometry, vertexIndex);
    if (!position) return false;
    
    position.add(delta);
    return this.setVertexPosition(geometry, vertexIndex, position);
  }

  /**
   * Get connected vertices (sharing an edge)
   * @param {THREE.BufferGeometry} geometry - The geometry
   * @param {Number} vertexIndex - Index of the vertex
   * @returns {Array<Number>} Array of connected vertex indices
   */
  getConnectedVertices(geometry, vertexIndex) {
    if (!geometry || !geometry.index) return [];
    
    const indexAttribute = geometry.index;
    const connected = new Set();
    
    for (let i = 0; i < indexAttribute.count; i += 3) {
      const a = indexAttribute.getX(i);
      const b = indexAttribute.getX(i + 1);
      const c = indexAttribute.getX(i + 2);
      
      if (a === vertexIndex) {
        connected.add(b);
        connected.add(c);
      } else if (b === vertexIndex) {
        connected.add(a);
        connected.add(c);
      } else if (c === vertexIndex) {
        connected.add(a);
        connected.add(b);
      }
    }
    
    return Array.from(connected);
  }

  /**
   * Weld vertices (merge vertices within threshold distance)
   * @param {THREE.BufferGeometry} geometry - The geometry
   * @param {Number} threshold - Distance threshold for welding
   * @returns {THREE.BufferGeometry} New geometry with welded vertices
   */
  weldVertices(geometry, threshold = 0.0001) {
    if (!geometry) return null;
    
    // Clone geometry to avoid modifying original
    const newGeometry = geometry.clone();
    
    // Get position attribute
    const positionAttribute = newGeometry.attributes.position;
    if (!positionAttribute) return newGeometry;
    
    // Create vertex map for welding
    const vertexMap = new Map();
    const positions = [];
    const indices = [];
    
    // Process all vertices
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      const position = new THREE.Vector3(x, y, z);
      
      // Check if this vertex should be welded to an existing one
      let weldedIndex = -1;
      for (const [index, pos] of vertexMap.entries()) {
        if (position.distanceTo(pos) <= threshold) {
          weldedIndex = index;
          break;
        }
      }
      
      if (weldedIndex === -1) {
        // New unique vertex
        weldedIndex = positions.length / 3;
        positions.push(x, y, z);
        vertexMap.set(weldedIndex, position);
      }
      
      // Map original vertex to welded vertex
      indices.push(weldedIndex);
    }
    
    // Create new geometry with welded vertices
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    // Update indices
    if (newGeometry.index) {
      const oldIndices = newGeometry.index.array;
      const newIndices = [];
      
      for (let i = 0; i < oldIndices.length; i++) {
        newIndices.push(indices[oldIndices[i]]);
      }
      
      result.setIndex(newIndices);
    } else {
      result.setIndex(indices);
    }
    
    // Copy other attributes
    for (const name in newGeometry.attributes) {
      if (name !== 'position') {
        // TODO: Handle other attributes properly
      }
    }
    
    // Compute normals
    result.computeVertexNormals();
    
    return result;
  }

  /**
   * Split a vertex (duplicate it for selected faces)
   * @param {THREE.BufferGeometry} geometry - The geometry
   * @param {Number} vertexIndex - Index of the vertex to split
   * @param {Array<Number>} faceIndices - Indices of faces to use the new vertex
   * @returns {THREE.BufferGeometry} New geometry with split vertex
   */
  splitVertex(geometry, vertexIndex, faceIndices = []) {
    if (!geometry || !geometry.index) return null;
    
    // Clone geometry to avoid modifying original
    const newGeometry = geometry.clone();
    
    // Get position attribute
    const positionAttribute = newGeometry.attributes.position;
    if (!positionAttribute || vertexIndex >= positionAttribute.count) return newGeometry;
    
    // Get vertex position
    const position = this.getVertexPosition(newGeometry, vertexIndex);
    if (!position) return newGeometry;
    
    // Create new vertex at same position
    const newVertexIndex = positionAttribute.count;
    const positions = Array.from(positionAttribute.array);
    positions.push(position.x, position.y, position.z);
    
    // Update indices
    const indexAttribute = newGeometry.index;
    const indices = Array.from(indexAttribute.array);
    
    // Update selected faces to use new vertex
    for (let i = 0; i < indices.length; i += 3) {
      const faceIndex = Math.floor(i / 3);
      
      if (faceIndices.includes(faceIndex)) {
        for (let j = 0; j < 3; j++) {
          if (indices[i + j] === vertexIndex) {
            indices[i + j] = newVertexIndex;
          }
        }
      }
    }
    
    // Create new geometry with split vertex
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    result.setIndex(indices);
    
    // Compute normals
    result.computeVertexNormals();
    
    return result;
  }
}
