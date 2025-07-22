/**
 * @fileoverview Converter Index
 * Centralized exports for all converter functions
 */

// EditableMesh to Three.js conversions
export {
  editableMeshToBufferGeometry,
  editableMeshToMesh,
  editableMeshToGroup,
  editableMeshToWireframe,
  editableMeshToPoints
} from './editableMeshToThree.js';

// Three.js to EditableMesh conversions
export {
  bufferGeometryToEditableMesh,
  meshToEditableMesh,
  groupToEditableMesh
} from './threeToEditableMesh.js';

// Utility functions
export {
  getVertexPositions,
  getFaceIndices,
  getEdgeIndices,
  editableMeshToObject3D
} from './utilityFunctions.js';

// Legacy export for backward compatibility
export { convertToThreeJS } from '../threejsConverter.js'; 