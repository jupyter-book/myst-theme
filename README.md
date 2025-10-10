# `myst-theme`

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jupyter-book/myst-theme/blob/main/LICENSE)
[![CI](https://github.com/jupyter-book/myst-theme/workflows/CI/badge.svg)](https://github.com/jupyter-book/myst-theme/actions)

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

- `@myst-theme/book`: Designed to mimic the look-and-feel of an interactive book.
- `@myst-theme/article`: A single-page view of an article with associated notebooks or supporting sub-articles.

### Versioning & Publishing

`myst-theme` uses [changesets](https://github.com/changesets/changesets) to document changes to this monorepo, call `npm run changeset` and follow the prompts. Later, `npm run version` will be called and then `npm run publish`.

published versions of the `article` and `book` themes can be found [![as GH releases](https://img.shields.io/badge/as%20GH%20releases-blue?logo=github&style=flat-square)](https://github.com/jupyter-book/myst-theme/releases)

### Utilities

`myst-theme` is built and developed using:

- [React](https://reactjs.org/) for component rendering
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Tailwind](https://tailwindcss.com/) for styling
- [Storybook](https://storybook.js.org/) for documenting components

## Development

First, clone the repository, then install the various dependencies:

```
git clone https://github.com/jupyter-book/myst-theme.git
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

To interact with the themes in development mode (e.g. with live-reload of components and styles as you are making changes), you need three things running at the same time (each in a different terminal window):

1. Content: A content server that serves AST to the theme server.
2. Theme: A dev server that watches for changes to this theme and re-builds it automatically.
3. Theme: The theme server / renderer application.

First, start [a content server application](https://mystmd.org/guide/developer#content-server) in another MyST site (e.g., with the MySTMD guide documentation).

```bash
# Open a first terminal.
# `cd` into a directory with MyST content (e.g., the MyST docs)
# Then start a headless content server:
cd path/to/your/myst/docs
myst start --headless
```

The content server will parse MyST content into AST and send it to the theme server. By using `--headless`, we tell the content server **not** to start its own theme server, which allows the one we've started above to render the content.

Next, start the dev server and the theme application, which will take AST from the content server and allow you to preview changes:
```bash
# Open a second terminal in the theme repository
# First install the latest dependencies for the theme
npm install

# Start dev mode.
# This will watch for changes in the theme repository and re-build them on the fly.
# This lets you preview changes in real-time. watch for changes and rebuild
npm run dev

# Open a third terminal, and run the theme server.
# The theme server will run in a headless state.
# It will accept content from a content server, which we'll run in the next step.
npm run theme:book
```

Open the port that is printed in the terminal for your theme server (usually, `https://localhost/3000`). The theme server will start serving the AST from the content as a website at that port.

> **Note**: in the future, this repository will likely have it's own content to test out with the themes.
> You can currently look to the docs folder in `jupyter-book/mystmd`, or an [article](https://github.com/simpeg/tle-finitevolume) or a [thesis](https://github.com/rowanc1/phd-thesis).

By default, the theme server will use the same port as the content server for changes to the AST. If you'd like to use a custom port, you can do so like this:

```bash
myst start --headless --server-port 3111
CONTENT_CDN_PORT=3111 npm run theme:book
```

To connect to a remote content server, set the `CONTENT_CDN` environment variable:

```bash
CONTENT_CDN=https://remote.example.com npm run theme:book
CONTENT_CDN=https://remote.example.com npm run theme:article
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
