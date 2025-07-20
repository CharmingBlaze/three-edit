import { exportGLTF } from './src/io/gltf.ts';
import { createCube } from './src/primitives/createCube.ts';

const mesh = createCube();
const gltf = exportGLTF(mesh);
console.log('Generator:', gltf.asset.generator); 