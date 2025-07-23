# JavaScript Usage Guide

This guide covers how to use three-edit with vanilla JavaScript, including all the new helper functions and features.

## 🚀 Quick Start

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
    <title>Three-Edit JavaScript Example</title>
</head>
<body>
    <div id="container"></div>
    
    <!-- Include Three.js -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js"></script>
    
    <!-- Include Three-Edit -->
    <script src="path/to/three-edit/browser/three-edit.js"></script>
    
    <script>
        // ThreeEdit is available as a global variable
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(renderer.domElement);
        
        // Create a cube using ThreeEdit
        const cube = ThreeEdit.createCube({ width: 2, height: 2, depth: 2 });
        const geometry = ThreeEdit.toBufferGeometry(cube);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const mesh = new THREE.Mesh(geometry, material);
        
        scene.add(mesh);
        camera.position.z = 5;
        
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
    </script>
</body>
</html>
```

### ES Modules Setup

```javascript
// Import the JavaScript wrapper
import ThreeEditJS from 'three-edit/js-wrapper';

// Create a scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Create meshes using ThreeEdit
const cube = ThreeEditJS.createCube({ width: 2, height: 2, depth: 2 });
const sphere = ThreeEditJS.createSphere({ radius: 1, segments: 32 });

// Convert to Three.js geometries
const cubeGeometry = ThreeEditJS.toBufferGeometry(cube);
const sphereGeometry = ThreeEditJS.toBufferGeometry(sphere);

// Create Three.js meshes
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

scene.add(cubeMesh);
scene.add(sphereMesh);
```

## 🧮 Math Utilities

### Basic Math Functions

```javascript
// Get math helpers
const math = ThreeEditJS.getHelpers().math;

// Clamp values
const clamped = math.clamp(value, 0, 100);

// Linear interpolation
const interpolated = math.lerp(start, end, 0.5);

// Round to decimal places
const rounded = math.roundTo(value, 2);

// Modulo operation
const mod = math.modulo(-5, 3); // Returns 1

// Distance calculations
const distance = math.distance3D(point1, point2);

// Vector operations
const dot = math.dotProduct(vector1, vector2);
const cross = math.crossProduct(vector1, vector2);

// Triangle validation
const isValid = math.isValidTriangle(vertex1, vertex2, vertex3);
const area = math.calculateTriangleArea(vertex1, vertex2, vertex3);
```

### Vector Math Examples

```javascript
const math = ThreeEditJS.getHelpers().math;

// Create vectors
const v1 = new THREE.Vector3(1, 0, 0);
const v2 = new THREE.Vector3(0, 1, 0);

// Calculate distance
const distance = math.distance3D(v1, v2);

// Calculate angle between vectors
const angle = math.angleBetweenVectors(v1, v2);

// Find midpoint
const midpoint = math.midpoint(v1, v2);

// Calculate centroid of multiple points
const points = [v1, v2, new THREE.Vector3(0, 0, 1)];
const centroid = math.centroid(points);
```

## 📐 Geometry Operations

### Core Geometry Functions

```javascript
const geometry = ThreeEditJS.getHelpers().geometry;

// Triangulate complex polygons
const triangles = geometry.triangulatePolygon(vertices, face);

// Merge duplicate vertices
const merged = geometry.mergeVertices(vertices, faces, 0.001);

// Center vertices around origin
const centered = geometry.centerVertices(vertices);

// Scale vertices
const scaled = geometry.scaleVertices(vertices, 2.0);

// Rotate vertices
const rotated = geometry.rotateVertices(vertices, rotation);

// Create vertex grids
const grid = geometry.createVertexGrid(10, 10, 1.0);

// Create faces from grid
const faces = geometry.createFacesFromGrid(grid, 0);
```

### Geometry Processing Pipeline

```javascript
function processGeometry(mesh) {
    const geometry = ThreeEditJS.getHelpers().geometry;
    
    // 1. Clean up geometry
    const merged = geometry.mergeVertices(mesh.vertices, mesh.faces, 0.001);
    
    // 2. Center geometry
    const centered = geometry.centerVertices(merged.vertices);
    
    // 3. Triangulate complex faces
    const triangulated = [];
    merged.faces.forEach(face => {
        if (face.vertices.length > 3) {
            const triangles = geometry.triangulatePolygon(centered, face);
            triangulated.push(...triangles);
        } else {
            triangulated.push(face);
        }
    });
    
    // 4. Subdivide faces for smoother geometry
    const subdivided = [];
    triangulated.forEach(face => {
        const result = geometry.subdivideFace(centered, face, true);
        subdivided.push(...result.newFaces);
    });
    
    return {
        vertices: centered,
        faces: subdivided
    };
}
```

## 🎨 Editor Integration

### Highlight System

```javascript
const editor = ThreeEditJS.getHelpers().editor;

// Create highlights
const vertexHighlight = editor.createVertexHighlight(
    new THREE.Vector3(0, 0, 0),
    { color: 0xff0000, size: 0.1 }
);

const edgeHighlight = editor.createEdgeHighlight(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 1, 1),
    { color: 0x00ff00, lineWidth: 2 }
);

const faceHighlight = editor.createFaceHighlight(
    [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)],
    { color: 0x0000ff, opacity: 0.3 }
);

// Add to scene
scene.add(vertexHighlight);
scene.add(edgeHighlight);
scene.add(faceHighlight);

// Update highlights
ThreeEditJS.updateHighlightColor(vertexHighlight, 0xffff00);
ThreeEditJS.updateHighlightOpacity(faceHighlight, 0.5);
```

### Grid System

```javascript
const editor = ThreeEditJS.getHelpers().editor;

// Create reference grid
const grid = editor.createGrid({
    size: 20,
    divisions: 20,
    color: 0x888888,
    opacity: 0.5
});

// Create snap grid
const snapGrid = editor.createSnapGrid({
    size: 10,
    snapDistance: 0.1,
    color: 0x444444
});

// Add to scene
scene.add(grid);
scene.add(snapGrid);

// Update grid
ThreeEditJS.updateGridScale(grid, 2.0);
ThreeEditJS.updateGridVisibility(grid, false);
```

### Overlay System

```javascript
const editor = ThreeEditJS.getHelpers().editor;

// Create measurement lines
const measurement = editor.createMeasurementLine(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(5, 0, 0),
    { color: 0xffff00, showDistance: true }
);

// Create axis arrows
const axes = editor.createAxisArrows({
    size: 5,
    arrowSize: 0.5
});

// Create bounding box overlay
const bboxOverlay = editor.createBoundingBoxOverlay(
    new THREE.Box3(),
    { color: 0x00ffff, showDimensions: true }
);

// Add to scene
scene.add(measurement);
scene.add(axes);
scene.add(bboxOverlay);
```

## 🧱 Primitive Creation

### Basic Shapes

```javascript
// Create basic shapes
const cube = ThreeEditJS.createCube({
    width: 2,
    height: 2,
    depth: 2,
    materialIndex: 0
});

const sphere = ThreeEditJS.createSphere({
    radius: 1,
    segments: 32,
    rings: 16,
    materialIndex: 0
});

const cylinder = ThreeEditJS.createCylinder({
    radius: 1,
    height: 2,
    segments: 16,
    materialIndex: 0
});

const plane = ThreeEditJS.createPlane({
    width: 4,
    height: 4,
    widthSegments: 4,
    heightSegments: 4,
    materialIndex: 0
});

// Convert to Three.js geometries
const cubeGeometry = ThreeEditJS.toBufferGeometry(cube);
const sphereGeometry = ThreeEditJS.toBufferGeometry(sphere);
const cylinderGeometry = ThreeEditJS.toBufferGeometry(cylinder);
const planeGeometry = ThreeEditJS.toBufferGeometry(plane);
```

### Complex Shapes

```javascript
// Create complex shapes
const torus = ThreeEditJS.createTorus({
    radius: 2,
    tubeRadius: 0.5,
    radialSegments: 32,
    tubularSegments: 16,
    materialIndex: 0
});

const cone = ThreeEditJS.createCone({
    radius: 1,
    height: 2,
    radialSegments: 16,
    heightSegments: 8,
    materialIndex: 0
});

const pyramid = ThreeEditJS.createPyramid({
    baseSize: 2,
    height: 3,
    materialIndex: 0
});

const capsule = ThreeEditJS.createCapsule({
    radius: 0.5,
    height: 2,
    segments: 16,
    materialIndex: 0
});
```

### Parametric Shapes

```javascript
// Create parametric shapes
const torusKnot = ThreeEditJS.createTorusKnot({
    radius: 2,
    tubeRadius: 0.5,
    p: 2,
    q: 3,
    radialSegments: 64,
    tubularSegments: 32,
    materialIndex: 0
});

const mobiusStrip = ThreeEditJS.createMobiusStrip({
    radius: 2,
    width: 1,
    segments: 64,
    materialIndex: 0
});

const arrow = ThreeEditJS.createArrow({
    length: 3,
    headLength: 0.5,
    headWidth: 0.3,
    shaftRadius: 0.1,
    materialIndex: 0
});
```

## 🔧 Utility Functions

### UV Operations

```javascript
const utilities = ThreeEditJS.getHelpers().utilities;

// Generate UVs
const planarUVs = utilities.generatePlanarUVs(vertices, {
    projection: 'xy',
    scale: { x: 1, y: 1 },
    offset: { x: 0, y: 0 }
});

const cylindricalUVs = utilities.generateCylindricalUVs(vertices, {
    center: { x: 0, y: 0, z: 0 },
    radius: 1,
    height: 2
});

const sphericalUVs = utilities.generateSphericalUVs(vertices, {
    center: { x: 0, y: 0, z: 0 },
    radius: 1
});
```

### Normal Operations

```javascript
const utilities = ThreeEditJS.getHelpers().utilities;

// Calculate normals
utilities.calculateFaceNormals(faces, vertices);
utilities.calculateSmoothNormals(faces, vertices, Math.PI / 4);
```

### Validation and Debug

```javascript
const utilities = ThreeEditJS.getHelpers().utilities;

// Validate mesh
const validation = utilities.validateMesh(mesh);
console.log('Mesh validation:', validation);

// Debug mesh
utilities.debugMesh(mesh);
utilities.logMeshStats(mesh);
```

## 🎯 Complete Editor Example

```javascript
// Complete 3D editor setup
class ThreeEditEditor {
    constructor(containerId) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.container = document.getElementById(containerId);
        
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupEditorElements();
        this.setupControls();
        
        this.animate();
    }
    
    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
    }
    
    setupCamera() {
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 5);
        
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
    }
    
    setupEditorElements() {
        const editor = ThreeEditJS.getHelpers().editor;
        
        // Create grid
        this.grid = editor.createGrid({
            size: 20,
            divisions: 20,
            color: 0x888888,
            opacity: 0.5
        });
        
        // Create axis arrows
        this.axes = editor.createAxisArrows({
            size: 5,
            arrowSize: 0.5
        });
        
        // Create highlight group
        this.highlights = [];
        
        this.scene.add(this.grid);
        this.scene.add(this.axes);
    }
    
    setupControls() {
        // Add your control system here (OrbitControls, etc.)
    }
    
    createMesh(type, options) {
        let mesh;
        
        switch(type) {
            case 'cube':
                mesh = ThreeEditJS.createCube(options);
                break;
            case 'sphere':
                mesh = ThreeEditJS.createSphere(options);
                break;
            case 'cylinder':
                mesh = ThreeEditJS.createCylinder(options);
                break;
            default:
                mesh = ThreeEditJS.createCube(options);
        }
        
        const geometry = ThreeEditJS.toBufferGeometry(mesh);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const threeMesh = new THREE.Mesh(geometry, material);
        
        this.scene.add(threeMesh);
        return threeMesh;
    }
    
    highlightSelection(selection) {
        // Clear previous highlights
        this.highlights.forEach(h => ThreeEditJS.disposeHighlightObject(h));
        this.highlights = [];
        
        const editor = ThreeEditJS.getHelpers().editor;
        
        // Create new highlights
        if (selection.vertices) {
            selection.vertices.forEach(vertex => {
                const highlight = editor.createVertexHighlight(vertex.position, { color: 0xff0000 });
                this.highlights.push(highlight);
                this.scene.add(highlight);
            });
        }
        
        if (selection.edges) {
            selection.edges.forEach(edge => {
                const highlight = editor.createEdgeHighlight(edge.start, edge.end, { color: 0x00ff00 });
                this.highlights.push(highlight);
                this.scene.add(highlight);
            });
        }
        
        if (selection.faces) {
            selection.faces.forEach(face => {
                const highlight = editor.createFaceHighlight(face.vertices, { color: 0x0000ff, opacity: 0.3 });
                this.highlights.push(highlight);
                this.scene.add(highlight);
            });
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

// Usage
const editor = new ThreeEditEditor('container');
const cube = editor.createMesh('cube', { width: 2, height: 2, depth: 2 });
```

## 🔧 Advanced Operations

### Applying Operations

```javascript
// Apply editing operations
const cube = ThreeEditJS.createCube({ width: 2, height: 2, depth: 2 });

// Extrude a face
const extrudedGeometry = ThreeEditJS.applyOperation(
    cube,
    ThreeEditJS.extrudeFace,
    cube.faces[0],
    new THREE.Vector3(0, 1, 0),
    1
);

// Bevel an edge
const beveledGeometry = ThreeEditJS.applyOperation(
    cube,
    ThreeEditJS.bevelEdge,
    cube.edges[0],
    0.1
);

// Transform vertices
const transformedGeometry = ThreeEditJS.applyOperation(
    cube,
    ThreeEditJS.moveVertices,
    cube.vertices,
    new THREE.Vector3(1, 0, 0)
);
```

### Boolean Operations

```javascript
// Boolean operations
const cube1 = ThreeEditJS.createCube({ width: 2, height: 2, depth: 2 });
const cube2 = ThreeEditJS.createCube({ width: 1, height: 1, depth: 1 });

// Union
const union = ThreeEditJS.booleanUnion(cube1, cube2);

// Intersection
const intersection = ThreeEditJS.booleanIntersection(cube1, cube2);

// Difference
const difference = ThreeEditJS.booleanDifference(cube1, cube2);

// Convert to Three.js geometry
const unionGeometry = ThreeEditJS.toBufferGeometry(union);
```

## 📚 Best Practices

### Performance Optimization

```javascript
// Use object pooling for frequently created objects
const highlightPool = [];

function getHighlight() {
    if (highlightPool.length > 0) {
        return highlightPool.pop();
    }
    return ThreeEditJS.getHelpers().editor.createVertexHighlight(
        new THREE.Vector3(),
        { color: 0xff0000 }
    );
}

function returnHighlight(highlight) {
    highlightPool.push(highlight);
}

// Batch operations
function batchUpdateHighlights(highlights, newPositions) {
    highlights.forEach((highlight, index) => {
        ThreeEditJS.updateVertexHighlight(highlight, newPositions[index]);
    });
}
```

### Memory Management

```javascript
// Proper cleanup
function cleanupEditor() {
    // Dispose highlights
    this.highlights.forEach(h => ThreeEditJS.disposeHighlightObject(h));
    this.highlights = [];
    
    // Dispose grid
    ThreeEditJS.disposeGrid(this.grid);
    
    // Dispose geometries
    this.scene.children.forEach(child => {
        if (child.geometry) {
            child.geometry.dispose();
        }
        if (child.material) {
            child.material.dispose();
        }
    });
}
```

### Error Handling

```javascript
// Safe geometry operations
function safeGeometryOperation(mesh, operation) {
    try {
        // Validate mesh first
        const validation = ThreeEditJS.getHelpers().utilities.validateMesh(mesh);
        if (!validation.isValid) {
            console.warn('Mesh validation failed:', validation.errors);
            return null;
        }
        
        // Apply operation
        const result = operation(mesh);
        
        // Validate result
        const resultValidation = ThreeEditJS.getHelpers().utilities.validateMesh(result);
        if (!resultValidation.isValid) {
            console.error('Operation result is invalid:', resultValidation.errors);
            return mesh; // Return original mesh
        }
        
        return result;
    } catch (error) {
        console.error('Geometry operation failed:', error);
        return mesh; // Return original mesh
    }
}
```

This comprehensive JavaScript usage guide covers all the new helper functions and features, making it easy for vanilla JavaScript developers to build professional 3D modeling tools with three-edit. 