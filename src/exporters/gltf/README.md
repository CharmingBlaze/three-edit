# GLTF Import/Export System

A comprehensive, modular GLTF 2.0 import/export system for three-edit that provides safe, lossless conversion between GLTF/GLB files and the internal EditableMesh and SceneGraph formats.

## 🏗️ Architecture

The system is built with a modular architecture for maintainability and extensibility:

```
src/exporters/gltf/
├── types.ts           # Complete GLTF 2.0 type definitions
├── options.ts         # Import/export configuration options
├── gltf-utils.ts      # Shared utility functions
├── importGLTF.ts      # GLTF/GLB import functionality
├── exportGLTF.ts      # GLTF/GLB export functionality
└── index.ts           # Public API and GLTFManager class
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { GLTFManager } from 'three-edit/exporters/gltf';
import { createCube } from 'three-edit/primitives';
import { SceneGraph, SceneNode } from 'three-edit/scene';

// Create a scene with a cube
const sceneGraph = new SceneGraph();
const cube = createCube();
const node = new SceneNode({ name: 'MyCube', mesh: cube });
sceneGraph.addNode(node);

// Export to GLTF
const gltfBlob = await GLTFManager.export(sceneGraph, {
  binary: false,
  includeNormals: true,
  includeUVs: true
});

// Export to GLB (binary)
const glbBlob = await GLTFManager.export(sceneGraph, {
  binary: true,
  includeMaterials: true
});

// Save to file (browser)
await GLTFManager.save(sceneGraph, 'my-model.gltf');
await GLTFManager.save(sceneGraph, 'my-model.glb', { binary: true });
```

### Import GLTF Files

```typescript
// Import from URL
const sceneGraph = await GLTFManager.import('https://example.com/model.gltf');

// Import from buffer (GLB files)
const response = await fetch('model.glb');
const buffer = await response.arrayBuffer();
const sceneGraph = await GLTFManager.importBuffer(buffer);

// Import just the mesh
const mesh = await GLTFManager.importMesh('model.gltf');
```

## 📋 API Reference

### GLTFManager Class

The main interface for all GLTF operations.

#### Import Methods

- `GLTFManager.import(url, options)` - Import GLTF from URL
- `GLTFManager.importBuffer(buffer, options)` - Import GLTF from buffer
- `GLTFManager.importMesh(url, options)` - Import single mesh from GLTF

#### Export Methods

- `GLTFManager.export(sceneGraph, options)` - Export SceneGraph to GLTF
- `GLTFManager.exportMesh(mesh, options)` - Export single mesh to GLTF
- `GLTFManager.exportMeshes(meshes, options)` - Export multiple meshes to GLTF

#### File Operations

- `GLTFManager.save(sceneGraph, filename, options)` - Save SceneGraph to file
- `GLTFManager.saveMesh(mesh, filename, options)` - Save mesh to file

#### Utility Methods

- `GLTFManager.validate(gltf)` - Validate GLTF structure
- `GLTFManager.createDefault()` - Create default GLTF asset
- `GLTFManager.merge(gltfFiles)` - Merge multiple GLTF files

### Import Options

```typescript
interface GLTFImportOptions {
  includeNormals?: boolean;      // Include vertex normals
  includeUVs?: boolean;          // Include texture coordinates
  includeMaterials?: boolean;    // Include material information
  includeAnimations?: boolean;   // Include animations
  includeSkins?: boolean;        // Include skins/bones
  scale?: number;                // Scale factor for coordinates
  flipY?: boolean;               // Flip Y coordinates
  flipZ?: boolean;               // Flip Z coordinates
  preserveHierarchy?: boolean;   // Preserve node hierarchy
  mergeMeshes?: boolean;         // Merge all meshes into one
  validateGeometry?: boolean;    // Validate geometry on import
  autoRepair?: boolean;          // Auto-repair geometry issues
}
```

### Export Options

```typescript
interface GLTFExportOptions {
  binary?: boolean;              // Export as binary GLB
  includeNormals?: boolean;      // Include vertex normals
  includeUVs?: boolean;          // Include texture coordinates
  includeMaterials?: boolean;    // Include material information
  includeAnimations?: boolean;   // Include animations
  includeSkins?: boolean;        // Include skins/bones
  scale?: number;                // Scale factor for coordinates
  flipY?: boolean;               // Flip Y coordinates
  flipZ?: boolean;               // Flip Z coordinates
  embedBinary?: boolean;         // Embed binary data
  optimize?: boolean;            // Optimize for size
  includeExtras?: boolean;       // Include extras data
  validateBeforeExport?: boolean; // Validate before export
  maxTextureSize?: number;       // Maximum texture size
  compressTextures?: boolean;    // Compress textures
  textureQuality?: number;       // Texture compression quality
}
```

## 🔧 Advanced Usage

### Custom Material Conversion

```typescript
// Custom material converter for import
const sceneGraph = await GLTFManager.import('model.gltf', {
  materialConverter: (gltfMaterial) => {
    // Convert GLTF material to your format
    return {
      name: gltfMaterial.name,
      color: gltfMaterial.pbrMetallicRoughness?.baseColorFactor,
      // ... other properties
    };
  }
});

// Custom material exporter for export
const blob = await GLTFManager.export(sceneGraph, {
  materialExporter: (material) => {
    // Convert your material to GLTF format
    return {
      pbrMetallicRoughness: {
        baseColorFactor: material.color,
        metallicFactor: material.metallic,
        roughnessFactor: material.roughness
      }
    };
  }
});
```

### Coordinate System Transformations

```typescript
// Import with coordinate transformations
const sceneGraph = await GLTFManager.import('model.gltf', {
  scale: 0.1,        // Scale down by 10x
  flipY: true,       // Flip Y coordinates
  flipZ: false       // Keep Z coordinates as-is
});

// Export with coordinate transformations
const blob = await GLTFManager.export(sceneGraph, {
  scale: 100,        // Scale up by 100x
  flipY: false,      // Keep Y coordinates as-is
  flipZ: true        // Flip Z coordinates
});
```

### Geometry Validation and Repair

```typescript
// Import with automatic validation and repair
const sceneGraph = await GLTFManager.import('model.gltf', {
  validateGeometry: true,
  autoRepair: true
});

// Export with validation
const blob = await GLTFManager.export(sceneGraph, {
  validateBeforeExport: true
});
```

### Working with Multiple Meshes

```typescript
// Import multiple meshes
const meshes = await GLTFManager.importMeshes('model.gltf');

// Export multiple meshes
const meshes = [mesh1, mesh2, mesh3];
const blob = await GLTFManager.exportMeshes(meshes, {
  binary: true,
  includeMaterials: true
});
```

## 🛡️ Best Practices

### Import Best Practices

1. **Always validate geometry** when importing from untrusted sources
2. **Use coordinate transformations** to match your coordinate system
3. **Preserve hierarchy** when you need to maintain scene structure
4. **Merge meshes** when you want to simplify the scene graph

### Export Best Practices

1. **Validate before export** to catch issues early
2. **Choose appropriate format** (GLTF for text, GLB for binary)
3. **Optimize for your use case** (size vs. features)
4. **Include necessary attributes** (normals, UVs, materials)

### Performance Considerations

1. **Use binary GLB** for better compression and faster loading
2. **Optimize texture sizes** to balance quality and performance
3. **Consider mesh merging** for simpler scenes
4. **Validate selectively** to avoid unnecessary processing

## 🔍 Validation

The system includes comprehensive validation:

```typescript
// Validate GLTF structure
const errors = GLTFManager.validate(gltfData);
if (errors.length > 0) {
  console.error('GLTF validation errors:', errors);
}

// Validate individual meshes
import { validateMesh } from 'three-edit/validation';
const validation = validateMesh(mesh);
if (!validation.isValid) {
  console.error('Mesh validation errors:', validation.errors);
}
```

## 🧪 Testing

The system includes comprehensive testing:

```typescript
// Test round-trip conversion
const originalScene = createTestScene();
const gltfBlob = await GLTFManager.export(originalScene);
const importedScene = await GLTFManager.importBuffer(await gltfBlob.arrayBuffer());

// Compare scenes
assert.deepEqual(originalScene.getAllNodes().length, importedScene.getAllNodes().length);
```

## 🚧 Future Enhancements

- [ ] Morph target support
- [ ] Animation export/import
- [ ] Custom GLTF extensions
- [ ] Texture compression
- [ ] LOD (Level of Detail) support
- [ ] Skeletal animation
- [ ] Physics metadata
- [ ] Batch processing tools

## 📝 Migration from Legacy System

The new system is backward compatible with the legacy GLTF functions:

```typescript
// Legacy usage (still works)
import { parseGLTF, exportGLTF } from 'three-edit/io';

// New usage (recommended)
import { GLTFManager } from 'three-edit/exporters/gltf';
```

## 🤝 Contributing

When contributing to the GLTF system:

1. Follow the modular architecture
2. Add comprehensive tests
3. Update documentation
4. Validate against the GLTF 2.0 specification
5. Test with real-world GLTF files

## 📚 Resources

- [GLTF 2.0 Specification](https://www.khronos.org/gltf/)
- [Three.js GLTF Loader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
- [Three.js GLTF Exporter](https://threejs.org/docs/#examples/en/exporters/GLTFExporter)
- [GLTF Validator](https://github.khronos.org/glTF-Validator/) 