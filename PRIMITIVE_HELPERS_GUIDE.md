# Primitive Helpers Guide - Modular System for Easy Primitive Creation

## Overview

The new modular primitive helpers system provides a comprehensive set of reusable building blocks for creating all types of primitives in three-edit. This system is designed to make creating primitives very easy while maintaining flexibility and reusability.

## Architecture

The system is organized into small, focused modules:

```
src/helpers/primitives/
├── index.ts                 # Main barrel export
├── types.ts                 # Type definitions
├── vertex-generators.ts     # Vertex creation functions
├── face-generators.ts       # Face creation functions
├── geometry-builders.ts     # Complete geometry builders
├── transform-helpers.ts     # Vertex transformation utilities
├── uv-generators.ts         # UV coordinate generators
├── basic-shapes.ts          # Simple primitive shapes
├── complex-shapes.ts        # Advanced geometric shapes
└── parametric-shapes.ts     # Mathematical surfaces
```

## Key Features

### 1. Modular Design
- **Small, focused files**: Each module has a single responsibility
- **Reusable components**: Functions can be mixed and matched
- **Easy to maintain**: Changes in one module don't affect others
- **Clear organization**: Related functions are grouped together

### 2. Multiple Abstraction Levels
- **High-level**: Simple functions like `createCube()`, `createSphere()`
- **Mid-level**: Builders like `buildBox()`, `buildSphere()`
- **Low-level**: Generators like `createGridVertices()`, `createTriangleFace()`

### 3. Comprehensive Coverage
- **Basic shapes**: Cube, sphere, plane, cylinder, cone, torus, etc.
- **Complex shapes**: Torus knot, Mobius strip, pipe, handle, arrow, etc.
- **Parametric shapes**: Klein bottle, helicoid, catenoid, hyperboloid, etc.
- **Mathematical surfaces**: Wave, ripple, saddle, spiral, etc.

## Usage Examples

### Simple Usage - High Level

```javascript
import { createCube, createSphere, createTorus } from '../src/helpers/primitives/basic-shapes.js';

// Create basic shapes with minimal parameters
const cube = createCube(1, 0);           // size: 1, materialIndex: 0
const sphere = createSphere(0.5, 16, 0); // radius: 0.5, segments: 16, materialIndex: 0
const torus = createTorus(0.5, 0.2, 8, 0); // radius: 0.5, tube: 0.2, segments: 8, materialIndex: 0
```

### Advanced Usage - Mid Level

```javascript
import { buildBox, buildSphere } from '../src/helpers/primitives/geometry-builders.js';

// Create shapes with detailed parameters
const box = buildBox(1, 2, 3, 4, 5, 6, 0); // width, height, depth, segments, materialIndex
const sphere = buildSphere(0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI, 0);
```

### Custom Usage - Low Level

```javascript
import { 
  createGridVertices, 
  createGridFaces,
  translateVertices,
  generatePlanarUVs 
} from '../src/helpers/primitives/index.js';

// Create custom geometry step by step
const vertices = createGridVertices(1, 1, 4, 4, true);
const faces = createGridFaces(4, 4, 0);

// Transform the geometry
translateVertices(vertices, { x: 0.5, y: 0, z: 0 });

// Generate UV coordinates
generatePlanarUVs(vertices, 'z', { x: 1, y: 1 });
```

### Complex Shapes

```javascript
import { 
  createTorusKnot, 
  createMobiusStrip, 
  createKleinBottle 
} from '../src/helpers/primitives/index.js';

// Create complex mathematical shapes
const torusKnot = createTorusKnot(0.5, 0.2, 2, 3, 16, 8, 0);
const mobiusStrip = createMobiusStrip(0.5, 0.2, 16, 8, 0);
const kleinBottle = createKleinBottle(0.5, 16, 8, 0);
```

### Parametric Surfaces

```javascript
import { 
  createWave, 
  createSaddle, 
  createSpiral 
} from '../src/helpers/primitives/parametric-shapes.js';

// Create mathematical surfaces
const wave = createWave(2, 2, 0.5, 2, 16, 16, 0);
const saddle = createSaddle(1, 1, 2, 16, 16, 0);
const spiral = createSpiral(1, 2, 3, 16, 8, 0);
```

## Available Functions

### Basic Shapes (`basic-shapes.ts`)
- `createCube(size, materialIndex)`
- `createSphere(radius, segments, materialIndex)`
- `createPlane(size, segments, materialIndex)`
- `createCylinder(radius, height, segments, materialIndex)`
- `createCone(radius, height, segments, materialIndex)`
- `createTorus(radius, tube, segments, materialIndex)`
- `createCircle(radius, segments, materialIndex)`
- `createRing(innerRadius, outerRadius, segments, materialIndex)`
- `createCapsule(radius, height, segments, materialIndex)`
- `createPyramid(size, height, materialIndex)`
- `createTetrahedron(radius, materialIndex)`
- `createOctahedron(radius, materialIndex)`
- `createWedge(width, height, depth, materialIndex)`
- `createRamp(width, height, depth, materialIndex)`
- `createStairs(width, height, depth, steps, materialIndex)`

### Complex Shapes (`complex-shapes.ts`)
- `createTorusKnot(radius, tube, p, q, radialSegments, tubularSegments, materialIndex)`
- `createMobiusStrip(radius, tube, radialSegments, tubularSegments, materialIndex)`
- `createPipe(radius, height, thickness, radialSegments, heightSegments, materialIndex)`
- `createHandle(radius, tube, arc, radialSegments, tubularSegments, materialIndex)`
- `createGreebleBlock(width, height, depth, detailLevel, materialIndex)`
- `createLowPolySphere(radius, detailLevel, materialIndex)`
- `createArrow(length, headLength, headWidth, shaftWidth, materialIndex)`

### Parametric Shapes (`parametric-shapes.ts`)
- `createParametricSurface(uMin, uMax, vMin, vMax, uSegments, vSegments, surfaceFunction, materialIndex)`
- `createKleinBottle(radius, uSegments, vSegments, materialIndex)`
- `createHelicoid(radius, height, turns, uSegments, vSegments, materialIndex)`
- `createCatenoid(radius, height, uSegments, vSegments, materialIndex)`
- `createHyperboloid(a, b, c, uSegments, vSegments, materialIndex)`
- `createParaboloid(a, b, height, uSegments, vSegments, materialIndex)`
- `createSaddle(a, b, size, uSegments, vSegments, materialIndex)`
- `createSpiral(radius, height, turns, uSegments, vSegments, materialIndex)`
- `createWave(width, height, amplitude, frequency, uSegments, vSegments, materialIndex)`
- `createRipple(width, height, amplitude, frequency, uSegments, vSegments, materialIndex)`
- `createCorkscrew(radius, height, turns, uSegments, vSegments, materialIndex)`
- `createSeashell(radius, height, turns, uSegments, vSegments, materialIndex)`

### Vertex Generators (`vertex-generators.ts`)
- `createVertex(x, y, z, options)`
- `createVertexWithUV(x, y, z, u, v, options)`
- `createVertexWithNormal(x, y, z, normal, options)`
- `createVertexWithColor(x, y, z, color, options)`
- `createGridVertices(width, height, widthSegments, heightSegments, center)`
- `createCircleVertices(radius, segments, startAngle, endAngle, center)`
- `createSphereVertices(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength, center)`
- `createCylinderVertices(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength, center)`
- `createTorusVertices(radius, tube, radialSegments, tubularSegments, arc, center)`
- `createBoxVertices(width, height, depth, widthSegments, heightSegments, depthSegments, center)`

### Face Generators (`face-generators.ts`)
- `createFace(indices, options)`
- `createTriangleFace(a, b, c, options)`
- `createQuadFace(a, b, c, d, options)`
- `createGridFaces(widthSegments, heightSegments, materialIndex)`
- `createCircleFaces(segments, materialIndex)`
- `createSphereFaces(widthSegments, heightSegments, materialIndex)`
- `createCylinderFaces(radialSegments, heightSegments, openEnded, materialIndex)`
- `createTorusFaces(radialSegments, tubularSegments, materialIndex)`
- `createBoxFaces(widthSegments, heightSegments, depthSegments, materialIndex)`
- `createPlaneFaces(widthSegments, heightSegments, materialIndex)`
- `createRingFaces(innerSegments, outerSegments, materialIndex)`
- `createConeFaces(radialSegments, heightSegments, openEnded, materialIndex)`

### Transform Helpers (`transform-helpers.ts`)
- `translateVertices(vertices, translation)`
- `scaleVertices(vertices, scale)`
- `rotateVertices(vertices, axis, angle)`
- `transformVertices(vertices, matrix)`
- `centerVertices(vertices)`
- `normalizeVertices(vertices)`
- `mirrorVertices(vertices, normal, point)`
- `extrudeVertices(vertices, direction, distance)`
- `transformVerticesCopy(vertices, matrix)`
- `createRoundedCornerVertices(radius, segments, startAngle, endAngle, center)`
- `createChamferedCornerVertices(size, chamfer, center)`
- `createBeveledCornerVertices(size, bevel, segments, center)`

### UV Generators (`uv-generators.ts`)
- `generatePlanarUVs(vertices, axis, scale)`
- `generateCylindricalUVs(vertices, radius, height)`
- `generateSphericalUVs(vertices, radius)`
- `generateCubicUVs(vertices, size)`
- `generateTorusUVs(vertices, majorRadius, minorRadius)`
- `generateGridUVs(vertices, width, height)`
- `generateCircleUVs(vertices, radius)`
- `generateTriplanarUVs(vertices, scale)`
- `generateBoxUVs(vertices, width, height, depth)`
- `generateSeamlessUVs(vertices, scale, offset)`
- `generateCheckerboardUVs(vertices, scale, tiles)`
- `generatePolarUVs(vertices, center)`

## Benefits

### 1. Easy Primitive Creation
- **One-line creation**: `const cube = createCube(1, 0);`
- **Sensible defaults**: Most parameters have good default values
- **Consistent API**: All functions follow the same pattern

### 2. High Reusability
- **Modular components**: Mix and match vertex/face generators
- **Composable functions**: Build complex shapes from simple parts
- **Consistent types**: All functions use the same data structures

### 3. Flexibility
- **Multiple abstraction levels**: Choose the right level for your needs
- **Customizable parameters**: Fine-tune every aspect of the geometry
- **Extensible design**: Easy to add new shapes and functions

### 4. Performance
- **Optimized algorithms**: Efficient vertex and face generation
- **Minimal overhead**: Direct function calls, no unnecessary abstractions
- **Memory efficient**: Only create what you need

## Integration with Existing Code

The new system is designed to work alongside existing three-edit code:

```javascript
// Old way (still works)
import { createCube } from '../src/primitives/createCube.js';

// New way (recommended)
import { createCube } from '../src/helpers/primitives/basic-shapes.js';

// Both return the same structure
const cube = createCube(1, 0);
// Returns: { vertices: Vertex[], faces: Face[], vertexCount: number, faceCount: number }
```

## Migration Guide

### For Primitive Creators
1. **Replace individual imports** with the new modular system
2. **Use high-level functions** for simple shapes
3. **Use low-level functions** for custom geometry
4. **Leverage transform helpers** for modifications
5. **Use UV generators** for texture mapping

### For Library Users
1. **Import from the new location**: `src/helpers/primitives/`
2. **Use the simplified API**: Fewer parameters, better defaults
3. **Take advantage of new shapes**: Complex and parametric shapes
4. **Use transform helpers**: Easy vertex manipulation
5. **Generate UVs automatically**: Built-in texture coordinate generation

## Future Enhancements

The modular system is designed to be easily extensible:

1. **New shape types**: Easy to add new basic, complex, or parametric shapes
2. **Advanced transformations**: More sophisticated vertex manipulation
3. **Custom UV mappings**: Specialized texture coordinate generation
4. **Performance optimizations**: Algorithm improvements and caching
5. **Integration features**: Better integration with Three.js and other libraries

## Conclusion

The new modular primitive helpers system provides a comprehensive, easy-to-use, and highly reusable set of tools for creating all types of primitives in three-edit. Whether you need simple shapes or complex mathematical surfaces, the system provides the right level of abstraction for your needs.

The modular design ensures that the system is maintainable, extensible, and performant, while the consistent API makes it easy to learn and use. This system makes creating primitives very easy while providing the flexibility needed for advanced use cases. 