import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/preload.js', // Updated to include src/
      formats: ['cjs'],
    },
  },
});