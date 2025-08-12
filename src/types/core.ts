/**
 * Core type definitions for three-edit
 * Type definitions for core classes and their properties
 */

import { Vector3, Matrix4 } from 'three';
import { UVCoord } from '../uv/types';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * User data that can be attached to mesh elements
 * Provides a structured way to store custom data
 */
export interface UserData {
  /** Custom string values */
  [key: string]: string | number | boolean | Vector3 | UVCoord | object | undefined;
}

/**
 * Options for creating a new EditableMesh
 */
export interface EditableMeshOptions {
  /** Unique identifier for the mesh */
  id?: string;
  /** User-friendly name for the mesh */
  name?: string;
  /** Initial array of vertices */
  vertices?: Vertex[];
  /** Initial array of edges */
  edges?: Edge[];
  /** Initial array of faces */
  faces?: Face[];
  /** Initial transformation matrix */
  matrix?: Matrix4;
}

/**
 * Options for creating a new Vertex
 */
export interface VertexOptions {
  /** Vertex position */
  position?: Vector3;
  /** Vertex normal */
  normal?: Vector3;
  /** UV coordinates */
  uv?: UVCoord;
  /** Vertex color */
  color?: Vector3;
  /** Custom user data */
  userData?: UserData;
}

/**
 * Options for creating a new Face
 */
export interface FaceOptions {
  /** UV coordinates for each vertex in the face */
  faceVertexUvs?: UVCoord[];
  /** Material index for the face */
  materialIndex?: number;
  /** Normal vector for the face */
  normal?: Vector3;
  /** Custom user data */
  userData?: UserData;
}

/**
 * Options for creating a new Edge
 */
export interface EdgeOptions {
  /** Custom user data */
  userData?: UserData;
}

/**
 * Result of mesh validation operations
 */
export interface MeshValidationResult {
  /** Whether the mesh is valid */
  isValid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
  /** Detailed validation information */
  details?: {
    vertexCount: number;
    edgeCount: number;
    faceCount: number;
    orphanedVertices: number[];
    nonManifoldEdges: number[];
    boundaryEdges: number[];
  };
}

/**
 * Options for mesh operations
 */
export interface MeshOperationOptions {
  /** Whether to validate the mesh after the operation */
  validate?: boolean;
  /** Whether to update normals after the operation */
  updateNormals?: boolean;
  /** Whether to update UVs after the operation */
  updateUVs?: boolean;
  /** Custom user data to attach */
  userData?: UserData;
}

/**
 * Result of mesh statistics calculation
 */
export interface MeshStatistics {
  /** Number of vertices */
  vertexCount: number;
  /** Number of edges */
  edgeCount: number;
  /** Number of faces */
  faceCount: number;
  /** Number of triangles (after triangulation) */
  triangleCount: number;
  /** Surface area of the mesh */
  surfaceArea: number;
  /** Volume of the mesh (if closed) */
  volume?: number;
  /** Bounding box dimensions */
  boundingBox: {
    min: Vector3;
    max: Vector3;
    size: Vector3;
    center: Vector3;
  };
  /** Material distribution */
  materialDistribution: Record<number, number>;
  /** Topology information */
  topology: {
    isWatertight: boolean;
    isManifold: boolean;
    genus: number;
    connectedComponents: number;
  };
}

/**
 * Options for mesh transformation operations
 */
export interface TransformOptions {
  /** Whether to apply the transformation immediately */
  apply?: boolean;
  /** Whether to update normals after transformation */
  updateNormals?: boolean;
  /** Whether to update bounding box after transformation */
  updateBoundingBox?: boolean;
  /** Custom user data to attach */
  userData?: UserData;
}

/**
 * Options for mesh selection operations
 */
export interface SelectionOptions {
  /** Whether to clear existing selection */
  clear?: boolean;
  /** Whether to add to existing selection */
  add?: boolean;
  /** Whether to remove from existing selection */
  remove?: boolean;
  /** Custom user data to attach */
  userData?: UserData;
}

/**
 * Result of mesh query operations
 */
export interface QueryResult<T> {
  /** The found elements */
  elements: T[];
  /** Number of elements found */
  count: number;
  /** Whether the query was successful */
  success: boolean;
  /** Error message if the query failed */
  error?: string;
}

/**
 * Options for mesh export operations
 */
export interface ExportOptions {
  /** Format to export to */
  format: 'stl' | 'obj' | 'ply' | 'gltf' | 'glb';
  /** Whether to include normals */
  includeNormals?: boolean;
  /** Whether to include UVs */
  includeUVs?: boolean;
  /** Whether to include colors */
  includeColors?: boolean;
  /** Whether to include materials */
  includeMaterials?: boolean;
  /** Custom user data to attach */
  userData?: UserData;
}

/**
 * Options for mesh import operations
 */
export interface ImportOptions {
  /** Whether to validate the imported mesh */
  validate?: boolean;
  /** Whether to normalize the mesh */
  normalize?: boolean;
  /** Whether to center the mesh */
  center?: boolean;
  /** Scale factor to apply */
  scale?: number;
  /** Custom user data to attach */
  userData?: UserData;
} 