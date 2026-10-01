import { reactRouter } from '@react-router/dev/vite';
import { envOnlyMacros } from 'vite-env-only';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  base: process.env.BASE_URL ?? '/',
  minify: true,
  plugins: [reactRouter(), envOnlyMacros()],

  resolve: { tsconfigPaths: true },
  optimizeDeps: {
    exclude: [],
  },
});
