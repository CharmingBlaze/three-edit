/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ThreeEdit',
      fileName: (format) => {
        if (format === 'es') return 'index.mjs';
        if (format === 'umd') return 'index.umd.js';
        return 'index.js';
      },
      formats: ['es', 'cjs', 'umd'], // Include UMD format for browser usage
    },
    outDir: 'dist', // Explicitly set output directory
    rollupOptions: {
      external: ['three'],
      output: {
        // Provide proper globals for UMD build
        globals: { 
          three: 'THREE' 
        },
      }
    },
    sourcemap: true, // Add sourcemaps for better debugging
    minify: 'terser', // Minify the output for production
  },
  plugins: [dts()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
    },
  },
});
