/**
 * @fileoverview History Manager for 3D Editor
 * Manages undo/redo functionality with branching and collaboration support
 */

import { HistoryEntry } from './HistoryEntry.js';

/**
 * History Manager States
 */
export const HistoryManagerStates = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  MERGING: 'merging',
  COMPRESSING: 'compressing'
};

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
      return { success: false, error: 'Undo/redo is disabled' };
    }

    try {
      this.state = HistoryManagerStates.PROCESSING;

      const entry = new HistoryEntry(entryConfig);
      const validation = entry.validate();

      if (!validation.isValid) {
        return { success: false, error: 'Invalid entry data', details: validation.errors };
      }

      // Check if entry can be merged with the last entry
      if (this.config.enableMerging && this.undoStack.length > 0) {
        const lastEntry = this.undoStack[this.undoStack.length - 1];
        if (entry.canMergeWith(lastEntry)) {
          const mergedEntry = lastEntry.merge(entry);
          this.undoStack[this.undoStack.length - 1] = mergedEntry;
          this.notifyListeners('entryMerged', { entry: mergedEntry });
          return { success: true, entryId: mergedEntry.id, merged: true };
        }
      }

      // Add entry to undo stack
      this.undoStack.push(entry);

      // Clear redo stack when new entry is added
      this.redoStack = [];

      // Check memory usage and compress if needed
      if (this.config.compression && this.estimateMemoryUsage() > this.config.maxMemoryUsage) {
        await this.compressHistory();
      }

      // Limit stack size
      if (this.undoStack.length > this.config.maxEntries) {
        this.undoStack.shift();
      }

      // Auto-save if enabled
      if (this.config.autoSave) {
        await this.saveToStorage();
      }

      this.notifyListeners('entryAdded', { entry });
      this.state = HistoryManagerStates.IDLE;

      return { success: true, entryId: entry.id };
    } catch (error) {
      this.state = HistoryManagerStates.IDLE;
      return { success: false, error: error.message };
    }
  }

  /**
   * Undo the last operation
   * @returns {Object} Result with operation status
   */
  async undo() {
    if (!this.config.enableUndoRedo) {
      return { success: false, error: 'Undo/redo is disabled' };
    }

    if (this.undoStack.length === 0) {
      return { success: false, error: 'Nothing to undo' };
    }

    try {
      this.state = HistoryManagerStates.PROCESSING;

      const entry = this.undoStack.pop();
      
      // Decompress entry if needed
      if (entry.compressed) {
        entry.decompress();
      }

      // Move entry to redo stack
      this.redoStack.push(entry);

      // Execute undo operation
      const undoResult = await this.executeUndo(entry);
      
      if (!undoResult.success) {
        // Restore entry to undo stack if undo failed
        this.undoStack.push(entry);
        this.redoStack.pop();
        return undoResult;
      }

      this.notifyListeners('undo', { entry, result: undoResult });
      this.state = HistoryManagerStates.IDLE;

      return { success: true, entry };
    } catch (error) {
      this.state = HistoryManagerStates.IDLE;
      return { success: false, error: error.message };
    }
  }

  /**
   * Redo the last undone operation
   * @returns {Object} Result with operation status
   */
  async redo() {
    if (!this.config.enableUndoRedo) {
      return { success: false, error: 'Undo/redo is disabled' };
    }

    if (this.redoStack.length === 0) {
      return { success: false, error: 'Nothing to redo' };
    }

    try {
      this.state = HistoryManagerStates.PROCESSING;

      const entry = this.redoStack.pop();
      
      // Decompress entry if needed
      if (entry.compressed) {
        entry.decompress();
      }

      // Execute redo operation
      const redoResult = await this.executeRedo(entry);
      
      if (!redoResult.success) {
        // Restore entry to redo stack if redo failed
        this.redoStack.push(entry);
        return redoResult;
      }

      // Move entry back to undo stack
      this.undoStack.push(entry);

      this.notifyListeners('redo', { entry, result: redoResult });
      this.state = HistoryManagerStates.IDLE;

      return { success: true, entry };
    } catch (error) {
      this.state = HistoryManagerStates.IDLE;
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute undo operation
   * @param {HistoryEntry} entry - Entry to undo
   * @returns {Object} Operation result
   */
  async executeUndo(entry) {
    try {
      // This would integrate with the actual editing operations
      // For now, return success
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute redo operation
   * @param {HistoryEntry} entry - Entry to redo
   * @returns {Object} Operation result
   */
  async executeRedo(entry) {
    try {
      // This would integrate with the actual editing operations
      // For now, return success
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all history
   * @returns {Object} Result with operation status
   */
  async clear() {
    try {
      this.state = HistoryManagerStates.PROCESSING;

      const undoCount = this.undoStack.length;
      const redoCount = this.redoStack.length;

      this.undoStack = [];
      this.redoStack = [];

      if (this.config.autoSave) {
        await this.saveToStorage();
      }

      this.notifyListeners('historyCleared', { undoCount, redoCount });
      this.state = HistoryManagerStates.IDLE;

      return { success: true, undoCount, redoCount };
    } catch (error) {
      this.state = HistoryManagerStates.IDLE;
      return { success: false, error: error.message };
    }
  }

  /**
   * Get history statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      totalEntries: this.undoStack.length + this.redoStack.length,
      memoryUsage: this.estimateMemoryUsage(),
      state: this.state,
      currentBranch: this.currentBranch,
      branchCount: this.branches.size
    };
  }

  /**
   * Estimate memory usage
   * @returns {number} Memory usage in bytes
   */
  estimateMemoryUsage() {
    let totalSize = 0;

    this.undoStack.forEach(entry => {
      totalSize += entry.getSize();
    });

    this.redoStack.forEach(entry => {
      totalSize += entry.getSize();
    });

    return totalSize;
  }

  /**
   * Compress history to save memory
   * @returns {Object} Compression result
   */
  async compressHistory() {
    if (!this.config.compression) {
      return { success: false, error: 'Compression is disabled' };
    }

    try {
      this.state = HistoryManagerStates.COMPRESSING;

      let compressedCount = 0;
      const totalEntries = this.undoStack.length + this.redoStack.length;

      // Compress old entries
      for (let i = 0; i < this.undoStack.length - 10; i++) {
        if (this.undoStack[i].compress()) {
          compressedCount++;
        }
      }

      for (let i = 0; i < this.redoStack.length - 10; i++) {
        if (this.redoStack[i].compress()) {
          compressedCount++;
        }
      }

      this.notifyListeners('historyCompressed', { compressedCount, totalEntries });
      this.state = HistoryManagerStates.IDLE;

      return { success: true, compressedCount, totalEntries };
    } catch (error) {
      this.state = HistoryManagerStates.IDLE;
      return { success: false, error: error.message };
    }
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
   * @param {Function} callback - Callback function to remove
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify event listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Save history to storage
   * @returns {Object} Save result
   */
  async saveToStorage() {
    if (!this.storage) {
      return { success: false, error: 'Storage not available' };
    }

    try {
      const data = {
        undoStack: this.undoStack.map(entry => entry.toJSON()),
        redoStack: this.redoStack.map(entry => entry.toJSON()),
        currentBranch: this.currentBranch,
        config: this.config
      };

      this.storage.save(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Load history from storage
   * @returns {Object} Load result
   */
  async loadFromStorage() {
    if (!this.storage) {
      return { success: false, error: 'Storage not available' };
    }

    try {
      const data = this.storage.load();
      if (!data) {
        return { success: false, error: 'No saved history found' };
      }

      this.undoStack = data.undoStack.map(json => HistoryEntry.fromJSON(json)).filter(Boolean);
      this.redoStack = data.redoStack.map(json => HistoryEntry.fromJSON(json)).filter(Boolean);
      this.currentBranch = data.currentBranch || 'main';

      return { success: true, loadedEntries: this.undoStack.length + this.redoStack.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
} 