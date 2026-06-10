---
title: Styling
---

`myst-theme` exposes its color palette as CSS custom properties (CSS variables), so you can re-skin the entire interface from a single stylesheet without rebuilding the theme.
Many elements also carry semantic, human-readable CSS classes (e.g. `myst-top-nav`, `myst-admonition-header`) that you can target directly for more targeted overrides.

To explore the tokens interactively, try the [Live color picker](./color-picker.md).

## Applying overrides in your own site

Add the declarations you want to override to a [stylesheet loaded by your site](https://mystmd.org/guide/website-style#style-sheet):

```css
:root {
  --myst-color-info: #3b82f6;
  --myst-color-info-bg: #eff6ff;
  --myst-color-info-text: #2563eb;
  /* ...override only what you need */
}

.dark {
  --myst-color-info: #60a5fa;
  --myst-color-info-bg: #0f172a;
  --myst-color-info-text: #93c5fd;
}
```

For the full list of available variables and their default values, see [`theme-colors.css`](https://github.com/jupyter-book/myst-theme/blob/main/styles/theme-colors.css).

## Known limitations

A few aspects of the UI are intentionally not themable yet:

- **Inverted color schemes** — action buttons and the theme toggle previously rendered with inverted colors on hover.
  There's currently no token for "use the opposite scheme's colors here", so these now follow the standard tokens.
- **Semantic non-brand colors** are deliberately hardcoded: GitHub PR/issue state icons, error/validation states, the launch button's Jupyter orange, and neutral spinner tracks.
