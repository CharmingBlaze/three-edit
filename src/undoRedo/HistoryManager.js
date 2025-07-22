/**
 * @fileoverview History Manager for Undo/Redo functionality
 * Manages operation history with support for mesh operations, transformations, and custom actions
 */

import { EditableMesh } from '../EditableMesh.js';

/**
 * Represents a single operation in the history
 */
export class HistoryOperation {
  /**
   * Create a history operation
   * @param {string} type - Operation type
   * @param {Object} data - Operation data
   * @param {string} description - Human-readable description
   * @param {Function} undoFn - Function to undo this operation
   * @param {Function} redoFn - Function to redo this operation
   */
  constructor(type, data, description, undoFn, redoFn) {
    this.type = type;
    this.data = data;
    this.description = description;
    this.undoFn = undoFn;
    this.redoFn = redoFn;
    this.timestamp = Date.now();
  }

  /**
   * Execute undo function
   * @returns {boolean} Success status
   */
  undo() {
    try {
      if (this.undoFn) {
        this.undoFn(this.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Undo operation failed:', error);
      return false;
    }
  }

  /**
   * Execute redo function
   * @returns {boolean} Success status
   */
  redo() {
    try {
      if (this.redoFn) {
        this.redoFn(this.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Redo operation failed:', error);
      return false;
    }
  }

  /**
   * Get operation summary
   * @returns {Object} Operation summary
   */
  getSummary() {
    return {
      type: this.type,
      description: this.description,
      timestamp: this.timestamp,
      dataKeys: Object.keys(this.data || {})
    };
  }
}

/**
 * History Manager for managing undo/redo operations
 */
export class HistoryManager {
  /**
   * Create a history manager
   * @param {Object} options - Configuration options
   * @param {number} options.maxHistorySize - Maximum number of operations to keep, defaults to 100
   * @param {boolean} options.enableGrouping - Enable operation grouping, defaults to true
   * @param {number} options.groupTimeout - Timeout for grouping operations in ms, defaults to 500
   */
  constructor(options = {}) {
    const {
      maxHistorySize = 100,
      enableGrouping = true,
      groupTimeout = 500
    } = options;

    this.maxHistorySize = maxHistorySize;
    this.enableGrouping = enableGrouping;
    this.groupTimeout = groupTimeout;

    this.history = [];
    this.currentIndex = -1;
    this.isExecuting = false;
    this.groupStartTime = 0;
    this.currentGroup = null;
    this.listeners = new Set();
  }

  /**
   * Add an operation to history
   * @param {string} type - Operation type
   * @param {Object} data - Operation data
   * @param {string} description - Human-readable description
   * @param {Function} undoFn - Function to undo this operation
   * @param {Function} redoFn - Function to redo this operation
   * @returns {HistoryOperation} The created operation
   */
  addOperation(type, data, description, undoFn, redoFn) {
    if (this.isExecuting) {
      console.warn('Cannot add operation while executing undo/redo');
      return null;
    }

    const operation = new HistoryOperation(type, data, description, undoFn, redoFn);

    // Handle operation grouping
    if (this.enableGrouping && this.shouldGroupOperation(operation)) {
      this.addToCurrentGroup(operation);
    } else {
      this.addNewOperation(operation);
    }

    this.notifyListeners('operationAdded', { operation });
    return operation;
  }

  /**
   * Check if operation should be grouped
   * @param {HistoryOperation} operation - Operation to check
   * @returns {boolean} Whether to group the operation
   */
  shouldGroupOperation(operation) {
    if (!this.currentGroup) {return false;}
    
    const timeSinceGroupStart = Date.now() - this.groupStartTime;
    return timeSinceGroupStart < this.groupTimeout && 
           this.currentGroup.type === operation.type;
  }

  /**
   * Add operation to current group
   * @param {HistoryOperation} operation - Operation to add
   */
  addToCurrentGroup(operation) {
    if (!this.currentGroup) {
      this.startGroup(operation.type, operation.description);
    }
    
    this.currentGroup.operations.push(operation);
    this.currentGroup.description = `${this.currentGroup.description} (${this.currentGroup.operations.length})`;
  }

  /**
   * Add new operation to history
   * @param {HistoryOperation} operation - Operation to add
   */
  addNewOperation(operation) {
    // Remove any operations after current index (when undoing and adding new operation)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(operation);
    this.currentIndex++;

    // Maintain max history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    this.endCurrentGroup();
  }

  /**
   * Start a new operation group
   * @param {string} type - Group type
   * @param {string} description - Group description
   */
  startGroup(type, description) {
    this.currentGroup = {
      type,
      description,
      operations: [],
      undoFn: (data) => {
        // Execute undo functions in reverse order
        for (let i = data.operations.length - 1; i >= 0; i--) {
          data.operations[i].undo();
        }
      },
      redoFn: (data) => {
        // Execute redo functions in order
        for (let i = 0; i < data.operations.length; i++) {
          data.operations[i].redo();
        }
      }
    };
    this.groupStartTime = Date.now();
  }

  /**
   * End current operation group
   */
  endCurrentGroup() {
    if (this.currentGroup && this.currentGroup.operations.length > 0) {
      const groupOperation = new HistoryOperation(
        this.currentGroup.type,
        { operations: this.currentGroup.operations },
        this.currentGroup.description,
        this.currentGroup.undoFn,
        this.currentGroup.redoFn
      );

      // Replace the grouped operations with the group operation
      this.history.splice(this.currentIndex - this.currentGroup.operations.length + 1, 
                         this.currentGroup.operations.length, 
                         groupOperation);
      this.currentIndex = this.history.length - 1;
    }

    this.currentGroup = null;
  }

  /**
   * Undo the last operation
   * @returns {boolean} Success status
   */
  undo() {
    if (this.canUndo()) {
      this.isExecuting = true;
      const operation = this.history[this.currentIndex];
      const success = operation.undo();
      
      if (success) {
        this.currentIndex--;
        this.notifyListeners('undo', { operation });
      }
      
      this.isExecuting = false;
      return success;
    }
    return false;
  }

  /**
   * Redo the next operation
   * @returns {boolean} Success status
   */
  redo() {
    if (this.canRedo()) {
      this.isExecuting = true;
      const operation = this.history[this.currentIndex + 1];
      const success = operation.redo();
      
      if (success) {
        this.currentIndex++;
        this.notifyListeners('redo', { operation });
      }
      
      this.isExecuting = false;
      return success;
    }
    return false;
  }

  /**
   * Check if undo is possible
   * @returns {boolean} Whether undo is available
   */
  canUndo() {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is possible
   * @returns {boolean} Whether redo is available
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Clear all history
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.endCurrentGroup();
    this.notifyListeners('cleared', {});
  }

  /**
   * Get current history state
   * @returns {Object} Current state
   */
  getState() {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.currentIndex,
      historySize: this.history.length,
      maxHistorySize: this.maxHistorySize,
      isExecuting: this.isExecuting,
      hasCurrentGroup: this.currentGroup !== null
    };
  }

  /**
   * Get operation at specific index
   * @param {number} index - Operation index
   * @returns {HistoryOperation|null} Operation or null
   */
  getOperation(index) {
    return this.history[index] || null;
  }

  /**
   * Get all operations
   * @returns {HistoryOperation[]} All operations
   */
  getAllOperations() {
    return [...this.history];
  }

  /**
   * Get operations summary
   * @returns {Object[]} Operations summary
   */
  getOperationsSummary() {
    return this.history.map(op => op.getSummary());
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    this.listeners.add({ event, callback });
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    for (const listener of this.listeners) {
      if (listener.event === event && listener.callback === callback) {
        this.listeners.delete(listener);
        break;
      }
    }
  }

  /**
   * Notify all listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    for (const listener of this.listeners) {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('History listener error:', error);
        }
      }
    }
  }

  /**
   * Create a mesh operation
   * @param {string} type - Operation type
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} oldData - Old mesh data
   * @param {Object} newData - New mesh data
   * @param {string} description - Operation description
   * @returns {HistoryOperation} Created operation
   */
  createMeshOperation(type, mesh, oldData, newData, description) {
    const undoFn = (data) => {
      mesh.vertices = new Map(data.oldData.vertices);
      mesh.edges = new Map(data.oldData.edges);
      mesh.faces = new Map(data.oldData.faces);
      mesh.uvs = new Map(data.oldData.uvs);
      mesh.material = data.oldData.material;
      mesh.attributes = new Map(data.oldData.attributes);
    };

    const redoFn = (data) => {
      mesh.vertices = new Map(data.newData.vertices);
      mesh.edges = new Map(data.newData.edges);
      mesh.faces = new Map(data.newData.faces);
      mesh.uvs = new Map(data.newData.uvs);
      mesh.material = data.newData.material;
      mesh.attributes = new Map(data.newData.attributes);
    };

    return this.addOperation(type, { oldData, newData }, description, undoFn, redoFn);
  }

  /**
   * Create a transformation operation
   * @param {string} type - Operation type
   * @param {Object} target - Target object
   * @param {Object} oldTransform - Old transformation
   * @param {Object} newTransform - New transformation
   * @param {string} description - Operation description
   * @returns {HistoryOperation} Created operation
   */
  createTransformOperation(type, target, oldTransform, newTransform, description) {
    const undoFn = (data) => {
      Object.assign(target, data.oldTransform);
    };

    const redoFn = (data) => {
      Object.assign(target, data.newTransform);
    };

    return this.addOperation(type, { oldTransform, newTransform }, description, undoFn, redoFn);
  }

  /**
   * Create a custom operation
   * @param {string} type - Operation type
   * @param {Function} undoFn - Undo function
   * @param {Function} redoFn - Redo function
   * @param {Object} data - Operation data
   * @param {string} description - Operation description
   * @returns {HistoryOperation} Created operation
   */
  createCustomOperation(type, undoFn, redoFn, data, description) {
    return this.addOperation(type, data, description, undoFn, redoFn);
  }
} 