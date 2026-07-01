import { rspack } from '@rspack/core';

// Modules provided by the theme at runtime, never bundled into the extension.
const shared = Object.fromEntries(
  ['react', 'myst-to-react'].map((name) => [
    name,
    { singleton: true, import: false, requiredVersion: false },
  ]),
);

export default {
  mode: 'production',
  context: import.meta.dirname,
  entry: './src/index.js',
  output: { publicPath: 'auto', uniqueName: 'myst_docs_extension', clean: true },
  experiments: { css: true },
  module: {
    rules: [
      { test: /\.css$/, type: 'css' },
      {
        test: /\.js$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'ecmascript', jsx: true },
              transform: { react: { runtime: 'automatic' } },
            },
          },
        },
      },
    ],
  },
  plugins: [
    new rspack.container.ModuleFederationPlugin({
      name: 'myst_docs_extension',
      exposes: { '.': './src/index.js' },
      shared,
    }),
  ],
};
