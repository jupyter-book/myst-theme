import { reactRouter } from '@react-router/dev/vite';
import { envOnlyMacros } from 'vite-env-only';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    reactRouter({
      ignoredRouteFiles: ['**/.*'],
    }),
    envOnlyMacros(),
  ],

  resolve: { tsconfigPaths: true },
  optimizeDeps: {
    exclude: [],
  },
  // base: "/myst_assets_folder/",
});
