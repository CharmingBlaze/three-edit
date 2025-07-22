# Three.js Advanced Editing Library

Welcome to the Three.js Advanced Editing Library! This is a powerful, modular library designed to bring advanced mesh editing capabilities, similar to those found in professional 3D modeling software, directly into your Three.js projects.

This library provides a foundational, extensible toolkit for performing complex modifications on `THREE.BufferGeometry` at runtime.

## ✨ Core Features

- **Modular Architecture**: Operations are grouped into logical modules (`vertex`, `edge`, `face`, `uv`, `geometry`). Import only what you need.
- **Extensible by Design**: The clear, consistent structure makes it easy to add new operations and features.
- **Functional API**: Operations are pure functions that take geometry and options, and return a new, modified geometry without side effects.
- **Built-in Validation**: Each operation validates its parameters, providing clear error messages to speed up development.

## 🚀 Getting Started

This library is currently set up for local development. To use it, you can import the operation modules directly into your project.

### Example: Extruding a Face

Here’s a simple example of how to use the library to perform a basic face extrusion.

```javascript
import * as THREE from 'three';
import { extrudeFaces } from './src/editing/operations/face/extrudeFaces.js';

// 1. Create a mesh to edit
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 2. Define the operation parameters
const faceIndices = [0]; // Extrude the first face
const extrudeOptions = {
  distance: 0.5 // How far to extrude
};

// 3. Apply the operation
const result = extrudeFaces(geometry, faceIndices, extrudeOptions);

// 4. Use the new geometry if the operation was successful
if (result.success) {
  // result.geometry contains the new, modified geometry
  const material = new THREE.MeshNormalMaterial();
  const modifiedCube = new THREE.Mesh(result.geometry, material);
  // Add the new mesh to your scene
  // scene.add(modifiedCube);
} else {
  console.error('Extrusion failed:', result.errors);
}
```

## 📖 Architecture and Design

The library is organized into several core modules, each responsible for a different type of operation. Each operation is a pure function in its own file, grouped by type:

- **`vertex/`**: Functions for manipulating vertices (e.g., `snapVertices`, `mergeVertices`, `connectVertices`).
- **`edge/`**: Functions for manipulating edges (e.g., `splitEdges`, `collapseEdges`, `dissolveEdges`).
- **`face/`**: Functions for manipulating faces (e.g., `extrudeFaces`, `insetFaces`, `bevelFaces`).
- **`uv/`**: Functions for manipulating UV maps (e.g., `unwrapFaces`, `packUVs`, `smartProjectUVs`).
- **`geometry/`**: Higher-level functions that operate on entire geometries.

All operations are exported individually and can be imported as needed:

```js
import { mergeVertices } from './src/editing/operations/vertex/mergeVertices.js';
import { splitEdges } from './src/editing/operations/edge/splitEdges.js';
```
Or, for grouped imports:
```js
import { mergeVertices, snapVertices } from './src/editing/operations/vertex/index.js';
```

## 🤝 Contributing

We welcome contributions from the community! If you're interested in helping to improve the library, please see our [Contributing Guide](CONTRIBUTING.md) for more information on our development process, architecture, and testing procedures.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🛠️ Migration Guide (from Legacy to Modular)

**Old Style:**
```js
import { VertexOperations } from './editing/operations/vertexOperations.js';
const result = VertexOperations.merge(geometry, indices);
```

**New Modular Style:**
```js
import { mergeVertices } from './editing/operations/vertex/mergeVertices.js';
const result = mergeVertices(geometry, indices);
```

- All operations are now imported as individual functions from their respective files or group index files.
- There are no more `VertexOperations`, `EdgeOperations`, etc. objects—just pure functions.
- Update all your imports and usage accordingly for the new modular system.
