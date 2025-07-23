/**
 * Type definitions for primitive creation helpers
 */

import { Vector3, Vector2 } from 'three';
import { Vertex, Face } from '../../core';

/**
 * Options for creating vertices
 */
export interface VertexOptions {
  uv?: Vector2;
  normal?: Vector3;
  color?: Vector3;
  userData?: Record<string, any>;
}

/**
 * Options for creating faces
 */
export interface FaceOptions {
  materialIndex?: number;
  normal?: Vector3;
  userData?: Record<string, any>;
}

/**
 * Grid generation options
 */
export interface GridOptions {
  width: number;
  height: number;
  widthSegments?: number;
  heightSegments?: number;
  center?: boolean;
}

/**
 * Circle generation options
 */
export interface CircleOptions {
  radius: number;
  segments: number;
  startAngle?: number;
  endAngle?: number;
  center?: Vector3;
}

/**
 * Sphere generation options
 */
export interface SphereOptions {
  radius: number;
  widthSegments: number;
  heightSegments: number;
  phiStart?: number;
  phiLength?: number;
  thetaStart?: number;
  thetaLength?: number;
  center?: Vector3;
}

/**
 * Cylinder generation options
 */
export interface CylinderOptions {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments: number;
  heightSegments: number;
  openEnded?: boolean;
  thetaStart?: number;
  thetaLength?: number;
  center?: Vector3;
}

/**
 * Torus generation options
 */
export interface TorusOptions {
  radius: number;
  tube: number;
  radialSegments: number;
  tubularSegments: number;
  arc?: number;
  center?: Vector3;
}

/**
 * Box generation options
 */
export interface BoxOptions {
  width: number;
  height: number;
  depth: number;
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
  center?: Vector3;
}

/**
 * Result of primitive creation
 */
export interface PrimitiveResult {
  vertices: Vertex[];
  faces: Face[];
  vertexCount: number;
  faceCount: number;
}

/**
 * Vertex generator function type
 */
export type VertexGenerator = (x: number, y: number, z: number, options?: VertexOptions) => Vertex;

/**
 * Face generator function type
 */
export type FaceGenerator = (indices: number[], options?: FaceOptions) => Face;

/**
 * Geometry builder function type
 */
export type GeometryBuilder = () => PrimitiveResult; 