---
title: Styling
---

`myst-theme` exposes its color palette as CSS custom properties (CSS variables), so you can re-skin the entire interface from a single stylesheet without rebuilding the theme.
Most elements also carry semantic CSS classes (e.g. `myst-top-nav`, `myst-admonition-header`) that you can target directly.

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

## Naming conventions

Tokens follow the pattern `--myst-color-{concept}-{variant}`, with light values in `:root` and dark values redefined under `.dark`.[^1]

[^1]: A few design systems used for inspiration:
  
  - [shadcn/ui](https://ui.shadcn.com/docs/theming) — semantic tokens redefined under `.dark`, and the `bg` / `surface` / `border` / `ring` roles.
  - [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/customize/css-variables/) — `text-secondary` / `text-tertiary` ramps, `link-hover`, and the `info` / `success` / `warning` / `danger` triples with `-bg` and `-text` variants.
  - [pydata-sphinx-theme](https://pydata-sphinx-theme.readthedocs.io/en/stable/user_guide/styling.html) — a sibling documentation theme with an equivalent `--pst-color-*` token set.

A few rules of thumb:

- `bg` is the page background; `bg-secondary` is the alternate page-level background (sidebars, nav panels); `surface` is for elements that sit on the page (cards, dropdowns, popovers).
- `text` / `text-secondary` / `text-tertiary` are the UI text ramp; `prose-body` is the body text of rendered (`prose`) content, intentionally softer than UI text for long-form reading.
- `accent-text` is for accent-colored headings (glossary terms, the TOC title) — prose headings (`h1`–`h6`) follow `text`.
- `*-text` variants are foreground colors meant to pair with the matching `*-bg` (e.g. `info-text` on `info-bg`).
- Admonition kinds that map to a meaning use semantic names (`info`, `success`, `warning`, `danger`); the remaining MyST admonition kinds are color-keyed (`orange`, `purple`, `gray`).
- `inverse-bg` / `inverse-text` render an element in the opposite scheme's colors (e.g. tooltips).

## Known limitations

A few aspects of the UI are intentionally not themable yet:

- **Semantic non-brand colors** are deliberately hardcoded: GitHub PR/issue state icons, error/validation states, the launch button's Jupyter orange, and neutral spinner tracks.
- **Translucent overlays** (e.g. the sticky header backdrop) derive from `--myst-color-bg` using CSS relative color syntax and can't be overridden independently.
