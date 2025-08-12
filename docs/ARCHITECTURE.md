# Architecture Overview

The system centers on an editable half-edge mesh with typed attributes, a small set of core topology primitives, and higher-level operations (ops) that delegate to these primitives. IO adapters allow import/export and conversion to Three.js.

## Layers
- Core (`src/core/`)
  - `topology/EditableMesh`: half-edge mesh, vertex/edge/face tables
  - `attributes/`: typed attribute layers (e.g., `ScalarAttr`)
  - `topology/build.ts`: core topology primitives (make/split/merge/etc.)
  - Utilities: `EdgeMap`, `Clusters`, UV helpers
- Ops (`src/ops/`)
  - High-level editors: extrude, inset, bridge, knife, loop cut, slide, transforms
  - Always delegate structural edits to core primitives
- Edit (`src/edit/`)
  - Commands, history, selection resolver, preview scaffolds
- IO (`src/io/`)
  - OBJ/MTL/glTF exporters and OBJ importer; Three.js adapters

## Data Model
- Half-edge representation with branded IDs: `VID`, `HEID`, `FID`
- Per-corner UVs stored on half-edges; per-face material on face attribute
- Attributes are typed containers that can resize and map IDs → values

## Principles
- Single source of truth: only core primitives mutate topology
- Attribute correctness: ops must propagate per-corner/per-face attributes
- Determinism: primitive rewiring must be stable and testable
- Headless: no Three.js dependencies in core or ops

## Extensibility
- Primitives registry (`src/plugins/primitives-registry.ts`)
- Three.js-backed primitives (`src/io/three/primitives.ts`)
- Operators can be composed (e.g., bridge after split/knife)
