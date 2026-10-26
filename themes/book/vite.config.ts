import { reactRouter } from '@react-router/dev/vite';
import { envOnlyMacros } from 'vite-env-only';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { federation } from '@module-federation/vite';
import { normalizeBaseURL } from '@myst-theme/common';
import { hostBuildShared, SHARED_PACKAGES } from '@myst-theme/federation';

export default defineConfig(({ mode }) => {
  const baseConfig: UserConfig = {
    plugins: [
      federation({
        dts: false,
        name: 'book-theme',

        hostInitInjectLocation: 'entry',
        shared: hostBuildShared,
      }),
      reactRouter(),
      envOnlyMacros(),
    ],

    build: {
      assetsDir: '_assets',
      minify: mode === 'production',
    },
    optimizeDeps: {
      // Pre-bundle everything the plugin's host init pulls in, and do not discover
      // more at request time: a mid-session re-optimization changes the dep hash
      // that the cached host init module still references, so the browser gets
      // "504 Outdated Optimize Dep" and the page never hydrates.
      holdUntilCrawlEnd: true,
    },
    ssr: {
      noExternal: mode == 'production' ? true : undefined,
      optimizeDeps: {
        include: SHARED_PACKAGES,
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
