/**
 * @fileoverview History Utilities
 * Utility functions for history management and integration
 */

import { HistoryEntry } from './HistoryEntry.js';
import { HistoryEntryTypes, HistoryEntryPriorities } from './HistoryTypes.js';

/**
 * Create a history entry for geometry operations
 * @param {Object} config - Entry configuration
 * @param {string} config.operation - Operation name
 * @param {Object} config.parameters - Operation parameters
 * @param {Object} config.beforeData - Data before operation
 * @param {Object} config.afterData - Data after operation
 * @param {Function} config.undoFunction - Undo function
 * @param {Function} config.redoFunction - Redo function
 * @returns {HistoryEntry} History entry
 */
export function createGeometryHistoryEntry(config) {
  return new HistoryEntry({
    type: HistoryEntryTypes.GEOMETRY_OPERATION,
    operation: config.operation,
    description: `Geometry operation: ${config.operation}`,
    parameters: config.parameters,
    undoFunction: config.undoFunction,
    redoFunction: config.redoFunction,
    data: {
      before: config.beforeData,
      after: config.afterData,
      operation: config.operation
    },
    priority: HistoryEntryPriorities.HIGH,
    userId: config.userId || 'default'
  });
}

/**
 * Create a history entry for vertex operations
 * @param {Object} config - Entry configuration
 * @param {string} config.operation - Operation name
 * @param {Object} config.parameters - Operation parameters
 * @param {Object} config.beforeData - Data before operation
 * @param {Object} config.afterData - Data after operation
 * @param {Function} config.undoFunction - Undo function
 * @param {Function} config.redoFunction - Redo function
 * @returns {HistoryEntry} History entry
 */
export function createVertexHistoryEntry(config) {
  return new HistoryEntry({
    type: HistoryEntryTypes.VERTEX_OPERATION,
    operation: config.operation,
    description: `Vertex operation: ${config.operation}`,
    parameters: config.parameters,
    undoFunction: config.undoFunction,
    redoFunction: config.redoFunction,
    data: {
      before: config.beforeData,
      after: config.afterData,
      operation: config.operation
    },
    priority: HistoryEntryPriorities.NORMAL,
    userId: config.userId || 'default'
  });
}

/**
 * Create a history entry for edge operations
 * @param {Object} config - Entry configuration
 * @param {string} config.operation - Operation name
 * @param {Object} config.parameters - Operation parameters
 * @param {Object} config.beforeData - Data before operation
 * @param {Object} config.afterData - Data after operation
 * @param {Function} config.undoFunction - Undo function
 * @param {Function} config.redoFunction - Redo function
 * @returns {HistoryEntry} History entry
 */
export function createEdgeHistoryEntry(config) {
  return new HistoryEntry({
    type: HistoryEntryTypes.EDGE_OPERATION,
    operation: config.operation,
    description: `Edge operation: ${config.operation}`,
    parameters: config.parameters,
    undoFunction: config.undoFunction,
    redoFunction: config.redoFunction,
    data: {
      before: config.beforeData,
      after: config.afterData,
      operation: config.operation
    },
    priority: HistoryEntryPriorities.NORMAL,
    userId: config.userId || 'default'
  });
}

/**
 * Create a history entry for face operations
 * @param {Object} config - Entry configuration
 * @param {string} config.operation - Operation name
 * @param {Object} config.parameters - Operation parameters
 * @param {Object} config.beforeData - Data before operation
 * @param {Object} config.afterData - Data after operation
 * @param {Function} config.undoFunction - Undo function
 * @param {Function} config.redoFunction - Redo function
 * @returns {HistoryEntry} History entry
 */
export function createFaceHistoryEntry(config) {
  return new HistoryEntry({
    type: HistoryEntryTypes.FACE_OPERATION,
    operation: config.operation,
    description: `Face operation: ${config.operation}`,
    parameters: config.parameters,
    undoFunction: config.undoFunction,
    redoFunction: config.redoFunction,
    data: {
      before: config.beforeData,
      after: config.afterData,
      operation: config.operation
    },
    priority: HistoryEntryPriorities.NORMAL,
    userId: config.userId || 'default'
  });
}

/**
 * Create a history entry for UV operations
 * @param {Object} config - Entry configuration
 * @param {string} config.operation - Operation name
 * @param {Object} config.parameters - Operation parameters
 * @param {Object} config.beforeData - Data before operation
 * @param {Object} config.afterData - Data after operation
 * @param {Function} config.undoFunction - Undo function
 * @param {Function} config.redoFunction - Redo function
 * @returns {HistoryEntry} History entry
 */
export function createUVHistoryEntry(config) {
  return new HistoryEntry({
    type: HistoryEntryTypes.UV_OPERATION,
    operation: config.operation,
    description: `UV operation: ${config.operation}`,
    parameters: config.parameters,
    undoFunction: config.undoFunction,
    redoFunction: config.redoFunction,
    data: {
      before: config.beforeData,
      after: config.afterData,
      operation: config.operation
    },
    priority: HistoryEntryPriorities.NORMAL,
    userId: config.userId || 'default'
  });
}

/**
 * Create undo function for geometry operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} restoreFunction - Function to restore previous state
 * @returns {Function} Undo function
 */
export function createGeometryUndoFunction(beforeData, afterData, restoreFunction) {
  return async () => {
    try {
      const result = await restoreFunction(beforeData);
      return {
        success: result.success,
        message: 'Geometry operation undone',
        data: result.data || {}
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to undo geometry operation: ${error.message}`,
        error
      };
    }
  };
}

/**
 * Create redo function for geometry operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} applyFunction - Function to apply operation
 * @returns {Function} Redo function
 */
export function createGeometryRedoFunction(beforeData, afterData, applyFunction) {
  return async () => {
    try {
      const result = await applyFunction(afterData);
      return {
        success: result.success,
        message: 'Geometry operation redone',
        data: result.data || {}
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to redo geometry operation: ${error.message}`,
        error
      };
    }
  };
}

/**
 * Create undo function for vertex operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} restoreFunction - Function to restore previous state
 * @returns {Function} Undo function
 */
export function createVertexUndoFunction(beforeData, afterData, restoreFunction) {
  return async () => {
    try {
      const result = await restoreFunction(beforeData);
      return {
        success: result.success,
        message: 'Vertex operation undone',
        data: result.data || {}
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to undo vertex operation: ${error.message}`,
        error
      };
    }
  };
}

/**
 * Create redo function for vertex operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} applyFunction - Function to apply operation
 * @returns {Function} Redo function
 */
export function createVertexRedoFunction(beforeData, afterData, applyFunction) {
  return async () => {
    try {
      const result = await applyFunction(afterData);
      return {
        success: result.success,
        message: 'Vertex operation redone',
        data: result.data || {}
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to redo vertex operation: ${error.message}`,
        error
      };
    }
  };
}

/**
 * Create undo function for edge operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} restoreFunction - Function to restore previous state
 * @returns {Function} Undo function
 */
export function createEdgeUndoFunction(beforeData, afterData, restoreFunction) {
  return async () => {
    try {
      const result = await restoreFunction(beforeData);
      return {
        success: result.success,
        message: 'Edge operation undone',
        data: result.data || {}
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to undo edge operation: ${error.message}`,
        error
      };
    }
  };
}

/**
 * Create redo function for edge operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} applyFunction - Function to apply operation
 * @returns {Function} Redo function
 */
export function createEdgeRedoFunction(beforeData, afterData, applyFunction) {
  return async () => {
    try {
      const result = await applyFunction(afterData);
      return {
        success: result.success,
        message: 'Edge operation redone',
        data: result.data || {}
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to redo edge operation: ${error.message}`,
        error
      };
    }
  };
}

/**
 * Create undo function for face operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} restoreFunction - Function to restore previous state
 * @returns {Function} Undo function
 */
export function createFaceUndoFunction(beforeData, afterData, restoreFunction) {
  return async () => {
    try {
      const result = await restoreFunction(beforeData);
      return {
        success: result.success,
        message: 'Face operation undone',
        data: result.data || {}
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to undo face operation: ${error.message}`,
        error
      };
    }
  };
}

/**
 * Create redo function for face operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} applyFunction - Function to apply operation
 * @returns {Function} Redo function
 */
export function createFaceRedoFunction(beforeData, afterData, applyFunction) {
  return async () => {
    try {
      const result = await applyFunction(afterData);
      return {
        success: result.success,
        message: 'Face operation redone',
        data: result.data || {}
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to redo face operation: ${error.message}`,
        error
      };
    }
  };
}

/**
 * Create undo function for UV operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} restoreFunction - Function to restore previous state
 * @returns {Function} Undo function
 */
export function createUVUndoFunction(beforeData, afterData, restoreFunction) {
  return async () => {
    try {
      const result = await restoreFunction(beforeData);
      return {
        success: result.success,
        message: 'UV operation undone',
        data: result.data || {}
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to undo UV operation: ${error.message}`,
        error
      };
    }
  };
}

/**
 * Create redo function for UV operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} applyFunction - Function to apply operation
 * @returns {Function} Redo function
 */
export function createUVRedoFunction(beforeData, afterData, applyFunction) {
  return async () => {
    try {
      const result = await applyFunction(afterData);
      return {
        success: result.success,
        message: 'UV operation redone',
        data: result.data || {}
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to redo UV operation: ${error.message}`,
        error
      };
    }
  };
}

/**
 * Compress history data for storage
 * @param {Array} entries - History entries
 * @returns {Object} Compressed data
 */
export function compressHistoryData(entries) {
  const compressed = {
    entries: entries.map(entry => entry.serialize()),
    metadata: {
      compressedAt: Date.now(),
      originalSize: JSON.stringify(entries).length,
      compressedSize: 0
    }
  };
  
  compressed.metadata.compressedSize = JSON.stringify(compressed).length;
  return compressed;
}

/**
 * Decompress history data from storage
 * @param {Object} compressedData - Compressed data
 * @param {Function} undoFunction - Undo function factory
 * @param {Function} redoFunction - Redo function factory
 * @returns {Array} Decompressed entries
 */
export function decompressHistoryData(compressedData, undoFunction, redoFunction) {
  return compressedData.entries.map(entryData => 
    HistoryEntry.deserialize(entryData, undoFunction, redoFunction)
  );
}

/**
 * Validate history data integrity
 * @param {Array} entries - History entries
 * @returns {Object} Validation result
 */
export function validateHistoryData(entries) {
  const errors = [];
  const warnings = [];
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    
    // Check for missing required fields
    if (!entry.id) {
      errors.push(`Entry ${i} missing ID`);
    }
    
    if (!entry.type) {
      errors.push(`Entry ${i} missing type`);
    }
    
    if (!entry.metadata) {
      errors.push(`Entry ${i} missing metadata`);
    }
    
    // Check for invalid timestamps
    if (entry.timestamp && entry.timestamp > Date.now()) {
      warnings.push(`Entry ${i} has future timestamp`);
    }
    
    // Check for duplicate IDs
    const duplicateIds = entries.filter(e => e.id === entry.id);
    if (duplicateIds.length > 1) {
      errors.push(`Duplicate entry ID: ${entry.id}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    totalEntries: entries.length
  };
} 