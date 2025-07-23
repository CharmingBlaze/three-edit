import { createCube } from './src/primitives/createCube.js';
import { insetFaces } from './src/editing/inset.js';
import { validateGeometryIntegrity } from './src/validation/validateGeometryIntegrity.js';

// Create a cube
const cube = createCube();

console.log('Original mesh validation:');
const originalValidation = validateGeometryIntegrity(cube);
console.log(JSON.stringify(originalValidation, null, 2));

// Perform inset operation
console.log('\nPerforming inset operation...');
const result = insetFaces(cube, [0], { 
  distance: 0.2, 
  validate: true 
});

console.log('\nInset result:');
console.log('Success:', result.success);
console.log('Vertices created:', result.verticesCreated);
console.log('Edges created:', result.edgesCreated);
console.log('Faces created:', result.facesCreated);

console.log('\nValidation after inset:');
console.log(JSON.stringify(result.validation, null, 2));

console.log('\nMesh stats after inset:');
console.log('Vertices:', cube.vertices.length);
console.log('Edges:', cube.edges.length);
console.log('Faces:', cube.faces.length);

// Check the new faces that were created
if (result.facesCreated > 0) {
  console.log('\nNew faces created:');
  const newFaces = cube.faces.slice(-result.facesCreated);
  for (let i = 0; i < newFaces.length; i++) {
    const face = newFaces[i];
    console.log(`Face ${cube.faces.length - result.facesCreated + i}:`, face.vertices);
  }
} 