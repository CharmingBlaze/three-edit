/**
 * GLTF Import/Export Options
 * Comprehensive configuration for GLTF operations
 */

export interface GLTFImportOptions {
  /** Whether to include vertex normals */
  includeNormals?: boolean;
  /** Whether to include texture coordinates */
  includeUVs?: boolean;
  /** Whether to include material information */
  includeMaterials?: boolean;
  /** Whether to include animations */
  includeAnimations?: boolean;
  /** Whether to include skins/bones */
  includeSkins?: boolean;
  /** Scale factor for coordinates */
  scale?: number;
  /** Whether to flip Y coordinates */
  flipY?: boolean;
  /** Whether to flip Z coordinates */
  flipZ?: boolean;
  /** Whether to preserve node hierarchy */
  preserveHierarchy?: boolean;
  /** Whether to merge all meshes into one */
  mergeMeshes?: boolean;
  /** Custom material conversion function */
  materialConverter?: (gltfMaterial: any) => any;
  /** Custom node processing function */
  nodeProcessor?: (gltfNode: any, index: number) => any;
  /** Whether to validate geometry on import */
  validateGeometry?: boolean;
  /** Whether to repair geometry issues automatically */
  autoRepair?: boolean;
}

export interface GLTFExportOptions {
  /** Whether to include vertex normals */
  includeNormals?: boolean;
  /** Whether to include texture coordinates */
  includeUVs?: boolean;
  /** Whether to include material information */
  includeMaterials?: boolean;
  /** Whether to include animations */
  includeAnimations?: boolean;
  /** Whether to include skins/bones */
  includeSkins?: boolean;
  /** Whether to export as binary GLB */
  binary?: boolean;
  /** Scale factor for coordinates */
  scale?: number;
  /** Whether to flip Y coordinates */
  flipY?: boolean;
  /** Whether to flip Z coordinates */
  flipZ?: boolean;
  /** Whether to embed binary data */
  embedBinary?: boolean;
  /** Whether to optimize for size */
  optimize?: boolean;
  /** Whether to include extras data */
  includeExtras?: boolean;
  /** Custom material export function */
  materialExporter?: (material: any) => any;
  /** Custom node export function */
  nodeExporter?: (node: any) => any;
  /** Whether to validate before export */
  validateBeforeExport?: boolean;
  /** Maximum texture size for embedded images */
  maxTextureSize?: number;
  /** Whether to compress textures */
  compressTextures?: boolean;
  /** Quality for texture compression (0-1) */
  textureQuality?: number;
}

export interface GLTFValidationOptions {
  /** Whether to check for duplicate vertices */
  checkDuplicates?: boolean;
  /** Whether to check for degenerate faces */
  checkDegenerateFaces?: boolean;
  /** Whether to check for non-manifold edges */
  checkNonManifold?: boolean;
  /** Whether to check for overlapping faces */
  checkOverlapping?: boolean;
  /** Whether to check UV coordinates */
  checkUVs?: boolean;
  /** Whether to check material assignments */
  checkMaterials?: boolean;
  /** Tolerance for floating point comparisons */
  tolerance?: number;
}

export interface GLTFRepairOptions {
  /** Whether to remove duplicate vertices */
  removeDuplicates?: boolean;
  /** Whether to fix degenerate faces */
  fixDegenerateFaces?: boolean;
  /** Whether to fix winding order */
  fixWindingOrder?: boolean;
  /** Whether to generate missing normals */
  generateNormals?: boolean;
  /** Whether to generate missing UVs */
  generateUVs?: boolean;
  /** Whether to triangulate faces */
  triangulate?: boolean;
  /** Whether to merge close vertices */
  mergeCloseVertices?: boolean;
  /** Distance threshold for merging vertices */
  mergeThreshold?: number;
}

// Default options
export const DEFAULT_IMPORT_OPTIONS: Required<GLTFImportOptions> = {
  includeNormals: true,
  includeUVs: true,
  includeMaterials: true,
  includeAnimations: false,
  includeSkins: false,
  scale: 1.0,
  flipY: false,
  flipZ: false,
  preserveHierarchy: true,
  mergeMeshes: false,
  materialConverter: (material: any) => material,
  nodeProcessor: (node: any) => node,
  validateGeometry: true,
  autoRepair: true
};

export const DEFAULT_EXPORT_OPTIONS: Required<GLTFExportOptions> = {
  includeNormals: true,
  includeUVs: true,
  includeMaterials: true,
  includeAnimations: false,
  includeSkins: false,
  binary: false,
  scale: 1.0,
  flipY: false,
  flipZ: false,
  embedBinary: true,
  optimize: true,
  includeExtras: true,
  materialExporter: (material: any) => material,
  nodeExporter: (node: any) => node,
  validateBeforeExport: true,
  maxTextureSize: 2048,
  compressTextures: false,
  textureQuality: 0.8
};

export const DEFAULT_VALIDATION_OPTIONS: Required<GLTFValidationOptions> = {
  checkDuplicates: true,
  checkDegenerateFaces: true,
  checkNonManifold: true,
  checkOverlapping: false,
  checkUVs: true,
  checkMaterials: true,
  tolerance: 1e-6
};

export const DEFAULT_REPAIR_OPTIONS: Required<GLTFRepairOptions> = {
  removeDuplicates: true,
  fixDegenerateFaces: true,
  fixWindingOrder: true,
  generateNormals: true,
  generateUVs: false,
  triangulate: false,
  mergeCloseVertices: false,
  mergeThreshold: 1e-6
}; 