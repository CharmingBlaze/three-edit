# three-edit

Headless, modular editing core for building Three.js-based 3D/level editors. Includes a half-edge mesh, typed attribute layers, command/history, operator scaffolds, UV utilities, adapters for Three.js, and a minimal scene layer.

## Highlights
- Headless core: no Three imports in `src/core/`, `src/ops/`, `src/edit/`
- Half-edge topology with per-vertex and per-corner attributes (UV ready)
- Command/History with merge support (e.g., Translate)
- Operator scaffolds (translate/extrude/bevel/subdivide) with preview pipeline
- Three.js adapters in `src/io/three/`
- Minimal scene utilities and runtime helpers
- Vitest tests and strict TS config

## Install
```sh
npm i
```

## Build
```sh
npm run build
```

## Test
```sh
npm test
```

## Example (headless → Three)
```ts
import * as THREE from "three";
import { core, edit, ops, io } from "three-edit";

const mesh = new core.topology.EditableMesh();
core.topology.MeshBuilder.quad(mesh, [-.5,-.5,0],[.5,-.5,0],[.5,.5,0],[-.5,.5,0]);

const selection = core.topology.makeSelection();
selection.mode = "vertex";
selection.verts.add(0); selection.verts.add(1);

const ctx: edit.EditContext = {
  mesh,
  selection,
  history: new ops.History(),
  constraints: new edit.Constraints(),
  snapping: new edit.Snapping(),
  preview: new edit.Preview(),
  events: new (class { on(){} emit(){} })() as any
};

const tools = new edit.ToolManager(ctx);
const translate = new edit.operators.TranslateOperator();
tools.start(translate, {screenX:0,screenY:0,rayOrigin:[0,0,1],rayDir:[0,0,-1]});
tools.move({screenX:0,screenY:0,rayOrigin:[0.2,0.3,1],rayDir:[0,0,-1]});
tools.up();

const geom = io.three.toThreeBufferGeometry(mesh);
const mat = new THREE.MeshStandardMaterial({ metalness:0.1, roughness:0.8 });
const threeMesh = new THREE.Mesh(geom, mat);
// scene.add(threeMesh);
```

## IO Examples (OBJ/MTL and glTF)

```ts
import { core, io } from "three-edit";

// Build a simple mesh
const mesh = new core.topology.EditableMesh();
const a = mesh.addVertex([0,0,0]);
const b = mesh.addVertex([1,0,0]);
const c = mesh.addVertex([0,1,0]);
const f = mesh.addFace([a,b,c]);
// Assign UVs per corner
let he = mesh.faces()[f]!.he; const hes = mesh.halfEdges();
mesh.uv0.set(he, [0,0]); he = hes[he]!.next;
mesh.uv0.set(he, [1,0]); he = hes[he]!.next;
mesh.uv0.set(he, [0,1]);

// Export OBJ (optionally with mtllib) and MTL
const { objText, mtlFileName } = io.export_.obj.exportOBJ(mesh, { mtlFileName: "example.mtl" });
const mtlText = io.export_.mtl.exportMTL([{ name: "mat_0", Kd: [0.8, 0.8, 0.8] }]);

// Import OBJ back to mesh (supports v/vt/vn/usemtl; triangulates faces)
const imported = io.import_.importOBJ(objText);

// Export glTF (GLB). Includes POSITION, optional NORMAL, TEXCOORD_0, and TANGENT (VEC4)
const glb = io.export_.gltf.exportGLTF(mesh);
// In Node: fs.writeFileSync("mesh.glb", Buffer.from(new Uint8Array(glb)));
```

### UV Relax example

```ts
import { core, ops } from "three-edit";

const mesh = new core.topology.EditableMesh();
core.topology.MeshBuilder.quad(mesh, [-.5,-.5,0],[.5,-.5,0],[.5,.5,0],[-.5,.5,0]);
// Ensure uv0 exists for each corner (MeshBuilder.quad sets uv0 by default)

// Relax per-corner UVs while preserving seams and pinning boundaries
ops.uv.relaxIslands(mesh, {
  iterations: 10,
  lambda: 0.5,
  pinBoundary: true,
  epsilon: 1e-5
});
```

## Documentation

- [Setup](docs/SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Topology](docs/TOPOLOGY.md)
- [Core Primitives](docs/PRIMITIVES.md)
- [Operations (Ops)](docs/OPS.md)
- [Attributes](docs/ATTRIBUTES.md)
- [IO and Adapters](docs/IO.md)
- [Testing](docs/TESTING.md)
- [Contributing](docs/CONTRIBUTING.md)

## Roadmap
- Fill Extrude/Bevel/Subdivide operators and ops
- Triangulation for `toThreeBufferGeometry`
- Validator checks in dev builds
- More tests and golden snapshots
