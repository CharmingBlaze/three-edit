/**
 * @fileoverview Simple Modular System Test Runner
 * Tests the modular editing system with real geometry and operations.
 */

import * as THREE from 'three';
import { mergeVertices, snapVertices } from '../editing/operations/vertex/index.js';

class SimpleTestRunner {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, total: 0, duration: 0 };
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTests() {
    console.log('🧪 Starting Simple Modular System Test Suite...\n');
    const startTime = Date.now();
    for (const test of this.tests) {
      try {
        console.log(`▶️  Running: ${test.name}`);
        await test.testFn();
        console.log(`✅ PASSED: ${test.name}`);
        this.results.passed++;
      } catch (error) {
        console.error(`❌ FAILED: ${test.name}`);
        console.error(`   Error: ${error.message}`);
        console.error(error.stack);
        this.results.failed++;
      }
      this.results.total++;
    }
    this.results.duration = Date.now() - startTime;
    this.printResults();
  }

  printResults() {
    console.log('\n📊 Test Results:');
    console.log(`   Total: ${this.results.total}`);
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(`   Duration: ${this.results.duration}ms`);
    const successRate = this.results.total > 0 ? (this.results.passed / this.results.total) * 100 : 0;
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    if (this.results.failed > 0) {
      process.exit(1); // Exit with error code if any tests failed
    }
  }

  assertTrue(value, message = 'Value is not truthy') {
    if (!value) throw new Error(message);
  }

  assertEquals(actual, expected, message = 'Values are not equal') {
    if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

// --- Test Helper Functions ---

function createTestPlane() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -1.0, -1.0, 0.0, // 0
     1.0, -1.0, 0.0, // 1
     1.0,  1.0, 0.0, // 2
    -1.0,  1.0, 0.0, // 3
  ]);
  const indices = [
    0, 1, 2,
    0, 2, 3,
  ];
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

// --- Test Suite ---

async function runSimpleTests() {
  const runner = new SimpleTestRunner();

  // --- VertexOperations Tests ---

  runner.addTest('VertexOperations: mergeVertices should merge two vertices and remove a face', () => {
    const geometry = createTestPlane();
    const initialFaceCount = geometry.getIndex().count / 3;
    runner.assertEquals(initialFaceCount, 2, 'Initial geometry should have 2 faces');

    // Merge vertex 1 into vertex 0
    const result = mergeVertices(geometry, [0, 1]);

    runner.assertTrue(result.success, 'Merge operation should be successful');
    
    const newGeometry = result.geometry;
    const newIndex = newGeometry.getIndex();
    const newPosition = newGeometry.getAttribute('position');

    // After merging 0 and 1, the face (0, 1, 2) becomes degenerate and should be removed.
    // The remaining face is (0, 2, 3).
    const expectedFaceCount = 1;
    runner.assertEquals(newIndex.count / 3, expectedFaceCount, 'Face count should be reduced by 1');

    // Check that the merged vertex position is the centroid of the original two.
    const v0 = new THREE.Vector3().fromBufferAttribute(newPosition, 0);
    const expectedPosition = new THREE.Vector3(0.0, -1.0, 0.0); // Centroid of (-1,-1,0) and (1,-1,0)
    runner.assertTrue(v0.equals(expectedPosition), `Merged vertex should be at centroid ${expectedPosition.toArray()}`);
  });

  runner.addTest('VertexOperations: mergeVertices should handle invalid parameters', () => {
    const geometry = createTestPlane();
    
    // Test with too few vertices
    let result = mergeVertices(geometry, [0]);
    runner.assertTrue(!result.success, 'Merge should fail with fewer than 2 vertices');
    runner.assertEquals(result.errors[0], 'At least two vertices are required to merge.', 'Error message should be correct');

    // Test with invalid vertex index
    result = mergeVertices(geometry, [0, 99]);
    runner.assertTrue(!result.success, 'Merge should fail with invalid vertex index');
  });

  // --- Add more tests for other operations here ---

  await runner.runTests();
}

runSimpleTests();