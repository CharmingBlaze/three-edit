/**
 * @fileoverview Modern Edit Manager
 * Modular edit manager using focused components
 */

import { EditStateManager } from './editState.js';
import { EditHistoryManager } from './editHistory.js';
import { EditOperationsCoordinator } from './editOperations.js';

/**
 * Modern edit manager for coordinating all editing operations
 */
export class ModernEditManager {
  /**
   * Create a modern edit manager
   * @param {Object} options - Configuration options
   * @param {boolean} options.autoSave - Auto-save edits
   * @param {boolean} options.validation - Enable validation
   * @param {number} options.maxHistory - Maximum history size
   * @param {string} options.defaultMode - Default edit mode
   */
  constructor(options = {}) {
    const {
      autoSave = true,
      validation = true,
      maxHistory = 100,
      defaultMode = 'object'
    } = options;

    // Initialize focused components
    this.stateManager = new EditStateManager({
      defaultMode,
      autoSave
    });

    this.historyManager = new EditHistoryManager({
      maxHistory,
      enableUndo: true
    });

    this.operationsCoordinator = new EditOperationsCoordinator({
      validation,
      autoCommit: false
    });

    // Event listeners
    this.listeners = new Map();
  }

  /**
   * Start editing session
   * @param {string} mode - Edit mode
   * @param {Object} options - Edit options
   * @returns {boolean} Success status
   */
  startEdit(mode, options = {}) {
    const success = this.stateManager.startEdit(mode, options);
    
    if (success) {
      this.notifyListeners('editStarted', {
        mode,
        options,
        timestamp: Date.now()
      });
    }

    return success;
  }

  /**
   * End editing session
   * @param {boolean} commit - Whether to commit the edit
   * @returns {Object|null} Edit result or null
   */
  endEdit(commit = true) {
    const edit = this.stateManager.endEdit(commit);
    
    if (edit) {
      // Commit any pending operations
      const commitResult = this.operationsCoordinator.commitOperations();
      
      if (commitResult.success) {
        edit.operations = commitResult.operations;
      }

      // Add to history
      this.historyManager.addToHistory(edit);

      this.notifyListeners('editEnded', {
        edit,
        commit,
        timestamp: Date.now()
      });
    }

    return edit;
  }

  /**
   * Add operation to current edit
   * @param {string} type - Operation type
   * @param {Object} data - Operation data
   * @param {Object} options - Operation options
   * @returns {Object} Operation result
   */
  addOperation(type, data, options = {}) {
    if (!this.stateManager.isCurrentlyEditing()) {
      return { success: false, errors: ['Not in edit mode'], operation: null };
    }

    const result = this.operationsCoordinator.addOperation(type, data, options);
    
    if (result.success) {
      this.notifyListeners('operationAdded', {
        operation: result.operation,
        timestamp: Date.now()
      });
    }

    return result;
  }

  /**
   * Select objects
   * @param {Array} objects - Objects to select
   * @param {Object} options - Selection options
   */
  selectObjects(objects, options = {}) {
    this.stateManager.selectObjects(objects, options);
    
    this.notifyListeners('selectionChanged', {
      selectedObjects: this.stateManager.getSelectedObjects(),
      selectionCount: this.stateManager.getSelectionCount(),
      timestamp: Date.now()
    });
  }

  /**
   * Deselect objects
   * @param {Array} objects - Objects to deselect
   */
  deselectObjects(objects) {
    this.stateManager.deselectObjects(objects);
    
    this.notifyListeners('selectionChanged', {
      selectedObjects: this.stateManager.getSelectedObjects(),
      selectionCount: this.stateManager.getSelectionCount(),
      timestamp: Date.now()
    });
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.stateManager.clearSelection();
    
    this.notifyListeners('selectionChanged', {
      selectedObjects: new Set(),
      selectionCount: 0,
      timestamp: Date.now()
    });
  }

  /**
   * Set edit mode
   * @param {string} mode - New edit mode
   * @returns {boolean} Success status
   */
  setEditMode(mode) {
    const success = this.stateManager.setEditMode(mode);
    
    if (success) {
      this.notifyListeners('modeChanged', {
        mode,
        timestamp: Date.now()
      });
    }

    return success;
  }

  /**
   * Undo last operation
   * @returns {Object|null} Undone edit or null
   */
  undo() {
    const edit = this.historyManager.undo();
    
    if (edit) {
      this.notifyListeners('undo', {
        edit,
        timestamp: Date.now()
      });
    }

    return edit;
  }

  /**
   * Redo last undone operation
   * @returns {Object|null} Redone edit or null
   */
  redo() {
    const edit = this.historyManager.redo();
    
    if (edit) {
      this.notifyListeners('redo', {
        edit,
        timestamp: Date.now()
      });
    }

    return edit;
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return {
      ...this.stateManager.getState(),
      history: this.historyManager.getHistoryStatistics(),
      operations: this.operationsCoordinator.getOperationStatistics()
    };
  }

  /**
   * Get edit history
   * @returns {Array} Edit history
   */
  getEditHistory() {
    return this.historyManager.getEditHistory();
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.historyManager.clearHistory();
    
    this.notifyListeners('historyCleared', {
      timestamp: Date.now()
    });
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Notify listeners of event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Get edit statistics
   * @returns {Object} Edit statistics
   */
  getEditStatistics() {
    return {
      state: this.stateManager.getState(),
      history: this.historyManager.getHistoryStatistics(),
      operations: this.operationsCoordinator.getOperationStatistics()
    };
  }
} 