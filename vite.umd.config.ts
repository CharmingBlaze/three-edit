/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';

// Dedicated config for UMD build only
export default defineConfig({
  build: {
    lib: {
      // Use the browser-compatible version as entry point to avoid import issues
      entry: resolve(__dirname, 'browser/three-edit.js'),
      name: 'ThreeEdit',
      fileName: () => 'index.umd.js',
      formats: ['umd'],
    },
    outDir: 'dist/umd',
    rollupOptions: {
      external: ['three'],
      output: {
        globals: {
          three: 'THREE'
        },
      }
    },
    sourcemap: true,
    minify: 'terser',
  },
  resolve: {
    // Ensure all imports are resolved correctly
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
