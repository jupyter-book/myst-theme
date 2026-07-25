import { reactRouter } from '@react-router/dev/vite';
import { envOnlyMacros } from 'vite-env-only';
import { defineConfig } from 'vite';
import { federation } from '@module-federation/vite';
import moduleFederationConfig from './module-federation.config';

export default defineConfig({
  server: {
    port: 3000,
  },
  base: process.env.BASE_URL ?? '/',
  plugins: [reactRouter(), envOnlyMacros(), federation(moduleFederationConfig)],

  resolve: { tsconfigPaths: true },
  optimizeDeps: {
    exclude: [],
  },
});
