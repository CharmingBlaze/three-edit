/**
 * @fileoverview Test Framework
 * Comprehensive testing framework for the editing system
 */

/**
 * Test result types
 */
export const TestResultTypes = {
  PASS: 'pass',
  FAIL: 'fail',
  ERROR: 'error',
  SKIP: 'skip'
};

/**
 * Test severity levels
 */
export const TestSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Test framework for the editing system
 */
export class TestFramework {
  constructor() {
    this.tests = new Map();
    this.results = new Map();
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
    this.beforeAllHooks = [];
    this.afterAllHooks = [];
    this.currentTestSuite = null;
    this.currentTest = null;

    // Fix: Add it.skip and it.only as properties
    this.it.skip = (name, testFunction, reason = 'No reason provided') => {
      this.it(name, testFunction, { skip: true, skipReason: reason });
    };
    this.it.only = (name, testFunction, condition = () => true) => {
      this.it(name, testFunction, { only: true, condition });
    };
  }

  /**
   * Register a test suite
   * @param {string} name - Test suite name
   * @param {Function} suiteFunction - Test suite function
   */
  describe(name, suiteFunction) {
    this.currentTestSuite = name;
    this.tests.set(name, []);
    
    // Run beforeAll hooks
    this.runHooks(this.beforeAllHooks);
    
    try {
      suiteFunction();
    } catch (error) {
      this.recordError(name, error);
    }
    
    // Run afterAll hooks
    this.runHooks(this.afterAllHooks);
  }

  /**
   * Register a test case
   * @param {string} name - Test name
   * @param {Function} testFunction - Test function
   * @param {Object} options - Test options
   */
  it(name, testFunction, options = {}) {
    const testCase = {
      name,
      function: testFunction,
      suite: this.currentTestSuite,
      options: {
        severity: options.severity || TestSeverity.MEDIUM,
        timeout: options.timeout || 5000,
        retries: options.retries || 0,
        ...options
      }
    };

    if (!this.tests.has(this.currentTestSuite)) {
      this.tests.set(this.currentTestSuite, []);
    }
    this.tests.get(this.currentTestSuite).push(testCase);
  }

  /**
   * Before each test hook
   * @param {Function} hookFunction - Hook function
   */
  beforeEach(hookFunction) {
    this.beforeEachHooks.push(hookFunction);
  }

  /**
   * After each test hook
   * @param {Function} hookFunction - Hook function
   */
  afterEach(hookFunction) {
    this.afterEachHooks.push(hookFunction);
  }

  /**
   * Before all tests hook
   * @param {Function} hookFunction - Hook function
   */
  beforeAll(hookFunction) {
    this.beforeAllHooks.push(hookFunction);
  }

  /**
   * After all tests hook
   * @param {Function} hookFunction - Hook function
   */
  afterAll(hookFunction) {
    this.afterAllHooks.push(hookFunction);
  }

  /**
   * Run all tests
   * @returns {Object} Test results
   */
  async runTests() {
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: 0,
      suites: new Map(),
      duration: 0
    };

    const startTime = Date.now();

    for (const [suiteName, testCases] of this.tests) {
      const suiteResults = {
        name: suiteName,
        total: testCases.length,
        passed: 0,
        failed: 0,
        skipped: 0,
        errors: 0,
        tests: []
      };

      for (const testCase of testCases) {
        const testResult = await this.runTest(testCase);
        suiteResults.tests.push(testResult);

        switch (testResult.result) {
          case TestResultTypes.PASS:
            suiteResults.passed++;
            results.passed++;
            break;
          case TestResultTypes.FAIL:
            suiteResults.failed++;
            results.failed++;
            break;
          case TestResultTypes.SKIP:
            suiteResults.skipped++;
            results.skipped++;
            break;
          case TestResultTypes.ERROR:
            suiteResults.errors++;
            results.errors++;
            break;
        }
        results.total++;
      }

      results.suites.set(suiteName, suiteResults);
    }

    results.duration = Date.now() - startTime;
    this.results = results;
    return results;
  }

  /**
   * Run a single test
   * @param {Object} testCase - Test case
   * @returns {Object} Test result
   */
  async runTest(testCase) {
    const result = {
      name: testCase.name,
      suite: testCase.suite,
      result: TestResultTypes.PASS,
      duration: 0,
      error: null,
      message: '',
      timestamp: Date.now()
    };

    // Skip test if requested
    if (testCase.options.skip) {
      result.result = TestResultTypes.SKIP;
      result.message = testCase.options.skipReason || 'Test skipped';
      return result;
    }

    // Check if test should run
    if (testCase.options.only && !testCase.options.condition()) {
      result.result = TestResultTypes.SKIP;
      result.message = 'Test condition not met';
      return result;
    }

    // Run beforeEach hooks
    try {
      await this.runHooks(this.beforeEachHooks);
    } catch (error) {
      result.result = TestResultTypes.ERROR;
      result.error = error;
      result.message = 'BeforeEach hook failed';
      return result;
    }

    // Run test
    const startTime = Date.now();
    try {
      await this.runWithTimeout(testCase.function, testCase.options.timeout);
      result.duration = Date.now() - startTime;
    } catch (error) {
      result.result = TestResultTypes.ERROR;
      result.error = error;
      result.message = error.message;
      result.duration = Date.now() - startTime;
    }

    // Run afterEach hooks
    try {
      await this.runHooks(this.afterEachHooks);
    } catch (error) {
      // Don't fail test for afterEach errors, but log them
      console.warn('AfterEach hook failed:', error);
    }

    return result;
  }

  /**
   * Run function with timeout
   * @param {Function} fn - Function to run
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Promise that resolves with function result
   */
  async runWithTimeout(fn, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Test timed out after ${timeout}ms`));
      }, timeout);

      try {
        const result = fn();
        if (result && typeof result.then === 'function') {
          result.then(resolve).catch(reject).finally(() => clearTimeout(timer));
        } else {
          clearTimeout(timer);
          resolve(result);
        }
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Run hooks
   * @param {Array} hooks - Array of hook functions
   */
  async runHooks(hooks) {
    for (const hook of hooks) {
      await hook();
    }
  }

  /**
   * Assert that a condition is true
   * @param {boolean} condition - Condition to assert
   * @param {string} message - Assertion message
   */
  assert(condition, message = 'Assertion failed') {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * Assert that two values are equal
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Assertion message
   */
  assertEqual(actual, expected, message = 'Values are not equal') {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  /**
   * Assert that two values are deeply equal
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Assertion message
   */
  assertDeepEqual(actual, expected, message = 'Values are not deeply equal') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  /**
   * Assert that a value is truthy
   * @param {*} value - Value to check
   * @param {string} message - Assertion message
   */
  assertTruthy(value, message = 'Value is not truthy') {
    if (!value) {
      throw new Error(message);
    }
  }

  /**
   * Assert that a value is falsy
   * @param {*} value - Value to check
   * @param {string} message - Assertion message
   */
  assertFalsy(value, message = 'Value is not falsy') {
    if (value) {
      throw new Error(message);
    }
  }

  /**
   * Assert that a function throws an error
   * @param {Function} fn - Function to test
   * @param {string} message - Assertion message
   */
  assertThrows(fn, message = 'Function should throw an error') {
    try {
      fn();
      throw new Error(message);
    } catch (error) {
      // Expected error
    }
  }

  /**
   * Generate test report
   * @returns {string} Test report
   */
  generateReport() {
    if (!this.results) {
      return 'No test results available';
    }

    let report = `\n📊 Test Report\n`;
    report += `════════════════════════════════════════\n\n`;
    report += `📈 Summary:\n`;
    report += `  Total Tests: ${this.results.total}\n`;
    report += `  ✅ Passed: ${this.results.passed}\n`;
    report += `  ❌ Failed: ${this.results.failed}\n`;
    report += `  ⏭️  Skipped: ${this.results.skipped}\n`;
    report += `  💥 Errors: ${this.results.errors}\n`;
    report += `  ⏱️  Duration: ${this.results.duration}ms\n\n`;

    for (const [suiteName, suiteResult] of this.results.suites) {
      report += `📋 Suite: ${suiteName}\n`;
      report += `  Total: ${suiteResult.total} | Passed: ${suiteResult.passed} | Failed: ${suiteResult.failed} | Skipped: ${suiteResult.skipped} | Errors: ${suiteResult.errors}\n\n`;

      for (const test of suiteResult.tests) {
        const status = this.getStatusIcon(test.result);
        report += `  ${status} ${test.name} (${test.duration}ms)\n`;
        if (test.error) {
          report += `    Error: ${test.error.message}\n`;
        }
        if (test.message) {
          report += `    Message: ${test.message}\n`;
        }
      }
      report += `\n`;
    }

    return report;
  }

  /**
   * Get status icon for test result
   * @param {string} result - Test result
   * @returns {string} Status icon
   */
  getStatusIcon(result) {
    switch (result) {
      case TestResultTypes.PASS:
        return '✅';
      case TestResultTypes.FAIL:
        return '❌';
      case TestResultTypes.ERROR:
        return '💥';
      case TestResultTypes.SKIP:
        return '⏭️';
      default:
        return '❓';
    }
  }

  /**
   * Clear all tests and results
   */
  clear() {
    this.tests.clear();
    this.results.clear();
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
    this.beforeAllHooks = [];
    this.afterAllHooks = [];
    this.currentTestSuite = null;
    this.currentTest = null;
  }
}

/**
 * Create a new test framework instance
 * @returns {TestFramework} Test framework instance
 */
export function createTestFramework() {
  return new TestFramework();
}

/**
 * Global test framework instance
 */
export const testFramework = createTestFramework();

// Export convenience methods
export const { describe, it, beforeEach, afterEach, beforeAll, afterAll, assert, assertEqual, assertDeepEqual, assertTruthy, assertFalsy, assertThrows } = testFramework; 