import { Vector3 } from 'three';
import { EditableMesh } from '../../core/index.ts';

export interface LODLevel {
  level: number;
  mesh: EditableMesh;
  vertexCount: number;
  faceCount: number;
  errorMetric: number;
  distance: number;
}

export interface LODOptions {
  levels?: number;
  reductionFactor?: number;
  errorThreshold?: number;
  preserveUVs?: boolean;
  preserveNormals?: boolean;
  preserveMaterials?: boolean;
}

export interface LODSelectionOptions {
  cameraPosition?: Vector3;
  meshPosition?: Vector3;
  maxDistance?: number;
  qualityPreference?: 'performance' | 'quality' | 'balanced';
}

export interface LODStatistics {
  totalLevels: number;
  originalVertexCount: number;
  originalFaceCount: number;
  reductionRatios: number[];
}

export interface EdgeCollapseInfo {
  edge: { v1: number; v2: number };
  cost: number;
  newPosition: Vector3;
} 