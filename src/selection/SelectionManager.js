/**
 * @fileoverview Selection Manager
 * Manages selection of objects, vertices, edges, faces, and meshes
 */

import { EditableMesh } from '../EditableMesh.js';

/**
 * Selection item representing a selected element
 */
export class SelectionItem {
  /**
   * Create a selection item
   * @param {string} type - Selection type ('object', 'mesh', 'vertex', 'edge', 'face')
   * @param {string} id - Element ID
   * @param {Object} data - Additional selection data
   * @param {Object} options - Selection options
   * @param {boolean} options.highlighted - Whether item is highlighted
   * @param {Object} options.transform - Transform data
   * @param {Object} options.metadata - Additional metadata
   */
  constructor(type, id, data = {}, options = {}) {
    const {
      highlighted = false,
      transform = null,
      metadata = {}
    } = options;

    this.type = type;
    this.id = id;
    this.data = { ...data };
    this.highlighted = highlighted;
    this.transform = transform ? { ...transform } : null;
    this.metadata = { ...metadata };
    this.selectedAt = Date.now();
  }

  /**
   * Clone the selection item
   * @returns {SelectionItem} Cloned selection item
   */
  clone() {
    return new SelectionItem(this.type, this.id, this.data, {
      highlighted: this.highlighted,
      transform: this.transform,
      metadata: { ...this.metadata }
    });
  }

  /**
   * Get selection summary
   * @returns {Object} Selection summary
   */
  getSummary() {
    return {
      type: this.type,
      id: this.id,
      highlighted: this.highlighted,
      selectedAt: this.selectedAt,
      dataKeys: Object.keys(this.data)
    };
  }
}

/**
 * Selection Manager for managing multiple types of selections
 */
export class SelectionManager {
  /**
   * Create a selection manager
   * @param {Object} options - Configuration options
   * @param {boolean} options.multiSelect - Enable multi-selection
   * @param {boolean} options.autoHighlight - Auto-highlight selected items
   * @param {number} options.maxSelections - Maximum number of selections
   */
  constructor(options = {}) {
    const {
      multiSelect = true,
      autoHighlight = true,
      maxSelections = 1000
    } = options;

    this.multiSelect = multiSelect;
    this.autoHighlight = autoHighlight;
    this.maxSelections = maxSelections;

    this.selections = new Map();
    this.selectionMode = 'object'; // 'object', 'vertex', 'edge', 'face', 'mesh'
    this.listeners = new Set();
    this.history = [];
    this.maxHistorySize = 50;
  }

  /**
   * Set selection mode
   * @param {string} mode - Selection mode
   * @returns {boolean} Success status
   */
  setSelectionMode(mode) {
    const validModes = ['object', 'vertex', 'edge', 'face', 'mesh'];
    if (!validModes.includes(mode)) {
      console.error(`Invalid selection mode: ${mode}`);
      return false;
    }

    const previousMode = this.selectionMode;
    this.selectionMode = mode;

    if (previousMode !== mode) {
      this.notifyListeners('selectionModeChanged', { 
        previousMode, 
        currentMode: mode 
      });
    }

    return true;
  }

  /**
   * Get current selection mode
   * @returns {string} Current selection mode
   */
  getSelectionMode() {
    return this.selectionMode;
  }

  /**
   * Add item to selection
   * @param {string} type - Selection type
   * @param {string} id - Element ID
   * @param {Object} data - Additional data
   * @param {Object} options - Selection options
   * @returns {SelectionItem|null} Created selection item or null
   */
  addSelection(type, id, data = {}, options = {}) {
    // Check if already selected
    if (this.isSelected(type, id)) {
      return this.getSelection(type, id);
    }

    // Check selection limits
    if (!this.multiSelect && this.selections.size > 0) {
      this.clearSelection();
    }

    if (this.selections.size >= this.maxSelections) {
      console.warn('Maximum selections reached');
      return null;
    }

    const selectionItem = new SelectionItem(type, id, data, {
      highlighted: this.autoHighlight,
      ...options
    });

    const key = `${type}:${id}`;
    this.selections.set(key, selectionItem);

    this.addToHistory('add', selectionItem);
    this.notifyListeners('selectionAdded', { item: selectionItem });

    return selectionItem;
  }

  /**
   * Remove item from selection
   * @param {string} type - Selection type
   * @param {string} id - Element ID
   * @returns {boolean} Success status
   */
  removeSelection(type, id) {
    const key = `${type}:${id}`;
    const item = this.selections.get(key);

    if (item) {
      this.selections.delete(key);
      this.addToHistory('remove', item);
      this.notifyListeners('selectionRemoved', { item });
      return true;
    }

    return false;
  }

  /**
   * Check if item is selected
   * @param {string} type - Selection type
   * @param {string} id - Element ID
   * @returns {boolean} True if selected
   */
  isSelected(type, id) {
    const key = `${type}:${id}`;
    return this.selections.has(key);
  }

  /**
   * Get selection item
   * @param {string} type - Selection type
   * @param {string} id - Element ID
   * @returns {SelectionItem|null} Selection item or null
   */
  getSelection(type, id) {
    const key = `${type}:${id}`;
    return this.selections.get(key) || null;
  }

  /**
   * Get all selections
   * @returns {SelectionItem[]} All selection items
   */
  getAllSelections() {
    return Array.from(this.selections.values());
  }

  /**
   * Get selections by type
   * @param {string} type - Selection type
   * @returns {SelectionItem[]} Selections of specified type
   */
  getSelectionsByType(type) {
    return this.getAllSelections().filter(item => item.type === type);
  }

  /**
   * Get selected IDs by type
   * @param {string} type - Selection type
   * @returns {string[]} Selected IDs
   */
  getSelectedIds(type) {
    return this.getSelectionsByType(type).map(item => item.id);
  }

  /**
   * Clear all selections
   */
  clearSelection() {
    const items = this.getAllSelections();
    this.selections.clear();
    
    items.forEach(item => {
      this.notifyListeners('selectionRemoved', { item });
    });

    this.notifyListeners('selectionCleared', { count: items.length });
  }

  /**
   * Clear selections by type
   * @param {string} type - Selection type
   */
  clearSelectionsByType(type) {
    const itemsToRemove = this.getSelectionsByType(type);
    
    itemsToRemove.forEach(item => {
      const key = `${item.type}:${item.id}`;
      this.selections.delete(key);
      this.notifyListeners('selectionRemoved', { item });
    });

    this.notifyListeners('selectionsClearedByType', { type, count: itemsToRemove.length });
  }

  /**
   * Toggle selection
   * @param {string} type - Selection type
   * @param {string} id - Element ID
   * @param {Object} data - Additional data
   * @param {Object} options - Selection options
   * @returns {boolean} True if added, false if removed
   */
  toggleSelection(type, id, data = {}, options = {}) {
    if (this.isSelected(type, id)) {
      this.removeSelection(type, id);
      return false;
    } else {
      this.addSelection(type, id, data, options);
      return true;
    }
  }

  /**
   * Select multiple items
   * @param {Array} items - Array of selection items
   * @param {Object} options - Selection options
   * @returns {SelectionItem[]} Created selection items
   */
  selectMultiple(items, options = {}) {
    const createdItems = [];

    items.forEach(item => {
      const selectionItem = this.addSelection(
        item.type,
        item.id,
        item.data || {},
        { ...options, ...item.options }
      );
      if (selectionItem) {
        createdItems.push(selectionItem);
      }
    });

    if (createdItems.length > 0) {
      this.notifyListeners('multipleSelectionsAdded', { items: createdItems });
    }

    return createdItems;
  }

  /**
   * Select by rectangle (box selection)
   * @param {Object} bounds - Selection bounds
   * @param {Object} options - Selection options
   * @returns {SelectionItem[]} Selected items
   */
  selectByRectangle(bounds, options = {}) {
    const { type = this.selectionMode } = options;
    const selectedItems = [];

    // This would typically involve raycasting or spatial queries
    // For now, we'll return an empty array as this requires scene context
    this.notifyListeners('rectangleSelection', { bounds, type, selectedItems });

    return selectedItems;
  }

  /**
   * Select by lasso (freeform selection)
   * @param {Array} points - Lasso points
   * @param {Object} options - Selection options
   * @returns {SelectionItem[]} Selected items
   */
  selectByLasso(points, options = {}) {
    const { type = this.selectionMode } = options;
    const selectedItems = [];

    // This would involve point-in-polygon testing
    // For now, we'll return an empty array as this requires scene context
    this.notifyListeners('lassoSelection', { points, type, selectedItems });

    return selectedItems;
  }

  /**
   * Select all items of a type
   * @param {string} type - Selection type
   * @param {Array} allIds - All available IDs
   * @param {Object} options - Selection options
   * @returns {SelectionItem[]} Selected items
   */
  selectAll(type, allIds, options = {}) {
    const selectedItems = [];

    allIds.forEach(id => {
      const selectionItem = this.addSelection(type, id, {}, options);
      if (selectionItem) {
        selectedItems.push(selectionItem);
      }
    });

    this.notifyListeners('allSelected', { type, count: selectedItems.length });

    return selectedItems;
  }

  /**
   * Invert selection
   * @param {string} type - Selection type
   * @param {Array} allIds - All available IDs
   * @returns {SelectionItem[]} Newly selected items
   */
  invertSelection(type, allIds) {
    const currentSelectedIds = this.getSelectedIds(type);
    const newlySelectedItems = [];

    allIds.forEach(id => {
      if (!currentSelectedIds.includes(id)) {
        const selectionItem = this.addSelection(type, id);
        if (selectionItem) {
          newlySelectedItems.push(selectionItem);
        }
      }
    });

    this.notifyListeners('selectionInverted', { type, count: newlySelectedItems.length });

    return newlySelectedItems;
  }

  /**
   * Highlight selection item
   * @param {string} type - Selection type
   * @param {string} id - Element ID
   * @param {boolean} highlighted - Highlight state
   * @returns {boolean} Success status
   */
  highlightSelection(type, id, highlighted = true) {
    const item = this.getSelection(type, id);
    if (item) {
      item.highlighted = highlighted;
      this.notifyListeners('selectionHighlighted', { item, highlighted });
      return true;
    }
    return false;
  }

  /**
   * Get selection statistics
   * @returns {Object} Selection statistics
   */
  getStatistics() {
    const stats = {
      totalSelections: this.selections.size,
      mode: this.selectionMode,
      multiSelect: this.multiSelect
    };

    const types = ['object', 'vertex', 'edge', 'face', 'mesh'];
    types.forEach(type => {
      stats[`${type}Count`] = this.getSelectionsByType(type).length;
    });

    return stats;
  }

  /**
   * Add to history
   * @param {string} action - History action
   * @param {SelectionItem} item - Selection item
   */
  addToHistory(action, item) {
    this.history.push({
      action,
      item: item.clone(),
      timestamp: Date.now()
    });

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get selection history
   * @returns {Array} Selection history
   */
  getHistory() {
    return [...this.history];
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
          console.error('Selection listener error:', error);
        }
      }
    }
  }
} 