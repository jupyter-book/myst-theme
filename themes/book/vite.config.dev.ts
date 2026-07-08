import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { envOnlyMacros } from 'vite-env-only';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';

installGlobals();

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    remix({
      ignoredRouteFiles: ['**/.*'],
    }),
    tsconfigPaths(),
    envOnlyMacros(),
  ],
  optimizeDeps: {
    exclude: [
    ],
  },
  // base: "/myst_assets_folder/",
});
