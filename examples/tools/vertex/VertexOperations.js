/**
 * Vertex Operations Example - Modular approach
 * Demonstrates how to use the new modular vertex operations
 */

import * as THREE from 'three';
import { 
  mergeVertices, 
  snapVertices, 
  splitVertices, 
  smoothVertices, 
  connectVertices 
} from '../../../src/editing/operations/vertex/index.js';

/**
 * Example: Basic vertex operations using the new modular system
 */
export default class VertexOperationsExample {
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
   * Example: Merge vertices using the new modular system
   * @param {THREE.BufferGeometry} geometry - The geometry
   * @param {Array<Number>} vertexIndices - Indices of vertices to merge
   * @param {Number} targetVertexIndex - Index of the target vertex
   * @returns {Object} Result object with success status and new geometry
   */
  mergeVerticesExample(geometry, vertexIndices, targetVertexIndex) {
    const result = mergeVertices(geometry, vertexIndices, {
      targetVertexIndex: targetVertexIndex
    });
    
    if (result.success) {
      console.log('Vertices merged successfully');
      return result.geometry;
    } else {
      console.error('Merge failed:', result.errors);
      return geometry;
    }
  }

  /**
   * Example: Snap vertices using the new modular system
   * @param {THREE.BufferGeometry} geometry - The geometry
   * @param {Array<Number>} vertexIndices - Indices of vertices to snap
   * @param {Object} options - Snap options
   * @returns {Object} Result object with success status and new geometry
   */
  snapVerticesExample(geometry, vertexIndices, options = {}) {
    const result = snapVertices(geometry, vertexIndices, {
      threshold: options.threshold || 0.1,
      target: options.target || { x: 0, y: 0, z: 0 }
    });
    
    if (result.success) {
      console.log('Vertices snapped successfully');
      return result.geometry;
    } else {
      console.error('Snap failed:', result.errors);
      return geometry;
    }
  }

  /**
   * Example: Split vertices using the new modular system
   * @param {THREE.BufferGeometry} geometry - The geometry
   * @param {Array<Number>} vertexIndices - Indices of vertices to split
   * @returns {Object} Result object with success status and new geometry
   */
  splitVerticesExample(geometry, vertexIndices) {
    const result = splitVertices(geometry, vertexIndices);
    
    if (result.success) {
      console.log('Vertices split successfully');
      return result.geometry;
    } else {
      console.error('Split failed:', result.errors);
      return geometry;
    }
  }

  /**
   * Example: Smooth vertices using the new modular system
   * @param {THREE.BufferGeometry} geometry - The geometry
   * @param {Array<Number>} vertexIndices - Indices of vertices to smooth
   * @param {Object} options - Smooth options
   * @returns {Object} Result object with success status and new geometry
   */
  smoothVerticesExample(geometry, vertexIndices, options = {}) {
    const result = smoothVertices(geometry, vertexIndices, {
      iterations: options.iterations || 3,
      strength: options.strength || 0.5
    });
    
    if (result.success) {
      console.log('Vertices smoothed successfully');
      return result.geometry;
    } else {
      console.error('Smooth failed:', result.errors);
      return geometry;
    }
  }

  /**
   * Example: Connect vertices using the new modular system
   * @param {THREE.BufferGeometry} geometry - The geometry
   * @param {Array<Number>} vertexGroup1 - First group of vertices
   * @param {Array<Number>} vertexGroup2 - Second group of vertices
   * @returns {Object} Result object with success status and new geometry
   */
  connectVerticesExample(geometry, vertexGroup1, vertexGroup2) {
    const result = connectVertices(geometry, vertexGroup1, vertexGroup2);
    
    if (result.success) {
      console.log('Vertices connected successfully');
      return result.geometry;
    } else {
      console.error('Connect failed:', result.errors);
      return geometry;
    }
  }

  /**
   * Example: Complete vertex editing workflow
   * @param {THREE.BufferGeometry} geometry - The geometry to edit
   * @returns {THREE.BufferGeometry} Modified geometry
   */
  completeWorkflowExample(geometry) {
    console.log('Starting vertex editing workflow...');
    
    // Step 1: Merge some vertices
    let modifiedGeometry = this.mergeVerticesExample(geometry, [0, 1, 2], 0);
    
    // Step 2: Snap vertices to a target point
    modifiedGeometry = this.snapVerticesExample(modifiedGeometry, [3, 4], {
      threshold: 0.05,
      target: { x: 1, y: 1, z: 0 }
    });
    
    // Step 3: Smooth the result
    modifiedGeometry = this.smoothVerticesExample(modifiedGeometry, [0, 1, 2], {
      iterations: 2,
      strength: 0.3
    });
    
    console.log('Vertex editing workflow completed');
    return modifiedGeometry;
  }
}
