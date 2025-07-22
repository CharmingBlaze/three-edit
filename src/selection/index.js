/**
 * @fileoverview Selection System
 * Comprehensive selection management for the 3D editor
 */

import { SelectionManager } from './SelectionManager.js';
import { SelectionItem } from './SelectionItem.js';

// Object selection utilities
export { ObjectSelector } from './ObjectSelector.js';

// Mesh selection utilities
export { MeshSelector } from './MeshSelector.js';

// Selection visualization
export { SelectionVisualizer } from './SelectionVisualizer.js';

/**
 * Create a selection manager with default settings
 * @param {Object} options - Configuration options
 * @returns {SelectionManager} Selection manager instance
 */
export function createSelectionManager(options = {}) {
  return new SelectionManager(options);
}

/**
 * Selection types
 */
export const SelectionTypes = {
  OBJECT: 'object',
  MESH: 'mesh',
  VERTEX: 'vertex',
  EDGE: 'edge',
  FACE: 'face'
};

/**
 * Selection modes
 */
export const SelectionModes = {
  OBJECT: 'object',
  VERTEX: 'vertex',
  EDGE: 'edge',
  FACE: 'face',
  MESH: 'mesh'
};

/**
 * Selection visualization types
 */
export const VisualizationTypes = {
  HIGHLIGHT: 'highlight',
  OUTLINE: 'outline',
  WIREFRAME: 'wireframe',
  BOUNDING_BOX: 'bounding_box',
  INDICATOR: 'indicator'
};

/**
 * Create a selection item
 * @param {string} type - Selection type
 * @param {string} id - Element ID
 * @param {Object} data - Additional data
 * @param {Object} options - Selection options
 * @returns {SelectionItem} Selection item
 */
export function createSelectionItem(type, id, data = {}, options = {}) {
  return new SelectionItem(type, id, data, options);
}

/**
 * Get selection type information
 * @param {string} type - Selection type
 * @returns {Object} Selection type information
 */
export function getSelectionTypeInfo(type) {
  const typeInfo = {
    [SelectionTypes.OBJECT]: {
      name: 'Object',
      description: 'Select entire objects',
      supports: ['transform', 'material', 'visibility'],
      icon: 'cube'
    },
    [SelectionTypes.MESH]: {
      name: 'Mesh',
      description: 'Select mesh geometry',
      supports: ['transform', 'material', 'geometry'],
      icon: 'mesh'
    },
    [SelectionTypes.VERTEX]: {
      name: 'Vertex',
      description: 'Select individual vertices',
      supports: ['move', 'merge', 'split'],
      icon: 'vertex'
    },
    [SelectionTypes.EDGE]: {
      name: 'Edge',
      description: 'Select mesh edges',
      supports: ['extrude', 'bevel', 'split'],
      icon: 'edge'
    },
    [SelectionTypes.FACE]: {
      name: 'Face',
      description: 'Select mesh faces',
      supports: ['extrude', 'bevel', 'material'],
      icon: 'face'
    }
  };

  return typeInfo[type] || typeInfo[SelectionTypes.OBJECT];
}

/**
 * Get all selection types
 * @returns {Object} All selection types with information
 */
export function getAllSelectionTypes() {
  return Object.values(SelectionTypes).reduce((acc, type) => {
    acc[type] = getSelectionTypeInfo(type);
    return acc;
  }, {});
}

/**
 * Validate selection type
 * @param {string} type - Selection type to validate
 * @returns {boolean} True if valid selection type
 */
export function isValidSelectionType(type) {
  return Object.values(SelectionTypes).includes(type);
}

/**
 * Get selection mode information
 * @param {string} mode - Selection mode
 * @returns {Object} Selection mode information
 */
export function getSelectionModeInfo(mode) {
  const modeInfo = {
    [SelectionModes.OBJECT]: {
      name: 'Object Selection',
      description: 'Select entire objects',
      shortcut: '1',
      icon: 'cube'
    },
    [SelectionModes.VERTEX]: {
      name: 'Vertex Selection',
      description: 'Select individual vertices',
      shortcut: '2',
      icon: 'vertex'
    },
    [SelectionModes.EDGE]: {
      name: 'Edge Selection',
      description: 'Select mesh edges',
      shortcut: '3',
      icon: 'edge'
    },
    [SelectionModes.FACE]: {
      name: 'Face Selection',
      description: 'Select mesh faces',
      shortcut: '4',
      icon: 'face'
    },
    [SelectionModes.MESH]: {
      name: 'Mesh Selection',
      description: 'Select mesh geometry',
      shortcut: '5',
      icon: 'mesh'
    }
  };

  return modeInfo[mode] || modeInfo[SelectionModes.OBJECT];
}

/**
 * Get all selection modes
 * @returns {Object} All selection modes with information
 */
export function getAllSelectionModes() {
  return Object.values(SelectionModes).reduce((acc, mode) => {
    acc[mode] = getSelectionModeInfo(mode);
    return acc;
  }, {});
}

/**
 * Create a typed selection manager
 * @param {string} type - Selection type
 * @param {Object} options - Manager options
 * @returns {Object} Typed selection manager
 */
export function createTypedSelectionManager(type, options = {}) {
  const manager = new SelectionManager(options);
  manager.setSelectionMode(type);
  
  return {
    manager,
    type,
    addSelection: (id, data, options) => manager.addSelection(type, id, data, options),
    removeSelection: (id) => manager.removeSelection(type, id),
    isSelected: (id) => manager.isSelected(type, id),
    getSelection: (id) => manager.getSelection(type, id),
    getAllSelections: () => manager.getSelectionsByType(type),
    clearSelections: () => manager.clearSelectionsByType(type),
    toggleSelection: (id, data, options) => manager.toggleSelection(type, id, data, options)
  };
}

/**
 * Selection utilities
 */
export class SelectionUtils {
  /**
   * Filter selections by type
   * @param {Array} selections - Array of selections
   * @param {string} type - Selection type
   * @returns {Array} Filtered selections
   */
  static filterByType(selections, type) {
    return selections.filter(selection => selection.type === type);
  }

  /**
   * Get unique IDs from selections
   * @param {Array} selections - Array of selections
   * @returns {Array} Unique IDs
   */
  static getUniqueIds(selections) {
    return [...new Set(selections.map(selection => selection.id))];
  }

  /**
   * Group selections by type
   * @param {Array} selections - Array of selections
   * @returns {Object} Selections grouped by type
   */
  static groupByType(selections) {
    return selections.reduce((groups, selection) => {
      if (!groups[selection.type]) {
        groups[selection.type] = [];
      }
      groups[selection.type].push(selection);
      return groups;
    }, {});
  }

  /**
   * Get selection statistics
   * @param {Array} selections - Array of selections
   * @returns {Object} Selection statistics
   */
  static getStatistics(selections) {
    const stats = {
      total: selections.length,
      byType: {}
    };

    Object.values(SelectionTypes).forEach(type => {
      stats.byType[type] = selections.filter(s => s.type === type).length;
    });

    return stats;
  }

  /**
   * Validate selection data
   * @param {Object} selection - Selection to validate
   * @returns {Object} Validation result
   */
  static validateSelection(selection) {
    const errors = [];

    if (!selection.type) {
      errors.push('Selection must have a type');
    }

    if (!selection.id) {
      errors.push('Selection must have an ID');
    }

    if (!isValidSelectionType(selection.type)) {
      errors.push(`Invalid selection type: ${selection.type}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 