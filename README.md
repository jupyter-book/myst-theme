# `myst-theme`

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/executablebooks/myst-theme/blob/main/LICENSE)
[![CI](https://github.com/executablebooks/myst-theme/workflows/CI/badge.svg)](https://github.com/executablebooks/myst-theme/actions)

Packages for creating MyST websites themes using React and Remix.

[The MyST Theme components documentation](https://jupyter-book.github.io/myst-theme/?path=/docs/components-introduction--docs) is the best way to visualize the style and structure of components.

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

### Recommended VSCode Extensions

- [Headwind](https://marketplace.visualstudio.com/items?itemName=heybourn.headwind): sorts the tailwind class names

### Build

To build all themes and packages, run the following command:

```
npm run build
```

### Develop

These packages are best shown using `storybook` a UI library that powers the docs.
This is the same tool that powers [the MyST Theme components documentation](https://jupyter-book.github.io/myst-theme/?path=/docs/components-introduction--docs).

```
npm run storybook
# and in another terminal
npm run dev
```

## Working with themes

To interact with the themes in development mode (e.g. with live-reload of components and styles as you are making changes), you need three things running:

1. a content server
2. the renderer/application (theme)
3. a process watching all components

```bash
# In a directory with content
myst start --headless
# In myst-theme
npm run theme:book
# In another terminal, watch for changes and rebuild
npm run dev
```

> **Note**: in the future, this repository will likely have it's own content to test out with the themes.
> You can currently look to the mystjs/docs folder, or an [article](https://github.com/simpeg/tle-finitevolume) or a [thesis](https://github.com/rowanc1/phd-thesis).

To run on a specific port (for example, developing locally between two projects), you can specify a custom port with:

```bash
myst start --headless --server-port 3111
CONTENT_CDN_PORT=3111 npm run theme:book
```

## Deployment

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
