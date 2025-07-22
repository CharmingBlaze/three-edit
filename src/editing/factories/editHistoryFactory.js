/**
 * @fileoverview Factory for creating EditHistory instances.
 */
import { EditHistoryManager } from '../core/editHistory.js';

/**
 * Create an edit history manager
 * @param {Object} options - Edit history options
 * @returns {EditHistory} Edit history instance
 */
export function createEditHistory(options = {}) {
  return new EditHistoryManager(options);
}
