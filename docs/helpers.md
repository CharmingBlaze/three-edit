# Helper System Documentation

The three-edit helper system provides a comprehensive set of modular utilities organized into specialized categories for professional 3D modeling tool development.

## 🧩 Overview

The helper system is designed to be:
- **Modular**: Import only what you need
- **Type-safe**: Full TypeScript support
- **Comprehensive**: Covers all aspects of 3D geometry manipulation
- **Professional**: Built for real-world 3D modeling applications

## 📁 System Structure

```
src/helpers/
├── index.ts              # Main export file
├── math.ts               # Basic math utilities
├── math/
│   ├── index.ts          # Math module exports
│   ├── vector-math.ts    # Vector operations
│   └── triangle-math.ts  # Triangle calculations
├── geometry.ts           # Core geometry operations
├── geometry/
│   ├── index.ts          # Geometry module exports
│   ├── vertex-operations.ts # Vertex manipulation
│   └── face-operations.ts   # Face operations
├── primitives/           # Primitive creation system
│   ├── index.ts          # Primitive exports
│   ├── types.ts          # Type definitions
│   ├── basic-shapes.ts   # Basic geometric shapes
│   ├── complex-shapes.ts # Complex shapes
│   ├── parametric-shapes.ts # Parametric shapes
│   ├── vertex-generators.ts # Vertex generation
│   ├── face-generators.ts   # Face generation
│   ├── uv-generators.ts     # UV generation
│   ├── geometry-builders.ts # Geometry builders
│   └── transform-helpers.ts # Transform helpers
├── highlight.ts          # Editor highlighting system
├── grid.ts              # Grid and snapping system
├── overlay.ts           # Visual overlay system
├── edge.ts              # Edge topology helpers
├── uv.ts                # UV mapping utilities
├── uv-additional.ts     # Additional UV functions
├── normal.ts            # Normal vector calculations
├── validation.ts        # Mesh validation
├── mesh.ts              # Mesh query helpers
└── debug.ts             # Debugging utilities
```

## 🧮 Math Utilities

### Basic Math (`math.ts`)

```typescript
import { clamp, lerp, roundTo, modulo } from 'three-edit';

// Clamp value between min and max
const clamped = clamp(value, 0, 100);

// Linear interpolation
const interpolated = lerp(start, end, 0.5);

// Round to specific decimal places
const rounded = roundTo(value, 2);

// Modulo operation (handles negative numbers)
const mod = modulo(-5, 3); // Returns 1
```

### Vector Math (`math/vector-math.ts`)

```typescript
import { 
  distance3D, 
  dotProduct, 
  crossProduct, 
  vectorLength,
  normalizeVector,
  addVectors,
  subtractVectors,
  angleBetweenVectors,
  midpoint,
  centroid
} from 'three-edit';

// Distance calculations
const distance = distance3D(point1, point2);
const distanceSquared = distanceSquared3D(point1, point2);

// Vector operations
const dot = dotProduct(vector1, vector2);
const cross = crossProduct(vector1, vector2);
const length = vectorLength(vector);
const normalized = normalizeVector(vector);

// Vector arithmetic
const sum = addVectors(vector1, vector2);
const difference = subtractVectors(vector1, vector2);
const scaled = multiplyVectorByScalar(vector, 2);

// Geometric calculations
const angle = angleBetweenVectors(vector1, vector2);
const mid = midpoint(point1, point2);
const center = centroid([point1, point2, point3]);
```

### Triangle Math (`math/triangle-math.ts`)

```typescript
import { 
  isValidTriangle,
  calculateTriangleArea,
  calculateTriangleNormal,
  calculateTriangleCentroid,
  pointInTriangle,
  calculateBarycentricCoordinates,
  closestPointOnTriangle
} from 'three-edit';

// Triangle validation
const isValid = isValidTriangle(vertex1, vertex2, vertex3);

// Triangle calculations
const area = calculateTriangleArea(vertex1, vertex2, vertex3);
const normal = calculateTriangleNormal(vertex1, vertex2, vertex3);
const centroid = calculateTriangleCentroid(vertex1, vertex2, vertex3);

// Point-in-triangle tests
const inside = pointInTriangle(point, vertex1, vertex2, vertex3);
const barycentric = calculateBarycentricCoordinates(point, vertex1, vertex2, vertex3);
const closest = closestPointOnTriangle(point, vertex1, vertex2, vertex3);
```

## 📐 Geometry Tools

### Core Geometry (`geometry.ts`)

```typescript
import { 
  triangulatePolygon,
  mergeVertices,
  createVertexGrid,
  calculateBoundingBox
} from 'three-edit';

// Triangulate complex polygons
const triangles = triangulatePolygon(vertices, face);

// Merge duplicate vertices
const merged = mergeVertices(vertices, faces, tolerance);

// Create vertex grids
const grid = createVertexGrid(width, height, spacing);

// Calculate bounding box
const bbox = calculateBoundingBox(vertices);
```

### Vertex Operations (`geometry/vertex-operations.ts`)

```typescript
import { 
  centerVertices,
  scaleVertices,
  rotateVertices,
  transformVertices,
  findVerticesInRadius
} from 'three-edit';

// Transform vertex arrays
const centered = centerVertices(vertices);
const scaled = scaleVertices(vertices, scale);
const rotated = rotateVertices(vertices, rotation);
const transformed = transformVertices(vertices, matrix);

// Spatial queries
const nearby = findVerticesInRadius(vertices, center, radius);
```

### Face Operations (`geometry/face-operations.ts`)

```typescript
import { 
  subdivideFace,
  extrudeFace,
  createFacesFromGrid
} from 'three-edit';

// Face subdivision
const result = subdivideFace(vertices, face, addCenterVertex);

// Face extrusion
const extruded = extrudeFace(vertices, face, direction, distance);

// Grid-based face creation
const faces = createFacesFromGrid(vertexGrid, materialIndex);
```

## 🎨 Editor Helpers

### Highlight System (`highlight.ts`)

```typescript
import { 
  createVertexHighlight,
  createEdgeHighlight,
  createFaceHighlight,
  createBoundingBoxHighlight,
  createSelectionOutline,
  updateHighlightColor,
  updateHighlightOpacity,
  disposeHighlightObject
} from 'three-edit';

// Create highlights
const vertexHighlight = createVertexHighlight(position, {
  color: 0xff0000,
  size: 0.1,
  opacity: 0.8
});

const edgeHighlight = createEdgeHighlight(start, end, {
  color: 0x00ff00,
  lineWidth: 2,
  dashed: true
});

const faceHighlight = createFaceHighlight(vertices, {
  color: 0x0000ff,
  opacity: 0.3
});

const bboxHighlight = createBoundingBoxHighlight(boundingBox, {
  color: 0xffff00
});

const selectionOutline = createSelectionOutline(mesh, {
  color: 0x00ffff
});

// Update highlights
updateHighlightColor(vertexHighlight, 0xffff00);
updateHighlightOpacity(faceHighlight, 0.5);

// Cleanup
disposeHighlightObject(vertexHighlight);
```

### Grid System (`grid.ts`)

```typescript
import { 
  createGrid,
  createSnapGrid,
  createReferenceGrid,
  updateGridScale,
  updateGridVisibility,
  disposeGrid
} from 'three-edit';

// Create grids
const grid = createGrid({
  size: 20,
  divisions: 20,
  color: 0x888888,
  opacity: 0.5
});

const snapGrid = createSnapGrid({
  size: 10,
  snapDistance: 0.1,
  color: 0x444444
});

const referenceGrid = createReferenceGrid({
  size: 50,
  majorDivisions: 10,
  minorDivisions: 5
});

// Update grids
updateGridScale(grid, 2.0);
updateGridVisibility(grid, false);

// Cleanup
disposeGrid(grid);
```

### Overlay System (`overlay.ts`)

```typescript
import { 
  createMeasurementLine,
  createAngleMeasurement,
  createAxisArrows,
  createBoundingBoxOverlay,
  createTextLabel,
  updateOverlayPosition,
  disposeOverlay
} from 'three-edit';

// Create overlays
const measurement = createMeasurementLine(start, end, {
  color: 0xffff00,
  showDistance: true,
  fontSize: 0.1
});

const angle = createAngleMeasurement(center, point1, point2, {
  color: 0xff00ff,
  showAngle: true
});

const axes = createAxisArrows({
  size: 5,
  arrowSize: 0.5,
  colors: { x: 0xff0000, y: 0x00ff00, z: 0x0000ff }
});

const bboxOverlay = createBoundingBoxOverlay(boundingBox, {
  color: 0x00ffff,
  showDimensions: true
});

const label = createTextLabel(position, "Vertex 1", {
  color: 0xffffff,
  fontSize: 0.2,
  backgroundColor: 0x000000
});

// Update overlays
updateOverlayPosition(measurement, newStart, newEnd);

// Cleanup
disposeOverlay(measurement);
```

## 🧱 Primitive Helpers

### Basic Shapes (`primitives/basic-shapes.ts`)

```typescript
import { 
  createCube,
  createSphere,
  createCylinder,
  createPlane
} from 'three-edit';

// Basic geometric shapes
const cube = createCube({
  width: 2,
  height: 2,
  depth: 2,
  materialIndex: 0
});

const sphere = createSphere({
  radius: 1,
  segments: 32,
  rings: 16,
  materialIndex: 0
});

const cylinder = createCylinder({
  radius: 1,
  height: 2,
  segments: 16,
  materialIndex: 0
});

const plane = createPlane({
  width: 4,
  height: 4,
  widthSegments: 4,
  heightSegments: 4,
  materialIndex: 0
});
```

### Complex Shapes (`primitives/complex-shapes.ts`)

```typescript
import { 
  createTorus,
  createCone,
  createPyramid,
  createCapsule
} from 'three-edit';

// Complex geometric shapes
const torus = createTorus({
  radius: 2,
  tubeRadius: 0.5,
  radialSegments: 32,
  tubularSegments: 16,
  materialIndex: 0
});

const cone = createCone({
  radius: 1,
  height: 2,
  radialSegments: 16,
  heightSegments: 8,
  materialIndex: 0
});

const pyramid = createPyramid({
  baseSize: 2,
  height: 3,
  materialIndex: 0
});

const capsule = createCapsule({
  radius: 0.5,
  height: 2,
  segments: 16,
  materialIndex: 0
});
```

### Parametric Shapes (`primitives/parametric-shapes.ts`)

```typescript
import { 
  createTorusKnot,
  createMobiusStrip,
  createArrow
} from 'three-edit';

// Parametric shapes
const torusKnot = createTorusKnot({
  radius: 2,
  tubeRadius: 0.5,
  p: 2,
  q: 3,
  radialSegments: 64,
  tubularSegments: 32,
  materialIndex: 0
});

const mobiusStrip = createMobiusStrip({
  radius: 2,
  width: 1,
  segments: 64,
  materialIndex: 0
});

const arrow = createArrow({
  length: 3,
  headLength: 0.5,
  headWidth: 0.3,
  shaftRadius: 0.1,
  materialIndex: 0
});
```

## 🔧 Utility Helpers

### UV Operations (`uv.ts`)

```typescript
import { 
  generatePlanarUVs,
  generateCylindricalUVs,
  generateSphericalUVs,
  generateCubicUVs,
  transformUVs
} from 'three-edit';

// UV generation
const planarUVs = generatePlanarUVs(vertices, {
  projection: 'xy',
  scale: { x: 1, y: 1 },
  offset: { x: 0, y: 0 }
});

const cylindricalUVs = generateCylindricalUVs(vertices, {
  center: { x: 0, y: 0, z: 0 },
  radius: 1,
  height: 2
});

const sphericalUVs = generateSphericalUVs(vertices, {
  center: { x: 0, y: 0, z: 0 },
  radius: 1
});

const cubicUVs = generateCubicUVs(vertices, {
  center: { x: 0, y: 0, z: 0 },
  size: 2
});

// UV transformation
const transformedUVs = transformUVs(uvs, {
  scale: { u: 2, v: 2 },
  offset: { u: 0.5, v: 0.5 },
  rotation: Math.PI / 4
});
```

### Normal Operations (`normal.ts`)

```typescript
import { 
  calculateFaceNormals,
  calculateSmoothNormals,
  calculateVertexNormals
} from 'three-edit';

// Normal calculations
calculateFaceNormals(faces, vertices);
calculateSmoothNormals(faces, vertices, angleThreshold);
calculateVertexNormals(faces, vertices);
```

### Validation (`validation.ts`)

```typescript
import { 
  validateMesh,
  validateGeometryIntegrity,
  repairMesh,
  fixWindingOrder
} from 'three-edit';

// Mesh validation
const validation = validateMesh(mesh);
const integrity = validateGeometryIntegrity(mesh);

// Mesh repair
const repaired = repairMesh(mesh);
fixWindingOrder(faces);
```

### Debug (`debug.ts`)

```typescript
import { 
  debugMesh,
  logMeshStats,
  validateMeshIntegrity,
  exportDebugInfo
} from 'three-edit';

// Debug utilities
debugMesh(mesh);
logMeshStats(mesh);
const integrity = validateMeshIntegrity(mesh);
const debugInfo = exportDebugInfo(mesh);
```

## 🎯 Usage Examples

### Complete Editor Setup

```typescript
import { 
  createGrid,
  createAxisArrows,
  createVertexHighlight,
  createEdgeHighlight,
  createFaceHighlight,
  createMeasurementLine
} from 'three-edit';

// Setup editor environment
const editorElements = {
  grid: createGrid({ size: 20, divisions: 20 }),
  axes: createAxisArrows({ size: 5 }),
  highlights: [],
  measurements: []
};

// Add to scene
scene.add(editorElements.grid);
scene.add(editorElements.axes);

// Selection highlighting
function highlightSelection(selection) {
  // Clear previous highlights
  editorElements.highlights.forEach(h => disposeHighlightObject(h));
  editorElements.highlights = [];
  
  // Create new highlights
  selection.vertices.forEach(vertex => {
    const highlight = createVertexHighlight(vertex.position, { color: 0xff0000 });
    editorElements.highlights.push(highlight);
    scene.add(highlight);
  });
  
  selection.edges.forEach(edge => {
    const highlight = createEdgeHighlight(edge.start, edge.end, { color: 0x00ff00 });
    editorElements.highlights.push(highlight);
    scene.add(highlight);
  });
  
  selection.faces.forEach(face => {
    const highlight = createFaceHighlight(face.vertices, { color: 0x0000ff, opacity: 0.3 });
    editorElements.highlights.push(highlight);
    scene.add(highlight);
  });
}
```

### Geometry Processing Pipeline

```typescript
import { 
  mergeVertices,
  triangulatePolygon,
  centerVertices,
  calculateBoundingBox,
  generatePlanarUVs
} from 'three-edit';

// Geometry processing pipeline
function processGeometry(mesh) {
  // 1. Clean up geometry
  const merged = mergeVertices(mesh.vertices, mesh.faces, 0.001);
  
  // 2. Center geometry
  const centered = centerVertices(merged.vertices);
  
  // 3. Triangulate complex faces
  const triangulated = [];
  merged.faces.forEach(face => {
    if (face.vertices.length > 3) {
      const triangles = triangulatePolygon(centered, face);
      triangulated.push(...triangles);
    } else {
      triangulated.push(face);
    }
  });
  
  // 4. Calculate bounding box
  const bbox = calculateBoundingBox(centered);
  
  // 5. Generate UVs
  const uvs = generatePlanarUVs(centered, {
    projection: 'xy',
    scale: { x: 1, y: 1 }
  });
  
  return {
    vertices: centered,
    faces: triangulated,
    boundingBox: bbox,
    uvs: uvs
  };
}
```

## 📚 API Reference

For complete API documentation, see the individual helper files or the main [API Reference](./api-reference.md).

## 🔧 Integration with Three.js

All helper functions are designed to work seamlessly with Three.js:

```typescript
import * as THREE from 'three';
import { createCube, toBufferGeometry } from 'three-edit';

// Create mesh using helpers
const mesh = createCube({ width: 2, height: 2, depth: 2 });

// Convert to Three.js geometry
const geometry = toBufferGeometry(mesh);

// Create Three.js mesh
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const threeMesh = new THREE.Mesh(geometry, material);

// Add to scene
scene.add(threeMesh);
```

The helper system provides a complete foundation for building professional 3D modeling tools and applications. 