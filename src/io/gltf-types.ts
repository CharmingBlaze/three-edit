export interface GLTF {
  asset: {
    version: string;
    generator?: string;
  };
  scene?: number;
  scenes?: GLTFScene[];
  nodes?: GLTFNode[];
  meshes?: GLTFMesh[];
  accessors?: GLTFAccessor[];
  bufferViews?: GLTFBufferView[];
  buffers?: GLTFBuffer[];
  materials?: GLTFMaterial[];
}

export interface GLTFScene {
  nodes: number[];
}

export interface GLTFNode {
  mesh?: number;
}

export interface GLTFMesh {
  primitives: GLTFPrimitive[];
}

export interface GLTFPrimitive {
  attributes: { [key: string]: number };
  indices?: number;
  material?: number;
}

export interface GLTFAccessor {
  bufferView?: number;
  componentType: number;
  count: number;
  type: 'SCALAR' | 'VEC2' | 'VEC3' | 'VEC4' | 'MAT2' | 'MAT3' | 'MAT4';
  max?: number[];
  min?: number[];
}

export interface GLTFBufferView {
  buffer: number;
  byteOffset?: number;
  byteLength: number;
}

export interface GLTFBuffer {
  byteLength: number;
  uri?: string;
}

export interface GLTFMaterial {
  pbrMetallicRoughness?: {
    baseColorFactor?: [number, number, number, number];
    metallicFactor?: number;
    roughnessFactor?: number;
  };
}
