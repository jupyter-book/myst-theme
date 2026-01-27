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

`myst-theme` uses [changesets](https://github.com/changesets/changesets) to document changes to this monorepo, call `pnpm run changeset` and follow the prompts. Later, `pnpm run version` will be called and then `pnpm run publish`.

### Utilities

`myst-theme` is built and developed using:

- [React](https://reactjs.org/) for component rendering
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Tailwind](https://tailwindcss.com/) for styling
- [Storybook](https://storybook.js.org/) for documenting components

### Tailwind CSS bundle and class list

Tailwind scans all of the MyST packages listed in `styles/tailwind.config.js` (and the theme-level configs in `themes/book` and `themes/article`) and pulls those classes into the generated bundle packaged with the MyST Theme.

When you build a MyST site with the theme, the final bundled CSS lands at a location like `_build/html/build/_assets/app-[HASH].css`. That file contains the complete set of Tailwind classes available in the published theme.
Use this as a rough reference for the classes you can use, but note that _this is not an official feature_ and might change any time. See https://github.com/jupyter-book/mystmd/issues/1617 for a longer-term fix for this.
