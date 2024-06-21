import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { installGlobals } from '@remix-run/node';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      basename: process.env.BASE_URL ?? '/',
      serverBuildFile: 'api/index.js',
      ignoredRouteFiles: ['**/*.css'],
      serverModuleFormat: 'esm',
    }),
    tsconfigPaths(),
  ],
  publicDir: '/myst_assets_folder/',
  resolve: {
    mainFields: ['main', 'module'],
  },
  build: {
    minify: false,
  },
  ssr: {
    noExternal: [
      /^rehype.*/,
      /^remark.*/,
      /^unified.*/,
      /^unist.*/,

      /^micromark.*/,
      /^@myst-theme\/.*/,
    ],
  },
});
