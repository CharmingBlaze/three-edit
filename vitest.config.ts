import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/demo/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/*.{config,conf}.ts'
    ],
    environment: 'node',
    globals: true,
    reporters: 'default'
  }
});
