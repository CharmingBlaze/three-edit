/**
 * @fileoverview ID generation utilities.
 */

/**
 * Generate unique edit ID
 * @returns {string} Edit ID
 */
export function generateEditId() {
  return 'edit-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate unique object ID
 * @returns {string} Object ID
 */
export function generateObjectId() {
  return 'obj-' + Math.random().toString(36).substr(2, 9);
}
