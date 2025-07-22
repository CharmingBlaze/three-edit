/**
 * @fileoverview UV Helper Functions
 * A collection of utility functions for UV operations that delegate to the UVOperations class.
 */

import { UVOperations } from '../operations/uvOperations.js';

/**
 * Unwraps the UVs of selected faces, creating new UV coordinates based on the geometry.
 * This is a high-level helper that delegates to `UVOperations.unwrapUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry with faces to unwrap.
 * @param {Array<number>} faceIndices The indices of the faces to unwrap.
 * @param {Object} [options={}] Configuration options for the unwrap operation (e.g., margin, method).
 * @returns {Object} The result from `UVOperations.unwrapUVs`.
 * @example
 * const result = unwrapUVs(myGeometry, [0, 1, 2], { method: 'lscm' });
 */
export function unwrapUVs(geometry, faceIndices, options = {}) {
  return UVOperations.unwrapUVs(geometry, faceIndices, options);
}

/**
 * Packs existing UV islands efficiently into the 0-1 UV space.
 * This is a high-level helper that delegates to `UVOperations.packUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry with UV islands to pack.
 * @param {Array<number>} faceIndices The indices of the faces whose UV islands should be packed.
 * @param {Object} [options={}] Configuration options for the pack operation (e.g., margin).
 * @param {number} [options.margin=0.01] The margin to leave between UV islands.
 * @returns {Object} The result from `UVOperations.packUVs`.
 * @example
 * const result = packUVs(myGeometry, [0, 1, 2], { margin: 0.02 });
 */
export function packUVs(geometry, faceIndices, options = {}) {
  return UVOperations.packUVs(geometry, faceIndices, options);
}

/**
 * Projects UVs onto the selected faces using an intelligent, angle-based projection.
 * This is a high-level helper that delegates to `UVOperations.smartProjectUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to project UVs onto.
 * @param {Array<number>} faceIndices The indices of the faces to project UVs onto.
 * @param {Object} [options={}] Configuration options for the smart project operation.
 * @returns {Object} The result from `UVOperations.smartProjectUVs`.
 * @example
 * const result = smartProjectUVs(myGeometry, [0, 1, 2]);
 */
export function smartProjectUVs(geometry, faceIndices, options = {}) {
  return UVOperations.smartProjectUVs(geometry, faceIndices, options);
}

/**
 * Projects UVs onto the selected faces from the perspective of a camera.
 * This is a high-level helper that delegates to `UVOperations.projectUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to project UVs onto.
 * @param {Array<number>} faceIndices The indices of the faces to project UVs onto.
 * @param {Object} [options={}] Configuration options for the project operation.
 * @param {THREE.Camera} options.camera The camera to project from.
 * @returns {Object} The result from `UVOperations.projectUVs`.
 * @example
 * const result = projectUVs(myGeometry, [0, 1, 2], { camera: myCamera });
 */
export function projectUVs(geometry, faceIndices, options = {}) {
  return UVOperations.projectUVs(geometry, faceIndices, options);
}

/**
 * Applies a generic transformation (translation, rotation, scale) to the UVs of selected faces.
 * This is a high-level helper that delegates to `UVOperations.transformUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to transform UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to transform.
 * @param {Object} [options={}] Configuration options for the transform operation.
 * @param {THREE.Vector2} [options.translation] The amount to translate the UVs.
 * @param {number} [options.rotation] The angle in radians to rotate the UVs.
 * @param {THREE.Vector2} [options.scale] The amount to scale the UVs.
 * @returns {Object} The result from `UVOperations.transformUVs`.
 * @example
 * const result = transformUVs(myGeometry, [0, 1, 2], { scale: new THREE.Vector2(2, 2) });
 */
export function transformUVs(geometry, faceIndices, options = {}) {
  return UVOperations.transformUVs(geometry, faceIndices, options);
}

/**
 * Scales the UVs of selected faces around a center point.
 * This is a high-level helper that delegates to `UVOperations.scaleUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to scale UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to scale.
 * @param {Object} [options={}] Configuration options for the scale operation.
 * @param {THREE.Vector2} options.scale The scaling factor to apply.
 * @param {THREE.Vector2} [options.center] The center point for the scaling.
 * @returns {Object} The result from `UVOperations.scaleUVs`.
 * @example
 * const result = scaleUVs(myGeometry, [0, 1, 2], { scale: new THREE.Vector2(2, 0.5) });
 */
export function scaleUVs(geometry, faceIndices, options = {}) {
  return UVOperations.scaleUVs(geometry, faceIndices, options);
}

/**
 * Rotates the UVs of selected faces around a center point.
 * This is a high-level helper that delegates to `UVOperations.rotateUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to rotate UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to rotate.
 * @param {Object} [options={}] Configuration options for the rotate operation.
 * @param {number} options.angle The angle in radians to rotate.
 * @param {THREE.Vector2} [options.center] The center point for the rotation.
 * @returns {Object} The result from `UVOperations.rotateUVs`.
 * @example
 * const result = rotateUVs(myGeometry, [0, 1, 2], { angle: Math.PI / 2 });
 */
export function rotateUVs(geometry, faceIndices, options = {}) {
  return UVOperations.rotateUVs(geometry, faceIndices, options);
}

/**
 * Translates the UVs of selected faces by a given vector.
 * This is a high-level helper that delegates to `UVOperations.translateUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to translate UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to translate.
 * @param {Object} [options={}] Configuration options for the translate operation.
 * @param {THREE.Vector2} options.translation The vector to translate by.
 * @returns {Object} The result from `UVOperations.translateUVs`.
 * @example
 * const result = translateUVs(myGeometry, [0, 1, 2], { translation: new THREE.Vector2(0.1, -0.2) });
 */
export function translateUVs(geometry, faceIndices, options = {}) {
  return UVOperations.translateUVs(geometry, faceIndices, options);
}

/**
 * Flips the UVs of selected faces along the U or V axis.
 * This is a high-level helper that delegates to `UVOperations.flipUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to flip UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to flip.
 * @param {Object} [options={}] Configuration options for the flip operation.
 * @param {string} options.axis The axis to flip on ('u' or 'v').
 * @returns {Object} The result from `UVOperations.flipUVs`.
 * @example
 * const result = flipUVs(myGeometry, [0, 1, 2], { axis: 'u' });
 */
export function flipUVs(geometry, faceIndices, options = {}) {
  return UVOperations.flipUVs(geometry, faceIndices, options);
}

/**
 * Mirrors the UVs of selected faces across a U or V axis.
 * This is a high-level helper that delegates to `UVOperations.mirrorUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to mirror UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to mirror.
 * @param {Object} [options={}] Configuration options for the mirror operation.
 * @param {string} options.axis The axis to mirror across ('u' or 'v').
 * @returns {Object} The result from `UVOperations.mirrorUVs`.
 * @example
 * const result = mirrorUVs(myGeometry, [0, 1, 2], { axis: 'v' });
 */
export function mirrorUVs(geometry, faceIndices, options = {}) {
  return UVOperations.mirrorUVs(geometry, faceIndices, options);
}

/**
 * Aligns the UVs of selected faces to the min, max, or center of the U or V axis.
 * This is a high-level helper that delegates to `UVOperations.alignUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to align UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to align.
 * @param {Object} [options={}] Configuration options for the align operation.
 * @param {string} options.axis The axis to align along ('u' or 'v').
 * @param {string} options.mode The alignment mode ('min', 'max', 'center').
 * @returns {Object} The result from `UVOperations.alignUVs`.
 * @example
 * const result = alignUVs(myGeometry, [0, 1, 2], { axis: 'u', mode: 'min' });
 */
export function alignUVs(geometry, faceIndices, options = {}) {
  return UVOperations.alignUVs(geometry, faceIndices, options);
}

/**
 * Distributes the UVs of selected faces evenly along the U or V axis.
 * This is a high-level helper that delegates to `UVOperations.distributeUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to distribute UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to distribute.
 * @param {Object} [options={}] Configuration options for the distribute operation.
 * @param {string} options.axis The axis to distribute along ('u' or 'v').
 * @returns {Object} The result from `UVOperations.distributeUVs`.
 * @example
 * const result = distributeUVs(myGeometry, [0, 1, 2], { axis: 'v' });
 */
export function distributeUVs(geometry, faceIndices, options = {}) {
  return UVOperations.distributeUVs(geometry, faceIndices, options);
}

/**
 * Snaps UV vertices to a grid, pixels, or other vertices.
 * This is a high-level helper that delegates to `UVOperations.snapUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to snap UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to snap.
 * @param {Object} [options={}] Configuration options for the snap operation.
 * @param {string} options.target The snap target ('grid', 'pixels', 'vertices').
 * @returns {Object} The result from `UVOperations.snapUVs`.
 * @example
 * const result = snapUVs(myGeometry, [0, 1, 2], { target: 'grid' });
 */
export function snapUVs(geometry, faceIndices, options = {}) {
  return UVOperations.snapUVs(geometry, faceIndices, options);
}

/**
 * Stitches UV islands together along selected edge pairs.
 * This is a high-level helper that delegates to `UVOperations.stitchUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to stitch UVs on.
 * @param {Array<Object>} edgePairs An array of edge pairs to stitch, e.g., [{v1: 0, v2: 1}, {v1: 2, v2: 3}].
 * @param {Object} [options={}] Configuration options for the stitch operation.
 * @returns {Object} The result from `UVOperations.stitchUVs`.
 * @example
 * const result = stitchUVs(myGeometry, [{v1: 0, v2: 1}, {v1: 2, v2: 3}]);
 */
export function stitchUVs(geometry, edgePairs, options = {}) {
  return UVOperations.stitchUVs(geometry, edgePairs, options);
}

/**
 * Welds nearby UV vertices together within a given threshold.
 * This is a high-level helper that delegates to `UVOperations.weldUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to weld UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to weld.
 * @param {Object} [options={}] Configuration options for the weld operation.
 * @param {number} [options.threshold=0.01] The distance threshold for welding.
 * @returns {Object} The result from `UVOperations.weldUVs`.
 * @example
 * const result = weldUVs(myGeometry, [0, 1, 2], { threshold: 0.01 });
 */
export function weldUVs(geometry, faceIndices, options = {}) {
  return UVOperations.weldUVs(geometry, faceIndices, options);
}

/**
 * Splits UVs along selected edges, creating a seam.
 * This is a high-level helper that delegates to `UVOperations.splitUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to split UVs on.
 * @param {Array<Object>} edges The edges to split, e.g., [{v1: 0, v2: 1}].
 * @param {Object} [options={}] Configuration options for the split operation.
 * @returns {Object} The result from `UVOperations.splitUVs`.
 * @example
 * const result = splitUVs(myGeometry, [{v1: 0, v2: 1}]);
 */
export function splitUVs(geometry, edges, options = {}) {
  return UVOperations.splitUVs(geometry, edges, options);
}

/**
 * Merges UV vertices that are at the exact same location.
 * This is a high-level helper that delegates to `UVOperations.mergeUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to merge UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to merge.
 * @param {Object} [options={}] Configuration options for the merge operation.
 * @returns {Object} The result from `UVOperations.mergeUVs`.
 * @example
 * const result = mergeUVs(myGeometry, [0, 1, 2]);
 */
export function mergeUVs(geometry, faceIndices, options = {}) {
  return UVOperations.mergeUVs(geometry, faceIndices, options);
}

/**
 * Optimizes the UV layout to reduce texture distortion and improve packing.
 * This is a high-level helper that delegates to `UVOperations.optimizeUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to optimize UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to optimize.
 * @param {Object} [options={}] Configuration options for the optimize operation.
 * @returns {Object} The result from `UVOperations.optimizeUVs`.
 * @example
 * const result = optimizeUVs(myGeometry, [0, 1, 2]);
 */
export function optimizeUVs(geometry, faceIndices, options = {}) {
  return UVOperations.optimizeUVs(geometry, faceIndices, options);
}

/**
 * Cleans up UVs by removing overlapping faces or other common issues.
 * This is a high-level helper that delegates to `UVOperations.cleanupUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry to clean up UVs on.
 * @param {Array<number>} faceIndices The indices of the faces whose UVs to clean up.
 * @param {Object} [options={}] Configuration options for the cleanup operation.
 * @returns {Object} The result from `UVOperations.cleanupUVs`.
 * @example
 * const result = cleanupUVs(myGeometry, [0, 1, 2]);
 */
export function cleanupUVs(geometry, faceIndices, options = {}) {
  return UVOperations.cleanupUVs(geometry, faceIndices, options);
}

/**
 * Selects or performs an operation on a specific UV island.
 * This is a high-level helper that delegates to `UVOperations.islandUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry containing the UV island.
 * @param {number} islandIndex The index of the UV island to operate on.
 * @param {Object} [options={}] Configuration options for the island operation (e.g., 'select', 'scale').
 * @returns {Object} The result from `UVOperations.islandUVs`.
 * @example
 * const result = islandUVs(myGeometry, 0, { operation: 'select' });
 */
export function islandUVs(geometry, islandIndex, options = {}) {
  return UVOperations.islandUVs(geometry, islandIndex, options);
}

/**
 * Marks selected edges as UV seams, which controls how UVs are unwrapped.
 * This is a high-level helper that delegates to `UVOperations.markSeamUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry.
 * @param {Array<Object>} edges The edges to mark as seams, e.g., [{v1: 0, v2: 1}].
 * @param {Object} [options={}] Configuration options for the seam operation.
 * @returns {Object} The result from `UVOperations.markSeamUVs`.
 * @example
 * const result = markSeamUVs(myGeometry, [{v1: 0, v2: 1}]);
 */
export function markSeamUVs(geometry, edges, options = {}) {
  return UVOperations.markSeamUVs(geometry, edges, options);
}

/**
 * Marks selected edges as sharp, which can affect UV splitting and shading.
 * This is a high-level helper that delegates to `UVOperations.markSharpUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry.
 * @param {Array<Object>} edges The edges to mark as sharp, e.g., [{v1: 0, v2: 1}].
 * @param {Object} [options={}] Configuration options for the sharp operation.
 * @returns {Object} The result from `UVOperations.markSharpUVs`.
 * @example
 * const result = markSharpUVs(myGeometry, [{v1: 0, v2: 1}]);
 */
export function markSharpUVs(geometry, edges, options = {}) {
  return UVOperations.markSharpUVs(geometry, edges, options);
}

/**
 * Marks UVs for use with freestyle (non-photorealistic rendering) outlines.
 * This is a high-level helper that delegates to `UVOperations.markFreestyleUVs`.
 * @param {THREE.BufferGeometry} geometry The target geometry.
 * @param {Array<number>} faceIndices The indices of the faces to mark for freestyle.
 * @param {Object} [options={}] Configuration options for the freestyle operation.
 * @returns {Object} The result from `UVOperations.markFreestyleUVs`.
 * @example
 * const result = markFreestyleUVs(myGeometry, [0, 1, 2]);
 */
export function markFreestyleUVs(geometry, faceIndices, options = {}) {
  return UVOperations.markFreestyleUVs(geometry, faceIndices, options);
}
