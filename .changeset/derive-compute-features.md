---
"@myst-theme/jupyter": patch
"@myst-theme/article": patch
"@myst-theme/book": patch
---

Derive compute feature flags from the project manifest.

`ComputeOptionsProvider` already reads `jupyter.lite` and `jupyter.binder` through
`thebeFrontmatterToOptions`, but each theme passed its own fixed `features` object describing the
same setup. article-theme's values (`notebookCompute: false`, `launchBinder: true`) suit a binder
only, so with `jupyter: lite: true` no cell could be run in place, and the launch control threw
`TypeError: Failed to construct 'URL'` during render, taking down the page (#400).

`features` is now optional and defaults to `notebookCompute: true`, `figureCompute: true`, and
`launchBinder` off only under `useJupyterLite`, where the kernel runs in the page and there is
nowhere to launch. Both themes drop their literal, so in-page execution works under lite, binder and
a plain Jupyter server alike.

`NotebookToolbar` now honours `launchBinder` for its own launch action, which previously bypassed
the flag and opened `${server.settings.baseUrl}?token=${server.settings.token}` regardless. Under
lite that produced a control leading nowhere.

`getUserServerUrl` also no longer throws on a `userServerUrl` that is not an absolute URL; thebe
reports a bare `/` when no user server exists (#636).
