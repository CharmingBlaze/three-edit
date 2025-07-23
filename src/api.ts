// Three.js-style API for three-edit
// This provides a clean, intuitive interface similar to Three.js

import { EditableMesh } from './core/EditableMesh';
import { createCube as createCubePrimitive } from './primitives/createCube';
import { createSphere as createSpherePrimitive } from './primitives/createSphere';
import { createCylinder as createCylinderPrimitive } from './primitives/createCylinder';
import { createCone as createConePrimitive } from './primitives/createCone';
import { createPlane as createPlanePrimitive } from './primitives/createPlane';
import { createTorus as createTorusPrimitive } from './primitives/createTorus';
import { createTetrahedron as createTetrahedronPrimitive } from './primitives/createTetrahedron';
import { createOctahedron as createOctahedronPrimitive } from './primitives/createOctahedron';
import { createDodecahedron as createDodecahedronPrimitive } from './primitives/createDodecahedron';
import { createIcosahedron as createIcosahedronPrimitive } from './primitives/createIcosahedron';
import { createTorusKnot as createTorusKnotPrimitive } from './primitives/createTorusKnot';
import { createCircle as createCirclePrimitive } from './primitives/createCircle';
import { createPyramid as createPyramidPrimitive } from './primitives/createPyramid';
import { createCapsule as createCapsulePrimitive } from './primitives/createCapsule';
import { createLowPolySphere as createLowPolySpherePrimitive } from './primitives/createLowPolySphere';
import { createRoundedBox as createRoundedBoxPrimitive } from './primitives/createRoundedBox';
import { createStairs as createStairsPrimitive } from './primitives/createStairs';
import { createRamp as createRampPrimitive } from './primitives/createRamp';
import { createArrow as createArrowPrimitive } from './primitives/createArrow';
import { createNGon as createNGonPrimitive } from './primitives/createNGon';
import { createWedge as createWedgePrimitive } from './primitives/createWedge';
import { createPipe as createPipePrimitive } from './primitives/createPipe';
import { createMobiusStrip as createMobiusStripPrimitive } from './primitives/createMobiusStrip';
import { createHandle as createHandlePrimitive } from './primitives/createHandle';
import { createGreebleBlock as createGreebleBlockPrimitive } from './primitives/createGreebleBlock';
import { createBoundingBox as createBoundingBoxPrimitive } from './primitives/createBoundingBox';
import { createEmpty as createEmptyPrimitive } from './primitives/createEmpty';
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

export function createTetrahedron(options: any = {}) {
  return createTetrahedronPrimitive(options);
}

export function createOctahedron(options: any = {}) {
  return createOctahedronPrimitive(options);
}

export function createDodecahedron(options: any = {}) {
  return createDodecahedronPrimitive(options);
}

export function createIcosahedron(options: any = {}) {
  return createIcosahedronPrimitive(options);
}

export function createTorusKnot(options: any = {}) {
  return createTorusKnotPrimitive(options);
}

export function createCircle(options: any = {}) {
  return createCirclePrimitive(options);
}

export function createPyramid(options: any = {}) {
  return createPyramidPrimitive(options);
}

export function createCapsule(options: any = {}) {
  return createCapsulePrimitive(options);
}

export function createLowPolySphere(options: any = {}) {
  return createLowPolySpherePrimitive(options);
}

export function createRoundedBox(options: any = {}) {
  return createRoundedBoxPrimitive(options);
}

export function createStairs(options: any = {}) {
  return createStairsPrimitive(options);
}

export function createRamp(options: any = {}) {
  return createRampPrimitive(options);
}

export function createArrow(options: any = {}) {
  return createArrowPrimitive(options);
}

export function createNGon(options: any = {}) {
  return createNGonPrimitive(options);
}

export function createWedge(options: any = {}) {
  return createWedgePrimitive(options);
}

export function createPipe(options: any = {}) {
  return createPipePrimitive(options);
}

export function createMobiusStrip(options: any = {}) {
  return createMobiusStripPrimitive(options);
}

export function createHandle(options: any = {}) {
  return createHandlePrimitive(options);
}

export function createGreebleBlock(options: any = {}) {
  return createGreebleBlockPrimitive(options);
}

export function createBoundingBox(options: any = {}) {
  return createBoundingBoxPrimitive(options);
}

export function createEmpty(options: any = {}) {
  return createEmptyPrimitive(options);
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