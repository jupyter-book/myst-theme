---
title: Extensions
---

:::{caution} Extensions are experimental

MyST Theme ships with _experimental_ support for extensions. We may change and/or remove this functionality in future in favour of alternatives!
:::

This page demonstrates the theme extension functionality in `myst-theme`. Extensions are built from [Federated Modules](https://module-federation.io/) and export a well-defined interface. 

## What is an extension?

A MyST Theme extension is a dynamically loaded JavaScript module(s) that ships new node renderers (and more, in future) that re-use the main theme application's React context and other shared modules. Any extension module must provide a `v1` named export with the following specification:
```typescript
const v1: ThemeExtensionV1['v1'] = {
  renderers: NodeRenderers
};
export { v1 };
```
where the `NodeRenderers` type is provided by `@myst-theme/providers`. Examples of `NOodeRenderers` can be seen in e.g. the `@myst-theme/anywidget` package.

## Building an extension
Each extension must be built from a JavaScript (or TypeScript) project using the [Vite](https://vite.dev) build system with the following important configuration:

- Server-side rendering ({abbr}`SSR (Server Side Rendering)`)
- Module Federation ({abbr}`MF (Module Federation)`)

This configuration can be a little fiddly, so we would recommend simply copying the demonstration config in <https://github.com/jupyter-book/myst-theme/blob/feat-mf-ssr/docs/src/theme-extension/vite.config.mjs> as a starting point. In future, we will likely build tooling to bootstrap this process. This configuration assues that your 

The most important points for the MF config are that it should use the `buildRemoteShared` functionality from `@myst-theme/federation` to define the set of shared packages, and that the build should generate a manifest (`mf-manifest.json`).

In order to successfully build this project, you'll need various Vite and MF dependencies (see [`package.json`](https://github.com/jupyter-book/myst-theme/blob/feat-mf-ssr/docs/src/theme-extension/vite.config.mjs)).

After running `vite build` and `vite build --ssr`, the built extension bundle should contain at least the following three files:
- `<entry>.js`
- `<entry>.ssr.js`
- `mf-manifest.json`


## Loading an extension
To load an extension into MyST Theme, it must be added to the `site.options.extensions` array as a string of the form `name @ entrypoint`. Both `mf-manifest.json` and `<entry>.js` are valid entrypoints. We'd recommend using `mf-manifest.json`. 

For now, we strongly encourage users to ship theme extensions _with_ the project as static files under `_public`, which can be done by adding the build output directory (e.g. `dist/fancy-note/`) to `project.static_files`. Subsequently, the entrypoint can be defined relative to the public path using `name @ /<folder>/mf-manifest.json`. In this case, `/` signifies "the public directory", which differs between SSR and client contexts.


## Using custom node renderers

Once the extension has been loaded by MyST Theme, it will be used whenever a matching node needs to be rendered. For example, here is a snippet that creates a `fancyNote` node. 

```markdown
:::{fancy-note} A custom node
This node type does not exist in the theme. Its renderer and CSS were loaded at runtime.
:::
```
producing:
:::{fancy-note} A custom node
This node type does not exist in the theme. Its renderer and CSS were loaded at runtime.
:::
