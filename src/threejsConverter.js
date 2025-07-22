/**
 * Three.js Converter - Pure functions for converting between EditableMesh and Three.js objects
 * Handles conversion between our modular mesh format and Three.js geometry/mesh objects
 * 
 * @deprecated Use the modular converter functions from './converter/' instead
 */

// Re-export all converter functions for backward compatibility
export * from './converter/index.js';

// Legacy function for backward compatibility
export async function convertToThreeJS(mesh, options = {}) {
  const { editableMeshToObject3D } = await import('./converter/utilityFunctions.js');
  return editableMeshToObject3D(mesh, options);
} 