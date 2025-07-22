/**
 * @fileoverview Edge Operations Tests
 * Tests for modular edge operations
 */

import * as THREE from 'three';
import { splitEdges, collapseEdges, dissolveEdges } from '../editing/operations/edge/index.js';
import { describe, it, beforeEach, assert, assertEqual, assertDeepEqual, assertThrows } from './TestFramework.js';

describe('Edge Operations Tests', () => {
  let geometry;

  beforeEach(() => {
    // Create a simple geometry for testing
    const vertices = new Float32Array([
      0, 0, 0, // Vertex 0
      1, 0, 0, // Vertex 1
      1, 1, 0, // Vertex 2
      0, 1, 0  // Vertex 3
    ]);
    
    const indices = new Uint32Array([
      0, 1, 2, // Face 1
      0, 2, 3  // Face 2
    ]);
    
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
  });

  describe('Split Operations', () => {
    it('should split edges with default options', () => {
      const result = splitEdges(geometry, [0, 1], {});
      
      assert(result.success, 'Split operation should be successful');
      assert(result.geometry, 'Result should have geometry');
    });

    it('should split edges with custom options', () => {
      const options = {
        cuts: 3,
        smooth: true,
        ratio: 0.5
      };

      const result = splitEdges(geometry, [0, 1], options);
      
      assert(result.success, 'Split operation should be successful');
      assert(result.geometry, 'Result should have geometry');
    });

    it('should handle empty edges array', () => {
      const result = splitEdges(geometry, [], {});
      
      assert(!result.success, 'Should fail for empty edges array');
    });
  });

  describe('Collapse Operations', () => {
    it('should collapse edges with default options', () => {
      const result = collapseEdges(geometry, [0, 1], {});
      
      assert(result.success, 'Collapse operation should be successful');
      assert(result.geometry, 'Result should have geometry');
    });

    it('should collapse edges with custom options', () => {
      const options = {
        target: 'center',
        customTarget: { x: 0.5, y: 0.5, z: 0 },
        preserveFaces: true
      };

      const result = collapseEdges(geometry, [0, 1], options);
      
      assert(result.success, 'Collapse operation should be successful');
      assert(result.geometry, 'Result should have geometry');
    });
  });

  describe('Dissolve Operations', () => {
    it('should dissolve edges with default options', () => {
      const result = dissolveEdges(geometry, [0, 1], {});
      
      assert(result.success, 'Dissolve operation should be successful');
      assert(result.geometry, 'Result should have geometry');
    });

    it('should dissolve edges with custom options', () => {
      const options = {
        preserveFaces: true,
        preserveVertices: true
      };

      const result = dissolveEdges(geometry, [0, 1], options);
      
      assert(result.success, 'Dissolve operation should be successful');
      assert(result.geometry, 'Result should have geometry');
    });
  });
});
