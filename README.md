# `myst-theme`

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jupyter-book/myst-theme/blob/main/LICENSE)
[![CI](https://github.com/jupyter-book/myst-theme/workflows/CI/badge.svg)](https://github.com/jupyter-book/myst-theme/actions)

This repository contains two things:

- A **react renderer** for MyST AST and content, so you can render MyST node types as React components.
- A **book theme and an article theme** that use this renderer along with Remix to create two different website experiences using the react components.

It also serves as the reference documentation for these themes at the URL below:

https://myst-theme.netlify.app/

> **Note**: This builds against the [`main` branch of `mystmd`](https://github.com/jupyter-book/mystmd).
> This allows us to test out new theme features against the latest version of the MyST Engine.

You can also find a [storybook site for the MyST Theme components](https://jupyter-book.github.io/myst-theme/?path=/docs/components-introduction--docs) to see the style and structure of components.

# Development

All dependencies for `myst-theme` are included in this repository (a monorepo!).
The core themes are also included in this repository to aid in development.

## Local development and live server preview

See [the local development docs](./docs/developer/local.md).

## Architecture and tools we use

See [the architecture and tools guide](./docs/developer/architecture.md).

# Documentation guide

See [the documentation guide](./docs/developer/documentation.md).

## Deployment to NPM

To update the theme components on NPM:

```bash
pnpm run version
pnpm run publish
```

To update the themes for use with the MyST CLI:

```bash
make deploy-book
make deploy-article
```

This updates the git repository, and sometimes is a large diff and can cause git to hang, if that happens this command can help change the buffer size when sending the diff to GitHub:

```bash
git config --global http.postBuffer 157286400
```
