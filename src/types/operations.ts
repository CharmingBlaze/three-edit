/**
 * Operations Type Definitions
 * Comprehensive TypeScript types for editing operations and transformations
 */

import { Vector3, Matrix4, Quaternion } from 'three';

/**
 * Base operation interface
 */
export interface BaseOperation {
  id: string;
  name: string;
  type: string;
  timestamp: number;
  userData?: Record<string, any>;
}

/**
 * Operation result interface
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  modifiedElements?: {
    vertices?: number[];
    edges?: number[];
    faces?: number[];
  };
}

/**
 * Transform operation interface
 */
export interface TransformOperation extends BaseOperation {
  type: 'transform';
  translation?: Vector3;
  rotation?: Vector3 | Quaternion;
  scale?: Vector3;
  pivot?: Vector3;
  matrix?: Matrix4;
}

/**
 * Extrusion operation interface
 */
export interface ExtrusionOperation extends BaseOperation {
  type: 'extrusion';
  direction: Vector3;
  distance: number;
  scale?: Vector3;
  rotation?: Vector3;
  generateCaps?: boolean;
  generateSides?: boolean;
  selectedFaces?: number[];
  selectedEdges?: number[];
  selectedVertices?: number[];
}

/**
 * Bevel operation interface
 */
export interface BevelOperation extends BaseOperation {
  type: 'bevel';
  amount: number;
  segments: number;
  profile?: number;
  selectedFaces?: number[];
  selectedEdges?: number[];
  selectedVertices?: number[];
}

/**
 * Inset operation interface
 */
export interface InsetOperation extends BaseOperation {
  type: 'inset';
  amount: number;
  segments: number;
  selectedFaces?: number[];
}

/**
 * Bridge operation interface
 */
export interface BridgeOperation extends BaseOperation {
  type: 'bridge';
  edge1Index: number;
  edge2Index: number;
  segments: number;
  twist: number;
  profile?: number;
}

/**
 * Knife operation interface
 */
export interface KnifeOperation extends BaseOperation {
  type: 'knife';
  startPoint: Vector3;
  endPoint: Vector3;
  selectedFaces?: number[];
  cutThrough?: boolean;
}

/**
 * Loop cut operation interface
 */
export interface LoopCutOperation extends BaseOperation {
  type: 'loop-cut';
  edgeLoop: number[];
  cuts: number;
  selectedEdges?: number[];
}

/**
 * Boolean operation interface
 */
export interface BooleanOperation extends BaseOperation {
  type: 'boolean';
  operation: 'union' | 'intersection' | 'difference';
  targetMesh: any; // EditableMesh
  tolerance?: number;
}

/**
 * Subdivision operation interface
 */
export interface SubdivisionOperation extends BaseOperation {
  type: 'subdivision';
  method: 'catmull-clark' | 'loop' | 'butterfly' | 'simple';
  iterations: number;
  selectedFaces?: number[];
}

/**
 * Triangulation operation interface
 */
export interface TriangulationOperation extends BaseOperation {
  type: 'triangulation';
  method: 'ear-clipping' | 'fan' | 'strip';
  selectedFaces?: number[];
}

/**
 * Merge operation interface
 */
export interface MergeOperation extends BaseOperation {
  type: 'merge';
  threshold: number;
  mergeByPosition?: boolean;
  mergeByUV?: boolean;
  mergeByNormal?: boolean;
  selectedElements?: {
    vertices?: number[];
    edges?: number[];
    faces?: number[];
  };
}

/**
 * Selection operation interface
 */
export interface SelectionOperation extends BaseOperation {
  type: 'selection';
  mode: 'vertex' | 'edge' | 'face' | 'mixed';
  method: 'ray' | 'box' | 'circle' | 'lasso' | 'connected' | 'similar';
  selectedElements: {
    vertices?: number[];
    edges?: number[];
    faces?: number[];
  };
  options?: {
    radius?: number;
    tolerance?: number;
    includeBackfaces?: boolean;
  };
}

/**
 * Material assignment operation interface
 */
export interface MaterialAssignmentOperation extends BaseOperation {
  type: 'material-assignment';
  materialIndex: number;
  selectedFaces?: number[];
}

/**
 * UV operation interface
 */
export interface UVOperation extends BaseOperation {
  type: 'uv';
  method: 'planar' | 'cylindrical' | 'spherical' | 'cubic' | 'unwrap';
  selectedFaces?: number[];
  options?: {
    projection?: Vector3;
    center?: Vector3;
    scale?: Vector3;
    rotation?: Vector3;
  };
}

/**
 * Normal operation interface
 */
export interface NormalOperation extends BaseOperation {
  type: 'normal';
  method: 'calculate' | 'smooth' | 'flip' | 'set';
  selectedFaces?: number[];
  options?: {
    angle?: number;
    direction?: Vector3;
  };
}

/**
 * Deformation operation interface
 */
export interface DeformationOperation extends BaseOperation {
  type: 'deformation';
  method: 'bend' | 'twist' | 'taper' | 'noise' | 'displace';
  selectedElements?: {
    vertices?: number[];
    edges?: number[];
    faces?: number[];
  };
  options?: {
    axis?: Vector3;
    center?: Vector3;
    amount?: number;
    frequency?: number;
    amplitude?: number;
    seed?: number;
  };
}

/**
 * Array operation interface
 */
export interface ArrayOperation extends BaseOperation {
  type: 'array';
  count: number;
  offset: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  selectedElements?: {
    vertices?: number[];
    edges?: number[];
    faces?: number[];
  };
}

/**
 * Mirror operation interface
 */
export interface MirrorOperation extends BaseOperation {
  type: 'mirror';
  axis: 'x' | 'y' | 'z';
  center?: Vector3;
  merge?: boolean;
  selectedElements?: {
    vertices?: number[];
    edges?: number[];
    faces?: number[];
  };
}

/**
 * Symmetry operation interface
 */
export interface SymmetryOperation extends BaseOperation {
  type: 'symmetry';
  axis: 'x' | 'y' | 'z';
  center?: Vector3;
  selectedElements?: {
    vertices?: number[];
    edges?: number[];
    faces?: number[];
  };
}

/**
 * Optimization operation interface
 */
export interface OptimizationOperation extends BaseOperation {
  type: 'optimization';
  mergeVertices?: boolean;
  mergeFaces?: boolean;
  removeOrphanedVertices?: boolean;
  triangulate?: boolean;
  optimizeTopology?: boolean;
  tolerance?: number;
}

/**
 * Repair operation interface
 */
export interface RepairOperation extends BaseOperation {
  type: 'repair';
  fixDuplicateVertices?: boolean;
  fixOrphanedVertices?: boolean;
  fixDegenerateFaces?: boolean;
  fixNonManifoldEdges?: boolean;
  fixNormals?: boolean;
  fixUVs?: boolean;
  tolerance?: number;
}

/**
 * Analysis operation interface
 */
export interface AnalysisOperation extends BaseOperation {
  type: 'analysis';
  includeBoundingBox?: boolean;
  includeSurfaceArea?: boolean;
  includeVolume?: boolean;
  includeTopology?: boolean;
  includeNormals?: boolean;
  includeUVs?: boolean;
  tolerance?: number;
}

/**
 * Import operation interface
 */
export interface ImportOperation extends BaseOperation {
  type: 'import';
  format: 'obj' | 'stl' | 'ply' | 'gltf' | 'glb';
  data: string | ArrayBuffer;
  options?: {
    generateNormals?: boolean;
    generateUVs?: boolean;
    generateColors?: boolean;
    scale?: number;
    center?: boolean;
    flipNormals?: boolean;
    flipUVs?: boolean;
  };
}

/**
 * Export operation interface
 */
export interface ExportOperation extends BaseOperation {
  type: 'export';
  format: 'obj' | 'stl' | 'ply' | 'gltf' | 'glb';
  options?: {
    includeNormals?: boolean;
    includeUVs?: boolean;
    includeColors?: boolean;
    includeUserData?: boolean;
    binary?: boolean;
    pretty?: boolean;
  };
}

/**
 * History operation interface
 */
export interface HistoryOperation extends BaseOperation {
  type: 'history';
  action: 'undo' | 'redo' | 'clear';
  operations?: BaseOperation[];
}

/**
 * Group operation interface
 */
export interface GroupOperation extends BaseOperation {
  type: 'group';
  action: 'create' | 'ungroup' | 'select';
  selectedElements?: {
    vertices?: number[];
    edges?: number[];
    faces?: number[];
  };
  groupName?: string;
}

/**
 * Hide/Show operation interface
 */
export interface VisibilityOperation extends BaseOperation {
  type: 'visibility';
  action: 'hide' | 'show' | 'isolate';
  selectedElements?: {
    vertices?: number[];
    edges?: number[];
    faces?: number[];
  };
}

/**
 * Lock/Unlock operation interface
 */
export interface LockOperation extends BaseOperation {
  type: 'lock';
  action: 'lock' | 'unlock';
  selectedElements?: {
    vertices?: number[];
    edges?: number[];
    faces?: number[];
  };
}

/**
 * Union type for all operations
 */
export type Operation = 
  | TransformOperation
  | ExtrusionOperation
  | BevelOperation
  | InsetOperation
  | BridgeOperation
  | KnifeOperation
  | LoopCutOperation
  | BooleanOperation
  | SubdivisionOperation
  | TriangulationOperation
  | MergeOperation
  | SelectionOperation
  | MaterialAssignmentOperation
  | UVOperation
  | NormalOperation
  | DeformationOperation
  | ArrayOperation
  | MirrorOperation
  | SymmetryOperation
  | OptimizationOperation
  | RepairOperation
  | AnalysisOperation
  | ImportOperation
  | ExportOperation
  | HistoryOperation
  | GroupOperation
  | VisibilityOperation
  | LockOperation;

/**
 * Operation batch interface
 */
export interface OperationBatch {
  id: string;
  name: string;
  operations: Operation[];
  timestamp: number;
  userData?: Record<string, any>;
}

/**
 * Operation history interface
 */
export interface OperationHistory {
  operations: Operation[];
  currentIndex: number;
  maxSize: number;
}

/**
 * Operation context interface
 */
export interface OperationContext {
  mesh: any; // EditableMesh
  selection?: {
    vertices?: number[];
    edges?: number[];
    faces?: number[];
  };
  options?: Record<string, any>;
  userData?: Record<string, any>;
}

/**
 * Operation validator interface
 */
export interface OperationValidator {
  validate(operation: Operation, context: OperationContext): OperationResult<boolean>;
}

/**
 * Operation executor interface
 */
export interface OperationExecutor {
  execute(operation: Operation, context: OperationContext): OperationResult<any>;
  canExecute(operation: Operation, context: OperationContext): boolean;
}

/**
 * Operation factory interface
 */
export interface OperationFactory {
  create(type: string, options: Record<string, any>): Operation;
  getSupportedTypes(): string[];
} 