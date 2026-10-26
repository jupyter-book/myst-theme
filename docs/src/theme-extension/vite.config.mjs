import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { buildRemoteShared } from '@myst-theme/federation';
import pkg from "./package.json" with { type: "json" };
console.dir(buildRemoteShared(pkg))

export default defineConfig({
  plugins: [
    federation({
      name: 'theme-extension',
      filename: 'themeExtension.js',
      type: 'module',

      exposes: {
        '.': './src/index',
      },
      // list of shared modules
      shared: buildRemoteShared(pkg),
      dts: false,
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
      build: { outDir: 'dist' },
    },
    ssr: {
      build: {
        outDir: 'dist',
        ssr: './src/index.jsx',
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
