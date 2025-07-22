/**
 * @fileoverview
 * Tests for the modular vertex operations.
 */

import * as THREE from 'three';
import { mergeVertices } from '../editing/operations/vertex/index.js';
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
      const result = mergeVertices(geometry, [0, 2, 4], {
        targetVertexIndex: 1 // Index of the target vertex
      });
      
      // Assertions
      assert(result.success, 'Merge operation should be successful');
      
      const newGeometry = result.geometry;
      const positions = newGeometry.attributes.position.array;

      // Verify that vertices 0, 2, and 4 were merged to vertex 1's position
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
