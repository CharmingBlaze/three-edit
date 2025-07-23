# Three-Edit Helpers System

This document describes the modular helper system for three-edit, which provides clean, reusable utility functions for common operations.

## Overview

The helpers system is organized into focused modules, each handling a specific aspect of 3D geometry operations:

- **Math Helpers**: Common mathematical operations
- **UV Helpers**: Texture coordinate generation and manipulation
- **Edge Helpers**: Edge key generation and seam detection
- **Normal Helpers**: Face and vertex normal calculation
- **Validation Helpers**: Primitive options and geometry integrity validation
- **Mesh Helpers**: Mesh-level operations and statistics
- **Geometry Helpers**: Triangulation, vertex merging, and extrusion
- **Debug Helpers**: Development logging and mesh statistics

## Module Structure

```
src/helpers/
├── math.ts              # Common math utils
├── uv.ts                # UV mapping logic
├── edge.ts              # Edge keys and seam detection
├── normal.ts            # Normal calculation
├── validation.ts        # Validation functions
├── mesh.ts              # Mesh-level operations
├── geometry.ts          # Geometry operations
├── debug.ts             # Debug utilities
└── index.ts             # Barrel export
```

## Usage

Import helpers from the main helpers module:

```typescript
import {
  roundTo,
  clamp,
  generateUVs,
  calculateFaceNormal,
  validateMesh,
  getMeshStatistics
} from '../helpers';
```

## Math Helpers

### Core Functions

- `roundTo(value, decimals)`: Round to specified decimal places
- `clamp(value, min, max)`: Clamp value between min and max
- `lerp(a, b, t)`: Linear interpolation
- `degToRad(degrees)`: Convert degrees to radians
- `radToDeg(radians)`: Convert radians to degrees
- `isClose(a, b, tolerance)`: Check if numbers are close
- `isZero(value, tolerance)`: Check if number is approximately zero

### 3D Math

- `distance3D(a, b)`: Calculate 3D distance between points
- `distanceSquared3D(a, b)`: Calculate squared distance (faster)
- `angleBetweenVectors(a, b)`: Calculate angle between vectors
- `isValidTriangle(a, b, c)`: Check if three points form valid triangle
- `triangleArea(a, b, c)`: Calculate triangle area
- `triangleCentroid(a, b, c)`: Calculate triangle centroid
- `pointInTriangle(point, a, b, c)`: Check if point is inside triangle

### Utility Functions

- `normalize(value, min, max)`: Normalize value to 0-1 range
- `map(value, inMin, inMax, outMin, outMax)`: Map value to new range
- `wrap(value, min, max)`: Wrap value within range
- `sign(value)`: Get sign of number (-1, 0, or 1)

## UV Helpers

### Generation Functions

- `generateUVs(vertices, faces, params)`: Generate UVs with specified layout
- `generatePlanarUVs(vertices, faces, params)`: Planar projection
- `generateSphericalUVs(vertices, faces, params)`: Spherical mapping
- `generateCylindricalUVs(vertices, faces, params)`: Cylindrical mapping
- `generateBoxUVs(vertices, faces, params)`: Box mapping
- `generateDefaultUVs(vertices, faces)`: Default planar mapping

### Manipulation Functions

- `rotateUVs(vertices, center, angle)`: Rotate UV coordinates
- `scaleUVs(vertices, center, scale)`: Scale UV coordinates
- `offsetUVs(vertices, offset)`: Offset UV coordinates
- `wrapUVs(vertices)`: Wrap UVs to 0-1 range

### Utility Functions

- `areUVsClose(uv1, uv2, threshold)`: Check if UVs are close
- `isUVSeam(vertex1, vertex2, threshold)`: Detect UV seams

## Edge Helpers

### Key Generation

- `generateEdgeKey(v1Index, v2Index)`: Generate unique edge key
- `generateEdgeKeyFromIds(id1, id2)`: Generate key from vertex IDs
- `sortEdgeVertices(v1Index, v2Index)`: Sort vertices for consistency

### Edge Operations

- `getOtherVertexIndex(edge, vertexIndex)`: Get other vertex in edge
- `edgesShareVertex(edge1, edge2)`: Check if edges share vertex
- `getSharedVertexIndex(edge1, edge2)`: Get shared vertex between edges

### Analysis Functions

- `calculateEdgeLength(edge, vertices)`: Calculate edge length
- `calculateEdgeLengthSquared(edge, vertices)`: Calculate squared length
- `getEdgeMidpoint(edge, vertices)`: Get edge midpoint
- `isEdgeStraight(edge, vertices, tolerance)`: Check if edge is straight
- `getEdgeStatistics(edges, vertices)`: Get edge statistics

## Normal Helpers

### Face Normals

- `calculateFaceNormal(v1, v2, v3)`: Calculate normal from three vertices
- `calculateFaceNormalFromPositions(pos1, pos2, pos3)`: Calculate from positions
- `calculateFaceNormalForFace(face, vertices)`: Calculate for face
- `calculateFaceNormals(faces, vertices)`: Calculate for all faces

### Vertex Normals

- `calculateSmoothNormals(vertices, faces, params)`: Calculate smooth normals
- `calculateAngleWeightedNormals(vertices, faces)`: Angle-weighted normals

### Utility Functions

- `isValidNormal(normal, tolerance)`: Check if normal is valid
- `getNormalStatistics(vertices)`: Get normal statistics
- `fixInvalidNormals(vertices, defaultNormal)`: Fix invalid normals
- `calculateTriangleNormals(v1, v2, v3, smooth)`: Calculate for triangle

## Validation Helpers

### Primitive Validation

- `validatePrimitiveOptions(options, validators)`: Validate with custom rules
- `validateNumericValue(value, name, options)`: Validate numeric value
- `validateCubeOptions(options)`: Validate cube options
- `validateSphereOptions(options)`: Validate sphere options
- `validateCylinderOptions(options)`: Validate cylinder options
- `validateConeOptions(options)`: Validate cone options
- `validatePlaneOptions(options)`: Validate plane options
- `validateTorusOptions(options)`: Validate torus options

### Geometry Validation

- `validateTopology(vertices, faces, edges)`: Validate mesh topology
- `validateGeometry(vertices, faces)`: Validate geometry integrity
- `validateUVs(vertices)`: Validate UV coordinates
- `validateNormals(vertices)`: Validate normals
- `validateMesh(vertices, faces, edges)`: Comprehensive validation

## Mesh Helpers

### Analysis Functions

- `findOrphanedVertices(vertices, faces)`: Find unused vertices
- `getUniqueMaterialCount(faces)`: Count unique materials
- `getUVCount(vertices)`: Count vertices with UVs
- `getNormalCount(vertices)`: Count vertices with normals
- `getMeshStatistics(vertices, faces, edges)`: Get comprehensive statistics

### Bounding Box

- `calculateBoundingBox(vertices)`: Calculate mesh bounding box
- `centerVertices(vertices, center)`: Center vertices around point
- `scaleVertices(vertices, scale)`: Scale vertices
- `rotateVertices(vertices, axis, angle)`: Rotate vertices

### Search Functions

- `findFacesByMaterial(faces, materialIndex)`: Find faces by material
- `getMaterialDistribution(faces)`: Get material distribution
- `findVerticesInRadius(vertices, center, radius)`: Find vertices in radius
- `findFacesContainingVertex(faces, vertexIndex)`: Find faces with vertex
- `findEdgesConnectedToVertex(edges, vertexIndex)`: Find connected edges

### Calculations

- `calculateSurfaceArea(vertices, faces)`: Calculate surface area
- `calculateVolume(vertices, faces)`: Calculate volume (approximate)

## Geometry Helpers

### Vertex Operations

- `mergeVertices(vertices, faces, threshold)`: Merge close vertices
- `createVertexGrid(width, height, generator)`: Create vertex grid

### Face Operations

- `triangulatePolygon(vertices, face)`: Triangulate polygon
- `subdivideFace(vertices, face, addCenterVertex)`: Subdivide face
- `createFacesFromGrid(grid, materialIndex)`: Create faces from grid

### Extrusion

- `extrudeFace(vertices, face, direction, distance)`: Extrude face

## Debug Helpers

### Statistics and Logging

- `debugPrimitive(name, vertices, faces, edges, options)`: Debug primitive creation
- `printMeshStats(vertices, faces, edges, name)`: Print mesh statistics
- `printWarnings(vertices, faces, edges)`: Print warnings
- `logWarnings(vertices, faces, edges)`: Log warnings
- `colorCodeFaces(faces)`: Color code faces by material

### Detailed Debugging

- `debugVertexPositions(vertices, maxVertices)`: Debug vertex positions
- `debugFaceConnectivity(faces, maxFaces)`: Debug face connectivity
- `debugEdgeConnectivity(edges, maxEdges)`: Debug edge connectivity

### Performance

- `timeOperation(name, operation)`: Time operation execution
- `estimateMemoryUsage(vertices, faces, edges)`: Estimate memory usage
- `printMemoryUsage(vertices, faces, edges)`: Print memory usage

## Best Practices

### Using Helpers

1. **Import from index**: Always import from `../helpers` for consistency
2. **Use pure functions**: All helpers are pure functions with no side effects
3. **Check return values**: Validation helpers return detailed results
4. **Handle errors**: Check validation results before proceeding
5. **Use appropriate helpers**: Choose the right helper for your use case

### Performance Considerations

1. **Batch operations**: Use helpers that work on arrays when possible
2. **Avoid repeated calculations**: Cache results when appropriate
3. **Use squared distances**: Use `distanceSquared3D` when exact distance isn't needed
4. **Limit debug output**: Use debug helpers sparingly in production

### Error Handling

1. **Validate inputs**: Use validation helpers before processing
2. **Check for null/undefined**: Handle edge cases gracefully
3. **Use tolerance values**: Use appropriate tolerances for floating-point comparisons
4. **Log warnings**: Use debug helpers to identify issues

## Migration Guide

### From Old Utils

Replace old utility functions with new helpers:

```typescript
// Old
import { clamp } from '../utils/math';
const value = clamp(input, 0, 10);

// New
import { clamp } from '../helpers';
const value = clamp(input, 0, 10);
```

### From Inline Code

Replace inline calculations with helpers:

```typescript
// Old
const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

// New
import { distance3D } from '../helpers';
const distance = distance3D(point1, point2);
```

### From Primitive Helpers

Replace primitive-specific helpers with general helpers:

```typescript
// Old
import { generateUVs } from '../primitives/helpers';

// New
import { generateUVs } from '../helpers';
```

## Testing

All helpers include comprehensive tests in `src/__tests__/helpers.test.ts`. Run tests with:

```bash
npm test -- src/__tests__/helpers.test.ts
```

## Contributing

When adding new helpers:

1. **Follow naming conventions**: Use descriptive, consistent names
2. **Add TypeScript types**: Include proper type annotations
3. **Write tests**: Add tests for new functionality
4. **Update documentation**: Document new functions
5. **Keep pure**: Avoid side effects and state mutation
6. **Export from index**: Add exports to `index.ts`

## Future Enhancements

Planned improvements to the helpers system:

- **GPU acceleration**: Add WebGL-accelerated helpers
- **More UV layouts**: Additional UV mapping strategies
- **Advanced validation**: More sophisticated geometry validation
- **Performance profiling**: Built-in performance measurement
- **Plugin system**: Extensible helper architecture 