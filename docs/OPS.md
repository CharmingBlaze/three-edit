# Operations (Ops)

Ops are higher-level editing functions that compose core primitives and manage attribute propagation.

## Implemented Ops
- Transforms: rotate/scale/mirror/align/snap
- Extrude: creates side quads and caps; propagates per-face materials; copies per-corner UVs
- Inset (topological): creates inner cap + rim quads; preserves per-corner UVs and materials
- Bridge: bridgeLoops and core primitive wrappers
- Knife/Cut: `knifeAcrossFace` with UV propagation tests
- Loop Cut: `loopCutQuadRing` with UV propagation tests
- Slide: `slideAlongEdges`
- Normals: compute face/vertex normals
- Delete/Dissolve, mergeFacesToNgon, weldVerticesPositions, separateFaces

## Patterns
- Always get ring information from original topology before edits
- For new faces, set per-corner UVs by mapping to source corners (to-vertex mapping works well for rims/quads)
- Propagate per-face `material` to newly created faces when derived from a source face

## Not Yet Implemented
- Catmull–Clark subdivision (scaffolded, throws)
- Retopo, Remesh, Shrinkwrap, Sculpt/Deform, Booleans
