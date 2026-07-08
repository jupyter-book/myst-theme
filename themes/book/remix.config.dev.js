/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  publicPath: '/myst_assets_folder/',
  serverMainFields: ['main', 'module'],
  serverModuleFormat: 'cjs',
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: [/.*/],
  watchPaths: ['../../packages/**/*'],
  browserNodeBuiltinsPolyfill: {
    modules: {
      punycode: true,
      buffer: true,
      stream: true,
      crypto: true,
    },
  },
  // For now, turn these off to retain our existing behaviour
  // TODO: remove these
  postcss: false,
  tailwind: false,
};
