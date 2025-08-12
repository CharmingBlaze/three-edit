# Three-Edit

A powerful, modular 3D editing library built on Three.js with a comprehensive set of tools for mesh manipulation, geometry operations, and 3D content creation.

## Overview

Three-Edit is a headless 3D editing library designed for integration into existing 3D applications, game engines, and creative tools. It provides a robust foundation for building advanced 3D editing capabilities without being tied to any specific UI framework.

## Key Features

### Core Architecture
- **Modular Design**: Clean separation of concerns with independent modules for different editing operations
- **Headless Implementation**: No UI dependencies, perfect for integration into existing applications
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **Performance Optimized**: Efficient algorithms and data structures for handling large meshes

### Mesh Operations
- **Primitive Creation**: Generate basic and complex 3D shapes with customizable parameters
- **Boolean Operations**: Union, intersection, and difference operations between meshes
- **Extrusion Tools**: Face, edge, and vertex extrusion with customizable options
- **Bevel Operations**: Edge and face beveling with smooth transitions
- **Knife Tool**: Precise mesh cutting along lines, paths, and circular patterns
- **Loop Cutting**: Subdivision and loop-based mesh modification
- **Bridge Operations**: Connect separate mesh components seamlessly

### Advanced Features
- **UV Mapping**: Automatic and manual UV coordinate generation
- **Material System**: Flexible material assignment and management
- **Animation Support**: Keyframe animation and skeletal deformation
- **Import/Export**: Support for glTF, OBJ, PLY, STL, and other 3D formats
- **Validation**: Comprehensive geometry validation and repair tools
- **Performance Tools**: LOD generation, mesh simplification, and optimization

### Developer Experience
- **Comprehensive API**: Well-documented functions with clear parameter interfaces
- **Error Handling**: Robust error handling with detailed feedback
- **Testing Suite**: Extensive test coverage for all major functionality
- **Examples**: Rich collection of examples and demos
- **Documentation**: Detailed API reference and usage guides

## Installation

### npm
```bash
npm install @ghost9000/three-edit
```

### yarn
```bash
yarn add @ghost9000/three-edit
```

### pnpm
```bash
pnpm add @ghost9000/three-edit
```

### CDN
```html
<!-- ES6 Module -->
<script type="importmap">
{
  "imports": {
    "@ghost9000/three-edit": "https://unpkg.com/@ghost9000/three-edit@1.2.0/dist/index.global.js"
  }
}
</script>
<script type="module">
  import { createCube, createSphere } from '@ghost9000/three-edit';
</script>

<!-- UMD/IIFE -->
<script src="https://unpkg.com/@ghost9000/three-edit@1.2.0/dist/index.global.js"></script>
<script>
  const { createCube, createSphere } = window.threeEdit;
</script>
```

## Quick Start

### Basic Mesh Creation
```typescript
import { createCube, EditableMesh } from 'three-edit';

// Create a basic cube
const cube = createCube({ 
  width: 2, 
  height: 2, 
  depth: 2 
});

// Access mesh properties
console.log(`Cube has ${cube.vertices.length} vertices`);
console.log(`Cube has ${cube.faces.length} faces`);
```

### Mesh Editing Operations
```typescript
import { knifeCut, Vector3 } from 'three-edit';

// Perform a knife cut
const cutResult = knifeCut(cube, [{
  start: new Vector3(-1, 0, 0),
  end: new Vector3(1, 0, 0)
}]);

if (cutResult.success) {
  console.log(`Created ${cutResult.verticesCreated} new vertices`);
  console.log(`Split ${cutResult.facesSplit} faces`);
}
```

### Boolean Operations
```typescript
import { booleanUnion, createSphere } from 'three-edit';

const sphere = createSphere({ radius: 1 });
const unionResult = booleanUnion(cube, sphere);

if (unionResult.success) {
  console.log('Boolean union completed successfully');
}
```

## Architecture

### Core Components
- **EditableMesh**: Central mesh representation with vertex, edge, and face management
- **Geometry Operations**: Mathematical operations for mesh manipulation
- **Validation System**: Tools for ensuring mesh integrity and quality
- **Import/Export**: Format converters for various 3D file types

### Module Structure
```
src/
├── core/           # Core mesh classes and data structures
├── primitives/     # Basic shape generators
├── editing/        # Mesh editing operations
├── operations/     # Advanced geometric operations
├── validation/     # Mesh validation and repair
├── io/            # Import/export functionality
├── helpers/        # Utility functions and helpers
└── integration/    # Third-party framework integration
```

## API Reference

### Core Classes
- `EditableMesh`: Main mesh class with comprehensive editing capabilities
- `Vertex`: Vertex representation with position, normal, and UV data
- `Edge`: Edge representation connecting two vertices
- `Face`: Face representation with vertex and edge references

### Primitive Functions
- `createCube()`: Generate cubic meshes with customizable dimensions
- `createSphere()`: Create spherical meshes with segment control
- `createCylinder()`: Generate cylindrical meshes with open/closed options
- `createCone()`: Create conical meshes with customizable parameters
- `createTorus()`: Generate toroidal meshes with ring and tube segments

### Editing Operations
- `knifeCut()`: Cut mesh along specified lines or paths
- `extrudeFace()`: Extrude faces with customizable depth and direction
- `bevelEdge()`: Bevel edges with smooth transitions
- `booleanUnion()`: Combine meshes using boolean operations
- `subdivideFace()`: Subdivide faces for increased detail

## Examples and Demos

### Interactive Examples
- **Basic Editor**: Simple 3D editor with primitive creation and editing
- **Advanced Operations**: Complex boolean operations and mesh manipulation
- **Performance Demo**: Large mesh handling and optimization techniques
- **Import/Export**: File format conversion and compatibility testing

### Code Examples
- **Mesh Creation**: Building complex meshes from basic primitives
- **Editing Workflows**: Complete editing pipelines from start to finish
- **Integration**: Embedding Three-Edit in existing Three.js applications
- **Custom Tools**: Building specialized editing tools and operations

## Performance Considerations

### Optimization Strategies
- **LOD Generation**: Automatic level-of-detail creation for performance
- **Mesh Simplification**: Reducing polygon count while preserving quality
- **Spatial Indexing**: Efficient spatial queries and collision detection
- **Memory Management**: Optimized data structures and garbage collection

### Best Practices
- Use appropriate mesh complexity for your target platform
- Implement progressive loading for large meshes
- Leverage LOD systems for distance-based detail reduction
- Profile performance in your specific use case

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **WebGL Support**: Requires WebGL 2.0 or WebGL 1.0 with extensions
- **Mobile Support**: iOS Safari 13+, Chrome Mobile 80+, Samsung Internet 12+

## Contributing

We welcome contributions from the community! Please see our contributing guidelines for:

- **Code Standards**: TypeScript, ESLint, and Prettier configuration
- **Testing Requirements**: Comprehensive test coverage expectations
- **Documentation**: API documentation and example updates
- **Issue Reporting**: Bug reports and feature request guidelines

### Development Setup
```bash
git clone https://github.com/CharmingBlaze/three-edit.git
cd three-edit
npm install
npm run dev
```

### Testing
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage reports
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Three.js Community**: Built on the excellent Three.js foundation
- **Contributors**: All the developers who have contributed to this project
- **Open Source**: Built with and for the open source community

## Support and Community

- **Documentation**: Comprehensive guides and API reference
- **Examples**: Working examples for all major features
- **Issues**: GitHub issues for bug reports and feature requests
- **Discussions**: Community discussions and Q&A

## Roadmap

### Upcoming Features
- **Advanced UV Tools**: Automatic UV unwrapping and optimization
- **Mesh Repair**: Automated geometry validation and repair
- **Performance Improvements**: GPU acceleration and optimization
- **Extended Format Support**: Additional import/export formats

### Long-term Goals
- **Real-time Collaboration**: Multi-user editing capabilities
- **Plugin System**: Extensible architecture for custom tools
- **Cloud Integration**: Cloud-based mesh processing and storage
- **AI-Assisted Editing**: Machine learning for intelligent mesh manipulation

---

**Three-Edit**: Empowering developers to create sophisticated 3D editing experiences with a robust, modular, and performant library.
