# three-edit

**three-edit** is a modular, headless 3D editing library for Three.js. It provides a set of tools and functionalities to manipulate 3D geometry in a structured and efficient way.

## ✨ Features

- **Modular Architecture**: The library is designed to be modular, allowing you to use only the parts you need.
- **Headless by Design**: three-edit is completely headless, meaning it doesn't rely on any specific rendering or UI framework.
- **Rich Set of Operations**: It provides a wide range of editing operations, including extrusion, beveling, and more.
- **Advanced Selection System**: A powerful selection system that allows for complex queries and manipulations.
- **Built with TypeScript**: The library is written in TypeScript, providing strong typing and improved developer experience.

## 📦 Installation

To install three-edit, you can use npm or yarn:

```bash
npm install three-edit
```

```bash
yarn add three-edit
```

## 🚀 Getting Started

Here's a simple example of how to create a cube and convert it to a Three.js BufferGeometry:

```typescript
import { createCube } from 'three-edit';
import { toBufferGeometry } from 'three-edit';
import * as THREE from 'three';

// Create a new cube
const cube = createCube();

// Convert the cube to a Three.js BufferGeometry
const geometry = toBufferGeometry(cube);

// Create a new Three.js mesh
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);

// Add the mesh to your scene
scene.add(mesh);
```

## 📚 Documentation

For more detailed information and examples, please refer to the [documentation](docs/getting-started.md).
