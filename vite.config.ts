import { defineConfig } from "vite";

export default defineConfig({
  root: "demo",
  server: {
    port: 5173,
    // Allow Vite to pick the next available port instead of exiting.
    strictPort: false,
  },
  preview: {
    port: 5173,
    // Allow preview to pick the next available port as well.
    strictPort: false,
  },
});
