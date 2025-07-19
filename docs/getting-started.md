# Getting Started with Three-Edit

## Installation

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- TypeScript (recommended)

### Install Three-Edit

```bash
npm install three-edit
```

### Install Three.js (if not already installed)

```bash
npm install three
```

## Quick Start

### Basic Setup

```typescript
import { EditableMesh, createCube, move, rotate } from 'three-edit';
import { Vector3 } from 'three';

// Create a simple cube
const mesh = createCube({
  width: 1,
  height: 1,
  depth: 1
});

// Transform the mesh
move(mesh, {
  direction: new Vector3(1, 0, 0),
  distance: 2
});

rotate(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 4
});
```

### Integration with Three.js

```typescript
import { EditableMesh, createSphere, toBufferGeometry } from 'three-edit';
import * as THREE from 'three';

// Create an editable mesh
const editableMesh = createSphere({
  radius: 1,
  segments: 32,
  rings: 16
});

// Convert to Three.js geometry
const geometry = toBufferGeometry(editableMesh);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);

// Add to scene
scene.add(mesh);
```

## Basic Examples

### Creating Primitives

```typescript
import { 
  createCube, 
  createSphere, 
  createCylinder,
  createTetrahedron,
  createOctahedron,
  createTorusKnot 
} from 'three-edit';

// Basic primitives
const cube = createCube({ width: 2, height: 1, depth: 1 });
const sphere = createSphere({ radius: 1, segments: 32 });
const cylinder = createCylinder({ radius: 0.5, height: 2 });

// Regular polyhedra
const tetrahedron = createTetrahedron({ size: 1 });
const octahedron = createOctahedron({ size: 1 });

// Complex shapes
const torusKnot = createTorusKnot({
  radius: 1,
  tubeRadius: 0.3,
  p: 2,
  q: 3
});
```

### Transform Operations

```typescript
import { move, rotate, scale, mirror } from 'three-edit';
import { Vector3 } from 'three';

const mesh = createCube();

// Move
move(mesh, {
  direction: new Vector3(1, 0, 0),
  distance: 2
});

// Rotate
rotate(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 2
});

// Scale
scale(mesh, {
  factor: new Vector3(2, 1, 1)
});

// Mirror
mirror(mesh, {
  type: 'plane',
  plane: {
    point: new Vector3(0, 0, 0),
    normal: new Vector3(1, 0, 0)
  }
});
```

### Array Operations

```typescript
import { createLinearArray, createRadialArray, createGridArray } from 'three-edit';

const baseMesh = createCube();

// Linear array
const linearArray = createLinearArray(baseMesh, {
  count: 5,
  direction: new Vector3(1, 0, 0),
  distance: 2
});

// Radial array
const radialArray = createRadialArray(baseMesh, {
  count: 8,
  radius: 3,
  center: new Vector3(0, 0, 0),
  axis: new Vector3(0, 1, 0)
});

// Grid array
const gridArray = createGridArray(baseMesh, {
  counts: new Vector3(3, 2, 1),
  distances: new Vector3(2, 2, 2)
});
```

### Boolean Operations

```typescript
import { union, intersection, difference } from 'three-edit';

const cube1 = createCube();
const cube2 = createCube();

// Move second cube
move(cube2, { direction: new Vector3(0.5, 0, 0), distance: 1 });

// Boolean operations
const unionMesh = union(cube1, cube2);
const intersectionMesh = intersection(cube1, cube2);
const differenceMesh = difference(cube1, cube2);
```

### Selection and Editing

```typescript
import { selectVertices, extrudeVertex, bevelEdge } from 'three-edit';

const mesh = createCube();

// Select vertices
const selection = selectVertices(mesh, [0, 1, 2]);

// Extrude vertex
extrudeVertex(mesh, 0, {
  direction: new Vector3(0, 1, 0),
  distance: 1,
  keepOriginal: true
});

// Bevel edge
bevelEdge(mesh, 0, {
  distance: 0.1,
  segments: 3,
  profile: 0.5
});
```

### Deformation Operations

```typescript
import { bend, twist, taper } from 'three-edit';

const mesh = createCube();

// Bend
bend(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 4
});

// Twist
twist(mesh, {
  axis: new Vector3(0, 1, 0),
  angle: Math.PI / 2
});

// Taper
taper(mesh, {
  axis: new Vector3(0, 1, 0),
  factor: 0.5
});
```

### Noise and Displacement

```typescript
import { applyVertexNoise, applyFaceDisplacement } from 'three-edit';

const mesh = createSphere();

// Apply vertex noise
applyVertexNoise(mesh, {
  scale: 1.0,
  intensity: 0.1,
  seed: 12345,
  type: 'perlin'
});

// Apply face displacement
applyFaceDisplacement(mesh, {
  intensity: 0.2,
  direction: new Vector3(0, 1, 0)
});
```

### Import/Export

```typescript
import { loadOBJ, saveOBJ, loadGLTF, saveGLTF } from 'three-edit';

// Load OBJ file
const mesh = await loadOBJ('model.obj', {
  includeNormals: true,
  includeUVs: true
});

// Save OBJ file
await saveOBJ(mesh, 'output.obj', {
  includeNormals: true,
  includeUVs: true
});

// Load GLTF file
const gltfMesh = await loadGLTF('model.gltf', {
  includeAnimations: true,
  includeMaterials: true
});

// Save GLTF file
await saveGLTF(gltfMesh, 'output.gltf', {
  includeAnimations: true,
  includeMaterials: true
});
```

## Advanced Examples

### Creating Complex Shapes

```typescript
import { createMobiusStrip, createTorusKnot } from 'three-edit';

// Create a Möbius strip
const mobiusStrip = createMobiusStrip({
  radius: 1,
  width: 0.3,
  segments: 64,
  widthSegments: 8,
  twists: 1
});

// Create a torus knot
const torusKnot = createTorusKnot({
  radius: 1,
  tubeRadius: 0.3,
  tubularSegments: 64,
  radialSegments: 8,
  p: 3,
  q: 2
});
```

### Working with Materials

```typescript
import { MaterialManager } from 'three-edit';

const materialManager = new MaterialManager();

// Add materials
const redMaterial = materialManager.addMaterial({
  name: 'Red Material',
  type: 'standard',
  color: { r: 1, g: 0, b: 0 },
  opacity: 1.0,
  transparent: false,
  wireframe: false
});

const blueMaterial = materialManager.addMaterial({
  name: 'Blue Material',
  type: 'phong',
  color: { r: 0, g: 0, b: 1 },
  opacity: 0.8,
  transparent: true,
  wireframe: false
});

// Assign materials to faces
mesh.getFace(0)!.materialIndex = redMaterial;
mesh.getFace(1)!.materialIndex = blueMaterial;
```

### History System

```typescript
import { CommandHistory } from 'three-edit';

const history = new CommandHistory();

// Execute commands
history.execute(new MoveCommand(mesh, new Vector3(1, 0, 0)));
history.execute(new RotateCommand(mesh, new Vector3(0, 1, 0), Math.PI / 4));

// Undo/Redo
if (history.canUndo()) {
  history.undo();
}

if (history.canRedo()) {
  history.redo();
}
```

### Validation and Repair

```typescript
import { validateGeometryIntegrity, repairMesh } from 'three-edit';

// Validate mesh integrity
if (!validateGeometryIntegrity(mesh)) {
  console.warn('Mesh has issues, attempting repair...');
  repairMesh(mesh);
}

// Check mesh statistics
console.log(`Vertices: ${mesh.getVertexCount()}`);
console.log(`Edges: ${mesh.getEdgeCount()}`);
console.log(`Faces: ${mesh.getFaceCount()}`);
```

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Package.json

```json
{
  "name": "my-three-edit-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest"
  },
  "dependencies": {
    "three": "^0.160.0",
    "three-edit": "^0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

## Browser Setup

### HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three-Edit Example</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script type="module">
        import { createCube, toBufferGeometry } from 'three-edit';
        import * as THREE from 'three';

        // Create scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Create editable mesh
        const editableMesh = createCube({ width: 1, height: 1, depth: 1 });
        
        // Convert to Three.js geometry
        const geometry = toBufferGeometry(editableMesh);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Add lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);
        scene.add(light);

        // Position camera
        camera.position.z = 5;

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();
    </script>
</body>
</html>
```

## Next Steps

1. **Explore the API Reference** - Check out the complete API documentation
2. **Try the Examples** - Experiment with different primitives and operations
3. **Read the User Guide** - Learn about advanced techniques and best practices
4. **Join the Community** - Get help and share your creations

## Support

- **Documentation**: Complete API reference and user guides
- **Examples**: Code examples for all major features
- **GitHub**: Source code and issue tracking
- **Community**: Forums and discussion groups

Happy modeling with Three-Edit!
