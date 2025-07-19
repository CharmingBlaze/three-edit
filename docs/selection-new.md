# Selection

Selection is a core concept in `three-edit`, allowing you to specify which vertices, edges, or faces of an `EditableMesh` you want to operate on. Selections are managed by the `Selection` class and a variety of selection functions.

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

## Basic Selection Functions

### Vertex Selection

#### `selectVertex`

Selects the closest vertex to a given point.

```typescript
function selectVertex(
  mesh: EditableMesh,
  point: Vector3,
  selection: Selection,
  options?: SelectVertexOptions
): Selection;
```

#### `selectVerticesInRadius`

Selects all vertices within a given radius of a point.

```typescript
function selectVerticesInRadius(
  mesh: EditableMesh,
  point: Vector3,
  radius: number,
  selection: Selection,
  options?: SelectVertexOptions
): Selection;
```

### Face Selection

#### `selectFaceByRay`

Selects a single face by casting a ray.

```typescript
function selectFaceByRay(
  mesh: EditableMesh,
  origin: Vector3,
  direction: Vector3,
  selection: Selection,
  options?: SelectFaceOptions
): Selection;
```

#### `selectFacesByVertices`

Selects all faces connected to a given set of vertices.

```typescript
function selectFacesByVertices(
  mesh: EditableMesh,
  vertexIndices: number[],
  selection: Selection,
  options?: SelectFaceOptions
): Selection;
```

## Advanced Selection Functions

These functions provide more complex selection methods, such as box, lasso, and circle selection.

### `selectByRay`

Performs a ray-based selection of faces, vertices, or edges.

### `selectByBox`

Selects all elements within a `THREE.Box3`.

### `selectByLasso`

Selects all elements within a 2D polygon projected onto the screen.

### `selectByCircle`

Selects all elements within a circular area.

### `selectConnected`

Expands the current selection to include connected elements.

### `selectSimilar`

Selects elements that have similar properties (e.g., face normal, area) to the current selection.
