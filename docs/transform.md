# Transform

Transform functions are used to apply transformations like translation, rotation, and scaling to an `EditableMesh` or its selected components.

## `move`

Moves the selected components of a mesh by a given translation vector.

### Signature

```typescript
function move(
  mesh: EditableMesh,
  selection: Selection,
  translation: Vector3,
  options?: TransformOptions
): void;
```

### Parameters

- `mesh`: The `EditableMesh` to modify.
- `selection`: The `Selection` containing the components to move.
- `translation`: The `Vector3` representing the direction and magnitude of the movement.
- `options`: Optional `TransformOptions`:
  - `local?: boolean`: If `true`, the transformation is applied in the local space of the selection (not fully implemented).
  - `relativeToPivot?: boolean`: If `true`, the transformation is relative to the selection's pivot point.
  - `pivotPoint?: Vector3`: A custom pivot point to use.

### Example

```typescript
import { createCube, Selection, move } from 'three-edit';
import { Vector3 } from 'three';

const cube = createCube();
const selection = new Selection();
selection.addFace(0); // Select the first face

const translation = new Vector3(1, 0, 0);
move(cube, selection, translation);
```

## `moveAlongNormal`

Moves the selected vertices along their respective normals.

### Signature

```typescript
function moveAlongNormal(
  mesh: EditableMesh,
  selection: Selection,
  distance: number
): void;
```

### Parameters

- `mesh`: The `EditableMesh` to modify.
- `selection`: The `Selection` containing the vertices to move.
- `distance`: The distance to move along the normal.

### Example

```typescript
import { createSphere, Selection, moveAlongNormal } from 'three-edit';

const sphere = createSphere();
const selection = new Selection();
selection.addVertex(0);

moveAlongNormal(sphere, selection, 0.5);
```

## `rotate`

Rotates the selected components of a mesh around a given axis by a specified angle.

### Signature

```typescript
function rotate(
  mesh: EditableMesh,
  selection: Selection,
  axis: Vector3,
  angle: number,
  options?: TransformOptions
): void;
```

### Parameters

- `mesh`: The `EditableMesh` to modify.
- `selection`: The `Selection` containing the components to rotate.
- `axis`: The `Vector3` representing the axis of rotation.
- `angle`: The angle of rotation in radians.
- `options`: Optional `TransformOptions`.

### Example

```typescript
import { createCube, Selection, rotate } from 'three-edit';
import { Vector3 } from 'three';

const cube = createCube();
const selection = new Selection();
selection.addFace(0);

const axis = new Vector3(0, 1, 0);
const angle = Math.PI / 4; // 45 degrees

rotate(cube, selection, axis, angle);
```

## `rotateEuler`

Rotates the selected components of a mesh using Euler angles.

### Signature

```typescript
function rotateEuler(
  mesh: EditableMesh,
  selection: Selection,
  x: number,
  y: number,
  z: number,
  options?: TransformOptions
): void;
```

### Parameters

- `mesh`: The `EditableMesh` to modify.
- `selection`: The `Selection` containing the components to rotate.
- `x`: The rotation around the X axis in radians.
- `y`: The rotation around the Y axis in radians.
- `z`: The rotation around the Z axis in radians.
- `options`: Optional `TransformOptions`.

## `scale`

Scales the selected components of a mesh by a given factor.

### Signature

```typescript
function scale(
  mesh: EditableMesh,
  selection: Selection,
  scale: number | Vector3,
  options?: TransformOptions
): void;
```

### Parameters

- `mesh`: The `EditableMesh` to modify.
- `selection`: The `Selection` containing the components to scale.
- `scale`: The scale factor. Can be a single number for uniform scaling or a `Vector3` for non-uniform scaling.
- `options`: Optional `TransformOptions`.

### Example

```typescript
import { createCube, Selection, scale } from 'three-edit';
import { Vector3 } from 'three';

const cube = createCube();
const selection = new Selection();
selection.addFace(0);

// Uniform scale
scale(cube, selection, 1.5);

// Non-uniform scale
const scaleVector = new Vector3(1, 2, 1);
scale(cube, selection, scaleVector);
```

## `scaleUniform`

A convenience function to scale selected components uniformly.

### Signature

```typescript
function scaleUniform(
  mesh: EditableMesh,
  selection: Selection,
  factor: number,
  options?: TransformOptions
): void;
```

## `scaleNonUniform`

A convenience function to scale selected components non-uniformly.

### Signature

```typescript
function scaleNonUniform(
  mesh: EditableMesh,
  selection: Selection,
  x: number,
  y: number,
  z: number,
  options?: TransformOptions
): void;
```
