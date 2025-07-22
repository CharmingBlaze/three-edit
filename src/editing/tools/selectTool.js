/**
 * @fileoverview Select Tool
 * Modular select tool for object and element selection
 */

import { EditToolStates } from '../types/operationTypes.js';

/**
 * Select tool for object and element selection
 */
export class SelectTool {
  /**
   * Create a select tool
   * @param {Object} options - Tool options
   * @param {string} options.mode - Selection mode: 'object', 'vertex', 'edge', 'face'
   * @param {boolean} options.multiSelect - Enable multi-select
   * @param {Object} options.bounds - Selection bounds
   * @param {number} options.threshold - Selection threshold
   */
  constructor(options = {}) {
    const {
      mode = 'object',
      multiSelect = true,
      bounds = null,
      threshold = 0.1
    } = options;

    this.type = 'select';
    this.mode = mode;
    this.multiSelect = multiSelect;
    this.bounds = bounds;
    this.threshold = threshold;
    this.state = EditToolStates.INACTIVE;
    this.selectedObjects = new Set();
    this.hoveredObject = null;
  }

  /**
   * Activate the tool
   * @returns {boolean} Success status
   */
  activate() {
    this.state = EditToolStates.ACTIVE;
    return true;
  }

  /**
   * Deactivate the tool
   * @returns {boolean} Success status
   */
  deactivate() {
    this.state = EditToolStates.INACTIVE;
    this.selectedObjects.clear();
    this.hoveredObject = null;
    return true;
  }

  /**
   * Select an object
   * @param {Object} object - Object to select
   * @param {Object} options - Selection options
   * @returns {boolean} Success status
   */
  select(object, options = {}) {
    const { additive = this.multiSelect } = options;

    if (!additive) {
      this.selectedObjects.clear();
    }

    this.selectedObjects.add(object);
    return true;
  }

  /**
   * Deselect an object
   * @param {Object} object - Object to deselect
   * @returns {boolean} Success status
   */
  deselect(object) {
    this.selectedObjects.delete(object);
    return true;
  }

  /**
   * Clear all selections
   * @returns {boolean} Success status
   */
  clearSelection() {
    this.selectedObjects.clear();
    return true;
  }

  /**
   * Get selected objects
   * @returns {Array} Selected objects
   */
  getSelectedObjects() {
    return Array.from(this.selectedObjects);
  }

  /**
   * Get selection count
   * @returns {number} Number of selected objects
   */
  getSelectionCount() {
    return this.selectedObjects.size;
  }

  /**
   * Set hovered object
   * @param {Object} object - Hovered object
   */
  setHoveredObject(object) {
    this.hoveredObject = object;
    this.state = object ? EditToolStates.HOVER : EditToolStates.ACTIVE;
  }

  /**
   * Get hovered object
   * @returns {Object|null} Hovered object
   */
  getHoveredObject() {
    return this.hoveredObject;
  }

  /**
   * Check if object is selected
   * @param {Object} object - Object to check
   * @returns {boolean} Selection status
   */
  isSelected(object) {
    return this.selectedObjects.has(object);
  }

  /**
   * Get tool state
   * @returns {Object} Tool state
   */
  getState() {
    return {
      type: this.type,
      mode: this.mode,
      state: this.state,
      selectedCount: this.selectedObjects.size,
      hoveredObject: this.hoveredObject,
      multiSelect: this.multiSelect
    };
  }
} 