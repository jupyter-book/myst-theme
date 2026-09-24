import { reactRouter } from '@react-router/dev/vite';
import { envOnlyMacros } from 'vite-env-only';
import { defineConfig, type UserConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const baseConfig: UserConfig = {
    plugins: [reactRouter(), envOnlyMacros()],
    ssr: {
      noExternal: mode == 'production' ? true : undefined,
    },
    resolve: { tsconfigPaths: true }
  };
  if (process.env.VITE_BUILD_HTML !== undefined) {
    return {
      ...baseConfig,
      build: {
        assetsDir: '_assets',
        minify: true,
      },
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
    };
  } else {
    return {
      ...baseConfig,
      server: {
        port: 3000,
      },
      build: {
        assetsDir: '_assets',
        minify: mode === 'production',
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
      base: process.env.BASE_URL ?? '/',
    };
  }
});
