import { reactRouter } from '@react-router/dev/vite';
import { envOnlyMacros } from 'vite-env-only';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { federation } from '@module-federation/vite';
import { normalizeBaseURL } from '@myst-theme/common';
import pkg from './package.json' with { type: 'json' };

export default defineConfig(({ mode }) => {
  const baseConfig: UserConfig = {
    plugins: [
      federation({
        dts: false,
        name: 'book-theme',

        hostInitInjectLocation: 'entry',
        shared: Object.fromEntries(
          Object.entries(pkg.dependencies)
            .filter(
              ([name]) => name.startsWith('@myst-theme/') || ['react', 'react-dom'].includes(name),
            )
            .map(([name, constraint]) => [
              `${name}/`,
              { singleton: true, requiredVersion: constraint },
            ]),
        ),
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
      noDiscovery: true,
      include: [
        '@module-federation/runtime',
        '@module-federation/runtime/helpers',
        'react',
        'react-dom',
        'myst-to-react',
        'react-dom/client',
        'react-dom/profiling',
        'react/compiler-runtime',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
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
