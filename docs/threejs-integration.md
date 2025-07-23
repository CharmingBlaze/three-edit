# Three.js Integration Guide

three-edit is designed to work seamlessly with Three.js, providing a bridge between editable 3D geometry and Three.js rendering. This guide explains how to use both libraries together effectively.

## Core Concept

**three-edit** = **3D Geometry Editing**  
**Three.js** = **3D Rendering & Display**

three-edit handles all the complex geometry operations (extrusion, beveling, boolean operations, etc.) while Three.js handles rendering, lighting, materials, and user interaction.

## Basic Workflow

### 1. Create Editable Geometry
```typescript
import { createCube, createSphere } from 'three-edit';

// Create editable meshes
const cube = createCube({ width: 2, height: 2, depth: 2 });
const sphere = createSphere({ radius: 1 });
```

### 2. Edit the Geometry
```typescript
import { extrudeFace, bevelEdge, booleanUnion } from 'three-edit';

// Perform complex editing operations
extrudeFace(cube, cube.faces[0], { distance: 1 });
bevelEdge(cube, cube.edges[0], { distance: 0.1 });

// Combine meshes
const combined = booleanUnion(cube, sphere);
```

### 3. Convert to Three.js for Rendering
```typescript
import { toBufferGeometry } from 'three-edit';
import * as THREE from 'three';

// Convert to Three.js BufferGeometry
const geometry = toBufferGeometry(combined);

// Create Three.js mesh
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);

// Add to scene
scene.add(mesh);
```

## Complete Example

```typescript
import { createCube, extrudeFace, toBufferGeometry } from 'three-edit';
import * as THREE from 'three';

// 1. Create editable geometry
const editableCube = createCube({ 
    width: 2, 
    height: 2, 
    depth: 2,
    name: 'MyCube'
});

// 2. Edit the geometry
extrudeFace(editableCube, editableCube.faces[0], { distance: 1 });

// 3. Convert to Three.js
const geometry = toBufferGeometry(editableCube);

// 4. Create Three.js mesh
const material = new THREE.MeshStandardMaterial({ 
    color: 0x00ff00,
    roughness: 0.7,
    metalness: 0.3
});
const mesh = new THREE.Mesh(geometry, material);

// 5. Add to Three.js scene
scene.add(mesh);
```

## Advanced Integration Patterns

### Real-time Editing with Three.js

```typescript
import { createCube, extrudeFace, toBufferGeometry } from 'three-edit';
import * as THREE from 'three';

class EditableMeshManager {
    private editableMeshes = new Map<string, any>();
    private threeMeshes = new Map<string, THREE.Mesh>();
    
    createMesh(id: string, options: any) {
        // Create editable mesh
        const editableMesh = createCube(options);
        this.editableMeshes.set(id, editableMesh);
        
        // Convert to Three.js
        const geometry = toBufferGeometry(editableMesh);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const mesh = new THREE.Mesh(geometry, material);
        
        this.threeMeshes.set(id, mesh);
        scene.add(mesh);
        
        return { editableMesh, mesh };
    }
    
    editMesh(id: string, operation: string, params: any) {
        const editableMesh = this.editableMeshes.get(id);
        const threeMesh = this.threeMeshes.get(id);
        
        if (!editableMesh || !threeMesh) return;
        
        // Perform editing operation
        switch (operation) {
            case 'extrude':
                extrudeFace(editableMesh, editableMesh.faces[0], params);
                break;
            // Add more operations...
        }
        
        // Update Three.js geometry
        const newGeometry = toBufferGeometry(editableMesh);
        threeMesh.geometry.dispose(); // Clean up old geometry
        threeMesh.geometry = newGeometry;
    }
}
```

### Import/Export Workflow

```typescript
import { importGLTF, exportGLTF, toBufferGeometry } from 'three-edit';
import * as THREE from 'three';

// Import GLTF and convert to editable mesh
const editableMeshes = await importGLTF(gltfData);

// Edit the meshes
editableMeshes.forEach(mesh => {
    // Perform editing operations...
});

// Convert back to Three.js for rendering
const threeMeshes = editableMeshes.map(mesh => {
    const geometry = toBufferGeometry(mesh);
    const material = new THREE.MeshStandardMaterial();
    return new THREE.Mesh(geometry, material);
});

// Export edited meshes
const exportedData = await exportGLTF(editableMeshes);
```

### Material Integration

```typescript
import { createCube, toBufferGeometry } from 'three-edit';
import * as THREE from 'three';

// Create editable mesh
const editableCube = createCube();

// Convert to Three.js with material support
const geometry = toBufferGeometry(editableCube, {
    includeMaterialIndices: true
});

// Create materials array
const materials = [
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // Material 0
    new THREE.MeshStandardMaterial({ color: 0x00ff00 }), // Material 1
    new THREE.MeshStandardMaterial({ color: 0x0000ff })  // Material 2
];

// Create mesh with material groups
const mesh = new THREE.Mesh(geometry, materials);
```

## Performance Considerations

### 1. Geometry Caching
```typescript
// Cache editable meshes to avoid recreation
const editableMeshCache = new Map();

function getOrCreateMesh(id: string, options: any) {
    if (!editableMeshCache.has(id)) {
        const mesh = createCube(options);
        editableMeshCache.set(id, mesh);
    }
    return editableMeshCache.get(id);
}
```

### 2. Batch Operations
```typescript
// Perform multiple edits before converting to Three.js
const cube = createCube();

// Batch multiple operations
extrudeFace(cube, cube.faces[0], { distance: 1 });
bevelEdge(cube, cube.edges[0], { distance: 0.1 });
insetFace(cube, cube.faces[1], { distance: 0.2 });

// Convert only once
const geometry = toBufferGeometry(cube);
```

### 3. LOD (Level of Detail)
```typescript
import { simplifyMesh } from 'three-edit';

// Create high-detail mesh for editing
const detailedMesh = createSphere({ radius: 1, segments: 64 });

// Create simplified version for rendering
const simplifiedMesh = simplifyMesh(detailedMesh, { targetRatio: 0.5 });
const geometry = toBufferGeometry(simplifiedMesh);
```

## Common Use Cases

### 1. 3D Modeling Application
```typescript
// User creates base geometry
let currentMesh = createCube();

// User performs editing operations
function onExtrudeClick() {
    extrudeFace(currentMesh, selectedFace, { distance: 1 });
    updateThreeJSGeometry();
}

function updateThreeJSGeometry() {
    const geometry = toBufferGeometry(currentMesh);
    threeMesh.geometry.dispose();
    threeMesh.geometry = geometry;
}
```

### 2. Procedural Geometry Generation
```typescript
function generateProceduralBuilding() {
    // Start with base
    let building = createCube({ width: 10, height: 1, depth: 10 });
    
    // Add floors
    for (let i = 0; i < 5; i++) {
        const floor = createCube({ width: 8, height: 3, depth: 8 });
        building = booleanUnion(building, floor);
    }
    
    // Add roof
    const roof = createCone({ radius: 6, height: 2 });
    building = booleanUnion(building, roof);
    
    return toBufferGeometry(building);
}
```

### 3. Animation with Editable Geometry
```typescript
function animateGeometry() {
    const editableMesh = createCube();
    const geometry = toBufferGeometry(editableMesh);
    const mesh = new THREE.Mesh(geometry, material);
    
    // Animate by editing geometry each frame
    function animate() {
        // Modify geometry
        extrudeFace(editableMesh, editableMesh.faces[0], { 
            distance: Math.sin(Date.now() * 0.001) * 0.5 
        });
        
        // Update Three.js geometry
        const newGeometry = toBufferGeometry(editableMesh);
        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
        
        requestAnimationFrame(animate);
    }
    
    animate();
}
```

## Best Practices

1. **Keep editable meshes in memory** for repeated editing operations
2. **Dispose of old geometries** to prevent memory leaks
3. **Batch operations** when possible to minimize conversions
4. **Use material indices** for complex material assignments
5. **Validate geometry** after complex operations
6. **Cache frequently used geometries** for performance

## Troubleshooting

### Common Issues

1. **Geometry not updating**: Make sure to call `toBufferGeometry()` after editing
2. **Memory leaks**: Always dispose of old geometries with `geometry.dispose()`
3. **Material issues**: Check that material indices match your materials array
4. **Performance problems**: Consider using LOD or simplifying complex meshes

### Debug Tips

```typescript
import { validateMesh } from 'three-edit';

// Validate geometry after operations
const validation = validateMesh(editableMesh);
if (!validation.isValid) {
    console.warn('Geometry validation failed:', validation.errors);
}
```

This integration pattern allows you to leverage the best of both worlds: three-edit's powerful geometry editing capabilities and Three.js's excellent rendering performance and ecosystem. 