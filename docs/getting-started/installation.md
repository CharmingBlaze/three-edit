# Installation Guide

## 📦 **Installation**

### **NPM Installation**

```bash
npm install three-edit
```

### **Yarn Installation**

```bash
yarn add three-edit
```

### **PNPM Installation**

```bash
pnpm add three-edit
```

## 🔧 **Peer Dependencies**

Three-Edit requires Three.js as a peer dependency:

```bash
npm install three
```

## 📋 **Requirements**

- **Node.js**: 16.0 or higher
- **Three.js**: ^0.150.0 or higher
- **TypeScript**: 5.0 or higher (recommended)

## 🚀 **Quick Setup**

### **1. Install Dependencies**

```bash
npm install three-edit three
```

### **2. Import and Use**

```typescript
import { createCube, toBufferGeometry } from 'three-edit';
import * as THREE from 'three';

// Create a mesh
const mesh = createCube({ width: 2, height: 2, depth: 2 });

// Convert to Three.js geometry
const geometry = toBufferGeometry(mesh);

// Create Three.js mesh
const material = new THREE.MeshBasicMaterial();
const threeMesh = new THREE.Mesh(geometry, material);
```

## 🔧 **Development Setup**

### **Clone Repository**

```bash
git clone https://github.com/your-username/three-edit.git
cd three-edit
```

### **Install Dependencies**

```bash
npm install
```

### **Run Tests**

```bash
npm test
```

### **Build Library**

```bash
npm run build
```

## 📦 **Bundle Formats**

Three-Edit is distributed in multiple formats:

- **ESM**: `dist/index.mjs` - Modern ES modules
- **CJS**: `dist/index.js` - CommonJS for Node.js
- **UMD**: `dist/index.umd.js` - Universal module definition
- **Types**: `dist/index.d.ts` - TypeScript declarations

## 🌐 **CDN Usage**

You can also use Three-Edit via CDN:

```html
<script src="https://unpkg.com/three-edit@latest/dist/index.umd.js"></script>
<script>
  const mesh = ThreeEdit.createCube({ width: 2, height: 2, depth: 2 });
  const geometry = ThreeEdit.toBufferGeometry(mesh);
</script>
```

## 🔍 **TypeScript Support**

Three-Edit is written in TypeScript and includes full type definitions:

```typescript
import { createCube, CreateCubeOptions } from 'three-edit';

const options: CreateCubeOptions = {
  width: 2,
  height: 2,
  depth: 2,
  name: 'MyCube'
};

const mesh = createCube(options);
```

## 🧪 **Testing**

Run the test suite to verify your installation:

```bash
npm test
```

This will run 117 tests covering all core functionality.

## 🐛 **Troubleshooting**

### **Common Issues**

#### **TypeScript Errors**
If you encounter TypeScript errors, ensure you have the latest version:

```bash
npm install typescript@latest
```

#### **Three.js Version Conflicts**
Make sure you're using a compatible Three.js version:

```bash
npm install three@^0.150.0
```

#### **Module Resolution Issues**
If you're having module resolution issues, check your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### **Getting Help**

- 📖 **Documentation**: Check the [API Reference](../api/)
- 🐛 **Issues**: Report bugs on [GitHub Issues](https://github.com/your-username/three-edit/issues)
- 💬 **Discussions**: Join discussions on [GitHub Discussions](https://github.com/your-username/three-edit/discussions)

## 📚 **Next Steps**

After installation, check out:

- [Quick Start Tutorial](./quick-start.md)
- [Basic Concepts](./concepts.md)
- [API Reference](../api/)

---

*Last Updated: [Current Date]*
*Version: 0.1.0* 