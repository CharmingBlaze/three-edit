/**
 * three-edit JavaScript Wrapper
 * 
 * This file provides a simplified API for vanilla JavaScript users.
 * It wraps the TypeScript functionality in a more JavaScript-friendly way.
 */

// Import core functionality
import { EditableMesh } from '../core/EditableMesh';
import { toBufferGeometry } from '../conversion/toBufferGeometry';
import { fromBufferGeometry } from '../conversion/fromBufferGeometry';

// Import primitives
import { createCube } from '../primitives/createCube';
import { createSphere } from '../primitives/createSphere';
import { createCylinder } from '../primitives/createCylinder';
import { createCone } from '../primitives/createCone';
import { createArrow } from '../primitives/createArrow';

// Import editing operations
import { extrudeFace } from '../editing/extrudeFace';
import { bevelEdge } from '../editing/bevelEdge';
import { bevelVertex } from '../editing/bevelVertex';
import { subdivide } from '../editing/subdivide';
import { insetFace } from '../editing/insetFace';

// Import selection utilities
import { selectFacesByNormal } from '../selection/selectFacesByNormal';
import { selectEdgeLoop } from '../selection/selectEdgeLoop';
import { selectEdgeRing } from '../selection/selectEdgeRing';

// Import utility functions
import { calculateFaceNormal } from '../utils/calculateFaceNormal';
import { calculateFaceCenter } from '../utils/calculateFaceCenter';

/**
 * ThreeEditJS - A JavaScript-friendly wrapper for three-edit
 */
const ThreeEditJS = {
  // Core functionality
  createMesh: () => new EditableMesh(),
  toBufferGeometry,
  fromBufferGeometry,
  
  // Primitives
  createCube,
  createSphere,
  createCylinder,
  createCone,
  createArrow,
  
  // Editing operations
  extrudeFace,
  bevelEdge,
  bevelVertex,
  subdivide,
  insetFace,
  
  // Selection utilities
  selectFacesByNormal,
  selectEdgeLoop,
  selectEdgeRing,
  
  // Utility functions
  calculateFaceNormal,
  calculateFaceCenter,
  
  // Helper methods for JavaScript users
  /**
   * Creates a mesh from a Three.js BufferGeometry
   * @param {THREE.BufferGeometry} geometry - The Three.js geometry to convert
   * @return {EditableMesh} The resulting editable mesh
   */
  createFromThreeGeometry: (geometry) => {
    return fromBufferGeometry(geometry);
  },
  
  /**
   * Applies an operation to a mesh and returns the updated Three.js geometry
   * @param {EditableMesh} mesh - The mesh to operate on
   * @param {Function} operation - The operation function to apply
   * @param {...any} args - Arguments for the operation
   * @return {THREE.BufferGeometry} The resulting Three.js geometry
   */
  applyOperation: (mesh, operation, ...args) => {
    operation(mesh, ...args);
    return toBufferGeometry(mesh);
  }
};

export default ThreeEditJS;
