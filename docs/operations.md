# Operations

Operations are functions that modify an `EditableMesh` in some way. These can range from simple transformations to more complex modeling operations.

## extrudeFace

Extrudes a face of the mesh, creating new geometry.

### Signature

```typescript
function extrudeFace(
  mesh: EditableMesh,
  faceIndex: number,
  options?: {
    distance?: number;
    scale?: number | { x: number; y: number };
    keepOriginal?: boolean;
  }
): number;
```

### Parameters

- `mesh`: The `EditableMesh` to modify.
- `faceIndex`: The index of the face to extrude.
- `options`: An optional object with the following properties:
  - `distance`: The distance to extrude along the face normal (default: `1`).
  - `scale`: A scale factor for the extruded face (default: `1`). Can be a single number or an object with `x` and `y` properties for non-uniform scaling.
  - `keepOriginal`: Whether to keep the original face after extrusion (default: `false`).

### Returns

The index of the newly created face, or `-1` if the operation failed.

### Example

```typescript
import { createCube, extrudeFace, selectFace } from 'three-edit';

const cube = createCube();

// Select the top face (assuming it's face index 2)
const topFaceIndex = 2;

// Extrude the top face
extrudeFace(cube, topFaceIndex, { distance: 1.5, scale: 0.8 });
```

## Boolean Operations

**Note:** The current implementation of boolean operations is a basic placeholder. For production use, a more robust CSG (Constructive Solid Geometry) library would be required.

### union

Performs a boolean union operation between two meshes.

#### Signature

```typescript
function union(
  meshA: EditableMesh,
  meshB: EditableMesh,
  options?: BooleanOptions
): BooleanResult;
```

#### Parameters

- `meshA`: The first `EditableMesh`.
- `meshB`: The second `EditableMesh`.
- `options`: Optional `BooleanOptions`.

#### Returns

A `BooleanResult` object containing the unioned mesh.

#### Example

```typescript
import { createCube, createSphere, union } from 'three-edit';

const cube = createCube();
const sphere = createSphere({ radius: 0.8 });

const result = union(cube, sphere);
```

### subtract

Performs a boolean subtract operation (A - B).

#### Signature

```typescript
function subtract(
  meshA: EditableMesh,
  meshB: EditableMesh,
  options?: BooleanOptions
): BooleanResult;
```

#### Parameters

- `meshA`: The minuend `EditableMesh`.
- `meshB`: The subtrahend `EditableMesh`.
- `options`: Optional `BooleanOptions`.

#### Returns

A `BooleanResult` object containing the subtracted mesh.

#### Example

```typescript
import { createCube, createSphere, subtract } from 'three-edit';

const cube = createCube();
const sphere = createSphere({ radius: 0.8 });

const result = subtract(cube, sphere);
```

### intersect

Performs a boolean intersect operation between two meshes.

#### Signature

```typescript
function intersect(
  meshA: EditableMesh,
  meshB: EditableMesh,
  options?: BooleanOptions
): BooleanResult;
```

#### Parameters

- `meshA`: The first `EditableMesh`.
- `meshB`: The second `EditableMesh`.
- `options`: Optional `BooleanOptions`.

#### Returns

A `BooleanResult` object containing the intersected mesh.

#### Example

```typescript
import { createCube, createSphere, intersect } from 'three-edit';

const cube = createCube();
const sphere = createSphere({ radius: 0.8 });

const result = intersect(cube, sphere);
```
