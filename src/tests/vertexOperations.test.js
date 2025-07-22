/**
 * @fileoverview
 * Tests for the modular VertexOperations.
 */

import * as THREE from 'three';
import { VertexOperations } from '../editing/operations/index.js';
import { describe, it, beforeEach, assert, assertEqual } from './TestFramework.js';

describe('Vertex Operations Tests', () => {
  let geometry;

  beforeEach(() => {
    // Create a new BufferGeometry before each test for isolation
    const vertices = new Float32Array([
       0,  0,  0, // Vertex 0
       1,  1,  1, // Vertex 1 (target)
       2,  2,  2, // Vertex 2
       3,  3,  3, // Vertex 3
       4,  4,  4, // Vertex 4
    ]);
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  });

  describe('Merge Operation', () => {
    it('should merge specified vertices to a target vertex', () => {
      // Perform the merge operation
      const result = VertexOperations.merge(geometry, {
        indices: [0, 2, 4], // Indices of vertices to merge
        target: 1           // Index of the target vertex
      });
      
      // Assertions
      assert(result, 'Merge operation should return a result object');
      assertEqual(result.impacted.length, 4, 'Should impact 4 vertices (3 merged + 1 target)');

      const positions = geometry.attributes.position.array;
      const targetX = positions[1 * 3 + 0];
      const targetY = positions[1 * 3 + 1];
      const targetZ = positions[1 * 3 + 2];

      // Verify that vertex 0 was moved to the target's position
      assertEqual(positions[0 * 3 + 0], targetX, 'Vertex 0.x should be moved to target.x');
      assertEqual(positions[0 * 3 + 1], targetY, 'Vertex 0.y should be moved to target.y');
      assertEqual(positions[0 * 3 + 2], targetZ, 'Vertex 0.z should be moved to target.z');

      // Verify that vertex 2 was moved to the target's position
      assertEqual(positions[2 * 3 + 0], targetX, 'Vertex 2.x should be moved to target.x');
      assertEqual(positions[2 * 3 + 1], targetY, 'Vertex 2.y should be moved to target.y');
      assertEqual(positions[2 * 3 + 2], targetZ, 'Vertex 2.z should be moved to target.z');

      // Verify that vertex 4 was moved to the target's position
      assertEqual(positions[4 * 3 + 0], targetX, 'Vertex 4.x should be moved to target.x');
      assertEqual(positions[4 * 3 + 1], targetY, 'Vertex 4.y should be moved to target.y');
      assertEqual(positions[4 * 3 + 2], targetZ, 'Vertex 4.z should be moved to target.z');
    });
  });
});
