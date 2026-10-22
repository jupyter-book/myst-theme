import { reactRouter } from '@react-router/dev/vite';
import { envOnlyMacros } from 'vite-env-only';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { federation } from '@module-federation/vite';
import { normalizeBaseURL } from '@myst-theme/common';

export default defineConfig(({ mode }) => {
  const baseConfig: UserConfig = {
    plugins: [
      reactRouter(),
      envOnlyMacros(),
      federation({
        dts: false,
        name: 'book-theme',

        hostInitInjectLocation: 'entry',
        shared: {
          react: { singleton: true, requiredVersion: '^19.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
          'myst-to-react': { singleton: true, requiredVersion: '^1.4.0' },
        },
      }),
    ],

    build: {
      assetsDir: '_assets',
      minify: mode === 'production',
    },
    ssr: {
      noExternal: mode == 'production' ? true : undefined,
      optimizeDeps: {
        include: ['react', 'react-dom', 'myst-to-react'],
      },
    },
    resolve: { tsconfigPaths: true },
  };
  const overrideConfig =
    // HTML builds are a distinct build target from the regular server app
    process.env.VITE_BUILD_HTML !== undefined
      ? {
          environments: {
            ssr: {
              build: {
                rolldownOptions: {
                  input: './renderer.ts',
                },
              },
            },
          },
          base: './',
        }
      : {
          server: {
            port: 3000,
          },
          environments: {
            ssr: {
              build: {
                rolldownOptions: {
                  input: './server.ts',
                },
              },
            },
          },
          base: `${normalizeBaseURL(process.env.BASE_URL ?? '')}/`,
        };
  return mergeConfig(baseConfig, overrideConfig);
});
