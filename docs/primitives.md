# Primitives

Primitives are basic geometric shapes that can be used as a starting point for more complex models. `three-edit` provides a variety of primitive creation functions.

## createCube

Creates a cube `EditableMesh` with specified dimensions and segmentation.

### Signature

```typescript
function createCube(options?: {
  width?: number;
  height?: number;
  depth?: number;
  name?: string;
}): EditableMesh;
```

### Options

- `width`: The width of the cube (default: `1`).
- `height`: The height of the cube (default: `1`).
- `depth`: The depth of the cube (default: `1`).
- `name`: The name of the mesh (default: `'Cube'`).

### Example

```typescript
import { createCube } from 'three-edit';

const cube = createCube({ width: 2, height: 2, depth: 2 });
```

## `createSphere`

Creates a sphere `EditableMesh` with a given radius and segmentation.

### Signature

```typescript
function createSphere(options?: CreateSphereOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateSphereOptions`:
  - `radius?: number`: The radius of the sphere. Defaults to `1`.
  - `widthSegments?: number`: The number of horizontal segments. Defaults to `32`.
  - `heightSegments?: number`: The number of vertical segments. Defaults to `16`.
  - `phiStart?: number`: The starting horizontal angle in radians. Defaults to `0`.
  - `phiLength?: number`: The horizontal sweep angle size in radians. Defaults to `Math.PI * 2`.
  - `thetaStart?: number`: The starting vertical angle in radians. Defaults to `0`.
  - `thetaLength?: number`: The vertical sweep angle size in radians. Defaults to `Math.PI`.
  - `name?: string`: The name of the mesh. Defaults to `'Sphere'`.

### Returns

A new `EditableMesh` instance representing a sphere.

### Example

```typescript
import { createSphere } from 'three-edit';

const sphere = createSphere({ radius: 2, widthSegments: 64, heightSegments: 32 });
```

## `createCylinder`

Creates a cylinder `EditableMesh` with a given radius, height, and segmentation.

### Signature

```typescript
function createCylinder(options?: CreateCylinderOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateCylinderOptions`:
  - `radius?: number`: The radius of the cylinder. Defaults to `1`.
  - `height?: number`: The height of the cylinder. Defaults to `2`.
  - `radialSegments?: number`: The number of segments around the circumference. Defaults to `8`.
  - `heightSegments?: number`: The number of segments along the height. Defaults to `1`.
  - `openEnded?: boolean`: If `true`, the cylinder will not have caps. Defaults to `false`.
  - `thetaStart?: number`: The starting angle in radians. Defaults to `0`.
  - `thetaLength?: number`: The sweep angle size in radians. Defaults to `Math.PI * 2`.
  - `name?: string`: The name of the mesh. Defaults to `'Cylinder'`.

### Returns

A new `EditableMesh` instance representing a cylinder.

### Example

```typescript
import { createCylinder } from 'three-edit';

const cylinder = createCylinder({ radius: 1, height: 3, radialSegments: 16 });
```

## `createCone`

Creates a cone `EditableMesh` with a given radius, height, and segmentation.

### Signature

```typescript
function createCone(options?: CreateConeOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateConeOptions`:
  - `radius?: number`: The radius of the cone's base. Defaults to `1`.
  - `height?: number`: The height of the cone. Defaults to `2`.
  - `radialSegments?: number`: The number of segments around the circumference. Defaults to `8`.
  - `heightSegments?: number`: The number of segments along the height. Defaults to `1`.
  - `openEnded?: boolean`: If `true`, the cone will not have a base. Defaults to `false`.
  - `thetaStart?: number`: The starting angle in radians. Defaults to `0`.
  - `thetaLength?: number`: The sweep angle size in radians. Defaults to `Math.PI * 2`.
  - `name?: string`: The name of the mesh. Defaults to `'Cone'`.

### Returns

A new `EditableMesh` instance representing a cone.

### Example

```typescript
import { createCone } from 'three-edit';

const cone = createCone({ radius: 1, height: 3, radialSegments: 16 });
```

## `createCircle`

Creates a 2D circle `EditableMesh` lying in the XY plane.

### Signature

```typescript
function createCircle(options?: CreateCircleOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateCircleOptions`:
  - `radius?: number`: The radius of the circle. Defaults to `1`.
  - `segments?: number`: The number of segments. Defaults to `8`.
  - `thetaStart?: number`: The starting angle in radians. Defaults to `0`.
  - `thetaLength?: number`: The sweep angle size in radians. Defaults to `Math.PI * 2`.
  - `name?: string`: The name of the mesh. Defaults to `'Circle'`.

### Returns

A new `EditableMesh` instance representing a circle.

### Example

```typescript
import { createCircle } from 'three-edit';

const circle = createCircle({ radius: 2, segments: 32 });
```

## `createPlane`

Creates a 2D plane `EditableMesh` lying in the XY plane.

### Signature

```typescript
function createPlane(options?: CreatePlaneOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreatePlaneOptions`:
  - `width?: number`: The width of the plane. Defaults to `1`.
  - `height?: number`: The height of the plane. Defaults to `1`.
  - `widthSegments?: number`: The number of segments along the width. Defaults to `1`.
  - `heightSegments?: number`: The number of segments along the height. Defaults to `1`.
  - `name?: string`: The name of the mesh. Defaults to `'Plane'`.

### Returns

A new `EditableMesh` instance representing a plane.

### Example

```typescript
import { createPlane } from 'three-edit';

const plane = createPlane({ width: 4, height: 2 });
```

## `createTorus`

Creates a torus `EditableMesh`.

### Signature

```typescript
function createTorus(options?: CreateTorusOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateTorusOptions`:
  - `radius?: number`: The radius of the torus (from the center to the tube's center). Defaults to `1`.
  - `tubeRadius?: number`: The radius of the tube. Defaults to `0.4`.
  - `radialSegments?: number`: The number of segments around the torus's circumference. Defaults to `8`.
  - `tubularSegments?: number`: The number of segments around the tube's circumference. Defaults to `6`.
  - `arc?: number`: The central angle of the torus. Defaults to `Math.PI * 2`.
  - `name?: string`: The name of the mesh. Defaults to `'Torus'`.

### Returns

A new `EditableMesh` instance representing a torus.

### Example

```typescript
import { createTorus } from 'three-edit';

const torus = createTorus({ radius: 5, tubeRadius: 1, radialSegments: 32, tubularSegments: 16 });
```

## `createCapsule`

Creates a capsule `EditableMesh`, which is a cylinder with hemispherical caps at both ends.

### Signature

```typescript
function createCapsule(options?: CreateCapsuleOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateCapsuleOptions`:
  - `radius?: number`: The radius of the capsule's hemispheres and cylinder part. Defaults to `1`.
  - `height?: number`: The total height of the capsule (including caps). Defaults to `2`.
  - `radialSegments?: number`: The number of segments around the circumference. Defaults to `8`.
  - `heightSegments?: number`: The number of segments for the cylindrical part. Defaults to `1`.
  - `capSegments?: number`: The number of vertical segments for the hemispherical caps. Defaults to `4`.
  - `name?: string`: The name of the mesh. Defaults to `'Capsule'`.

### Returns

A new `EditableMesh` instance representing a capsule.

### Example

```typescript
import { createCapsule } from 'three-edit';

const capsule = createCapsule({ radius: 1, height: 3, radialSegments: 16, capSegments: 8 });
```

## `createArrow`

Creates an arrow `EditableMesh` consisting of a shaft and a head.

### Signature

```typescript
function createArrow(options?: CreateArrowOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateArrowOptions`:
  - `shaftLength?: number`: The length of the arrow's shaft. Defaults to `2`.
  - `shaftWidth?: number`: The width of the arrow's shaft. Defaults to `0.1`.
  - `shaftHeight?: number`: The height of the arrow's shaft. Defaults to `0.1`.
  - `headLength?: number`: The length of the arrowhead. Defaults to `0.5`.
  - `headWidth?: number`: The width of the arrowhead. Defaults to `0.3`.
  - `headHeight?: number`: The height of the arrowhead. Defaults to `0.3`.
  - `shaftSegments?: number`: The number of segments for the shaft. Defaults to `1`.
  - `headSegments?: number`: The number of segments for the head. Defaults to `1`.
  - `name?: string`: The name of the mesh. Defaults to `'Arrow'`.

### Returns

A new `EditableMesh` instance representing an arrow.

### Example

```typescript
import { createArrow } from 'three-edit';

const arrow = createArrow({ shaftLength: 3, headLength: 1 });
```

## `createBoundingBox`

Creates a wireframe bounding box `EditableMesh`.

### Signature

```typescript
function createBoundingBox(options?: CreateBoundingBoxOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateBoundingBoxOptions`:
  - `width?: number`: The width of the bounding box. Defaults to `2`.
  - `height?: number`: The height of the bounding box. Defaults to `2`.
  - `depth?: number`: The depth of the bounding box. Defaults to `2`.
  - `lineThickness?: number`: The thickness of the wireframe lines. Defaults to `0.02`.
  - `name?: string`: The name of the mesh. Defaults to `'BoundingBox'`.

### Returns

A new `EditableMesh` instance representing a bounding box.

### Example

```typescript
import { createBoundingBox } from 'three-edit';

const boundingBox = createBoundingBox({ width: 4, height: 4, depth: 4 });
```

## `createEmpty`

Creates an empty object, represented by a small cube for visualization purposes. This is useful as a placeholder or a parent for other objects.

### Signature

```typescript
function createEmpty(options?: CreateEmptyOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateEmptyOptions`:
  - `size?: number`: The size of the visualization cube. Defaults to `0.1`.
  - `name?: string`: The name of the mesh. Defaults to `'Empty'`.

### Returns

A new `EditableMesh` instance representing an empty object.

### Example

```typescript
import { createEmpty } from 'three-edit';

const empty = createEmpty({ size: 0.5 });
```

## `createGreebleBlock`

Creates a block with randomized "greeble" details on its surface, useful for adding visual complexity.

### Signature

```typescript
function createGreebleBlock(options?: CreateGreebleBlockOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateGreebleBlockOptions`:
  - `width?: number`: The width of the block. Defaults to `1`.
  - `height?: number`: The height of the block. Defaults to `1`.
  - `depth?: number`: The depth of the block. Defaults to `1`.
  - `divisions?: number`: The number of divisions along each axis for generating details. Defaults to `3`.
  - `detailHeight?: number`: The maximum height of the greeble details. Defaults to `0.1`.
  - `seed?: number`: A random seed for generating consistent greeble patterns. Defaults to a random integer.
  - `name?: string`: The name of the mesh. Defaults to `'GreebleBlock'`.

### Returns

A new `EditableMesh` instance representing a greeble block.

### Example

```typescript
import { createGreebleBlock } from 'three-edit';

const greebleBlock = createGreebleBlock({ width: 2, height: 2, depth: 2, divisions: 5, seed: 123 });
```

## `createHandle`

Creates a cylindrical handle `EditableMesh`.

### Signature

```typescript
function createHandle(options?: CreateHandleOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateHandleOptions`:
  - `radius?: number`: The radius of the handle. Defaults to `0.1`.
  - `height?: number`: The height of the handle. Defaults to `0.5`.
  - `radialSegments?: number`: The number of segments around the circumference. Defaults to `8`.
  - `heightSegments?: number`: The number of vertical segments along the handle's length. Defaults to `1`.
  - `name?: string`: The name of the mesh. Defaults to `'Handle'`.

### Returns

A new `EditableMesh` instance representing a handle.

### Example

```typescript
import { createHandle } from 'three-edit';

const handle = createHandle({ radius: 0.2, height: 1.0, radialSegments: 12 });
```

## `createLowPolySphere`

Creates a low-poly sphere `EditableMesh`.

### Signature

```typescript
function createLowPolySphere(options?: CreateLowPolySphereOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateLowPolySphereOptions`:
  - `radius?: number`: The radius of the sphere. Defaults to `1`.
  - `segments?: number`: The number of segments around the circumference. Defaults to `6`.
  - `name?: string`: The name of the mesh. Defaults to `'LowPolySphere'`.

### Returns

A new `EditableMesh` instance representing a low-poly sphere.

### Example

```typescript
import { createLowPolySphere } from 'three-edit';

const lowPolySphere = createLowPolySphere({ radius: 2, segments: 8 });
```

## `createNGon`

Creates a regular n-sided polygon (NGon) `EditableMesh`, which can be extruded to form a prism.

### Signature

```typescript
function createNGon(options?: CreateNGonOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateNGonOptions`:
  - `radius?: number`: The radius of the NGon. Defaults to `1`.
  - `sides?: number`: The number of sides. Defaults to `6`.
  - `height?: number`: The height of the extrusion. Defaults to `1`.
  - `heightSegments?: number`: The number of segments along the height. Defaults to `1`.
  - `openEnded?: boolean`: If `true`, the top and bottom faces are not created. Defaults to `false`.
  - `thetaStart?: number`: The starting angle in radians. Defaults to `0`.
  - `thetaLength?: number`: The central angle in radians. Defaults to `2 * Math.PI`.
  - `name?: string`: The name of the mesh. Defaults to `'NGon'`.

### Returns

A new `EditableMesh` instance representing an NGon.

### Example

```typescript
import { createNGon } from 'three-edit';

const ngon = createNGon({ radius: 2, sides: 8, height: 3 });
```

## `createPipe`

Creates a pipe (a hollow cylinder) `EditableMesh`.

### Signature

```typescript
function createPipe(options?: CreatePipeOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreatePipeOptions`:
  - `outerRadius?: number`: The outer radius of the pipe. Defaults to `1`.
  - `innerRadius?: number`: The inner radius of the pipe. Defaults to `0.5`.
  - `height?: number`: The height of the pipe. Defaults to `2`.
  - `radialSegments?: number`: The number of segments around the circumference. Defaults to `8`.
  - `heightSegments?: number`: The number of segments along the height. Defaults to `1`.
  - `openEnded?: boolean`: If `true`, the top and bottom caps are not created. Defaults to `false`.
  - `thetaStart?: number`: The starting angle in radians. Defaults to `0`.
  - `thetaLength?: number`: The central angle in radians. Defaults to `2 * Math.PI`.
  - `name?: string`: The name of the mesh. Defaults to `'Pipe'`.

### Returns

A new `EditableMesh` instance representing a pipe.

### Example

```typescript
import { createPipe } from 'three-edit';

const pipe = createPipe({ outerRadius: 2, innerRadius: 1.5, height: 4 });
```

## `createPyramid`

Creates a pyramid `EditableMesh` with a rectangular base and an apex.

### Signature

```typescript
function createPyramid(options?: CreatePyramidOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreatePyramidOptions`:
  - `width?: number`: The width of the pyramid's base. Defaults to `1`.
  - `height?: number`: The height of the pyramid's base. Defaults to `1`.
  - `depth?: number`: The height of the pyramid from base to apex. Defaults to `1`.
  - `widthSegments?: number`: The number of segments along the base's width. Defaults to `1`.
  - `heightSegments?: number`: The number of segments along the base's height. Defaults to `1`.
  - `name?: string`: The name of the mesh. Defaults to `'Pyramid'`.

### Returns

A new `EditableMesh` instance representing a pyramid.

### Example

```typescript
import { createPyramid } from 'three-edit';

const pyramid = createPyramid({ width: 2, height: 2, depth: 3 });
```

## `createRamp`

Creates a ramp `EditableMesh`.

### Signature

```typescript
function createRamp(options?: CreateRampOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateRampOptions`:
  - `width?: number`: The width of the ramp. Defaults to `2`.
  - `height?: number`: The height of the ramp. Defaults to `1`.
  - `length?: number`: The length of the ramp. Defaults to `4`.
  - `widthSegments?: number`: The number of segments along the width. Defaults to `1`.
  - `heightSegments?: number`: The number of segments along the height. Defaults to `1`.
  - `lengthSegments?: number`: The number of segments along the length. Defaults to `1`.
  - `name?: string`: The name of the mesh. Defaults to `'Ramp'`.

### Returns

A new `EditableMesh` instance representing a ramp.

### Example

```typescript
import { createRamp } from 'three-edit';

const ramp = createRamp({ width: 3, height: 1.5, length: 5 });
```

## `createRoundedBox`

Creates a box with rounded corners (`EditableMesh`).

### Signature

```typescript
function createRoundedBox(options?: CreateRoundedBoxOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateRoundedBoxOptions`:
  - `width?: number`: The width of the box. Defaults to `1`.
  - `height?: number`: The height of the box. Defaults to `1`.
  - `depth?: number`: The depth of the box. Defaults to `1`.
  - `cornerRadius?: number`: The radius of the corners. Defaults to `0.1`.
  - `cornerSegments?: number`: The number of segments for the rounded corners. Defaults to `4`.
  - `widthSegments?: number`: The number of segments along the width. Defaults to `1`.
  - `heightSegments?: number`: The number of segments along the height. Defaults to `1`.
  - `depthSegments?: number`: The number of segments along the depth. Defaults to `1`.
  - `name?: string`: The name of the mesh. Defaults to `'RoundedBox'`.

### Returns

A new `EditableMesh` instance representing a rounded box.

### Example

```typescript
import { createRoundedBox } from 'three-edit';

const roundedBox = createRoundedBox({ width: 2, height: 2, depth: 2, cornerRadius: 0.2 });
```

## `createStairs`

Creates a flight of stairs (`EditableMesh`).

### Signature

```typescript
function createStairs(options?: CreateStairsOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateStairsOptions`:
  - `width?: number`: The width of the stairs. Defaults to `2`.
  - `height?: number`: The total height of the stairs. Defaults to `2`.
  - `depth?: number`: The total depth of the stairs. Defaults to `4`.
  - `steps?: number`: The number of steps. Defaults to `4`.
  - `widthSegments?: number`: The number of segments along the width. Defaults to `1`.
  - `heightSegments?: number`: The number of segments for each step's riser. Defaults to `1`.
  - `depthSegments?: number`: The number of segments for each step's tread. Defaults to `1`.
  - `name?: string`: The name of the mesh. Defaults to `'Stairs'`.

### Returns

A new `EditableMesh` instance representing stairs.

### Example

```typescript
import { createStairs } from 'three-edit';

const stairs = createStairs({ width: 3, height: 2, depth: 5, steps: 6 });
```

## `createTorus`

Creates a torus (donut shape) `EditableMesh`.

### Signature

```typescript
function createTorus(options?: CreateTorusOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateTorusOptions`:
  - `radius?: number`: The radius of the torus (from the center to the center of the tube). Defaults to `1`.
  - `tubeRadius?: number`: The radius of the tube. Defaults to `0.4`.
  - `radialSegments?: number`: The number of segments around the torus. Defaults to `8`.
  - `tubularSegments?: number`: The number of segments around the tube. Defaults to `6`.
  - `arc?: number`: The central angle of the torus arc. Defaults to `2 * Math.PI` (a full circle).
  - `name?: string`: The name of the mesh. Defaults to `'Torus'`.

### Returns

A new `EditableMesh` instance representing a torus.

### Example

```typescript
import { createTorus } from 'three-edit';

const torus = createTorus({ radius: 2, tubeRadius: 0.5, radialSegments: 16, tubularSegments: 12 });
```

## `createWedge`

Creates a wedge-shaped `EditableMesh`. **Note:** The current implementation produces a standard rectangular prism (a box), not a wedge.

### Signature

```typescript
function createWedge(options?: CreateWedgeOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateWedgeOptions`:
  - `width?: number`: The width of the wedge's base. Defaults to `1`.
  - `height?: number`: The height of the wedge. Defaults to `1`.
  - `depth?: number`: The depth of the wedge. Defaults to `1`.
  - `widthSegments?: number`: The number of segments along the width. Defaults to `1`.
  - `heightSegments?: number`: The number of segments along the height. Defaults to `1`.
  - `depthSegments?: number`: The number of segments along the depth. Defaults to `1`.
  - `name?: string`: The name of the mesh. Defaults to `'Wedge'`.

### Returns

A new `EditableMesh` instance representing a wedge.

### Example

```typescript
import { createWedge } from 'three-edit';

const wedge = createWedge({ width: 2, height: 1, depth: 3 });
```


## `createWedge`

Creates a wedge-shaped `EditableMesh`. **Note:** The current implementation produces a standard rectangular prism (a box), not a wedge.

### Signature

```typescript
function createWedge(options?: CreateWedgeOptions): EditableMesh;
```

### Parameters

- `options`: Optional `CreateWedgeOptions`:
  - `width?: number`: The width of the wedge's base. Defaults to `1`.
  - `height?: number`: The height of the wedge. Defaults to `1`.
  - `depth?: number`: The depth of the wedge. Defaults to `1`.
  - `widthSegments?: number`: The number of segments along the width. Defaults to `1`.
  - `heightSegments?: number`: The number of segments along the height. Defaults to `1`.
  - `depthSegments?: number`: The number of segments along the depth. Defaults to `1`.
  - `name?: string`: The name of the mesh. Defaults to `'Wedge'`.

### Returns

A new `EditableMesh` instance representing a wedge.

### Example

```typescript
import { createWedge } from 'three-edit';

const wedge = createWedge({ width: 2, height: 1, depth: 3 });
```






















### Signature

```typescript
function createSphere(options?: {
  radius?: number;
  widthSegments?: number;
  heightSegments?: number;
  phiStart?: number;
  phiLength?: number;
  thetaStart?: number;
  thetaLength?: number;
  name?: string;
}): EditableMesh;
```

### Options

- `radius`: The radius of the sphere (default: `1`).
- `widthSegments`: The number of horizontal segments (default: `32`).
- `heightSegments`: The number of vertical segments (default: `16`).
- `phiStart`: The starting horizontal angle in radians (default: `0`).
- `phiLength`: The horizontal sweep angle size in radians (default: `Math.PI * 2`).
- `thetaStart`: The starting vertical angle in radians (default: `0`).
- `thetaLength`: The vertical sweep angle size in radians (default: `Math.PI`).
- `name`: The name of the mesh (default: `'Sphere'`).

### Example

```typescript
import { createSphere } from 'three-edit';

const sphere = createSphere({ radius: 1, widthSegments: 64, heightSegments: 32 });
```

## createPlane

Creates a plane as an `EditableMesh`.

### Signature

```typescript
function createPlane(options?: {
  width?: number;
  height?: number;
  widthSegments?: number;
  heightSegments?: number;
  name?: string;
}): EditableMesh;
```

### Options

- `width`: The width of the plane (default: `1`).
- `height`: The height of the plane (default: `1`).
- `widthSegments`: The number of width segments (default: `1`).
- `heightSegments`: The number of height segments (default: `1`).
- `name`: The name of the mesh (default: `'Plane'`).

### Example

```typescript
import { createPlane } from 'three-edit';

const plane = createPlane({ width: 10, height: 10 });
```
