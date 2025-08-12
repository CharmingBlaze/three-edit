/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'src/__tests__/**/*.test.ts',
      'tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/demo/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/*.{config,conf}.ts'
    ],
    threads: false,
    reporters: 'default'
  }
});
