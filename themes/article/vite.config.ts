import { reactRouter } from '@react-router/dev/vite';
import { envOnlyMacros } from 'vite-env-only';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { getLinkBaseURL } from '@myst-theme/common';

export default defineConfig(({ mode }) => {
  const baseConfig: UserConfig = {
    plugins: [reactRouter(), envOnlyMacros()],
    build: {
      assetsDir: '_assets',
      minify: mode === 'production',
    },
    ssr: {
      noExternal: mode == 'production' ? true : undefined,
    },
    resolve: { tsconfigPaths: true }
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
          base: `${getLinkBaseURL(process.env)}/`,
        };
  return mergeConfig(baseConfig, overrideConfig);
});
