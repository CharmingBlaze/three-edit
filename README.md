# three-edit

**three-edit** is a modular, headless 3D editing library for Three.js. It provides a set of tools and functionalities to manipulate 3D geometry in a structured and efficient way.

## ✨ Features

- **🎯 JavaScript & TypeScript Support**: Works seamlessly with both JavaScript and TypeScript - no TypeScript knowledge required!
- **Modular Architecture**: The library is designed to be modular, allowing you to use only the parts you need.
- **Headless by Design**: three-edit is completely headless, meaning it doesn't rely on any specific rendering or UI framework.
- **Rich Set of Operations**: It provides a wide range of editing operations, including extrusion, beveling, and more.
- **Advanced Selection System**: A powerful selection system that allows for complex queries and manipulations.
- **Scene Graph System**: Full hierarchical object system with transform inheritance.
- **Built with TypeScript**: The library is written in TypeScript, providing strong typing and improved developer experience.

## 📦 Installation

### Using npm or yarn

To install three-edit, you can use npm or yarn:

```bash
npm install three-edit
```

```bash
yarn add three-edit
```

### Direct browser usage (vanilla JavaScript)

You can use three-edit directly in the browser without any build step:

```html
<!-- Include Three.js first -->
<script src="https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js"></script>

<!-- Include three-edit -->
<script src="path/to/three-edit/browser/three-edit.js"></script>

<script>
  // ThreeEdit is available as a global variable
  const cube = ThreeEdit.createCube();
  // ...
</script>
```

> **Note:** The browser version is included in the `browser/three-edit.js` file in the repository. This provides a simplified version of the library with the core functionality for direct browser usage.

## 🚀 Getting Started

### TypeScript / ES Modules

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

### Vanilla JavaScript

For vanilla JavaScript users, we provide a simplified API through the `ThreeEditJS` wrapper:

```javascript
// Import the JavaScript wrapper
import ThreeEditJS from 'three-edit/js-wrapper';

// Create a new cube
const cube = ThreeEditJS.createCube({
    width: 2,
    height: 2,
    depth: 2
});

// Convert the cube to a Three.js BufferGeometry
const geometry = ThreeEditJS.toBufferGeometry(cube);

// Create a new Three.js mesh
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);

// Add the mesh to your scene
scene.add(mesh);

// Helper method for applying operations
const extrudedGeometry = ThreeEditJS.applyOperation(
    cube, 
    ThreeEditJS.extrudeFace, 
    cube.faces[0], 
    { distance: 1 }
);
```

**🎉 No TypeScript required!** The JavaScript wrapper provides all the same functionality with a JavaScript-friendly API.

## 📚 Documentation

For more detailed information and examples, please refer to the [documentation](docs/getting-started.md).

### Examples

- [Basic Usage](examples/basic-cube.html) - Simple cube creation and manipulation
- [Mesh Editing](examples/mesh-editing.html) - Advanced mesh editing operations
- [Scene Graph](examples/scene-graph-demo.html) - Scene graph system usage
- [JavaScript Usage](examples/javascript-usage.html) - JavaScript-specific examples

### Documentation

- [Getting Started](docs/getting-started.md) - Quick start guide
- [JavaScript Usage](docs/javascript-usage.md) - Complete JavaScript guide
- [API Reference](docs/api-reference.md) - Full API documentation
- [Scene Graph](docs/scene-graph.md) - Scene graph system guide

## 🤝 Contributing

We welcome contributions! Please see our [contributing guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
