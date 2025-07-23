import { EditableMesh } from '../core/EditableMesh';
import { Vector3 } from 'three';
import * as THREE from 'three';

/**
 * ThreeEditJS - A JavaScript-friendly wrapper for three-edit
 */
declare const ThreeEditJS: {
  // Core functionality
  createMesh: () => EditableMesh;
  toBufferGeometry: (mesh: EditableMesh) => THREE.BufferGeometry;
  fromBufferGeometry: (geometry: THREE.BufferGeometry) => EditableMesh;
  
  // Primitives
  createCube: (options?: any) => EditableMesh;
  createSphere: (options?: any) => EditableMesh;
  createCylinder: (options?: any) => EditableMesh;
  createCone: (options?: any) => EditableMesh;
  createArrow: (options?: any) => EditableMesh;
  
  // Editing operations
  extrudeFace: (mesh: EditableMesh, face: any, options?: any) => void;
  bevelEdge: (mesh: EditableMesh, edge: any, options?: any) => void;
  bevelVertex: (mesh: EditableMesh, vertex: any, options?: any) => void;
  subdivide: (mesh: EditableMesh, options?: any) => void;
  insetFace: (mesh: EditableMesh, face: any, options?: any) => void;
  
  // Selection utilities
  selectFacesByNormal: (mesh: EditableMesh, normal: Vector3, threshold?: number) => any[];
  selectEdgeLoop: (mesh: EditableMesh, startEdge: any) => any[];
  selectEdgeRing: (mesh: EditableMesh, startEdge: any) => any[];
  
  // Utility functions
  calculateFaceNormal: (face: any) => Vector3;
  calculateFaceCenter: (face: any) => Vector3;
  
  // Helper methods for JavaScript users
  createFromThreeGeometry: (geometry: THREE.BufferGeometry) => EditableMesh;
  applyOperation: (mesh: EditableMesh, operation: Function, ...args: any[]) => THREE.BufferGeometry;
};

export default ThreeEditJS;
