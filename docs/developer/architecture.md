# Architecture and tools we use

## Components

- `myst-to-react`: expose MyST content as an article, built with React
- `@myst-theme/frontmatter`: Show title, authors and affiliations
- `@myst-theme/providers`: React providers for references and site configuration
- `@myst-theme/demo`: myst-demo component for showing syntax
- `@myst-theme/diagrams`: mermaid diagrams for MyST
- `@myst-theme/icons`: MyST icons for React
- `@myst-theme/site`: components and utilities for building Remix sites

## Styles

- `@myst-theme/styles`: Reusable style components using tailwind

## Themes

- `@myst-theme/book`: Designed to mimic the look-and-feel of an interactive book.
- `@myst-theme/article`: A single-page view of an article with associated notebooks or supporting sub-articles.

### Versioning & Publishing

`myst-theme` uses [changesets](https://github.com/changesets/changesets) to document changes to this monorepo, call `bun run changeset` and follow the prompts. Later, `bun run version` will be called and then `bun run publish`.

### Utilities

`myst-theme` is built and developed using:

- [Bun](https://bun.sh) for package management and script execution
- [React](https://reactjs.org/) for component rendering
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Tailwind](https://tailwindcss.com/) for styling

### Tailwind CSS bundle and class list

Tailwind scans all of the MyST packages listed in `styles/tailwind.config.js` (and the theme-level configs in `themes/book` and `themes/article`) and pulls those classes into the generated bundle packaged with the MyST Theme.

When you build a MyST site with the theme, the final bundled CSS lands at a location like `_build/html/build/_assets/app-[HASH].css`. That file contains the complete set of Tailwind classes available in the published theme.
Use this as a rough reference for the classes you can use, but note that _this is not an official feature_ and might change any time. See https://github.com/jupyter-book/mystmd/issues/1617 for a longer-term fix for this.

## Routes

Both themes use Remix file-system routing (`themes/{book,article}/app/routes/`).
We are on Remix v1, but opt in to the flat-route filename convention via the [`v2_routeConvention: true` future flag](https://github.com/remix-run/remix/blob/remix%401.19.3/docs/file-conventions/route-files-v2.md) in `remix.config.js`.

A few conventions to know:

- `[brackets]` make a filename character literal - `[favicon.ico].tsx` serves `/favicon.ico`. Without brackets Remix would treat `.` as a path separator.
- `$` marks dynamic segments - the bare file `$.tsx` is a catch-all.
- `(parens)` mark optional segments.

A few key routes we use:

- [`_index.tsx`](https://github.com/jupyter-book/myst-theme/blob/a45ab513cc08ce775d67cd7c04b147f81eba0254/themes/book/app/routes/_index.tsx) - the site root (`/`).
- [`$.tsx`](https://github.com/jupyter-book/myst-theme/blob/a45ab513cc08ce775d67cd7c04b147f81eba0254/themes/book/app/routes/$.tsx) - catch-all that renders any content page in the MyST project.
- [`myst-theme[.css].ts`](https://github.com/jupyter-book/myst-theme/blob/a45ab513cc08ce775d67cd7c04b147f81eba0254/themes/book/app/routes/myst-theme%5B.css%5D.ts) - serves `/myst-theme.css`, which is user-provided CSS (`site.options.style` in `myst.yml`) plus a few CSS variables derived from `site.options` (e.g. `numbered_references`).
- [`($a).($b).($c).($d).$slug[.json].tsx`](https://github.com/jupyter-book/myst-theme/blob/a45ab513cc08ce775d67cd7c04b147f81eba0254/themes/article/app/routes/%28%24a%29.%28%24b%29.%28%24c%29.%28%24d%29.%24slug%5B.json%5D.tsx) - MyST AST (JSON) representation of a page (the book theme variant adds a `($project)_` segment).
- [`api.theme.tsx`](https://github.com/jupyter-book/myst-theme/blob/a45ab513cc08ce775d67cd7c04b147f81eba0254/themes/book/app/routes/api.theme.tsx) - POST endpoint at `/api/theme` that sets the light/dark theme cookie.
