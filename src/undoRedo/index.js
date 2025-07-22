/**
 * @fileoverview Undo/Redo System
 * Provides comprehensive undo/redo functionality for the 3D editor
 */

import { HistoryManager } from '../history/HistoryManager.js';

/**
 * Create a history manager with default settings
 * @param {Object} options - Configuration options
 * @returns {HistoryManager} History manager instance
 */
export function createHistoryManager(options = {}) {
  return new HistoryManager(options);
}

/**
 * Common operation types
 */
export const OperationTypes = {
  // Mesh operations
  MESH_CREATE: 'mesh_create',
  MESH_DELETE: 'mesh_delete',
  MESH_MODIFY: 'mesh_modify',
  MESH_DUPLICATE: 'mesh_duplicate',
  
  // Vertex operations
  VERTEX_ADD: 'vertex_add',
  VERTEX_DELETE: 'vertex_delete',
  VERTEX_MOVE: 'vertex_move',
  VERTEX_MERGE: 'vertex_merge',
  
  // Edge operations
  EDGE_ADD: 'edge_add',
  EDGE_DELETE: 'edge_delete',
  EDGE_SPLIT: 'edge_split',
  
  // Face operations
  FACE_ADD: 'face_add',
  FACE_DELETE: 'face_delete',
  FACE_EXTRUDE: 'face_extrude',
  FACE_BEVEL: 'face_bevel',
  
  // Transform operations
  TRANSFORM_MOVE: 'transform_move',
  TRANSFORM_ROTATE: 'transform_rotate',
  TRANSFORM_SCALE: 'transform_scale',
  
  // Selection operations
  SELECTION_CHANGE: 'selection_change',
  
  // Material operations
  MATERIAL_CHANGE: 'material_change',
  
  // Custom operations
  CUSTOM: 'custom'
};

/**
 * Create a mesh modification operation
 * @param {HistoryManager} historyManager - History manager instance
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} oldData - Old mesh data
 * @param {Object} newData - New mesh data
 * @param {string} description - Operation description
 * @returns {HistoryOperation} Created operation
 */
export function createMeshModificationOperation(historyManager, mesh, oldData, newData, description) {
  return historyManager.createMeshOperation(
    OperationTypes.MESH_MODIFY,
    mesh,
    oldData,
    newData,
    description
  );
}

/**
 * Create a transformation operation
 * @param {HistoryManager} historyManager - History manager instance
 * @param {string} type - Transform type
 * @param {Object} target - Target object
 * @param {Object} oldTransform - Old transformation
 * @param {Object} newTransform - New transformation
 * @param {string} description - Operation description
 * @returns {HistoryOperation} Created operation
 */
export function createTransformOperation(historyManager, type, target, oldTransform, newTransform, description) {
  return historyManager.createTransformOperation(
    type,
    target,
    oldTransform,
    newTransform,
    description
  );
}

/**
 * Create a custom operation
 * @param {HistoryManager} historyManager - History manager instance
 * @param {string} type - Operation type
 * @param {Function} undoFn - Undo function
 * @param {Function} redoFn - Redo function
 * @param {Object} data - Operation data
 * @param {string} description - Operation description
 * @returns {HistoryOperation} Created operation
 */
export function createCustomOperation(historyManager, type, undoFn, redoFn, data, description) {
  return historyManager.createCustomOperation(type, undoFn, redoFn, data, description);
}

/**
 * Batch multiple operations into a single undo/redo action
 * @param {HistoryManager} historyManager - History manager instance
 * @param {Array} operations - Array of operations to batch
 * @param {string} description - Batch description
 */
export function batchOperations(historyManager, operations, description) {
  if (operations.length === 0) {return;}

  const undoFn = (data) => {
    // Execute undo functions in reverse order
    for (let i = data.operations.length - 1; i >= 0; i--) {
      data.operations[i].undo();
    }
  };

  const redoFn = (data) => {
    // Execute redo functions in order
    for (let i = 0; i < data.operations.length; i++) {
      data.operations[i].redo();
    }
  };

  return historyManager.createCustomOperation(
    OperationTypes.CUSTOM,
    undoFn,
    redoFn,
    { operations },
    description
  );
}

/**
 * Utility function to capture mesh state
 * @param {EditableMesh} mesh - Mesh to capture
 * @returns {Object} Mesh state
 */
export function captureMeshState(mesh) {
  return {
    vertices: new Map(mesh.vertices),
    edges: new Map(mesh.edges),
    faces: new Map(mesh.faces),
    uvs: new Map(mesh.uvs),
    material: { ...mesh.material },
    attributes: new Map(mesh.attributes)
  };
}

/**
 * Utility function to restore mesh state
 * @param {EditableMesh} mesh - Mesh to restore
 * @param {Object} state - State to restore
 */
export function restoreMeshState(mesh, state) {
  mesh.vertices = new Map(state.vertices);
  mesh.edges = new Map(state.edges);
  mesh.faces = new Map(state.faces);
  mesh.uvs = new Map(state.uvs);
  mesh.material = { ...state.material };
  mesh.attributes = new Map(state.attributes);
} 