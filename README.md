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
bun run version
bun run publish
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

## Deployment to GH releases

The `theme-assets.yml` workflow builds the `book` and `article` themes and attaches `book-theme.zip` and `article-theme.zip` to a GitHub release.
This is a first step toward distributing the themes as GitHub Releases instead of pushing to the `myst-templates/*-theme` repos (the `make deploy-*` flow above).
Nothing consumes these yet - for now the workflow just makes the artifacts available.
See [the tracking issue](https://github.com/jupyter-book/myst-enhancement-proposals/issues/34) for the broader migration.

### How to publish

This normally happens automatically: when a changesets release publishes to NPM, the `release.yml` workflow creates the GitHub release and then calls this workflow to attach the theme zips to it.

You can also trigger it manually by creating a gitHub release; this can be done from the web UI, or from the command line using the GitHub CLI:

```bash
gh release create my-release --target <commit_ref> --title "A title" --notes "The release notes"

# you can also check the available releases with:
gh release list
```

Note that this works from a fork as well — handy for publishing a custom build of the themes; in which case you will use your custom theme by mentioning in your `myst.yml` file something like:

```yaml
site:
  template:
    #  the fork owner  ↓↓↓↓↓↓↓
    #                                      the release name ↓↓↓↓↓↓↓↓↓↓
    https://github.com/my-orga/myst-theme/releases/download/my-release/book-theme.zip
```

### Browse available versions

Published versions of the `article` and `book` themes can be found [![as GH releases](https://img.shields.io/badge/as%20GH%20releases-blue?logo=github&style=flat-square)](https://github.com/jupyter-book/myst-theme/releases)
