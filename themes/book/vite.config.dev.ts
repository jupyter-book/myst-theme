import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { installGlobals } from '@remix-run/node';
import tsconfigPaths from 'vite-tsconfig-paths';
import { envOnlyMacros } from 'vite-env-only';


installGlobals();

export default defineConfig({
  plugins: [
    remix({
      basename: process.env.BASE_URL ?? '/',
      serverBuildFile: 'api/index.js',
      ignoredRouteFiles: ['**/.*'],
      serverModuleFormat: 'esm',
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
