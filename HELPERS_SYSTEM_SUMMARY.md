# Three-Edit Modular Helper System - Complete Implementation

## 🎯 Overview
The three-edit library now has a complete, modular helper system that provides reusable functions for creating primitives, manipulating geometry, and performing common 3D operations. All helpers are organized into focused, manageable modules that can be easily imported and used.

## 🧮 1. Math Utilities (`src/helpers/math.ts`)

**Low-level math utilities for precision-safe calculations, clamping, angle conversion, etc.**

### Key Functions:
```typescript
clamp(x: number, min: number, max: number): number
lerp(a: number, b: number, t: number): number
roundTo(x: number, decimals: number): number
isClose(a: number, b: number, epsilon?: number): boolean
degToRad(deg: number): number
radToDeg(rad: number): number
modulo(n: number, d: number): number
distance3D(a: Vector3, b: Vector3): number
distanceSquared3D(a: Vector3, b: Vector3): number
isValidTriangle(a: Vector3, b: Vector3, c: Vector3): boolean
triangleArea(a: Vector3, b: Vector3, c: Vector3): number
triangleCentroid(a: Vector3, b: Vector3, c: Vector3): Vector3
pointInTriangle(point: Vector3, a: Vector3, b: Vector3, c: Vector3): boolean
```

### Modular Math Extensions:
- **`src/helpers/math/vector-math.ts`**: Vector operations (dot/cross product, normalization, etc.)
- **`src/helpers/math/triangle-math.ts`**: Triangle-specific calculations (barycentric coordinates, circumcenter, etc.)

## 📐 2. Geometry Tools (`src/helpers/geometry.ts`)

**Generic geometric tools used across primitives, editing, and conversions.**

### Key Functions:
```typescript
triangulatePolygon(vertices: Vertex[], face: Face): Face[]
mergeVertices(vertices: Vertex[], faces: Face[], threshold: number): { newVertices, newFaces, vertexMap }
extrudeFace(vertices: Vertex[], face: Face, direction: Vector3, distance: number): { newVertices, newFaces }
subdivideFace(vertices: Vertex[], face: Face, addCenterVertex: boolean): { newVertices, newFaces }
calculateBoundingBox(vertices: Vertex[]): { min, max, center, size }
centerVertices(vertices: Vertex[], center: Vector3): void
scaleVertices(vertices: Vertex[], scale: Vector3): void
rotateVertices(vertices: Vertex[], axis: Vector3, angle: number): void
transformVertices(mesh: EditableMesh, matrix: Matrix4): void
createVertexGrid(width: number, height: number, generator: Function): Vertex[][]
createFacesFromGrid(grid: Vertex[][], materialIndex: number): Face[]
```

### Modular Geometry Extensions:
- **`src/helpers/geometry/vertex-operations.ts`**: Vertex manipulation (merge, center, scale, rotate, transform)
- **`src/helpers/geometry/face-operations.ts`**: Face operations (triangulate, subdivide, extrude)

## 🔗 3. Edge Helpers (`src/helpers/edge.ts`)

**Topology-aware edge helpers including seam detection and edge key generation.**

### Key Functions:
```typescript
generateEdgeKey(v1: number, v2: number): string
sortEdgeVertices(v1: number, v2: number): [number, number]
isUVSeam(edge: Edge, uvs: UV[]): boolean
findNonManifoldEdges(mesh: EditableMesh): Edge[]
getConnectedEdges(vertexId: number, mesh: EditableMesh): number[]
```

## 🎨 4. UV Mapping (`src/helpers/uv.ts`)

**UV mapping logic for primitives and UV tools.**

### Key Functions:
```typescript
generateBoxUVs(vertices: Vertex[], faces: Face[], params: BoxUVParams): void
generatePlanarUV(face: Face, axis: 'x' | 'y' | 'z'): UVCoord[]
generateSphericalUV(vertex: Vector3): UVCoord
scaleUVs(mesh: EditableMesh, scale: number): void
rotateUVs(mesh: EditableMesh, angle: number): void
validateUVMapping(mesh: EditableMesh): string[]
```

### Modular UV Extensions:
- **`src/helpers/primitives/uv-generators.ts`**: Specialized UV generation for primitives

## 🧭 5. Normal Calculations (`src/helpers/normal.ts`)

**For normal vector calculations used in shading and smooth lighting.**

### Key Functions:
```typescript
calculateFaceNormal(face: Face, vertices: Vertex[]): Vector3
calculateSmoothNormals(mesh: EditableMesh): void
normalizeNormals(mesh: EditableMesh): void
```

## 🧪 6. Validation (`src/helpers/validation.ts`)

**Validation utilities for mesh structure, primitives, and user input.**

### Key Functions:
```typescript
validatePrimitive(mesh: EditableMesh): PrimitiveValidationResult
validateTopology(mesh: EditableMesh): TopologyValidationResult
validatePrimitiveOptions(options: any, type: string): string[]
findOrphanedVertices(mesh: EditableMesh): number[]
findInvalidWindingOrder(mesh: EditableMesh): Face[]
```

## 🧱 7. Mesh Helpers (`src/helpers/mesh.ts`)

**Query and helper methods for EditableMesh objects.**

### Key Functions:
```typescript
getVertexNeighbors(vertexId: number, mesh: EditableMesh): number[]
getConnectedFaces(vertexId: number, mesh: EditableMesh): number[]
getUVCount(mesh: EditableMesh): number
getNormalCount(mesh: EditableMesh): number
getUniqueMaterialCount(mesh: EditableMesh): number
getFaceCenter(face: Face, vertices: Vertex[]): Vector3
```

## 🐞 8. Debug Utilities (`src/helpers/debug.ts`)

**Internal developer debugging utilities.**

### Key Functions:
```typescript
debugPrimitive(mesh: EditableMesh): void
printMeshStats(mesh: EditableMesh): void
validateMeshIntegrity(mesh: EditableMesh): string[]
```

## 🧱 9. Primitive Helpers (`src/helpers/primitives/`)

**Complete modular primitive creation system with multiple abstraction levels.**

### Core Modules:
- **`types.ts`**: Type definitions and interfaces
- **`vertex-generators.ts`**: Vertex creation functions
- **`face-generators.ts`**: Face creation functions  
- **`geometry-builders.ts`**: Complete geometry builders
- **`transform-helpers.ts`**: Vertex transformations
- **`uv-generators.ts`**: UV coordinate generation

### Shape Creation Modules:
- **`basic-shapes.ts`**: Simple primitives (cube, sphere, cylinder, etc.)
- **`complex-shapes.ts`**: Advanced shapes (torus knot, Mobius strip, etc.)
- **`parametric-shapes.ts`**: Mathematical surfaces (Klein bottle, helicoid, etc.)

### Key Functions:
```typescript
// High-level shape creation
createCube(width: number, height: number, depth: number): PrimitiveResult
createSphere(radius: number, segments: number): PrimitiveResult
createCylinder(radius: number, height: number, segments: number): PrimitiveResult
createTorus(radius: number, tube: number, segments: number): PrimitiveResult
createTorusKnot(p: number, q: number, radius: number, tube: number): PrimitiveResult

// Low-level building blocks
createVertex(x: number, y: number, z: number, options?: VertexOptions): Vertex
createFace(vertices: number[], options?: FaceOptions): Face
generateUVs(vertices: Vertex[], type: UVType): UVCoord[]
transformVertices(vertices: Vertex[], transform: TransformOptions): void
```

## 📦 Usage Examples

### Basic Import:
```typescript
import { 
  createCube, 
  createSphere, 
  clamp, 
  lerp,
  mergeVertices,
  generateBoxUVs 
} from 'three-edit/helpers';
```

### Modular Import:
```typescript
import { createVertex, createGridVertices } from 'three-edit/helpers/primitives/vertex-generators';
import { createFace, createGridFaces } from 'three-edit/helpers/primitives/face-generators';
import { generateUVs, generatePlanarUVs } from 'three-edit/helpers/primitives/uv-generators';
```

### Creating a Custom Primitive:
```typescript
import { 
  createVertex, 
  createFace, 
  generateUVs,
  transformVertices 
} from 'three-edit/helpers/primitives';

// Create vertices
const vertices = [
  createVertex(0, 0, 0),
  createVertex(1, 0, 0),
  createVertex(1, 1, 0),
  createVertex(0, 1, 0)
];

// Create faces
const faces = [
  createFace([0, 1, 2, 3])
];

// Generate UVs
const uvs = generateUVs(vertices, 'planar');

// Transform if needed
transformVertices(vertices, { scale: { x: 2, y: 2, z: 1 } });
```

## ✅ Benefits

1. **Modularity**: Each helper category is focused and self-contained
2. **Reusability**: Functions can be used across different parts of the library
3. **Maintainability**: Easy to find, update, and extend specific functionality
4. **Performance**: Optimized functions for common operations
5. **Flexibility**: Multiple abstraction levels for different use cases
6. **Type Safety**: Full TypeScript support with proper type definitions
7. **Documentation**: Comprehensive JSDoc comments for all functions

## 🔄 Migration Guide

### From Old System:
```typescript
// Old way
import { createCube } from 'three-edit/primitives';

// New way
import { createCube } from 'three-edit/helpers/primitives/basic-shapes';
// or
import { createCube } from 'three-edit/helpers';
```

### For Custom Primitives:
```typescript
// Use modular helpers for building blocks
import { 
  createVertex, 
  createFace, 
  generateUVs 
} from 'three-edit/helpers/primitives';

// Use high-level helpers for complete shapes
import { createCustomShape } from 'three-edit/helpers/primitives/basic-shapes';
```

## 📁 File Structure

```
src/helpers/
├── index.ts                    # Main exports
├── math.ts                     # Core math utilities
├── geometry.ts                 # Core geometry tools
├── edge.ts                     # Edge operations
├── uv.ts                       # UV mapping
├── normal.ts                   # Normal calculations
├── validation.ts               # Validation utilities
├── mesh.ts                     # Mesh helpers
├── debug.ts                    # Debug utilities
├── math/                       # Modular math
│   ├── vector-math.ts
│   └── triangle-math.ts
├── geometry/                   # Modular geometry
│   ├── vertex-operations.ts
│   └── face-operations.ts
└── primitives/                 # Complete primitive system
    ├── types.ts
    ├── vertex-generators.ts
    ├── face-generators.ts
    ├── geometry-builders.ts
    ├── transform-helpers.ts
    ├── uv-generators.ts
    ├── basic-shapes.ts
    ├── complex-shapes.ts
    ├── parametric-shapes.ts
    └── index.ts
```

This modular helper system provides everything needed for creating, manipulating, and validating 3D geometry in the three-edit library, with a clean separation of concerns and excellent reusability. 