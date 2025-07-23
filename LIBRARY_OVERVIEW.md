# Three-Edit Library Overview

**Three-Edit** is a comprehensive, modular 3D mesh editing library designed specifically for Three.js applications. It provides a complete toolkit for creating, manipulating, and managing 3D geometry in a structured and efficient manner.

## 🏗️ Architecture Overview

Three-Edit is built with a modular architecture that separates concerns and allows for selective usage of features. The library is completely headless, meaning it doesn't depend on any specific rendering or UI framework, making it perfect for integration into existing Three.js applications.

### Core Design Principles

- **Modularity**: Each feature is self-contained and can be used independently
- **Type Safety**: Built with TypeScript for robust development experience
- **Performance**: Optimized for real-time 3D applications
- **Extensibility**: Easy to extend with custom operations and primitives
- **Three.js Integration**: Seamless conversion to and from Three.js BufferGeometry

## 📦 Core Components

### 1. Core Mesh System (`src/core/`)

The foundation of the library, providing the fundamental data structures for 3D mesh representation:

- **EditableMesh**: The main container class that holds vertices, edges, and faces
- **Vertex**: Represents a 3D point with position and optional attributes
- **Edge**: Defines connections between vertices
- **Face**: Triangular or polygonal surfaces bounded by edges
- **Skeleton & Bone System**: Advanced skeletal animation support
- **Skin**: Weight-based vertex deformation system

### 2. Primitive Creation (`src/primitives/`)

Comprehensive set of 3D primitive generators with Three.js-style API:

**Basic Primitives:**
- `createCube()` - Box geometry with customizable dimensions
- `createSphere()` - Spherical geometry with configurable resolution
- `createCylinder()` - Cylindrical geometry
- `createCone()` - Conical geometry
- `createPlane()` - Flat rectangular surface
- `createTorus()` - Ring-shaped geometry
- `createCircle()` - 2D circular geometry

**Platonic Solids:**
- `createTetrahedron()` - 4-sided regular polyhedron
- `createOctahedron()` - 8-sided regular polyhedron
- `createDodecahedron()` - 12-sided regular polyhedron
- `createIcosahedron()` - 20-sided regular polyhedron

**Advanced Primitives:**
- `createTorusKnot()` - Complex torus knot geometry
- `createCapsule()` - Rounded cylinder with hemispherical ends
- `createRoundedBox()` - Box with rounded corners
- `createStairs()` - Procedural staircase generation
- `createRamp()` - Inclined plane geometry
- `createArrow()` - Arrow-shaped geometry
- `createPipe()` - Tubular geometry
- `createMobiusStrip()` - Non-orientable surface
- `createGreebleBlock()` - Sci-fi style detailed block

### 3. Editing Operations (`src/editing/`)

Powerful mesh manipulation tools for real-time geometry editing:

- **Extrusion**: `extrudeFace()`, `extrudeEdge()` - Push/pull geometry
- **Beveling**: `bevelEdge()` - Smooth edge transitions
- **Inset**: `insetFaces()` - Create inset faces
- **Bridge**: `bridgeEdges()` - Connect separate edge loops
- **Knife Tool**: `knife()` - Cut geometry along paths
- **Loop Cut**: `loopCut()` - Add edge loops for subdivision

### 4. Transform System (`src/transform/`)

Comprehensive transformation operations:

- **Basic Transforms**: `move()`, `rotate()`, `scale()`
- **Array Operations**: `array()` - Duplicate geometry in patterns
- **Mirror**: `mirror()` - Symmetrical duplication
- **Deformation**: `bend()`, `taper()`, `twist()` - Non-linear transformations
- **Noise**: `perlinNoise()` - Procedural surface displacement

### 5. Selection System (`src/selection/`)

Advanced selection mechanisms for precise geometry manipulation:

- **Ray Selection**: `selectByRay()` - Click-based selection
- **Box Selection**: `selectByBox()`, `selectByCircle()` - Area selection
- **Lasso Selection**: `selectByLasso()` - Free-form selection
- **Connected Selection**: `selectConnected()` - Topology-based selection
- **Similar Selection**: `selectSimilar()` - Attribute-based selection
- **Advanced Queries**: Complex selection patterns and filters

### 6. Scene Graph System (`src/scene/`)

Hierarchical object management with transform inheritance:

- **SceneGraph**: Main container for scene hierarchy
- **SceneNode**: Individual nodes with transform and geometry
- **Node Utilities**: Tree traversal, flattening, and manipulation
- **Three.js Integration**: Direct conversion to Three.js Object3D hierarchy

### 7. Boolean Operations (`src/operations/`)

Constructive Solid Geometry (CSG) operations:

- **Union**: Combine multiple meshes
- **Intersection**: Find overlapping volumes
- **Difference**: Subtract one mesh from another
- **Advanced Boolean**: Complex multi-object operations

### 8. Import/Export System (`src/io/`, `src/exporters/`)

Comprehensive file format support:

**Import Formats:**
- GLTF/GLB (primary format)
- OBJ
- PLY
- STL
- FBX
- 3DS
- Collada (DAE)

**Export Formats:**
- GLTF/GLB with full material and animation support
- Custom export options and optimization

### 9. Material System (`src/materials/`)

Advanced material management:

- **MaterialManager**: Centralized material handling
- **Material Assignment**: `assignMaterial()` - Apply materials to geometry
- **UV Generation**: Automatic texture coordinate generation
- **Material Types**: Support for various Three.js material types

### 10. History System (`src/history/`)

Undo/Redo functionality for all operations:

- **CommandHistory**: Main history manager
- **Command Pattern**: Individual operation commands
- **Serialization**: Save/restore operation history
- **Event System**: History change notifications

### 11. Performance Optimization (`src/performance/`)

Advanced performance features:

- **GPU Acceleration**: WebGL-based operations
- **Level of Detail (LOD)**: Adaptive mesh complexity
- **Memory Optimization**: Efficient data structures
- **Octree**: Spatial partitioning for fast queries
- **Mesh Simplification**: Automatic polygon reduction

### 12. Validation & Repair (`src/validation/`)

Mesh integrity and repair tools:

- **Geometry Validation**: `validateMesh()` - Check mesh integrity
- **Winding Order**: `fixWindingOrder()` - Correct face orientation
- **Mesh Repair**: `repairMesh()` - Automatic geometry fixes
- **Topology Validation**: Edge and vertex consistency checks

### 13. Query System (`src/query/`)

Advanced geometry querying capabilities:

- **Nearest Point**: Find closest geometry to a point
- **Raycasting**: Intersection testing
- **Topology Queries**: Edge, face, and vertex relationships
- **Geometry Analysis**: Volume, surface area, bounding box calculations

### 14. UV System (`src/uv/`)

Texture coordinate management:

- **Automatic UV Generation**: `generateUVs()` - Smart texture mapping
- **UV Projection**: Planar, cylindrical, spherical, cubic mapping
- **UV Transformation**: Scale, rotate, and translate UV coordinates
- **UV Optimization**: Efficient texture space usage

## 🔧 Integration & Usage

### Three.js Integration

Seamless conversion between Three-Edit and Three.js:

```typescript
import { createCube, toBufferGeometry, fromBufferGeometry } from 'three-edit';

// Create Three-Edit mesh
const mesh = createCube();

// Convert to Three.js BufferGeometry
const geometry = toBufferGeometry(mesh);

// Convert from Three.js BufferGeometry
const editableMesh = fromBufferGeometry(geometry);
```

### JavaScript Support

Full JavaScript support through dedicated wrapper:

```javascript
import ThreeEditJS from 'three-edit/js-wrapper';

const cube = ThreeEditJS.createCube();
const geometry = ThreeEditJS.toBufferGeometry(cube);
```

### Browser Usage

Direct browser usage without build tools:

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js"></script>
<script src="path/to/three-edit/browser/three-edit.js"></script>
<script>
  const cube = ThreeEdit.createCube();
  const geometry = ThreeEdit.toBufferGeometry(cube);
</script>
```

## 🚀 Key Features

### Advanced Selection
- Multiple selection modes (ray, box, lasso, connected)
- Selection filters and queries
- Selection history and persistence

### Real-time Editing
- Live mesh manipulation
- Immediate visual feedback
- Optimized for interactive applications

### Scene Management
- Full hierarchical scene graph
- Transform inheritance
- Object parenting and grouping

### Animation Support
- Skeletal animation system
- Weight painting tools
- Morph target support
- Animation timeline management

### Performance Features
- GPU-accelerated operations
- Level of detail system
- Memory optimization
- Spatial partitioning

### File Format Support
- Industry-standard formats
- Full material and animation preservation
- Optimized import/export

## 🎯 Use Cases

Three-Edit is ideal for:

- **3D Modeling Applications**: Real-time mesh editing tools
- **Game Development**: Procedural geometry generation
- **CAD Applications**: Precision modeling and manipulation
- **Visualization Tools**: Interactive 3D data representation
- **Educational Software**: 3D geometry learning platforms
- **Prototyping**: Rapid 3D concept development

## 🔮 Future Roadmap

The library continues to evolve with planned features including:

- Advanced subdivision surface modeling
- Procedural texture generation
- Real-time collaboration features
- Extended file format support
- Advanced animation tools
- Performance optimizations

---

*Three-Edit provides a complete foundation for building sophisticated 3D editing applications while maintaining the flexibility and performance required for modern web-based 3D experiences.*
