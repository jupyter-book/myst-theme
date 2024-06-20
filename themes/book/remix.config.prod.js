const { builtinModules } = require("node:module");

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  serverBuildPath: 'build/index.js',
  serverModuleFormat: 'cjs',
  serverMinify: true,
  publicPath: '/myst_assets_folder/',
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: [/.*/],
  browserNodeBuiltinsPolyfill: {
    modules: builtinModules,
  },
};
