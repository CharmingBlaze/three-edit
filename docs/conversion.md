# Conversion

Conversion utilities are used to convert an `EditableMesh` to and from other data structures, such as `THREE.BufferGeometry`.

## `toBufferGeometry`

Converts an `EditableMesh` into a `THREE.BufferGeometry`, which can be used directly with Three.js for rendering.

### Signature

```typescript
function toBufferGeometry(
  mesh: EditableMesh,
  options?: ToBufferGeometryOptions
): THREE.BufferGeometry;
```

### Parameters

- `mesh`: The `EditableMesh` to convert.
- `options`: Optional `ToBufferGeometryOptions`:
  - `includeNormals?: boolean`: If `true`, includes vertex normals in the geometry. Defaults to `true`.
  - `includeUVs?: boolean`: If `true`, includes UV coordinates. Defaults to `true`.
  - `includeMaterialIndices?: boolean`: If `true`, adds a custom `materialIndex` attribute to the geometry, which is useful for multi-material meshes. Defaults to `true`.

### Returns

A `THREE.BufferGeometry` instance representing the `EditableMesh`.

### Example

```typescript
import { createCube, toBufferGeometry } from 'three-edit';
import * as THREE from 'three';

const editableMesh = createCube();
const geometry = toBufferGeometry(editableMesh);

const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(geometry, material);

// Now you can add the mesh to your Three.js scene
// scene.add(mesh);
```

## `fromBufferGeometry`

Converts a `THREE.BufferGeometry` into an `EditableMesh`. This is useful for importing existing Three.js geometries for editing.

### Signature

```typescript
function fromBufferGeometry(
  geometry: THREE.BufferGeometry,
  options?: FromBufferGeometryOptions
): EditableMesh;
```

### Parameters

- `geometry`: The `THREE.BufferGeometry` to convert.
- `options`: Optional `FromBufferGeometryOptions`:
  - `importNormals?: boolean`: If `true`, imports vertex normals. Defaults to `true`.
  - `importUVs?: boolean`: If `true`, imports UV coordinates. Defaults to `true`.
  - `importMaterialIndices?: boolean`: If `true`, imports material indices. Defaults to `true`.
  - `name?: string`: A name for the new `EditableMesh`.

### Returns

A new `EditableMesh` instance.

### Example

```typescript
import { fromBufferGeometry } from 'three-edit';
import * as THREE from 'three';

const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const editableMesh = fromBufferGeometry(geometry);

// Now you can edit the mesh
```

## `mergeVertices`

Merges duplicate vertices in an `EditableMesh`. This is often useful after converting from a `BufferGeometry`, as geometries are often "unwelded" (i.e., have duplicate vertices at the same position) for rendering purposes.

### Signature

```typescript
function mergeVertices(
  mesh: EditableMesh,
  threshold?: number
): EditableMesh;
```

### Parameters

- `mesh`: The `EditableMesh` to process.
- `threshold`: The distance threshold for considering vertices as duplicates. Defaults to `0.0001`.

### Returns

The processed `EditableMesh` (modified in place).

## `toJSON`

Serializes an `EditableMesh` into a JSON object, which can be easily stored or transmitted. This is useful for saving and loading mesh data.

### Signature

```typescript
function toJSON(
  mesh: EditableMesh,
  options?: ToJSONOptions
): MeshJSON;
```

### Parameters

- `mesh`: The `EditableMesh` to serialize.
- `options`: Optional `ToJSONOptions`:
  - `includeMetadata?: boolean`: If `true`, includes metadata in the JSON output. Defaults to `true`.
  - `metadata?: Record<string, any>`: Custom metadata to include.

### Returns

A `MeshJSON` object representing the `EditableMesh`.

### `toJSONString`

A convenience function that serializes an `EditableMesh` directly to a JSON string.

### Signature

```typescript
function toJSONString(
  mesh: EditableMesh,
  options?: ToJSONOptions,
  space?: number
): string;
```

### Parameters

- `mesh`: The `EditableMesh` to serialize.
- `options`: Optional `ToJSONOptions`.
- `space`: The number of spaces to use for indentation in the JSON string.

### Example

```typescript
import { createCube, toJSONString } from 'three-edit';

const cube = createCube();
const jsonString = toJSONString(cube, {}, 2);

// You can now save the jsonString to a file
```

## `fromJSON`

Deserializes a `MeshJSON` object into an `EditableMesh`. This is the counterpart to `toJSON` and is used for loading mesh data.

### Signature

```typescript
function fromJSON(
  json: MeshJSON,
  options?: FromJSONOptions
): EditableMesh;
```

### Parameters

- `json`: The `MeshJSON` object to deserialize.
- `options`: Optional `FromJSONOptions`:
  - `validate?: boolean`: If `true`, validates the JSON structure before parsing. Defaults to `true`.
  - `preserveId?: boolean`: If `true`, preserves the mesh ID from the JSON object. Defaults to `false`.

### Returns

A new `EditableMesh` instance.

### `fromJSONString`

A convenience function that deserializes an `EditableMesh` directly from a JSON string.

### Signature

```typescript
function fromJSONString(
  jsonString: string,
  options?: FromJSONOptions
): EditableMesh;
```

### Example

```typescript
import { fromJSONString } from 'three-edit';

// Assuming jsonString is a valid mesh JSON from a file or network
const editableMesh = fromJSONString(jsonString);

// Now you can edit the mesh
```
