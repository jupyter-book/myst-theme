import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { buildRemoteShared } from '@myst-theme/federation';
import pkg from './package.json' with { type: 'json' };

const builtName = 'fancy-note';
const extensionName = 'theme-extension';

export default defineConfig({
  plugins: [
    federation({
      name: extensionName,
      filename: 'themeExtension.js',
      type: 'module',

      exposes: {
        '.': './src/index',
      },
      // list of shared modules
      shared: buildRemoteShared(pkg),
      dts: false,
      manifest: true,
    }),
    react(),
  ],
  build: {
    target: 'chrome89',
    emptyOutDir: false,
  },
  ssr: { noExternal: true },
  environments: {
    client: {
      build: { outDir: `dist/${builtName}/` },
    },
    ssr: {
      build: {
        outDir: `dist/${builtName}/`,
        ssr: './src/index.tsx',
      },
    },
  },
  server: {
    origin: 'http://localhost:8080',
    port: 8080,
    cors: true,
  },
  preview: { port: 8080, cors: true },
});
