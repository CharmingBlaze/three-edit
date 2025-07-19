three-edit: Headless 3D Editing Library for Three.js
A clean, modular, and headless 3D geometry editing toolkit for building your own modelers, CAD tools, and 3D editors.

use windows terminal commands 

✅ Core Goals
⚙️ Headless (no UI) — just logic and data

📦 Modular & Tree-shakable

🔁 Works with Three.js: Convert to/from BufferGeometry

💡 Simple API: Friendly for hobbyists, indie devs, and pro users

🔄 Fully editable: Vertices, edges, faces, uvs, materials, transforms

🧱 Supports CAD-like workflows and game modelers (Blender-like)

📁 Folder & Feature Structure
1. core/EditableMesh
Editable mesh format: vertices, edges, faces, uvs, normals

Topology-safe operations

Unique IDs per element (for selection/edit tracking)

Lazy rebuild flags (positions, normals, uvs, etc.)

History snapshots

2. conversion/
fromBufferGeometry(geo)

toBufferGeometry(mesh)

fromPrimitive(type: "cube" | "sphere", options)

fromJSON(json)

toJSON(mesh)

3. primitives/
createCube(width, height, depth)

createSphere(radius, segments)

createCylinder(radiusTop, radiusBottom, height, radialSegments)

createCone(...)

createPlane(...)

createTorus(...)

createCircle(...)

createPolygon(...)

4. editing/
Geometry Editing Tools
extrudeFace(faceId)

subdivideFace(faceId)

bevelEdge(edgeId)

deleteVertex(vertexId)

mergeVertices()

bridgeFaces(faceId1, faceId2)

knifeCut(...)

fillHole(...)

5. selection/
Select by:

Raycast

ID

Box

Custom predicate

Modes:

Object

Vertex

Edge

Face

Multi-selection with shift/ctrl-like logic

Selection state store (can be reused in UI)

6. transform/
Move/Translate (by selection or object)

Rotate (by axis or matrix)

Scale (uniform or per-axis)

Snap to grid

Custom pivot support

7. uv/
Per-face and per-vertex UV support

UV unwrap (basic planar)

UV transform tools (scale, rotate, offset)

Generate default UVs

Preview canvas (headless or WebGL-compatible)

8. materials/
Per-face material index support

Material slots system

Assign/reassign material index

Merge faces by material

9. validation/
Detect non-manifold geometry

Check mesh consistency

Auto-repair options:

Fix flipped normals

Merge nearby verts

Remove duplicate faces

10. history/
Undo/Redo system

Stack-based snapshots

Optional batching (for grouped edits)

Works with external state (e.g., Zustand, Redux, etc.)

11. query/
getVertexNeighbors(vertexId)

getConnectedEdges(vertexId)

getFaceNormal(faceId)

getBoundaryEdges()

isManifold()

12. events/
Optional event emitter system

Hooks:

onEdit()

onSelectionChange()

onGeometryChange()

13. utils/
Vector/Math utilities (shared internally)

cloneMesh(mesh)

mergeMeshes(meshA, meshB)

applyMatrix(mesh, matrix)

Grid snapping

Bounding box / volume / area calculations

14. testing/
Prebuilt test geometries

Snapshot-based regression tests

Helpers for building unit test scenes

Fuzz testing for edit stability

📦 API Design Sample
ts
Copy
Edit
import {
  createCube,
  extrudeFace,
  toBufferGeometry,
  selectFace,
  applyMatrix,
} from 'three-edit'

const cube = createCube(1, 1, 1)
selectFace(cube, 2)
extrudeFace(cube, 2, { distance: 0.5 })
applyMatrix(cube, new THREE.Matrix4().makeRotationY(Math.PI / 4))

const geometry = toBufferGeometry(cube)
✨ Extras You Can Add Later
Boolean operations (CSG)

Shape drawing (2D profile extrusion, lathe, sweep)

Animation keyframe tools

Scripting support (user-defined macros)

Exporters (GLTF, OBJ, STL, JSON)

🔌 Integration Helpers (Optional)
Zustand store template for editor state

React Three Fiber adapter hooks:

useEditableMesh

useSelectionHighlight

Event replay for collaborative editing

Snap-to-grid or axis handles (for future UI)