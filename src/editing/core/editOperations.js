/**
 * @fileoverview Edit Operations Coordinator
 * Coordinates and validates edit operations
 */

import { EditTypes } from '../types/operationTypes.js';

/**
 * Edit operations coordinator for managing and validating operations
 */
export class EditOperationsCoordinator {
  /**
   * Create an edit operations coordinator
   * @param {Object} options - Configuration options
   * @param {boolean} options.validation - Enable validation
   * @param {boolean} options.autoCommit - Auto-commit operations
   */
  constructor(options = {}) {
    const { validation = true, autoCommit = false } = options;
    
    this.validation = validation;
    this.autoCommit = autoCommit;
    this.pendingOperations = [];
  }

  /**
   * Add operation to current edit
   * @param {string} type - Operation type
   * @param {Object} data - Operation data
   * @param {Object} options - Operation options
   * @returns {Object} Operation result
   */
  addOperation(type, data, options = {}) {
    const operation = {
      type,
      data,
      options,
      id: this.generateOperationId(),
      timestamp: Date.now()
    };

    if (this.validation && !this.validateOperation(operation)) {
      return { success: false, errors: ['Invalid operation'], operation: null };
    }

    this.pendingOperations.push(operation);

    if (this.autoCommit) {
      return this.commitOperation(operation);
    }

    return { success: true, operation };
  }

  /**
   * Commit pending operations
   * @returns {Object} Commit result
   */
  commitOperations() {
    if (this.pendingOperations.length === 0) {
      return { success: false, errors: ['No pending operations'], operations: [] };
    }

    const results = this.pendingOperations.map(operation => 
      this.commitOperation(operation)
    );

    this.pendingOperations = [];

    return {
      success: results.every(r => r.success),
      operations: results,
      totalOperations: results.length
    };
  }

  /**
   * Commit single operation
   * @param {Object} operation - Operation to commit
   * @returns {Object} Commit result
   */
  commitOperation(operation) {
    try {
      // Implementation would execute the actual operation here
      // For now, we'll simulate success
      return {
        success: true,
        operation,
        result: {
          type: operation.type,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        operation,
        errors: [error.message]
      };
    }
  }

  /**
   * Validate operation
   * @param {Object} operation - Operation to validate
   * @returns {boolean} Validity
   */
  validateOperation(operation) {
    if (!operation || typeof operation !== 'object') {
      return false;
    }

    if (!operation.type || !Object.values(EditTypes).includes(operation.type)) {
      return false;
    }

    if (!operation.data || typeof operation.data !== 'object') {
      return false;
    }

    return true;
  }

  /**
   * Get pending operations
   * @returns {Array} Pending operations
   */
  getPendingOperations() {
    return [...this.pendingOperations];
  }

  /**
   * Clear pending operations
   */
  clearPendingOperations() {
    this.pendingOperations = [];
  }

  /**
   * Get operation statistics
   * @returns {Object} Operation statistics
   */
  getOperationStatistics() {
    const typeCounts = {};
    this.pendingOperations.forEach(op => {
      typeCounts[op.type] = (typeCounts[op.type] || 0) + 1;
    });

    return {
      pendingCount: this.pendingOperations.length,
      typeCounts,
      validation: this.validation,
      autoCommit: this.autoCommit
    };
  }

  /**
   * Generate unique operation ID
   * @returns {string} Unique operation ID
   */
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get operations by type
   * @param {string} type - Operation type
   * @returns {Array} Operations of specified type
   */
  getOperationsByType(type) {
    return this.pendingOperations.filter(op => op.type === type);
  }
} 