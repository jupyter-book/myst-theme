import { reactRouter } from '@react-router/dev/vite';
import { federation } from '@module-federation/vite';
import { envOnlyMacros } from 'vite-env-only';
import { defineConfig } from 'vite';

import { dependencies } from './package.json';

export default defineConfig({
  server: {
    port: 3000,
  },
  base: process.env.BASE_URL ?? '/',
  plugins: [
    reactRouter(),
    envOnlyMacros(),
    federation({
      name: 'book-theme',
      filename: 'remoteEntry.js',
      shared: {
        react: {
          requiredVersion: dependencies.react,
          singleton: true,
        },
        'myst-to-react': {
          requiredVersion: dependencies['myst-to-react'],
          singleton: true,
        },
      },
      //      hostInitInjectLocation: "html",
      bundleAllCSS: false, // or true
      moduleParseTimeout: 10,
      moduleParseIdleTimeout: 10,
      manifest: true,
    }),
  ],

  resolve: { tsconfigPaths: true },
  optimizeDeps: {
    exclude: [],
  },
});
