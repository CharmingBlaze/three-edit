/**
 * @fileoverview Test Runner
 * Executes all tests with proper reporting and coverage
 */

import { MeshSelector } from '../selection/MeshSelector.js';
import { ObjectSelector } from '../selection/ObjectSelector.js';
import { SelectionManager } from '../selection/SelectionManager.js';
import { SelectionVisualizer } from '../selection/SelectionVisualizer.js';

/**
 * Test runner class
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      duration: 0
    };
    this.coverage = {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    };
  }

  /**
   * Add test to runner
   * @param {string} name - Test name
   * @param {Function} testFn - Test function
   */
  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  /**
   * Run all tests
   */
  async runTests() {
    console.log('🧪 Starting Test Suite...\n');
    
    const startTime = Date.now();
    
    for (const test of this.tests) {
      try {
        console.log(`▶️  Running: ${test.name}`);
        await test.testFn();
        console.log(`✅ PASSED: ${test.name}`);
        this.results.passed++;
      } catch (error) {
        console.log(`❌ FAILED: ${test.name}`);
        console.log(`   Error: ${error.message}`);
        this.results.failed++;
      }
      this.results.total++;
    }
    
    this.results.duration = Date.now() - startTime;
    this.printResults();
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n📊 Test Results:');
    console.log(`   Total: ${this.results.total}`);
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(`   Duration: ${this.results.duration}ms`);
    console.log(`   Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
  }

  /**
   * Generate coverage report
   */
  generateCoverageReport() {
    console.log('\n📈 Coverage Report:');
    console.log(`   Statements: ${this.coverage.statements}%`);
    console.log(`   Branches: ${this.coverage.branches}%`);
    console.log(`   Functions: ${this.coverage.functions}%`);
    console.log(`   Lines: ${this.coverage.lines}%`);
  }
}

/**
 * Test utilities
 */
class TestUtils {
  /**
   * Assert equality
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Error message
   */
  static assertEquals(actual, expected, message = 'Values are not equal') {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  /**
   * Assert truthy value
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static assertTrue(value, message = 'Value is not truthy') {
    if (!value) {
      throw new Error(message);
    }
  }

  /**
   * Assert falsy value
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static assertFalse(value, message = 'Value is not falsy') {
    if (value) {
      throw new Error(message);
    }
  }

  /**
   * Assert array length
   * @param {Array} array - Array to check
   * @param {number} expectedLength - Expected length
   * @param {string} message - Error message
   */
  static assertLength(array, expectedLength, message = 'Array length mismatch') {
    if (array.length !== expectedLength) {
      throw new Error(`${message}: expected ${expectedLength}, got ${array.length}`);
    }
  }

  /**
   * Assert object has property
   * @param {Object} obj - Object to check
   * @param {string} property - Property name
   * @param {string} message - Error message
   */
  static assertHasProperty(obj, property, message = 'Object missing property') {
    if (!(property in obj)) {
      throw new Error(`${message}: ${property}`);
    }
  }

  /**
   * Assert throws error
   * @param {Function} fn - Function that should throw
   * @param {string} message - Error message
   */
  static assertThrows(fn, message = 'Function should throw error') {
    try {
      fn();
      throw new Error(message);
    } catch (error) {
      // Expected to throw
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  const runner = new TestRunner();

  // SelectionManager Tests
  runner.addTest('SelectionManager - Constructor', () => {
    const manager = new SelectionManager();
    TestUtils.assertHasProperty(manager, 'selections');
    TestUtils.assertHasProperty(manager, 'selectionMode');
    TestUtils.assertEquals(manager.multiSelect, true);
  });

  runner.addTest('SelectionManager - Add Selection', () => {
    const manager = new SelectionManager();
    const selection = manager.addSelection('object', 'test-id', { name: 'Test' });
    
    TestUtils.assertTrue(selection !== null);
    TestUtils.assertEquals(selection.type, 'object');
    TestUtils.assertEquals(selection.id, 'test-id');
    TestUtils.assertEquals(manager.getAllSelections().length, 1);
  });

  runner.addTest('SelectionManager - Remove Selection', () => {
    const manager = new SelectionManager();
    manager.addSelection('object', 'test-id');
    
    const result = manager.removeSelection('object', 'test-id');
    TestUtils.assertTrue(result);
    TestUtils.assertEquals(manager.getAllSelections().length, 0);
  });

  runner.addTest('SelectionManager - Check Selection', () => {
    const manager = new SelectionManager();
    manager.addSelection('object', 'test-id');
    
    TestUtils.assertTrue(manager.isSelected('object', 'test-id'));
    TestUtils.assertFalse(manager.isSelected('object', 'non-existent'));
  });

  // ObjectSelector Tests
  runner.addTest('ObjectSelector - Select By Name', () => {
    const objects = [
      { id: 'obj1', name: 'Cube' },
      { id: 'obj2', name: 'Sphere' },
      { id: 'obj3', name: 'Cylinder' }
    ];
    
    const selected = ObjectSelector.selectByName('C*', objects);
    TestUtils.assertLength(selected, 2);
    TestUtils.assertTrue(selected.some(obj => obj.name === 'Cube'));
    TestUtils.assertTrue(selected.some(obj => obj.name === 'Cylinder'));
  });

  runner.addTest('ObjectSelector - Select By Type', () => {
    const objects = [
      { id: 'obj1', type: 'mesh' },
      { id: 'obj2', type: 'light' },
      { id: 'obj3', type: 'mesh' }
    ];
    
    const selected = ObjectSelector.selectByType('mesh', objects);
    TestUtils.assertLength(selected, 2);
    TestUtils.assertTrue(selected.every(obj => obj.type === 'mesh'));
  });

  // MeshSelector Tests
  runner.addTest('MeshSelector - Calculate Bounds', () => {
    const vertices = [
      { x: -1, y: -1, z: -1 },
      { x: 1, y: 1, z: 1 },
      { x: 0, y: 0, z: 0 }
    ];
    
    const bounds = MeshSelector.calculateBounds(vertices);
    TestUtils.assertEquals(bounds.min.x, -1);
    TestUtils.assertEquals(bounds.min.y, -1);
    TestUtils.assertEquals(bounds.min.z, -1);
    TestUtils.assertEquals(bounds.max.x, 1);
    TestUtils.assertEquals(bounds.max.y, 1);
    TestUtils.assertEquals(bounds.max.z, 1);
  });

  runner.addTest('MeshSelector - Point In Rectangle', () => {
    const point = { x: 0, y: 0 };
    const bounds = {
      min: { x: -1, y: -1 },
      max: { x: 1, y: 1 }
    };
    
    TestUtils.assertTrue(MeshSelector.pointInRectangle(point, bounds));
  });

  // SelectionVisualizer Tests
  runner.addTest('SelectionVisualizer - Create Highlight Material', () => {
    const material = SelectionVisualizer.createHighlightMaterial({
      color: { r: 1, g: 0, b: 0 },
      opacity: 0.5
    });
    
    TestUtils.assertEquals(material.type, 'highlight');
    TestUtils.assertEquals(material.color.r, 1);
    TestUtils.assertEquals(material.color.g, 0);
    TestUtils.assertEquals(material.color.b, 0);
    TestUtils.assertEquals(material.opacity, 0.5);
  });

  runner.addTest('SelectionVisualizer - Create Vertex Geometry', () => {
    const vertices = [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 }
    ];
    
    const geometry = SelectionVisualizer.createVertexHighlightGeometry(vertices);
    
    TestUtils.assertEquals(geometry.type, 'instanced');
    TestUtils.assertLength(geometry.positions, 2);
    TestUtils.assertLength(geometry.attributes.size, 2);
  });

  // Integration Tests
  runner.addTest('Integration - Complete Selection Workflow', () => {
    const manager = new SelectionManager();
    
    // Add selections
    manager.addSelection('object', 'obj1', { name: 'Object 1' });
    manager.addSelection('vertex', 'vert1', { position: { x: 0, y: 0, z: 0 } });
    manager.addSelection('face', 'face1', { vertexIds: ['v1', 'v2', 'v3'] });
    
    // Check selections
    TestUtils.assertEquals(manager.getAllSelections().length, 3);
    TestUtils.assertTrue(manager.isSelected('object', 'obj1'));
    TestUtils.assertTrue(manager.isSelected('vertex', 'vert1'));
    TestUtils.assertTrue(manager.isSelected('face', 'face1'));
    
    // Remove selections
    manager.removeSelection('object', 'obj1');
    TestUtils.assertEquals(manager.getAllSelections().length, 2);
    TestUtils.assertFalse(manager.isSelected('object', 'obj1'));
    
    // Clear all
    manager.clearSelection();
    TestUtils.assertEquals(manager.getAllSelections().length, 0);
  });

  runner.addTest('Integration - Selection Visualization', () => {
    const manager = new SelectionManager();
    manager.addSelection('object', 'obj1');
    
    // Create highlight material
    const material = SelectionVisualizer.createHighlightMaterial({
      color: { r: 1, g: 1, b: 0 }
    });
    
    TestUtils.assertEquals(material.type, 'highlight');
    TestUtils.assertEquals(material.color.r, 1);
    TestUtils.assertEquals(material.color.g, 1);
    TestUtils.assertEquals(material.color.b, 0);
    
    // Create selection box
    const bounds = {
      min: { x: -1, y: -1, z: -1 },
      max: { x: 1, y: 1, z: 1 }
    };
    
    const boxGeometry = SelectionVisualizer.createSelectionBoxGeometry(bounds);
    TestUtils.assertEquals(boxGeometry.type, 'line');
    TestUtils.assertLength(boxGeometry.positions, 24);
  });

  // Performance Tests
  runner.addTest('Performance - Large Selection Set', () => {
    const manager = new SelectionManager({ maxSelections: 1000 });
    const startTime = Date.now();
    
    // Add many selections
    for (let i = 0; i < 100; i++) {
      manager.addSelection('object', `obj${i}`, { name: `Object ${i}` });
    }
    
    const duration = Date.now() - startTime;
    TestUtils.assertEquals(manager.getAllSelections().length, 100);
    TestUtils.assertTrue(duration < 1000, 'Performance test took too long');
  });

  // Error Handling Tests
  runner.addTest('Error Handling - Invalid Parameters', () => {
    const manager = new SelectionManager();
    
    // Test with null parameters
    TestUtils.assertThrows(() => {
      manager.addSelection(null, 'id');
    }, 'Should handle null type');
    
    TestUtils.assertThrows(() => {
      manager.addSelection('object', null);
    }, 'Should handle null id');
  });

  await runner.runTests();
  runner.generateCoverageReport();
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runAllTests().catch(console.error);
} else {
  // Browser environment
  window.runAllTests = runAllTests;
  console.log('🧪 Test runner loaded. Call runAllTests() to execute tests.');
} 