// Three.js-style API for three-edit
// This provides a clean, intuitive interface similar to Three.js

import { EditableMesh } from './core/EditableMesh';
import { createCube as createCubePrimitive } from './primitives/createCube';
import { createSphere as createSpherePrimitive } from './primitives/createSphere';
import { createCylinder as createCylinderPrimitive } from './primitives/createCylinder';
import { createCone as createConePrimitive } from './primitives/createCone';
import { createPlane as createPlanePrimitive } from './primitives/createPlane';
import { createTorus as createTorusPrimitive } from './primitives/createTorus';
import { toBufferGeometry } from './conversion/toBufferGeometry';
import { fromBufferGeometry } from './conversion/fromBufferGeometry';
import { validateMesh as validateMeshFunction } from './validation/validateMesh';
import { exportGLTF } from './exporters/gltf/exportGLTF';
import { MaterialManager } from './materials/MaterialManager';
import { SceneGraph } from './scene/SceneGraph';
import { CommandHistory } from './history/CommandHistory';

// Three.js-style primitive creation
export function createBox(options: any = {}) {
  return createCubePrimitive(options);
}

export function createSphere(options: any = {}) {
  return createSpherePrimitive(options);
}

export function createCylinder(options: any = {}) {
  return createCylinderPrimitive(options);
}

export function createCone(options: any = {}) {
  return createConePrimitive(options);
}

export function createPlane(options: any = {}) {
  return createPlanePrimitive(options);
}

export function createTorus(options: any = {}) {
  return createTorusPrimitive(options);
}

// Three.js-style conversion
export function editableMeshToThreeMesh(mesh: EditableMesh, options: any = {}) {
  const geometry = toBufferGeometry(mesh, options);
  return geometry;
}

export function threeMeshToEditableMesh(geometry: any, options: any = {}) {
  return fromBufferGeometry(geometry, options);
}

// Three.js-style validation
export function validateMesh(mesh: EditableMesh) {
  return validateMeshFunction(mesh);
}

// Three.js-style import/export
export function exportToGLTF(mesh: EditableMesh, options: any = {}) {
  return exportGLTF(mesh, options);
}

// Three.js-style managers
export function createMaterialManager(mesh: EditableMesh) {
  return new MaterialManager(mesh);
}

export function createSceneGraph() {
  return new SceneGraph();
}

export function createCommandHistory(mesh: EditableMesh, options: any = {}) {
  return new CommandHistory(mesh, options);
}

// Export core classes
export { EditableMesh, Vertex, Edge, Face } from './core';
export { MaterialManager } from './materials/MaterialManager';
export { SceneGraph } from './scene/SceneGraph'; 