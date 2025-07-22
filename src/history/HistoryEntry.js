/**
 * @fileoverview History Entry
 * Represents a single operation in the history system
 */

import { HistoryEntryTypes, HistoryEntryStates, HistoryEntryPriorities } from './HistoryTypes.js';

/**
 * History Entry Class
 * Represents a single operation that can be undone/redone
 */
export class HistoryEntry {
  /**
   * Create a new history entry
   * @param {Object} config - Entry configuration
   * @param {string} config.type - Entry type
   * @param {string} config.operation - Operation name
   * @param {string} config.description - Human-readable description
   * @param {Object} config.parameters - Operation parameters
   * @param {Function} config.undoFunction - Function to undo this operation
   * @param {Function} config.redoFunction - Function to redo this operation
   * @param {Object} config.data - Operation data
   * @param {number} config.priority - Entry priority
   * @param {string} config.userId - User identifier
   * @param {Object} config.context - Additional context
   */
  constructor(config) {
    this.id = this.generateId();
    this.type = config.type || HistoryEntryTypes.CUSTOM_OPERATION;
    this.state = HistoryEntryStates.PENDING;
    this.priority = config.priority || HistoryEntryPriorities.NORMAL;
    this.timestamp = Date.now();
    
    // Metadata
    this.metadata = {
      operation: config.operation || 'unknown',
      description: config.description || 'No description',
      parameters: config.parameters || {},
      timestamp: this.timestamp,
      userId: config.userId || 'default',
      context: config.context || {}
    };
    
    // Functions
    this.undoFunction = config.undoFunction || (() => ({ success: false, message: 'No undo function' }));
    this.redoFunction = config.redoFunction || (() => ({ success: false, message: 'No redo function' }));
    
    // Data
    this.data = config.data || {};
    
    // Validation
    this.validate();
  }

  /**
   * Generate unique ID for this entry
   * @returns {string} Unique identifier
   */
  generateId() {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate entry configuration
   * @throws {Error} If validation fails
   */
  validate() {
    if (!Object.values(HistoryEntryTypes).includes(this.type)) {
      throw new Error(`Invalid history entry type: ${this.type}`);
    }
    
    if (!Object.values(HistoryEntryStates).includes(this.state)) {
      throw new Error(`Invalid history entry state: ${this.state}`);
    }
    
    if (!Object.values(HistoryEntryPriorities).includes(this.priority)) {
      throw new Error(`Invalid history entry priority: ${this.priority}`);
    }
    
    if (typeof this.undoFunction !== 'function') {
      throw new Error('Undo function must be a function');
    }
    
    if (typeof this.redoFunction !== 'function') {
      throw new Error('Redo function must be a function');
    }
  }

  /**
   * Execute undo operation
   * @returns {Object} Undo result
   */
  async undo() {
    try {
      this.state = HistoryEntryStates.PENDING;
      const result = await this.undoFunction(this.data);
      
      if (result.success) {
        this.state = HistoryEntryStates.COMPLETED;
      } else {
        this.state = HistoryEntryStates.FAILED;
      }
      
      return {
        success: result.success,
        message: result.message || 'Undo operation completed',
        entryId: this.id,
        data: result.data || {}
      };
    } catch (error) {
      this.state = HistoryEntryStates.FAILED;
      return {
        success: false,
        message: `Undo operation failed: ${error.message}`,
        entryId: this.id,
        error
      };
    }
  }

  /**
   * Execute redo operation
   * @returns {Object} Redo result
   */
  async redo() {
    try {
      this.state = HistoryEntryStates.PENDING;
      const result = await this.redoFunction(this.data);
      
      if (result.success) {
        this.state = HistoryEntryStates.COMPLETED;
      } else {
        this.state = HistoryEntryStates.FAILED;
      }
      
      return {
        success: result.success,
        message: result.message || 'Redo operation completed',
        entryId: this.id,
        data: result.data || {}
      };
    } catch (error) {
      this.state = HistoryEntryStates.FAILED;
      return {
        success: false,
        message: `Redo operation failed: ${error.message}`,
        entryId: this.id,
        error
      };
    }
  }

  /**
   * Get entry summary
   * @returns {Object} Entry summary
   */
  getSummary() {
    return {
      id: this.id,
      type: this.type,
      state: this.state,
      priority: this.priority,
      timestamp: this.timestamp,
      metadata: this.metadata
    };
  }

  /**
   * Serialize entry for storage
   * @returns {Object} Serialized entry
   */
  serialize() {
    return {
      id: this.id,
      type: this.type,
      state: this.state,
      priority: this.priority,
      timestamp: this.timestamp,
      metadata: this.metadata,
      data: this.data
    };
  }

  /**
   * Deserialize entry from storage
   * @param {Object} serialized - Serialized entry data
   * @param {Function} undoFunction - Undo function
   * @param {Function} redoFunction - Redo function
   * @returns {HistoryEntry} Deserialized entry
   */
  static deserialize(serialized, undoFunction, redoFunction) {
    const entry = new HistoryEntry({
      type: serialized.type,
      operation: serialized.metadata.operation,
      description: serialized.metadata.description,
      parameters: serialized.metadata.parameters,
      undoFunction,
      redoFunction,
      data: serialized.data,
      priority: serialized.priority,
      userId: serialized.metadata.userId,
      context: serialized.metadata.context
    });
    
    entry.id = serialized.id;
    entry.state = serialized.state;
    entry.timestamp = serialized.timestamp;
    
    return entry;
  }

  /**
   * Check if entry can be undone
   * @returns {boolean} True if can be undone
   */
  canUndo() {
    return this.state === HistoryEntryStates.COMPLETED && 
           typeof this.undoFunction === 'function';
  }

  /**
   * Check if entry can be redone
   * @returns {boolean} True if can be redone
   */
  canRedo() {
    return this.state === HistoryEntryStates.COMPLETED && 
           typeof this.redoFunction === 'function';
  }

  /**
   * Update entry metadata
   * @param {Object} updates - Metadata updates
   */
  updateMetadata(updates) {
    this.metadata = { ...this.metadata, ...updates };
    this.timestamp = Date.now();
  }

  /**
   * Get entry age in milliseconds
   * @returns {number} Age in milliseconds
   */
  getAge() {
    return Date.now() - this.timestamp;
  }

  /**
   * Check if entry is older than specified time
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {boolean} True if entry is older than maxAge
   */
  isOlderThan(maxAge) {
    return this.getAge() > maxAge;
  }
} 