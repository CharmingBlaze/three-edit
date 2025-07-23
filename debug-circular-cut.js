import { createCube } from './src/primitives/createCube.js';
import { knifeCutCircle } from './src/editing/knife.js';
import { Vector3 } from 'three';

// Create a cube
const cube = createCube();

console.log('Cube bounds:');
console.log('Vertices:', cube.vertices.length);
console.log('Edges:', cube.edges.length);
console.log('Faces:', cube.faces.length);

// Check cube bounds
let minX = Infinity, maxX = -Infinity;
let minY = Infinity, maxY = -Infinity;
let minZ = Infinity, maxZ = -Infinity;

for (const vertex of cube.vertices) {
  minX = Math.min(minX, vertex.x);
  maxX = Math.max(maxX, vertex.x);
  minY = Math.min(minY, vertex.y);
  maxY = Math.max(maxY, vertex.y);
  minZ = Math.min(minZ, vertex.z);
  maxZ = Math.max(maxZ, vertex.z);
}

console.log('Cube bounds:');
console.log('X:', minX, 'to', maxX);
console.log('Y:', minY, 'to', maxY);
console.log('Z:', minZ, 'to', maxZ);

// Test circular cut parameters
const center = new Vector3(0, 0, 0.5);
const radius = 0.5;

console.log('\nCircular cut parameters:');
console.log('Center:', center);
console.log('Radius:', radius);

// Generate some points on the circle to see where they are
console.log('\nCircle points (first 8):');
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const x = center.x + Math.cos(angle) * radius;
  const y = center.y + Math.sin(angle) * radius;
  const z = center.z;
  console.log(`Point ${i}: (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`);
}

// Test the circular cut
console.log('\nPerforming circular cut...');
const result = knifeCutCircle(cube, center, radius, 8);

console.log('Result:', result);

// Check if any edges were created
console.log('\nChecking edges...');
for (let i = 0; i < Math.min(10, cube.edges.length); i++) {
  const edge = cube.edges[i];
  const v1 = cube.vertices[edge.v1];
  const v2 = cube.vertices[edge.v2];
  console.log(`Edge ${i}: v${edge.v1}(${v1.x.toFixed(3)}, ${v1.y.toFixed(3)}, ${v1.z.toFixed(3)}) -> v${edge.v2}(${v2.x.toFixed(3)}, ${v2.y.toFixed(3)}, ${v2.z.toFixed(3)})`);
} 