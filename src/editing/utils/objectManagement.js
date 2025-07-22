/**
 * @fileoverview Object Management Utilities
 * A collection of functions for creating, deleting, and managing objects.
 */

import { EditOperations } from '../EditOperations.js';

/**
 * Create new object
 * @param {Object} data - Object data
 * @param {Object} options - Creation options
 * @returns {Object} Created object
 */
export function createObject(data, options = {}) {
  return EditOperations.createObject(data, options);
}

/**
 * Delete objects
 * @param {Array} objects - Objects to delete
 * @param {Object} options - Deletion options
 * @returns {Array} Deleted objects
 */
export function deleteObjects(objects, options = {}) {
  return EditOperations.deleteObjects(objects, options);
}

/**
 * Duplicate objects
 * @param {Array} objects - Objects to duplicate
 * @param {Object} options - Duplication options
 * @returns {Array} Duplicated objects
 */
export function duplicateObjects(objects, options = {}) {
  return EditOperations.duplicateObjects(objects, options);
}

/**
 * Group objects
 * @param {Array} objects - Objects to group
 * @param {Object} options - Grouping options
 * @returns {Object} Group object
 */
export function groupObjects(objects, options = {}) {
  return EditOperations.groupObjects(objects, options);
}

/**
 * Ungroup objects
 * @param {Array} groups - Groups to ungroup
 * @param {Object} options - Ungrouping options
 * @returns {Array} Ungrouped objects
 */
export function ungroupObjects(groups, options = {}) {
  return EditOperations.ungroupObjects(groups, options);
}

/**
 * Align objects
 * @param {Array} objects - Objects to align
 * @param {Object} target - Target object or point
 * @param {Object} options - Alignment options
 * @returns {Array} Aligned objects
 */
export function alignObjects(objects, target, options = {}) {
  return EditOperations.alignObjects(objects, target, options);
}

/**
 * Distribute objects
 * @param {Array} objects - Objects to distribute
 * @param {Object} options - Distribution options
 * @returns {Array} Distributed objects
 */
export function distributeObjects(objects, options = {}) {
  return EditOperations.distributeObjects(objects, options);
}

/**
 * Mirror objects
 * @param {Array} objects - Objects to mirror
 * @param {Object} options - Mirror options
 * @returns {Array} Mirrored objects
 */
export function mirrorObjects(objects, options = {}) {
  return EditOperations.mirrorObjects(objects, options);
}
