# Topology

## Half-Edge Basics
- Vertex (`VID`), Half-Edge (`HEID`), Face (`FID`)
- Each half-edge has `v` (to-vertex), `next`, `twin`, and `f` (face)
- Face stores one incident `he` to walk boundary

## Corner Attributes
- Per-corner UVs are stored per half-edge corner
- Helpers: `getCornerUV(mesh, he)`, `setCornerUV(mesh, he, uv)`

## Traversal Patterns
- Walk a face boundary via its `he` and successive `next`
- Walk vertex fan via incident edges (through `twin.next`)

## Edge Map
- `EdgeMap` builds canonical keys (min,max) for quick adjacency queries

## Clusters
- `Clusters.ts` groups positions within epsilon; used for selection expansion and weld-like behavior
