/**
 * @fileoverview Factory for creating EditManager instances.
 */
import { ModernEditManager } from '../core/modernEditManager.js';

/**
 * Create an edit manager
 * @param {Object} options - Edit manager options
 * @returns {EditManager} Edit manager instance
 */
export function createEditManager(options = {}) {
  return new ModernEditManager(options);
}
