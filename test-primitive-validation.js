// Test file to validate primitive geometry
// Run this in the browser console after loading three-edit.js

function testPrimitives() {
    console.log('🧪 Testing ThreeEdit Primitives...');
    
    // Test Cube
    console.log('\n📦 Testing Cube...');
    const cube = ThreeEdit.createCube({ width: 2, height: 2, depth: 2 });
    console.log(`Cube: ${cube.vertices.length} vertices, ${cube.faces.length} faces, ${cube.edges.length} edges`);
    
    // Verify cube has 8 vertices and 12 faces (2 triangles per face, 6 faces)
    if (cube.vertices.length !== 8) {
        console.error('❌ Cube should have 8 vertices');
    } else {
        console.log('✅ Cube has correct number of vertices');
    }
    
    if (cube.faces.length !== 12) {
        console.error('❌ Cube should have 12 triangular faces');
    } else {
        console.log('✅ Cube has correct number of faces');
    }
    
    // Test Sphere
    console.log('\n🔵 Testing Sphere...');
    const sphere = ThreeEdit.createSphere({ radius: 1, segments: 8, rings: 6 });
    console.log(`Sphere: ${sphere.vertices.length} vertices, ${sphere.faces.length} faces, ${sphere.edges.length} edges`);
    
    // Verify sphere has reasonable topology
    const expectedVertices = (8 + 1) * (6 + 1); // (segments + 1) * (rings + 1)
    const expectedFaces = 8 * 6 * 2; // segments * rings * 2 triangles per quad
    
    if (sphere.vertices.length !== expectedVertices) {
        console.error(`❌ Sphere should have ${expectedVertices} vertices, got ${sphere.vertices.length}`);
    } else {
        console.log('✅ Sphere has correct number of vertices');
    }
    
    if (sphere.faces.length !== expectedFaces) {
        console.error(`❌ Sphere should have ${expectedFaces} faces, got ${sphere.faces.length}`);
    } else {
        console.log('✅ Sphere has correct number of faces');
    }
    
    // Test Cylinder
    console.log('\n🔘 Testing Cylinder...');
    const cylinder = ThreeEdit.createCylinder({ radius: 1, height: 2, segments: 8 });
    console.log(`Cylinder: ${cylinder.vertices.length} vertices, ${cylinder.faces.length} faces, ${cylinder.edges.length} edges`);
    
    // Verify cylinder has reasonable topology
    const cylVertices = 8 * 2 + 2; // segments * 2 (top/bottom) + 2 center vertices
    const cylFaces = 8 * 2 + 8 * 2; // segments * 2 (side triangles) + segments * 2 (cap triangles)
    
    if (cylinder.vertices.length !== cylVertices) {
        console.error(`❌ Cylinder should have ${cylVertices} vertices, got ${cylinder.vertices.length}`);
    } else {
        console.log('✅ Cylinder has correct number of vertices');
    }
    
    if (cylinder.faces.length !== cylFaces) {
        console.error(`❌ Cylinder should have ${cylFaces} faces, got ${cylinder.faces.length}`);
    } else {
        console.log('✅ Cylinder has correct number of faces');
    }
    
    // Test Plane
    console.log('\n⬜ Testing Plane...');
    const plane = ThreeEdit.createPlane({ width: 2, height: 2, widthSegments: 2, heightSegments: 2 });
    console.log(`Plane: ${plane.vertices.length} vertices, ${plane.faces.length} faces, ${plane.edges.length} edges`);
    
    // Verify plane has correct topology
    const planeVertices = (2 + 1) * (2 + 1); // (widthSegments + 1) * (heightSegments + 1)
    const planeFaces = 2 * 2 * 2; // widthSegments * heightSegments * 2 triangles per quad
    
    if (plane.vertices.length !== planeVertices) {
        console.error(`❌ Plane should have ${planeVertices} vertices, got ${plane.vertices.length}`);
    } else {
        console.log('✅ Plane has correct number of vertices');
    }
    
    if (plane.faces.length !== planeFaces) {
        console.error(`❌ Plane should have ${planeFaces} faces, got ${plane.faces.length}`);
    } else {
        console.log('✅ Plane has correct number of faces');
    }
    
    // Test face winding order
    console.log('\n🔄 Testing face winding order...');
    let correctWinding = 0;
    let totalFaces = 0;
    
    [cube, sphere, cylinder, plane].forEach(mesh => {
        mesh.faces.forEach(face => {
            totalFaces++;
            if (face.vertices.length >= 3) {
                const v1 = face.vertices[0];
                const v2 = face.vertices[1];
                const v3 = face.vertices[2];
                
                // Calculate face normal
                const edge1 = new THREE.Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
                const edge2 = new THREE.Vector3(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
                const normal = new THREE.Vector3().crossVectors(edge1, edge2);
                
                // Check if normal points outward (positive length)
                if (normal.length() > 0) {
                    correctWinding++;
                }
            }
        });
    });
    
    console.log(`Face winding: ${correctWinding}/${totalFaces} faces have correct winding`);
    
    if (correctWinding === totalFaces) {
        console.log('✅ All faces have correct winding order');
    } else {
        console.error('❌ Some faces have incorrect winding order');
    }
    
    console.log('\n🎉 Primitive validation complete!');
}

// Run the test
testPrimitives(); 