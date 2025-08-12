import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  clean: true,
  dts: true,
  format: ['esm', 'cjs', 'iife'],
  outDir: 'dist',
  globalName: 'ThreeEdit', // UMD/IIFE global
  sourcemap: true,
  minify: false,
  treeshake: true,
  target: 'es2019',
  external: ['three'],
});
