# Selection

Selection is a core concept in `three-edit`, allowing you to specify which vertices, edges, or faces of an `EditableMesh` you want to operate on. Selections are managed by the `Selection` class.

## The `Selection` Class

The `Selection` class is a container that holds sets of selected vertex, edge, and face indices.

### Properties

- `vertices: Set<number>`: A set of selected vertex indices.
- `edges: Set<number>`: A set of selected edge indices.
- `faces: Set<number>`: A set of selected face indices.

### Methods

- `clear()`: Clears all selections.
- `addVertex(index: number)`: Adds a vertex to the selection.
- `removeVertex(index: number)`: Removes a vertex from the selection.
- `toggleVertex(index: number)`: Toggles the selection state of a vertex.
- `hasVertex(index: number): boolean`: Checks if a vertex is selected.
- `clone(): Selection`: Creates a deep clone of the selection.

(Similar methods exist for `Edge` and `Face` selections.)

## Selection Functions

### Vertex Selection

#### `selectVertex`

Selects the closest vertex to a given point in 3D space.

##### Signature

```typescript
function selectVertex(
  mesh: EditableMesh,
  point: Vector3,
  selection: Selection,
  options?: SelectVertexOptions
): Selection;
```

##### Parameters

- `mesh`: The `EditableMesh` to select from.
- `point`: The point in 3D space to select near.
- `selection`: The `Selection` object to modify.
- `options`: Optional settings:
  - `add?: boolean`: If `true`, adds to the existing selection.
  - `toggle?: boolean`: If `true`, toggles the selection state.
  - `maxDistance?: number`: The maximum distance a vertex can be from the point to be considered.

##### Example

```typescript
import { createCube, Selection, selectVertex } from 'three-edit';
import { Vector3 } from 'three';

const cube = createCube();
const selection = new Selection();
const point = new Vector3(0.5, 0.5, 0.5);

selectVertex(cube, point, selection);
```

#### `selectVerticesInRadius`

Selects all vertices within a given radius of a point.

##### Signature

```typescript
function selectVerticesInRadius(
  mesh: EditableMesh,
  point: Vector3,
  radius: number,
  selection: Selection,
  options?: SelectVertexOptions
): Selection;
```

##### Parameters

- `mesh`: The `EditableMesh` to select from.
- `point`: The center point of the selection sphere.
- `radius`: The radius of the selection sphere.
- `selection`: The `Selection` object to modify.
- `options`: Optional settings (`add` or `toggle`).

##### Example

```typescript
import { createSphere, Selection, selectVerticesInRadius } from 'three-edit';
import { Vector3 } from 'three';

const sphere = createSphere();
const selection = new Selection();
const point = new Vector3(0, 0, 0);

### Face Selection

#### `selectFaceByRay`

Selects a single face by casting a ray from an origin point in a given direction. This is useful for picking faces with a mouse click.

##### Signature

```typescript
function selectFaceByRay(
  mesh: EditableMesh,
  origin: Vector3,
  direction: Vector3,
  selection: Selection,
  options?: SelectFaceOptions
): Selection;
```

##### Parameters

- `mesh`: The `EditableMesh` to select from.
- `origin`: The starting point of the ray.
- `direction`: The direction of the ray.
- `selection`: The `Selection` object to modify.
- `options`: Optional settings (`add` or `toggle`).

#### `selectFacesByVertices`

Selects all faces that are connected to a given set of vertices.

##### Signature

```typescript
function selectFacesByVertices(
  mesh: EditableMesh,
  vertexIndices: number[],
  selection: Selection,
  options?: SelectFaceOptions
): Selection;
```

##### Parameters

- `mesh`: The `EditableMesh` to select from.
- `vertexIndices`: An array of vertex indices.
- `selection`: The `Selection` object to modify.
- `options`: Optional settings (`add` or `toggle`).

selectVerticesInRadius(sphere, point, 0.5, selection);
```
