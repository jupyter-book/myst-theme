---
title: Theming
---

`myst-theme` exposes its color palette as CSS custom properties (CSS variables), so you can re-skin the entire interface from a single stylesheet without rebuilding the theme.

To explore the tokens interactively, try the [Live color picker](./color-picker.md).

## Applying overrides in your own site

Add the declarations you want to override to a stylesheet loaded by your site:

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

## Known limitations

A few colors are intentionally not themable yet:

- **Opacity modifiers** (e.g. `bg-myst-bg/80`) don't work with CSS variables under Tailwind v3, so a few translucent surfaces remain hardcoded (the top navbar backdrop, some hover overlays).
  Migrating these requires either RGB channel tokens, `color-mix()`, or Tailwind v4.
- **Inverted color schemes** — action buttons and the theme toggle previously rendered with inverted colors on hover.
  There's currently no token for "use the opposite scheme's colors here", so these now follow the standard tokens.
- **Semantic non-brand colors** are deliberately hardcoded: GitHub PR/issue state icons, error/validation states, the launch button's Jupyter orange, and neutral spinner tracks.
