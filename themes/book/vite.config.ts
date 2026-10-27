import { reactRouter } from '@react-router/dev/vite';
import { envOnlyMacros } from 'vite-env-only';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { federation } from '@module-federation/vite';
import { normalizeBaseURL } from '@myst-theme/common';
import { hostBuildShared } from '@myst-theme/federation';

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
      // In the tanstack demo, nodiscovery was used: https://github.com/gioboa/module-federation-vite-examples/blob/113597cd0f012c87b5726b3029b1c2a09d6bad5e/tanstack/dynamic-host/vite.config.ts#L70-L87
      // That has the consequence of requiring us to list _everything_ manually that needs optimisation (e.g. any deps that need CJS→ESM)
      // Setting `holdUntilCrawlEnd` seems to solve the root cause that motivates that section.
      holdUntilCrawlEnd: true,
    },
    ssr: {
      noExternal: mode == 'production' ? true : undefined,
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
