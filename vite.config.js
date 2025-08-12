import { defineConfig } from 'vite'

export default defineConfig({
  root: 'examples',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'blockbench-editor': 'examples/blockbench-editor.html'
      }
    }
  },
  server: {
    port: 3000,
    open: '/blockbench-editor.html'
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/controls/OrbitControls']
  },
  resolve: {
    alias: {
      'three': 'node_modules/three'
    }
  }
})

