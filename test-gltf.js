const { exportGLTF } = require('./src/io/gltf.ts');
const { createCube } = require('./src/primitives/createCube.ts');

const mesh = createCube();
const gltf = exportGLTF(mesh);
console.log('Generator:', gltf.asset.generator); 