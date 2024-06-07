import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { envOnlyMacros } from 'vite-env-only';

export default defineConfig({
  plugins: [
    remix({
      basename: '/',
      ignoredRouteFiles: ['**/*.css'],
      serverBuildFile: 'api/index.js',
    }),
    tsconfigPaths(),
    envOnlyMacros(),
  ],
  publicDir: '/myst_assets_folder/',
  resolve: {
    mainFields: ['main', 'module'],
  },
  build: {
    minify: false,
  },
  ssr: {
    noExternal: [
      /^rehype.*/,
      /^remark.*/,
      /^unified.*/,
      /^unist.*/,
      /^hast.*/,
      /^mdast.*/,
      /^micromark.*/,
      /^csv-parse.*/,
      'html-whitespace-sensitive-tag-names',
      'html-void-elements',
      'property-information',
      'array-iterate',
      'stringify-entities',
      'comma-separated-tokens',
      'trim-trailing-lines',
      'escape-string-regexp',
      'ccount',
      'web-namespaces',
      'space-separated-tokens',
      'character-entities-legacy',
      'character-entities-html4',
      'trim-lines',
      'bail',
      'is-plain-obj',
      'trough',
      'zwitch',
      'nanoid',
      /^vfile.*/,
      /^myst-.*/,
      'markdown-it-myst',
      'simple-validators',
      'doi-utils',
      'orcid',
      'credit-roles',
      'tex-to-typst',
      'jats-tags',
      /^@myst-theme\/.*/,
      'markdown-it-myst-extras',
      'markdown-it-dollarmath',
      'markdown-it-amsmath',
      'swr',
      'swr/immutable',
      'devlop',
      '@curvenote/ansi-to-react',
      'jats-utils',
    ],
  },
});
