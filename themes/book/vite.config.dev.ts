import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { installGlobals } from '@remix-run/node';
import tsconfigPaths from 'vite-tsconfig-paths';
import { envOnlyMacros } from 'vite-env-only';

import { createRoutesFromFolders } from '@remix-run/v1-route-convention';

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      basename: process.env.BASE_URL ?? '/',
      serverBuildFile: 'api/index.js',
      ignoredRouteFiles: ['**/.*'],
      serverModuleFormat: 'esm',
      routes(defineRoutes) {
        // uses the v1 convention, works in v1.15+ and v2
        return createRoutesFromFolders(defineRoutes);
      },
    }),
    tsconfigPaths(),
    envOnlyMacros(),
  ],
  publicDir: '/myst_assets_folder/',
  resolve: {
    mainFields: ['main', 'module'],
  },
  build: {
    minify: false,
  },
  ssr: {
    noExternal: [/^rehype.*/, /^remark.*/, /^unified.*/, /^unist.*/, /^@myst-theme\/.*/],
  },
});
