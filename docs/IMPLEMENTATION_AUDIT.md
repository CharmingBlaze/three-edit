# IMPLEMENTATION_AUDIT

This audit captures the current state of the Three-Edit mesh library and proposes a safe path to core topology primitives, ops migration, validation, and tests.

## A. Current Modules & Status

- __@mesh/core__ (src/core)
  - Files: `topology/EditableMesh.ts`, `topology/HalfEdge.ts`, `topology/build.ts`, `topology/MeshBuilder.ts`, `topology/MeshQueries.ts`, `topology/MeshSelection.ts`, `topology/MeshValidator.ts`, `topology/loops.ts`, `topology/corners.ts`, attributes (`ScalarAttr`, `Vec2Attr`, `Vec3Attr`, `CornerAttr`, `ColorAttr`), `types.ts`, `ids.ts`, `math.ts`.
  - Compiles: Yes (strict TS).
  - Tests: Indirectly covered via IO round-trips and primitives tests (see below). No dedicated core topology unit tests yet.
  - Three.js usage: None (correct).

- __@mesh/ops__ (src/ops)
  - Files: `vertex.ts`, `edge.ts`, `face.ts`, `surface.ts`, `subdivide.ts`, `bevel.ts` (throws explicit error), `object.ts`, `uv/*` (unwrap, seams, relax), `bridge.ts`, `separate.ts`, `normals.ts`, `commands.ts`, `Command.ts`, `History.ts`.
  - Compiles: Yes.
  - Tests: Covered via IO and MeshBuilder cube tests; no per-op unit tests yet.
  - Three.js usage: None (correct).

- __@mesh/io__ (src/io)
  - Files: `three/FromThree.ts`, `three/ToThree.ts`, `three/primitives.ts`, `export/obj.ts`, `export/mtl.ts`, `export/gltf.ts`, `import/obj.ts` and index barrels.
  - Compiles: Yes.
  - Tests: Yes — roundtrip OBJ/MTL and GLTF export tests present and passing.
  - Three.js usage: Only under `src/io/three/*` (correct).

- __@mesh/easy__ (src/easy)
  - Files: `dispatch.ts` (fluent-style orchestration hook). Minimal.
  - Compiles: Yes. No tests.

- __@mesh/plugins__ (not present)
  - Runtime registry not implemented. Optional.

## B. Data & Topology Snapshot

- __Half-edge structure__
  - Arrays for V/HE/F with free-lists in `EditableMesh.ts`.
  - Edge key map: Not explicitly present as a dedicated module. Deterministic edge lookup is ad-hoc; recommend adding a centralized `EdgeMap`.

- __Attribute domains__
  - Vertex: `position` (Vec3Attr), `normal` (Vec3Attr), optional `color`.
  - Face: `material` (ScalarAttr) and face attributes map.
  - Corner (half-edge): `uv0` (CornerVec2) stored per-corner (preferred). Correct domain.

- __Selection model__
  - `MeshSelection.ts` exists with sets and helpers; not deeply tested.

- __Validator__
  - `MeshValidator.ts` exists; invariants can be run manually. Not yet automatically hooked into history/transactions.

## C. Ops & Features Matrix

- Implemented ops: translate/scale/rotate object (`object.ts`), transform matrix; planar UV unwrap; seam mark/clear; UV relax; normals compute; face delete/dissolve (wrapper); face translate; inset; bridge loops (quad strip); separate faces (copy mesh); vertex translate, weld (position-only); face subdivision (centroid fan); basic surface flags; triangulation for IO; MeshBuilder `cube()`.
- Stubs/missing: robust bevel, knife/cut, loop cut, edge slide, topological merge/weld, topological split, booleans, remesh, retopo, Catmull–Clark subdivision, shrinkwrap (topology-aware).
- Array mutation policy: Many ops currently call `EditableMesh.addFace` or `build.deleteFaces` correctly. Some higher-level edits will require core primitives in `build.ts` to avoid any direct V/HE/F manipulation in ops.

## D. IO & Primitives

- __ToThree/FromThree__
  - Indexed & non-indexed supported. N-gon triangulation: deterministic fan implementation in `io/three/ToThree.ts`.
  - Groups/materials: OBJ/MTL import/export supports `usemtl`; GLTF export supports materials and tangents; normals optional.
  - UV handling: per-corner UVs read/write correctly.

- __Primitives__
  - `MeshBuilder.cube()` implemented (unit cube, 6 quads, CCW winding). Other shapes not implemented.

## E. Gaps vs MVP

- Missing edge key map utilities for deterministic edge lookup and wiring.
- Core topology primitives (`splitEdge`, `splitFace`, `collapseEdge`, `mergeVertices`, `bridgeEdges`) not fully implemented or tested.
- UV propagation during splits/merges needs centralized helpers.
- Lack of unit tests for primitives and ops; no golden JSONs yet.
- Validator not auto-run in dev transactions.
- No file length enforcement (but current files appear under 450 LoC).

## F. Immediate Risks

- __Direct V/HE/F mutations outside `build.ts`__: current ops are mostly safe, but future features (knife, loop cut, slide, merge) would be risky without primitives.
- __Edge key map missing__: non-deterministic or fragile adjacency reconstruction.
- __Tests coverage__: core topology not unit-tested; regression risk for future changes.
- __Three imports__: confined to `src/io/three/*` — OK.

---

# Implementation Plan (high level)

- [ ] __EdgeMap utilities__ — `src/core/topology/EdgeMap.ts`
  - Canonical (minVID, maxVID) → canonical HEID set/get/delete. Update everywhere in `build.ts` when wiring changes.

- [ ] __UV helpers__ — `src/core/topology/buildInternal.ts`
  - Corner UV get/set/interpolate. Attribute resizers. Safe face ring iteration and predecessor lookup.

- [ ] __Core primitives__ — `src/core/topology/build.ts` (≤450 LoC; split helpers to `buildInternal.ts` if needed)
  - `splitEdge(mesh, he, t=0.5): { newVID, leftHE, rightHE }`
  - `splitFace(mesh, f, chord:[VID,VID]): { newFace: FID }` (deterministic diagonal; shortest, then (minVID,maxVID))
  - `collapseEdge(mesh, he, target:"mid"|"origin"|"dest"="mid"): { keptVID, removedVID }`
  - `mergeVertices(mesh, a, b): { keptVID, removedVID }` (update twins/faces, rewire boundary)
  - `deleteFaces(mesh, faces: readonly FID[]): void` (exists but ensure attribute and EdgeMap maintenance)
  - `bridgeEdges(mesh, loopA: HEID[], loopB: HEID[]): { faces: FID[] }` (deterministic ordering)

- [ ] __Ops migration__ — `src/ops/*`
  - Refactor `insetFaces`, `extrudeFaces`, `bevelEdges` (seg=1) to call primitives only. No direct V/HE/F touching.
  - Add clear error for unimplemented branches to avoid TODOs.

- [ ] __Validator in dev__ — `src/ops/History.ts`
  - After `run()` and after `commit()`: `if (DEV_VALIDATE) MeshValidator.check(ctx.mesh);`

- [ ] __Tests__ — `src/testing`
  - `core/build.spec.ts`: unit tests for each primitive across tri/quad/ngon; interior/boundary; UV propagation; deterministic diagonals.
  - Ops tests: `ops/extrude.spec.ts`, `ops/inset.spec.ts`, `ops/bevel.spec.ts`.
  - IO roundtrip: `io/roundtrip.spec.ts` sanity on counts/materials and UV in [0,1].
  - Golden JSON for at least one split/merge case.

- [ ] __Housekeeping__
  - Enforce file size ≤450 LoC; split `*Internal.ts` as needed.
  - ESLint rules: forbid `three` imports outside `src/io/**`; forbid direct V/HE/F writes outside `build.ts` via custom rule/grep.

# Notes
- No renderer/Three imports outside `src/io/**`.
- Per-corner UVs are authoritative; all splits/merges must carry/interpolate UVs.
- Deterministic wiring/diagonals: shortest-first, tiebreak by (minVID,maxVID).
- Keep public API stable; ops surface should not change.
