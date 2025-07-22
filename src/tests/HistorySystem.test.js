/**
 * @fileoverview History System Tests
 * Comprehensive tests for the history/undo-redo system
 */

import { 
  HistoryManager, 
  HistoryEntry, 
  HistoryEntryTypes, 
  HistoryEntryStates,
  HistoryEntryPriorities,
  HistoryManagerStates,
  createHistoryManager,
  createGeometryHistoryEntry,
  createVertexHistoryEntry,
  createEdgeHistoryEntry,
  createFaceHistoryEntry,
  createUVHistoryEntry,
  createGeometryUndoFunction,
  createGeometryRedoFunction,
  createVertexUndoFunction,
  createVertexRedoFunction,
  createEdgeUndoFunction,
  createEdgeRedoFunction,
  createFaceUndoFunction,
  createFaceRedoFunction,
  createUVUndoFunction,
  createUVRedoFunction,
  compressHistoryData,
  decompressHistoryData,
  validateHistoryData
} from '../history/index.js';

/**
 * Test Runner for History System
 */
class HistoryTestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      duration: 0
    };
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTests() {
    console.log('🧪 Starting History System Test Suite...\n');
    
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

  printResults() {
    console.log('\n📊 History System Test Results:');
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

  assertThrows(fn, message = 'Function should throw error') {
    try {
      fn();
      throw new Error(message);
    } catch (error) {
      if (error.message === message) {throw error;}
      // Expected error was thrown
    }
  }
}

/**
 * Run comprehensive history system tests
 */
async function runHistoryTests() {
  const runner = new HistoryTestRunner();

  // HistoryManager Tests
  runner.addTest('HistoryManager - Constructor', () => {
    const manager = new HistoryManager();
    runner.assertHasProperty(manager, 'config');
    runner.assertHasProperty(manager, 'state');
    runner.assertHasProperty(manager, 'undoStack');
    runner.assertHasProperty(manager, 'redoStack');
    runner.assertEquals(manager.state, HistoryManagerStates.IDLE);
  });

  runner.addTest('HistoryManager - Configuration', () => {
    const config = {
      maxEntries: 50,
      autoSave: true,
      compression: true,
      enableUndoRedo: true
    };
    const manager = new HistoryManager(config);
    runner.assertEquals(manager.config.maxEntries, 50);
    runner.assertTrue(manager.config.autoSave);
    runner.assertTrue(manager.config.compression);
    runner.assertTrue(manager.config.enableUndoRedo);
  });

  runner.addTest('HistoryManager - Add Entry', async () => {
    const manager = new HistoryManager();
    const entry = new HistoryEntry({
      type: HistoryEntryTypes.GEOMETRY_OPERATION,
      operation: 'bevel',
      description: 'Test bevel operation',
      parameters: { width: 0.1 },
      undoFunction: () => ({ success: true }),
      redoFunction: () => ({ success: true }),
      data: { test: 'data' }
    });

    const result = await manager.addEntry(entry);
    runner.assertTrue(result.success);
    runner.assertHasProperty(result, 'entryId');
  });

  runner.addTest('HistoryManager - Undo Operation', async () => {
    const manager = new HistoryManager();
    
    // Add an entry
    const entry = new HistoryEntry({
      type: HistoryEntryTypes.GEOMETRY_OPERATION,
      operation: 'bevel',
      description: 'Test bevel operation',
      parameters: { width: 0.1 },
      undoFunction: () => ({ success: true, message: 'Undone' }),
      redoFunction: () => ({ success: true, message: 'Redone' }),
      data: { test: 'data' }
    });

    await manager.addEntry(entry);
    
    // Test undo
    const undoResult = await manager.undo();
    runner.assertTrue(undoResult.success);
    runner.assertHasProperty(undoResult, 'entryId');
  });

  runner.addTest('HistoryManager - Redo Operation', async () => {
    const manager = new HistoryManager();
    
    // Add an entry
    const entry = new HistoryEntry({
      type: HistoryEntryTypes.GEOMETRY_OPERATION,
      operation: 'bevel',
      description: 'Test bevel operation',
      parameters: { width: 0.1 },
      undoFunction: () => ({ success: true, message: 'Undone' }),
      redoFunction: () => ({ success: true, message: 'Redone' }),
      data: { test: 'data' }
    });

    await manager.addEntry(entry);
    await manager.undo();
    
    // Test redo
    const redoResult = await manager.redo();
    runner.assertTrue(redoResult.success);
    runner.assertHasProperty(redoResult, 'entryId');
  });

  runner.addTest('HistoryManager - Clear History', async () => {
    const manager = new HistoryManager();
    
    // Add some entries
    for (let i = 0; i < 3; i++) {
      const entry = new HistoryEntry({
        type: HistoryEntryTypes.GEOMETRY_OPERATION,
        operation: `operation_${i}`,
        description: `Test operation ${i}`,
        parameters: { value: i },
        undoFunction: () => ({ success: true }),
        redoFunction: () => ({ success: true }),
        data: { test: i }
      });
      await manager.addEntry(entry);
    }
    
    // Clear history
    const clearResult = await manager.clear();
    runner.assertTrue(clearResult.success);
    
    // Check statistics
    const stats = manager.getStatistics();
    runner.assertEquals(stats.undoStackSize, 0);
    runner.assertEquals(stats.redoStackSize, 0);
  });

  runner.addTest('HistoryManager - Statistics', () => {
    const manager = new HistoryManager();
    const stats = manager.getStatistics();
    
    runner.assertHasProperty(stats, 'totalEntries');
    runner.assertHasProperty(stats, 'undoStackSize');
    runner.assertHasProperty(stats, 'redoStackSize');
    runner.assertHasProperty(stats, 'canUndo');
    runner.assertHasProperty(stats, 'canRedo');
    runner.assertHasProperty(stats, 'state');
  });

  // HistoryEntry Tests
  runner.addTest('HistoryEntry - Constructor', () => {
    const entry = new HistoryEntry({
      type: HistoryEntryTypes.GEOMETRY_OPERATION,
      operation: 'bevel',
      description: 'Test operation',
      parameters: { width: 0.1 },
      undoFunction: () => ({ success: true }),
      redoFunction: () => ({ success: true }),
      data: { test: 'data' }
    });
    
    runner.assertHasProperty(entry, 'id');
    runner.assertEquals(entry.type, HistoryEntryTypes.GEOMETRY_OPERATION);
    runner.assertEquals(entry.state, HistoryEntryStates.PENDING);
    runner.assertHasProperty(entry, 'metadata');
    runner.assertHasProperty(entry, 'undoFunction');
    runner.assertHasProperty(entry, 'redoFunction');
  });

  runner.addTest('HistoryEntry - Undo Operation', async () => {
    const entry = new HistoryEntry({
      type: HistoryEntryTypes.GEOMETRY_OPERATION,
      operation: 'bevel',
      description: 'Test operation',
      parameters: { width: 0.1 },
      undoFunction: () => ({ success: true, message: 'Undone' }),
      redoFunction: () => ({ success: true, message: 'Redone' }),
      data: { test: 'data' }
    });
    
    const result = await entry.undo();
    runner.assertTrue(result.success);
    runner.assertEquals(entry.state, HistoryEntryStates.COMPLETED);
  });

  runner.addTest('HistoryEntry - Redo Operation', async () => {
    const entry = new HistoryEntry({
      type: HistoryEntryTypes.GEOMETRY_OPERATION,
      operation: 'bevel',
      description: 'Test operation',
      parameters: { width: 0.1 },
      undoFunction: () => ({ success: true, message: 'Undone' }),
      redoFunction: () => ({ success: true, message: 'Redone' }),
      data: { test: 'data' }
    });
    
    const result = await entry.redo();
    runner.assertTrue(result.success);
    runner.assertEquals(entry.state, HistoryEntryStates.COMPLETED);
  });

  runner.addTest('HistoryEntry - Serialization', () => {
    const entry = new HistoryEntry({
      type: HistoryEntryTypes.GEOMETRY_OPERATION,
      operation: 'bevel',
      description: 'Test operation',
      parameters: { width: 0.1 },
      undoFunction: () => ({ success: true }),
      redoFunction: () => ({ success: true }),
      data: { test: 'data' }
    });
    
    const serialized = entry.serialize();
    runner.assertHasProperty(serialized, 'id');
    runner.assertHasProperty(serialized, 'type');
    runner.assertHasProperty(serialized, 'state');
    runner.assertHasProperty(serialized, 'metadata');
    runner.assertHasProperty(serialized, 'data');
  });

  // Factory Function Tests
  runner.addTest('Factory Functions - Create History Manager', () => {
    const manager = createHistoryManager({ maxEntries: 25 });
    runner.assertTrue(manager instanceof HistoryManager);
    runner.assertEquals(manager.config.maxEntries, 25);
  });

  runner.addTest('Factory Functions - Create Geometry History Entry', () => {
    const entry = createGeometryHistoryEntry({
      operation: 'bevel',
      parameters: { width: 0.1 },
      beforeData: { vertices: [] },
      afterData: { vertices: [] },
      undoFunction: () => ({ success: true }),
      redoFunction: () => ({ success: true })
    });
    
    runner.assertTrue(entry instanceof HistoryEntry);
    runner.assertEquals(entry.type, HistoryEntryTypes.GEOMETRY_OPERATION);
    runner.assertEquals(entry.metadata.operation, 'bevel');
  });

  runner.addTest('Factory Functions - Create Vertex History Entry', () => {
    const entry = createVertexHistoryEntry({
      operation: 'snap',
      parameters: { tolerance: 0.1 },
      beforeData: { vertices: [] },
      afterData: { vertices: [] },
      undoFunction: () => ({ success: true }),
      redoFunction: () => ({ success: true })
    });
    
    runner.assertTrue(entry instanceof HistoryEntry);
    runner.assertEquals(entry.type, HistoryEntryTypes.VERTEX_OPERATION);
    runner.assertEquals(entry.metadata.operation, 'snap');
  });

  runner.addTest('Factory Functions - Create Edge History Entry', () => {
    const entry = createEdgeHistoryEntry({
      operation: 'split',
      parameters: { ratio: 0.5 },
      beforeData: { edges: [] },
      afterData: { edges: [] },
      undoFunction: () => ({ success: true }),
      redoFunction: () => ({ success: true })
    });
    
    runner.assertTrue(entry instanceof HistoryEntry);
    runner.assertEquals(entry.type, HistoryEntryTypes.EDGE_OPERATION);
    runner.assertEquals(entry.metadata.operation, 'split');
  });

  runner.addTest('Factory Functions - Create Face History Entry', () => {
    const entry = createFaceHistoryEntry({
      operation: 'split',
      parameters: { method: 'center' },
      beforeData: { faces: [] },
      afterData: { faces: [] },
      undoFunction: () => ({ success: true }),
      redoFunction: () => ({ success: true })
    });
    
    runner.assertTrue(entry instanceof HistoryEntry);
    runner.assertEquals(entry.type, HistoryEntryTypes.FACE_OPERATION);
    runner.assertEquals(entry.metadata.operation, 'split');
  });

  runner.addTest('Factory Functions - Create UV History Entry', () => {
    const entry = createUVHistoryEntry({
      operation: 'unwrap',
      parameters: { method: 'smart' },
      beforeData: { uvs: [] },
      afterData: { uvs: [] },
      undoFunction: () => ({ success: true }),
      redoFunction: () => ({ success: true })
    });
    
    runner.assertTrue(entry instanceof HistoryEntry);
    runner.assertEquals(entry.type, HistoryEntryTypes.UV_OPERATION);
    runner.assertEquals(entry.metadata.operation, 'unwrap');
  });

  // Undo/Redo Function Tests
  runner.addTest('Undo/Redo Functions - Geometry', () => {
    const undoFn = createGeometryUndoFunction(
      { vertices: [] },
      { vertices: [1, 2, 3] },
      (data) => ({ success: true, data })
    );
    
    const redoFn = createGeometryRedoFunction(
      { vertices: [] },
      { vertices: [1, 2, 3] },
      (data) => ({ success: true, data })
    );
    
    runner.assertTrue(typeof undoFn === 'function');
    runner.assertTrue(typeof redoFn === 'function');
  });

  runner.addTest('Undo/Redo Functions - Vertex', () => {
    const undoFn = createVertexUndoFunction(
      { vertices: [] },
      { vertices: [1, 2, 3] },
      (data) => ({ success: true, data })
    );
    
    const redoFn = createVertexRedoFunction(
      { vertices: [] },
      { vertices: [1, 2, 3] },
      (data) => ({ success: true, data })
    );
    
    runner.assertTrue(typeof undoFn === 'function');
    runner.assertTrue(typeof redoFn === 'function');
  });

  runner.addTest('Undo/Redo Functions - Edge', () => {
    const undoFn = createEdgeUndoFunction(
      { edges: [] },
      { edges: [1, 2, 3] },
      (data) => ({ success: true, data })
    );
    
    const redoFn = createEdgeRedoFunction(
      { edges: [] },
      { edges: [1, 2, 3] },
      (data) => ({ success: true, data })
    );
    
    runner.assertTrue(typeof undoFn === 'function');
    runner.assertTrue(typeof redoFn === 'function');
  });

  runner.addTest('Undo/Redo Functions - Face', () => {
    const undoFn = createFaceUndoFunction(
      { faces: [] },
      { faces: [1, 2, 3] },
      (data) => ({ success: true, data })
    );
    
    const redoFn = createFaceRedoFunction(
      { faces: [] },
      { faces: [1, 2, 3] },
      (data) => ({ success: true, data })
    );
    
    runner.assertTrue(typeof undoFn === 'function');
    runner.assertTrue(typeof redoFn === 'function');
  });

  runner.addTest('Undo/Redo Functions - UV', () => {
    const undoFn = createUVUndoFunction(
      { uvs: [] },
      { uvs: [1, 2, 3] },
      (data) => ({ success: true, data })
    );
    
    const redoFn = createUVRedoFunction(
      { uvs: [] },
      { uvs: [1, 2, 3] },
      (data) => ({ success: true, data })
    );
    
    runner.assertTrue(typeof undoFn === 'function');
    runner.assertTrue(typeof redoFn === 'function');
  });

  // Utility Function Tests
  runner.addTest('Utility Functions - Compress History Data', () => {
    const entries = [
      new HistoryEntry({
        type: HistoryEntryTypes.GEOMETRY_OPERATION,
        operation: 'bevel',
        description: 'Test operation',
        parameters: { width: 0.1 },
        undoFunction: () => ({ success: true }),
        redoFunction: () => ({ success: true }),
        data: { test: 'data' }
      })
    ];
    
    const compressed = compressHistoryData(entries);
    runner.assertHasProperty(compressed, 'entries');
    runner.assertHasProperty(compressed, 'metadata');
    runner.assertHasProperty(compressed.metadata, 'compressedAt');
  });

  runner.addTest('Utility Functions - Validate History Data', () => {
    const entries = [
      new HistoryEntry({
        type: HistoryEntryTypes.GEOMETRY_OPERATION,
        operation: 'bevel',
        description: 'Test operation',
        parameters: { width: 0.1 },
        undoFunction: () => ({ success: true }),
        redoFunction: () => ({ success: true }),
        data: { test: 'data' }
      })
    ];
    
    const validation = validateHistoryData(entries);
    runner.assertTrue(validation.valid);
    runner.assertEquals(validation.totalEntries, 1);
  });

  // Integration Tests
  runner.addTest('Integration - Complete History Workflow', async () => {
    const manager = new HistoryManager();
    
    // Add geometry operation
    const geometryEntry = createGeometryHistoryEntry({
      operation: 'bevel',
      parameters: { width: 0.1 },
      beforeData: { vertices: [] },
      afterData: { vertices: [1, 2, 3] },
      undoFunction: () => ({ success: true }),
      redoFunction: () => ({ success: true })
    });
    
    const addResult = await manager.addEntry(geometryEntry);
    runner.assertTrue(addResult.success);
    
    // Undo operation
    const undoResult = await manager.undo();
    runner.assertTrue(undoResult.success);
    
    // Redo operation
    const redoResult = await manager.redo();
    runner.assertTrue(redoResult.success);
    
    // Check statistics
    const stats = manager.getStatistics();
    runner.assertEquals(stats.undoStackSize, 1);
    runner.assertEquals(stats.redoStackSize, 0);
  });

  runner.addTest('Integration - Multiple Operation Types', async () => {
    const manager = new HistoryManager();
    
    // Add different types of operations
    const operations = [
      createGeometryHistoryEntry({
        operation: 'bevel',
        parameters: { width: 0.1 },
        beforeData: { vertices: [] },
        afterData: { vertices: [1, 2, 3] },
        undoFunction: () => ({ success: true }),
        redoFunction: () => ({ success: true })
      }),
      createVertexHistoryEntry({
        operation: 'snap',
        parameters: { tolerance: 0.1 },
        beforeData: { vertices: [] },
        afterData: { vertices: [1, 2, 3] },
        undoFunction: () => ({ success: true }),
        redoFunction: () => ({ success: true })
      }),
      createEdgeHistoryEntry({
        operation: 'split',
        parameters: { ratio: 0.5 },
        beforeData: { edges: [] },
        afterData: { edges: [1, 2, 3] },
        undoFunction: () => ({ success: true }),
        redoFunction: () => ({ success: true })
      })
    ];
    
    for (const operation of operations) {
      const result = await manager.addEntry(operation);
      runner.assertTrue(result.success);
    }
    
    const stats = manager.getStatistics();
    runner.assertEquals(stats.undoStackSize, 3);
  });

  await runner.runTests();
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runHistoryTests().catch(console.error);
} else {
  // Browser environment
  window.runHistoryTests = runHistoryTests;
  console.log('🧪 History test runner loaded. Call runHistoryTests() to execute tests.');
} 