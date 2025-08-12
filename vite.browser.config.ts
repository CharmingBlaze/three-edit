import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/browser-entry.ts'),
      name: 'ThreeEdit',
      fileName: 'three-edit.browser',
      formats: ['iife'], // Just IIFE format for simplicity
    },
    outDir: 'browser',
    rollupOptions: {
      // Don't externalize Three.js - include it in the bundle
      external: [],
      output: {
        // Self-contained bundle with Three.js included
        globals: {},
        extend: true,
        // Ensure THREE is exposed globally
        name: 'ThreeEdit',
      }
    },
    sourcemap: true,
    minify: false, // Disable minification for readable output
    // terserOptions: {
    //   compress: {
    //     drop_console: false, // Keep console logs for debugging
    //   },
    // },
  },
  plugins: [dts()],
  define: {
    // Ensure proper global access
    global: 'globalThis',
  },
}); 