/**
 * @fileoverview History Types and Enumerations
 * Defines types and constants for the history/undo-redo system
 */

/**
 * History entry types
 * @enum {string}
 */
export const HistoryEntryTypes = {
  GEOMETRY_OPERATION: 'geometry_operation',
  VERTEX_OPERATION: 'vertex_operation',
  EDGE_OPERATION: 'edge_operation',
  FACE_OPERATION: 'face_operation',
  UV_OPERATION: 'uv_operation',
  SELECTION_CHANGE: 'selection_change',
  TRANSFORM_OPERATION: 'transform_operation',
  BOOLEAN_OPERATION: 'boolean_operation',
  SCULPTING_OPERATION: 'sculpting_operation',
  PAINTING_OPERATION: 'painting_operation',
  CUSTOM_OPERATION: 'custom_operation'
};

/**
 * History entry states
 * @enum {string}
 */
export const HistoryEntryStates = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

/**
 * History entry priorities
 * @enum {number}
 */
export const HistoryEntryPriorities = {
  LOW: 1,
  NORMAL: 5,
  HIGH: 10,
  CRITICAL: 20
};

/**
 * History manager states
 * @enum {string}
 */
export const HistoryManagerStates = {
  IDLE: 'idle',
  RECORDING: 'recording',
  UNDOING: 'undoing',
  REDOING: 'redoing',
  CLEARING: 'clearing'
};

/**
 * History entry metadata structure
 * @typedef {Object} HistoryEntryMetadata
 * @property {string} operation - Operation name
 * @property {string} description - Human-readable description
 * @property {Object} parameters - Operation parameters
 * @property {number} timestamp - Unix timestamp
 * @property {string} userId - User identifier (for collaboration)
 * @property {Object} context - Additional context data
 */

/**
 * History entry structure
 * @typedef {Object} HistoryEntry
 * @property {string} id - Unique identifier
 * @property {string} type - Entry type from HistoryEntryTypes
 * @property {string} state - Entry state from HistoryEntryStates
 * @property {number} priority - Entry priority from HistoryEntryPriorities
 * @property {HistoryEntryMetadata} metadata - Entry metadata
 * @property {Function} undoFunction - Function to undo this operation
 * @property {Function} redoFunction - Function to redo this operation
 * @property {Object} data - Operation data for undo/redo
 */

/**
 * History manager configuration
 * @typedef {Object} HistoryManagerConfig
 * @property {number} maxEntries - Maximum number of history entries
 * @property {boolean} autoSave - Auto-save history to storage
 * @property {boolean} compression - Enable history compression
 * @property {boolean} collaboration - Enable collaborative history
 * @property {number} maxMemoryUsage - Maximum memory usage in bytes
 * @property {boolean} enableUndoRedo - Enable undo/redo functionality
 * @property {boolean} enableBranching - Enable history branching
 * @property {boolean} enableMerging - Enable history merging
 */

/**
 * History operation result
 * @typedef {Object} HistoryOperationResult
 * @property {boolean} success - Operation success status
 * @property {string} entryId - Created history entry ID
 * @property {string} message - Operation message
 * @property {Object} data - Additional result data
 */

/**
 * History query options
 * @typedef {Object} HistoryQueryOptions
 * @property {string} type - Filter by entry type
 * @property {string} state - Filter by entry state
 * @property {number} priority - Filter by minimum priority
 * @property {number} startTime - Filter by start timestamp
 * @property {number} endTime - Filter by end timestamp
 * @property {string} userId - Filter by user ID
 * @property {number} limit - Maximum number of results
 * @property {number} offset - Result offset
 * @property {string} sortBy - Sort field
 * @property {string} sortOrder - Sort order (asc/desc)
 */ 