/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  serverBuildPath: 'build/index.js',
  serverMinify: true,
  publicPath: '/myst_assets_folder/',
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: [/.*/],
  future: {
    v2_routeConvention: true,
    v2_normalizeFormMethod: true,
    v2_headers: true,
    v2_meta: true,
  },
};
