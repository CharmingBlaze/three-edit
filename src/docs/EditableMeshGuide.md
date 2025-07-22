# EditableMesh Implementation Guide

## Overview

The EditableMesh system is designed for maximum flexibility and safety. All properties are optional with safe defaults, making it perfect for creating primitives and handling partial mesh data.

## Core Principles

### 1. Optional Everything
Every property in EditableMesh is optional with safe defaults:

```javascript
// Empty mesh - everything defaults to empty Maps
const emptyMesh = new EditableMesh();

// Partial mesh - only provide what you need
const pointCloud = new EditableMesh({
  vertices: { 'v1': new Vertex(0, 0, 0) }
});

// Complete mesh - provide everything
const completeMesh = new EditableMesh({
  name: 'Complete',
  vertices: { /* ... */ },
  edges: { /* ... */ },
  faces: { /* ... */ },
  uvs: { /* ... */ },
  material: { /* ... */ },
  attributes: { /* ... */ }
});
```

### 2. Safe Defaults
- **Vertices**: `new Map()` - Empty vertex collection
- **Edges**: `new Map()` - Empty edge collection  
- **Faces**: `new Map()` - Empty face collection
- **UVs**: `new Map()` - Empty UV collection
- **Material**: Default material with sensible properties
- **Attributes**: `new Map()` - Empty custom attributes

### 3. Flexible Input
The constructor accepts both Maps and plain objects:

```javascript
// Using Maps
const mesh1 = new EditableMesh({
  vertices: new Map([['v1', new Vertex(0, 0, 0)]])
});

// Using plain objects (automatically converted to Maps)
const mesh2 = new EditableMesh({
  vertices: { 'v1': new Vertex(0, 0, 0) }
});
```

## Implementing Primitives

### 1. File Structure
Each primitive should be in its own file:

```
src/primitives/
├── createCube.js
├── createSphere.js
├── createPlane.js
├── createCylinder.js
├── createCone.js
├── createTorus.js
├── createRing.js
├── createPyramid.js
├── createOctahedron.js
├── createIcosahedron.js
└── index.js
```

### 2. Function Signature Pattern
Every primitive follows this pattern:

```javascript
/**
 * Create a [PrimitiveName] primitive
 * @param {Object} params - [PrimitiveName] parameters
 * @param {number} params.radius - [Description]
 * @param {number} params.segments - [Description]
 * @param {string} params.name - Mesh name
 * @returns {EditableMesh} [PrimitiveName] mesh
 */
export function create[PrimitiveName](params = {}) {
  const {
    // All parameters with sensible defaults
    radius = 1,
    segments = 16,
    name = '[PrimitiveName]'
  } = params;

  const mesh = new EditableMesh({ name });
  
  // Build geometry...
  
  return mesh;
}
```

### 3. Implementation Steps

#### Step 1: Create Mesh
```javascript
const mesh = new EditableMesh({ name });
```

#### Step 2: Generate Vertices
```javascript
const vertices = [];

// Generate vertices based on primitive type
for (let i = 0; i <= segments; i++) {
  for (let j = 0; j <= segments; j++) {
    const vertex = new Vertex(x, y, z);
    vertex.setNormal(nx, ny, nz); // Set proper normals
    vertices.push(vertex);
    mesh.addVertex(vertex);
  }
}
```

#### Step 3: Generate UVs
```javascript
// Add UV coordinates for texturing
for (let i = 0; i <= segments; i++) {
  for (let j = 0; j <= segments; j++) {
    const uv = new UV(u, v, vertexId);
    mesh.addUV(uv);
  }
}
```

#### Step 4: Generate Edges
```javascript
// Create edges for wireframe display and editing
for (let i = 0; i < segments; i++) {
  for (let j = 0; j < segments; j++) {
    const edge = new Edge(vertexId1, vertexId2);
    mesh.addEdge(edge);
  }
}
```

#### Step 5: Generate Faces
```javascript
// Create triangular faces
for (let i = 0; i < segments; i++) {
  for (let j = 0; j < segments; j++) {
    const face = new Face([v1, v2, v3]);
    face.calculateNormal(mesh.vertices); // Auto-calculate normals
    face.calculateTangents(mesh.vertices, mesh.uvs); // For normal mapping
    mesh.addFace(face);
  }
}
```

### 4. Example: Sphere Implementation

```javascript
/**
 * Create a sphere primitive
 * @param {Object} params - Sphere parameters
 * @param {number} params.radius - Sphere radius
 * @param {number} params.widthSegments - Number of horizontal segments
 * @param {number} params.heightSegments - Number of vertical segments
 * @param {string} params.name - Mesh name
 * @returns {EditableMesh} Sphere mesh
 */
export function createSphere(params = {}) {
  const {
    radius = 0.5,
    widthSegments = 32,
    heightSegments = 16,
    name = 'Sphere'
  } = params;

  const mesh = new EditableMesh({ name });
  const vertices = [];

  // Create vertices
  for (let y = 0; y <= heightSegments; y++) {
    const phi = (y / heightSegments) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    for (let x = 0; x <= widthSegments; x++) {
      const theta = (x / widthSegments) * 2 * Math.PI;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const px = radius * sinPhi * cosTheta;
      const py = radius * cosPhi;
      const pz = radius * sinPhi * sinTheta;

      const vertex = new Vertex(px, py, pz);
      
      // Calculate normal (same as position for unit sphere)
      const nx = sinPhi * cosTheta;
      const ny = cosPhi;
      const nz = sinPhi * sinTheta;
      const normalLength = Math.sqrt(nx * nx + ny * ny + nz * nz);
      vertex.setNormal(nx / normalLength, ny / normalLength, nz / normalLength);
      
      vertices.push(vertex);
      mesh.addVertex(vertex);

      // Add UV coordinates
      const uv = new UV(x / widthSegments, y / heightSegments, vertex.id);
      mesh.addUV(uv);
    }
  }

  // Create faces
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < widthSegments; x++) {
      const a = y * (widthSegments + 1) + x;
      const b = y * (widthSegments + 1) + x + 1;
      const c = (y + 1) * (widthSegments + 1) + x + 1;
      const d = (y + 1) * (widthSegments + 1) + x;

      // Create two triangular faces
      const face1 = new Face([vertices[a].id, vertices[b].id, vertices[c].id]);
      const face2 = new Face([vertices[a].id, vertices[c].id, vertices[d].id]);

      // Calculate face normals
      face1.calculateNormal(mesh.vertices);
      face2.calculateNormal(mesh.vertices);

      // Calculate tangents for normal mapping
      face1.calculateTangents(mesh.vertices, mesh.uvs);
      face2.calculateTangents(mesh.vertices, mesh.uvs);

      mesh.addFace(face1);
      mesh.addFace(face2);
    }
  }

  return mesh;
}
```

## Advanced Features

### 1. Position, Scale, Rotation
Add common transformation parameters:

```javascript
export function createCube(params = {}) {
  const {
    width = 1, height = 1, depth = 1,
    x = 0, y = 0, z = 0,           // Position
    scaleX = 1, scaleY = 1, scaleZ = 1, // Scale
    rotationX = 0, rotationY = 0, rotationZ = 0, // Rotation
    name = 'Cube'
  } = params;

  // Apply transformations when creating vertices
  // ...
}
```

### 2. Material Support
Add material parameters:

```javascript
export function createSphere(params = {}) {
  const {
    radius = 0.5,
    material = {
      name: 'Default',
      type: 'standard',
      color: { r: 0.8, g: 0.8, b: 0.8 }
    },
    name = 'Sphere'
  } = params;

  const mesh = new EditableMesh({ name, material });
  // ...
}
```

### 3. Validation and Error Handling
Always validate your meshes:

```javascript
export function createPrimitive(params = {}) {
  const mesh = new EditableMesh({ name: params.name });
  
  // Build geometry...
  
  // Validate and fix issues
  const validation = mesh.validate();
  if (!validation.isValid) {
    console.warn('Mesh validation issues:', validation.errors);
    mesh.fixIssues();
  }
  
  return mesh;
}
```

## Usage Examples

### Basic Usage
```javascript
import { createCube, createSphere } from './primitives/index.js';

// Create with defaults
const cube = createCube();
const sphere = createSphere();

// Create with custom parameters
const bigCube = createCube({ 
  width: 2, height: 2, depth: 2, 
  name: 'BigCube' 
});

const smoothSphere = createSphere({ 
  radius: 1.5, 
  widthSegments: 64, 
  heightSegments: 32,
  name: 'SmoothSphere'
});
```

### Advanced Usage
```javascript
// Create with transformations
const transformedCube = createCube({
  width: 1, height: 1, depth: 1,
  x: 5, y: 0, z: 0,           // Position
  scaleX: 2, scaleY: 1, scaleZ: 1, // Scale
  rotationX: Math.PI / 4,      // 45° rotation
  name: 'TransformedCube'
});

// Create with custom material
const coloredSphere = createSphere({
  radius: 1,
  material: {
    name: 'RedSphere',
    type: 'phong',
    color: { r: 1.0, g: 0.0, b: 0.0 },
    roughness: 0.2,
    metalness: 0.8
  },
  name: 'RedSphere'
});
```

## Best Practices

### 1. Documentation
- Use comprehensive JSDoc for all parameters
- Document default values
- Include usage examples

### 2. Error Handling
- Validate input parameters
- Provide sensible defaults
- Handle edge cases gracefully

### 3. Performance
- Reuse calculations where possible
- Minimize object creation in loops
- Use efficient algorithms for complex primitives

### 4. Testing
- Test with minimal parameters
- Test with maximum parameters
- Test edge cases (zero values, negative values)
- Validate output meshes

### 5. Extensibility
- Design for future enhancements
- Keep functions pure and predictable
- Allow for custom attributes and metadata

## Checklist for New Primitives

- [ ] Create separate file for the primitive
- [ ] Use options object with sensible defaults
- [ ] Document all parameters with JSDoc
- [ ] Generate vertices with proper positions
- [ ] Set vertex normals correctly
- [ ] Generate UV coordinates for texturing
- [ ] Create edges for wireframe display
- [ ] Create faces with proper winding order
- [ ] Calculate face normals automatically
- [ ] Calculate tangents for normal mapping
- [ ] Validate the final mesh
- [ ] Test with various parameter combinations
- [ ] Add to primitives index file
- [ ] Update documentation

## Conclusion

The flexible EditableMesh system allows you to create robust, user-friendly primitives that work with partial data and provide safe defaults. This approach makes your library more maintainable and easier to use for both developers and end users. 