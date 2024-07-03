const content = [
  './app/**/*.{js,ts,jsx,tsx}',
  // Look to the actual packages too (better than node_modules for pnpm)
  'node_modules/myst-to-react/{src,dist}/**/*.{js,ts,jsx,tsx}',
  'node_modules/myst-demo/{src,dist}/**/*.{js,ts,jsx,tsx}',
  'node_modules/@myst-theme/site/{src,dist}/**/*.{js,ts,jsx,tsx}',
  'node_modules/@myst-theme/frontmatter/{src,dist}/**/*.{js,ts,jsx,tsx}',
  'node_modules/@myst-theme/jupyter/{src,dist}/**/*.{js,ts,jsx,tsx}',
  'node_modules/@myst-theme/icons/{src,dist}/**/*.{js,ts,jsx,tsx}',
  // Duplicate the above in case this is in a submodule
  '../../packages/myst-to-react/{src,dist}/**/*.{js,ts,jsx,tsx}',
  '../../packages/myst-demo/{src,dist}/**/*.{js,ts,jsx,tsx}',
  '../../packages/site/{src,dist}/**/*.{js,ts,jsx,tsx}',
  '../../packages/frontmatter/{src,dist}/**/*.{js,ts,jsx,tsx}',
  '../../packages/jupyter/{src,dist}/**/*.{js,ts,jsx,tsx}',
  '../../packages/icons/{src,dist}/**/*.{js,ts,jsx,tsx}',
];

const themeExtensions = {
  gridTemplateColumns: {
    'article-sm':
      '[screen-start screen-inset-start] 0.5rem [page-start page-inset-start body-outset-start body-start gutter-left-start body-inset-start middle-start] 1fr 1fr [gutter-left-end] 1fr 1fr [gutter-right-start] 1fr 1fr [middle-end body-inset-end body-end gutter-right-end body-outset-end page-inset-end page-end] 0.5rem [screen-inset-end screen-end]',
    'article-md':
      '[screen-start] 0.25rem [screen-inset-start page-start page-inset-start body-outset-start] 1fr [body-start gutter-left-start] 1rem [body-inset-start] minmax(2ch, 10ch) [middle-start] minmax(2ch, 10ch) [gutter-left-end] minmax(2ch, 10ch) minmax(2ch, 10ch) [gutter-right-start] minmax(2ch, 10ch) [middle-end] minmax(2ch, 10ch) [body-inset-end] 1rem [body-end gutter-right-end] 1fr [body-outset-end page-inset-end page-end screen-inset-end] 0.25rem [screen-end]',
    'article-lg':
      '[screen-start] 0.25rem [screen-inset-start page-start] 1rem [page-inset-start body-outset-start] 1fr [body-start gutter-left-start] 1rem [body-inset-start] minmax(8ch, 10ch) [middle-start] minmax(8ch, 10ch) [gutter-left-end] minmax(8ch, 10ch) minmax(8ch, 10ch) [gutter-right-start] minmax(8ch, 10ch) [middle-end] minmax(8ch, 10ch) [body-inset-end] 1rem [body-end gutter-right-end] 3rem [body-outset-end] minmax(5rem, 13rem) [page-inset-end] 3rem [page-end] 1fr [screen-inset-end] 0.25rem [screen-end]',
    'article-xl':
      '[screen-start] 0.25rem [screen-inset-start] 1fr [page-start] 3rem [page-inset-start] minmax(4rem, 9rem) [body-outset-start] 3rem [body-start gutter-left-start] 1rem [body-inset-start] minmax(8ch, 10ch) [middle-start] minmax(8ch, 10ch) [gutter-left-end] minmax(8ch, 10ch) minmax(8ch, 10ch) [gutter-right-start] minmax(8ch, 10ch) [middle-end] minmax(8ch, 10ch) [body-inset-end] 1rem [body-end gutter-right-end] 3rem [body-outset-end] minmax(5rem, 13rem) [page-inset-end] 3rem [page-end] 1fr [screen-inset-end] 0.25rem [screen-end]',
    'article-2xl':
      '[screen-start] 0.5rem [screen-inset-start] 1fr [page-start] 3rem [page-inset-start] minmax(4rem, 9rem) [body-outset-start] 3rem [body-start gutter-left-start] 1rem [body-inset-start] minmax(8ch, 10ch) [middle-start] minmax(8ch, 10ch) [gutter-left-end] minmax(8ch, 10ch) minmax(8ch, 10ch) [gutter-right-start] minmax(8ch, 10ch) [middle-end] minmax(8ch, 10ch) [body-inset-end] 1rem [body-end gutter-right-end] 3rem [body-outset-end] minmax(5rem, 13rem) [page-inset-end] 3rem [page-end] 1fr [screen-inset-end] 0.5rem [screen-end]',
    // article - left theme
    'article-left-md':
      '[screen-start] 0.5rem [screen-inset-start page-start page-inset-start body-outset-start] 1rem [body-start gutter-left-start] 1rem [body-inset-start] minmax(5ch, 15ch) [middle-start] minmax(5ch, 15ch) [gutter-left-end] minmax(5ch, 15ch) minmax(5ch, 15ch) [gutter-right-start] minmax(5ch, 15ch) [middle-end] minmax(5ch, 15ch) [body-inset-end] 1rem [body-end gutter-right-end body-outset-end page-inset-end] 1rem [page-end screen-inset-end] 0.5rem [screen-end]',
    'article-left-lg':
      '[screen-start] 0.5rem [screen-inset-start page-start page-inset-start body-outset-start] 1rem [body-start gutter-left-start] 1rem [body-inset-start] minmax(5ch, 12ch) [middle-start] minmax(5ch, 12ch) [gutter-left-end] minmax(5ch, 12ch) minmax(5ch, 12ch) [gutter-right-start] minmax(5ch, 12ch) [middle-end] minmax(5ch, 12ch) [body-inset-end] 1rem [body-end] 1fr [gutter-right-end] 1rem [body-outset-end] minmax(10rem, 18rem) [page-inset-end] 1rem [page-end] 1fr [screen-inset-end] 0.5rem [screen-end]',
    'article-left-xl':
      '[screen-start] 0.5rem [screen-inset-start page-start page-inset-start body-outset-start] 3rem [body-start gutter-left-start] 1rem [body-inset-start] minmax(8ch, 12ch) [middle-start] minmax(8ch, 12ch) [gutter-left-end] minmax(8ch, 12ch) minmax(8ch, 12ch) [gutter-right-start] minmax(8ch, 12ch) [middle-end] minmax(8ch, 12ch) [body-inset-end] 1rem [body-end] 1fr [gutter-right-end] 1rem [body-outset-end] minmax(10rem, 18rem) [page-inset-end] 1rem [page-end] 1fr [screen-inset-end] 0.5rem [screen-end]',
    'article-left-2xl':
      '[screen-start] 0.5rem [screen-inset-start] 1fr [page-start page-inset-start body-outset-start] 3rem [body-start gutter-left-start] 1rem [body-inset-start] minmax(8ch, 12ch) [middle-start] minmax(8ch, 12ch) [gutter-left-end] minmax(8ch, 12ch) minmax(8ch, 12ch) [gutter-right-start] minmax(8ch, 12ch) [middle-end] minmax(8ch, 12ch) [body-inset-end] 1rem [body-end] 1fr [gutter-right-end] 1rem [body-outset-end] minmax(10rem, 18rem) [page-inset-end] 1rem [page-end] 1fr [screen-inset-end] 0.5rem [screen-end]',
    // article - left theme
    'article-center-sm':
      '[screen-start screen-inset-start] 0.5rem [page-start page-inset-start body-outset-start body-start gutter-left-start body-inset-start middle-start] 1fr 1fr [gutter-left-end] 1fr 1fr [gutter-right-start] 1fr 1fr [middle-end body-inset-end body-end gutter-right-end body-outset-end page-inset-end page-end] 0.5rem [screen-inset-end screen-end]',
    'article-center-md':
      '[screen-start] 0.25rem [screen-inset-start page-start page-inset-start body-outset-start] 1fr [body-start gutter-left-start] 1rem [body-inset-start] minmax(2ch, 10ch) [middle-start] minmax(2ch, 10ch) [gutter-left-end] minmax(2ch, 10ch) minmax(2ch, 10ch) [gutter-right-start] minmax(2ch, 10ch) [middle-end] minmax(2ch, 10ch) [body-inset-end] 1rem [body-end gutter-right-end] 1fr [body-outset-end page-inset-end page-end screen-inset-end] 0.25rem [screen-end]',
    'article-center-lg': `[screen-start] 0.5rem [screen-inset-start page-start] 2rem [page-inset-start] 2fr [body-outset-start gutter-outset-left-start] 1rem 
      [body-start gutter-left-start] 2rem [body-inset-start gutter-left-start] minmax(8ch, 10ch) [gutter-left-end middle-start] minmax(8ch, 10ch) minmax(8ch, 10ch) []
      minmax(8ch, 10ch) [] minmax(8ch, 10ch) [middle-end gutter-right-start gutter-page-right-start] minmax(8ch, 10ch) [body-inset-end gutter-right-end] 2rem 
      [body-end] 1rem [body-outset-end] 2fr [page-inset-end] 2rem [page-end screen-inset-end] 0.5rem [screen-end]`,
    'article-center-xl':
      '[screen-start] 0.25rem [screen-inset-start] 1fr [page-start] 3rem [page-inset-start] minmax(4rem, 9rem) [body-outset-start] 3rem [body-start gutter-left-start] 1rem [body-inset-start] minmax(8ch, 10ch) [middle-start] minmax(8ch, 10ch) [gutter-left-end] minmax(8ch, 10ch) minmax(8ch, 10ch) [gutter-right-start] minmax(8ch, 10ch) [middle-end] minmax(8ch, 10ch) [body-inset-end] 1rem [body-end gutter-right-end] 3rem [body-outset-end] minmax(4rem, 9rem) [page-inset-end] 3rem [page-end] 1fr [screen-inset-end] 0.25rem [screen-end]',
    'article-center-2xl':
      '[screen-start] 0.5rem [screen-inset-start] 1fr [page-start] 3rem [page-inset-start] minmax(4rem, 9rem) [body-outset-start] 3rem [body-start gutter-left-start] 1rem [body-inset-start] minmax(8ch, 10ch) [middle-start] minmax(8ch, 10ch) [gutter-left-end] minmax(8ch, 10ch) minmax(8ch, 10ch) [gutter-right-start] minmax(8ch, 10ch) [middle-end] minmax(8ch, 10ch) [body-inset-end] 1rem [body-end gutter-right-end] 3rem [body-outset-end] minmax(4rem, 9rem) [page-inset-end] 3rem [page-end] 1fr [screen-inset-end] 0.5rem [screen-end]',
  },
  gridColumn: {
    screen: 'screen',
    'screen-inset': 'screen-inset',
    page: 'page',
    'gutter-page-left-sm': 'body',
    'gutter-page-left-md': 'body-outset / gutter-left',
    'gutter-page-left-lg': 'page / middle-start',
    'page-middle-sm': 'body',
    'page-middle-lg': 'middle',
    'gutter-page-right-sm': 'body',
    'gutter-page-right-md': 'gutter-right / body-outset',
    'gutter-page-right-lg': 'middle-end / page',
    'page-inset': 'page-inset',
    body: 'body',
    'body-outset': 'body-outset',
    'body-inset': 'body-inset',
    'body-inset-right-sm': 'body / gutter-right-start',
    'body-inset-right-lg': 'body / middle',
    'body-inset-left-sm': 'gutter-left-end / body',
    'body-inset-left-lg': 'middle / body',
    'body-left': 'body / gutter-right-start',
    'body-right': 'gutter-left-end / body',
    'gutter-left': 'gutter-left',
    'gutter-outset-left': 'body-outset / gutter-left',
    'gutter-right': 'gutter-right',
    'gutter-outset-right': 'gutter-right / body-outset',
    'margin-left-lg': 'page / body-start',
    'margin-right-lg': 'body-end / page-end',
    'margin-right-inset-lg': 'body-end /page-inset',
    'body-outset-right': 'body / body-outset',
    'page-inset-right': 'body / page-inset',
    'page-right': 'body / page',
    'screen-inset-right': 'body / screen-inset',
    'screen-right': 'body / screen',
    'body-outset-left': 'body-outset / body',
    'page-inset-left': 'page-inset / body',
    'page-left': 'page / body',
    'screen-inset-left': 'screen-inset / body',
    'screen-left': 'screen / body',
  },
  // See https://github.com/tailwindlabs/tailwindcss-typography/blob/master/src/styles.js
  typography: (theme) => ({
    DEFAULT: {
      css: {
        code: {
          fontWeight: '400',
        },
        // These code before/after elements are hard coded to remove the backticks, "`", that are in by default.
        'code::before': {
          content: '',
        },
        'code::after': {
          content: '',
        },
        'blockquote p:first-of-type::before': { content: 'none' },
        'blockquote p:first-of-type::after': { content: 'none' },
        li: {
          marginTop: '0.25rem',
          marginBottom: '0.25rem',
        },
        'li > p, dd > p, header > p, footer > p': {
          marginTop: '0.25rem',
          marginBottom: '0.25rem',
        },
        // Tailwind doesn't style h5 or h6 at all so this makes them look like headers
        'h5, h6': {
          color: 'var(--tw-prose-headings)',
          fontWeight: '500',
        },
      },
    },
    invert: {
      css: {
        '--tw-prose-code': theme('colors.pink[400]'),
      },
    },
    stone: {
      css: {
        '--tw-prose-code': theme('colors.pink[700]'),
      },
    },
  }),
  keyframes: {
    load: {
      '0%': { width: '0%' },
      '100%': { width: '50%' },
    },
    fadeIn: {
      '0%': { opacity: 0.0 },
      '25%': { opacity: 0.25 },
      '50%': { opacity: 0.5 },
      '75%': { opacity: 0.75 },
      '100%': { opacity: 1 },
    },
  },
  animation: {
    load: 'load 2.5s ease-out',
    'fadein-fast': 'fadeIn 1s ease-out',
  },
};

const safeList = [
  'prose',
  'article-grid',
  'xl:article-grid',
  'article-left-grid',
  'xl:article-left-grid',
  'article-center-grid',
  'xl:article-center-grid',
  'col-screen',
  'col-screen-inset',
  'col-page',
  'col-gutter-page-left',
  'col-page-middle',
  'col-gutter-page-right',
  'col-page-inset',
  'col-body',
  'col-body-outset',
  'col-body-inset',
  'col-body-inset-right',
  'col-body-inset-left',
  'col-body-left',
  'col-body-right',
  'col-gutter-left',
  'col-gutter-outset-left',
  'col-gutter-right',
  'col-gutter-outset-right',
  'col-margin-left',
  'col-margin-right',
  'col-margin-right-inset',
  'col-margin',
  'col-body-outset-right',
  'col-page-inset-right',
  'col-page-right',
  'col-screen-inset-right',
  'col-screen-right',
  'col-body-outset-left',
  'col-page-inset-left',
  'col-page-left',
  'col-screen-inset-left',
  'col-screen-left',
  // Row and col span
  'row-span-1',
  'row-span-2',
  'row-span-3',
  'row-span-4',
  'row-span-5',
  'row-span-6',
  'col-span-1',
  'col-span-2',
  'col-span-3',
  'col-span-4',
  'col-span-5',
  'col-span-6',
  // Utilities
  'shaded',
  'framed',
  'shaded-children',
  'rounded-children',
];

module.exports = {
  content,
  themeExtensions,
  safeList,
};
