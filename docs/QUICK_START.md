# Three-Edit Quick Start

Three-Edit is a modular editing library for Three.js. It provides a topology core, adapters, and an "easy" layer with selection, gizmo, and interaction utilities.

## Install

```bash
npm install three-edit three
```

- three is a peer dependency.
- Supported Three.js: >= r155 (tested around r169).

## Importing

- ESM (recommended):
```ts
import { core, io, ops, easy } from 'three-edit';
```

- CommonJS:
```js
const { core, io, ops, easy } = require('three-edit');
```

- UMD / IIFE (global):
```html
<script src="/dist/index.global.js"></script>
<script>
  const { core, io, ops, easy } = window.ThreeEdit;
</script>
```

## Minimal example (ESM)
```ts
import * as THREE from 'three';
import { io, easy } from 'three-edit';

// Create an EditableMesh from a primitive
const editable = io.three.buildPrimitive({ kind: 'box', size: [1,1,1], segments: [1,1,1] });

// Convert to Three.js geometry and mesh
const { geometry } = io.three.toThreeWithMapping(editable);
const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());

// Selection + gizmo
const hub = easy.defaultHub;
const selection = new easy.SelectionManager(hub);
const gizmo = new easy.GizmoManager({
  scene, camera, dom: renderer.domElement,
  meshObj: mesh, editable, selection, hub,
  options: { mode: 'translate', pivot: 'centroid' },
});

// Mouse drag anywhere: InteractionController
const interaction = new easy.InteractionController({
  dom: renderer.domElement, camera, meshObj: mesh, editable, selection, hub,
  getGizmoControl: ()=> gizmo.getControl(),
  onEditedTick: ()=> {/* update derived visuals */},
  onEditedCommit: ()=> {/* recompute normals, save history, etc. */},
});
```

## Transforms (headless)
```ts
const verts = selection.getVerticesForEdit(editable);
if (verts.length){
  const delta = new THREE.Vector3(0.1, 0, 0);
  easy.applyTranslate(verts, delta, mesh, editable);
}
```

## Building from source
- Dev: `npm run demo`
- Library build: `npm run build` (outputs ESM/CJS/UMD + types to `dist/`)
- Tests: `npm run test`
