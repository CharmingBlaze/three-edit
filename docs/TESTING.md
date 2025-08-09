# Testing

We use Vitest with strict TypeScript.

## Running
```sh
npm test
npm run test:watch
```

## Coverage
- Core primitives: splitEdge/splitFace/bridge/collapse/merge
- Ops: Knife, Loop Cut, Slide, Extrude (UV/materials), Inset (topological)
- IO: OBJ/MTL roundtrip, glTF export (includes TANGENT accessor)

## Patterns
- Snapshot per-corner UVs by original half-edge IDs for robust comparisons after topology edits
- Allow cyclic rotation or set equality for face walks where the starting half-edge is unspecified
- Use small helper builders like `MeshBuilder.cube` or face creation via `makeFace`
