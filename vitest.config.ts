import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.d.ts', 'src/index.ts', 'src/react/index.ts', 'src/svelte/index.ts', 'src/types/index.ts', 'src/core/index.ts', 'src/adapters/index.ts'],
    },
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': '/home/sandeepsj/Developer/ai-form-filler/src',
    },
  },
});
