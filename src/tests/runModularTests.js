/**
 * @fileoverview Modular System Test Runner
 * Tests the modular editing system architecture and maintainability
 */

import * as EditingSystem from '../editing/index.js';

/**
 * Test Runner for Modular System
 */
class ModularTestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      duration: 0
    };
    this.modules = {
      geometry: EditingSystem.GeometryOperations,
      vertex: EditingSystem.VertexOperations,
      edge: EditingSystem.EdgeOperations,
      face: EditingSystem.FaceOperations,
      uv: EditingSystem.UVOperations,
      system: EditingSystem
    };
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTests() {
    console.log('Starting Modular System Test Suite...');
    
    const startTime = Date.now();
    
    for (const test of this.tests) {
      try {
        console.log(`Running: ${test.name}`);
        await test.testFn();
        console.log(`PASSED: ${test.name}`);
        this.results.passed++;
      } catch (error) {
        console.error(`FAILED: ${test.name}`);
        console.error(`Error: ${error.message}`);
        this.results.failed++;
      }
      this.results.total++;
    }
    
    this.results.duration = Date.now() - startTime;
    this.printResults();
  }

  printResults() {
    console.log('\nTest Results:');
    console.log(`   Total: ${this.results.total}`);
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(`   Duration: ${this.results.duration}ms`);
    console.log(`   Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
  }

  assertTrue(value, message = 'Value is not truthy') {
    if (!value) {throw new Error(message);}
  }

  assertFalse(value, message = 'Value is not falsy') {
    if (value) {throw new Error(message);}
  }

  assertEquals(actual, expected, message = 'Values are not equal') {
    if (actual !== expected) {throw new Error(`${message}: expected ${expected}, got ${actual}`);}
  }

  assertLength(array, expectedLength, message = 'Array length mismatch') {
    if (array.length !== expectedLength) {throw new Error(`${message}: expected ${expectedLength}, got ${array.length}`);}
  }

  assertHasProperty(obj, property, message = 'Object missing property') {
    if (!(property in obj)) {throw new Error(`${message}: missing property '${property}'`);}
  }

  assertThrows(fn, message = 'Function did not throw an error as expected') {
    let thrown = false;
    try {
      fn();
    } catch (error) {
      thrown = true;
    }
    if (!thrown) {
      throw new Error(message);
    }
  }
}

/**
 * Run comprehensive modular system tests
 */
async function runModularTests() {
  const runner = new ModularTestRunner();

  // Module Existence Tests
  runner.addTest('Module Existence - All Core Modules', () => {
    runner.assertTrue(EditingSystem.GeometryOperations, 'GeometryOperations module exists');
    runner.assertTrue(EditingSystem.VertexOperations, 'VertexOperations module exists');
    runner.assertTrue(EditingSystem.EdgeOperations, 'EdgeOperations module exists');
    runner.assertTrue(EditingSystem.FaceOperations, 'FaceOperations module exists');
    runner.assertTrue(EditingSystem.UVOperations, 'UVOperations module exists');
    runner.assertTrue(EditingSystem, 'EditingSystem module exists');
  });

  // Module Structure Tests
  runner.addTest('Module Structure - GeometryOperations', () => {
    runner.assertHasProperty(EditingSystem.GeometryOperations, 'bevel');
    runner.assertHasProperty(EditingSystem.GeometryOperations, 'extrude');
    runner.assertHasProperty(EditingSystem.GeometryOperations, 'inset');
    runner.assertHasProperty(EditingSystem.GeometryOperations, 'validateParameters');
    runner.assertTrue(typeof EditingSystem.GeometryOperations.bevel === 'function');
    runner.assertTrue(typeof EditingSystem.GeometryOperations.extrude === 'function');
    runner.assertTrue(typeof EditingSystem.GeometryOperations.inset === 'function');
  });

  runner.addTest('Module Structure - VertexOperations', () => {
    runner.assertHasProperty(EditingSystem.VertexOperations, 'snap');
    runner.assertHasProperty(EditingSystem.VertexOperations, 'connect');
    runner.assertHasProperty(EditingSystem.VertexOperations, 'merge');
    runner.assertHasProperty(EditingSystem.VertexOperations, 'validateParameters');
    runner.assertTrue(typeof EditingSystem.VertexOperations.snap === 'function');
    runner.assertTrue(typeof EditingSystem.VertexOperations.connect === 'function');
    runner.assertTrue(typeof EditingSystem.VertexOperations.merge === 'function');
  });

  runner.addTest('Module Structure - EdgeOperations', () => {
    runner.assertHasProperty(EditingSystem.EdgeOperations, 'split');
    runner.assertHasProperty(EditingSystem.EdgeOperations, 'collapse');
    runner.assertHasProperty(EditingSystem.EdgeOperations, 'dissolve');
    runner.assertHasProperty(EditingSystem.EdgeOperations, 'validateParameters');
    runner.assertTrue(typeof EditingSystem.EdgeOperations.split === 'function');
    runner.assertTrue(typeof EditingSystem.EdgeOperations.collapse === 'function');
    runner.assertTrue(typeof EditingSystem.EdgeOperations.dissolve === 'function');
  });

  runner.addTest('Module Structure - FaceOperations', () => {
    runner.assertHasProperty(EditingSystem.FaceOperations, 'split');
    runner.assertHasProperty(EditingSystem.FaceOperations, 'collapse');
    runner.assertHasProperty(EditingSystem.FaceOperations, 'dissolve');
    runner.assertHasProperty(EditingSystem.FaceOperations, 'validateParameters');
    runner.assertTrue(typeof EditingSystem.FaceOperations.split === 'function');
    runner.assertTrue(typeof EditingSystem.FaceOperations.collapse === 'function');
    runner.assertTrue(typeof EditingSystem.FaceOperations.dissolve === 'function');
  });

  runner.addTest('Module Structure - UVOperations', () => {
    runner.assertHasProperty(EditingSystem.UVOperations, 'unwrap');
    runner.assertHasProperty(EditingSystem.UVOperations, 'pack');
    runner.assertHasProperty(EditingSystem.UVOperations, 'smartProject');
    runner.assertHasProperty(EditingSystem.UVOperations, 'validateParameters');
    runner.assertTrue(typeof EditingSystem.UVOperations.unwrap === 'function');
    runner.assertTrue(typeof EditingSystem.UVOperations.pack === 'function');
    runner.assertTrue(typeof EditingSystem.UVOperations.smartProject === 'function');
  });

  // System Integration Tests
  runner.addTest('System Integration - Module Exports', () => {
    runner.assertHasProperty(EditingSystem, 'GeometryOperations');
    runner.assertHasProperty(EditingSystem, 'VertexOperations');
    runner.assertHasProperty(EditingSystem, 'EdgeOperations');
    runner.assertHasProperty(EditingSystem, 'FaceOperations');
    runner.assertHasProperty(EditingSystem, 'UVOperations');
    runner.assertHasProperty(EditingSystem, 'createGeometryOperations');
    runner.assertHasProperty(EditingSystem, 'createVertexOperations');
    runner.assertHasProperty(EditingSystem, 'createEdgeOperations');
    runner.assertHasProperty(EditingSystem, 'createFaceOperations');
    runner.assertHasProperty(EditingSystem, 'createUVOperations');
  });

  // Operation Validation Tests
  runner.addTest('Operation Validation - Geometry Bevel', () => {
    const result = EditingSystem.GeometryOperations.bevel({
      vertices: [{ x: 0, y: 0, z: 0 }],
      edges: [{ v1: 0, v2: 1 }],
      faces: [{ vertexIds: [0, 1, 2] }],
      parameters: { width: 0.1, segments: 3 }
    });

    runner.assertHasProperty(result, 'success');
    runner.assertHasProperty(result, 'newVertices');
    runner.assertHasProperty(result, 'newEdges');
    runner.assertHasProperty(result, 'newFaces');
    runner.assertHasProperty(result, 'metadata');
    runner.assertTrue(result.success);
  });

  runner.addTest('Operation Validation - Vertex Snap', () => {
    const result = EditingSystem.VertexOperations.snap({
      vertices: [{ x: 0, y: 0, z: 0 }],
      target: { x: 1, y: 1, z: 1 },
      tolerance: 0.1
    });

    runner.assertHasProperty(result, 'success');
    runner.assertHasProperty(result, 'snappedVertices');
    runner.assertHasProperty(result, 'metadata');
    runner.assertTrue(result.success);
  });

  runner.addTest('Operation Validation - Edge Split', () => {
    const result = EditingSystem.EdgeOperations.split({
      vertices: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }],
      edges: [{ v1: 0, v2: 1 }],
      edgeIndex: 0,
      ratio: 0.5
    });

    runner.assertHasProperty(result, 'success');
    runner.assertHasProperty(result, 'newVertices');
    runner.assertHasProperty(result, 'newEdges');
    runner.assertHasProperty(result, 'metadata');
    runner.assertTrue(result.success);
  });

  // Error Handling Tests
  runner.addTest('Error Handling - Invalid Parameters', () => {
    runner.assertThrows(() => {
      EditingSystem.GeometryOperations.bevel(null);
    }, 'Should handle null parameters');

    runner.assertThrows(() => {
      EditingSystem.VertexOperations.snap({});
    }, 'Should handle missing required parameters');

    runner.assertThrows(() => {
      EditingSystem.EdgeOperations.split({ vertices: [] });
    }, 'Should handle insufficient data');
  });

  // Modularity Tests
  runner.addTest('Modularity - Independent Module Usage', () => {
    // Test that modules can be used independently
    const geometryResult = EditingSystem.GeometryOperations.bevel({
      vertices: [{ x: 0, y: 0, z: 0 }],
      edges: [{ v1: 0, v2: 1 }],
      faces: [{ vertexIds: [0, 1, 2] }],
      parameters: { width: 0.1, segments: 3 }
    });

    const vertexResult = EditingSystem.VertexOperations.snap({
      vertices: [{ x: 0, y: 0, z: 0 }],
      target: { x: 1, y: 1, z: 1 },
      tolerance: 0.1
    });

    runner.assertTrue(geometryResult.success);
    runner.assertTrue(vertexResult.success);
    runner.assertFalse(geometryResult === vertexResult);
  });

  // Factory Function Tests
  runner.addTest('Factory Functions - Create Operations', () => {
    const geometryOps = EditingSystem.createGeometryOperations();
    const vertexOps = EditingSystem.createVertexOperations();
    const edgeOps = EditingSystem.createEdgeOperations();
    const faceOps = EditingSystem.createFaceOperations();
    const uvOps = EditingSystem.createUVOperations();

    runner.assertTrue(geometryOps);
    runner.assertTrue(vertexOps);
    runner.assertTrue(edgeOps);
    runner.assertTrue(faceOps);
    runner.assertTrue(uvOps);

    runner.assertHasProperty(geometryOps, 'bevel');
    runner.assertHasProperty(vertexOps, 'snap');
    runner.assertHasProperty(edgeOps, 'split');
    runner.assertHasProperty(faceOps, 'split');
    runner.assertHasProperty(uvOps, 'unwrap');
  });

  // Performance Tests
  runner.addTest('Performance - Large Dataset Operations', () => {
    const largeVertices = Array.from({ length: 1000 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random()
    }));

    const startTime = Date.now();
    
    const result = EditingSystem.GeometryOperations.bevel({
      vertices: largeVertices,
      edges: [{ v1: 0, v2: 1 }],
      faces: [{ vertexIds: [0, 1, 2] }],
      parameters: { width: 0.1, segments: 3 }
    });

    const duration = Date.now() - startTime;
    runner.assertTrue(result.success);
    runner.assertTrue(duration < 5000, 'Operation took too long');
  });

  // Maintainability Tests
  runner.addTest('Maintainability - Consistent API Design', () => {
    const modules = [EditingSystem.GeometryOperations, EditingSystem.VertexOperations, EditingSystem.EdgeOperations, EditingSystem.FaceOperations, EditingSystem.UVOperations];
    
    for (const module of modules) {
      // All modules should have validateParameters method
      runner.assertHasProperty(module, 'validateParameters');
      runner.assertTrue(typeof module.validateParameters === 'function');
      
      // All modules should have consistent operation structure
      const operations = Object.getOwnPropertyNames(module).filter(name => 
        typeof module[name] === 'function' && name !== 'validateParameters'
      );
      
      for (const operation of operations) {
        const result = module[operation]({});
        runner.assertHasProperty(result, 'success');
        runner.assertHasProperty(result, 'metadata');
      }
    }
  });

  // Cross-Module Integration Tests
  runner.addTest('Cross-Module Integration - Geometry to Vertex Operations', () => {
    const geometryResult = EditingSystem.GeometryOperations.bevel({
      vertices: [{ x: 0, y: 0, z: 0 }],
      edges: [{ v1: 0, v2: 1 }],
      faces: [{ vertexIds: [0, 1, 2] }],
      parameters: { width: 0.1, segments: 3 }
    });

    if (geometryResult.success && geometryResult.newVertices.length > 0) {
      const vertexResult = EditingSystem.VertexOperations.snap({
        vertices: geometryResult.newVertices,
        target: { x: 1, y: 1, z: 1 },
        tolerance: 0.1
      });

      runner.assertTrue(vertexResult.success);
    }
  });

  await runner.runTests();
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runModularTests().catch(console.error);
} else {
  // Browser environment
  window.runModularTests = runModularTests;
  console.log('🧪 Modular test runner loaded. Call runModularTests() to execute tests.');
} 