import { Vector3 } from 'three';
import { EditableMesh, Face } from '../../core/index.ts';

export interface SimplificationOptions {
  targetRatio?: number;
  preserveBoundaries?: boolean;
  preserveUVs?: boolean;
  preserveNormals?: boolean;
  preserveMaterials?: boolean;
  errorThreshold?: number;
  maxIterations?: number;
}

export interface SimplificationResult {
  mesh: EditableMesh;
  originalVertexCount: number;
  originalFaceCount: number;
  finalVertexCount: number;
  finalFaceCount: number;
  reductionRatio: number;
  errorMetric: number;
  iterations: number;
}

export interface EdgeCollapse {
  edge: { v1: number; v2: number };
  cost: number;
  newPosition: Vector3;
  affectedFaces: Face[];
}

export interface SimplificationStatistics {
  vertexCount: number;
  faceCount: number;
  edgeCount: number;
  averageEdgeLength: number;
  averageFaceArea: number;
} 