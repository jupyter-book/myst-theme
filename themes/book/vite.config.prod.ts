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
  minify: true,
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
      //     hostInitInjectLocation: 'entry',
      bundleAllCSS: false, // or true
      moduleParseTimeout: 50,
      moduleParseIdleTimeout: 50,
      manifest: true,
    }),
  ],

  resolve: { tsconfigPaths: true },
  optimizeDeps: {
    exclude: [],
  },
});
