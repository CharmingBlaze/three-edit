const { 
  createCube, 
  createSphere, 
  createCylinder, 
  createCone, 
  createPlane, 
  createTorus, 
  createCircle, 
  createPyramid, 
  createCapsule 
} = require('./src/primitives');

const primitives = [
  { name: 'Cube', fn: createCube },
  { name: 'Sphere', fn: createSphere },
  { name: 'Cylinder', fn: createCylinder },
  { name: 'Cone', fn: createCone },
  { name: 'Plane', fn: createPlane },
  { name: 'Torus', fn: createTorus },
  { name: 'Circle', fn: createCircle },
  { name: 'Pyramid', fn: createPyramid },
  { name: 'Capsule', fn: createCapsule },
];

for (const primitive of primitives) {
  const mesh = primitive.fn();
  const verticesWithUVs = mesh.vertices.filter(v => v.uv);
  console.log(`${primitive.name}: ${verticesWithUVs.length}/${mesh.vertices.length} vertices have UVs`);
  
  if (verticesWithUVs.length === 0) {
    console.log(`  ERROR: ${primitive.name} has no UVs!`);
    console.log(`  Sample vertex:`, mesh.vertices[0]);
  }
} 