/**
 * @fileoverview Object utility functions.
 */
import * as THREE from 'three';

/**
 * Check if object is selected
 * @param {Object} object - Object to check
 * @param {Array} selectedObjects - Array of selected objects
 * @returns {boolean} True if object is selected
 */
export function isObjectSelected(object, selectedObjects) {
  return selectedObjects.some(selected => selected.uuid === object.uuid);
}

/**
 * Get selected object IDs
 * @param {Array} selectedObjects - Array of selected objects
 * @returns {Array} Array of selected object IDs
 */
export function getSelectedObjectIds(selectedObjects) {
  return selectedObjects.map(object => object.uuid);
}

/**
 * Filter objects by type
 * @param {Array} objects - Objects to filter
 * @param {string} type - Object type
 * @returns {Array} Filtered objects
 */
export function filterObjectsByType(objects, type) {
  return objects.filter(object => object.type === type);
}

/**
 * Get object bounds
 * @param {Object} object - Object to get bounds for
 * @returns {THREE.Box3} Bounds object
 */
export function getObjectBounds(object) {
  const box = new THREE.Box3();
  if (object.geometry) {
    box.setFromObject(object);
  }
  return box;
}

/**
 * Calculate distance between objects
 * @param {Object} object1 - First object
 * @param {Object} object2 - Second object
 * @returns {number} Distance between objects
 */
export function getObjectDistance(object1, object2) {
  const pos1 = new THREE.Vector3();
  const pos2 = new THREE.Vector3();
  object1.getWorldPosition(pos1);
  object2.getWorldPosition(pos2);
  return pos1.distanceTo(pos2);
}

/**
 * Check if objects intersect
 * @param {Object} object1 - First object
 * @param {Object} object2 - Second object
 * @returns {boolean} True if objects intersect
 */
export function doObjectsIntersect(object1, object2) {
  const box1 = getObjectBounds(object1);
  const box2 = getObjectBounds(object2);
  return box1.intersectsBox(box2);
}
