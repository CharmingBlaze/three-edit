/**
 * @fileoverview History System Index
 * Centralized exports for all history functionality
 */

// Core history classes
export { HistoryEntry } from './core/HistoryEntry.js';
export { HistoryManager, HistoryManagerStates } from './core/HistoryManager.js';

// History utilities and types
export * from './HistoryTypes.js';
export * from './historyUtils.js';

/**
 * Create a history manager with default configuration
 * @param {Object} config - Configuration options
 * @returns {HistoryManager} History manager instance
 */
export function createHistoryManager(config = {}) {
  return new HistoryManager(config);
}

/**
 * Create a history entry for geometry operations
 * @param {Object} config - Entry configuration
 * @returns {HistoryEntry} History entry
 */
export function createGeometryHistoryEntry(config) {
  return historyUtils.createGeometryHistoryEntry(config);
}

/**
 * Create a history entry for vertex operations
 * @param {Object} config - Entry configuration
 * @returns {HistoryEntry} History entry
 */
export function createVertexHistoryEntry(config) {
  return historyUtils.createVertexHistoryEntry(config);
}

/**
 * Create a history entry for edge operations
 * @param {Object} config - Entry configuration
 * @returns {HistoryEntry} History entry
 */
export function createEdgeHistoryEntry(config) {
  return historyUtils.createEdgeHistoryEntry(config);
}

/**
 * Create a history entry for face operations
 * @param {Object} config - Entry configuration
 * @returns {HistoryEntry} History entry
 */
export function createFaceHistoryEntry(config) {
  return historyUtils.createFaceHistoryEntry(config);
}

/**
 * Create a history entry for UV operations
 * @param {Object} config - Entry configuration
 * @returns {HistoryEntry} History entry
 */
export function createUVHistoryEntry(config) {
  return historyUtils.createUVHistoryEntry(config);
}

/**
 * Create undo function for geometry operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} restoreFunction - Function to restore previous state
 * @returns {Function} Undo function
 */
export function createGeometryUndoFunction(beforeData, afterData, restoreFunction) {
  return historyUtils.createGeometryUndoFunction(beforeData, afterData, restoreFunction);
}

/**
 * Create redo function for geometry operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} applyFunction - Function to apply operation
 * @returns {Function} Redo function
 */
export function createGeometryRedoFunction(beforeData, afterData, applyFunction) {
  return historyUtils.createGeometryRedoFunction(beforeData, afterData, applyFunction);
}

/**
 * Create undo function for vertex operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} restoreFunction - Function to restore previous state
 * @returns {Function} Undo function
 */
export function createVertexUndoFunction(beforeData, afterData, restoreFunction) {
  return historyUtils.createVertexUndoFunction(beforeData, afterData, restoreFunction);
}

/**
 * Create redo function for vertex operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} applyFunction - Function to apply operation
 * @returns {Function} Redo function
 */
export function createVertexRedoFunction(beforeData, afterData, applyFunction) {
  return historyUtils.createVertexRedoFunction(beforeData, afterData, applyFunction);
}

/**
 * Create undo function for edge operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} restoreFunction - Function to restore previous state
 * @returns {Function} Undo function
 */
export function createEdgeUndoFunction(beforeData, afterData, restoreFunction) {
  return historyUtils.createEdgeUndoFunction(beforeData, afterData, restoreFunction);
}

/**
 * Create redo function for edge operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} applyFunction - Function to apply operation
 * @returns {Function} Redo function
 */
export function createEdgeRedoFunction(beforeData, afterData, applyFunction) {
  return historyUtils.createEdgeRedoFunction(beforeData, afterData, applyFunction);
}

/**
 * Create undo function for face operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} restoreFunction - Function to restore previous state
 * @returns {Function} Undo function
 */
export function createFaceUndoFunction(beforeData, afterData, restoreFunction) {
  return historyUtils.createFaceUndoFunction(beforeData, afterData, restoreFunction);
}

/**
 * Create redo function for face operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} applyFunction - Function to apply operation
 * @returns {Function} Redo function
 */
export function createFaceRedoFunction(beforeData, afterData, applyFunction) {
  return historyUtils.createFaceRedoFunction(beforeData, afterData, applyFunction);
}

/**
 * Create undo function for UV operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} restoreFunction - Function to restore previous state
 * @returns {Function} Undo function
 */
export function createUVUndoFunction(beforeData, afterData, restoreFunction) {
  return historyUtils.createUVUndoFunction(beforeData, afterData, restoreFunction);
}

/**
 * Create redo function for UV operations
 * @param {Object} beforeData - Data before operation
 * @param {Object} afterData - Data after operation
 * @param {Function} applyFunction - Function to apply operation
 * @returns {Function} Redo function
 */
export function createUVRedoFunction(beforeData, afterData, applyFunction) {
  return historyUtils.createUVRedoFunction(beforeData, afterData, applyFunction);
}

/**
 * Compress history data for storage
 * @param {Array} entries - History entries
 * @returns {Object} Compressed data
 */
export function compressHistoryData(entries) {
  return historyUtils.compressHistoryData(entries);
}

/**
 * Decompress history data from storage
 * @param {Object} compressedData - Compressed data
 * @param {Function} undoFunction - Undo function factory
 * @param {Function} redoFunction - Redo function factory
 * @returns {Array} Decompressed entries
 */
export function decompressHistoryData(compressedData, undoFunction, redoFunction) {
  return historyUtils.decompressHistoryData(compressedData, undoFunction, redoFunction);
}

/**
 * Validate history data integrity
 * @param {Array} entries - History entries
 * @returns {Object} Validation result
 */
export function validateHistoryData(entries) {
  return historyUtils.validateHistoryData(entries);
}

// Export utility functions
export { historyUtils }; 