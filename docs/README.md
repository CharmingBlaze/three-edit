# Three-Edit Documentation

Welcome to the Three-Edit library documentation! This is a modular headless 3D editing library for Three.js.

## 📚 **Documentation Sections**

### **Getting Started**
- [Installation Guide](./getting-started/installation.md)
- [Quick Start Tutorial](./getting-started/quick-start.md)
- [Basic Concepts](./getting-started/concepts.md)
- [Common Patterns](./getting-started/patterns.md)

### **API Reference**
- [Core Classes](./api/core.md)
- [Primitives](./api/primitives.md)
- [Editing Operations](./api/editing.md)
- [Selection & Query](./api/selection.md)
- [Transformations](./api/transform.md)
- [Materials](./api/materials.md)
- [UV Mapping](./api/uv.md)
- [Validation](./api/validation.md)
- [Conversion](./api/conversion.md)

### **Guides**
- [Creating Custom Primitives](./guides/custom-primitives.md)
- [Advanced Editing](./guides/advanced-editing.md)
- [Performance Optimization](./guides/performance.md)
- [Best Practices](./guides/best-practices.md)
- [Troubleshooting](./guides/troubleshooting.md)

### **Examples**
- [Basic Examples](./examples/basic.md)
- [Advanced Examples](./examples/advanced.md)
- [Interactive Demos](./examples/demos.md)
- [Performance Benchmarks](./examples/benchmarks.md)

### **Developer**
- [Contributing Guidelines](./developer/contributing.md)
- [Architecture Overview](./developer/architecture.md)
- [Plugin Development](./developer/plugins.md)
- [Testing Guide](./developer/testing.md)

---

## 🚀 **Quick Start**

```typescript
import { createCube, toBufferGeometry } from 'three-edit';

// Create a cube
const mesh = createCube({ width: 2, height: 2, depth: 2 });

// Convert to Three.js geometry
const geometry = toBufferGeometry(mesh);
```

## 📦 **Installation**

```bash
npm install three-edit
```

## 🎯 **Key Features**

- **Modular Design**: Small, focused modules for easy maintenance
- **Type Safety**: Full TypeScript support with strict typing
- **Three.js Integration**: Seamless conversion to Three.js geometries
- **Geometry Integrity**: Automatic validation and repair tools
- **Comprehensive Primitives**: 20+ built-in 3D primitives
- **Advanced Materials**: Per-face material assignment system
- **UV Mapping**: Planar, cylindrical, and spherical UV generation
- **Performance Optimized**: Efficient algorithms and data structures

## 📊 **Current Status**

- ✅ **Core System**: Complete
- ✅ **Primitives**: 20 primitives implemented
- ✅ **Validation**: Complete with 117 tests
- ✅ **Materials**: Complete
- ✅ **UV System**: Complete
- 🔄 **Documentation**: In Progress
- 🔄 **Advanced Features**: Planned

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](./developer/contributing.md) for details.

## 📄 **License**

MIT License - see [LICENSE](../LICENSE) for details.

---

*Last Updated: [Current Date]*
*Version: 0.1.0* 