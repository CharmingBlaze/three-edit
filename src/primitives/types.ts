import { Vector3 } from 'three';
import { UVCoord } from '../uv/types';

/**
 * Base options interface that all primitives should extend
 */
export interface CreatePrimitiveOptions {
  /** Name of the primitive mesh */
  name?: string;
  /** Material ID to assign to all faces */
  materialId?: number;
  /** Individual material IDs for each face (overrides materialId) */
  faceMaterialIds?: number[];
  /** Whether to center the primitive on origin (true) or align to base (false) */
  centered?: boolean;
  /** UV layout method for the primitive */
  uvLayout?: 'planar' | 'spherical' | 'cylindrical' | 'box' | 'default';
  /** Whether to generate smooth normals */
  smoothNormals?: boolean;
  /** Whether to validate the primitive after creation */
  validate?: boolean;
  /** Custom user data */
  userData?: Record<string, any>;
  /** Smoothing options */
  smoothing?: {
    /** Whether to apply smoothing after creation */
    enabled?: boolean;
    /** Type of smoothing to apply */
    type?: 'vertex' | 'laplacian' | 'subdivision';
    /** Number of smoothing iterations */
    iterations?: number;
    /** Smoothing factor (0-1) */
    factor?: number;
    /** For subdivision: number of subdivision levels */
    levels?: number;
    /** For subdivision: subdivision scheme */
    scheme?: 'catmullClark' | 'loop' | 'butterfly';
    /** For laplacian: lambda parameter */
    lambda?: number;
  };
}

/**
 * Cube-specific options
 */
export interface CreateCubeOptions extends CreatePrimitiveOptions {
  width?: number;
  height?: number;
  depth?: number;
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
}

/**
 * Sphere-specific options
 */
export interface CreateSphereOptions extends CreatePrimitiveOptions {
  radius?: number;
  widthSegments?: number;
  heightSegments?: number;
  phiStart?: number;
  phiLength?: number;
  thetaStart?: number;
  thetaLength?: number;
}

/**
 * Cylinder-specific options
 */
export interface CreateCylinderOptions extends CreatePrimitiveOptions {
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
  thetaStart?: number;
  thetaLength?: number;
}

/**
 * Cone-specific options
 */
export interface CreateConeOptions extends CreatePrimitiveOptions {
  radius?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
}

/**
 * Plane-specific options
 */
export interface CreatePlaneOptions extends CreatePrimitiveOptions {
  width?: number;
  height?: number;
  widthSegments?: number;
  heightSegments?: number;
}

/**
 * Torus-specific options
 */
export interface CreateTorusOptions extends CreatePrimitiveOptions {
  radius?: number;
  tube?: number;
  radialSegments?: number;
  tubularSegments?: number;
  arc?: number;
}

/**
 * Circle-specific options
 */
export interface CreateCircleOptions extends CreatePrimitiveOptions {
  radius?: number;
  segments?: number;
  thetaStart?: number;
  thetaLength?: number;
}

/**
 * Pyramid-specific options
 */
export interface CreatePyramidOptions extends CreatePrimitiveOptions {
  width?: number;
  height?: number;
  depth?: number;
}

/**
 * Tetrahedron-specific options
 */
export interface CreateTetrahedronOptions extends CreatePrimitiveOptions {
  radius?: number;
}

/**
 * Octahedron-specific options
 */
export interface CreateOctahedronOptions extends CreatePrimitiveOptions {
  radius?: number;
}

/**
 * Icosahedron-specific options
 */
export interface CreateIcosahedronOptions extends CreatePrimitiveOptions {
  radius?: number;
}

/**
 * Standard vertex creation options
 */
export interface VertexOptions {
  /** Position coordinates */
  x: number;
  y: number;
  z: number;
  /** UV coordinates */
  uv?: UVCoord;
  /** Vertex normal */
  normal?: Vector3;
  /** Vertex color */
  color?: Vector3;
  /** Custom user data */
  userData?: Record<string, any>;
}

/**
 * Standard face creation options
 */
export interface FaceOptions {
  /** Vertex indices for the face */
  vertexIds: number[];
  /** Face-vertex UV coordinates */
  faceVertexUvs?: UVCoord[];
  /** Material index for this face */
  materialId?: number;
  /** Face normal (will be calculated if not provided) */
  normal?: Vector3;
  /** Custom user data */
  userData?: Record<string, any>;
}

/**
 * Standard edge creation options
 */
export interface EdgeOptions {
  /** First vertex index */
  v1: number;
  /** Second vertex index */
  v2: number;
  /** Custom user data */
  userData?: Record<string, any>;
}

/**
 * Primitive creation context
 */
export interface PrimitiveContext {
  /** The mesh being created */
  mesh: any; // EditableMesh type
  /** Edge key cache for performance */
  edgeKeyCache: any; // EdgeKeyCache type
  /** Current material ID */
  materialId: number;
  /** Whether to validate after creation */
  validate: boolean;
  /** UV layout method */
  uvLayout: string;
  /** Whether to generate smooth normals */
  smoothNormals: boolean;
}

/**
 * Vertex creation result
 */
export interface VertexCreationResult {
  /** The created vertex ID */
  id: number;
  /** The vertex object */
  vertex: any; // Vertex type
}

/**
 * Face creation result
 */
export interface FaceCreationResult {
  /** The created face ID */
  id: number;
  /** The face object */
  face: any; // Face type
  /** The created edge IDs */
  edgeIds: number[];
}

/**
 * Edge creation result
 */
export interface EdgeCreationResult {
  /** The created edge ID */
  id: number;
  /** The edge object */
  edge: any; // Edge type
}

/**
 * Validation result for primitive geometry
 */
export interface PrimitiveValidationResult {
  /** Whether the primitive is valid */
  isValid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
  /** Statistics about the primitive */
  stats: {
    vertexCount: number;
    edgeCount: number;
    faceCount: number;
    materialCount: number;
    uvCount: number;
    normalCount: number;
  };
}

/**
 * Standard primitive creation result
 */
export interface PrimitiveResult {
  /** The created mesh */
  mesh: any; // EditableMesh type
  /** Validation result */
  validation: PrimitiveValidationResult;
  /** Metadata about the primitive */
  metadata: {
    type: string;
    options: Record<string, any>;
    creationTime: number;
    performance: {
      vertexCreationTime: number;
      faceCreationTime: number;
      edgeCreationTime: number;
      validationTime: number;
      totalTime: number;
    };
  };
}

/**
 * UV generation parameters
 */
export interface UVGenerationParams {
  /** UV layout type */
  layout: 'planar' | 'cylindrical' | 'spherical' | 'box' | 'unwrap';
  /** Projection axis for planar UVs */
  projectionAxis?: 'x' | 'y' | 'z';
  /** Center point for UV generation */
  center?: Vector3;
  /** Scale factors for UV coordinates */
  scale?: Vector3;
  /** Rotation for UV coordinates */
  rotation?: Vector3;
}

/**
 * Normal generation parameters
 */
export interface NormalGenerationParams {
  /** Whether to generate smooth normals */
  smooth: boolean;
  /** Angle threshold for smooth normal generation */
  angleThreshold?: number;
  /** Whether to normalize normals */
  normalize?: boolean;
}

/**
 * Material assignment parameters
 */
export interface MaterialAssignmentParams {
  /** Base material ID */
  baseMaterialId: number;
  /** Face-specific material IDs */
  faceMaterialIds?: number[];
  /** Material assignment strategy */
  strategy?: 'uniform' | 'per-face' | 'per-material-group';
}

/**
 * Primitive factory interface
 */
export interface PrimitiveFactory {
  /** Create a primitive with the given options */
  create(options: CreatePrimitiveOptions): PrimitiveResult;
  /** Validate the primitive */
  validate(mesh: any): PrimitiveValidationResult;
  /** Get default options for this primitive */
  getDefaultOptions(): CreatePrimitiveOptions;
}

/**
 * Primitive registry entry
 */
export interface PrimitiveRegistryEntry {
  /** Primitive name */
  name: string;
  /** Factory function */
  factory: PrimitiveFactory;
  /** Default options */
  defaultOptions: CreatePrimitiveOptions;
  /** Description */
  description: string;
  /** Category */
  category: 'basic' | 'advanced' | 'game' | 'utility';
} 