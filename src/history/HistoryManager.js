/**
 * @fileoverview History Manager
 * Manages undo/redo functionality for the modular editing system
 */

import { HistoryEntry } from './HistoryEntry.js';
import { HistoryManagerStates, HistoryEntryPriorities } from './HistoryTypes.js';

/**
 * History Manager Class
 * Manages the undo/redo stack and integrates with modular operations
 */
export class HistoryManager {
  /**
   * Create a new history manager
   * @param {Object} config - Configuration options
   * @param {number} config.maxEntries - Maximum history entries
   * @param {boolean} config.autoSave - Auto-save history to storage
   * @param {boolean} config.compression - Enable history compression
   * @param {boolean} config.collaboration - Enable collaborative history
   * @param {number} config.maxMemoryUsage - Maximum memory usage in bytes
   * @param {boolean} config.enableUndoRedo - Enable undo/redo functionality
   * @param {boolean} config.enableBranching - Enable history branching
   * @param {boolean} config.enableMerging - Enable history merging
   */
  constructor(config = {}) {
    this.config = {
      maxEntries: config.maxEntries || 100,
      autoSave: config.autoSave || false,
      compression: config.compression || false,
      collaboration: config.collaboration || false,
      maxMemoryUsage: config.maxMemoryUsage || 50 * 1024 * 1024, // 50MB
      enableUndoRedo: config.enableUndoRedo !== false,
      enableBranching: config.enableBranching || false,
      enableMerging: config.enableMerging || false
    };

    this.state = HistoryManagerStates.IDLE;
    this.undoStack = [];
    this.redoStack = [];
    this.currentBranch = 'main';
    this.branches = new Map();
    this.listeners = new Map();
    this.storage = null;

    this.initialize();
  }

  /**
   * Initialize the history manager
   */
  initialize() {
    if (this.config.autoSave) {
      this.setupStorage();
    }

    if (this.config.collaboration) {
      this.setupCollaboration();
    }

    this.branches.set('main', {
      undoStack: [],
      redoStack: [],
      currentIndex: -1
    });
  }

  /**
   * Setup storage for auto-save
   */
  setupStorage() {
    try {
      this.storage = {
        save: (data) => localStorage.setItem('history_data', JSON.stringify(data)),
        load: () => {
          const data = localStorage.getItem('history_data');
          return data ? JSON.parse(data) : null;
        },
        clear: () => localStorage.removeItem('history_data')
      };
    } catch (error) {
      console.warn('Storage not available, auto-save disabled');
      this.config.autoSave = false;
    }
  }

  /**
   * Setup collaboration features
   */
  setupCollaboration() {
    // Placeholder for collaboration setup
    console.log('Collaboration features enabled');
  }

  /**
   * Add a new history entry
   * @param {Object} entryConfig - Entry configuration
   * @returns {Object} Result with entry ID and status
   */
  async addEntry(entryConfig) {
    if (!this.config.enableUndoRedo) {
      return { success: false, message: 'Undo/redo is disabled' };
    }

    try {
      this.state = HistoryManagerStates.RECORDING;
      
      const entry = new HistoryEntry(entryConfig);
      
      // Add to current branch
      const branch = this.branches.get(this.currentBranch);
      branch.undoStack.push(entry);
      branch.currentIndex++;
      
      // Clear redo stack when new entry is added
      branch.redoStack = [];
      
      // Enforce max entries limit
      if (branch.undoStack.length > this.config.maxEntries) {
        const removed = branch.undoStack.shift();
        branch.currentIndex--;
        console.log(`Removed old history entry: ${removed.id}`);
      }
      
      // Auto-save if enabled
      if (this.config.autoSave && this.storage) {
        await this.saveToStorage();
      }
      
      // Notify listeners
      this.notifyListeners('entryAdded', { entry, branch: this.currentBranch });
      
      this.state = HistoryManagerStates.IDLE;
      
      return {
        success: true,
        entryId: entry.id,
        message: 'History entry added successfully'
      };
    } catch (error) {
      this.state = HistoryManagerStates.IDLE;
      return {
        success: false,
        message: `Failed to add history entry: ${error.message}`,
        error
      };
    }
  }

  /**
   * Undo the last operation
   * @returns {Object} Undo result
   */
  async undo() {
    if (!this.config.enableUndoRedo) {
      return { success: false, message: 'Undo/redo is disabled' };
    }

    const branch = this.branches.get(this.currentBranch);
    
    if (branch.currentIndex < 0) {
      return { success: false, message: 'Nothing to undo' };
    }

    try {
      this.state = HistoryManagerStates.UNDOING;
      
      const entry = branch.undoStack[branch.currentIndex];
      const result = await entry.undo();
      
      if (result.success) {
        // Move entry to redo stack
        branch.redoStack.push(entry);
        branch.undoStack.splice(branch.currentIndex, 1);
        branch.currentIndex--;
        
        // Auto-save if enabled
        if (this.config.autoSave && this.storage) {
          await this.saveToStorage();
        }
        
        // Notify listeners
        this.notifyListeners('entryUndone', { entry, result });
        
        this.state = HistoryManagerStates.IDLE;
        return {
          success: true,
          entryId: entry.id,
          message: 'Operation undone successfully',
          data: result.data
        };
      } else {
        this.state = HistoryManagerStates.IDLE;
        return result;
      }
    } catch (error) {
      this.state = HistoryManagerStates.IDLE;
      return {
        success: false,
        message: `Undo operation failed: ${error.message}`,
        error
      };
    }
  }

  /**
   * Redo the last undone operation
   * @returns {Object} Redo result
   */
  async redo() {
    if (!this.config.enableUndoRedo) {
      return { success: false, message: 'Undo/redo is disabled' };
    }

    const branch = this.branches.get(this.currentBranch);
    
    if (branch.redoStack.length === 0) {
      return { success: false, message: 'Nothing to redo' };
    }

    try {
      this.state = HistoryManagerStates.REDOING;
      
      const entry = branch.redoStack.pop();
      const result = await entry.redo();
      
      if (result.success) {
        // Move entry back to undo stack
        branch.undoStack.push(entry);
        branch.currentIndex++;
        
        // Auto-save if enabled
        if (this.config.autoSave && this.storage) {
          await this.saveToStorage();
        }
        
        // Notify listeners
        this.notifyListeners('entryRedone', { entry, result });
        
        this.state = HistoryManagerStates.IDLE;
        return {
          success: true,
          entryId: entry.id,
          message: 'Operation redone successfully',
          data: result.data
        };
      } else {
        this.state = HistoryManagerStates.IDLE;
        return result;
      }
    } catch (error) {
      this.state = HistoryManagerStates.IDLE;
      return {
        success: false,
        message: `Redo operation failed: ${error.message}`,
        error
      };
    }
  }

  /**
   * Clear all history
   * @returns {Object} Clear result
   */
  async clear() {
    try {
      this.state = HistoryManagerStates.CLEARING;
      
      this.undoStack = [];
      this.redoStack = [];
      
      // Clear all branches
      for (const [branchName, branch] of this.branches) {
        branch.undoStack = [];
        branch.redoStack = [];
        branch.currentIndex = -1;
      }
      
      // Clear storage if enabled
      if (this.config.autoSave && this.storage) {
        this.storage.clear();
      }
      
      // Notify listeners
      this.notifyListeners('historyCleared', {});
      
      this.state = HistoryManagerStates.IDLE;
      
      return {
        success: true,
        message: 'History cleared successfully'
      };
    } catch (error) {
      this.state = HistoryManagerStates.IDLE;
      return {
        success: false,
        message: `Failed to clear history: ${error.message}`,
        error
      };
    }
  }

  /**
   * Get history statistics
   * @returns {Object} History statistics
   */
  getStatistics() {
    const branch = this.branches.get(this.currentBranch);
    
    return {
      totalEntries: branch.undoStack.length + branch.redoStack.length,
      undoStackSize: branch.undoStack.length,
      redoStackSize: branch.redoStack.length,
      currentIndex: branch.currentIndex,
      canUndo: branch.currentIndex >= 0,
      canRedo: branch.redoStack.length > 0,
      state: this.state,
      currentBranch: this.currentBranch,
      totalBranches: this.branches.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage
   * @returns {number} Estimated memory usage in bytes
   */
  estimateMemoryUsage() {
    const branch = this.branches.get(this.currentBranch);
    let totalSize = 0;
    
    // Estimate size of undo stack
    for (const entry of branch.undoStack) {
      totalSize += JSON.stringify(entry.serialize()).length;
    }
    
    // Estimate size of redo stack
    for (const entry of branch.redoStack) {
      totalSize += JSON.stringify(entry.serialize()).length;
    }
    
    return totalSize;
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify listeners of an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in history listener for event ${event}:`, error);
        }
      }
    }
  }

  /**
   * Save history to storage
   * @returns {Promise} Save result
   */
  async saveToStorage() {
    if (!this.storage) {
      return { success: false, message: 'Storage not available' };
    }

    try {
      const data = {
        branches: Array.from(this.branches.entries()),
        currentBranch: this.currentBranch,
        timestamp: Date.now()
      };
      
      this.storage.save(data);
      return { success: true, message: 'History saved to storage' };
    } catch (error) {
      return { success: false, message: `Failed to save history: ${error.message}` };
    }
  }

  /**
   * Load history from storage
   * @returns {Promise} Load result
   */
  async loadFromStorage() {
    if (!this.storage) {
      return { success: false, message: 'Storage not available' };
    }

    try {
      const data = this.storage.load();
      if (!data) {
        return { success: false, message: 'No saved history found' };
      }

      // Restore branches
      this.branches = new Map(data.branches);
      this.currentBranch = data.currentBranch || 'main';

      // Notify listeners
      this.notifyListeners('historyLoaded', { data });

      return { success: true, message: 'History loaded from storage' };
    } catch (error) {
      return { success: false, message: `Failed to load history: ${error.message}` };
    }
  }
} 