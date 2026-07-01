---
title: Theme renderer extensions
---

The book theme can load pre-compiled _renderer_ extensions[^mf].
An extension is a small JavaScript bundle that exports React renderers for MyST AST nodes.
The theme loads it in the browser and merges its renderers with the built-in ones, so you can extend or change the way that nodes are rendered.

[^mf]: This uses [Module Federation](https://module-federation.io/), and is quite experimental, so please provide feedback and use at your own risk!

This page demos the example extension in `src/theme-extension/`, which shows the two things an extension can do:

1. render a custom node, with its own CSS
2. override a built-in node to lightly modify it

:::{warning} Experimental
`mystmd` cannot yet declare extensions in `myst.yml`, so this demo patches the built site config directly.
See [](#extensions-demo-locally).
:::

## Use case 1: A custom node with a custom renderer

The following code defines a MyST plugin that gives authors a custom directive `{fancy-note}` that emits a **custom node** (called `fancyNote`). By default, MyST has no idea how to render a `fancyNote` node!

```{literalinclude} src/extensions-demo.mjs
```

The following theme extension teaches MyST how to render this new node.
It registers a React renderer for `fancyNote`, and imports a CSS file that ships with the bundle.
At the bottom, it exports a `renderers` object, which contains `<AST node type>: <react rendering function>` pairs.
These map onto the `type:` field of AST nodes (like the one above).
If you provide a pre-existing node type, then the extension's renderer will be used instead.

```{literalinclude} src/theme-extension/src/index.js
```

::::{note .dropdown} The imported styles file
It's bundled with the extension, but you don't need it to understand the demo, so it's hidden.
```{literalinclude} src/theme-extension/src/styles.css
```
::::

Once an author loads the extension, MyST markdown like this:

```markdown
:::{fancy-note} A custom node
This node type does not exist in the theme. Its renderer and CSS were loaded at runtime.
:::
```

renders as:

:::{fancy-note} A custom node
This node type does not exist in the theme. Its renderer and CSS were loaded at runtime.
:::

## Use case 2: Overriding a built-in node

The same extension above uses the existing `blockquote` type to wrap the theme's default renderer (`DEFAULT_RENDERERS.blockquote.base` in the code above), so every blockquote gets an orange flourish:

> This is a plain markdown blockquote, restyled by the extension.

Any key of `DEFAULT_RENDERERS` (from `myst-to-react`) can be overridden the same way.

(extension-build)=
## How the extension is built

The extension is compiled into a bundle by [rspack](https://rspack.rs/) (a webpack-compatible bundler), configured in `rspack.config.mjs`:

```{literalinclude} src/theme-extension/rspack.config.mjs
```

Two parts of this config are what make it a theme extension rather than an ordinary bundle:

- The `ModuleFederationPlugin` packages the output as a [federated module](https://module-federation.io/): a file the theme can download at runtime and import by name (`myst_docs_extension`).
- The `shared` block declares `react` and `myst-to-react` as shared singletons with `import: false`.
  They are never bundled into the extension; at runtime the extension uses the theme's own copies.
  This keeps the bundle small and guarantees the extension renders with the same React instance as the theme (two React copies would break hooks and context).

Everything else is ordinary bundler setup: JSX is compiled with the built-in SWC loader, and the imported CSS ships alongside the JS in `dist/`.

(extensions-demo-locally)=
## How to run this demo locally

This is an experimental feature, so getting this working is a bit hacky.
The instructions below are based on [myst-contrib/myst-theme-demo-renderer](https://github.com/myst-contrib/myst-theme-demo-renderer).

First build the extension:

```bash
cd docs/src/theme-extension
bun install && bun run build
```

Then serve the docs with the local theme, as described in [](./developer/local.md).
This will start the content server, and the theme should be rendering from that server.

To enable this extension, run this script to "patch" the site's `config.json` file - this is a hack to ensure that this extension gets loaded at rendering time. You'll need to re-run it any time that MyST re-generates the site (and thus, the `config.json` file)[^patch].

```bash
# Run from docs/
node src/theme-extension/patch-config.mjs
```

[^patch]: The theme finds extensions by reading a `remotes` list from the site config (at `_build/site/config.json`). Each entry points to an extension's entry file: here, the bundle you built in the first step, served at `/dist/` because it is listed under `static_files` in `myst.yml`. `mystmd` doesn't yet know how to write the `remotes` list, so `patch-config.mjs` adds it to the built config by hand. Whenever `myst` rebuilds the site it regenerates `config.json` and wipes the patch, which is why you may need to re-run it.

Then open the theme dev server (usually <http://localhost:3001>) and visit this page.
