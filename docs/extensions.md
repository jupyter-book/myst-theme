---
title: Extensions
---

:::{caution} Extensions are experimental and may break!
MyST Theme ships with _experimental_ support for extensions.
We may change or remove this functionality in the future in favour of alternatives!
:::

This page demonstrates the theme extension functionality in `myst-theme`.
Extensions are built from [Federated Modules](https://module-federation.io/) and export a well-defined interface.

## What is an extension?

A MyST Theme extension is a JavaScript module that the theme loads at runtime.
It ships new node renderers, and may ship more in the future.
These renderers re-use the main theme application's React context and other shared modules.

### Example

Once MyST Theme has loaded an extension, it uses the extension's renderers whenever it renders a matching node.

For example, here is a snippet that creates a `fancyNote` node.
The `{fancy-note}` directive comes from a [small MyST plugin](https://github.com/jupyter-book/myst-theme/blob/main/docs/src/fancy-note.mjs) that this site loads.

```markdown
:::{fancy-note} A custom node
This node type does not exist in the theme. Its renderer and CSS were loaded at runtime.
:::
```

produces:

:::{fancy-note} A custom node
This node type does not exist in the theme. Its renderer and CSS were loaded at runtime.
:::

## Writing an extension

Any extension module must provide a `v1` named export with the following specification:

```typescript
const v1: ThemeExtensionV1['v1'] = {
  renderers: NodeRenderers
};
export { v1 };
```

The `@myst-theme/providers` package exports the `NodeRenderers` type, which is defined in [`packages/providers/src/renderers.tsx`](https://github.com/jupyter-book/myst-theme/blob/5eb9fe451f316aafb2cb19c7b044051c16a4854a/packages/providers/src/renderers.tsx#L5).
For an example of `NodeRenderers` in use, see [`ANY_RENDERERS`](https://github.com/jupyter-book/myst-theme/blob/5eb9fe451f316aafb2cb19c7b044051c16a4854a/packages/anywidget/src/index.tsx#L6) in the `@myst-theme/anywidget` package.

## Building an extension

Each extension must be built from a JavaScript or TypeScript project with the [Vite](https://vite.dev) build system.
The Vite config needs two important pieces:

- Server-side rendering ({abbr}`SSR (Server Side Rendering)`)
- Module Federation ({abbr}`MF (Module Federation)`)

This configuration can be a little fiddly, so we recommend copying the demo's [`vite.config.mjs`](https://github.com/jupyter-book/myst-theme/blob/main/docs/src/theme-extension/vite.config.mjs) as a starting point.
In the future, we will likely build tooling to bootstrap this process.
We track this work in https://github.com/jupyter-book/mystmd/issues/2620.

The two most important parts of the MF config are:

- It uses `buildRemoteShared` from `@myst-theme/federation` to define the set of shared packages.
- The build writes a manifest, `mf-manifest.json`.

To build the project, you'll need several Vite and MF dependencies.
See the demo's [`package.json`](https://github.com/jupyter-book/myst-theme/blob/main/docs/src/theme-extension/package.json) for the list.
The demo installs `@myst-theme/federation` from a folder in this repository, so replace that path with the published package when you copy it.

After you run `vite build` and `vite build --ssr`, the built extension bundle should contain at least these three files:

- `<entry>.js`
- `<entry>.ssr.js`
- `mf-manifest.json`

## Loading an extension

To load an extension into MyST Theme, add it to the `site.options.extensions` array as a string of the form `name@entrypoint`, with no spaces.
Use the same `name` that you gave the federation plugin in your `vite.config.mjs`.
Both `mf-manifest.json` and `<entry>.js` are valid entrypoints.
We recommend using `mf-manifest.json`.

For now, we strongly encourage you to ship theme extensions _with_ the project, as static files under `_public`.
To do this, add the build output directory, such as `dist/fancy-note/`, to `project.static_files`.
Then define the entrypoint relative to the public path, as `name@/<folder>/mf-manifest.json`.
Here, `/` means the folder where `project.static_files` puts its files.
During SSR, the theme loads these files from the content server.
In the browser, it loads them from URLs that start with `/_public/`.

For example, this documentation site loads the demo extension with this config in its [`myst.yml`](https://github.com/jupyter-book/myst-theme/blob/main/docs/myst.yml):

```yaml
project:
  static_files:
    - src/theme-extension/dist/fancy-note # served at /fancy-note/
site:
  options:
    extensions:
      - theme-extension@/fancy-note/mf-manifest.json
```

## Running the demo locally

To build the demo extension and preview this page, start from the root of this repository:

```bash
make build-book    # builds the theme that these docs use
cd docs/src/theme-extension
bun install
bun run build      # runs `vite build` and `vite build --ssr`
cd ../..
myst start
```
