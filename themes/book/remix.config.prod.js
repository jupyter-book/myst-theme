/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  serverBuildPath: 'build/index.js',
  serverModuleFormat: 'cjs',
  publicPath: '/myst_assets_folder/',
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: [/.*/],
  // For now, turn these off to retain our existing behaviour
  // TODO: remove these
  postcss: false,
  tailwind: false,
};
