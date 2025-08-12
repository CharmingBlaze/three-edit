# Attributes

## Types
- Per-vertex: positions, optional normals
- Per-corner: UVs (TEXCOORD_0), tangents derived on export
- Per-face: material id (scalar)

## APIs
- `ScalarAttr`: typed scalar container with `get(id)`, `set(id, value)`, `resize(n)`
- `getCornerUV(mesh, he)` / `setCornerUV(mesh, he, uv)`

## Propagation Guidelines
- Copy per-corner UVs from the source corner linked by to-vertex or by original half-edge IDs
- When creating a fan or rim, duplicate boundary UVs onto inner corners as needed
- Always resize attributes to include new IDs before setting

## Testing Attributes
- Use half-edge ID snapshots to compare UVs across topology changes (knife/loopcut)
- Accept cyclic rotation for face walks where start half-edge is unspecified
