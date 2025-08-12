# JavaScript API Update - Quad/Tri/N-gon System

## 🎯 Overview

This document provides the updated JavaScript API for the three-edit library after the quad/tri/n-gon refactoring and visuals system implementation.

## 📦 Browser Usage

### Loading the Library
```html
<!-- Load the library -->
<script src="browser/three-edit.browser.iife.js"></script>

<!-- THREE is automatically available globally -->
<script>
    // ThreeEdit and THREE are now available
    console.log(ThreeEdit); // Main library object
    console.log(THREE);     // Three.js library
</script>
```

## 🧱 Primitive Creation (Updated)

### Cube (Now Creates Quads)
```javascript
// Create a cube with quad faces (6 faces instead of 12 triangles)
const cube = ThreeEdit.createCube({
    width: 2,
    height: 2,
    depth: 2,
    name: 'MyCube'
});

console.log(cube.getFaceCount()); // 6 (was 12 before)
console.log(cube.getFace(0).isQuad()); // true
```

### Plane (Now Creates Quads)
```javascript
// Create a plane with quad faces
const plane = ThreeEdit.createPlane({
    width: 4,
    height: 4,
    widthSegments: 4,
    heightSegments: 4
});

console.log(plane.getFaceCount()); // 16 quads (was 32 triangles before)
```

### Other Primitives
```javascript
// Tetrahedron (still creates triangles - required by geometry)
const tetrahedron = ThreeEdit.createTetrahedron({ size: 2 });
console.log(tetrahedron.getFace(0).isTriangle()); // true

// Sphere (mixed face types)
const sphere = ThreeEdit.createSphere({ radius: 1, widthSegments: 8, heightSegments: 6 });
// May have both quads and triangles depending on geometry
```

## 🔍 Face Type Detection

### New Face Methods
```javascript
const mesh = ThreeEdit.createCube();
const face = mesh.getFace(0);

// Face type detection
console.log(face.getFaceType());     // 'quad', 'triangle', or 'ngon'
console.log(face.isQuad());          // true/false
console.log(face.isTriangle());      // true/false
console.log(face.isNgon());          // true/false
console.log(face.getVertexCount());  // 3, 4, or 5+

// Face validation
console.log(face.isValid());         // true/false

// Face information
console.log(face.toString());        // "Face(quad, vertices: [0, 1, 2, 3], edges: [0, 1, 2, 3])"
```

### Mesh Statistics
```javascript
const mesh = ThreeEdit.createCube();
const faceCount = mesh.getFaceCount();
let quadCount = 0, triCount = 0, ngonCount = 0;

for (let i = 0; i < faceCount; i++) {
    const face = mesh.getFace(i);
    if (face.isQuad()) quadCount++;
    else if (face.isTriangle()) triCount++;
    else if (face.isNgon()) ngonCount++;
}

console.log(`Faces: ${faceCount}, Quads: ${quadCount}, Tris: ${triCount}, N-gons: ${ngonCount}`);
```

## 🔄 Triangulation System

### Manual Triangulation
```javascript
const mesh = ThreeEdit.createCube(); // 6 quads

// Triangulate for export
const result = ThreeEdit.triangulateForExport(mesh, {
    quadMethod: 'optimal',    // 'diagonal' | 'optimal'
    ngonMethod: 'fan',        // 'earcut' | 'fan'
    preserveOriginal: true    // Keep original mesh intact
});

console.log(result.stats);
// {
//   originalFaces: 6,
//   triangleFaces: 12,
//   quadsTriangulated: 6,
//   ngonTriangulated: 0
// }

const triangulatedMesh = result.mesh; // New mesh with all triangles
```

### Triangle-to-Quad Merging (Future)
```javascript
// This function is a placeholder for future implementation
const quadsCreated = ThreeEdit.mergeTrianglesToQuads(mesh);
console.log(`Created ${quadsCreated} quads from triangles`);
```

## 📤 Export System (Updated)

### OBJ Export (Preserves Face Types)
```javascript
const mesh = ThreeEdit.createCube(); // 6 quads

// Export preserves quads
const objData = ThreeEdit.exportOBJ(mesh, {
    includeNormals: true,
    includeUVs: true,
    scale: 1.0
});

// OBJ file will contain:
// f 1 2 3 4    (quad face)
// f 5 6 7 8    (quad face)
// etc.
```

### GLTF Export (Automatic Triangulation)
```javascript
const mesh = ThreeEdit.createCube(); // 6 quads

// GLTF automatically triangulates
const gltfData = ThreeEdit.exportGLTF(mesh);

// GLTF will contain only triangles
// All quads are converted to triangles during export
```

### Manual Export with Triangulation
```javascript
const mesh = ThreeEdit.createCube();

// Triangulate first, then export
const triangulated = ThreeEdit.triangulateForExport(mesh);
const objData = ThreeEdit.exportOBJ(triangulated.mesh);

// Now OBJ will contain only triangles
// f 1 2 3    (triangle face)
// f 1 3 4    (triangle face)
// etc.
```

## 🎨 Visuals System (New)

### Grid Helpers
```javascript
// 3D Grid Helper
const grid3D = ThreeEdit.GridHelper3D({
    size: 20,
    divisions: 40,
    color: 0x888888
});
scene.add(grid3D);

// Orthographic Grid Helpers
const topGrid = ThreeEdit.OrthoGridHelper.createTopGrid({
    size: 10,
    divisions: 20
});
scene.add(topGrid);

// Axis Helper
const axisHelper = ThreeEdit.AxisHelper({
    size: 5,
    showLabels: true
});
scene.add(axisHelper);
```

### Highlight Helpers
```javascript
const mesh = ThreeEdit.createCube();
const selection = new ThreeEdit.Selection();

// Highlight vertices
const vertexHighlights = ThreeEdit.HighlightVertices(mesh, selection, {
    color: 0x00ff00,
    size: 0.1
});
scene.add(vertexHighlights);

// Highlight edges
const edgeHighlights = ThreeEdit.HighlightEdges(mesh, selection, {
    color: 0xff0000,
    lineWidth: 2
});
scene.add(edgeHighlights);

// Highlight faces
const faceHighlights = ThreeEdit.HighlightFaces(mesh, selection, {
    color: 0x0000ff,
    opacity: 0.5
});
scene.add(faceHighlights);

// Hover highlights
const hoverHelper = new ThreeEdit.HoverHighlightHelper({
    color: 0xffff00,
    size: 0.15
});
scene.add(hoverHelper);
```

### Overlay Helpers
```javascript
// Bounding Box Helper
const bboxHelper = ThreeEdit.BoundingBoxHelper(mesh, selection, {
    color: 0xffffff,
    lineWidth: 1
});
scene.add(bboxHelper);
```

## 🔧 Utility Functions

### Face Operations
```javascript
const mesh = ThreeEdit.createCube();
const face = mesh.getFace(0);

// Get face vertices
const vertices = face.vertices; // [0, 1, 2, 3]

// Get adjacent vertices
const adjacent = face.getAdjacentVertices(0); // [3, 1]

// Get edges as vertex pairs
const edges = face.getEdgesAsVertexPairs(); // [[0,1], [1,2], [2,3], [3,0]]

// Get vertex at position
const vertex = face.getVertexAt(0); // 0
```

### Mesh Conversion
```javascript
const mesh = ThreeEdit.createCube();

// Convert to Three.js BufferGeometry
const geometry = ThreeEdit.toBufferGeometry(mesh);

// Convert from Three.js BufferGeometry
const newMesh = ThreeEdit.fromBufferGeometry(geometry);

// Convert to JSON
const json = ThreeEdit.toJSON(mesh);

// Convert from JSON
const restoredMesh = ThreeEdit.fromJSON(json);
```

## 🎯 Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Three-Edit Quad/Tri/N-gon Demo</title>
    <script src="browser/three-edit.browser.iife.js"></script>
</head>
<body>
    <div id="viewport"></div>
    <div id="stats"></div>
    
    <script>
        // Create scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(800, 600);
        document.getElementById('viewport').appendChild(renderer.domElement);
        
        // Add lights
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x404040));
        
        // Add grid helper
        const grid = ThreeEdit.GridHelper3D({ size: 10, divisions: 10 });
        scene.add(grid);
        
        // Create cube with quads
        const mesh = ThreeEdit.createCube({ width: 2, height: 2, depth: 2 });
        console.log(`Created cube with ${mesh.getFaceCount()} faces`);
        
        // Check face types
        let quadCount = 0, triCount = 0;
        for (let i = 0; i < mesh.getFaceCount(); i++) {
            const face = mesh.getFace(i);
            if (face.isQuad()) quadCount++;
            else if (face.isTriangle()) triCount++;
        }
        console.log(`Quads: ${quadCount}, Triangles: ${triCount}`);
        
        // Convert to Three.js geometry
        const geometry = ThreeEdit.toBufferGeometry(mesh);
        const material = new THREE.MeshPhongMaterial({ color: 0x4CAF50 });
        const threeMesh = new THREE.Mesh(geometry, material);
        scene.add(threeMesh);
        
        // Add axis helper
        const axis = ThreeEdit.AxisHelper({ size: 3 });
        scene.add(axis);
        
        // Position camera
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
        
        // Export example
        function exportMesh() {
            const objData = ThreeEdit.exportOBJ(mesh);
            console.log('OBJ Data:', objData);
            
            const triangulated = ThreeEdit.triangulateForExport(mesh);
            console.log('Triangulation stats:', triangulated.stats);
        }
        
        // Make export function available globally
        window.exportMesh = exportMesh;
    </script>
</body>
</html>
```

## 🔄 Migration Guide

### From Old System
```javascript
// OLD: Create cube (12 triangles)
const cube = ThreeEdit.createCube();
console.log(cube.getFaceCount()); // 12

// NEW: Create cube (6 quads)
const cube = ThreeEdit.createCube();
console.log(cube.getFaceCount()); // 6
console.log(cube.getFace(0).isQuad()); // true
```

### New Features
```javascript
// NEW: Face type detection
const face = mesh.getFace(0);
if (face.isQuad()) {
    console.log('This is a quad!');
}

// NEW: Triangulation
const triangulated = ThreeEdit.triangulateForExport(mesh);

// NEW: Visuals system
const grid = ThreeEdit.GridHelper3D({ size: 10 });
const highlights = ThreeEdit.HighlightVertices(mesh, selection);
```

## ✅ Compatibility

### Backward Compatible
- All existing APIs continue to work
- No breaking changes introduced
- Existing code will work unchanged

### New Features
- Face type detection methods
- Triangulation utilities
- Visuals system
- Enhanced export options

## 🚀 Performance Benefits

### Reduced Face Count
```javascript
// Before: 12 triangles
const oldCube = createCube(); // 12 faces

// After: 6 quads
const newCube = createCube(); // 6 faces (50% reduction)
```

### Better Memory Usage
- Fewer faces = less memory
- Quads are more efficient for editing
- Better performance for large meshes

## 📚 Additional Resources

- `docs/QUAD_TRI_NGON_REFACTOR.md` - Detailed refactoring documentation
- `docs/SYSTEM_ANALYSIS.md` - System architecture analysis
- `examples/quad-tri-ngon-demo.html` - Interactive demo
- `examples/visuals-demo.html` - Visuals system demo 