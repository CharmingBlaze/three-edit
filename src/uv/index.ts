// Export from modular UV system
export * from './types';
export * from './planarUVs';
export * from './cubicUVs';
export * from './sphericalUVs';
export * from './cylindricalUVs';

// Core UV functions
export * from './generateUVs';
export * from './generatePlanarUVs';
export * from './transformUVs';
export * from './UVCoord';

// Main UV functions
export { generateUVs } from './generateUVs';
export { generatePlanarUVs } from './planarUVs';
export { generateCubicUVs } from './cubicUVs';
export { generateSphericalUVs } from './sphericalUVs';
export { generateCylindricalUVs } from './cylindricalUVs';
export type { UVProjectionType, GenerateUVsOptions } from './types'; 