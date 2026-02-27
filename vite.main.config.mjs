import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.js',
      fileName: () => 'main.js', // This forces the file to be named main.js
      formats: ['cjs'],
    },
    outDir: '.vite/build',
    rollupOptions: {
      external: ['electron', 'path', 'fs', 'node:child_process', 'url'],
    },
  },
});