# Three-Edit API Reference

## Table of Contents

1. [Core Classes](#core-classes)
2. [Primitives](#primitives)
3. [Transform Operations](#transform-operations)
4. [Array Operations](#array-operations)
5. [Boolean Operations](#boolean-operations)
6. [Selection System](#selection-system)
7. [Extrusion Operations](#extrusion-operations)
8. [Mirror Operations](#mirror-operations)
9. [Beveling System](#beveling-system)
10. [Deformation Operations](#deformation-operations)
11. [Noise and Displacement](#noise-and-displacement)
12. [Import/Export](#importexport)
13. [History System](#history-system)
14. [Materials](#materials)
15. [Utilities](#utilities)

## Core Classes

### EditableMesh

The main class representing a 3D mesh with editable geometry.

```typescript
class EditableMesh {
  // Properties
  vertices: Vertex[];
  edges: Edge[];
  faces: Face[];
  materials: MaterialManager;

  // Constructor
  constructor();

  // Vertex operations
  addVertex(vertex: VertexData): number;
  removeVertex(index: number): boolean;
  getVertex(index: number): Vertex | null;
  getVertexCount(): number;

  // Edge operations
  addEdge(edge: Edge): number;
  removeEdge(index: number): boolean;
  getEdge(index: number): Edge | null;
  getEdgeCount(): number;

  // Face operations
  addFace(face: Face): number;
  removeFace(index: number): boolean;
  getFace(index: number): Face | null;
  getFaceCount(): number;

  // Validation
  validateMesh(): boolean;
  repairMesh(): void;
}
```

### Vertex

Represents a vertex in 3D space.

```typescript
interface VertexData {
  x: number;
  y: number;
  z: number;
  uv?: { u: number; v: number };
  normal?: Vector3;
  color?: { r: number; g: number; b: number; a?: number };
}

class Vertex {
  x: number;
  y: number;
  z: number;
  uv?: { u: number; v: number };
  normal?: Vector3;
  color?: { r: number; g: number; b: number; a?: number };

  constructor(data: VertexData);
  clone(): Vertex;
  equals(other: Vertex): boolean;
}
```

### Edge

Represents an edge connecting two vertices.

```typescript
class Edge {
  vertex1: number;
  vertex2: number;

  constructor(vertex1: number, vertex2: number);
  clone(): Edge;
  equals(other: Edge): boolean;
  getOtherVertex(vertex: number): number | null;
}
```

### Face

Represents a face with multiple vertices and edges.

```typescript
interface FaceData {
  materialIndex?: number;
  normal?: Vector3;
  uv?: { u: number; v: number };
}

class Face {
  vertices: number[];
  edges: number[];
  materialIndex: number;
  normal?: Vector3;
  uv?: { u: number; v: number };

  constructor(vertices: number[], edges: number[], data?: FaceData);
  clone(): Face;
  equals(other: Face): boolean;
  getVertexCount(): number;
  getEdgeCount(): number;
}
```

## Primitives

### Basic Primitives

#### createCube
```typescript
interface CubeOptions {
  width?: number;
  height?: number;
  depth?: number;
  materialIndex?: number;
  generateUVs?: boolean;
  generateNormals?: boolean;
  center?: Vector3;
}

function createCube(options?: CubeOptions): EditableMesh;
```

#### createSphere
```typescript
interface SphereOptions {
  radius?: number;
  segments?: number;
  rings?: number;
  materialIndex?: number;
  generateUVs?: boolean;
  generateNormals?: boolean;
  center?: Vector3;
}

function createSphere(options?: SphereOptions): EditableMesh;
```

#### createCylinder
```typescript
interface CylinderOptions {
  radius?: number;
  height?: number;
  segments?: number;
  materialIndex?: number;
  generateUVs?: boolean;
  generateNormals?: boolean;
  center?: Vector3;
}

function createCylinder(options?: CylinderOptions): EditableMesh;
```

### Regular Polyhedra

#### createTetrahedron
```typescript
interface TetrahedronOptions {
  size?: number;
  materialIndex?: number;
  generateUVs?: boolean;
  generateNormals?: boolean;
  center?: Vector3;
}

function createTetrahedron(options?: TetrahedronOptions): EditableMesh;
```

#### createOctahedron
```typescript
interface OctahedronOptions {
  size?: number;
  materialIndex?: number;
  generateUVs?: boolean;
  generateNormals?: boolean;
  center?: Vector3;
}

function createOctahedron(options?: OctahedronOptions): EditableMesh;
```

#### createDodecahedron
```typescript
interface DodecahedronOptions {
  size?: number;
  materialIndex?: number;
  generateUVs?: boolean;
  generateNormals?: boolean;
  center?: Vector3;
}

function createDodecahedron(options?: DodecahedronOptions): EditableMesh;
```

#### createIcosahedron
```typescript
interface IcosahedronOptions {
  size?: number;
  materialIndex?: number;
  generateUVs?: boolean;
  generateNormals?: boolean;
  center?: Vector3;
}

function createIcosahedron(options?: IcosahedronOptions): EditableMesh;
```

### Complex Shapes

#### createTorusKnot
```typescript
interface TorusKnotOptions {
  radius?: number;
  tubeRadius?: number;
  tubularSegments?: number;
  radialSegments?: number;
  p?: number;
  q?: number;
  materialIndex?: number;
  generateUVs?: boolean;
  generateNormals?: boolean;
  center?: Vector3;
}

function createTorusKnot(options?: TorusKnotOptions): EditableMesh;
```

#### createMobiusStrip
```typescript
interface MobiusStripOptions {
  radius?: number;
  width?: number;
  segments?: number;
  widthSegments?: number;
  twists?: number;
  materialIndex?: number;
  generateUVs?: boolean;
  generateNormals?: boolean;
  center?: Vector3;
}

function createMobiusStrip(options?: MobiusStripOptions): EditableMesh;
```

## Transform Operations

### Basic Transforms

#### move
```typescript
interface MoveOptions {
  direction: Vector3;
  distance?: number;
  selectedOnly?: boolean;
}

function move(mesh: EditableMesh, options: MoveOptions): void;
```

#### rotate
```typescript
interface RotateOptions {
  axis: Vector3;
  angle: number;
  center?: Vector3;
  selectedOnly?: boolean;
}

function rotate(mesh: EditableMesh, options: RotateOptions): void;
```

#### scale
```typescript
interface ScaleOptions {
  factor: Vector3;
  center?: Vector3;
  selectedOnly?: boolean;
}

function scale(mesh: EditableMesh, options: ScaleOptions): void;
```

### Advanced Transforms

#### mirror
```typescript
interface MirrorOptions {
  type: 'plane' | 'axis' | 'point';
  plane?: { point: Vector3; normal: Vector3 };
  axis?: { point: Vector3; direction: Vector3 };
  point?: Vector3;
  selectedOnly?: boolean;
}

function mirror(mesh: EditableMesh, options: MirrorOptions): void;
```

## Array Operations

### Linear Array
```typescript
interface LinearArrayOptions {
  count: number;
  direction: Vector3;
  distance: number;
  offset?: Vector3;
  merge?: boolean;
}

function createLinearArray(mesh: EditableMesh, options: LinearArrayOptions): EditableMesh;
```

### Radial Array
```typescript
interface RadialArrayOptions {
  count: number;
  radius: number;
  center: Vector3;
  axis: Vector3;
  startAngle?: number;
  endAngle?: number;
  merge?: boolean;
}

function createRadialArray(mesh: EditableMesh, options: RadialArrayOptions): EditableMesh;
```

### Grid Array
```typescript
interface GridArrayOptions {
  counts: Vector3;
  distances: Vector3;
  offset?: Vector3;
  merge?: boolean;
}

function createGridArray(mesh: EditableMesh, options: GridArrayOptions): EditableMesh;
```

### Generic Array
```typescript
interface ArrayOptions {
  type: 'linear' | 'radial' | 'grid';
  linear?: LinearArrayOptions;
  radial?: RadialArrayOptions;
  grid?: GridArrayOptions;
}

function createArray(mesh: EditableMesh, options: ArrayOptions): EditableMesh;
```

## Boolean Operations

### Union
```typescript
interface UnionOptions {
  materialIndex?: number;
  mergeVertices?: boolean;
}

function union(mesh1: EditableMesh, mesh2: EditableMesh, options?: UnionOptions): EditableMesh;
```

### Intersection
```typescript
interface IntersectionOptions {
  materialIndex?: number;
  mergeVertices?: boolean;
}

function intersection(mesh1: EditableMesh, mesh2: EditableMesh, options?: IntersectionOptions): EditableMesh;
```

### Difference
```typescript
interface DifferenceOptions {
  materialIndex?: number;
  mergeVertices?: boolean;
}

function difference(mesh1: EditableMesh, mesh2: EditableMesh, options?: DifferenceOptions): EditableMesh;
```

## Selection System

### Basic Selection
```typescript
interface Selection {
  vertices: Set<number>;
  edges: Set<number>;
  faces: Set<number>;
}

function selectVertices(mesh: EditableMesh, indices: number[]): Selection;
function selectEdges(mesh: EditableMesh, indices: number[]): Selection;
function selectFaces(mesh: EditableMesh, indices: number[]): Selection;
```

### Advanced Selection
```typescript
function selectRing(mesh: EditableMesh, edgeIndex: number): Selection;
function selectLoop(mesh: EditableMesh, edgeIndex: number): Selection;
function selectConnected(mesh: EditableMesh, vertexIndex: number): Selection;
function selectBoundary(mesh: EditableMesh): Selection;
function selectByMaterial(mesh: EditableMesh, materialIndex: number): Selection;
```

## Extrusion Operations

### Vertex Extrusion
```typescript
interface VertexExtrusionOptions {
  direction: Vector3;
  distance: number;
  keepOriginal?: boolean;
  materialIndex?: number;
}

function extrudeVertex(mesh: EditableMesh, vertexIndex: number, options: VertexExtrusionOptions): void;
```

### Edge Extrusion
```typescript
interface EdgeExtrusionOptions {
  direction: Vector3;
  distance: number;
  keepOriginal?: boolean;
  materialIndex?: number;
}

function extrudeEdge(mesh: EditableMesh, edgeIndex: number, options: EdgeExtrusionOptions): void;
```

### Face Extrusion
```typescript
interface FaceExtrusionOptions {
  direction: Vector3;
  distance: number;
  keepOriginal?: boolean;
  materialIndex?: number;
}

function extrudeFace(mesh: EditableMesh, faceIndex: number, options: FaceExtrusionOptions): void;
```

## Mirror Operations

### Mirror by Plane
```typescript
interface PlaneMirrorOptions {
  point: Vector3;
  normal: Vector3;
  selectedOnly?: boolean;
}

function mirrorByPlane(mesh: EditableMesh, options: PlaneMirrorOptions): void;
```

### Mirror by Axis
```typescript
interface AxisMirrorOptions {
  point: Vector3;
  direction: Vector3;
  selectedOnly?: boolean;
}

function mirrorByAxis(mesh: EditableMesh, options: AxisMirrorOptions): void;
```

### Mirror by Point
```typescript
interface PointMirrorOptions {
  point: Vector3;
  selectedOnly?: boolean;
}

function mirrorByPoint(mesh: EditableMesh, options: PointMirrorOptions): void;
```

## Beveling System

### Edge Beveling
```typescript
interface EdgeBevelOptions {
  distance: number;
  segments: number;
  profile?: number;
  materialIndex?: number;
  bothSides?: boolean;
  direction?: Vector3;
}

function bevelEdge(mesh: EditableMesh, edgeIndex: number, options: EdgeBevelOptions): void;
```

### Vertex Beveling
```typescript
interface VertexBevelOptions {
  distance: number;
  segments: number;
  profile?: number;
  materialIndex?: number;
  allEdges?: boolean;
  direction?: Vector3;
}

function bevelVertex(mesh: EditableMesh, vertexIndex: number, options: VertexBevelOptions): void;
```

### Face Beveling
```typescript
interface FaceBevelOptions {
  distance: number;
  segments: number;
  profile?: number;
  materialIndex?: number;
  allEdges?: boolean;
  direction?: Vector3;
}

function bevelFace(mesh: EditableMesh, faceIndex: number, options: FaceBevelOptions): void;
```

## Deformation Operations

### Bend Operations
```typescript
interface BendOptions {
  axis: Vector3;
  angle: number;
  center?: Vector3;
  direction?: Vector3;
}

function bend(mesh: EditableMesh, options: BendOptions): void;
```

### Twist Operations
```typescript
interface TwistOptions {
  axis: Vector3;
  angle: number;
  center?: Vector3;
  direction?: Vector3;
}

function twist(mesh: EditableMesh, options: TwistOptions): void;
```

### Taper Operations
```typescript
interface TaperOptions {
  axis: Vector3;
  factor: number;
  center?: Vector3;
  direction?: Vector3;
}

function taper(mesh: EditableMesh, options: TaperOptions): void;
```

## Noise and Displacement

### Vertex Noise
```typescript
interface VertexNoiseOptions {
  scale: number;
  intensity: number;
  seed?: number;
  type?: 'perlin' | 'fractal' | 'cellular' | 'turbulence';
}

function applyVertexNoise(mesh: EditableMesh, options: VertexNoiseOptions): void;
```

### Face Displacement
```typescript
interface FaceDisplacementOptions {
  intensity: number;
  direction?: Vector3;
  texture?: string;
}

function applyFaceDisplacement(mesh: EditableMesh, options: FaceDisplacementOptions): void;
```

### Generic Noise
```typescript
interface NoiseOptions {
  type: 'vertex' | 'face';
  scale: number;
  intensity: number;
  seed?: number;
  noiseType?: 'perlin' | 'fractal' | 'cellular' | 'turbulence';
  direction?: Vector3;
  texture?: string;
}

function applyNoise(mesh: EditableMesh, options: NoiseOptions): void;
```

## Import/Export

### OBJ Format
```typescript
interface OBJOptions {
  includeNormals?: boolean;
  includeUVs?: boolean;
  includeMaterials?: boolean;
  scale?: number;
  flipY?: boolean;
  flipZ?: boolean;
}

function parseOBJ(content: string, options?: OBJOptions): EditableMesh;
function exportOBJ(mesh: EditableMesh, options?: OBJOptions): string;
function loadOBJ(url: string, options?: OBJOptions): Promise<EditableMesh>;
function saveOBJ(mesh: EditableMesh, filename: string, options?: OBJOptions): Promise<void>;
```

### GLTF Format
```typescript
interface GLTFOptions {
  includeAnimations?: boolean;
  includeMaterials?: boolean;
  binary?: boolean;
  scale?: number;
  flipY?: boolean;
  flipZ?: boolean;
}

function parseGLTF(content: string | ArrayBuffer, options?: GLTFOptions): EditableMesh;
function exportGLTF(mesh: EditableMesh, options?: GLTFOptions): string | ArrayBuffer;
function loadGLTF(url: string, options?: GLTFOptions): Promise<EditableMesh>;
function saveGLTF(mesh: EditableMesh, filename: string, options?: GLTFOptions): Promise<void>;
```

### PLY Format
```typescript
interface PLYOptions {
  includeColors?: boolean;
  includeNormals?: boolean;
  includeUVs?: boolean;
  binary?: boolean;
  scale?: number;
  flipY?: boolean;
  flipZ?: boolean;
}

function parsePLY(content: string | ArrayBuffer, options?: PLYOptions): EditableMesh;
function exportPLY(mesh: EditableMesh, options?: PLYOptions): string | ArrayBuffer;
function loadPLY(url: string, options?: PLYOptions): Promise<EditableMesh>;
function savePLY(mesh: EditableMesh, filename: string, options?: PLYOptions): Promise<void>;
```

## History System

### Command
```typescript
interface Command {
  execute(): void;
  undo(): void;
  redo(): void;
}
```

### CommandHistory
```typescript
class CommandHistory {
  execute(command: Command): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
}
```

## Materials

### Material
```typescript
interface Material {
  name: string;
  type: 'standard' | 'phong' | 'basic';
  color?: { r: number; g: number; b: number };
  opacity?: number;
  transparent?: boolean;
  wireframe?: boolean;
}

class MaterialManager {
  addMaterial(material: Material): number;
  getMaterial(index: number): Material | null;
  removeMaterial(index: number): boolean;
  getMaterialCount(): number;
}
```

## Utilities

### Math Utils
```typescript
function clamp(value: number, min: number, max: number): number;
function lerp(a: number, b: number, t: number): number;
function smoothstep(edge0: number, edge1: number, x: number): number;
function degToRad(degrees: number): number;
function radToDeg(radians: number): number;
```

### Validation
```typescript
function validateGeometryIntegrity(mesh: EditableMesh): boolean;
function fixWindingOrder(mesh: EditableMesh): void;
function repairMesh(mesh: EditableMesh): void;
```

### Conversion
```typescript
function toBufferGeometry(mesh: EditableMesh): THREE.BufferGeometry;
function fromBufferGeometry(geometry: THREE.BufferGeometry): EditableMesh;
function toJSON(mesh: EditableMesh): string;
function fromJSON(json: string): EditableMesh;
```

## Type Definitions

### Common Types
```typescript
type Vector3 = THREE.Vector3;
type Matrix4 = THREE.Matrix4;
type BufferGeometry = THREE.BufferGeometry;
type Material = THREE.Material;
```

### Error Types
```typescript
class ThreeEditError extends Error {
  constructor(message: string, code?: string);
}

class ValidationError extends ThreeEditError {
  constructor(message: string, details?: any);
}

class OperationError extends ThreeEditError {
  constructor(message: string, operation?: string);
}
```

## Performance Considerations

### Memory Management
- Use `dispose()` methods to free memory
- Reuse objects when possible
- Avoid creating unnecessary intermediate objects

### Optimization Tips
- Use `selectedOnly` options for large meshes
- Batch operations when possible
- Use appropriate segment counts for primitives
- Enable/disable UV and normal generation as needed

### Best Practices
- Validate meshes after complex operations
- Use the history system for undo/redo
- Handle errors gracefully
- Test with various mesh sizes and complexities
