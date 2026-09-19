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
`launchBinder` following `useBinder`. Both themes drop their literal, so in-page execution works
under lite and binder alike and the launch control appears only when there is a server to launch.

`getUserServerUrl` also no longer throws on a `userServerUrl` that is not an absolute URL; thebe
reports a bare `/` when no user server exists (#636).
