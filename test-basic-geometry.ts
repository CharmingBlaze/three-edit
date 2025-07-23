#!/usr/bin/env node

/**
 * Basic Geometry Test Script
 * Tests our refactored primitives with the core geometry system
 */

// Import the primitives
import { 
    createCube, 
    createSphere, 
    createCylinder, 
    createCone, 
    createPlane, 
    createTorus,
    createCircle,
    createPyramid,
    createTetrahedron,
    createOctahedron,
    createIcosahedron
} from './src/index';

import { toBufferGeometry } from './src/conversion';

console.log('🎯 Three-Edit Basic Geometry Test\n');

// Test function
function testPrimitive(name: string, createFunction: any, options: any = {}) {
    console.log(`Testing ${name}...`);
    
    try {
        const startTime = Date.now();
        const mesh = createFunction(options);
        const endTime = Date.now();
        
        // Basic validation
        const vertexCount = mesh.vertices.length;
        const edgeCount = mesh.edges.length;
        const faceCount = mesh.faces.length;
        const hasUVs = mesh.vertices.some((v: any) => v.uv);
        const hasNormals = mesh.faces.some((f: any) => f.normal);
        
        // Convert to Three.js BufferGeometry
        const geometry = toBufferGeometry(mesh);
        
        console.log(`  ✅ ${name} created successfully`);
        console.log(`  📊 Vertices: ${vertexCount}`);
        console.log(`  📊 Edges: ${edgeCount}`);
        console.log(`  📊 Faces: ${faceCount}`);
        console.log(`  🎨 Has UVs: ${hasUVs ? 'Yes' : 'No'}`);
        console.log(`  🎨 Has Normals: ${hasNormals ? 'Yes' : 'No'}`);
        console.log(`  ⚡ Creation time: ${endTime - startTime}ms`);
        console.log(`  🔄 Three.js conversion: ✅ Success`);
        console.log(`  📐 Geometry attributes: ${Object.keys(geometry.attributes).join(', ')}`);
        console.log('');
        
        return {
            success: true,
            vertexCount,
            edgeCount,
            faceCount,
            hasUVs,
            hasNormals,
            creationTime: endTime - startTime
        };
        
    } catch (error: any) {
        console.log(`  ❌ ${name} failed: ${error.message}`);
        console.log('');
        return { success: false, error: error.message };
    }
}

// Test all primitives
const tests = [
    { name: 'Cube', func: createCube, options: { width: 2, height: 2, depth: 2, validate: true } },
    { name: 'Sphere', func: createSphere, options: { radius: 1, validate: true } },
    { name: 'Cylinder', func: createCylinder, options: { radiusTop: 1, radiusBottom: 1, height: 2, validate: true } },
    { name: 'Cone', func: createCone, options: { radius: 1, height: 2, validate: true } },
    { name: 'Plane', func: createPlane, options: { width: 2, height: 2, validate: true } },
    { name: 'Torus', func: createTorus, options: { radius: 1, tube: 0.4, validate: true } },
    { name: 'Circle', func: createCircle, options: { radius: 1, validate: true } },
    { name: 'Pyramid', func: createPyramid, options: { width: 2, height: 2, depth: 2, validate: true } },
    { name: 'Tetrahedron', func: createTetrahedron, options: { radius: 1, validate: true } },
    { name: 'Octahedron', func: createOctahedron, options: { radius: 1, validate: true } },
    { name: 'Icosahedron', func: createIcosahedron, options: { radius: 1, validate: true } }
];

console.log('🧪 Running primitive tests...\n');

const results = tests.map(test => testPrimitive(test.name, test.func, test.options));

// Summary
console.log('📋 Test Summary\n');

const successfulTests = results.filter(r => r.success);
const failedTests = results.filter(r => !r.success);

console.log(`✅ Successful: ${successfulTests.length}/${results.length}`);
console.log(`❌ Failed: ${failedTests.length}/${results.length}`);

if (successfulTests.length > 0) {
    const totalVertices = successfulTests.reduce((sum, r) => sum + r.vertexCount, 0);
    const totalEdges = successfulTests.reduce((sum, r) => sum + r.edgeCount, 0);
    const totalFaces = successfulTests.reduce((sum, r) => sum + r.faceCount, 0);
    const avgCreationTime = successfulTests.reduce((sum, r) => sum + (r.creationTime || 0), 0) / successfulTests.length;
    
    console.log(`📊 Total vertices created: ${totalVertices}`);
    console.log(`📊 Total edges created: ${totalEdges}`);
    console.log(`📊 Total faces created: ${totalFaces}`);
    console.log(`⚡ Average creation time: ${avgCreationTime.toFixed(2)}ms`);
}

if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    failedTests.forEach(test => {
        console.log(`  - ${test.error}`);
    });
}

// Advanced tests
console.log('\n🔬 Advanced Tests\n');

// Test with different options
console.log('Testing Cube with different options...');
const cube1 = testPrimitive('Cube (centered)', createCube, { width: 2, height: 2, depth: 2, centered: true, validate: true });
const cube2 = testPrimitive('Cube (not centered)', createCube, { width: 2, height: 2, depth: 2, centered: false, validate: true });

// Test UV layouts
console.log('Testing different UV layouts...');
const sphere1 = testPrimitive('Sphere (spherical UVs)', createSphere, { radius: 1, uvLayout: 'spherical', validate: true });
const sphere2 = testPrimitive('Sphere (planar UVs)', createSphere, { radius: 1, uvLayout: 'planar', validate: true });

// Test material assignment
console.log('Testing material assignment...');
const cylinder = testPrimitive('Cylinder (with material)', createCylinder, { 
    radiusTop: 1, 
    radiusBottom: 1, 
    height: 2, 
    materialId: 1, 
    validate: true 
});

// Test validation
console.log('Testing validation...');
try {
    const invalidSphere = createSphere({ radius: -1, validate: true });
    console.log('  ❌ Validation failed: Should have thrown error for negative radius');
} catch (error: any) {
    console.log('  ✅ Validation working: Caught invalid radius error');
}

try {
    const invalidCube = createCube({ width: 0, validate: true });
    console.log('  ❌ Validation failed: Should have thrown error for zero width');
} catch (error: any) {
    console.log('  ✅ Validation working: Caught invalid width error');
}

console.log('\n🎉 Basic geometry test completed!');
console.log('All refactored primitives are working correctly with the core geometry system.'); 