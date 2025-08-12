# IO and Adapters

## OBJ/MTL
- Exporter: supports v, vt, f (v/vt), usemtl, optional mtllib
- Importer: parses v/vt/vn/usemtl, triangulates faces, accumulates vertex normals
- MTL exporter: minimal material records

## glTF (GLB)
- Minimal exporter emitting POSITION, optional NORMAL, TEXCOORD_0, and TANGENT (VEC4)
- Tangents computed if UVs present

## Three.js Adapters
- `src/io/three/` provides conversion between `EditableMesh` and `THREE.BufferGeometry`
- Backed primitives available under `src/io/three/primitives.ts` for external integrations

## Examples
See `README.md` for code snippets covering OBJ/MTL and glTF exports.
