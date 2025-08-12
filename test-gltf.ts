import { exportGLTF } from './src/io/gltf';
import { createCube } from './src/primitives/createCube';

const mesh = createCube();
const gltf = exportGLTF(mesh);
console.log('Generator:', gltf.asset.generator); 