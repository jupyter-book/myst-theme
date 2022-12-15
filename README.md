# `@curvenote/theme-base`

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/curvenote/theme-base/blob/main/LICENSE)
[![CI](https://github.com/curvenote/theme-base/workflows/CI/badge.svg)](https://github.com/curvenote/theme-base/actions)

Base repositories for working with Curvenote themes using React and Remix.

# Development

All dependencies for `@curvenote/theme-base` are included in this repository (a monorepo!).

## What's inside?

- `ui-providers`: React providers for references and site configuration
- `myst-to-react`: expose MyST content as an article, built with React
- `site`: components and utilities for building React and Remix sites
- `icons`: icons used throughout our projects, built for React

Each package and app is 100% [TypeScript](https://www.typescriptlang.org/) and is provided as uncompiled tsx files.

### Versioning & Publishing

Curvenote uses [changesets](https://github.com/changesets/changesets) to document changes to this monorepo, call `npm run changeset` and follow the prompts. Later, `npm run version` will be called and then `npm run publish`.

### Utilities

`curvenote` is built and developed using:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd theme-base
npm run build
```

### Develop

TODO: These repositories are best used in a theme repository.
