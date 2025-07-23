/**
 * GLTF 2.0 Type Definitions
 * Complete type definitions for the GLTF 2.0 specification
 */

// Core GLTF structure
export interface GLTF {
  asset: GLTFAsset;
  scene?: number;
  scenes?: GLTFScene[];
  nodes?: GLTFNode[];
  meshes?: GLTFMesh[];
  accessors?: GLTFAccessor[];
  bufferViews?: GLTFBufferView[];
  buffers?: GLTFBuffer[];
  materials?: GLTFMaterial[];
  textures?: GLTFTexture[];
  images?: GLTFImage[];
  samplers?: GLTFSampler[];
  animations?: GLTFAnimation[];
  skins?: GLTFSkin[];
  cameras?: GLTFCamera[];
  extensions?: Record<string, any>;
  extras?: any;
}

// Asset information
export interface GLTFAsset {
  version: string;
  generator?: string;
  copyright?: string;
  minVersion?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

// Scene structure
export interface GLTFScene {
  nodes: number[];
  name?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

// Node structure
export interface GLTFNode {
  name?: string;
  children?: number[];
  matrix?: number[];
  translation?: number[];
  rotation?: number[];
  scale?: number[];
  mesh?: number;
  skin?: number;
  camera?: number;
  weights?: number[];
  extensions?: Record<string, any>;
  extras?: any;
}

// Mesh structure
export interface GLTFMesh {
  primitives: GLTFPrimitive[];
  weights?: number[];
  name?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

// Primitive structure
export interface GLTFPrimitive {
  attributes: { [key: string]: number };
  indices?: number;
  material?: number;
  mode?: number;
  targets?: { [key: string]: number }[];
  extensions?: Record<string, any>;
  extras?: any;
}

// Accessor structure
export interface GLTFAccessor {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  normalized?: boolean;
  count: number;
  type: 'SCALAR' | 'VEC2' | 'VEC3' | 'VEC4' | 'MAT2' | 'MAT3' | 'MAT4';
  max?: number[];
  min?: number[];
  sparse?: GLTFSparse;
  name?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

// Sparse accessor structure
export interface GLTFSparse {
  count: number;
  indices: GLTFSparseIndices;
  values: GLTFSparseValues;
  extensions?: Record<string, any>;
  extras?: any;
}

export interface GLTFSparseIndices {
  bufferView: number;
  byteOffset?: number;
  componentType: number;
  extensions?: Record<string, any>;
  extras?: any;
}

export interface GLTFSparseValues {
  bufferView: number;
  byteOffset?: number;
  extensions?: Record<string, any>;
  extras?: any;
}

// Buffer view structure
export interface GLTFBufferView {
  buffer: number;
  byteOffset?: number;
  byteLength: number;
  byteStride?: number;
  target?: number;
  name?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

// Buffer structure
export interface GLTFBuffer {
  uri?: string;
  byteLength: number;
  name?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

// Material structure
export interface GLTFMaterial {
  name?: string;
  pbrMetallicRoughness?: GLTFPBRMetallicRoughness;
  normalTexture?: GLTFNormalTextureInfo;
  occlusionTexture?: GLTFOcclusionTextureInfo;
  emissiveTexture?: GLTFTextureInfo;
  emissiveFactor?: number[];
  alphaMode?: 'OPAQUE' | 'MASK' | 'BLEND';
  alphaCutoff?: number;
  doubleSided?: boolean;
  extensions?: Record<string, any>;
  extras?: any;
}

// PBR Metallic Roughness
export interface GLTFPBRMetallicRoughness {
  baseColorFactor?: number[];
  baseColorTexture?: GLTFTextureInfo;
  metallicFactor?: number;
  roughnessFactor?: number;
  metallicRoughnessTexture?: GLTFTextureInfo;
  extensions?: Record<string, any>;
  extras?: any;
}

// Texture info
export interface GLTFTextureInfo {
  index: number;
  texCoord?: number;
  extensions?: Record<string, any>;
  extras?: any;
}

// Normal texture info
export interface GLTFNormalTextureInfo extends GLTFTextureInfo {
  scale?: number;
}

// Occlusion texture info
export interface GLTFOcclusionTextureInfo extends GLTFTextureInfo {
  strength?: number;
}

// Texture structure
export interface GLTFTexture {
  source?: number;
  sampler?: number;
  name?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

// Image structure
export interface GLTFImage {
  uri?: string;
  mimeType?: string;
  bufferView?: number;
  name?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

// Sampler structure
export interface GLTFSampler {
  magFilter?: number;
  minFilter?: number;
  wrapS?: number;
  wrapT?: number;
  name?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

// Animation structure
export interface GLTFAnimation {
  channels: GLTFAnimationChannel[];
  samplers: GLTFAnimationSampler[];
  name?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

export interface GLTFAnimationChannel {
  sampler: number;
  target: GLTFAnimationTarget;
  extensions?: Record<string, any>;
  extras?: any;
}

export interface GLTFAnimationTarget {
  node?: number;
  path: 'translation' | 'rotation' | 'scale' | 'weights';
  extensions?: Record<string, any>;
  extras?: any;
}

export interface GLTFAnimationSampler {
  input: number;
  interpolation?: 'LINEAR' | 'STEP' | 'CUBICSPLINE';
  output: number;
  extensions?: Record<string, any>;
  extras?: any;
}

// Skin structure
export interface GLTFSkin {
  inverseBindMatrices?: number;
  skeleton?: number;
  joints: number[];
  name?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

// Camera structure
export interface GLTFCamera {
  orthographic?: GLTFOrthographicCamera;
  perspective?: GLTFPerspectiveCamera;
  type: 'perspective' | 'orthographic';
  name?: string;
  extensions?: Record<string, any>;
  extras?: any;
}

export interface GLTFPerspectiveCamera {
  aspectRatio?: number;
  yfov: number;
  zfar?: number;
  znear: number;
  extensions?: Record<string, any>;
  extras?: any;
}

export interface GLTFOrthographicCamera {
  xmag: number;
  ymag: number;
  zfar: number;
  znear: number;
  extensions?: Record<string, any>;
  extras?: any;
}

// Component type constants
export const GLTFComponentTypes = {
  BYTE: 5120,
  UNSIGNED_BYTE: 5121,
  SHORT: 5122,
  UNSIGNED_SHORT: 5123,
  UNSIGNED_INT: 5125,
  FLOAT: 5126
} as const;

// Primitive mode constants
export const GLTFPrimitiveModes = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
} as const;

// Filter constants
export const GLTFFilterTypes = {
  NEAREST: 9728,
  LINEAR: 9729,
  NEAREST_MIPMAP_NEAREST: 9984,
  LINEAR_MIPMAP_NEAREST: 9985,
  NEAREST_MIPMAP_LINEAR: 9986,
  LINEAR_MIPMAP_LINEAR: 9987
} as const;

// Wrap mode constants
export const GLTFWrapModes = {
  CLAMP_TO_EDGE: 33071,
  MIRRORED_REPEAT: 33648,
  REPEAT: 10497
} as const;

// Target constants
export const GLTFBufferTargets = {
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963
} as const; 