import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.css'],
  bundle: true,
  loader: {
    '.eot': 'file',
    '.svg': 'dataurl',
    '.ttf': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
  outfile: 'dist/thebe-core.css',
});
