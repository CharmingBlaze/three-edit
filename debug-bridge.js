// Debug script to test bridge functionality
import { createCube } from './src/primitives/index.js';
import { bridgeEdges } from './src/editing/bridge.js';

// Create a cube
const cube = createCube({ width: 2, height: 2, depth: 2 });

console.log('Cube vertices:', cube.vertices.length);
console.log('Cube edges:', cube.edges.length);
console.log('Cube faces:', cube.faces.length);

// Log all edges
console.log('\nAll edges:');
cube.edges.forEach((edge, index) => {
  const v1 = cube.vertices[edge.v1];
  const v2 = cube.vertices[edge.v2];
  console.log(`Edge ${index}: ${edge.v1}->${edge.v2} (${v1.x.toFixed(2)},${v1.y.toFixed(2)},${v1.z.toFixed(2)}) -> (${v2.x.toFixed(2)},${v2.y.toFixed(2)},${v2.z.toFixed(2)})`);
});

// Test bridging different edge combinations
console.log('\nTesting edge combinations:');
for (let i = 0; i < cube.edges.length; i++) {
  for (let j = i + 1; j < cube.edges.length; j++) {
    const result = bridgeEdges(cube, i, j);
    if (result.success) {
      console.log(`✅ Edge ${i} -> Edge ${j}: SUCCESS (${result.edgesBridged} edges, ${result.facesCreated} faces)`);
    } else {
      console.log(`❌ Edge ${i} -> Edge ${j}: ${result.error}`);
    }
  }
} 