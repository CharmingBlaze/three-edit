# Three.js Advanced Editing Library

Welcome to the Three.js Advanced Editing Library! This is a powerful, modular library designed to bring advanced mesh editing capabilities, similar to those found in professional 3D modeling software, directly into your Three.js projects.

This library provides a foundational, extensible toolkit for performing complex modifications on `THREE.BufferGeometry` at runtime.

## ✨ Core Features

- **Modular Architecture**: Operations are grouped into logical modules (`Vertex`, `Edge`, `Face`, `UV`, `Geometry`). Import only what you need.
- **Extensible by Design**: The clear, consistent structure makes it easy to add new operations and features.
- **Functional API**: Operations are pure functions that take geometry and options, and return a new, modified geometry without side effects.
- **Built-in Validation**: Each operation validates its parameters, providing clear error messages to speed up development.

## 🚀 Getting Started

This library is currently set up for local development. To use it, you can import the operation modules directly into your project.

### Example: Extruding a Face

Here’s a simple example of how to use the library to perform a basic face extrusion.

```javascript
import * as THREE from 'three';
import { FaceOperations } from './src/editing/index.js';

// 1. Create a mesh to edit
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 2. Define the operation parameters
const faceIndices = [0]; // Extrude the first face
const extrudeOptions = {
  distance: 0.5 // How far to extrude
};

// 3. Apply the operation
const result = FaceOperations.extrude(geometry, faceIndices, extrudeOptions);

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

The library is organized into several core modules, each responsible for a different type of operation.

- **`VertexOperations`**: Functions for manipulating vertices (e.g., `snap`, `merge`, `connect`).
- **`EdgeOperations`**: Functions for manipulating edges (e.g., `split`, `collapse`, `dissolve`).
- **`FaceOperations`**: Functions for manipulating faces (e.g., `extrude`, `inset`, `bevel`).
- **`UVOperations`**: Functions for manipulating UV maps (e.g., `unwrap`, `pack`, `smartProject`).
- **`GeometryOperations`**: Higher-level functions that operate on entire geometries.

All operations are exposed as static methods, so you can use them directly without needing to instantiate a class.

## 🤝 Contributing

We welcome contributions from the community! If you're interested in helping to improve the library, please see our [Contributing Guide](CONTRIBUTING.md) for more information on our development process, architecture, and testing procedures.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
