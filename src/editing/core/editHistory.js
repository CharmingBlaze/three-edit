/**
 * @fileoverview Edit History Management
 * Manages edit history, undo/redo operations
 */

/**
 * Edit history manager for tracking and managing edit operations
 */
export class EditHistoryManager {
  /**
   * Create an edit history manager
   * @param {Object} options - Configuration options
   * @param {number} options.maxHistory - Maximum history size
   * @param {boolean} options.enableUndo - Enable undo functionality
   */
  constructor(options = {}) {
    const { maxHistory = 100, enableUndo = true } = options;
    
    this.maxHistory = maxHistory;
    this.enableUndo = enableUndo;
    this.editHistory = [];
    this.currentIndex = -1;
  }

  /**
   * Add edit to history
   * @param {Object} edit - Edit operation to add
   * @returns {boolean} Success status
   */
  addToHistory(edit) {
    if (!edit || typeof edit !== 'object') {
      console.error('Invalid edit object');
      return false;
    }

    // Remove any edits after current index (for redo)
    this.editHistory = this.editHistory.slice(0, this.currentIndex + 1);
    
    // Add new edit
    this.editHistory.push({
      ...edit,
      id: this.generateEditId(),
      timestamp: Date.now()
    });
    
    this.currentIndex++;

    // Trim history if it exceeds max size
    if (this.editHistory.length > this.maxHistory) {
      this.editHistory.shift();
      this.currentIndex--;
    }

    return true;
  }

  /**
   * Undo last operation
   * @returns {Object|null} Undone edit or null
   */
  undo() {
    if (!this.enableUndo || this.currentIndex < 0) {
      return null;
    }

    const edit = this.editHistory[this.currentIndex];
    this.currentIndex--;
    
    return edit;
  }

  /**
   * Redo last undone operation
   * @returns {Object|null} Redone edit or null
   */
  redo() {
    if (this.currentIndex >= this.editHistory.length - 1) {
      return null;
    }

    this.currentIndex++;
    return this.editHistory[this.currentIndex];
  }

  /**
   * Get edit history
   * @returns {Array} Edit history
   */
  getEditHistory() {
    return [...this.editHistory];
  }

  /**
   * Get current edit
   * @returns {Object|null} Current edit or null
   */
  getCurrentEdit() {
    if (this.currentIndex >= 0 && this.currentIndex < this.editHistory.length) {
      return this.editHistory[this.currentIndex];
    }
    return null;
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.editHistory = [];
    this.currentIndex = -1;
  }

  /**
   * Get history statistics
   * @returns {Object} History statistics
   */
  getHistoryStatistics() {
    return {
      totalEdits: this.editHistory.length,
      currentIndex: this.currentIndex,
      canUndo: this.currentIndex >= 0,
      canRedo: this.currentIndex < this.editHistory.length - 1,
      maxHistory: this.maxHistory
    };
  }

  /**
   * Generate unique edit ID
   * @returns {string} Unique edit ID
   */
  generateEditId() {
    return `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get edit by ID
   * @param {string} id - Edit ID
   * @returns {Object|null} Edit or null
   */
  getEditById(id) {
    return this.editHistory.find(edit => edit.id === id) || null;
  }

  /**
   * Get edits by type
   * @param {string} type - Edit type
   * @returns {Array} Edits of specified type
   */
  getEditsByType(type) {
    return this.editHistory.filter(edit => edit.type === type);
  }

  /**
   * Get recent edits
   * @param {number} count - Number of recent edits
   * @returns {Array} Recent edits
   */
  getRecentEdits(count = 10) {
    return this.editHistory.slice(-count);
  }
} 