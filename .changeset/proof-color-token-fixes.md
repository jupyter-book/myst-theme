---
"@myst-theme/styles": patch
"myst-to-react": patch
"@myst-theme/jupyter": patch
"@myst-theme/landing-pages": patch
"@myst-theme/site": patch
"@myst-theme/anywidget": patch
---

Remove `orange`/`purple`/`gray` CSS color tokens.
Use  `theorem`/`example`/`proof` color schemes instead.
Add a dedicated `--myst-color-error` group for UI error states (distinct from the content-level `danger` admonition).
Fix some bugs and Tailwind color class usage remaining from the CSS custom properties refactor.
