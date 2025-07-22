/**
 * @fileoverview Edit State Management
 * Manages edit state, modes, and selection
 */

import { EditModes } from '../types/operationTypes.js';

/**
 * Edit state manager for tracking current editing state
 */
export class EditStateManager {
  /**
   * Create an edit state manager
   * @param {Object} options - Configuration options
   * @param {string} options.defaultMode - Default edit mode
   * @param {boolean} options.autoSave - Auto-save edits
   */
  constructor(options = {}) {
    const { defaultMode = EditModes.OBJECT, autoSave = true } = options;
    
    this.defaultMode = defaultMode;
    this.autoSave = autoSave;
    this.currentMode = defaultMode;
    this.isEditing = false;
    this.selectedObjects = new Set();
    this.currentEdit = null;
  }

  /**
   * Start editing session
   * @param {string} mode - Edit mode
   * @param {Object} options - Edit options
   * @returns {boolean} Success status
   */
  startEdit(mode = this.defaultMode, options = {}) {
    if (this.isEditing) {
      console.warn('Already in edit mode');
      return false;
    }

    if (!this.validateEditMode(mode)) {
      console.error('Invalid edit mode:', mode);
      return false;
    }

    this.currentMode = mode;
    this.isEditing = true;
    this.currentEdit = {
      mode,
      options,
      startTime: Date.now(),
      operations: []
    };

    return true;
  }

  /**
   * End editing session
   * @param {boolean} commit - Whether to commit the edit
   * @returns {Object|null} Edit result or null
   */
  endEdit(commit = true) {
    if (!this.isEditing) {
      console.warn('Not in edit mode');
      return null;
    }

    const edit = this.currentEdit;
    this.isEditing = false;
    this.currentEdit = null;

    if (commit && edit) {
      edit.endTime = Date.now();
      edit.duration = edit.endTime - edit.startTime;
      return edit;
    }

    return null;
  }

  /**
   * Set edit mode
   * @param {string} mode - New edit mode
   * @returns {boolean} Success status
   */
  setEditMode(mode) {
    if (!this.validateEditMode(mode)) {
      console.error('Invalid edit mode:', mode);
      return false;
    }

    this.currentMode = mode;
    return true;
  }

  /**
   * Get current edit mode
   * @returns {string} Current edit mode
   */
  getEditMode() {
    return this.currentMode;
  }

  /**
   * Check if currently editing
   * @returns {boolean} Editing status
   */
  isCurrentlyEditing() {
    return this.isEditing;
  }

  /**
   * Select objects
   * @param {Array} objects - Objects to select
   * @param {Object} options - Selection options
   */
  selectObjects(objects, options = {}) {
    const { additive = false } = options;
    
    if (!additive) {
      this.selectedObjects.clear();
    }
    
    objects.forEach(obj => this.selectedObjects.add(obj));
  }

  /**
   * Deselect objects
   * @param {Array} objects - Objects to deselect
   */
  deselectObjects(objects) {
    objects.forEach(obj => this.selectedObjects.delete(obj));
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selectedObjects.clear();
  }

  /**
   * Get selected objects
   * @returns {Set} Selected objects
   */
  getSelectedObjects() {
    return new Set(this.selectedObjects);
  }

  /**
   * Get selection count
   * @returns {number} Number of selected objects
   */
  getSelectionCount() {
    return this.selectedObjects.size;
  }

  /**
   * Validate edit mode
   * @param {string} mode - Mode to validate
   * @returns {boolean} Validity
   */
  validateEditMode(mode) {
    return Object.values(EditModes).includes(mode);
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return {
      currentMode: this.currentMode,
      isEditing: this.isEditing,
      selectedCount: this.selectedObjects.size,
      currentEdit: this.currentEdit
    };
  }
} 