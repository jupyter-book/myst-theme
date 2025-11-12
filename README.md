# `myst-theme`

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jupyter-book/myst-theme/blob/main/LICENSE)
[![CI](https://github.com/jupyter-book/myst-theme/workflows/CI/badge.svg)](https://github.com/jupyter-book/myst-theme/actions)

Packages for creating MyST websites themes using React and Remix.

[The MyST Theme components documentation](https://jupyter-book.github.io/myst-theme/?path=/docs/components-introduction--docs) is the best way to visualize the style and structure of components.

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
npm run version
npm run publish
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
