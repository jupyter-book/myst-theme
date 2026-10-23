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
- Admonition kinds that map to a meaning use semantic names (`info`, `tip`, `success`, `warning`, `danger`); math content groups use `theorem`, `example`, and `proof`.
- `inverse-bg` / `inverse-text` render an element in the opposite scheme's colors (e.g. tooltips).

## Using tokens as Tailwind utilities

Every `--myst-color-{name}` token is also available as a Tailwind color named `myst-{name}`.
Tailwind expands that into utility classes for every color-aware property — [`bg-`](https://tailwindcss.com/docs/background-color), [`text-`](https://tailwindcss.com/docs/text-color), [`border-`](https://tailwindcss.com/docs/border-color), [`ring-`](https://tailwindcss.com/docs/ring-color), and more:

| CSS variable | Tailwind color | Example utilities |
|---|---|---|
| `--myst-color-bg` | `myst-bg` | `bg-myst-bg`, `text-myst-bg`, `border-myst-bg` |
| `--myst-color-text` | `myst-text` | `text-myst-text`, `border-myst-text` |
| `--myst-color-border` | `myst-border` | `border-myst-border`, `ring-myst-border` |
| `--myst-color-info-bg` | `myst-info-bg` | `bg-myst-info-bg`, `border-myst-info-bg` |

The full list of available color names mirrors the token names in `theme-colors.css`: strip the `--myst-color-` prefix and prepend `myst-`.

### Adding a new token

When introducing a new semantic color, update both files:

1. Add `--myst-color-{name}` (and its `.dark` override) to `styles/theme-colors.css`.
2. Add `'myst-{name}': 'var(--myst-color-{name})'` to the `colors` object in `styles/index.js`.

## Known limitations

A few aspects of the UI are intentionally not themable yet:

- **Semantic non-brand colors** are deliberately hardcoded: GitHub PR/issue state icons, error/validation states, the launch button's Jupyter orange, and neutral spinner tracks.
- **Translucent overlays** (e.g. the sticky header backdrop) derive from `--myst-color-bg` using CSS relative color syntax and can't be overridden independently.
