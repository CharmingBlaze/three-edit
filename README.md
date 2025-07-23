# three-edit

**three-edit** is a modular, headless 3D editing library for Three.js. It provides a comprehensive set of tools and functionalities to manipulate 3D geometry in a structured and efficient way, including a complete modular helper system for professional 3D modeling tool development.

## ✨ Features

* **🎯 JavaScript & TypeScript Support**: Works seamlessly with both JavaScript and TypeScript - no TypeScript knowledge required!
* **🧩 Modular Architecture**: The library is designed to be modular, allowing you to use only the parts you need.
* **🎨 Headless by Design**: three-edit is completely headless, meaning it doesn't rely on any specific rendering or UI framework.
* **🔧 Rich Set of Operations**: It provides a wide range of editing operations, including extrusion, beveling, boolean operations, and more.
* **🎯 Advanced Selection System**: A powerful selection system that allows for complex queries and manipulations.
* **🌳 Scene Graph System**: Full hierarchical object system with transform inheritance.
* **🧮 Complete Helper System**: Modular helper system with math utilities, geometry operations, editor helpers, and primitive creation tools.
* **🎨 Editor Integration**: Built-in highlight, grid, and overlay systems for professional 3D modeling tools.
* **📐 UV Mapping**: Comprehensive UV generation and manipulation tools.
* **🔍 Validation & Debugging**: Mesh validation, integrity checking, and debugging utilities.
* **⚡ Performance Optimized**: GPU acceleration, LOD systems, and memory optimization tools.
* **📚 Built with TypeScript**: The library is written in TypeScript, providing strong typing and improved developer experience.

## 🧩 Modular Helper System

three-edit includes a comprehensive modular helper system organized into specialized categories:

### 🧮 Math Utilities
- **Basic Math**: `clamp`, `lerp`, `roundTo`, `modulo`
- **Vector Math**: Distance calculations, dot/cross products, vector operations
- **Triangle Math**: Triangle validation, area calculations, barycentric coordinates

### 📐 Geometry Tools
- **Core Operations**: Triangulation, vertex merging, face subdivision
- **Vertex Operations**: Centering, scaling, rotating, grid creation
- **Face Operations**: Extrusion, grid-based face creation

### 🎨 Editor Helpers
- **Highlight System**: Vertex, edge, and face highlighting with customizable options
- **Grid System**: Reference grids, snap grids, and spatial guides
- **Overlay System**: Measurement lines, axis arrows, bounding boxes

### 🧱 Primitive Helpers
- **Basic Shapes**: Cube, sphere, cylinder, plane
- **Complex Shapes**: Torus, cone, pyramid, capsule
- **Parametric Shapes**: Torus knot, Möbius strip, arrow
- **Game Primitives**: Stairs, ramp, wedge, handle, greeble blocks

### 🔧 Utility Helpers
- **UV Operations**: Planar, cylindrical, spherical, and cubic UV generation
- **Normal Operations**: Face normal calculation, smooth normal generation
- **Validation**: Mesh validation, integrity checking, repair tools
- **Debug**: Mesh statistics, debugging utilities

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
import { createCube, toBufferGeometry } from 'three-edit';
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

### Using the Helper System

```typescript
import { 
  // Math helpers
  clamp, lerp, distance3D, isValidTriangle,
  // Geometry helpers
  triangulatePolygon, mergeVertices, centerVertices,
  // Editor helpers
  createVertexHighlight, createGrid, createMeasurementLine,
  // Primitive helpers
  createCube, createSphere, createTorus
} from 'three-edit';

// Use math utilities
const clampedValue = clamp(value, 0, 100);
const interpolated = lerp(start, end, 0.5);

// Use geometry operations
const triangles = triangulatePolygon(vertices, face);
const centered = centerVertices(mesh.vertices);

// Use editor helpers
const highlight = createVertexHighlight(position, { color: 0xff0000 });
const grid = createGrid({ size: 10, divisions: 20 });
const measurement = createMeasurementLine(start, end);

// Use primitive helpers
const cube = createCube({ width: 2, height: 2, depth: 2 });
const sphere = createSphere({ radius: 1, segments: 32 });
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

// Use helper methods
const helpers = ThreeEditJS.getHelpers();
const highlight = helpers.editor.createVertexHighlight(position);
const grid = helpers.editor.createGrid({ size: 10 });
const math = helpers.math.clamp(value, 0, 100);
```

## 🎨 Editor Integration Example

```typescript
import { 
  createVertexHighlight, 
  createEdgeHighlight, 
  createFaceHighlight,
  createGrid,
  createAxisArrows,
  updateHighlightColor
} from 'three-edit';

// Create editor elements
const vertexHighlight = createVertexHighlight(vertex.position, {
  color: 0xff0000,
  size: 0.1
});

const edgeHighlight = createEdgeHighlight(edge.start, edge.end, {
  color: 0x00ff00,
  lineWidth: 2
});

const faceHighlight = createFaceHighlight(face.vertices, {
  color: 0x0000ff,
  opacity: 0.3
});

const grid = createGrid({
  size: 20,
  divisions: 20,
  color: 0x888888
});

const axes = createAxisArrows({
  size: 5,
  arrowSize: 0.5
});

// Add to scene
scene.add(vertexHighlight);
scene.add(edgeHighlight);
scene.add(faceHighlight);
scene.add(grid);
scene.add(axes);

// Update highlights
updateHighlightColor(vertexHighlight, 0xffff00);
```

## 📚 Documentation

For detailed documentation, see the [docs](./docs) folder:

- [Getting Started](./docs/getting-started.md) - Basic usage and setup
- [API Reference](./docs/api-reference.md) - Complete API documentation
- [Helper System](./docs/helpers.md) - Modular helper system guide
- [Editor Integration](./docs/editor-integration.md) - Building 3D modeling tools
- [JavaScript Usage](./docs/javascript-usage.md) - Vanilla JavaScript examples

## 🔧 Development

### Building the Library

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Build documentation
npm run docs
```

### Project Structure

```
src/
├── core/           # Core classes (EditableMesh, Vertex, Edge, Face)
├── helpers/        # Modular helper system
│   ├── math/       # Math utilities
│   ├── geometry/   # Geometry operations
│   ├── primitives/ # Primitive creation helpers
│   ├── highlight.ts # Editor highlighting
│   ├── grid.ts     # Grid system
│   └── overlay.ts  # Overlay system
├── editing/        # Editing operations
├── transform/      # Transform operations
├── selection/      # Selection system
├── operations/     # Advanced operations
├── validation/     # Validation and debugging
├── js-wrapper/     # JavaScript API wrapper
└── ...
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
