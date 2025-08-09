# Core Topology Primitives

Core primitives live in `src/core/topology/build.ts`. Ops must delegate to these for any topology edits.

## Implemented
- splitEdge
- splitFace
- bridgeEdges
- mergeVertices
- collapseEdge
- makeFace
- deleteFaces

## Attribute Rules
- When splitting, copy per-corner UVs deterministically from original corners
- When creating faces, initialize per-corner UVs explicitly from sources
- Per-face `material` should be copied when duplicating or creating related faces

## Determinism
- Use original half-edge IDs to snapshot and remap attributes in tests
- Avoid reliance on incidental orderings; tests should accept cyclic rotations when necessary
