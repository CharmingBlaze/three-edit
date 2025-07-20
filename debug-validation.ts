import { createCube } from './src/primitives/createCube.ts';
import { selectSimilar } from './src/selection/similarSelection.ts';
import { Selection } from './src/selection/Selection.ts';
// Vector3 is used in the similarSelection module

console.log('Testing vertex similarity logic...');

const mesh = createCube({ width: 2, height: 2, depth: 2 });
const initialSelection = new Selection();
initialSelection.vertices = new Set([0]); // Select first vertex

console.log('Mesh info:', {
  vertexCount: mesh.vertices.length,
  faceCount: mesh.faces.length,
  edgeCount: mesh.edges.length
});

// Test the first vertex properties
const firstVertex = mesh.getVertex(0);
console.log('First vertex:', {
  position: { x: firstVertex?.x, y: firstVertex?.y, z: firstVertex?.z },
  valence: 0 // We'll calculate this
});

// Calculate valence for first vertex
let valence = 0;
for (const edge of mesh.edges) {
  if (edge.v1 === 0 || edge.v2 === 0) {
    valence++;
  }
}
console.log('First vertex valence:', valence);

// Test with different thresholds
const thresholds = [0.1, 0.5, 1.0, 2.0];
for (const threshold of thresholds) {
  const selection = selectSimilar(mesh, initialSelection, {
    selectFaces: false,
    selectVertices: true,
    selectEdges: false,
    similarityThreshold: threshold
  });
  
  console.log(`Threshold ${threshold}:`, {
    vertices: selection.vertices.size,
    faces: selection.faces.size,
    edges: selection.edges.size
  });
} 