# `myst-theme`

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/executablebooks/myst-theme/blob/main/LICENSE)
[![CI](https://github.com/executablebooks/myst-theme/workflows/CI/badge.svg)](https://github.com/executablebooks/myst-theme/actions)

Base repositories for working with MyST websites themes using React.

# Development

All dependencies for `myst-theme` are included in this repository (a monorepo!).

## What's inside?

- `@myst-theme/frontmatter`: Show title, authors and affiliations
- `@myst-theme/providers`: React providers for references and site configuration
- `@myst-theme/site`: components and utilities for building React and Remix sites
- `@myst-theme/demo`: myst-demo component for showing syntax
- `@myst-theme/diagrams`: mermaid diagrams for MyST
- `myst-to-react`: expose MyST content as an article, built with React

Each package and app is 100% [TypeScript](https://www.typescriptlang.org/) and is provided as uncompiled tsx files.

### Versioning & Publishing

`myst-theme` uses [changesets](https://github.com/changesets/changesets) to document changes to this monorepo, call `npm run changeset` and follow the prompts. Later, `npm run version` will be called and then `npm run publish`.

### Utilities

`myst-theme` is built and developed using:

- [React](https://reactjs.org/) for component rendering
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd myst-theme
npm run build
```

### Develop

These packages are best shown using `storybook` a UI library that powers the docs.

```
cd myst-theme
npm run storybook
# and in another terminal
npm run dev
```
