import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    federation({
      name: 'theme-extension',
      filename: 'themeExtension.js',

      exposes: {
        '.': './src/index',
      },
      // list of shared modules
      shared: {
        react: { singleton: true, import: false },
        'react-dom': { singleton: true, import: false },
        'myst-to-react': { singleton: true, import: false },
      },
      dts: false,
    }),
    react(),
  ],
  build: {
    target: 'chrome89',
    emptyOutDir: false,
  },
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
