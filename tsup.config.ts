import { defineConfig } from 'tsup';

export default defineConfig([
  // Core + adapters: ESM + CJS
  {
    entry: {
      index: 'src/index.ts',
      'adapters/openai-adapter': 'src/adapters/openai-adapter.ts',
      'adapters/anthropic-adapter': 'src/adapters/anthropic-adapter.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: false,
    external: ['openai', '@anthropic-ai/sdk', 'react', 'svelte'],
  },
  // React bindings: ESM + CJS
  {
    entry: {
      'react/index': 'src/react/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    jsx: 'react-jsx',
    external: ['react', 'react-dom', 'openai', '@anthropic-ai/sdk'],
  },
  // Svelte bindings: ESM + CJS
  {
    entry: {
      'svelte/index': 'src/svelte/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    external: ['svelte', 'openai', '@anthropic-ai/sdk'],
  },
  // UMD bundle for CDN / vanilla JS
  {
    entry: { 'ai-form-filler.umd': 'src/index.ts' },
    format: ['iife'],
    globalName: 'AIFormFiller',
    dts: false,
    sourcemap: true,
    minify: true,
    platform: 'browser',
    external: ['openai', '@anthropic-ai/sdk', 'react', 'svelte'],
  },
]);
