# `myst-theme`

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/executablebooks/myst-theme/blob/main/LICENSE)
[![CI](https://github.com/executablebooks/myst-theme/workflows/CI/badge.svg)](https://github.com/executablebooks/myst-theme/actions)

Packages for creating MyST websites themes using React and Remix

# Development

All dependencies for `myst-theme` are included in this repository (a monorepo!).
The core themes are also included in this repository to aid in development.

## What's inside?

**Components:**

- `myst-to-react`: expose MyST content as an article, built with React
- `@myst-theme/frontmatter`: Show title, authors and affiliations
- `@myst-theme/providers`: React providers for references and site configuration
- `@myst-theme/demo`: myst-demo component for showing syntax
- `@myst-theme/diagrams`: mermaid diagrams for MyST
- `@myst-theme/icons`: MyST icons for React
- `@myst-theme/site`: components and utilities for building Remix sites

**Styles:**

- `@myst-theme/styles`: Reusable style components using tailwind

**Themes:**

These are included as submodules, use `git clone --recursive` when first cloning.

- `@myst-theme/book`: Designed to mimic the look-and-feel of an interactive book.
- `@myst-theme/article`: A single-page view of an article with associated notebooks or supporting sub-articles.

### Versioning & Publishing

`myst-theme` uses [changesets](https://github.com/changesets/changesets) to document changes to this monorepo, call `npm run changeset` and follow the prompts. Later, `npm run version` will be called and then `npm run publish`.

### Utilities

`myst-theme` is built and developed using:

- [React](https://reactjs.org/) for component rendering
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Tailwind](https://tailwindcss.com/) for styling
- [Storybook](https://storybook.js.org/) for documenting components

## Development

This repository depends on themes which are brought in as a sub-module.
When first cloning the repository use `git clone --recursive`,
then install the various dependencies:

```
git clone --recursive https://github.com/executablebooks/myst-theme.git
cd myst-theme
npm install
```

### Build

To build all themes and packages, run the following command:

```
npm run build
```

### Develop

These packages are best shown using `storybook` a UI library that powers the docs.

```
npm run storybook
# and in another terminal
npm run dev
```
