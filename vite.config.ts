import { defineConfig } from 'vite';

// The chart is a static page; `base` is overridden in CI so the build works
// from a GitHub Pages subpath (/<repo>/) as well as from the domain root.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    open: true,
  },
});
