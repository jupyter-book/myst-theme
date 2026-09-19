import { reactRouter } from '@react-router/dev/vite';
import { envOnlyMacros } from 'vite-env-only';
import { defineConfig, type UserConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const baseConfig: UserConfig = {
    plugins: [reactRouter(), envOnlyMacros()],

    resolve: { tsconfigPaths: true },
    optimizeDeps: {
      exclude: [],
    },
  };
  if (process.env.BUILD_HTML !== undefined) {
    return {
      ...baseConfig,
      build: {
        minify: true,
      },
      environments: {
        ssr: {
          build: {
            rolldownOptions: {
              input: 'app/prerender.ts',
            },
          },
        },
      },
      base: './',
    };
  } else {
    console.error('not html');
    return {
      ...baseConfig,
      server: {
        port: 3000,
      },
      build: {
        minify: mode === 'production',
      },
      base: process.env.BASE_URL ?? '/',
    };
  }
});
