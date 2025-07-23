# PRIMITIVES.md

## Overview

The three-edit primitive system is designed to be **modular**, **standardized**, and **production-ready**. This document outlines the architecture, standards, and best practices for creating and maintaining primitives.

## Architecture

### Core Principles

1. **Modularity**: Each primitive is self-contained with clear interfaces
2. **Standardization**: All primitives follow the same creation patterns
3. **Performance**: Optimized for real-time editing and rendering
4. **Validation**: Built-in geometry integrity checks
5. **Extensibility**: Easy to add new primitives and features

### File Structure

```
src/primitives/
├── types.ts              # Type definitions and interfaces
├── helpers.ts            # Shared helper functions
├── validation.ts         # Validation system
├── registry.ts           # Primitive registry
├── factories/            # Primitive factory implementations
│   ├── cube.ts
│   ├── sphere.ts
│   ├── cylinder.ts
│   └── ...
├── generators/           # Geometry generation utilities
│   ├── vertices.ts
│   ├── faces.ts
│   ├── edges.ts
│   └── uvs.ts
└── index.ts              # Main exports
```

## Primitive Standard

### Required Components

Every primitive must include:

1. **Vertices**: Position, UVs, normals, colors
2. **Faces**: Vertex indices, material assignment, normals
3. **Edges**: Topology connections with UV seam awareness
4. **Materials**: Proper material ID assignment
5. **UVs**: Appropriate UV mapping for the primitive type
6. **Normals**: Calculated face and vertex normals
7. **Validation**: Geometry integrity checks

### Creation Pattern

```typescript
export function createPrimitive(options: CreatePrimitiveOptions = {}): EditableMesh {
  // 1. Validate and normalize options
  const normalizedOptions = normalizeOptions(options);
  
  // 2. Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);
  
  // 3. Generate geometry
  const vertices = generateVertices(normalizedOptions, context);
  const faces = generateFaces(vertices, normalizedOptions, context);
  const edges = generateEdges(faces, context);
  
  // 4. Apply materials and UVs
  applyMaterials(faces, normalizedOptions, context);
  applyUVs(vertices, faces, normalizedOptions, context);
  
  // 5. Calculate normals
  calculateNormals(vertices, faces, normalizedOptions, context);
  
  // 6. Validate and return
  if (normalizedOptions.validate) {
    validatePrimitive(mesh);
  }
  
  return mesh;
}
```

### Helper Functions

#### Vertex Creation
```typescript
function createVertex(
  mesh: EditableMesh,
  options: VertexOptions,
  context: PrimitiveContext
): VertexCreationResult {
  const vertex = new Vertex(options.x, options.y, options.z, {
    uv: options.uv,
    normal: options.normal,
    color: options.color,
    userData: options.userData
  });
  
  const id = mesh.addVertex(vertex);
  return { id, vertex };
}
```

#### Face Creation
```typescript
function createFace(
  mesh: EditableMesh,
  options: FaceOptions,
  context: PrimitiveContext
): FaceCreationResult {
  // Create edges first
  const edgeIds = createFaceEdges(mesh, options.vertexIds, context);
  
  // Create face
  const face = new Face(options.vertexIds, {
    materialIndex: options.materialId ?? context.materialId,
    normal: options.normal,
    userData: options.userData
  });
  
  const id = mesh.addFace(face);
  return { id, face, edgeIds };
}
```

#### Edge Creation
```typescript
function createEdge(
  mesh: EditableMesh,
  options: EdgeOptions,
  context: PrimitiveContext
): EdgeCreationResult {
  const edge = new Edge(options.v1, options.v2, {
    userData: options.userData
  });
  
  const id = mesh.addEdge(edge);
  return { id, edge };
}
```

### UV Mapping Standards

#### Box UVs
- Each face gets its own UV space
- Proper seam handling at edges
- Consistent orientation across faces

#### Cylindrical UVs
- U coordinate wraps around the cylinder
- V coordinate maps along the height
- Proper seam handling at the wrap point

#### Spherical UVs
- U coordinate wraps around the sphere
- V coordinate maps from pole to pole
- Proper seam and pole handling

#### Planar UVs
- Projection-based UV mapping
- Configurable projection axis
- Proper scaling and rotation

### Material Assignment

#### Uniform Assignment
```typescript
function assignUniformMaterial(faces: Face[], materialId: number): void {
  faces.forEach(face => {
    face.materialIndex = materialId;
  });
}
```

#### Per-Face Assignment
```typescript
function assignPerFaceMaterials(faces: Face[], materialIds: number[]): void {
  faces.forEach((face, index) => {
    face.materialIndex = materialIds[index] ?? materialIds[0];
  });
}
```

### Normal Calculation

#### Face Normals
```typescript
function calculateFaceNormal(vertices: Vertex[], face: Face): Vector3 {
  const v1 = vertices[face.vertexIds[0]];
  const v2 = vertices[face.vertexIds[1]];
  const v3 = vertices[face.vertexIds[2]];
  
  const edge1 = new Vector3().subVectors(v2, v1);
  const edge2 = new Vector3().subVectors(v3, v1);
  
  return new Vector3().crossVectors(edge1, edge2).normalize();
}
```

#### Smooth Normals
```typescript
function calculateSmoothNormals(vertices: Vertex[], faces: Face[]): void {
  // Reset vertex normals
  vertices.forEach(vertex => {
    vertex.normal = new Vector3(0, 0, 0);
  });
  
  // Accumulate face normals
  faces.forEach(face => {
    const faceNormal = calculateFaceNormal(vertices, face);
    face.vertexIds.forEach(vertexId => {
      vertices[vertexId].normal.add(faceNormal);
    });
  });
  
  // Normalize vertex normals
  vertices.forEach(vertex => {
    if (vertex.normal.length() > 0) {
      vertex.normal.normalize();
    }
  });
}
```

## Validation System

### Geometry Integrity Checks

```typescript
function validatePrimitive(mesh: EditableMesh): PrimitiveValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for orphaned vertices
  const orphanedVertices = findOrphanedVertices(mesh);
  if (orphanedVertices.length > 0) {
    errors.push(`Found ${orphanedVertices.length} orphaned vertices`);
  }
  
  // Check for non-manifold edges
  const nonManifoldEdges = findNonManifoldEdges(mesh);
  if (nonManifoldEdges.length > 0) {
    warnings.push(`Found ${nonManifoldEdges.length} non-manifold edges`);
  }
  
  // Check face winding order
  const invalidFaces = findInvalidWindingOrder(mesh);
  if (invalidFaces.length > 0) {
    errors.push(`Found ${invalidFaces.length} faces with invalid winding order`);
  }
  
  // Check UV mapping
  const uvIssues = validateUVMapping(mesh);
  warnings.push(...uvIssues);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      vertexCount: mesh.vertices.length,
      edgeCount: mesh.edges.length,
      faceCount: mesh.faces.length,
      materialCount: getUniqueMaterialCount(mesh),
      uvCount: getUVCount(mesh),
      normalCount: getNormalCount(mesh)
    }
  };
}
```

### Topology Validation

```typescript
function validateTopology(mesh: EditableMesh): TopologyValidationResult {
  const issues: string[] = [];
  
  // Check edge connectivity
  mesh.edges.forEach(edge => {
    const v1 = mesh.getVertex(edge.v1);
    const v2 = mesh.getVertex(edge.v2);
    
    if (!v1 || !v2) {
      issues.push(`Edge references non-existent vertices: ${edge.v1} -> ${edge.v2}`);
    }
  });
  
  // Check face connectivity
  mesh.faces.forEach(face => {
    face.vertexIds.forEach(vertexId => {
      if (!mesh.getVertex(vertexId)) {
        issues.push(`Face references non-existent vertex: ${vertexId}`);
      }
    });
  });
  
  return { isValid: issues.length === 0, issues };
}
```

## Edge Key System

### UV Seam Awareness

```typescript
class EdgeKeyCache {
  private cache = new Map<string, number>();
  
  generateKey(v1: number, v2: number, uv1?: UVCoord, uv2?: UVCoord): string {
    // Sort vertices for consistent key generation
    const [minV, maxV] = v1 < v2 ? [v1, v2] : [v2, v1];
    
    // Include UV information for seam detection
    if (uv1 && uv2) {
      const uvDistance = Math.sqrt(
        Math.pow(uv1.u - uv2.u, 2) + Math.pow(uv1.v - uv2.v, 2)
      );
      
      // If UVs are significantly different, treat as separate edge
      if (uvDistance > 0.1) {
        return `${minV}-${maxV}-uv-${uv1.u.toFixed(3)}-${uv1.v.toFixed(3)}`;
      }
    }
    
    return `${minV}-${maxV}`;
  }
  
  getOrCreate(v1: number, v2: number, uv1?: UVCoord, uv2?: UVCoord): number {
    const key = this.generateKey(v1, v2, uv1, uv2);
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    const edgeId = this.createEdge(v1, v2);
    this.cache.set(key, edgeId);
    return edgeId;
  }
}
```

## Performance Optimization

### Geometry Caching

```typescript
class PrimitiveCache {
  private cache = new Map<string, EditableMesh>();
  
  getOrCreate(type: string, options: CreatePrimitiveOptions): EditableMesh {
    const key = this.generateCacheKey(type, options);
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!.clone();
    }
    
    const mesh = this.createPrimitive(type, options);
    this.cache.set(key, mesh);
    return mesh.clone();
  }
  
  private generateCacheKey(type: string, options: CreatePrimitiveOptions): string {
    return `${type}-${JSON.stringify(options)}`;
  }
}
```

### Batch Operations

```typescript
function batchCreatePrimitives(
  primitives: Array<{ type: string; options: CreatePrimitiveOptions }>
): EditableMesh[] {
  const results: EditableMesh[] = [];
  const context = createBatchContext();
  
  primitives.forEach(({ type, options }) => {
    const mesh = createPrimitive(type, options, context);
    results.push(mesh);
  });
  
  return results;
}
```

## Usage Examples

### Basic Primitive Creation

```typescript
import { createCube, createSphere, createCylinder } from 'three-edit';

// Create basic primitives
const cube = createCube({
  width: 2,
  height: 2,
  depth: 2,
  name: 'MyCube',
  materialId: 0,
  centered: true,
  uvLayout: 'box',
  smoothNormals: false,
  validate: true
});

const sphere = createSphere({
  radius: 1,
  widthSegments: 32,
  heightSegments: 16,
  name: 'MySphere',
  materialId: 1,
  centered: true,
  uvLayout: 'spherical',
  smoothNormals: true,
  validate: true
});
```

### Advanced Primitive Creation

```typescript
// Create cylinder with custom options
const cylinder = createCylinder({
  radiusTop: 1,
  radiusBottom: 0.5,
  height: 3,
  radialSegments: 16,
  heightSegments: 8,
  openEnded: false,
  name: 'MyCylinder',
  materialId: 2,
  faceMaterialIds: [2, 2, 3, 3, 2, 2], // Different materials for caps and sides
  centered: true,
  uvLayout: 'cylindrical',
  smoothNormals: true,
  validate: true,
  userData: {
    customProperty: 'value',
    metadata: { author: 'user', version: '1.0' }
  }
});
```

### Validation and Error Handling

```typescript
import { validatePrimitive } from 'three-edit';

const mesh = createCube({ validate: false }); // Skip validation during creation

// Validate manually
const validation = validatePrimitive(mesh);

if (!validation.isValid) {
  console.error('Primitive validation failed:', validation.errors);
  // Handle errors appropriately
}

if (validation.warnings.length > 0) {
  console.warn('Primitive validation warnings:', validation.warnings);
  // Handle warnings appropriately
}

console.log('Primitive statistics:', validation.stats);
```

## Best Practices

### 1. Parameter Validation

```typescript
function validateCubeOptions(options: CreateCubeOptions): void {
  if (options.width <= 0) throw new Error('Cube width must be positive');
  if (options.height <= 0) throw new Error('Cube height must be positive');
  if (options.depth <= 0) throw new Error('Cube depth must be positive');
  if (options.widthSegments < 1) throw new Error('Cube widthSegments must be at least 1');
  if (options.heightSegments < 1) throw new Error('Cube heightSegments must be at least 1');
  if (options.depthSegments < 1) throw new Error('Cube depthSegments must be at least 1');
}
```

### 2. Memory Management

```typescript
function createPrimitiveWithCleanup(options: CreatePrimitiveOptions): EditableMesh {
  const mesh = createPrimitive(options);
  
  // Clean up any temporary data
  mesh.cleanup();
  
  return mesh;
}
```

### 3. Performance Monitoring

```typescript
function createPrimitiveWithProfiling(options: CreatePrimitiveOptions): PrimitiveResult {
  const startTime = performance.now();
  
  const mesh = createPrimitive(options);
  
  const endTime = performance.now();
  const creationTime = endTime - startTime;
  
  return {
    mesh,
    performance: {
      creationTime,
      vertexCount: mesh.vertices.length,
      faceCount: mesh.faces.length,
      edgeCount: mesh.edges.length
    }
  };
}
```

### 4. Error Recovery

```typescript
function createPrimitiveWithFallback(options: CreatePrimitiveOptions): EditableMesh {
  try {
    return createPrimitive(options);
  } catch (error) {
    console.warn('Primitive creation failed, using fallback:', error);
    
    // Return a simple fallback primitive
    return createCube({
      width: 1,
      height: 1,
      depth: 1,
      name: 'FallbackCube',
      materialId: 0,
      validate: false
    });
  }
}
```

## Extension Guidelines

### Adding New Primitives

1. **Create the factory file** in `src/primitives/factories/`
2. **Implement the PrimitiveFactory interface**
3. **Add type definitions** to `src/primitives/types.ts`
4. **Register the primitive** in `src/primitives/registry.ts`
5. **Add tests** in `src/__tests__/primitives.test.ts`
6. **Update documentation**

### Example: Adding a Pyramid Primitive

```typescript
// src/primitives/factories/pyramid.ts
export class PyramidFactory implements PrimitiveFactory {
  create(options: CreatePyramidOptions): PrimitiveResult {
    const startTime = performance.now();
    
    // Implementation here...
    
    const endTime = performance.now();
    
    return {
      mesh,
      validation,
      metadata: {
        type: 'Pyramid',
        options,
        creationTime: Date.now(),
        performance: {
          totalTime: endTime - startTime,
          // ... other timing data
        }
      }
    };
  }
  
  validate(mesh: EditableMesh): PrimitiveValidationResult {
    return validatePrimitive(mesh);
  }
  
  getDefaultOptions(): CreatePyramidOptions {
    return {
      baseWidth: 1,
      baseHeight: 1,
      height: 1,
      name: 'Pyramid',
      materialId: 0,
      centered: true,
      uvLayout: 'planar',
      smoothNormals: false,
      validate: true
    };
  }
}
```

## Troubleshooting

### Common Issues

1. **UV Seams**: Ensure proper UV seam handling in edge key generation
2. **Normal Calculation**: Verify face winding order for correct normals
3. **Material Assignment**: Check material ID consistency across faces
4. **Performance**: Use caching for frequently created primitives
5. **Memory Leaks**: Dispose of temporary geometries and caches

### Debug Tools

```typescript
import { debugPrimitive } from 'three-edit';

// Enable debug mode for primitive creation
const mesh = createCube({ 
  validate: true,
  userData: { debug: true }
});

// Debug information will be logged to console
debugPrimitive(mesh);
```

This comprehensive system ensures that all primitives are consistent, performant, and production-ready while maintaining the flexibility to add new primitives and features as needed.
