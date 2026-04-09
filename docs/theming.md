---
title: Theming
---

myst-theme exposes its color palette as CSS custom properties, so you can re-skin
the entire interface from a single stylesheet. Use the picker below to experiment
live — every component on this page reads from the same tokens, so changes
propagate instantly.

## Live color picker

```{anywidget} ./src/color-picker.mjs
:css: ./src/color-picker.css
```

## Sample components

:::{note}
This is a note admonition. It uses `--myst-color-info`, `--myst-color-info-bg`,
and `--myst-color-info-text`.
:::

:::{tip}
This is a tip — it shares the success color group.
:::

:::{warning}
This is a warning — it uses the warning color group.
:::

:::{danger}
This is a danger admonition — it uses the danger color group.
:::

A paragraph with a [link](https://mystmd.org) and some `inline code`. The link
color comes from `--myst-color-link`, and inline code uses `--myst-color-code-bg`.

```python
def hello():
    print("code blocks use --myst-color-code-bg")
```

## Applying overrides in your own site

Once you've found a palette you like, add the corresponding declarations to a
stylesheet loaded by your site:

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

The picker above writes to `document.documentElement`'s inline style, so its
overrides apply to both light and dark modes at once. In production, define
light and dark values separately under `:root` and `.dark` as shown above.
